/* String Column Sizes Information
 * (From: https://github.com/TryGhost/Ghost/pull/7932)
 * New/Updated column maxlengths should meet these guidlines
 *
 * Small strings = length 50
 * Medium strings = length 191
 * Large strings = length 2000 (use soft limits via validation for 191-2000)
 * Text = length 65535 (64 KiB)
 * Long text = length 1,000,000,000
 */
module.exports = {
    // Newsletter table removed - feature deprecated
    posts: {
        id: {type: 'string', maxlength: 24, nullable: false, primary: true},
        uuid: {type: 'string', maxlength: 36, nullable: false, index: true, validations: {isUUID: true}},
        title: {type: 'string', maxlength: 2000, nullable: false, validations: {isLength: {max: 255}}},
        slug: {type: 'string', maxlength: 191, nullable: false},
        mobiledoc: {type: 'text', maxlength: 1000000000, fieldtype: 'long', nullable: true},
        lexical: {type: 'text', maxlength: 1000000000, fieldtype: 'long', nullable: true},
        html: {type: 'text', maxlength: 1000000000, fieldtype: 'long', nullable: true},
        comment_id: {type: 'string', maxlength: 50, nullable: true},
        plaintext: {type: 'text', maxlength: 1000000000, fieldtype: 'long', nullable: true},
        feature_image: {type: 'string', maxlength: 2000, nullable: true},
        featured: {type: 'boolean', nullable: false, defaultTo: false},
        type: {type: 'string', maxlength: 50, nullable: false, defaultTo: 'post', validations: {isIn: [['post', 'page']]}},
        status: {type: 'string', maxlength: 50, nullable: false, defaultTo: 'draft', validations: {isIn: [['published', 'draft', 'scheduled', 'sent']]}},
        // NOTE: unused at the moment and reserved for future features
        locale: {type: 'string', maxlength: 6, nullable: true},
        visibility: {
            type: 'string',
            maxlength: 50,
            nullable: false,
            defaultTo: 'public'
        },
        email_recipient_filter: {
            type: 'text',
            maxlength: 1000000000,
            nullable: false
        },
        created_at: {type: 'dateTime', nullable: false},
        updated_at: {type: 'dateTime', nullable: true, index: true},
        published_at: {type: 'dateTime', nullable: true, index: true},
        published_by: {type: 'string', maxlength: 24, nullable: true},
        custom_excerpt: {type: 'string', maxlength: 2000, nullable: true, validations: {isLength: {max: 300}}},
        codeinjection_head: {type: 'text', maxlength: 65535, nullable: true},
        codeinjection_foot: {type: 'text', maxlength: 65535, nullable: true},
        custom_template: {type: 'string', maxlength: 100, nullable: true},
        canonical_url: {type: 'text', maxlength: 2000, nullable: true},
        show_title_and_feature_image: {type: 'boolean', nullable: false, defaultTo: true},
        '@@INDEXES@@': [
            ['type','status','updated_at']
        ],
        '@@UNIQUE_CONSTRAINTS@@': [
            ['slug', 'type']
        ]
    },
    posts_meta: {
        id: {type: 'string', maxlength: 24, nullable: false, primary: true},
        post_id: {type: 'string', maxlength: 24, nullable: false, references: 'posts.id', unique: true},
        og_image: {type: 'string', maxlength: 2000, nullable: true},
        og_title: {type: 'string', maxlength: 300, nullable: true},
        og_description: {type: 'string', maxlength: 500, nullable: true},
        twitter_image: {type: 'string', maxlength: 2000, nullable: true},
        twitter_title: {type: 'string', maxlength: 300, nullable: true},
        twitter_description: {type: 'string', maxlength: 500, nullable: true},
        meta_title: {type: 'string', maxlength: 2000, nullable: true, validations: {isLength: {max: 300}}},
        meta_description: {type: 'string', maxlength: 2000, nullable: true, validations: {isLength: {max: 500}}},
        email_subject: {type: 'string', maxlength: 300, nullable: true},
        frontmatter: {type: 'text', maxlength: 65535, nullable: true},
        feature_image_alt: {type: 'string', maxlength: 2000, nullable: true, validations: {isLength: {max: 191}}},
        feature_image_caption: {type: 'text', maxlength: 65535, nullable: true},
        email_only: {type: 'boolean', nullable: false, defaultTo: false}
    },
    // NOTE: this is the staff table
    users: {
        id: {type: 'string', maxlength: 24, nullable: false, primary: true},
        name: {type: 'string', maxlength: 191, nullable: false},
        slug: {type: 'string', maxlength: 191, nullable: false, unique: true},
        password: {type: 'string', maxlength: 60, nullable: false},
        email: {type: 'string', maxlength: 191, nullable: false, unique: true, validations: {isEmail: true}},
        profile_image: {type: 'string', maxlength: 2000, nullable: true},
        cover_image: {type: 'string', maxlength: 2000, nullable: true},
        bio: {type: 'text', maxlength: 65535, nullable: true, validations: {isLength: {max: 250}}},
        website: {type: 'string', maxlength: 2000, nullable: true, validations: {isEmptyOrURL: true}},
        location: {type: 'text', maxlength: 65535, nullable: true, validations: {isLength: {max: 150}}},
        facebook: {type: 'string', maxlength: 2000, nullable: true},
        twitter: {type: 'string', maxlength: 2000, nullable: true},
        threads: {type: 'string', maxlength: 191, nullable: true},
        bluesky: {type: 'string', maxlength: 191, nullable: true},
        mastodon: {type: 'string', maxlength: 191, nullable: true},
        tiktok: {type: 'string', maxlength: 191, nullable: true},
        youtube: {type: 'string', maxlength: 191, nullable: true},
        instagram: {type: 'string', maxlength: 191, nullable: true},
        linkedin: {type: 'string', maxlength: 191, nullable: true},
        accessibility: {type: 'text', maxlength: 65535, nullable: true},
        status: {
            type: 'string',
            maxlength: 50,
            nullable: false,
            defaultTo: 'active',
            validations: {
                isIn: [[
                    'active',
                    'inactive',
                    'locked',
                    'warn-1',
                    'warn-2',
                    'warn-3',
                    'warn-4'
                ]]
            }
        },
        // NOTE: unused at the moment and reserved for future features
        locale: {type: 'string', maxlength: 6, nullable: true},
        visibility: {
            type: 'string',
            maxlength: 50,
            nullable: false,
            defaultTo: 'public',
            validations: {isIn: [['public']]}
        },
        meta_title: {type: 'string', maxlength: 2000, nullable: true, validations: {isLength: {max: 300}}},
        meta_description: {type: 'string', maxlength: 2000, nullable: true, validations: {isLength: {max: 500}}},
        tour: {type: 'text', maxlength: 65535, nullable: true},
        // NOTE: Used to determine whether a user has logged in previously
        last_seen: {type: 'dateTime', nullable: true},
        comment_notifications: {type: 'boolean', nullable: false, defaultTo: true},
        free_member_signup_notification: {type: 'boolean', nullable: false, defaultTo: true},
        paid_subscription_started_notification: {type: 'boolean', nullable: false, defaultTo: true},
        paid_subscription_canceled_notification: {type: 'boolean', nullable: false, defaultTo: false},
        mention_notifications: {type: 'boolean', nullable: false, defaultTo: true},
        recommendation_notifications: {type: 'boolean', nullable: false, defaultTo: true},
        milestone_notifications: {type: 'boolean', nullable: false, defaultTo: true},
        donation_notifications: {type: 'boolean', nullable: false, defaultTo: true},
        created_at: {type: 'dateTime', nullable: false},
        updated_at: {type: 'dateTime', nullable: true}
    },
    posts_authors: {
        id: {type: 'string', maxlength: 24, nullable: false, primary: true},
        post_id: {type: 'string', maxlength: 24, nullable: false, references: 'posts.id'},
        author_id: {type: 'string', maxlength: 24, nullable: false, references: 'users.id'},
        sort_order: {type: 'integer', nullable: false, unsigned: true, defaultTo: 0}
    },
    roles: {
        id: {type: 'string', maxlength: 24, nullable: false, primary: true},
        name: {type: 'string', maxlength: 50, nullable: false, unique: true},
        description: {type: 'string', maxlength: 2000, nullable: true},
        created_at: {type: 'dateTime', nullable: false},
        updated_at: {type: 'dateTime', nullable: true}
    },
    roles_users: {
        id: {type: 'string', maxlength: 24, nullable: false, primary: true},
        role_id: {type: 'string', maxlength: 24, nullable: false},
        user_id: {type: 'string', maxlength: 24, nullable: false}
    },
    permissions: {
        id: {type: 'string', maxlength: 24, nullable: false, primary: true},
        name: {type: 'string', maxlength: 50, nullable: false, unique: true},
        object_type: {type: 'string', maxlength: 50, nullable: false},
        action_type: {type: 'string', maxlength: 50, nullable: false},
        object_id: {type: 'string', maxlength: 24, nullable: true},
        created_at: {type: 'dateTime', nullable: false},
        updated_at: {type: 'dateTime', nullable: true}
    },
    permissions_users: {
        id: {type: 'string', maxlength: 24, nullable: false, primary: true},
        user_id: {type: 'string', maxlength: 24, nullable: false},
        permission_id: {type: 'string', maxlength: 24, nullable: false}
    },
    permissions_roles: {
        id: {type: 'string', maxlength: 24, nullable: false, primary: true},
        role_id: {type: 'string', maxlength: 24, nullable: false},
        permission_id: {type: 'string', maxlength: 24, nullable: false}
    },
    settings: {
        id: {type: 'string', maxlength: 24, nullable: false, primary: true},
        group: {
            type: 'string',
            maxlength: 50,
            nullable: false,
            defaultTo: 'core',
            validations: {
                isIn: [[
                    'core',
                    'email',
                    'labs',
                    'members',
                    'portal',
                    'private',
                    'site',
                    'slack',
                    'theme',
                    'unsplash',
                    'views'
                ]]
            }
        },
        key: {type: 'string', maxlength: 50, nullable: false, unique: true},
        // NOTE: as JSON objects are no longer stored in `value` we could potentially reduce the maxlength
        value: {type: 'text', maxlength: 65535, nullable: true},
        type: {
            type: 'string',
            maxlength: 50,
            nullable: false,
            validations: {
                isIn: [[
                    'array',
                    'string',
                    'number',
                    'boolean',
                    'object'
                ]]
            }
        },
        flags: {type: 'string', maxlength: 50, nullable: true},
        created_at: {type: 'dateTime', nullable: false},
        updated_at: {type: 'dateTime', nullable: true}
    },
    tags: {
        id: {type: 'string', maxlength: 24, nullable: false, primary: true},
        name: {type: 'string', maxlength: 191, nullable: false, validations: {matches: /^([^,]|$)/}},
        slug: {type: 'string', maxlength: 191, nullable: false, unique: true},
        description: {type: 'text', maxlength: 65535, nullable: true, validations: {isLength: {max: 500}}},
        feature_image: {type: 'string', maxlength: 2000, nullable: true},
        parent_id: {type: 'string', nullable: true},
        visibility: {
            type: 'string',
            maxlength: 50,
            nullable: false,
            defaultTo: 'public',
            validations: {isIn: [['public', 'internal']]}
        },
        og_image: {type: 'string', maxlength: 2000, nullable: true},
        og_title: {type: 'string', maxlength: 300, nullable: true},
        og_description: {type: 'string', maxlength: 500, nullable: true},
        twitter_image: {type: 'string', maxlength: 2000, nullable: true},
        twitter_title: {type: 'string', maxlength: 300, nullable: true},
        twitter_description: {type: 'string', maxlength: 500, nullable: true},
        meta_title: {type: 'string', maxlength: 2000, nullable: true, validations: {isLength: {max: 300}}},
        meta_description: {type: 'string', maxlength: 2000, nullable: true, validations: {isLength: {max: 500}}},
        codeinjection_head: {type: 'text', maxlength: 65535, nullable: true},
        codeinjection_foot: {type: 'text', maxlength: 65535, nullable: true},
        canonical_url: {type: 'string', maxlength: 2000, nullable: true},
        accent_color: {type: 'string', maxlength: 50, nullable: true},
        created_at: {type: 'dateTime', nullable: false},
        updated_at: {type: 'dateTime', nullable: true}
    },
    posts_tags: {
        id: {type: 'string', maxlength: 24, nullable: false, primary: true},
        post_id: {type: 'string', maxlength: 24, nullable: false, references: 'posts.id'},
        tag_id: {type: 'string', maxlength: 24, nullable: false, references: 'tags.id'},
        sort_order: {type: 'integer', nullable: false, unsigned: true, defaultTo: 0},
        '@@INDEXES@@': [
            ['post_id','tag_id']
        ]
    },
    invites: {
        id: {type: 'string', maxlength: 24, nullable: false, primary: true},
        role_id: {type: 'string', maxlength: 24, nullable: false},
        status: {
            type: 'string',
            maxlength: 50,
            nullable: false,
            defaultTo: 'pending',
            validations: {isIn: [['pending', 'sent']]}
        },
        token: {type: 'string', maxlength: 191, nullable: false, unique: true},
        email: {type: 'string', maxlength: 191, nullable: false, unique: true, validations: {isEmail: true}},
        expires: {type: 'bigInteger', nullable: false},
        created_at: {type: 'dateTime', nullable: false},
        updated_at: {type: 'dateTime', nullable: true}
    },
    brute: {
        key: {type: 'string', maxlength: 191, primary: true},
        firstRequest: {type: 'bigInteger'},
        lastRequest: {type: 'bigInteger'},
        lifetime: {type: 'bigInteger'},
        count: {type: 'integer'}
    },
    sessions: {
        id: {type: 'string', maxlength: 24, nullable: false, primary: true},
        session_id: {type: 'string', maxlength: 32, nullable: false, unique: true},
        user_id: {type: 'string', maxlength: 24, nullable: false},
        session_data: {type: 'string', maxlength: 2000, nullable: false},
        created_at: {type: 'dateTime', nullable: false},
        updated_at: {type: 'dateTime', nullable: true}
    },
    integrations: {
        id: {type: 'string', maxlength: 24, nullable: false, primary: true},
        type: {
            type: 'string',
            maxlength: 50,
            nullable: false,
            defaultTo: 'custom',
            validations: {isIn: [['internal', 'builtin', 'custom', 'core']]}
        },
        name: {type: 'string', maxlength: 191, nullable: false},
        slug: {type: 'string', maxlength: 191, nullable: false, unique: true},
        icon_image: {type: 'string', maxlength: 2000, nullable: true},
        description: {type: 'string', maxlength: 2000, nullable: true},
        created_at: {type: 'dateTime', nullable: false},
        updated_at: {type: 'dateTime', nullable: true}
    },
    webhooks: {
        id: {type: 'string', maxlength: 24, nullable: false, primary: true},
        event: {type: 'string', maxlength: 50, nullable: false, validations: {isLowercase: true}},
        target_url: {type: 'string', maxlength: 2000, nullable: false},
        name: {type: 'string', maxlength: 191, nullable: true},
        secret: {type: 'string', maxlength: 191, nullable: true},
        // @NOTE: the defaultTo does not make sense to set on DB layer as it leads to unnecessary maintenance every major release
        //       would be ideal if we can remove the default and instead have "isIn" validation checking if it's a valid version e.g: 'v3', 'v4', 'canary'
        api_version: {type: 'string', maxlength: 50, nullable: false, defaultTo: 'v2'},
        // NOTE: integration_id column needs "nullable: true" -> "nullable: false" migration (recreate table with nullable: false)
        // CASE: Ghost instances initialized pre 4.0 will have this column set to nullable: true in db schema
        integration_id: {type: 'string', maxlength: 24, nullable: false, references: 'integrations.id', cascadeDelete: true},
        last_triggered_at: {type: 'dateTime', nullable: true},
        last_triggered_status: {type: 'string', maxlength: 50, nullable: true},
        last_triggered_error: {type: 'string', maxlength: 50, nullable: true},
        created_at: {type: 'dateTime', nullable: false},
        updated_at: {type: 'dateTime', nullable: true}
    },
    api_keys: {
        id: {type: 'string', maxlength: 24, nullable: false, primary: true},
        type: {
            type: 'string',
            maxlength: 50,
            nullable: false,
            validations: {isIn: [['content', 'admin']]}
        },
        secret: {
            type: 'string',
            maxlength: 191,
            nullable: false,
            unique: true,
            validations: {isLength: {min: 26, max: 128}}
        },
        role_id: {type: 'string', maxlength: 24, nullable: true},
        // integration_id is nullable to allow "internal" API keys that don't show in the UI
        integration_id: {type: 'string', maxlength: 24, nullable: true},
        user_id: {type: 'string', maxlength: 24, nullable: true},
        last_seen_at: {type: 'dateTime', nullable: true},
        last_seen_version: {type: 'string', maxlength: 50, nullable: true},
        created_at: {type: 'dateTime', nullable: false},
        updated_at: {type: 'dateTime', nullable: true}
    },
    mobiledoc_revisions: {
        id: {type: 'string', maxlength: 24, nullable: false, primary: true},
        post_id: {type: 'string', maxlength: 24, nullable: false, index: true},
        mobiledoc: {type: 'text', maxlength: 1000000000, fieldtype: 'long', nullable: true},
        created_at_ts: {type: 'bigInteger', nullable: false},
        created_at: {type: 'dateTime', nullable: false}
    },
    post_revisions: {
        id: {type: 'string', maxlength: 24, nullable: false, primary: true},
        post_id: {type: 'string', maxlength: 24, nullable: false, index: true},
        lexical: {type: 'text', maxlength: 1000000000, fieldtype: 'long', nullable: true},
        created_at_ts: {type: 'bigInteger', nullable: false},
        created_at: {type: 'dateTime', nullable: false},
        author_id: {type: 'string', maxlength: 24, nullable: true, references: 'users.id', cascadeDelete: false, constraintName: 'post_revs_author_id_foreign'},
        title: {type: 'string', maxlength: 2000, nullable: true, validations: {isLength: {max: 255}}},
        post_status: {type: 'string', maxlength: 50, nullable: true, validations: {isIn: [['draft', 'published', 'scheduled', 'sent']]}},
        reason: {type: 'string', maxlength: 50, nullable: true},
        feature_image: {type: 'string', maxlength: 2000, nullable: true},
        feature_image_alt: {type: 'string', maxlength: 2000, nullable: true, validations: {isLength: {max: 191}}},
        feature_image_caption: {type: 'text', maxlength: 65535, nullable: true},
        custom_excerpt: {type: 'string', maxlength: 2000, nullable: true, validations: {isLength: {max: 300}}}
    },
    members: {
        id: {type: 'string', maxlength: 24, nullable: false, primary: true},
        uuid: {type: 'string', maxlength: 36, nullable: false, unique: true, validations: {isUUID: true}},
        transient_id: {type: 'string', maxlength: 191, nullable: false, unique: true},
        email: {type: 'string', maxlength: 191, nullable: false, unique: true, validations: {isEmail: true}},
        status: {
            type: 'string', maxlength: 50, nullable: false, defaultTo: 'free', validations: {
                isIn: [['free', 'paid', 'comped']]
            }
        },
        name: {type: 'string', maxlength: 191, nullable: true},
        expertise: {type: 'string', maxlength: 191, nullable: true, validations: {isLength: {max: 50}}},
        note: {type: 'string', maxlength: 2000, nullable: true},
        geolocation: {type: 'string', maxlength: 2000, nullable: true},
        enable_comment_notifications: {type: 'boolean', nullable: false, defaultTo: true},
        email_count: {type: 'integer', unsigned: true, nullable: false, defaultTo: 0},
        email_opened_count: {type: 'integer', unsigned: true, nullable: false, defaultTo: 0},
        email_open_rate: {type: 'integer', unsigned: true, nullable: true, index: true},
        email_disabled: {type: 'boolean', nullable: false, defaultTo: false},
        last_seen_at: {type: 'dateTime', nullable: true},
        last_commented_at: {type: 'dateTime', nullable: true},
        created_at: {type: 'dateTime', nullable: false},
        updated_at: {type: 'dateTime', nullable: true},
        '@@INDEXES@@': [
            ['email_disabled']
        ]
    },
    // NOTE: this is the tiers table (simplified - payment features removed)
    products: {
        id: {type: 'string', maxlength: 24, nullable: false, primary: true},
        name: {type: 'string', maxlength: 191, nullable: false},
        slug: {type: 'string', maxlength: 191, nullable: false, unique: true},
        // @deprecated: use a status enum with isIn validation, not an `active` boolean
        active: {type: 'boolean', nullable: false, defaultTo: true},
        welcome_page_url: {type: 'string', maxlength: 2000, nullable: true},
        visibility: {
            type: 'string',
            maxlength: 50,
            nullable: false,
            defaultTo: 'none',
            validations: {isIn: [['public', 'none']]}
        },
        description: {type: 'string', maxlength: 191, nullable: true},
        type: {
            type: 'string',
            maxlength: 50,
            nullable: false,
            defaultTo: 'paid',
            validations: {
                isIn: [['paid', 'free']]
            }
        },
        created_at: {type: 'dateTime', nullable: false},
        updated_at: {type: 'dateTime', nullable: true}
    },
    // offers table removed - payment feature deprecated
    benefits: {
        id: {type: 'string', maxlength: 24, nullable: false, primary: true},
        name: {type: 'string', maxlength: 191, nullable: false},
        slug: {type: 'string', maxlength: 191, nullable: false, unique: true},
        created_at: {type: 'dateTime', nullable: false},
        updated_at: {type: 'dateTime', nullable: true}
    },
    products_benefits: {
        id: {type: 'string', maxlength: 24, nullable: false, primary: true},
        product_id: {type: 'string', maxlength: 24, nullable: false, references: 'products.id', cascadeDelete: true},
        benefit_id: {type: 'string', maxlength: 24, nullable: false, references: 'benefits.id', cascadeDelete: true},
        sort_order: {type: 'integer', nullable: false, unsigned: true, defaultTo: 0}
    },
    members_products: {
        id: {type: 'string', maxlength: 24, nullable: false, primary: true},
        member_id: {type: 'string', maxlength: 24, nullable: false, references: 'members.id', cascadeDelete: true},
        product_id: {type: 'string', maxlength: 24, nullable: false, references: 'products.id', cascadeDelete: true},
        sort_order: {type: 'integer', nullable: false, unsigned: true, defaultTo: 0},
        expiry_at: {type: 'dateTime', nullable: true}
    },
    posts_products: {
        id: {type: 'string', maxlength: 24, nullable: false, primary: true},
        post_id: {type: 'string', maxlength: 24, nullable: false, references: 'posts.id', cascadeDelete: true},
        product_id: {type: 'string', maxlength: 24, nullable: false, references: 'products.id', cascadeDelete: true},
        sort_order: {type: 'integer', nullable: false, unsigned: true, defaultTo: 0}
    },
    members_created_events: {
        id: {type: 'string', maxlength: 24, nullable: false, primary: true},
        created_at: {type: 'dateTime', nullable: false},
        member_id: {type: 'string', maxlength: 24, nullable: false, references: 'members.id', cascadeDelete: true},
        // attribution values from ghost-history (member attribution tracking script)
        attribution_id: {type: 'string', maxlength: 24, nullable: true, index: true},
        attribution_type: {
            type: 'string', maxlength: 50, nullable: true, validations: {
                isIn: [['url', 'post', 'page', 'author', 'tag']]
            }
        },
        attribution_url: {type: 'string', maxlength: 2000, nullable: true},
        // referrer values from browser, processed by our referrerParser library
        referrer_source: {type: 'string', maxlength: 191, nullable: true},
        referrer_medium: {type: 'string', maxlength: 191, nullable: true},
        referrer_url: {type: 'string', maxlength: 2000, nullable: true},
        // raw values from URL query parameters
        utm_source: {type: 'string', maxlength: 191, nullable: true},
        utm_medium: {type: 'string', maxlength: 191, nullable: true},
        utm_campaign: {type: 'string', maxlength: 191, nullable: true},
        utm_term: {type: 'string', maxlength: 191, nullable: true},
        utm_content: {type: 'string', maxlength: 191, nullable: true},
        source: {
            type: 'string', maxlength: 50, nullable: false, validations: {
                isIn: [['member', 'import', 'system', 'api', 'admin']]
            }
        },
        batch_id: {type: 'string', maxlength: 24, nullable: true}
    },
    // members_cancel_events table removed - payment feature deprecated
    // members_payment_events table removed - payment feature deprecated
    members_login_events: {
        id: {type: 'string', maxlength: 24, nullable: false, primary: true},
        member_id: {type: 'string', maxlength: 24, nullable: false, references: 'members.id', cascadeDelete: true},
        created_at: {type: 'dateTime', nullable: false}
    },
    members_email_change_events: {
        id: {type: 'string', maxlength: 24, nullable: false, primary: true},
        member_id: {type: 'string', maxlength: 24, nullable: false, references: 'members.id', cascadeDelete: true},
        to_email: {type: 'string', maxlength: 191, nullable: false, unique: false, validations: {isEmail: true}},
        from_email: {type: 'string', maxlength: 191, nullable: false, unique: false, validations: {isEmail: true}},
        created_at: {type: 'dateTime', nullable: false}
    },
    members_status_events: {
        id: {type: 'string', maxlength: 24, nullable: false, primary: true},
        member_id: {type: 'string', maxlength: 24, nullable: false, references: 'members.id', cascadeDelete: true},
        from_status: {
            type: 'string', maxlength: 50, nullable: true, validations: {
                isIn: [['free', 'paid', 'comped']]
            }
        },
        to_status: {
            type: 'string', maxlength: 50, nullable: true, validations: {
                isIn: [['free', 'paid', 'comped']]
            }
        },
        created_at: {type: 'dateTime', nullable: false}
    },
    members_product_events: {
        id: {type: 'string', maxlength: 24, nullable: false, primary: true},
        member_id: {type: 'string', maxlength: 24, nullable: false, references: 'members.id', cascadeDelete: true},
        product_id: {type: 'string', maxlength: 24, nullable: false, references: 'products.id', cascadeDelete: false},
        action: {
            type: 'string', maxlength: 50, nullable: true, validations: {
                isIn: [['added', 'removed']]
            }
        },
        created_at: {type: 'dateTime', nullable: false}
    },
    // members_paid_subscription_events table removed - payment feature deprecated
    labels: {
        id: {type: 'string', maxlength: 24, nullable: false, primary: true},
        name: {type: 'string', maxlength: 191, nullable: false, unique: true},
        slug: {type: 'string', maxlength: 191, nullable: false, unique: true},
        created_at: {type: 'dateTime', nullable: false},
        updated_at: {type: 'dateTime', nullable: true}
    },
    members_labels: {
        id: {type: 'string', maxlength: 24, nullable: false, primary: true},
        member_id: {type: 'string', maxlength: 24, nullable: false, references: 'members.id', cascadeDelete: true},
        label_id: {type: 'string', maxlength: 24, nullable: false, references: 'labels.id', cascadeDelete: true},
        sort_order: {type: 'integer', nullable: false, unsigned: true, defaultTo: 0}
    },
    // Payment tables removed - payment feature deprecated
    // members_stripe_customers table removed
    // subscriptions table removed
    // members_stripe_customers_subscriptions table removed
    // members_subscription_created_events table removed
    // offer_redemptions table removed
    members_subscribe_events: {
        id: {type: 'string', maxlength: 24, nullable: false, primary: true},
        member_id: {type: 'string', maxlength: 24, nullable: false, unique: false, references: 'members.id', cascadeDelete: true},
        subscribed: {type: 'boolean', nullable: false, defaultTo: true},
        created_at: {type: 'dateTime', nullable: false},
        source: {
            type: 'string', maxlength: 50, nullable: true, validations: {
                isIn: [['member', 'import', 'system', 'api', 'admin']]
            }
        },
        '@@INDEXES@@': [
            ['created_at']
        ]
    },
    // donation_payment_events table removed - payment feature deprecated
    // stripe_products table removed - payment feature deprecated
    // stripe_prices table removed - payment feature deprecated
    actions: {
        id: {type: 'string', maxlength: 24, nullable: false, primary: true},
        resource_id: {type: 'string', maxlength: 24, nullable: true},
        resource_type: {type: 'string', maxlength: 50, nullable: false},
        actor_id: {type: 'string', maxlength: 24, nullable: false},
        actor_type: {type: 'string', maxlength: 50, nullable: false},
        // @NOTE: The event column contains short buzzwords e.g. subscribed, started, added, deleted, edited etc.
        //        We already store and require the target resource type. No need to remember e.g. post.edited
        event: {type: 'string', maxlength: 50, nullable: false},
        // @NOTE: The context object can be used to store information about an action e.g. diffs, meta
        context: {type: 'text', maxlength: 1000000000, nullable: true},
        created_at: {type: 'dateTime', nullable: false}
    },
    emails: {
        id: {type: 'string', maxlength: 24, nullable: false, primary: true},
        post_id: {type: 'string', maxlength: 24, nullable: false, index: true, unique: true},
        uuid: {type: 'string', maxlength: 36, nullable: false, validations: {isUUID: true}},
        status: {
            type: 'string',
            maxlength: 50,
            nullable: false,
            defaultTo: 'pending',
            validations: {isIn: [['pending', 'submitting', 'submitted', 'failed']]}
        },
        recipient_filter: {
            type: 'text',
            maxlength: 1000000000,
            nullable: false
        },
        error: {type: 'string', maxlength: 2000, nullable: true},
        error_data: {type: 'text', maxlength: 1000000000, fieldtype: 'long', nullable: true},
        email_count: {type: 'integer', nullable: false, unsigned: true, defaultTo: 0},
        csd_email_count: {type: 'integer', nullable: true, unsigned: true},
        delivered_count: {type: 'integer', nullable: false, unsigned: true, defaultTo: 0},
        opened_count: {type: 'integer', nullable: false, unsigned: true, defaultTo: 0},
        failed_count: {type: 'integer', nullable: false, unsigned: true, defaultTo: 0},
        subject: {type: 'string', maxlength: 300, nullable: true},
        from: {type: 'string', maxlength: 2000, nullable: true},
        reply_to: {type: 'string', maxlength: 2000, nullable: true},
        html: {type: 'text', maxlength: 1000000000, fieldtype: 'long', nullable: true},
        plaintext: {type: 'text', maxlength: 1000000000, fieldtype: 'long', nullable: true},
        source: {type: 'text', maxlength: 1000000000, fieldtype: 'long', nullable: true},
        source_type: {
            type: 'string',
            maxlength: 50,
            nullable: false,
            defaultTo: 'html',
            validations: {isIn: [['html', 'lexical', 'mobiledoc']]}
        },
        track_opens: {type: 'boolean', nullable: false, defaultTo: false},
        track_clicks: {type: 'boolean', nullable: false, defaultTo: false},
        feedback_enabled: {type: 'boolean', nullable: false, defaultTo: false},
        submitted_at: {type: 'dateTime', nullable: false},
        created_at: {type: 'dateTime', nullable: false},
        updated_at: {type: 'dateTime', nullable: true}
    },
    email_batches: {
        id: {type: 'string', maxlength: 24, nullable: false, primary: true},
        email_id: {type: 'string', maxlength: 24, nullable: false, references: 'emails.id'},
        provider_id: {type: 'string', maxlength: 255, nullable: true},
        fallback_sending_domain: {type: 'boolean', nullable: false, defaultTo: false},
        status: {
            type: 'string',
            maxlength: 50,
            nullable: false,
            defaultTo: 'pending',
            validations: {isIn: [['pending', 'submitting', 'submitted', 'failed']]}
        },
        member_segment: {type: 'text', maxlength: 2000, nullable: true},
        error_status_code: {type: 'integer', nullable: true, unsigned: true},
        error_message: {type: 'string', maxlength: 2000, nullable: true},
        error_data: {type: 'text', maxlength: 1000000000, fieldtype: 'long', nullable: true},
        created_at: {type: 'dateTime', nullable: false},
        updated_at: {type: 'dateTime', nullable: false}
    },
    email_recipients: {
        id: {type: 'string', maxlength: 24, nullable: false, primary: true},
        email_id: {type: 'string', maxlength: 24, nullable: false, references: 'emails.id'},
        member_id: {type: 'string', maxlength: 24, nullable: false, index: true},
        batch_id: {type: 'string', maxlength: 24, nullable: false, references: 'email_batches.id'},
        processed_at: {type: 'dateTime', nullable: true},
        delivered_at: {type: 'dateTime', nullable: true},
        opened_at: {type: 'dateTime', nullable: true},
        failed_at: {type: 'dateTime', nullable: true},
        member_uuid: {type: 'string', maxlength: 36, nullable: false},
        member_email: {type: 'string', maxlength: 191, nullable: false},
        member_name: {type: 'string', maxlength: 191, nullable: true},
        '@@INDEXES@@': [
            ['email_id', 'member_email'],
            ['email_id', 'delivered_at'],
            ['email_id', 'opened_at'],
            ['email_id', 'failed_at']
        ]
    },
    email_recipient_failures: {
        id: {type: 'string', maxlength: 24, nullable: false, primary: true},
        email_id: {type: 'string', maxlength: 24, nullable: false, references: 'emails.id'},
        member_id: {type: 'string', maxlength: 24, nullable: true},
        email_recipient_id: {type: 'string', maxlength: 24, nullable: false, references: 'email_recipients.id'},
        code: {type: 'integer', nullable: false, unsigned: true},
        enhanced_code: {type: 'string', maxlength: 50, nullable: true},
        message: {type: 'string', maxlength: 2000, nullable: false},
        severity: {
            type: 'string',
            maxlength: 50,
            nullable: false,
            defaultTo: 'permanent',
            validations: {isIn: [['temporary', 'permanent']]}
        },
        failed_at: {type: 'dateTime', nullable: false},
        event_id: {type: 'string', maxlength: 255, nullable: true}
    },
    tokens: {
        id: {type: 'string', maxlength: 24, nullable: false, primary: true},
        token: {type: 'string', maxlength: 32, nullable: false, index: true},
        uuid: {type: 'string', maxlength: 36, nullable: false, unique: true, validations: {isUUID: true}},
        data: {type: 'string', maxlength: 2000, nullable: true},
        created_at: {type: 'dateTime', nullable: false},
        updated_at: {type: 'dateTime', nullable: true},
        first_used_at: {type: 'dateTime', nullable: true},
        used_count: {type: 'integer', nullable: false, unsigned: true, defaultTo: 0},
        otc_used_count: {type: 'integer', nullable: false, unsigned: true, defaultTo: 0}
    },
    snippets: {
        id: {type: 'string', maxlength: 24, nullable: false, primary: true},
        name: {type: 'string', maxlength: 191, nullable: false, unique: true},
        mobiledoc: {type: 'text', maxlength: 1000000000, fieldtype: 'long', nullable: false},
        lexical: {type: 'text', maxlength: 1000000000, fieldtype: 'long', nullable: true},
        created_at: {type: 'dateTime', nullable: false},
        updated_at: {type: 'dateTime', nullable: true}
    },
    custom_theme_settings: {
        id: {type: 'string', maxlength: 24, nullable: false, primary: true},
        theme: {type: 'string', maxlength: 191, nullable: false},
        key: {type: 'string', maxlength: 191, nullable: false},
        type: {
            type: 'string',
            maxlength: 50,
            nullable: false,
            validations: {
                isIn: [[
                    'select',
                    'boolean',
                    'color',
                    'text',
                    'image'
                ]]
            }
        },
        value: {type: 'text', maxlength: 65535, nullable: true}
    },
    // members_newsletters table removed - newsletter feature deprecated
    comments: {
        id: {type: 'string', maxlength: 24, nullable: false, primary: true},
        post_id: {type: 'string', maxlength: 24, nullable: false, unique: false, references: 'posts.id', cascadeDelete: true},
        member_id: {type: 'string', maxlength: 24, nullable: true, unique: false, references: 'members.id', setNullDelete: true},
        parent_id: {type: 'string', maxlength: 24, nullable: true, unique: false, references: 'comments.id', cascadeDelete: true},
        in_reply_to_id: {type: 'string', maxlength: 24, nullable: true, unique: false, references: 'comments.id', setNullDelete: true},
        status: {type: 'string', maxlength: 50, nullable: false, defaultTo: 'published', validations: {isIn: [['published', 'hidden', 'deleted']]}},
        html: {type: 'text', maxlength: 1000000000, fieldtype: 'long', nullable: true},
        edited_at: {type: 'dateTime', nullable: true},
        created_at: {type: 'dateTime', nullable: false},
        updated_at: {type: 'dateTime', nullable: false}
    },
    comment_likes: {
        id: {type: 'string', maxlength: 24, nullable: false, primary: true},
        comment_id: {type: 'string', maxlength: 24, nullable: false, unique: false, references: 'comments.id', cascadeDelete: true},
        member_id: {type: 'string', maxlength: 24, nullable: false, unique: false, references: 'members.id', cascadeDelete: true},
        created_at: {type: 'dateTime', nullable: false},
        updated_at: {type: 'dateTime', nullable: false}
    },
    comment_reports: {
        id: {type: 'string', maxlength: 24, nullable: false, primary: true},
        comment_id: {type: 'string', maxlength: 24, nullable: false, unique: false, references: 'comments.id', cascadeDelete: true},
        member_id: {type: 'string', maxlength: 24, nullable: true, unique: false, references: 'members.id', setNullDelete: true},
        created_at: {type: 'dateTime', nullable: false},
        updated_at: {type: 'dateTime', nullable: false}
    },
    jobs: {
        id: {type: 'string', maxlength: 24, nullable: false, primary: true},
        name: {type: 'string', maxlength: 191, nullable: false, unique: true},
        status: {type: 'string', maxlength: 50, nullable: false, defaultTo: 'queued', validations: {isIn: [['started', 'finished', 'failed', 'queued']]}},
        started_at: {type: 'dateTime', nullable: true},
        finished_at: {type: 'dateTime', nullable: true},
        created_at: {type: 'dateTime', nullable: false},
        updated_at: {type: 'dateTime', nullable: true},
        metadata: {type: 'string', maxlength: 2000, nullable: true},
        queue_entry: {type: 'integer', nullable: true, unsigned: true}
    },
    redirects: {
        id: {type: 'string', maxlength: 24, nullable: false, primary: true},
        from: {type: 'string', maxlength: 191, nullable: false, index: true},
        to: {type: 'string', maxlength: 2000, nullable: false},
        post_id: {type: 'string', maxlength: 24, nullable: true, unique: false, references: 'posts.id', setNullDelete: true},
        created_at: {type: 'dateTime', nullable: false},
        updated_at: {type: 'dateTime', nullable: true}
    },
    members_click_events: {
        id: {type: 'string', maxlength: 24, nullable: false, primary: true},
        member_id: {type: 'string', maxlength: 24, nullable: false, references: 'members.id', cascadeDelete: true},
        redirect_id: {type: 'string', maxlength: 24, nullable: false, references: 'redirects.id', cascadeDelete: true},
        created_at: {type: 'dateTime', nullable: false}
    },
    members_feedback: {
        id: {type: 'string', maxlength: 24, nullable: false, primary: true},
        score: {type: 'integer', nullable: false, unsigned: true, defaultTo: 0},
        member_id: {type: 'string', maxlength: 24, nullable: false, references: 'members.id', cascadeDelete: true},
        post_id: {type: 'string', maxlength: 24, nullable: false, references: 'posts.id', cascadeDelete: true},
        created_at: {type: 'dateTime', nullable: false},
        updated_at: {type: 'dateTime', nullable: true}
    },
    suppressions: {
        id: {type: 'string', maxlength: 24, nullable: false, primary: true},
        email: {type: 'string', maxlength: 191, nullable: false, unique: true, validations: {isEmail: true}},
        email_id: {type: 'string', maxlength: 24, nullable: true, references: 'emails.id'},
        reason: {
            type: 'string',
            maxlength: 50,
            nullable: false,
            validations: {
                isIn: [[
                    'spam',
                    'bounce'
                ]]
            }
        },
        created_at: {type: 'dateTime', nullable: false}
    },
    email_spam_complaint_events: {
        id: {type: 'string', maxlength: 24, nullable: false, primary: true},
        member_id: {type: 'string', maxlength: 24, nullable: false, references: 'members.id', cascadeDelete: true},
        email_id: {type: 'string', maxlength: 24, nullable: false, references: 'emails.id'},
        email_address: {type: 'string', maxlength: 191, nullable: false, unique: false, validations: {isEmail: true}},
        created_at: {type: 'dateTime', nullable: false},
        '@@UNIQUE_CONSTRAINTS@@': [
            ['email_id', 'member_id']
        ]
    },
    mentions: {
        id: {type: 'string', maxlength: 24, nullable: false, primary: true},
        source: {type: 'string', maxlength: 2000, nullable: false},
        source_title: {type: 'string', maxlength: 2000, nullable: true},
        source_site_title: {type: 'string', maxlength: 2000, nullable: true},
        source_excerpt: {type: 'string', maxlength: 2000, nullable: true},
        source_author: {type: 'string', maxlength: 2000, nullable: true},
        source_featured_image: {type: 'string', maxlength: 2000, nullable: true},
        source_favicon: {type: 'string', maxlength: 2000, nullable: true},
        target: {type: 'string', maxlength: 2000, nullable: false},
        resource_id: {type: 'string', maxlength: 24, nullable: true},
        resource_type: {type: 'string', maxlength: 50, nullable: true},
        created_at: {type: 'dateTime', nullable: false},
        payload: {type: 'text', maxlength: 65535, nullable: true},
        deleted: {type: 'boolean', nullable: false, defaultTo: false},
        verified: {type: 'boolean', nullable: false, defaultTo: false}
    },
    milestones: {
        id: {type: 'string', maxlength: 24, nullable: false, primary: true},
        type: {type: 'string', maxlength: 24, nullable: false},
        value: {type: 'integer', nullable: false},
        currency: {type: 'string', maxlength: 24, nullable: true},
        created_at: {type: 'dateTime', nullable: false},
        email_sent_at: {type: 'dateTime', nullable: true}
    },
    collections: {
        id: {type: 'string', maxlength: 24, nullable: false, primary: true},
        title: {type: 'string', maxlength: 191, nullable: false},
        slug: {type: 'string', maxlength: 191, nullable: false, unique: true},
        description: {type: 'string', maxlength: 2000, nullable: true},
        type: {type: 'string', maxlength: 50, nullable: false},
        filter: {type: 'text', maxlength: 1000000000, nullable: true},
        feature_image: {type: 'string', maxlength: 2000, nullable: true},
        created_at: {type: 'dateTime', nullable: false},
        updated_at: {type: 'dateTime', nullable: true}
    },
    collections_posts: {
        id: {type: 'string', maxlength: 24, nullable: false, primary: true},
        collection_id: {type: 'string', maxlength: 24, nullable: false, references: 'collections.id', cascadeDelete: true},
        post_id: {type: 'string', maxlength: 24, nullable: false, references: 'posts.id', cascadeDelete: true},
        sort_order: {type: 'integer', nullable: false, unsigned: true, defaultTo: 0}
    },
    recommendations: {
        id: {type: 'string', maxlength: 24, nullable: false, primary: true},
        url: {type: 'string', maxlength: 2000, nullable: false},
        title: {type: 'string', maxlength: 2000, nullable: false},
        excerpt: {type: 'string', maxlength: 2000, nullable: true},
        featured_image: {type: 'string', maxlength: 2000, nullable: true},
        favicon: {type: 'string', maxlength: 2000, nullable: true},
        description: {type: 'string', maxlength: 2000, nullable: true},
        one_click_subscribe: {type: 'boolean', nullable: false, defaultTo: false},
        created_at: {type: 'dateTime', nullable: false},
        updated_at: {type: 'dateTime', nullable: true}
    },
    recommendation_click_events: {
        id: {type: 'string', maxlength: 24, nullable: false, primary: true},
        recommendation_id: {type: 'string', maxlength: 24, nullable: false, references: 'recommendations.id', unique: false, cascadeDelete: true},
        member_id: {type: 'string', maxlength: 24, nullable: true, references: 'members.id', unique: false, setNullDelete: true},
        created_at: {type: 'dateTime', nullable: false}
    },
    recommendation_subscribe_events: {
        id: {type: 'string', maxlength: 24, nullable: false, primary: true},
        recommendation_id: {type: 'string', maxlength: 24, nullable: false, references: 'recommendations.id', unique: false, cascadeDelete: true},
        member_id: {type: 'string', maxlength: 24, nullable: true, references: 'members.id', unique: false, setNullDelete: true},
        created_at: {type: 'dateTime', nullable: false}
    },
    outbox: {
        id: {type: 'string', maxlength: 24, nullable: false, primary: true},
        event_type: {type: 'string', maxlength: 50, nullable: false},
        status: {type: 'string', maxlength: 50, nullable: false, defaultTo: 'pending'},
        payload: {type: 'text', maxlength: 65535, nullable: false},
        created_at: {type: 'dateTime', nullable: false},
        updated_at: {type: 'dateTime', nullable: true},
        retry_count: {type: 'integer', nullable: false, unsigned: true, defaultTo: 0},
        last_retry_at: {type: 'dateTime', nullable: true},
        message: {type: 'string', maxlength: 2000, nullable: true},
        '@@INDEXES@@': [
            ['event_type', 'status', 'created_at']
        ]
    },
    automated_emails: {
        id: {type: 'string', maxlength: 24, nullable: false, primary: true},
        status: {type: 'string', maxlength: 50, nullable: false, defaultTo: 'inactive', validations: {isIn: [['active', 'inactive']]}},
        name: {type: 'string', maxlength: 191, nullable: false, unique: true},
        slug: {type: 'string', maxlength: 191, nullable: false, unique: true},
        subject: {type: 'string', maxlength: 300, nullable: false},
        lexical: {type: 'text', maxlength: 1000000000, fieldtype: 'long', nullable: true},
        sender_name: {type: 'string', maxlength: 191, nullable: true},
        sender_email: {type: 'string', maxlength: 191, nullable: true, validations: {isEmail: true}},
        sender_reply_to: {type: 'string', maxlength: 191, nullable: true, validations: {isEmail: true}},
        created_at: {type: 'dateTime', nullable: false},
        updated_at: {type: 'dateTime', nullable: true},
        '@@INDEXES@@': [
            ['slug'],
            ['status']
        ]
    }
};
