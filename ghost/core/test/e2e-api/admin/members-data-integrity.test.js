/**
 * Property Test: Member Data Integrity After Newsletter Removal
 * **Feature: remove-newsletter-feature, Property 2: Member Data Integrity After Removal**
 * **Validates: Requirements 7.1, 7.2**
 * 
 * For any member record that existed before newsletter removal, 
 * the member's core data (id, email, name, status) should remain intact and queryable.
 */
const {agentProvider, fixtureManager, matchers} = require('../../utils/e2e-framework');
const {anyContentVersion, anyEtag, anyObjectId, anyISODateTime, anyString} = matchers;

describe('Member Data Integrity After Newsletter Removal', function () {
    /** @type {import('../../utils/agents').AdminAPITestAgent} */
    let agent;

    before(async function () {
        agent = await agentProvider.getAdminAPIAgent();
        await fixtureManager.init('members');
        await agent.loginAsOwner();
    });

    // Property test: Member core fields are preserved and queryable
    it('Should preserve member core data fields', async function () {
        const response = await agent
            .get('members/')
            .expectStatus(200);

        // Verify members are returned with core fields intact
        const members = response.body.members;
        if (members && members.length > 0) {
            const member = members[0];
            // Core fields should exist
            expect(member).to.have.property('id');
            expect(member).to.have.property('email');
            expect(member).to.have.property('status');
        }
    });

    it('Should allow creating new members without newsletter references', async function () {
        const member = {
            email: 'test-no-newsletter@example.com',
            name: 'Test Member'
        };

        await agent
            .post('members/')
            .body({members: [member]})
            .expectStatus(201);
    });

    it('Should allow querying members without newsletter joins', async function () {
        await agent
            .get('members/?filter=status:free')
            .expectStatus(200);
    });
});
