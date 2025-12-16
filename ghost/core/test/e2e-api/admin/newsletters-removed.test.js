/**
 * Property Test: API Endpoint Removal Completeness
 * **Feature: remove-newsletter-feature, Property 1: API Endpoint Removal Completeness**
 * **Validates: Requirements 2.1**
 * 
 * For any HTTP request to a former newsletter API endpoint, 
 * the system should return a 404 Not Found response.
 */
const {agentProvider, fixtureManager} = require('../../utils/e2e-framework');

describe('Newsletter API Removal', function () {
    /** @type {import('../../utils/agents').AdminAPITestAgent} */
    let agent;

    before(async function () {
        agent = await agentProvider.getAdminAPIAgent();
        await fixtureManager.init();
        await agent.loginAsOwner();
    });

    // Property test: All newsletter endpoints should return 404
    const newsletterEndpoints = [
        {method: 'get', path: 'newsletters/'},
        {method: 'get', path: 'newsletters/abc123/'},
        {method: 'post', path: 'newsletters/'},
        {method: 'put', path: 'newsletters/abc123/'}
    ];

    newsletterEndpoints.forEach(({method, path}) => {
        it(`Should return 404 for ${method.toUpperCase()} ${path}`, async function () {
            await agent[method](path)
                .expectStatus(404);
        });
    });
});
