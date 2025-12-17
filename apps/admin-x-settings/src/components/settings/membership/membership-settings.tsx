import MemberEmails from './member-emails';
import React from 'react';
import SearchableSection from '../../searchable-section';
import SpamFilters from '../advanced/spam-filters';
import useFeatureFlag from '../../../hooks/use-feature-flag';


export const searchKeywords = {
    memberEmails: ['membership', 'signup', 'welcome email', 'email', 'new user', 'new member', 'account']
};

const MembershipSettings: React.FC = () => {
    const hasWelcomeEmails = useFeatureFlag('welcomeEmails');

    return (
        <SearchableSection keywords={Object.values(searchKeywords).flat()} title='Membership'>
            <SpamFilters keywords={[]} />
            {hasWelcomeEmails && <MemberEmails keywords={searchKeywords.memberEmails} />}
        </SearchableSection>
    );
};

export default MembershipSettings;
