import MailGun from './mailgun';
import React from 'react';
import SMTP from './smtp';
import SearchableSection from '../../searchable-section';
import {useGlobalData} from '../../providers/global-data-provider';

export const searchKeywords = {
    mailgun: ['mailgun', 'emails'],
    smtp: ['smtp', 'email', 'mail server'],
    emailNavMenu: ['emails', 'mailgun', 'smtp']
};

const EmailSettings: React.FC = () => {
    const {config} = useGlobalData();

    return (
        <SearchableSection keywords={Object.values(searchKeywords).flat()} title='Email'>
            {!config.mailgunIsConfigured && <MailGun keywords={searchKeywords.mailgun} />}
            <SMTP keywords={searchKeywords.smtp} />
        </SearchableSection>
    );
};

export default EmailSettings;
