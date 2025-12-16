const tpl = require('@tryghost/tpl');
const errors = require('@tryghost/errors');

const messages = {
    tierNotFound: 'Tier not found.'
};

/** @type {import('@tryghost/api-framework').Controller} */
module.exports = {
    docName: 'tiers',
    browse: {
        headers: {
            cacheInvalidate: false
        },
        options: [
            'include',
            'filter',
            'fields',
            'limit',
            'order',
            'page',
            'debug'
        ],
        validation: {
            options: {
                include: {
                    values: ['monthly_price', 'yearly_price', 'benefits']
                }
            }
        },
        permissions: false,
        query(frame) {
            // Return empty tiers array since payment functionality is disabled
            // Return in the format that Ghost's serializer expects
            return Promise.resolve({
                data: [],
                meta: {
                    pagination: {
                        page: frame.options.page || 1,
                        limit: frame.options.limit || 15,
                        pages: 1,
                        total: 0,
                        next: null,
                        prev: null
                    }
                }
            });
        }
    },
    read: {
        headers: {
            cacheInvalidate: false
        },
        options: [
            'include',
            'filter',
            'fields',
            'debug'
        ],
        data: [
            'id',
            'slug'
        ],
        validation: {
            options: {
                include: {
                    values: ['monthly_price', 'yearly_price', 'benefits']
                }
            }
        },
        permissions: false,
        async query() {
            // Return 404 for individual tier reads since no tiers exist
            throw new errors.NotFoundError({
                message: tpl(messages.tierNotFound)
            });
        }
    }
};