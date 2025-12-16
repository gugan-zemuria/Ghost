const {NotFoundError, MethodNotAllowedError} = require('@tryghost/errors');

module.exports = class ProductRepository {
    constructor({Product, Settings}) {
        this._Product = Product;
        this._Settings = Settings;
    }

    async get(data, options = {}) {
        if (!options.transacting) {
            return this._Product.transaction((transacting) => {
                return this.get(data, {...options, transacting});
            });
        }

        if ('id' in data) {
            return await this._Product.findOne({id: data.id}, options);
        }

        if ('slug' in data) {
            return await this._Product.findOne({slug: data.slug}, options);
        }

        throw new NotFoundError({message: 'Missing id or slug from data'});
    }

    async getDefaultProduct(options = {}) {
        const defaultProductPage = await this.list({
            filter: 'type:paid+active:true',
            limit: 1,
            ...options
        });
        return defaultProductPage.data[0];
    }

    async list(options = {}) {
        return this._Product.findPage(options);
    }

    async destroy() {
        throw new MethodNotAllowedError({message: 'Cannot destroy products'});
    }
};
