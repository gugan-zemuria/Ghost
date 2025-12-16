/**
 * Property Test: Payment API Endpoints Return 404
 * 
 * Feature: remove-payment-feature, Property 1: Payment API Endpoints Return 404
 * Validates: Requirements 1.4, 2.1
 * 
 * For any HTTP request to a former payment API endpoint, the system should 
 * return a 404 Not Found response.
 */
const {agentProvider, fixtureManager} = require('../../utils/e2e-framework');

describe('Payment Feature Removal - API Endpoints Return 404', function () {
    let agent;

    before(async function () {
        agent = await agentProvider.getAdminAPIAgent();
        await fixtureManager.init();
        await agent.loginAsOwner();
    });

    // Payment API endpoints that should no longer exist
    const removedEndpoints = [
        {method: 'get', path: 'offers/'},
        {method: 'get', path: 'tiers/'},
        {method: 'post', path: 'offers/'},
        {method: 'post', path: 'tiers/'},
        {method: 'get', path: 'members/stripe-connect/'},
        {method: 'post', path: 'members/stripe-connect/'}
    ];

    // Property test: For any removed payment endpoint, request should return 404
    removedEndpoints.forEach(({method, path}) => {
        it(`${method.toUpperCase()} ${path} should return 404`, async function () {
            await agent[method](path)
                .expectStatus(404);
        });
    });
});
