
import SigninPage from './components/pages/signin-page';
import SignupPage from './components/pages/signup-page';
import AccountHomePage from './components/pages/AccountHomePage/account-home-page';
import MagicLinkPage from './components/pages/magic-link-page';
import LoadingPage from './components/pages/loading-page';
import AccountProfilePage from './components/pages/account-profile-page';
// Newsletter and email page imports removed - functionality deprecated
import FeedbackPage from './components/pages/feedback-page';
import RecommendationsPage from './components/pages/recommendations-page';

/** List of all available pages in Portal, mapped to their UI component
 * Any new page added to portal needs to be mapped here
*/
const Pages = {
    signin: SigninPage,
    signup: SignupPage,
    accountHome: AccountHomePage,
    accountProfile: AccountProfilePage,
    // Newsletter and email pages removed - functionality deprecated
    magiclink: MagicLinkPage,
    loading: LoadingPage,
    feedback: FeedbackPage,
    recommendations: RecommendationsPage
};

/** Return page if valid, fallback to signup */
export const getActivePage = function ({page}) {
    if (Object.keys(Pages).includes(page)) {
        return page;
    }
    return 'signup';
};

export const isAccountPage = function ({page}) {
    return page.includes('account');
};

export const isOfferPage = function () {
    return false; // No offer pages without payment functionality
};

// Payment and newsletter page helpers removed

export default Pages;
