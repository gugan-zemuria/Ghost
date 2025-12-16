const nql = require('@tryghost/nql');
const mingo = require('mingo');
const {replaceFilters, expandFilters, splitFilter, getUsedKeys, chainTransformers, mapKeys} = require('@tryghost/mongo-utils');

function replaceCustomFilterTransformer(filter) {
    return function (existingFilter) {
        return replaceFilters(existingFilter, {custom: filter});
    };
}

module.exports = class EventRepository {
    constructor({
        EmailRecipient,
        MemberSubscribeEvent,
        MemberStatusEvent,
        MemberLoginEvent,
        MemberCreatedEvent,
        MemberLinkClickEvent,
        MemberFeedback,
        EmailSpamComplaintEvent,
        Comment,
        labsService,
        memberAttributionService,
        MemberEmailChangeEvent
    }) {
        this._MemberSubscribeEvent = MemberSubscribeEvent;
        this._MemberStatusEvent = MemberStatusEvent;
        this._MemberLoginEvent = MemberLoginEvent;
        this._EmailRecipient = EmailRecipient;
        this._Comment = Comment;
        this._labsService = labsService;
        this._MemberCreatedEvent = MemberCreatedEvent;
        this._MemberLinkClickEvent = MemberLinkClickEvent;
        this._MemberFeedback = MemberFeedback;
        this._EmailSpamComplaintEvent = EmailSpamComplaintEvent;
        this._memberAttributionService = memberAttributionService;
        this._MemberEmailChangeEvent = MemberEmailChangeEvent;
    }

    async getEventTimeline(options = {}) {
        if (!options.limit) {
            options.limit = 10;
        }

        const [typeFilter, otherFilter] = this.getNQLSubset(options.filter);
        options.order = 'created_at desc, id desc';

        const pageActions = [
            {type: 'comment_event', action: 'getCommentEvents'},
            {type: 'click_event', action: 'getClickEvents'},
            {type: 'signup_event', action: 'getSignupEvents'}
        ];

        if (!getUsedKeys(otherFilter).includes('data.post_id')) {
            pageActions.push(
                {type: 'newsletter_event', action: 'getNewsletterSubscriptionEvents'},
                {type: 'login_event', action: 'getLoginEvents'},
                {type: 'email_change_event', action: 'getEmailChangeEvent'}
            );
        }

        if (this._EmailRecipient) {
            pageActions.push({type: 'email_sent_event', action: 'getEmailSentEvents'});
            pageActions.push({type: 'email_delivered_event', action: 'getEmailDeliveredEvents'});
            pageActions.push({type: 'email_opened_event', action: 'getEmailOpenedEvents'});
            pageActions.push({type: 'email_failed_event', action: 'getEmailFailedEvents'});
        }

        pageActions.push({type: 'email_complained_event', action: 'getEmailSpamComplaintEvents'});

        if (this._labsService.isSet('audienceFeedback')) {
            pageActions.push({type: 'feedback_event', action: 'getFeedbackEvents'});
        }

        let filteredPages = pageActions;
        if (typeFilter) {
            const query = new mingo.Query(typeFilter);
            filteredPages = filteredPages.filter(page => query.test(page));
        }

        const pages = filteredPages.map((page) => this[page.action](options, otherFilter));
        const allEventPages = await Promise.all(pages);
        const allEvents = allEventPages.flatMap(page => page.data);
        const totalEvents = allEventPages.reduce((acc, page) => acc + page.meta.pagination.total, 0);

        return {
            events: allEvents.sort((a, b) => {
                const diff = new Date(b.data.created_at).getTime() - new Date(a.data.created_at).getTime();
                if (diff !== 0) return diff;
                return b.data.id.localeCompare(a.data.id);
            }).slice(0, options.limit),
            meta: {
                pagination: {
                    limit: options.limit,
                    total: totalEvents,
                    pages: options.limit > 0 ? Math.ceil(totalEvents / options.limit) : null,
                    page: null,
                    next: null,
                    prev: null
                }
            }
        };
    }

    getNQLSubset(filter) {
        if (!filter) return [null, null];
        try {
            const parsed = nql(filter).parse();
            return splitFilter(parsed, ['type']);
        } catch (e) {
            return [null, null];
        }
    }

    async getNewsletterSubscriptionEvents(options = {}, filter) {
        options = {
            ...options,
            withRelated: ['member', 'newsletter'],
            filter: 'custom:true',
            useBasicCount: true,
            mongoTransformer: chainTransformers(
                replaceCustomFilterTransformer(filter),
                ...mapKeys({'data.created_at': 'created_at', 'data.source': 'source', 'data.member_id': 'member_id'})
            )
        };

        const {data: models, meta} = await this._MemberSubscribeEvent.findPage(options);
        const data = models.map((model) => ({type: 'newsletter_event', data: model.toJSON(options)}));
        return {data, meta};
    }

    async getLoginEvents(options = {}, filter) {
        options = {
            ...options,
            withRelated: ['member'],
            filter: 'custom:true',
            useBasicCount: true,
            mongoTransformer: chainTransformers(
                replaceCustomFilterTransformer(filter),
                ...mapKeys({'data.created_at': 'created_at', 'data.member_id': 'member_id'})
            )
        };

        const {data: models, meta} = await this._MemberLoginEvent.findPage(options);
        const data = models.map((model) => ({type: 'login_event', data: model.toJSON(options)}));
        return {data, meta};
    }

    async getSignupEvents(options = {}, filter) {
        options = {
            ...options,
            withRelated: ['member', 'postAttribution', 'userAttribution', 'tagAttribution'],
            filter: 'custom:true',
            useBasicCount: true,
            mongoTransformer: chainTransformers(
                replaceCustomFilterTransformer(filter),
                ...mapKeys({'data.created_at': 'created_at', 'data.member_id': 'member_id', 'data.source': 'source'}),
                (f) => expandFilters(f, [{key: 'data.post_id', replacement: 'attribution_id', expansion: {attribution_type: 'post'}}])
            )
        };

        const {data: models, meta} = await this._MemberCreatedEvent.findPage(options);
        const data = models.map((model) => {
            const json = model.toJSON(options);
            delete json.postAttribution?.mobiledoc;
            delete json.postAttribution?.lexical;
            delete json.postAttribution?.plaintext;
            return {
                type: 'signup_event',
                data: {...json, attribution: this._memberAttributionService.getEventAttribution(model)}
            };
        });
        return {data, meta};
    }

    async getCommentEvents(options = {}, filter) {
        options = {
            ...options,
            withRelated: ['member', 'post', 'parent'],
            filter: 'member_id:-null+custom:true',
            useBasicCount: true,
            mongoTransformer: chainTransformers(
                replaceCustomFilterTransformer(filter),
                ...mapKeys({'data.created_at': 'created_at', 'data.member_id': 'member_id', 'data.post_id': 'post_id'})
            )
        };

        const {data: models, meta} = await this._Comment.findPage(options);
        const data = models.map((model) => ({type: 'comment_event', data: model.toJSON(options)}));
        return {data, meta};
    }

    async getClickEvents(options = {}, filter) {
        options = {
            ...options,
            withRelated: ['member', 'link', 'link.post'],
            filter: 'custom:true',
            useBasicCount: true,
            mongoTransformer: chainTransformers(
                replaceCustomFilterTransformer(filter),
                ...mapKeys({'data.created_at': 'created_at', 'data.member_id': 'member_id', 'data.post_id': 'post_id'})
            )
        };

        const {data: models, meta} = await this._MemberLinkClickEvent.findPage(options);
        const data = models.map((model) => ({type: 'click_event', data: model.toJSON(options)}));
        return {data, meta};
    }

    async getFeedbackEvents(options = {}, filter) {
        options = {
            ...options,
            withRelated: ['member', 'post'],
            filter: 'custom:true',
            useBasicCount: true,
            mongoTransformer: chainTransformers(
                replaceCustomFilterTransformer(filter),
                ...mapKeys({'data.created_at': 'created_at', 'data.member_id': 'member_id', 'data.post_id': 'post_id'})
            )
        };

        const {data: models, meta} = await this._MemberFeedback.findPage(options);
        const data = models.map((model) => ({type: 'feedback_event', data: model.toJSON(options)}));
        return {data, meta};
    }

    async getEmailSentEvents(options = {}, filter) {
        options = {
            ...options,
            withRelated: ['member', 'email'],
            filter: 'failed_at:null+processed_at:-null+delivered_at:null+custom:true',
            useBasicCount: true,
            mongoTransformer: chainTransformers(
                replaceCustomFilterTransformer(filter),
                ...mapKeys({'data.created_at': 'processed_at', 'data.member_id': 'member_id', 'data.post_id': 'email.post_id'})
            )
        };
        options.order = options.order.replace(/created_at/g, 'processed_at');

        const {data: models, meta} = await this._EmailRecipient.findPage(options);
        const data = models.map((model) => ({
            type: 'email_sent_event',
            data: {id: model.id, member_id: model.get('member_id'), created_at: model.get('processed_at'), member: model.related('member').toJSON(), email: model.related('email').toJSON()}
        }));
        return {data, meta};
    }

    async getEmailDeliveredEvents(options = {}, filter) {
        options = {
            ...options,
            withRelated: ['member', 'email'],
            filter: 'delivered_at:-null+custom:true',
            useBasicCount: true,
            mongoTransformer: chainTransformers(
                replaceCustomFilterTransformer(filter),
                ...mapKeys({'data.created_at': 'delivered_at', 'data.member_id': 'member_id', 'data.post_id': 'email.post_id'})
            )
        };
        options.order = options.order.replace(/created_at/g, 'delivered_at');

        const {data: models, meta} = await this._EmailRecipient.findPage(options);
        const data = models.map((model) => ({
            type: 'email_delivered_event',
            data: {id: model.id, member_id: model.get('member_id'), created_at: model.get('delivered_at'), member: model.related('member').toJSON(), email: model.related('email').toJSON()}
        }));
        return {data, meta};
    }

    async getEmailOpenedEvents(options = {}, filter) {
        options = {
            ...options,
            withRelated: ['member', 'email'],
            filter: 'opened_at:-null+custom:true',
            useBasicCount: true,
            mongoTransformer: chainTransformers(
                replaceCustomFilterTransformer(filter),
                ...mapKeys({'data.created_at': 'opened_at', 'data.member_id': 'member_id', 'data.post_id': 'email.post_id'})
            )
        };
        options.order = options.order.replace(/created_at/g, 'opened_at');

        const {data: models, meta} = await this._EmailRecipient.findPage(options);
        const data = models.map((model) => ({
            type: 'email_opened_event',
            data: {id: model.id, member_id: model.get('member_id'), created_at: model.get('opened_at'), member: model.related('member').toJSON(), email: model.related('email').toJSON()}
        }));
        return {data, meta};
    }

    async getEmailSpamComplaintEvents(options = {}, filter) {
        options = {
            ...options,
            withRelated: ['member', 'email'],
            filter: 'custom:true',
            useBasicCount: true,
            mongoTransformer: chainTransformers(
                replaceCustomFilterTransformer(filter),
                ...mapKeys({'data.created_at': 'created_at', 'data.member_id': 'member_id', 'data.post_id': 'email.post_id'})
            )
        };

        const {data: models, meta} = await this._EmailSpamComplaintEvent.findPage(options);
        const data = models.map((model) => ({type: 'email_complaint_event', data: model.toJSON(options)}));
        return {data, meta};
    }

    async getEmailFailedEvents(options = {}, filter) {
        options = {
            ...options,
            withRelated: ['member', 'email'],
            filter: 'failed_at:-null+custom:true',
            useBasicCount: true,
            mongoTransformer: chainTransformers(
                replaceCustomFilterTransformer(filter),
                ...mapKeys({'data.created_at': 'failed_at', 'data.member_id': 'member_id', 'data.post_id': 'email.post_id'})
            )
        };
        options.order = options.order.replace(/created_at/g, 'failed_at');

        const {data: models, meta} = await this._EmailRecipient.findPage(options);
        const data = models.map((model) => ({
            type: 'email_failed_event',
            data: {id: model.id, member_id: model.get('member_id'), created_at: model.get('failed_at'), member: model.related('member').toJSON(), email: model.related('email').toJSON()}
        }));
        return {data, meta};
    }

    async getEmailChangeEvent(options = {}, filter) {
        options = {
            ...options,
            withRelated: ['member'],
            filter: 'custom:true',
            useBasicCount: true,
            mongoTransformer: chainTransformers(
                replaceCustomFilterTransformer(filter),
                ...mapKeys({'data.created_at': 'created_at', 'data.member_id': 'member_id'})
            )
        };

        const {data: models, meta} = await this._MemberEmailChangeEvent.findPage(options);
        const data = models.map((model) => ({type: 'email_change_event', data: model.toJSON(options)}));
        return {data, meta};
    }
};
