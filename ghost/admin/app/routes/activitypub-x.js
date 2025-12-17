import AuthenticatedRoute from 'ghost-admin/routes/authenticated';
import {inject as service} from '@ember/service';

export default class AcitvitypubXRoute extends AuthenticatedRoute {
    @service settings;
    @service router;

    beforeModel() {
        super.beforeModel(...arguments);
        
        // Redirect to dashboard if ActivityPub/Social Web is not enabled
        if (!this.settings.socialWebEnabled) {
            this.router.transitionTo('dashboard');
        }
    }
}
