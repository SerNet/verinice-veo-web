import { Middleware } from '@nuxt/types'
import { validate } from 'uuid'
import { separateUUIDParam } from '~/lib/utils'

/**
 * This file checks whether a unit is set as a parameter validates it. If the validation fails, the user gets redirected to the index page.
 */
export default (async function({ redirect, route, $user, $api }) {
  if (route.params.unit) {
    const unitId = separateUUIDParam(route.params.unit).id
    if (!validate(unitId)) {
      return redirect('/')
    } else {
      // Update the unit in the user plugin (used to preload the last domain the user viewed in this unit)
      $user.unit = unitId
    }

    // If no domain is set, we have to set a default one, else the user can't save forms
    if ($user.currentDomain === undefined) {
      $api.unit.fetch(unitId).then(unit => {
        if (unit.domains[0]) {
          $user.currentDomain = unit.domains[0].targetUri.split('/').pop() as string
        }
      })
    }
  }
} as Middleware)
