import AppContext from '../../../../app-context';
// Payment-related helper functions removed
import {getDateString} from '../../../../utils/date-time';
import {useContext} from 'react';

// SubscribeButton removed - payment functionality deprecated
import {t} from '../../../../utils/i18n';

const AccountWelcome = () => {
    const {member} = useContext(AppContext);

    // Simplified welcome for free members only - payment functionality removed
    if (!member) {
        return null;
    }

    return (
        <div className='gh-portal-section'>
            <p className='gh-portal-text-center gh-portal-free-ctatext'>{t(`Welcome! You're signed up as a free member.`)}</p>
        </div>
    );
};

export default AccountWelcome;
