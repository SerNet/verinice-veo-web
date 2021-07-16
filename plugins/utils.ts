import { Plugin } from '@nuxt/types';
import { kebabCase } from 'lodash';

export default (function (_context, inject) {
  const utils = {
    prefixCyData(options: any, name: string) {
      return `${kebabCase(options._componentTag)}-${name}`;
    }
  };

  inject('utils', utils);
} as Plugin);
