import EmbedSignupForm from './embed-signup/embed-signup-form';
import Explore from './explore';
import Network from './network';
import React from 'react';
import Recommendations from './recommendations';
import SearchableSection from '../../searchable-section';

export const searchKeywords = {
    network: ['growth', 'network', 'activitypub', 'blog', 'fediverse', 'sharing'],
    explore: ['ghost explore', 'explore', 'growth', 'share', 'list', 'listing'],
    recommendations: ['growth', 'recommendations', 'recommend', 'blogroll'],
    embedSignupForm: ['growth', 'embeddable signup form', 'embeddable form', 'embeddable sign up form', 'embeddable sign up']
};

const GrowthSettings: React.FC = () => {
    return (
        <SearchableSection keywords={Object.values(searchKeywords).flat()} title='Growth'>
            <Network keywords={searchKeywords.network} />
            <Explore keywords={searchKeywords.explore} />
            <Recommendations keywords={searchKeywords.recommendations} />
            <EmbedSignupForm keywords={searchKeywords.embedSignupForm} />
        </SearchableSection>
    );
};

export default GrowthSettings;
