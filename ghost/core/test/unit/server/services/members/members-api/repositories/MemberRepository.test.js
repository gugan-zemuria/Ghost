require('should');
const assert = require('assert/strict');
const sinon = require('sinon');
const DomainEvents = require('@tryghost/domain-events');
const MemberRepository = require('../../../../../../../core/server/services/members/members-api/repositories/MemberRepository');
const {SubscriptionCreatedEvent, OfferRedemptionEvent} = require('../../../../../../../core/shared/events');
const config = require('../../../../../../../core/shared/config');

const mockOfferRedemption = {
    add: sinon.stub(),
    findOne: sinon.stub()
};

describe('MemberRepository', function () {
    afterEach(function () {
        sinon.restore();
    });

    // isComplimentarySubscription test removed - payment functionality deprecated

    describe('#resolveContextSource', function (){
        it('Maps context to source', function (){
            const repo = new MemberRepository({OfferRedemption: mockOfferRedemption});

            let source = repo._resolveContextSource({
                import: true
            });
            assert.equal(source, 'import');

            source = repo._resolveContextSource({
                importer: true
            });
            assert.equal(source, 'import');

            source = repo._resolveContextSource({
                user: true
            });
            assert.equal(source, 'admin');

            source = repo._resolveContextSource({
                user: true,
                api_key: true
            });
            assert.equal(source, 'api');

            source = repo._resolveContextSource({
                api_key: true
            });
            assert.equal(source, 'api');

            source = repo._resolveContextSource({
            });
            assert.equal(source, 'member');

            source = repo._resolveContextSource({
                generic_context: true
            });
            assert.equal(source, 'member');
        });
    });

    // setComplimentarySubscription tests removed - payment functionality deprecated

    describe('newsletter subscriptions', function () {
        let Member;
        let MemberProductEvent;
        let productRepository;
        let stripeAPIService;
        let existingNewsletters;
        let MemberSubscribeEvent;

        beforeEach(async function () {
            sinon.spy();
            existingNewsletters = [
                {
                    id: 'newsletter_id_123',
                    attributes: {
                        status: 'active'
                    },
                    get: sinon.stub().withArgs('status').returns('active')
                },
                {
                    id: 'newsletter_id_1234_archive',
                    attributes: {
                        status: 'archived'
                    },
                    get: sinon.stub().withArgs('status').returns('archived')
                }
            ];

            Member = {
                findOne: sinon.stub().resolves({
                    get: sinon.stub().returns('member_id_123'),
                    related: sinon.stub().withArgs('newsletters').returns({
                        models: existingNewsletters
                    }),
                    toJSON: sinon.stub().returns({})
                }),
                edit: sinon.stub().resolves({
                    attributes: {},
                    _previousAttributes: {}
                })
            };

            stripeAPIService = {
                configured: false
            };

            MemberSubscribeEvent = {
                add: sinon.stub().resolves()
            };
        });

        it('Does not create false archived newsletter events', async function () {
            const repo = new MemberRepository({
                Member,
                MemberProductEvent,
                productRepository,
                stripeAPIService,
                MemberSubscribeEventModel: MemberSubscribeEvent,
                OfferRedemption: mockOfferRedemption
            });

            await repo.update({
                email: 'test@email.com',
                newsletters: [{
                    id: 'newsletter_id_123'
                },
                {
                    id: 'newsletter_id_456'
                },
                {
                    id: 'newsletter_id_new'
                },
                {
                    id: 'newsletter_id_1234_archive'
                }]
            },{
                transacting: {
                    executionPromise: Promise.resolve()
                },
                context: {}
            });

            MemberSubscribeEvent.add.calledTwice.should.be.true();
        });
    });

    // linkSubscription tests removed - payment functionality deprecated

    describe('create - outbox integration', function () {
        let Member;
        let Outbox;
        let MemberStatusEvent;
        let MemberSubscribeEvent;
        let newslettersService;
        const oldNodeEnv = process.env.NODE_ENV;

        beforeEach(function () {
            Member = {
                transaction: sinon.stub().callsFake((callback) => {
                    return callback({executionPromise: Promise.resolve()});
                }),
                add: sinon.stub().resolves({
                    id: 'member_id_123',
                    get: sinon.stub().callsFake((key) => {
                        const data = {
                            email: 'test@example.com',
                            name: 'Test Member',
                            status: 'free',
                            created_at: new Date()
                        };
                        return data[key];
                    }),
                    related: sinon.stub().callsFake((relation) => {
                        if (relation === 'products') {
                            return {models: []};
                        }
                        if (relation === 'newsletters') {
                            return {models: []};
                        }
                        return {models: []};
                    }),
                    toJSON: sinon.stub().returns({
                        id: 'member_id_123',
                        email: 'test@example.com',
                        name: 'Test Member',
                        status: 'free'
                    })
                })
            };

            Outbox = {
                add: sinon.stub().resolves()
            };

            MemberStatusEvent = {
                add: sinon.stub().resolves()
            };

            MemberSubscribeEvent = {
                add: sinon.stub().resolves()
            };

            newslettersService = {
                getDefaultNewsletters: sinon.stub().resolves([]),
                getAll: sinon.stub().resolves([])
            };
        });

        afterEach(function () {
            process.env.NODE_ENV = oldNodeEnv;
        });

        it('creates outbox entry for allowed source', async function () {
            sinon.stub(config, 'get').withArgs('memberWelcomeEmailTestInbox').returns('test-inbox@example.com');

            const repo = new MemberRepository({
                Member,
                Outbox,
                MemberStatusEvent,
                MemberSubscribeEventModel: MemberSubscribeEvent,
                newslettersService,
                OfferRedemption: mockOfferRedemption
            });

            await repo.create({email: 'test@example.com', name: 'Test Member'}, {});

            sinon.assert.calledOnce(Outbox.add);
            const outboxCall = Outbox.add.firstCall.args[0];
            assert.equal(outboxCall.event_type, 'MemberCreatedEvent');
            
            const payload = JSON.parse(outboxCall.payload);
            assert.equal(payload.memberId, 'member_id_123');
            assert.equal(payload.email, 'test@example.com');
            assert.equal(payload.name, 'Test Member');
            assert.equal(payload.source, 'member');
        });

        it('does NOT create outbox entry when config is not set', async function () {
            sinon.stub(config, 'get').withArgs('memberWelcomeEmailTestInbox').returns(undefined);

            const repo = new MemberRepository({
                Member,
                Outbox,
                MemberStatusEvent,
                MemberSubscribeEventModel: MemberSubscribeEvent,
                newslettersService,
                OfferRedemption: mockOfferRedemption
            });

            await repo.create({email: 'test@example.com', name: 'Test Member'}, {});

            sinon.assert.notCalled(Outbox.add);
        });

        it('does not create outbox entry for disallowed sources', async function () {
            sinon.stub(config, 'get').withArgs('memberWelcomeEmailTestInbox').returns('test-inbox@example.com');

            const repo = new MemberRepository({
                Member,
                Outbox,
                MemberStatusEvent,
                MemberSubscribeEventModel: MemberSubscribeEvent,
                newslettersService,
                OfferRedemption: mockOfferRedemption
            });

            const disallowedSources = [
                {name: 'import', context: {import: true}},
                {name: 'admin', context: {user: true}},
                {name: 'api', context: {api_key: true}}
            ];

            for (const source of disallowedSources) {
                Outbox.add.resetHistory();
                await repo.create({email: 'test@example.com', name: 'Test Member'}, {context: source.context});
                sinon.assert.notCalled(Outbox.add);
            }
        });

        it('includes timestamp in outbox payload', async function () {
            sinon.stub(config, 'get').withArgs('memberWelcomeEmailTestInbox').returns('test-inbox@example.com');

            const repo = new MemberRepository({
                Member,
                Outbox,
                MemberStatusEvent,
                MemberSubscribeEventModel: MemberSubscribeEvent,
                newslettersService,
                OfferRedemption: mockOfferRedemption
            });

            await repo.create({email: 'test@example.com', name: 'Test Member'}, {});

            const payload = JSON.parse(Outbox.add.firstCall.args[0].payload);
            assert.ok(payload.timestamp);
            assert.ok(new Date(payload.timestamp).getTime() > 0);
        });

        it('passes transaction to outbox entry creation', async function () {
            sinon.stub(config, 'get').withArgs('memberWelcomeEmailTestInbox').returns('test-inbox@example.com');

            const repo = new MemberRepository({
                Member,
                Outbox,
                MemberStatusEvent,
                MemberSubscribeEventModel: MemberSubscribeEvent,
                newslettersService,
                OfferRedemption: mockOfferRedemption
            });

            await repo.create({email: 'test@example.com', name: 'Test Member'}, {});

            const outboxOptions = Outbox.add.firstCall.args[1];
            assert.ok(outboxOptions.transacting);
        });
    });
});
