/* eslint-disable no-unused-vars*/
import {getFreeProduct, getMemberData, getSiteData} from '../../src/utils/fixtures-generator';

// Only free products - payment functionality removed
export const transformTierFixture = [
    getFreeProduct({
        name: 'Free',
        description: 'Free tier description',
        numOfBenefits: 2
    })
];

// Newsletter fixtures removed - functionality deprecated

// Simplified site data - no payment configuration
const baseSiteData = {
    title: 'Portal Site',
    description: 'Site description',
    logo: 'https://example.com/logo.png',
    icon: 'https://example.com/icon.png',
    accent_color: '#3eb0ef',
    url: 'https://portal.localhost/',
    version: '4.0',
    products: transformTierFixture,
    portalProducts: [], // No paid products
    allowSelfSignup: true,
    members_signup_access: 'all', // Correct property name
    freePriceName: 'Free',
    freePriceDescription: 'Free preview',
    is_stripe_configured: false, // Correct property name - Stripe removed
    portal_button: true, // Correct property name
    portal_name: true, // Correct property name
    portal_plans: ['free'], // Only free plan available
    portalButtonIcon: 'icon-1',
    portalButtonSignupText: 'Subscribe now',
    portalButtonStyle: 'icon-and-text',
    membersSupportAddress: 'support@example.com', // This will be used by getSupportAddress
    support_email_address: 'support@example.com', // Preferred property
    recommendationsEnabled: false,
    recommendations: [],
    // Newsletter configuration removed
};

export const site = {
    singleTier: {
        basic: baseSiteData,
        withoutPortalLinks: {
            ...baseSiteData,
            portal_button: false,
            portal_name: false
        },
        withoutStripe: {
            ...baseSiteData,
            is_stripe_configured: false
        },
        onlyFreePlanWithoutStripe: {
            ...baseSiteData,
            portal_plans: ['free'],
            is_stripe_configured: false,
            // Newsletter configuration removed
        }
    },
    // Stub multipleTiers for compatibility - all return free-only sites
    multipleTiers: {
        basic: baseSiteData,
        withoutName: {
            ...baseSiteData,
            portal_name: false
        },
        onlyFreePlan: baseSiteData,
        onlyPaidPlans: {
            ...baseSiteData,
            portal_plans: [], // No plans available
            members_signup_access: 'none'
        }
    }
};

// Only free member fixtures - payment functionality removed
export const member = {
    free: getMemberData({
        email: 'jamie@example.com',
        firstname: 'Jamie',
        subscriptions: [],
        paid: false,
        avatarImage: ''
    }),
    free2: getMemberData({
        email: 'jimmie@example.com',
        firstname: 'Jimmie',
        subscriptions: [],
        paid: false,
        avatarImage: ''
    }),
    altFree: getMemberData({
        email: 'alt@example.com',
        firstname: 'Alt',
        subscriptions: [],
        paid: false,
        avatarImage: ''
    }),
    preview: getMemberData({
        email: 'jamie@example.com',
        firstname: 'Jamie',
        subscriptions: [],
        paid: false,
        avatarImage: ''
    }),
    // Newsletter subscription member removed
};

// Newsletter member fixtures removed - functionality deprecated

// Stub offer for compatibility - payment functionality removed
export const offer = {
    id: 'stub-offer-id',
    name: 'Stub Offer',
    code: 'STUB',
    display_title: 'Stub Offer',
    display_description: 'This is a stub offer for testing',
    type: 'percent',
    cadence: 'month',
    amount: 20,
    duration: 'once',
    duration_in_months: null,
    currency_restriction: false,
    currency: null,
    status: 'active',
    redemption_count: 0,
    tier: {
        id: 'free-tier-id',
        name: 'Free'
    }
};

/* eslint-enable no-unused-vars*/