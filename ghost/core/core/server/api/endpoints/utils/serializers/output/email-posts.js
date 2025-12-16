const mappers = require('./mappers');
const gating = require('./utils/post-gating');

module.exports = {
    async read(model, apiConfig, frame) {
        // Payment feature removed - tiers no longer available
        const tiers = [];
        const emailPost = await mappers.posts(model, frame, {tiers});
        gating.forPost(emailPost, frame);

        frame.response = {
            email_posts: [emailPost]
        };
    }
};
