import MailGun from './mailgun';
import React from 'react';
import SearchableSection from '../../searchable-section';
import {useGlobalData} from '../../providers/global-data-provider';

export const searchKeywords = {
    mailgun: ['mailgun', 'emails'],
    emailNavMenu: ['emails', 'mailgun']
};

const EmailSettings: React.FC = () => {
    const {config} = useGlobalData();

    return (
        <SearchableSection keywords={Object.values(searchKeywords).flat()} title='Email'>
            {!config.mailgunIsConfigured && <MailGun keywords={searchKeywords.mailgun} />}
        </SearchableSection>
    );
};

export default EmailSettings;
