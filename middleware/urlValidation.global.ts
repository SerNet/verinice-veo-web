/*
 * verinice.veo web
 * Copyright (C) 2022  Davit Svandize, Jonas Heitmann
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

import { useFeatureFlag } from '~/composables/features/featureFlag';

/**
 * This middleware checks whether a url is valid. If the validation fails, the user gets redirected to the index page.
 */
export default defineNuxtRouteMiddleware(async (to) => {
  // Fix for Link Hijack & Open Redirect
  // To fix the problem, the page will be redirected to the index page if a url parameter contains at least one "/"
  const invalidUrl = Object.values(to.params).some(
    (param) => param.includes('//') || decodeURIComponent(param as string).includes('//')
  );
  if (invalidUrl) {
    return navigateTo('/');
  }
  if (to.path === '/user-settings') {
    const { hasFeature, waitForFeatureFlagsInitialization } = useFeatureFlag();
    await waitForFeatureFlagsInitialization();
    if (!hasFeature('userSettings').value) {
      throw createError({ statusCode: 404 });
    }
  }
});
