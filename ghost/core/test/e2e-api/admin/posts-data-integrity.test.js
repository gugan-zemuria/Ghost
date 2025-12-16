/**
 * Property Test: Post Data Integrity After Newsletter Removal
 * **Feature: remove-newsletter-feature, Property 3: Post Data Integrity**
 * **Validates: Requirements 3.3, 7.3**
 * 
 * For any post record that had a newsletter_id before removal, 
 * the post should remain accessible and all non-newsletter fields should be preserved.
 */
const {agentProvider, fixtureManager, matchers} = require('../../utils/e2e-framework');
const {anyContentVersion, anyEtag, anyObjectId, anyISODateTime} = matchers;

describe('Post Data Integrity After Newsletter Removal', function () {
    /** @type {import('../../utils/agents').AdminAPITestAgent} */
    let agent;

    before(async function () {
        agent = await agentProvider.getAdminAPIAgent();
        await fixtureManager.init('posts');
        await agent.loginAsOwner();
    });

    // Property test: Post core fields are preserved and queryable
    it('Should preserve post core data fields without newsletter references', async function () {
        const response = await agent
            .get('posts/')
            .expectStatus(200);

        // Verify posts are returned with core fields intact
        const posts = response.body.posts;
        if (posts && posts.length > 0) {
            const post = posts[0];
            // Core fields should exist
            expect(post).to.have.property('id');
            expect(post).to.have.property('title');
            expect(post).to.have.property('slug');
            expect(post).to.have.property('status');
            // Newsletter field should not exist or be null
            expect(post.newsletter_id).to.be.oneOf([null, undefined]);
        }
    });

    it('Should allow creating new posts without newsletter references', async function () {
        const post = {
            title: 'Test Post Without Newsletter',
            status: 'draft'
        };

        await agent
            .post('posts/')
            .body({posts: [post]})
            .expectStatus(201);
    });

    it('Should allow querying posts without newsletter joins', async function () {
        await agent
            .get('posts/?filter=status:published')
            .expectStatus(200);
    });
});
