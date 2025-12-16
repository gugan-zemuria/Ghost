const _ = require('lodash');
const errors = require('@tryghost/errors');
const logging = require('@tryghost/logging');
const tpl = require('@tryghost/tpl');
const DomainEvents = require('@tryghost/domain-events');
const {MemberCreatedEvent, MemberSubscribeEvent} = require('../../../../../shared/events');
const ObjectId = require('bson-objectid').default;
const {NotFoundError} = require('@tryghost/errors');
const validator = require('@tryghost/validator');
const crypto = require('crypto');
const config = require('../../../../../shared/config');

const messages = {
    moreThanOneProduct: 'A member cannot have more than one Product',
    memberNotFound: 'Could not find Member {id}',
    productNotFound: 'Could not find Product {id}',
    tierArchived: 'Cannot use archived Tiers',
    invalidEmail: 'Invalid Email'
};

const WELCOME_EMAIL_SOURCES = ['member'];

module.exports = class MemberRepository {
    constructor({
        Member,
        MemberSubscribeEventModel,
        MemberEmailChangeEvent,
        MemberStatusEvent,
        MemberProductEvent,
        Outbox,
        labsService,
        productRepository,
        tokenService
    }) {
        this._Member = Member;
        this._MemberSubscribeEvent = MemberSubscribeEventModel;
        this._MemberEmailChangeEvent = MemberEmailChangeEvent;
        this._MemberStatusEvent = MemberStatusEvent;
        this._MemberProductEvent = MemberProductEvent;
        this._Outbox = Outbox;
        this._productRepository = productRepository;
        this.tokenService = tokenService;
        this._labsService = labsService;
    }

    dispatchEvent(event, options) {
        if (options?.transacting) {
            options.transacting.executionPromise.then(async () => {
                DomainEvents.dispatch(event);
            }).catch((err) => {
                logging.error({
                    err,
                    message: `Error dispatching event ${event.constructor.name}`
                });
            });
        } else {
            DomainEvents.dispatch(event);
        }
    }

    _resolveContextSource(context) {
        if (context.import || context.importer) {
            return 'import';
        } else if (context.internal) {
            return 'system';
        } else if (context.api_key) {
            return 'api';
        } else if (context.user) {
            return 'admin';
        }
        return 'member';
    }

    async get(data, options) {
        return await this._Member.findOne(data, options);
    }

    async getByToken(token, options) {
        const data = await this.tokenService.decodeToken(token);
        return this.get({email: data.sub}, options);
    }

    _generateTransientId() {
        return crypto.randomUUID();
    }

    async cycleTransientId({id, email}) {
        await this.update({transient_id: this._generateTransientId()}, {id});
    }

    async create(data, options) {
        if (!options) {
            options = {};
        }
        if (!options.batch_id) {
            options.batch_id = ObjectId().toHexString();
        }

        const {labels} = data;
        if (labels) {
            labels.forEach((label, index) => {
                if (typeof label === 'string') {
                    labels[index] = {name: label};
                }
            });
        }

        const memberData = _.pick(data, ['email', 'name', 'note', 'subscribed', 'geolocation', 'created_at', 'products', 'email_disabled', 'transient_id']);
        if (!memberData.transient_id) {
            memberData.transient_id = this._generateTransientId();
        }

        if (!validator.isEmail(memberData.email, {legacy: false})) {
            throw new errors.ValidationError({message: tpl(messages.invalidEmail), property: 'email'});
        }

        memberData.email_disabled = !!memberData.email_disabled;

        if (memberData.products && memberData.products.length > 1) {
            throw new errors.BadRequestError({message: tpl(messages.moreThanOneProduct)});
        }

        const memberStatusData = {status: 'free'};
        if (memberData.products && memberData.products.length === 1) {
            memberStatusData.status = 'comped';
        }

        const withRelated = options.withRelated ? [...options.withRelated] : [];
        if (!withRelated.includes('labels')) withRelated.push('labels');

        const context = options?.context || {};
        const source = this._resolveContextSource(context);
        const eventData = _.pick(data, ['created_at']);
        const memberAddOptions = {...options, withRelated};

        let member;
        if (config.get('memberWelcomeEmailTestInbox') && WELCOME_EMAIL_SOURCES.includes(source)) {
            const runMemberCreation = async (transacting) => {
                const newMember = await this._Member.add({...memberData, ...memberStatusData, labels}, {...memberAddOptions, transacting});
                const timestamp = eventData.created_at || newMember.get('created_at');
                await this._Outbox.add({
                    id: ObjectId().toHexString(),
                    event_type: MemberCreatedEvent.name,
                    payload: JSON.stringify({memberId: newMember.id, email: newMember.get('email'), name: newMember.get('name'), source, timestamp})
                }, {transacting});
                return newMember;
            };
            member = memberAddOptions.transacting ? await runMemberCreation(memberAddOptions.transacting) : await this._Member.transaction(runMemberCreation);
        } else {
            member = await this._Member.add({...memberData, ...memberStatusData, labels}, memberAddOptions);
        }

        if (!eventData.created_at) {
            eventData.created_at = member.get('created_at');
        }

        for (const product of member.related('products').models) {
            await this._MemberProductEvent.add({member_id: member.id, product_id: product.id, action: 'added'}, options);
        }

        await this._MemberStatusEvent.add({member_id: member.id, from_status: null, to_status: member.get('status'), ...eventData}, options);

        this.dispatchEvent(MemberCreatedEvent.create({memberId: member.id, batchId: options.batch_id, attribution: data.attribution, source}, eventData.created_at), options);

        return member;
    }

    async getSubscribeOnSignupNewsletters() {
        return [];
    }

    async update(data, options) {
        const sharedOptions = {transacting: options.transacting};
        if (!options) options = {};

        const withRelated = options.withRelated ? [...options.withRelated] : [];
        if (!withRelated.includes('labels')) withRelated.push('labels');

        const memberData = _.pick(data, ['email', 'name', 'note', 'subscribed', 'labels', 'geolocation', 'products', 'enable_comment_notifications', 'last_seen_at', 'last_commented_at', 'expertise', 'email_disabled', 'transient_id']);
        if (memberData.expertise) memberData.expertise = memberData.expertise.trim();

        const needsProducts = data.products;

        const requiredRelations = [];
        if (needsProducts) requiredRelations.push('products');

        let initialMember = await this._Member.findOne({id: options.id}, {...sharedOptions, withRelated: requiredRelations, require: false});
        if (!initialMember) {
            throw new NotFoundError({message: tpl(messages.memberNotFound, {id: options.id})});
        }

        if (initialMember?.get('email') && memberData.email && initialMember.get('email') !== memberData.email && !validator.isEmail(memberData.email, {legacy: false})) {
            throw new errors.ValidationError({message: tpl(messages.invalidEmail), property: 'email'});
        }

        const memberStatusData = {};
        let productsToAdd = [];
        let productsToRemove = [];

        if (needsProducts) {
            const existingProducts = initialMember.related('products').models;
            const existingProductIds = existingProducts.map(p => p.id);
            const incomingProductIds = data.products.map(p => p.id);

            if (incomingProductIds.length > 1 && incomingProductIds.length > existingProductIds.length) {
                throw new errors.BadRequestError({message: tpl(messages.moreThanOneProduct)});
            }

            productsToAdd = _.differenceWith(incomingProductIds, existingProductIds);
            productsToRemove = _.differenceWith(existingProductIds, incomingProductIds);

            if (productsToRemove.length > 0 && incomingProductIds.length === 0) memberStatusData.status = 'free';
            if (productsToAdd.length > 0) memberStatusData.status = 'comped';
        }

        for (const productId of productsToAdd) {
            const product = await this._productRepository.get({id: productId}, sharedOptions);
            if (!product) throw new errors.BadRequestError({message: tpl(messages.productNotFound, {id: productId})});
            if (product.get('active') !== true) throw new errors.BadRequestError({message: tpl(messages.tierArchived)});
        }



        const member = await this._Member.edit({...memberData, ...memberStatusData}, {...options, withRelated});

        for (const productToAdd of productsToAdd) {
            await this._MemberProductEvent.add({member_id: member.id, product_id: productToAdd, action: 'added'}, options);
        }
        for (const productToRemove of productsToRemove) {
            await this._MemberProductEvent.add({member_id: member.id, product_id: productToRemove, action: 'removed'}, options);
        }

        const context = options?.context || {};
        const source = this._resolveContextSource(context);



        if (member.attributes.email !== member._previousAttributes.email) {
            await this._MemberEmailChangeEvent.add({member_id: member.id, from_email: member._previousAttributes.email, to_email: member.get('email')}, sharedOptions);
        }

        if (member.attributes.status !== member._previousAttributes.status) {
            await this._MemberStatusEvent.add({member_id: member.id, from_status: member._previousAttributes.status, to_status: member.get('status')}, sharedOptions);
        }

        return member;
    }

    async list(options) {
        return this._Member.findPage(options);
    }

    async destroy(data, options) {
        const member = await this._Member.findOne(data, options);
        if (!member) return;
        return this._Member.destroy({id: data.id}, options);
    }
};
