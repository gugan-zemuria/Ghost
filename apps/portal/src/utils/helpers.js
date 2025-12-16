import {getDateString} from './date-time';

export function removePortalLinkFromUrl() {
    const [path] = window.location.hash.substr(1).split('?');
    const linkRegex = /^\/portal\/?(?:\/(\w+(?:\/\w+)*))?\/?$/;
    if (path && linkRegex.test(path)) {
        window.history.pushState('', document.title, window.location.pathname + window.location.search);
    }
}

export function getPortalLinkPath({page}) {
    const Links = {
        signin: '#/portal/signin',
        signup: '#/portal/signup'
    };
    if (Object.keys(Links).includes(page)) {
        return Links[page];
    }
    return Links.default;
}

export function getPortalLink({page, siteUrl}) {
    const url = siteUrl || `${window.location.protocol}//${window.location.host}${window.location.pathname}`;
    const portalLinkPath = getPortalLinkPath({page});
    return `${url}${portalLinkPath}`;
}

export function isCookiesDisabled() {
    return !(navigator && navigator.cookieEnabled);
}

export function isSentryEventAllowed({event: sentryEvent}) {
    const frames = sentryEvent?.exception?.values?.[0]?.stacktrace?.frames || [];
    const fileNames = frames.map(frame => frame.filename).filter(filename => !!filename);
    const lastFileName = fileNames[fileNames.length - 1] || '';
    return lastFileName.includes('@tryghost/portal');
}

// Payment functionality removed - stub functions for compatibility
export function getMemberSubscription() {
    return null; // No subscriptions in payment-free system
}

export function isComplimentaryMember() {
    return false; // No complimentary members without payments
}

export function isPaidMember() {
    return false; // All members are free members only
}

export function getCompExpiry() {
    return null; // No expiry dates without payments
}

export function subscriptionHasFreeTrial() {
    return false; // No trials without payments
}

export function allowCompMemberUpgrade() {
    return false; // No upgrades without payments
}

export function getMemberTierName() {
    return 'Free'; // All members are on free tier
}

export function hasAvailablePrices() {
    return false; // No prices without payments
}

export function getCurrencySymbol() {
    return '$'; // Default currency symbol (not used)
}

export function getUpdatedOfferPrice() {
    return null; // No offers without payments
}

// getProductCurrency function removed - payment functionality deprecated

// getNewsletterFromUuid function removed - newsletter functionality deprecated

export function hasNewsletterSendingEnabled() {
    return false; // Newsletter functionality disabled
}

// allowCompMemberUpgrade and getCompExpiry functions removed - payment functionality deprecated

// getUpgradeProducts function removed - payment functionality deprecated

// getFilteredPrices function removed - payment functionality deprecated

// getPriceFromSubscription function removed - payment functionality deprecated

// getMemberActivePrice function removed - payment functionality deprecated

// getMemberActiveProduct function removed - payment functionality deprecated

// isMemberActivePrice function removed - payment functionality deprecated

// getSubscriptionFromId function removed - payment functionality deprecated

// getMemberTierName function removed - payment functionality deprecated

export function hasOnlyFreePlan({site = {}}) {
    return true; // Always true in payment-free system
}

export function hasPrice({plan}) {
    return plan === 'free'; // Only free plan available
}

// getCheckoutSessionDataFromPlanAttribute function removed - payment functionality deprecated

export function getQueryPrice({priceId}) {
    return priceId === 'free' ? {type: 'free'} : null; // Only free plan available
}

export function capitalize(str) {
    if (typeof str !== 'string' || !str) {
        return '';
    }
    return str.charAt(0).toUpperCase() + str.slice(1);
}

export function isPaidMembersOnly({site}) {
    return site?.members_signup_access === 'paid';
}

export function isInviteOnly({site = {}}) {
    return site?.members_signup_access === 'invite';
}

// hasAvailablePrices function moved to stub section above

export function hasRecommendations({site}) {
    return site?.recommendations_enabled === true;
}

export function isSigninAllowed({site}) {
    return site?.members_signup_access !== 'none';
}

export function isSignupAllowed({site}) {
    const hasSignupAccess = site?.members_signup_access === 'all' || site?.members_signup_access === 'paid';
    const hasSignupConfigured = site?.is_stripe_configured || hasOnlyFreePlan({site});

    return hasSignupAccess && hasSignupConfigured;
}

export function isFreeSignupAllowed({site}) {
    return site?.members_signup_access === 'all';
}

export function hasMultipleProducts() {
    return false; // No paid products in payment-free system
}

export function getRefDomain() {
    const referrerSource = window.location.hostname.replace(/^www\./, '');
    return referrerSource;
}

export function hasMultipleProductsFeature() {
    return false; // No paid products in payment-free system
}

export function hasCommentsEnabled({site}) {
    return site?.comments_enabled && site?.comments_enabled !== 'off';
}

export function transformApiSiteData({site}) {
    try {
        if (!site) {
            return null;
        }

        if (site.tiers) {
            site.products = site.tiers;
        }

        site.products = site.products?.map((product) => {
            return {
                ...product,
                monthlyPrice: product.monthly_price,
                yearlyPrice: product.yearly_price
            };
        });

        site.is_stripe_configured = !!site.paid_members_enabled;

        // Map tier visibility to old settings
        if (site.products?.[0]?.visibility) {
        // Map paid tier visibility to portal products
            site.portal_products = site.products.filter((p) => {
                return p.visibility !== 'none' && p.type === 'paid';
            }).map(p => p.id);

            // Map free tier visibility to portal plans
            const freeProduct = site.products.find(p => p.type === 'free');
            if (freeProduct) {
                site.portal_plans = site.portal_plans?.filter(d => d !== 'free');
                if (freeProduct?.visibility === 'public') {
                    site.portal_plans?.push('free');
                }
            }
        }

        return site;
    } catch (error) {
        /* eslint-disable no-console */
        console.warn(`[Portal] Failed to read site data:`, error);
    }
}

export function getAvailableProducts() {
    return []; // No paid products in payment-free system
}

export function getFreeProduct({site}) {
    const {products = []} = site || {};
    return products.find(product => product.type === 'free');
}

export function getAllProductsForSite() {
    return []; // No paid products in payment-free system
}

export function hasBenefits() {
    return false; // No paid products with benefits in payment-free system
}

export function getSiteProducts({site}) {
    if (hasFreeProductPrice({site})) {
        return [{
            id: 'free',
            type: 'free'
        }];
    }
    return [];
}

export function hasFreeTrialTier() {
    return false; // No trials in payment-free system
}

export function getFreeProductBenefits({site}) {
    const freeProduct = getFreeProduct({site});
    return freeProduct?.benefits || [];
}

export function getFreeTierTitle({site}) {
    const freeProduct = getFreeProduct({site});
    return freeProduct?.name || 'Free';
}

export function getFreeTierDescription({site}) {
    const freeProduct = getFreeProduct({site});
    return freeProduct?.description;
}

export function freeHasBenefitsOrDescription({site}) {
    const freeProduct = getFreeProduct({site});

    if (freeProduct?.description || freeProduct?.benefits?.length) {
        return true;
    }
    return false;
}

export function getProductBenefits() {
    return null; // No paid product benefits in payment-free system
}

export function getProductFromId({site, productId}) {
    if (productId === 'free') {
        return getFreeProduct({site});
    }
    return null; // No paid products in payment-free system
}

export function getPricesFromProducts() {
    return []; // No paid product prices in payment-free system
}

export function hasFreeProductPrice({site}) {
    const {portal_plans: portalPlans} = site || {};

    return isFreeSignupAllowed({site}) && portalPlans.includes('free');
}

export function getSiteNewsletters() {
    return []; // No newsletters in simplified system
}

export function hasMultipleNewsletters() {
    return false; // No newsletters in simplified system
}

export function isEmailSuppressed({member}) {
    return member?.email_suppression?.suppressed;
}

export function hasOnlyFreeProduct({site}) {
    return hasFreeProductPrice({site}); // Only free product available
}

// getSubFreeTrialDaysLeft function removed - payment functionality deprecated

// subscriptionHasFreeTrial function moved to stub section above

export function isInThePast(date) {
    return date < new Date();
}

export function getProductFromPrice({site, priceId}) {
    if (priceId === 'free') {
        return getFreeProduct({site});
    }
    return null; // No paid products in payment-free system
}

export function getProductCadenceFromPrice({site, priceId}) {
    if (priceId === 'free') {
        const freeProduct = getFreeProduct({site});
        return {
            tierId: freeProduct?.id,
            cadence: null
        };
    }
    return null; // No paid products in payment-free system
}

export function getAvailablePrices() {
    return []; // No paid prices in payment-free system
}

export function getFreePriceCurrency() {
    return {
        currency: 'usd',
        currency_symbol: '$'
    }; // Default currency for free tier
}

export function getSitePrices({site = {}} = {}) {
    const plansData = [];

    if (hasFreeProductPrice({site})) {
        const freePriceCurrencyDetail = getFreePriceCurrency();
        plansData.push({
            id: 'free',
            type: 'free',
            price: 0,
            amount: 0,
            name: getFreeTierTitle({site}),
            ...freePriceCurrencyDetail
        });
    }

    return plansData; // Only free plan available
}

export const getMemberEmail = ({member}) => {
    if (!member) {
        return '';
    }
    return member.email;
};

export const hasMemberGotEmailSuppression = ({member}) => {
    if (!member) {
        return '';
    }
    return member.email_suppression;
};

export const getFirstpromoterId = ({site}) => {
    return (site && site.firstpromoter_account);
};

export const getMemberName = ({member}) => {
    if (!member) {
        return '';
    }
    return member.name || member.email;
};

export const getSupportAddress = ({site}) => {
    const {members_support_address: oldSupportAddress, support_email_address: supportAddress, membersSupportAddress} = site || {};

    // If available, use the calculated setting support_email_address
    if (supportAddress) {
        return supportAddress;
    }

    // Check for camelCase version (used in tests)
    if (membersSupportAddress) {
        return membersSupportAddress;
    }

    // Deprecated: use the saved setting members_support_address
    if (oldSupportAddress?.indexOf('@') < 0) {
        const siteDomain = getSiteDomain({site});
        const updatedDomain = siteDomain?.replace(/^(www)\.(?=[^/]*\..{2,5})/, '') || '';
        return `${oldSupportAddress}@${updatedDomain}`;
    }

    if (oldSupportAddress?.split('@')?.length > 1) {
        const [recipient, domain] = oldSupportAddress.split('@');
        const updatedDomain = domain?.replace(/^(www)\.(?=[^/]*\..{2,5})/, '') || '';
        return `${recipient}@${updatedDomain}`;
    }

    return oldSupportAddress || '';
};

export const getDefaultNewsletterSender = ({site}) => {
    const {default_email_address: defaultEmailAddress} = site || {};
    return defaultEmailAddress || `noreply@${getSiteDomain({site})}`;
};

export const getSiteDomain = ({site}) => {
    try {
        return ((new URL(site.url)).origin).replace(/^http(s?):\/\//, '').replace(/\/$/, '');
    } catch (e) {
        return site.url.replace(/^http(s?):\/\//, '').replace(/\/$/, '');
    }
};

// getCurrencySymbol function moved to stub section above

// Payment functions removed - no longer needed without Stripe integration

export const formatNumber = (amount) => {
    if (amount === undefined || amount === null) {
        return '';
    }
    return amount.toLocaleString();
};

export const createPopupNotification = ({type, status, autoHide, duration = 2600, closeable, state, message, meta = {}}) => {
    let count = 0;
    if (state && state.popupNotification) {
        count = (state.popupNotification.count || 0) + 1;
    }
    return {
        type,
        status,
        autoHide,
        closeable,
        duration,
        meta,
        message,
        count
    };
};

export function isSameCurrency(currency1, currency2) {
    return currency1?.toLowerCase() === currency2?.toLowerCase();
}

export function getPriceIdFromPageQuery() {
    return null; // No paid prices in payment-free system
}

// getOfferOffAmount function removed - payment functionality deprecated

// getUpdatedOfferPrice function moved to stub section above

export const isActiveOffer = () => {
    return false; // No offers in payment-free system
};

// Price creation and tier transformation functions removed - payment functionality deprecated

export const transformApiTiersData = ({tiers}) => {
    return tiers.filter(tier => tier.type === 'free').map((tier) => {
        return {
            ...tier,
            benefits: tier?.benefits?.map(benefit => ({name: benefit})) || []
        };
    });
};

/**
 * Returns the member attribution URL history, which is stored in sessionStorage, if there is any.
 * @warning If you make changes here, please also update the one in signup-form!
 * @returns {Object[]|undefined}
 */
export function getUrlHistory() {
    const STORAGE_KEY = 'ghost-history';

    try {
        const historyString = sessionStorage.getItem(STORAGE_KEY);
        if (historyString) {
            const parsed = JSON.parse(historyString);

            if (Array.isArray(parsed)) {
                return parsed;
            }
        }
    } catch (error) {
        // Failed to access sessionStorage or something related to that.
        // Log a warning, as this shouldn't happen on a modern browser.

        /* eslint-disable no-console */
        console.warn(`[Portal] Failed to load member URL history:`, error);
    }
    
    // Return empty array if no history found or error occurred
    return [];
}

// Check if member is a recent member, i.e. created in last 24 hours
export function isRecentMember({member}) {
    if (!member?.created_at) {
        return false;
    }

    const now = new Date();
    const created = new Date(member.created_at);
    const diff = now.getTime() - created.getTime();
    const diffHours = Math.round(diff / (1000 * 60 * 60));

    return diffHours < 24;
}
