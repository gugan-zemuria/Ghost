const assert = require('assert/strict');
const sinon = require('sinon');
const MemberBreadService = require('../../../../../../../core/server/services/members/members-api/services/MemberBREADService');
const moment = require('moment');

describe('MemberBreadService', function () {
    describe('read', function () {
        const MEMBER_ID = 123;
        const MEMBER_UUID = 'abcd-efgh';
        const DEFAULT_RELATIONS = [
            'labels',
            'products',
            'newsletters',
            'productEvents'
        ];

        let memberModelStub,
            memberModelJSON,
            memberRepositoryStub,
            memberAttributionServiceStub,
            emailSuppressionListStub;

        const getService = () => {
            return new MemberBreadService({
                settingsHelpers: {
                    createUnsubscribeUrl: sinon.stub().callsFake(uuid => `https://example.com/unsubscribe/?uuid=${uuid}&key=456`)
                },
                memberRepository: memberRepositoryStub,
                memberAttributionService: memberAttributionServiceStub,
                emailSuppressionList: emailSuppressionListStub
            });
        };

        beforeEach(function () {
            memberModelJSON = {
                id: MEMBER_ID,
                uuid: MEMBER_UUID,
                name: 'foo bar',
                email: 'foo@bar.baz',
                subscriptions: []
            };
            memberModelStub = {
                id: MEMBER_ID,
                related: sinon.stub().returns([]),
                toJSON: sinon.stub().returns({...memberModelJSON}),
                get: function (key) {
                    return this[key];
                }
            };
            memberRepositoryStub = {
                get: sinon.stub().resolves(null),
                related: sinon.stub().returns([])
            };
            memberAttributionServiceStub = {
                getMemberCreatedAttribution: sinon.stub().resolves(null)
            };
            emailSuppressionListStub = {
                getSuppressionData: sinon.stub().resolves({})
            };

            memberRepositoryStub.get
                .withArgs(
                    {id: MEMBER_ID},
                    {withRelated: DEFAULT_RELATIONS}
                )
                .resolves(memberModelStub);
        });

        it('returns a member', async function () {
            const memberBreadService = getService();
            const member = await memberBreadService.read({id: MEMBER_ID});

            assert.equal(member.id, memberModelJSON.id);
            assert.equal(member.email, memberModelJSON.email);
        });

        // Subscription tests removed - payment functionality deprecated

        // Subscription price tests removed - payment functionality deprecated

        // Comped subscription tests removed - payment functionality deprecated

        it('returns a member with attribution data', async function () {
            const attributionData = {
                url: 'https://example.com'
            };

            memberAttributionServiceStub.getMemberCreatedAttribution
                .withArgs(MEMBER_ID)
                .resolves(attributionData);

            const memberBreadService = getService();
            const member = await memberBreadService.read({id: MEMBER_ID});

            assert.deepEqual(member.attribution, attributionData);
        });

        it('returns a member with suppression data', async function () {
            emailSuppressionListStub.getSuppressionData
                .withArgs(memberModelJSON.email)
                .resolves({
                    suppressed: true,
                    info: 'bounce'
                });

            const memberBreadService = getService();
            const member = await memberBreadService.read({id: MEMBER_ID});

            assert.deepEqual(member.email_suppression, {
                suppressed: true,
                info: 'bounce'
            });
        });

        it('returns a member with an unsubscribe url', async function () {
            const memberBreadService = getService();
            const member = await memberBreadService.read({id: MEMBER_ID});

            assert.equal(member.unsubscribe_url, `https://example.com/unsubscribe/?uuid=${MEMBER_UUID}&key=456`);
        });
    });
});
