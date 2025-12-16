import Component from '@glimmer/component';
import {action} from '@ember/object';
import {inject as service} from '@ember/service';
import {task} from 'ember-concurrency';
import {tracked} from '@glimmer/tracking';

export default class BulkUnsubscribeMembersModal extends Component {
    @service ajax;
    @service ghostPaths;
    @service store;

    @tracked error;
    @tracked response;

    @tracked selectedNewsletterId = null;

    get isDisabled() {
        return !this.args.data.query;
    }

    get hasRun() {
        return !!(this.error || this.response);
    }

    get hasMultipleNewsletters() {
        // Newsletter feature removed
        return false;
    }

    get newsletterList() {
        // Newsletter feature removed
        return [];
    }

    @action
    setLabel(label) {
        this.selectedLabel = label;
    }

    @action
    setSelectedNewsletter(newsletter) {
        if (newsletter === 'all') {
            this.selectedNewsletterId = null;
        } else {
            this.selectedNewsletterId = newsletter;
        }
    }

    @task({drop: true})
    *bulkUnsubscribeTask() {
        // Newsletter feature removed - this action is no longer available
        this.error = 'Newsletter functionality has been removed.';
        return false;
    }
}
