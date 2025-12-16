const sinon = require('sinon');
const should = require('should');
const models = require('../../../../core/server/models');
const configUtils = require('../../../utils/configUtils');
const labs = require('../../../../core/shared/labs');

const config = configUtils.config;

describe('Unit: models/member', function () {
    before(function () {
        models.init();
    });

    beforeEach(function () {
        config.set('assetHash', '1');
    });

    afterEach(async function () {
        await configUtils.restore();
        sinon.restore();
    });

    describe('toJSON', function () {
        let toJSON;

        beforeEach(function () {
            toJSON = function (model, options) {
                return new models.Member(model).toJSON(options);
            };
        });

        it('avatar_image: generates gravatar url', function () {
            const member = {
                email: 'test@example.com'
            };

            config.set('privacy:useGravatar', true);
            const json = toJSON(member);

            json.avatar_image.should.eql(`https://www.gravatar.com/avatar/55502f40dc8b7c769880b10874abc9d0?s=250&r=g&d=blank`);
        });

        it('avatar_image: skips gravatar when privacy.useGravatar=false', function () {
            const member = {
                email: 'test@example.com'
            };

            config.set('privacy:useGravatar', false);
            const json = toJSON(member);

            should(json.avatar_image).eql(null);
        });
    });

    describe('updateTierExpiry', function () {
        let memberModel;
        let updatePivot;

        beforeEach(function () {
            memberModel = new models.Member({email: 'text@example.com'});
            updatePivot = sinon.stub();

            sinon.stub(memberModel, 'products').callsFake(() => {
                return {
                    updatePivot: updatePivot
                };
            });
            sinon.stub(labs, 'isSet').returns(true);
        });

        it('calls updatePivot on member products to set expiry', function () {
            const expiry = (new Date()).toISOString();
            memberModel.updateTierExpiry([{
                expiry_at: expiry,
                id: '1'
            }]);

            updatePivot.calledWith({expiry_at: new Date(expiry)}, {query: {where: {product_id: '1'}}}).should.be.true();
        });

        it('calls updatePivot on member products to remove expiry', function () {
            memberModel.updateTierExpiry([{
                id: '1'
            }]);

            updatePivot.calledWith({expiry_at: null}, {query: {where: {product_id: '1'}}}).should.be.true();
        });
    });

    /**
     * **Feature: remove-payment-feature, Property 2: Member Data Integrity After Removal**
     * **Validates: Requirements 7.1, 7.2, 7.3**
     * 
     * For any member record, the member's core data (id, email, name, status) should remain
     * intact and queryable after the payment removal process, and member queries should
     * execute without referencing payment join tables.
     */
    describe('Property: Member Data Integrity After Payment Removal', function () {
        it('member model should not have stripeCustomers relationship', function () {
            const memberModel = new models.Member({email: 'test@example.com'});
            should.not.exist(memberModel.stripeCustomers);
        });

        it('member model should not have stripeSubscriptions relationship', function () {
            const memberModel = new models.Member({email: 'test@example.com'});
            should.not.exist(memberModel.stripeSubscriptions);
        });

        it('member relationships should not include payment-related tables', function () {
            const Member = models.Member;
            const relationships = Member.prototype.relationships || [];
            
            relationships.should.not.containEql('stripeCustomers');
            relationships.should.not.containEql('stripeSubscriptions');
            relationships.should.not.containEql('subscriptions');
        });

        it('member filterRelations should not include payment tables', function () {
            const memberModel = new models.Member({email: 'test@example.com'});
            const filterRelations = memberModel.filterRelations();
            
            should.not.exist(filterRelations.stripeCustomers);
            should.not.exist(filterRelations.subscriptions);
            should.not.exist(filterRelations.stripe_customers);
        });

        it('core fields are preserved in member model without payment relationships', function () {
            const testCases = [
                {email: 'test1@example.com', name: 'Test User 1', status: 'free'},
                {email: 'test2@example.com', name: 'Test User 2', status: 'paid'},
                {email: 'test3@example.com', name: 'Test User 3', status: 'comped'},
                {email: 'user@domain.org', name: 'Another User', status: 'free'}
            ];

            testCases.forEach((memberData) => {
                const memberModel = new models.Member(memberData);
                
                // Core fields should be preserved
                memberModel.get('email').should.equal(memberData.email);
                memberModel.get('name').should.equal(memberData.name);
                memberModel.get('status').should.equal(memberData.status);
                
                // Payment relationships should not exist
                should.not.exist(memberModel.stripeCustomers);
                should.not.exist(memberModel.stripeSubscriptions);
            });
        });
    });
});
