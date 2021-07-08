import { Middleware } from '@nuxt/types';
import { validate } from 'uuid';
import { separateUUIDParam } from '~/lib/utils';

/**
 * This file checks whether a unit is set as a parameter validates it. If the validation fails, the user gets redirected to the index page.
 */
export default (function ({ redirect, route, $user }) {
  if (route.params.unit) {
    const unitId = separateUUIDParam(route.params.unit).id;
    if (!validate(unitId)) {
      return redirect('/');
    } else {
      // Update the unit in the user plugin (used to preload the last domain the user viewed in this unit)
      $user.unit = unitId;
    }
  }
} as Middleware);
