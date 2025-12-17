import Service, {inject as service} from '@ember/service';
import {inject} from 'ghost-admin/decorators/inject';

export default class MembersUtilsService extends Service {
    @service settings;
    @service feature;
    @service session;
    @service store;

    @inject config;

    paidTiers = null;

    get isMembersEnabled() {
        return this.settings.membersEnabled;
    }

    get paidMembersEnabled() {
        return this.settings.paidMembersEnabled;
    }

    get isMembersInviteOnly() {
        return this.settings.membersInviteOnly;
    }

    get hasMultipleTiers() {
        return this.paidMembersEnabled && this.paidTiers && this.paidTiers.length > 1;
    }

    get hasActiveTiers() {
        return this.paidMembersEnabled && this.paidTiers && this.paidTiers.length > 0;
    }

    async fetch() {
        if (this.paidTiers !== null) {
            return;
        }

        // Tiers functionality has been removed - set empty array
        this.paidTiers = [];
    }

    async reload() {
        // Tiers functionality has been removed - set empty array
        this.paidTiers = [];
    }

    /**
     * Note: always use paidMembersEnabled! Only use this getter for the Stripe Connection UI.
     */
    get isStripeEnabled() {
        const stripeDirect = this.config.stripeDirect;

        const hasDirectKeys = !!this.settings.stripeSecretKey && !!this.settings.stripePublishableKey;
        const hasConnectKeys = !!this.settings.stripeConnectSecretKey && !!this.settings.stripeConnectPublishableKey;

        if (stripeDirect) {
            return hasDirectKeys;
        }

        return hasConnectKeys || hasDirectKeys;
    }

    // Plan helpers ------------------------------------------------------------

    get isFreeChecked() {
        const allowedPlans = this.settings.portalPlans || [];
        return !!(this.settings.membersSignupAccess === 'all' && allowedPlans.includes('free'));
    }

    get isMonthlyChecked() {
        const allowedPlans = this.settings.portalPlans || [];
        return !!(this.isStripeConfigured && allowedPlans.includes('monthly'));
    }

    get isYearlyChecked() {
        const allowedPlans = this.settings.portalPlans || [];
        return !!(this.isStripeConfigured && allowedPlans.includes('yearly'));
    }
}
