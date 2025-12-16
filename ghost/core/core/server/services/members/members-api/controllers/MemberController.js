const errors = require('@tryghost/errors');
const tpl = require('@tryghost/tpl');

const messages = {
    blockedEmailDomain: 'Memberships from this email domain are currently restricted.'
};

module.exports = class MemberController {
    /**
     * @param {object} deps
     * @param {any} deps.memberRepository
     * @param {any} deps.productRepository
     * @param {any} deps.tokenService
     * @param {any} deps.sendEmailWithMagicLink
     * @param {any} deps.settingsCache
     */
    constructor({
        memberRepository,
        productRepository,
        tokenService,
        sendEmailWithMagicLink,
        settingsCache
    }) {
        this._memberRepository = memberRepository;
        this._productRepository = productRepository;
        this._tokenService = tokenService;
        this._sendEmailWithMagicLink = sendEmailWithMagicLink;
        this._settingsCache = settingsCache;
    }

    async updateEmailAddress(req, res) {
        const identity = req.body.identity;
        const email = req.body.email;
        const options = {
            forceEmailType: true
        };

        if (!identity) {
            res.writeHead(403);
            return res.end('No Permission.');
        }

        const blockedEmailDomains = this._settingsCache.get('all_blocked_email_domains');
        const emailDomain = req.body.email.split('@')[1]?.toLowerCase();
        if (emailDomain && blockedEmailDomains.includes(emailDomain)) {
            throw new errors.BadRequestError({
                message: tpl(messages.blockedEmailDomain)
            });
        }

        let tokenData = {};
        try {
            const member = await this._memberRepository.getByToken(identity);
            tokenData.oldEmail = member.get('email');
        } catch (err) {
            res.writeHead(401);
            return res.end('Unauthorized.');
        }

        try {
            await this._sendEmailWithMagicLink({email, tokenData, requestedType: 'updateEmail', options});
            res.writeHead(201);
            return res.end('Created.');
        } catch (err) {
            res.writeHead(500);
            return res.end('Internal Server Error.');
        }
    }
};
