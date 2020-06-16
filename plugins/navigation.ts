import { Plugin, Context } from '@nuxt/types'
import Vue from 'vue'
import { Route } from 'vue-router'
import merge from 'lodash/merge'

export interface IItem {
  name: string
  icon?: string
  to?: string
  exact?: boolean
}

export class Navigation {
  public data = Vue.observable({ right: [] })
  constructor(protected context: Context) {
    context.app.router!.beforeEach((to, from, next) => {
      if (from.path !== to.path) { this.rightItems() }
      next()
    })
  }

  defaults(query: Record<string, string>) {
    const routeQuery = this.context.route.query
    let changed = false
    for (const key in query) {
      if (!(key in routeQuery)) {
        changed = true
        break
      }
    }
    if (changed) {
      this.context.app.router?.replace({
        path: this.context.route.path,
        query: { ...query, ...this.context.route.query }
      })
    }
  }

  route(overwrites: Partial<Route>) {
    return merge({}, this.context.route, overwrites)
  }

  rightItems(...item: IItem[]) {
    Vue.set(this.data, 'right', item.map(item => ({ ...item, exact: true, to: this.route({ query: { right: item.to || '' } }) })))
  }
}

export default (function(context, inject) {
  inject('navigation', new Navigation(context))
}) as Plugin
