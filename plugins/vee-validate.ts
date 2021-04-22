import Vue from 'vue'
import {
  ValidationProvider,
  extend
} from 'vee-validate'

export function install(vue: typeof Vue) {
  extend('objectSchema', {
    params: ['errorMsg'],
    validate: (_, args: Record<string, any>) => ({
      required: true,
      valid: !args.errorMsg
    }),
    message: (_, args) => args.errorMsg,
    computesRequired: true
  })
  vue.component('ValidationProvider', ValidationProvider)
}

export default function () {
  install(Vue)
}
