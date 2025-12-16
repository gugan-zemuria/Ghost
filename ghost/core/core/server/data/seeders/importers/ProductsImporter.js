const TableImporter = require('./TableImporter');
const {faker} = require('@faker-js/faker');
const {slugify} = require('@tryghost/string');
const {blogStartDate} = require('../utils/blog-info');

class ProductsImporter extends TableImporter {
    static table = 'products';
    static dependencies = [];
    defaultQuantity = 4;

    constructor(knex, transaction) {
        super(ProductsImporter.table, knex, transaction);
    }

    async import(quantity = this.defaultQuantity) {
        // TODO: Add random products if quantity != 4
        this.names = ['Free', 'Bronze', 'Silver', 'Gold'].reverse();
        this.count = 0;

        await super.import(quantity);
    }

    /**
     * Finalise removed - Stripe products/prices no longer exist
     */

    generate() {
        const name = this.names.pop();
        const count = this.count;
        this.count = this.count + 1;
        const sixMonthsLater = new Date(blogStartDate);
        sixMonthsLater.setMonth(sixMonthsLater.getMonth() + 6);
        const tierInfo = {
            type: count === 0 ? 'free' : 'paid',
            description: count === 0 ? 'A free sample of content' : `${name} tier member`
        };
        return Object.assign({}, {
            id: this.fastFakeObjectId(),
            name: name,
            slug: `${slugify(name)}-${faker.random.numeric(3)}`,
            visibility: 'public',
            created_at: faker.date.between(blogStartDate, sixMonthsLater)
        }, tierInfo);
    }
}

module.exports = ProductsImporter;
