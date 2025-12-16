import React from 'react';
import {render} from 'react-dom';
import {hasMode} from './utils/check-mode';
import {transformPortalAnchorToRelative} from './utils/transform-portal-anchor-to-relative';
import {getActivePage} from './pages';
import ActionHandler from './actions';
import './app.css';
import {createPopupNotification, getSiteDomain, isInviteOnly, isRecentMember, isSentryEventAllowed, removePortalLinkFromUrl} from './utils/helpers';
import {handleDataAttributes} from './data-attributes';

const DEV_MODE_DATA = {
    showPopup: true,
    site: Fixtures.site,
    member: Fixtures.member.free,
    page: 'accountEmail'
};

function AuthContextProvider({children}) {
    const [state, setState] = React.useState({
        member: null,
        action: 'init:running',
        initStatus: 'running'
    });

    return (
        <AuthContext.Provider value={[state, setState]}>
            {children}
        </AuthContext.Provider>
    );
}

function App({customSiteUrl}) {
    const [state, setState] = React.useState({
        showPopup: false,
        action: 'init:running',
        initStatus: 'running',
        site: null,
        member: null,
        page: 'signup',
        pageQuery: '',
        pageData: {},
        popupNotification: null,
        lastPage: null
    });

    const ActionHandlerRef = React.useRef(null);
    const [hasLoaded, setHasLoaded] = React.useState(false);

    // Simplified initialization - no payment data needed
    const initializeApp = async () => {
        try {
            const {site, member} = await ActionHandlerRef.current.initializeApi();
            
            setState(prevState => ({
                ...prevState,
                site,
                member,
                action: 'init:success',
                initStatus: 'success',
                showPopup: false
            }));
            
            setHasLoaded(true);
        } catch (error) {
            setState(prevState => ({
                ...prevState,
                action: 'init:failed',
                initStatus: 'failed'
            }));
        }
    };

    React.useEffect(() => {
        ActionHandlerRef.current = new ActionHandler({
            state,
            api: {
                site: {
                    read: () => fetch('/ghost/api/content/site/').then(res => res.json())
                },
                member: {
                    identity: () => fetch('/members/api/session').then(res => res.json()),
                    update: (data) => fetch('/members/api/member', {
                        method: 'PUT',
                        headers: {'Content-Type': 'application/json'},
                        body: JSON.stringify(data)
                    }).then(res => res.json()),
                    sendMagicLink: (data) => fetch('/members/api/send-magic-link', {
                        method: 'POST',
                        headers: {'Content-Type': 'application/json'},
                        body: JSON.stringify(data)
                    }).then(res => res.json()),
                    signout: () => fetch('/members/api/session', {method: 'DELETE'})
                }
            },
            dispatchAction: (action, data) => {
                setState(prevState => ({
                    ...prevState,
                    action,
                    ...data
                }));
            }
        });

        initializeApp();
    }, []);

    const getContextPage = ({site, page, member}) => {
        if (!page || page === 'default') {
            const loggedOutPage = isInviteOnly({site}) ? 'signin' : 'signup';
            page = member ? 'accountHome' : loggedOutPage;
        }

        // Remove payment-related pages
        if (['accountPlan', 'checkout', 'offer'].includes(page)) {
            page = member ? 'accountHome' : 'signup';
        }

        return page;
    };

    const {site, member, page, pageQuery, pageData, popupNotification} = state;
    
    if (!hasLoaded) {
        return <div>Loading...</div>;
    }

    const contextPage = getContextPage({site, page, member});
    
    return (
        <AuthContextProvider>
            <div className="gh-portal-root">
                {getActivePage({
                    page: contextPage,
                    site,
                    member,
                    pageQuery,
                    pageData,
                    popupNotification,
                    onAction: ActionHandlerRef.current?.dispatchAction
                })}
            </div>
        </AuthContextProvider>
    );
}

export default App;