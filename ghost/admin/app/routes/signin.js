// TODO: remove usage of Ember Data's private `Errors` class when refactoring validations
// eslint-disable-next-line
import DS from 'ember-data';
import UnauthenticatedRoute from 'ghost-admin/routes/unauthenticated';
import {tracked} from '@glimmer/tracking';

const {Errors} = DS;

class Signin {
    @tracked identification = '';
    @tracked password = '';

    errors = Errors.create();
}

const defaultModel = function defaultModel() {
    return new Signin();
};

export default class SigninRoute extends UnauthenticatedRoute {
    queryParams = {
        error: {
            refreshModel: false
        }
    };

    model() {
        return defaultModel();
    }

    setupController(controller, model) {
        super.setupController(controller, model);
        
        // Handle OAuth error from query params
        const error = this.paramsFor('signin').error;
        if (error === 'user_not_found') {
            controller.flowErrors = 'No Ghost account found for this email. Please sign in with an existing account.';
        } else if (error === 'oauth_error') {
            controller.flowErrors = 'There was a problem signing in with Google. Please try again.';
        }
    }

    // the deactivate hook is called after a route has been exited.
    deactivate() {
        super.deactivate(...arguments);

        // clear the properties that hold the credentials when we're no longer on the signin screen
        this.controllerFor('signin').model = defaultModel();
    }

    buildRouteInfoMetadata() {
        return Object.assign(super.buildRouteInfoMetadata(), {
            titleToken: 'Sign In'
        });
    }
}
