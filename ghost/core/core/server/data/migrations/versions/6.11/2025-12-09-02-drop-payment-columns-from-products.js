const {createDropColumnMigration, combineNonTransactionalMigrations} = require('../../utils');

/**
 * Drop payment-related columns from products table
 */
module.exports = combineNonTransactionalMigrations(
    createDropColumnMigration('products', 'monthly_price_id', {
        type: 'string',
        maxlength: 24,
        nullable: true
    }),
    createDropColumnMigration('products', 'yearly_price_id', {
        type: 'string',
        maxlength: 24,
        nullable: true
    }),
    createDropColumnMigration('products', 'monthly_price', {
        type: 'integer',
        unsigned: true,
        nullable: true
    }),
    createDropColumnMigration('products', 'yearly_price', {
        type: 'integer',
        unsigned: true,
        nullable: true
    }),
    createDropColumnMigration('products', 'currency', {
        type: 'string',
        maxlength: 50,
        nullable: true
    }),
    createDropColumnMigration('products', 'trial_days', {
        type: 'integer',
        unsigned: true,
        nullable: false,
        defaultTo: 0
    })
);
