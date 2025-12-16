const _ = require('lodash');
const models = require('../../models');
const routeSettings = require('../../services/route-settings');
const {BadRequestError} = require('@tryghost/errors');
const settingsService = require('../../services/settings/settings-service');
const membersService = require('../../services/members');
const settingsBREADService = settingsService.getSettingsBREADServiceInstance();

async function getStripeConnectData(frame) {
    const stripeConnectIntegrationToken = frame.data.settings.find(setting => setting.key === 'stripe_connect_integration_token');

    if (stripeConnectIntegrationToken && stripeConnectIntegrationToken.value) {
        const getSessionProp = prop => frame.original.session[prop];

        return await settingsBREADService.getStripeConnectData(
            stripeConnectIntegrationToken,
            getSessionProp,
            membersService.stripeConnect.getStripeConnectTokenData
        );
    }
}

/** @type {import('@tryghost/api-framework').Controller} */
const controller = {
    docName: 'settings',

    browse: {
        headers: {
            cacheInvalidate: false
        },
        options: ['group'],
        permissions: true,
        query(frame) {
            return settingsBREADService.browse(frame.options.context);
        }
    },

    read: {
        headers: {
            cacheInvalidate: false
        },
        options: ['key'],
        validation: {
            options: {
                key: {
                    required: true
                }
            }
        },
        permissions: {
            identifier(frame) {
                return frame.options.key;
            }
        },
        query(frame) {
            return settingsBREADService.read(frame.options.key, frame.options.context);
        }
    },

    verifyKeyUpdate: {
        headers: {
            cacheInvalidate: true
        },
        permissions: {
            method: 'edit'
        },
        data: [
            'token'
        ],
        async query(frame) {
            await settingsBREADService.verifyKeyUpdate(frame.data.token);

            // We need to return all settings here, because we have calculated settings that might change
            const browse = await settingsBREADService.browse(frame.options.context);

            return browse;
        }
    },

    edit: {
        headers: {
            cacheInvalidate: false
        },
        permissions: {
            unsafeAttrsObject(frame) {
                return _.find(frame.data.settings, {key: 'labs'});
            }
        },
        async query(frame) {
            let stripeConnectData = await getStripeConnectData(frame);

            let result = await settingsBREADService.edit(frame.data.settings, frame.options, stripeConnectData);

            if (!_.isEmpty(result)) {
                frame.setHeader('X-Cache-Invalidate', '/*');
            }

            // We need to return all settings here, because we have calculated settings that might change
            const browse = await settingsBREADService.browse(frame.options.context);
            browse.meta = result.meta || {};

            return browse;
        }
    },

    upload: {
        headers: {
            cacheInvalidate: true
        },
        permissions: {
            method: 'edit'
        },
        async query(frame) {
            await routeSettings.api.setFromFilePath(frame.file.path);
            const getRoutesHash = () => routeSettings.api.getCurrentHash();
            await settingsService.syncRoutesHash(getRoutesHash);
        }
    },

    download: {
        headers: {
            disposition: {
                type: 'yaml',
                value: 'routes.yaml'
            },
            cacheInvalidate: false
        },
        response: {
            format: 'plain'
        },
        permissions: {
            method: 'browse'
        },
        query() {
            return routeSettings.api.get();
        }
    }
};

module.exports = controller;
