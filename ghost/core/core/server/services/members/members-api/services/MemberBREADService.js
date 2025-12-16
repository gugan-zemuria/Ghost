const errors = require('@tryghost/errors');
const tpl = require('@tryghost/tpl');

const messages = {
    memberAlreadyExists: 'Member already exists.'
};

module.exports = class MemberBREADService {
    constructor({memberRepository, labsService, emailService, memberAttributionService, emailSuppressionList, settingsHelpers}) {
        this.memberRepository = memberRepository;
        this.labsService = labsService;
        this.emailService = emailService;
        this.memberAttributionService = memberAttributionService;
        this.emailSuppressionList = emailSuppressionList;
        this.settingsHelpers = settingsHelpers;
    }

    async attachAttributionsToMember(member) {
        member.attribution = await this.memberAttributionService.getMemberCreatedAttribution(member.id);
    }

    async read(data, options = {}) {
        const defaultWithRelated = ['labels', 'products'];
        const withRelated = new Set((options.withRelated || []).concat(defaultWithRelated));

        if (!withRelated.has('productEvents')) {
            withRelated.add('productEvents');
        }

        if (withRelated.has('email_recipients')) {
            withRelated.add('email_recipients.email');
        }

        const model = await this.memberRepository.get(data, {
            ...options,
            withRelated: Array.from(withRelated)
        });

        if (!model) {
            return null;
        }

        const member = model.toJSON(options);
        member.subscriptions = [];
        await this.attachAttributionsToMember(member);

        const suppressionData = await this.emailSuppressionList.getSuppressionData(member.email);
        member.email_suppression = {
            suppressed: suppressionData.suppressed || !!model.get('email_disabled'),
            info: suppressionData.info
        };

        const unsubscribeUrl = this.settingsHelpers.createUnsubscribeUrl(member.uuid);
        member.unsubscribe_url = unsubscribeUrl;

        return member;
    }

    async add(data, options) {
        let model;

        try {
            const attribution = await this.memberAttributionService.getAttributionFromContext(options?.context);
            if (attribution) {
                data.attribution = attribution;
            }
            model = await this.memberRepository.create(data, options);
        } catch (error) {
            if (error.code && error.message.toLowerCase().indexOf('unique') !== -1) {
                throw new errors.ValidationError({
                    message: tpl(messages.memberAlreadyExists),
                    context: 'Attempting to add member with existing email address',
                    property: 'email'
                });
            }
            throw error;
        }

        if (options.send_email) {
            await this.emailService.sendEmailWithMagicLink({
                email: model.get('email'), requestedType: options.email_type
            });
        }

        return this.read({id: model.id}, options);
    }

    async edit(data, options) {
        delete data.last_seen_at;

        let model;

        try {
            if (data.email) {
                const isSuppressed = (await this.emailSuppressionList.getSuppressionData(data.email))?.suppressed;
                data.email_disabled = !!isSuppressed;
            }

            model = await this.memberRepository.update(data, options);
        } catch (error) {
            if (error.code && error.message.toLowerCase().indexOf('unique') !== -1) {
                throw new errors.ValidationError({
                    message: tpl(messages.memberAlreadyExists),
                    context: 'Attempting to edit member with existing email address',
                    property: 'email'
                });
            }

            throw error;
        }

        return this.read({id: model.id}, options);
    }

    async logout(options) {
        await this.memberRepository.cycleTransientId(options);
    }

    async browse(options) {
        const defaultWithRelated = ['labels', 'products'];

        if (options.limit === 'all' || options.limit > 100) {
            options.limit = 100;
        }

        const originalWithRelated = options.withRelated || [];
        const withRelated = new Set((originalWithRelated).concat(defaultWithRelated));

        if (!withRelated.has('productEvents')) {
            withRelated.add('productEvents');
        }

        if (withRelated.has('email_recipients')) {
            withRelated.add('email_recipients.email');
        }

        options.useBasicCount = true;

        const page = await this.memberRepository.list({
            ...options,
            withRelated: Array.from(withRelated)
        });

        if (!page) {
            return null;
        }

        const bulkSuppressionData = await this.emailSuppressionList.getBulkSuppressionData(page.data.map(member => member.get('email')));

        const data = page.data.map((model, index) => {
            const member = model.toJSON(options);
            member.subscriptions = [];
            if (!originalWithRelated.includes('products')) {
                delete member.products;
            }
            member.email_suppression = {
                suppressed: bulkSuppressionData[index].suppressed || !!model.get('email_disabled'),
                info: bulkSuppressionData[index].info
            };
            member.unsubscribe_url = this.settingsHelpers.createUnsubscribeUrl(member.uuid);
            return member;
        });

        return {
            data,
            meta: page.meta
        };
    }
};
