import moment from 'moment-timezone';
import {Resource} from 'ember-could-get-used-to-this';
import {TrackedArray} from 'tracked-built-ins';
import {action} from '@ember/object';
import {didCancel, task} from 'ember-concurrency';
import {inject as service} from '@ember/service';
import {tracked} from '@glimmer/tracking';

export default class MembersEventsFetcher extends Resource {
    @service ajax;
    @service ghostPaths;
    @service store;
    @service feature;

    @tracked data = new TrackedArray([]);
    @tracked isLoading = false;
    @tracked isError = false;
    @tracked errorMessage = null;
    @tracked hasReachedEnd = false;

    // Newsletter feature removed

    cursor = null;

    get value() {
        return {
            isLoading: this.isLoading,
            isError: this.isError,
            errorMessage: this.errorMessage,
            data: this.data,
            loadNextPage: this.loadNextPage,
            hasReachedEnd: this.hasReachedEnd,
            // Newsletter feature removed
        };
    }

    async setup() {
        this.cursor = moment.utc().format('YYYY-MM-DD HH:mm:ss');
        let filter = `data.created_at:<'${this.cursor}'`;

        if (this.args.named.filter) {
            filter += `+${this.args.named.filter}`;
        }

        // Can't get this working with Promise.all, somehow results in an infinite loop
        try {
            await this.loadEventsTask.perform({filter});
            // Newsletter feature removed
        } catch (e) {
            if (!didCancel(e)) {
                // re-throw the non-cancelation error
                throw e;
            }
        }
    }

    @action
    loadNextPage() {
        // NOTE: assumes data is always ordered by created_at desc
        const lastEvent = this.data[this.data.length - 1];

        if (!lastEvent?.data?.created_at) {
            this.hasReachedEnd = true;
            return;
        }

        const cursor = moment.utc(lastEvent.data.created_at).format('YYYY-MM-DD HH:mm:ss');

        if (cursor === this.cursor) {
            this.hasReachedEnd = true;
            return;
        }

        this.cursor = cursor;
        let filter = `data.created_at:<'${this.cursor}'`;

        if (this.args.named.filter) {
            filter += `+${this.args.named.filter}`;
        }

        this.loadEventsTask.perform({filter});
    }

    // Newsletter feature removed

    @task
    *loadEventsTask(queryParams) {
        try {
            this.isLoading = true;

            const url = this.ghostPaths.url.api('members/events');
            const data = Object.assign({}, queryParams, {limit: this.args.named.pageSize});
            const {events} = yield this.ajax.request(url, {data});

            if (events.length < data.limit) {
                this.hasReachedEnd = true;
            }

            this.data.push(...events);
        } catch (e) {
            this.isError = true;

            const errorMessage = e.payload?.errors?.[0]?.message;
            if (errorMessage) {
                this.errorMessage = errorMessage;
            }

            // TODO: log to Sentry
            console.error(e); // eslint-disable-line
        } finally {
            this.isLoading = false;
        }
    }
}
