import { Middleware } from '@nuxt/types';
import { separateUUIDParam } from '~/lib/utils';

/**
 * This file updates the current user and domain in order to get used at different places in the app (mainly #249)
 */
export default (function ({ route, $user }) {
  const newUnit = separateUUIDParam(route.params.unit).id;
  const newDomain = separateUUIDParam(route.params.domain).id;

  if ($user.lastUnit !== newUnit) {
    $user.updateLastUnit(newUnit);
  } else {
    // Only update domain if set (if it is undefined, don't overwrite, as we want to use the stored domain)
    // eslint-disable-next-line no-lonely-if
    if (newDomain && newDomain !== $user.lastDomain) {
      // we dont't want to persist this domain, as it is more of a placeholder
      if (newDomain !== 'more') {
        $user.updateLastDomain(newDomain);
      }
    }
  }
} as Middleware);
