import AppContext from '../../../../app-context';
import ActionButton from '../../../common/action-button';
import {isSignupAllowed} from '../../../../utils/helpers';
import {useContext} from 'react';
import {t} from '../../../../utils/i18n';

const SubscribeButton = () => {
    const {site, action, brandColor, doAction} = useContext(AppContext);

    if (!isSignupAllowed({site})) {
        return null;
    }
    const isRunning = ['signup:running'].includes(action);

    const openSignupPage = () => {
        doAction('switchPage', {
            page: 'signup',
            lastPage: 'accountHome'
        });
    };
    return (
        <ActionButton
            dataTestId={'subscribe-free'}
            isRunning={isRunning}
            label={t('Subscribe for free')}
            onClick={() => openSignupPage()}
            brandColor={brandColor}
            style={{width: '100%'}}
        />
    );
};

export default SubscribeButton;
