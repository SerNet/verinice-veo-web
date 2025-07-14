/*
 * verinice.veo web
 * Copyright (C) 2024 jae
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

/** Auto import nested exports */
export { useDomains, useDomainColor, useCurrentDomain } from '~/composables/domains/useDomains';
export { useProfiles } from '~/composables/profiles/useProfiles';
export { useUnits, useCurrentUnit } from '~/composables/units/useUnits';
export { useMutation } from '~/composables/api/utils/mutation';
export { useActions, usePerformActions } from '~/composables/actions/useActions';
export { useSearch } from '~/composables/search/useSearch';
export { useSystemMessages } from '~/composables/messages/useSystemMessages';
export { useSettings } from '~/composables/api/useSettings';
