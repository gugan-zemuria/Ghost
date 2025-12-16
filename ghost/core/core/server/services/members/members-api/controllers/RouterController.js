const tpl = require('@tryghost/tpl');
const logging = require('@tryghost/logging');
const {BadRequestError} = require('@tryghost/errors');
const errors = require('@tryghost/errors');
const {isEmail} = require('@tryghost/validator');
const normalizeEmail = require('../utils/normalize-email');

const messages = {
    emailRequired: 'Email is required.',
    invalidEmail: 'Email is not valid',
    blockedEmailDomain: 'Signups from this email domain are currently restricted.',
    badRequest: 'Bad Request.',
    inviteOnly: 'This site is invite-only, contact the owner for access.',
    memberNotFound: 'No member exists with this e-mail address.',
    memberNotFoundSignUp: 'No member exists with this e-mail address. Please sign up first.',
    otcNotSupported: 'OTC verification not supported.',
    invalidCode: 'Invalid verification code.',
    failedToVerifyCode: 'Failed to verify code, please try again.'
};

// helper utility for logic shared between sendMagicLink and verifyOTC
function extractRefererOrRedirect(req) {
    const {autoRedirect, redirect} = req.body;

    if (autoRedirect === false) {
        return null;
    }

    if (redirect) {
        try {
            return new URL(redirect).href;
        } catch (e) {
            logging.warn(e);
        }
    }

    return req.get('referer') || null;
}

module.exports = class RouterController {
    /**
     * RouterController
     *
     * @param {object} deps
     * @param {any} deps.memberRepository
     * @param {() => boolean} deps.allowSelfSignup
     * @param {any} deps.magicLinkService
     * @param {import('@tryghost/member-attribution')} deps.memberAttributionService
     * @param {any} deps.tokenService
     * @param {any} deps.sendEmailWithMagicLink
     * @param {{isSet(name: string): boolean}} deps.labsService
     * @param {any} deps.sentry
     * @param {any} deps.settingsCache
     * @param {any} deps.urlUtils
     */
    constructor({
        memberRepository,
        allowSelfSignup,
        magicLinkService,
        tokenService,
        memberAttributionService,
        sendEmailWithMagicLink,
        labsService,
        sentry,
        settingsCache,
        urlUtils
    }) {
        this._memberRepository = memberRepository;
        this._allowSelfSignup = allowSelfSignup;
        this._magicLinkService = magicLinkService;
        this._tokenService = tokenService;
        this._sendEmailWithMagicLink = sendEmailWithMagicLink;
        this._memberAttributionService = memberAttributionService;
        this.labsService = labsService;
        this._sentry = sentry || undefined;
        this._settingsCache = settingsCache;
        this._urlUtils = urlUtils;
    }

    async sendMagicLink(req, res) {
        const {email, honeypot} = req.body;
        let {emailType} = req.body;

        const referrer = extractRefererOrRedirect(req);

        if (!email) {
            throw new errors.BadRequestError({
                message: tpl(messages.emailRequired)
            });
        }

        if (!isEmail(email)) {
            throw new errors.BadRequestError({
                message: tpl(messages.invalidEmail)
            });
        }

        // Normalize email to prevent homograph attacks
        let normalizedEmail;

        try {
            normalizedEmail = normalizeEmail(email);

            if (normalizedEmail !== email) {
                logging.info(`Email normalized from ${email} to ${normalizedEmail} for magic link`);
            }
        } catch (err) {
            logging.error(`Failed to normalize [${email}]: ${err.message}`);

            throw new errors.BadRequestError({
                message: tpl(messages.invalidEmail)
            });
        }

        if (honeypot) {
            logging.warn('Honeypot field filled, this is likely a bot');

            // Honeypot field is filled, this is a bot.
            // Pretend that the email was sent successfully.
            res.writeHead(201);
            return res.end('Created.');
        }

        if (!emailType) {
            // Default to subscribe form that also allows to login (safe fallback for older clients)
            emailType = 'subscribe';
        }

        if (!['signin', 'signup', 'subscribe'].includes(emailType)) {
            res.writeHead(400);
            return res.end('Bad Request.');
        }

        try {
            if (emailType === 'signup' || emailType === 'subscribe') {
                await this._handleSignup(req, normalizedEmail, referrer);
            } else {
                const signIn = await this._handleSignin(req, normalizedEmail, referrer);

                if (signIn.otcRef) {
                    res.writeHead(201, {'Content-Type': 'application/json'});
                    return res.end(JSON.stringify({otc_ref: signIn.otcRef}));
                }
            }

            res.writeHead(201);
            return res.end('Created.');
        } catch (err) {
            if (err.code === 'EENVELOPE') {
                logging.error(err);
                res.writeHead(400);
                return res.end('Bad Request.');
            }
            logging.error(err);

            // Let the normal error middleware handle this error
            throw err;
        }
    }

    async verifyOTC(req, res) {
        const {otc, otcRef} = req.body;

        if (!otc || !otcRef) {
            throw new errors.BadRequestError({
                message: tpl(messages.badRequest),
                context: 'otc and otcRef are required',
                code: 'OTC_VERIFICATION_MISSING_PARAMS'
            });
        }

        const tokenProvider = this._magicLinkService.tokenProvider;
        if (!tokenProvider || typeof tokenProvider.verifyOTC !== 'function') {
            throw new errors.BadRequestError({
                message: tpl(messages.otcNotSupported),
                code: 'OTC_NOT_SUPPORTED'
            });
        }

        const tokenValue = await tokenProvider.getTokenByRef(otcRef);
        if (!tokenValue) {
            throw new errors.BadRequestError({
                message: tpl(messages.invalidCode),
                code: 'INVALID_OTC_REF'
            });
        }

        const isValidOTC = await tokenProvider.verifyOTC(otcRef, otc);
        if (!isValidOTC) {
            throw new errors.BadRequestError({
                message: tpl(messages.invalidCode),
                code: 'INVALID_OTC'
            });
        }

        const otcVerificationHash = await this._createHashFromOTCAndToken(otc, tokenValue);
        if (!otcVerificationHash) {
            throw new errors.BadRequestError({
                message: tpl(messages.failedToVerifyCode),
                code: 'OTC_VERIFICATION_FAILED'
            });
        }

        const referrer = extractRefererOrRedirect(req);

        const redirectUrl = this._magicLinkService.getSigninURL(tokenValue, 'signin', referrer, otcVerificationHash);
        if (!redirectUrl) {
            throw new errors.BadRequestError({
                message: tpl(messages.failedToVerifyCode),
                code: 'OTC_VERIFICATION_FAILED'
            });
        }

        return res.json({redirectUrl});
    }

    async _createHashFromOTCAndToken(otc, token) {
        // timestamp for anti-replay protection (5 minute window)
        const timestamp = Math.floor(Date.now() / 1000);

        const hash = this._magicLinkService.tokenProvider.createOTCVerificationHash(otc, token, timestamp);

        return `${timestamp}:${hash}`;
    }

    async _handleSignup(req, normalizedEmail, referrer = null) {
        if (!this._allowSelfSignup()) {
            throw new errors.BadRequestError({
                message: tpl(messages.inviteOnly)
            });
        }

        const blockedEmailDomains = this._settingsCache.get('all_blocked_email_domains');
        const emailDomain = normalizedEmail.split('@')[1]?.toLowerCase();
        if (emailDomain && blockedEmailDomains.includes(emailDomain)) {
            throw new errors.BadRequestError({
                message: tpl(messages.blockedEmailDomain)
            });
        }

        const {emailType} = req.body;

        const tokenData = {
            labels: req.body.labels,
            name: req.body.name,
            reqIp: req.ip ?? undefined,

            attribution: await this._memberAttributionService.getAttribution(req.body.urlHistory)
        };

        return await this._sendEmailWithMagicLink({email: normalizedEmail, tokenData, requestedType: emailType, referrer});
    }

    async _handleSignin(req, normalizedEmail, referrer = null) {
        const {emailType, includeOTC: reqIncludeOTC} = req.body;

        let includeOTC = false;

        if (reqIncludeOTC === true || reqIncludeOTC === 'true') {
            includeOTC = true;
        }

        const member = await this._memberRepository.get({email: normalizedEmail});

        if (!member) {
            throw new errors.BadRequestError({
                message: this._allowSelfSignup() ? tpl(messages.memberNotFoundSignUp) : tpl(messages.memberNotFound)
            });
        }

        const tokenData = {};
        return await this._sendEmailWithMagicLink({email: normalizedEmail, tokenData, requestedType: emailType, referrer, includeOTC});
    }
};
