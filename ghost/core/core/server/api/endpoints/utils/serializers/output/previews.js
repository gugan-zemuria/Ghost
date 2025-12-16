const mappers = require('./mappers');

module.exports = {
    async all(model, apiConfig, frame) {
        // Payment feature removed - tiers no longer available
        const tiers = [];

        const data = await mappers.posts(model, frame, {tiers});
        frame.response = {
            previews: [data]
        };
        frame.response.previews[0].type = model.get('type');
    }
};
