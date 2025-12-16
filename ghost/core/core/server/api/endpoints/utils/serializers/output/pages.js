const debug = require('@tryghost/debug')('api:endpoints:utils:serializers:output:pages');
const mappers = require('./mappers');

module.exports = {
    async all(models, apiConfig, frame) {
        debug('all');

        // CASE: e.g. destroy returns null
        if (!models) {
            return;
        }
        let pages = [];

        // Payment feature removed - tiers no longer available
        const tiers = [];

        if (models.meta) {
            for (let model of models.data) {
                let page = await mappers.pages(model, frame, {tiers});
                pages.push(page);
            }
            frame.response = {
                pages,
                meta: models.meta
            };

            return;
        }
        let page = await mappers.pages(models, frame, {tiers});
        frame.response = {
            pages: [page]
        };
    },

    bulkEdit(bulkActionResult, _apiConfig, frame) {
        frame.response = {
            bulk: {
                action: frame.data.action,
                meta: {
                    stats: {
                        successful: bulkActionResult.successful,
                        unsuccessful: bulkActionResult.unsuccessful
                    },
                    errors: bulkActionResult.errors,
                    unsuccessfulData: bulkActionResult.unsuccessfulData
                }
            }
        };
    },

    bulkDestroy(bulkActionResult, _apiConfig, frame) {
        frame.response = {
            bulk: {
                meta: {
                    stats: {
                        successful: bulkActionResult.successful,
                        unsuccessful: bulkActionResult.unsuccessful
                    },
                    errors: bulkActionResult.errors
                }
            }
        };
    }
};
