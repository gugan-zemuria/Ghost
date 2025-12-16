const {dropTables} = require('../../utils');

/**
 * Drop payment-related tables that are no longer needed
 * Tables are dropped in order to respect foreign key constraints
 */
module.exports = dropTables([
    // Drop tables with foreign keys first
    'offer_redemptions',
    'members_subscription_created_events',
    'members_stripe_customers_subscriptions',
    'members_stripe_customers',
    'stripe_prices',
    'stripe_products',
    'offers',
    'donation_payment_events',
    'subscriptions'
]);
