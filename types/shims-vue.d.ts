declare module '*.vue' {
  import Vue from 'vue'
  export default Vue
  import {
    Helpful,
    FormElementProps,
    LayoutProps,
  } from '@/components/Collection/utils/helpers'
  export const helpers: Helpful<FormElementProps | LayoutProps>
}
