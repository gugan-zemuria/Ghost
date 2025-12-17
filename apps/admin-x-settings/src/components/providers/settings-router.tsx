import React, {useEffect} from 'react';
import {useRouteChangeCallback, useRouting} from '@tryghost/admin-x-framework/routing';
import {useScrollSectionContext} from '../../hooks/use-scroll-section';
import type {ModalName} from './routing/modals';

export const modalPaths: {[key: string]: ModalName} = {
    'design/change-theme': 'DesignAndThemeModal',
    'design/edit': 'DesignAndThemeModal',
    'theme/install': 'DesignAndThemeModal', // this is a special route, because it can install a theme directly from the Ghost Marketplace
    'navigation/edit': 'NavigationModal',
    'staff/invite': 'InviteUserModal',
    'staff/:slug': 'UserDetailModal',
    'staff/:slug/edit': 'UserDetailModal',


    'history/view': 'HistoryModal',
    'history/view/:user': 'HistoryModal',
    'integrations/zapier': 'ZapierModal',
    'integrations/slack': 'SlackModal',
    'integrations/unsplash': 'UnsplashModal',
    'integrations/firstpromoter': 'FirstPromoterModal',
    'integrations/pintura': 'PinturaModal',
    'integrations/new': 'AddIntegrationModal',
    'integrations/:id': 'CustomIntegrationModal',
    'recommendations/add': 'AddRecommendationModal',
    'recommendations/edit': 'EditRecommendationModal',
    'announcement-bar/edit': 'AnnouncementBarModal',
    'embed-signup-form/show': 'EmbedSignupFormModal',

    'explore/testimonial': 'TestimonialsModal',
    about: 'AboutModal'
};

export const loadModals = () => import('./routing/modals');

const SettingsRouter: React.FC = () => {
    const {updateNavigatedSection, scrollToSection} = useScrollSectionContext();
    const {route} = useRouting();
    // get current route
    useRouteChangeCallback((newPath, oldPath) => {
        if (newPath === oldPath) {
            scrollToSection(newPath.split('/')[0]);
        }
    }, [scrollToSection]);

    useEffect(() => {
        if (route !== undefined) {
            updateNavigatedSection(route.split('/')[0]);
        }
    }, [route, updateNavigatedSection]);

    return null;
};

export default SettingsRouter;
