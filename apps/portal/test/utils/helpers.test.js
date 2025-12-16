import {getFreeProduct, getMemberName, getSupportAddress, getDefaultNewsletterSender, getUrlHistory, isInviteOnly, isSigninAllowed, isSignupAllowed} from '../../src/utils/helpers';
import * as Fixtures from '../../src/utils/fixtures-generator';
import {site as FixturesSite, member as FixtureMember, transformTierFixture as TransformFixtureTiers} from './test-fixtures';

describe('Helpers - ', () => {
    // Only free member and basic functionality tests - payment functionality removed

    describe('getMemberName -', () => {
        test('returns name if available', () => {
            const member = FixtureMember.free;
            const value = getMemberName({member});
            expect(value).toBe(member.name);
        });

        test('returns email if name not available', () => {
            const member = {...FixtureMember.free, name: null};
            const value = getMemberName({member});
            expect(value).toBe(member.email);
        });
    });

    describe('getFreeProduct -', () => {
        test('returns free product from site', () => {
            const site = FixturesSite.singleTier.basic;
            const freeProduct = getFreeProduct({site});
            expect(freeProduct).toBeDefined();
            expect(freeProduct.type).toBe('free');
        });
    });

    describe('isInviteOnly - ', () => {
        test('returns true for invite-only site', () => {
            const site = {...FixturesSite.singleTier.basic, members_signup_access: 'invite'};
            const isInviteOnlyCheck = isInviteOnly({site});
            expect(isInviteOnlyCheck).toBe(true);
        });

        test('returns false for open signup site', () => {
            const site = {...FixturesSite.singleTier.basic, members_signup_access: 'all'};
            const isInviteOnlyCheck = isInviteOnly({site});
            expect(isInviteOnlyCheck).toBe(false);
        });
    });

    describe('isSigninAllowed - ', () => {
        test('returns true when signin is allowed', () => {
            const site = FixturesSite.singleTier.basic;
            const isSigninAllowedCheck = isSigninAllowed({site});
            expect(isSigninAllowedCheck).toBe(true);
        });
    });

    describe('isSignupAllowed - ', () => {
        test('returns true when signup is allowed for free members', () => {
            const site = FixturesSite.singleTier.basic;
            const isSignupAllowedCheck = isSignupAllowed({site});
            expect(isSignupAllowedCheck).toBe(true);
        });

        test('returns false when signup is disabled', () => {
            const site = {...FixturesSite.singleTier.basic, members_signup_access: 'none'};
            const isSignupAllowedCheck = isSignupAllowed({site});
            expect(isSignupAllowedCheck).toBe(false);
        });
    });

    describe('getSupportAddress - ', () => {
        test('returns support address from site', () => {
            const site = FixturesSite.singleTier.basic;
            const supportAddress = getSupportAddress({site});
            expect(supportAddress).toBe(site.membersSupportAddress);
        });
    });

    describe('getDefaultNewsletterSender - ', () => {
        test('returns default newsletter sender', () => {
            const site = FixturesSite.singleTier.basic;
            const sender = getDefaultNewsletterSender({site});
            expect(sender).toBeDefined();
        });
    });

    // Newsletter functionality tests removed - feature deprecated

    describe('getUrlHistory - ', () => {
        test('returns url history array', () => {
            const history = getUrlHistory();
            expect(Array.isArray(history)).toBe(true);
        });
    });
});