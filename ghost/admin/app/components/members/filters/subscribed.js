import {MATCH_RELATION_OPTIONS} from './relation-options';

export const SUBSCRIBED_FILTER = ({group, feature} = {}) => {
    return {
        label: 'Email subscription',
        name: 'subscribed',
        columnLabel: 'Subscribed',
        relationOptions: MATCH_RELATION_OPTIONS,
        valueType: 'options',
        group: group,
        buildNqlFilter: (flt) => {
            const relation = flt.relation;
            const value = flt.value;

            if (value === 'email-disabled') {
                if (relation === 'is') {
                    return '(email_disabled:1)';
                }
                return '(email_disabled:0)';
            }

            if (relation === 'is') {
                if (value === 'subscribed') {
                    return '(subscribed:true+email_disabled:0)';
                }
                return '(subscribed:false+email_disabled:0)';
            }

            // relation === 'is-not'
            if (value === 'subscribed') {
                return '(subscribed:false,email_disabled:1)';
            }
            return '(subscribed:true,email_disabled:1)';
        },
        parseNqlFilter: (flt) => {
            const comparator = flt.$and || flt.$or; // $or for legacy filter backwards compatibility

            if (!comparator || comparator.length !== 2) {
                const filter = flt;
                if (filter && filter.email_disabled !== undefined) {
                    if (filter.email_disabled) {
                        return {
                            value: 'email-disabled',
                            relation: 'is'
                        };
                    }
                    return {
                        value: 'email-disabled',
                        relation: 'is-not'
                    };
                }
                return;
            }

            if (comparator[0].subscribed === undefined || comparator[1].email_disabled === undefined) {
                return;
            }

            const usedOr = flt.$or !== undefined;
            const subscribed = comparator[0].subscribed;

            if (usedOr) {
                // Is not
                return {
                    value: !subscribed ? 'subscribed' : 'unsubscribed',
                    relation: 'is-not'
                };
            }

            return {
                value: subscribed ? 'subscribed' : 'unsubscribed',
                relation: 'is'
            };
        },
        options: [
            {label: 'Subscribed', name: 'subscribed'},
            {label: 'Unsubscribed', name: 'unsubscribed'},
            {label: 'Email disabled', name: 'email-disabled'}
        ],
        getColumnValue: (member) => {
            if (member.emailSuppression && member.emailSuppression.suppressed) {
                return {
                    text: 'Email disabled'
                };
            }

            return member.subscribed ? {
                text: 'Subscribed'
            } : {
                text: 'Unsubscribed'
            };
        }
    };
};

// Newsletter feature removed - NEWSLETTERS_FILTERS no longer available
