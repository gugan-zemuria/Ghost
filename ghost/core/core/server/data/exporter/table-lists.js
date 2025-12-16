// NOTE: these tables can be optionally included to have full db-like export
const BACKUP_TABLES = [
    'actions',
    'api_keys',
    'automated_emails',
    'brute',
    // 'donation_payment_events', // Payment feature removed
    'emails',
    'integrations',
    'invites',
    'labels',
    'members',
    'members_labels',
    'members_products',
    // 'members_stripe_customers', // Payment feature removed
    // 'members_stripe_customers_subscriptions', // Payment feature removed
    'migrations',
    'migrations_lock',
    'permissions',
    'permissions_roles',
    'permissions_users',
    'webhooks',
    'tokens',
    'sessions',
    // 'subscriptions', // Payment feature removed
    'mobiledoc_revisions',
    'post_revisions',
    'email_batches',
    'email_recipients',
    'email_recipient_failures',
    // 'members_cancel_events', // Payment feature removed
    // 'members_payment_events', // Payment feature removed
    'members_login_events',
    'members_email_change_events',
    'members_status_events',
    // 'members_paid_subscription_events', // Payment feature removed
    'members_subscribe_events',
    'members_product_events',
    'members_created_events',
    // 'members_subscription_created_events', // Payment feature removed
    'mentions',
    'comments',
    'comment_likes',
    'comment_reports',
    'jobs',
    'redirects',
    'members_click_events',
    'members_feedback',
    'suppressions',
    'email_spam_complaint_events',
    'milestones',
    'collections',
    'collections_posts',
    'recommendations',
    'recommendation_click_events',
    'recommendation_subscribe_events',
    'outbox'
];

// NOTE: exposing only tables which are going to be included in a "default" export file
//       they should match with the data that is supported by the importer.
//       In the future it's best to move to resource-based exports instead of database-based ones
const TABLES_ALLOWLIST = [
    'posts',
    'posts_authors',
    'posts_meta',
    'posts_tags',
    'roles',
    'roles_users',
    'settings',
    'custom_theme_settings',
    'tags',
    'users',
    'products',
    // 'stripe_products', // Payment feature removed
    // 'stripe_prices', // Payment feature removed
    'posts_products',
    'benefits',
    'products_benefits',
    // 'offers', // Payment feature removed
    // 'offer_redemptions', // Payment feature removed
    'snippets'
];

// NOTE: these are settings keys which should never end up in the export file
const SETTING_KEYS_BLOCKLIST = [
    'stripe_connect_publishable_key',
    'stripe_connect_secret_key',
    'stripe_connect_account_id',
    'stripe_secret_key',
    'stripe_publishable_key',
    'members_stripe_webhook_id',
    'members_stripe_webhook_secret',
    'email_verification_required'
];

module.exports = {
    BACKUP_TABLES,
    TABLES_ALLOWLIST,
    SETTING_KEYS_BLOCKLIST
};
