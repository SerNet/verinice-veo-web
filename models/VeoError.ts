import Vue from 'vue';

export default class VeoError extends Error {
  constructor(public name: string, public options: { status?: number, cause?: Error, [name: string]: any }, protected context?: Vue) {
    super(name);
    Object.setPrototypeOf(this, new.target.prototype);

    if (context) {
      this.message = context.i18n.t('errors.' + name, this.options).toString();
    }
  }
}
