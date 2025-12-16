import {HumanReadableError} from './errors';
import {transformApiSiteData, transformApiTiersData, getUrlHistory} from './helpers';

function setupGhostApi({siteUrl = window.location.origin, apiUrl, apiKey}) {
    const apiPath = 'members/api';

    function endpointFor({type, resource}) {
        if (type === 'members') {
            return `${siteUrl.replace(/\/$/, '')}/${apiPath}/${resource}/`;
        }
    }

    function contentEndpointFor({resource, params = {}}) {
        if (apiUrl && apiKey) {
            const searchParams = new URLSearchParams({
                ...params,
                key: apiKey
            });
            return `${apiUrl.replace(/\/$/, '')}/${resource}/?${searchParams.toString()}`;
        }
        return '';
    }

    function makeRequest({url, method = 'GET', headers = {}, credentials = undefined, body = undefined}) {
        const options = {
            method,
            headers,
            credentials,
            body
        };
        return fetch(url, options);
    }
    const api = {};

    api.site = {
        read() {
            const url = endpointFor({type: 'members', resource: 'site'});
            return makeRequest({
                url,
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            }).then(function (res) {
                if (res.ok) {
                    return res.json();
                } else {
                    throw new Error('Failed to fetch site data');
                }
            });
        },



        tiers() {
            const url = contentEndpointFor({resource: 'tiers', params: {limit: 100, include: 'monthly_price,yearly_price,benefits'}});
            return makeRequest({
                url,
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            }).then(function (res) {
                if (res.ok) {
                    return res.json();
                } else {
                    throw new Error('Failed to fetch site data');
                }
            });
        },

        settings() {
            const url = contentEndpointFor({resource: 'settings'});
            return makeRequest({
                url,
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            }).then(function (res) {
                if (res.ok) {
                    return res.json();
                } else {
                    throw new Error('Failed to fetch site data');
                }
            });
        },

        offer({offerId}) {
            const url = contentEndpointFor({resource: `offers/${offerId}`});
            return makeRequest({
                url,
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            }).then(function (res) {
                if (res.ok) {
                    return res.json();
                } else {
                    throw new Error('Failed to fetch offer data');
                }
            });
        },

        recommendations({limit = 100} = {limit: 100}) {
            const url = contentEndpointFor({resource: 'recommendations', params: {limit}});
            return makeRequest({
                url,
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            }).then(function (res) {
                if (res.ok) {
                    return res.json();
                } else {
                    throw new Error('Failed to fetch recommendations');
                }
            });
        }
    };

    api.feedback = {
        async add({uuid, key, postId, score}) {
            let url = endpointFor({type: 'members', resource: 'feedback'});
            if (uuid && key) { // only necessary if not logged in, and both are required if so
                url = url + `?uuid=${uuid}&key=${key}`;
            }
            const body = {
                feedback: [
                    {
                        post_id: postId,
                        score
                    }
                ]
            };
            const res = await makeRequest({
                url,
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'same-origin',
                body: JSON.stringify(body)
            });
            if (res.ok) {
                return res.json();
            } else {
                throw (await HumanReadableError.fromApiResponse(res)) ?? new Error('Failed to save feedback');
            }
        }
    };

    api.recommendations = {
        trackClicked({recommendationId}) {
            let url = endpointFor({type: 'members', resource: 'recommendations/' + recommendationId + '/clicked'});
            navigator.sendBeacon(url);
        },

        trackSubscribed({recommendationId}) {
            let url = endpointFor({type: 'members', resource: 'recommendations/' + recommendationId + '/subscribed'});
            navigator.sendBeacon(url);
        }
    };

    api.member = {
        identity() {
            const url = endpointFor({type: 'members', resource: 'session'});
            return makeRequest({
                url,
                credentials: 'same-origin'
            }).then(function (res) {
                if (!res.ok || res.status === 204) {
                    return null;
                }
                return res.text();
            });
        },

        sessionData() {
            const url = endpointFor({type: 'members', resource: 'member'});
            return makeRequest({
                url,
                credentials: 'same-origin'
            }).then(function (res) {
                if (!res.ok || res.status === 204) {
                    return null;
                }
                return res.json();
            });
        },

        update({name, subscribed, enableCommentNotifications}) {
            const url = endpointFor({type: 'members', resource: 'member'});
            const body = {
                name,
                subscribed
            };
            if (enableCommentNotifications !== undefined) {
                body.enable_comment_notifications = enableCommentNotifications;
            }

            return makeRequest({
                url,
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'same-origin',
                body: JSON.stringify(body)
            }).then(function (res) {
                if (!res.ok) {
                    return null;
                }
                return res.json();
            });
        },

        deleteSuppression() {
            const url = endpointFor({type: 'members', resource: 'member/suppression'});

            return makeRequest({
                url,
                method: 'DELETE'
            }).then(function (res) {
                if (!res.ok) {
                    throw new Error('Your email has failed to resubscribe, please try again');
                }
                return true;
            });
        },

        async getIntegrityToken() {
            const url = endpointFor({type: 'members', resource: 'integrity-token'});
            const res = await makeRequest({
                url,
                method: 'GET'
            });

            if (res.ok) {
                return res.text();
            } else {
                const humanError = await HumanReadableError.fromApiResponse(res);
                if (humanError) {
                    throw humanError;
                }
                throw new Error('Failed to start a members session');
            }
        },

        async sendMagicLink({email, emailType, labels, name, oldEmail, redirect, integrityToken, phonenumber, customUrlHistory, token, autoRedirect = true, includeOTC}) {
            const url = endpointFor({type: 'members', resource: 'send-magic-link'});
            const body = {
                name,
                email,
                oldEmail,
                emailType,
                labels,
                requestSrc: 'portal',
                redirect,
                integrityToken,
                // we don't actually use a phone #, this is from a hidden field to prevent bot activity
                honeypot: phonenumber,
                token,
                autoRedirect,
                includeOTC
            };
            const urlHistory = customUrlHistory ?? getUrlHistory();
            if (urlHistory) {
                body.urlHistory = urlHistory;
            }

            const res = await makeRequest({
                url,
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(body)
            });

            if (res.ok) {
                const contentType = (res.headers.get('content-type') || '').toLowerCase();
                if (contentType.includes('application/json')) {
                    try {
                        return await res.json();
                    } catch (e) {
                        // fall through to response used pre-OTC
                    }
                }
                return 'Success';
            } else {
                const humanError = await HumanReadableError.fromApiResponse(res);
                if (humanError) {
                    throw humanError;
                }
                throw new Error('Failed to send magic link email');
            }
        },

        async verifyOTC({otc, otcRef, redirect, integrityToken}) {
            const url = endpointFor({type: 'members', resource: 'verify-otc'});
            const body = {
                otc,
                otcRef,
                redirect,
                integrityToken
            };

            const res = await makeRequest({
                url,
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(body)
            });

            if (res.ok) {
                return await res.json();
            } else {
                const humanError = await HumanReadableError.fromApiResponse(res);
                if (humanError) {
                    throw humanError;
                }
                throw new Error('Failed to verify code');
            }
        },

        signout(all = false) {
            const url = endpointFor({type: 'members', resource: 'session'});
            return makeRequest({
                url,
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    all
                })
            }).then(function (res) {
                if (res.ok) {
                    window.location.replace(siteUrl);
                    return 'Success';
                } else {
                    throw new Error('Failed to signout');
                }
            });
        },



        async updateEmailAddress({email}) {
            const identity = await api.member.identity();
            const url = endpointFor({type: 'members', resource: 'member/email'});
            const body = {
                email,
                identity
            };

            return makeRequest({
                url,
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(body)
            }).then(async function (res) {
                if (res.ok) {
                    return 'Success';
                } else {
                    const errData = await res.json();
                    const errMssg = errData?.errors?.[0]?.message || 'Failed to send email address verification email';
                    throw new Error(errMssg);
                }
            });
        },

        // checkoutPlan method removed - payment functionality deprecated

        // checkoutDonation method removed - payment functionality deprecated

        // editBilling method removed - payment functionality deprecated

        // updateSubscription method removed - payment functionality deprecated
    };

    api.init = async () => {
        let [member] = await Promise.all([
            api.member.sessionData()
        ]);
        let site = {};
        let tiers = [];
        let settings = {};

        try {
            [{settings}, {tiers}] = await Promise.all([
                api.site.settings(),
                api.site.tiers()
            ]);
            site = {
                ...settings,
                newsletters: [], // No newsletters in simplified system
                tiers: transformApiTiersData({tiers})
            };
        } catch (e) {
            // Ignore
        }

        site = transformApiSiteData({site});

        return {site, member};
    };

    return api;
}

export default setupGhostApi;
