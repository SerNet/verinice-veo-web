import VeoError from '../models/VeoError';

export default (context, inject) => {
    context.$error = context.app.$error = context.store.$error = class VeoError$ extends VeoError {
        constructor(name, options) {
            super(name, options, context.app);
        }
    }
}