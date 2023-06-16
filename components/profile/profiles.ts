/*
 * verinice.veo web
 * Copyright (C) 2023 jae
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
import { useQuery } from '~~/composables/api/utils/query';
import domainQueryDefinitions from '~~/composables/api/queryDefinitions/domains';
import unitQueryDefinitions from '~/composables/api/queryDefinitions/units';
import { separateUUIDParam } from '~/lib/utils';

const route = useRoute();
const { displayErrorMessage, displaySuccessMessage } = useVeoAlerts();

type Profile = {
  key: string;
  name: string;
  description: string;
  language: string;
}

interface IVeoProfiles {
  [key: string]: {
    name: string;
    description: string;
    language: string;
  }
}

// API CALLS
type RPAParams = { domainId: string, unitId: string, profileKey: string }
async function requestProfileApplication({ domainId, unitId, profileKey }: RPAParams) {
  const url = `/api/domains/${domainId}/profiles/${profileKey}/units/${unitId}`;
  const response = await request(url, {method: 'POST'});
  return response;
}

// STATE
const currentUnitId = computed(() => (route.params.unit && separateUUIDParam(route.params.unit as string).id) || undefined);
const currentDomainId = computed(() => separateUUIDParam(route.params.domain as string).id);

const state = reactive({
  selectedProfiles: [] as string[],
  showDialog: false,
  isApplyingProfile: false,
  selectedUnit: unref(currentUnitId),
  domainId: unref(readonly(currentDomainId))
});

function toggleDialog() {
  state.showDialog = !state.showDialog;
}

function handleError(err: unknown, genericMsg: string) {
  const error = (err instanceof Error) ? 
    { message: err.message, cause: err.cause } : 
    { message: String(err), cause: 'unknown' };

  console.error('applyProfile() failed:', err);
  displayErrorMessage(genericMsg, error.message);
}

type AParams = RPAParams & { messages: { [key: string]: string} }
async function applyProfile({ profileKey, unitId, domainId, messages }: AParams) {
  state.isApplyingProfile = true;
  try {
    await requestProfileApplication({ domainId, unitId, profileKey });
    displaySuccessMessage(messages.success);
  }
  catch (err) {
    handleError(err, messages.error);
  }
  finally {
    // Clean up state
    state.isApplyingProfile = false;
    state.selectedProfiles = [];
    toggleDialog();
  }
}

function useDomain() {
  const fetchDomainQueryParameters = computed(() => ({ id: currentDomainId as string }));
  const fetchDomainQueryEnabled = computed(() => !!currentDomainId);
  const { data: domain } = useQuery(domainQueryDefinitions.queries.fetchDomain, fetchDomainQueryParameters, { enabled: fetchDomainQueryEnabled });

  return {
    domain: readonly(domain)
  };
}

export function useProfiles() {
  // Fetch domain: profiles are a member of the domain object
  const { domain } = useDomain();

  // Get available profiles from domain
  const profiles = computed(() => {
    const _profiles: IVeoProfiles = toRaw(domain.value?.profiles);
    return Object.keys(_profiles || {}).map(key =>({key, ..._profiles[key]} )) as Profile[];
  });

  return {
    profiles: readonly(profiles),
    toggleDialog,
    state
  };
}

export function useUnits() {
  const { data: units } = useQuery(unitQueryDefinitions.queries.fetchAll);

  return {
    units: readonly(units),
    toggleDialog,
    applyProfile,
    state
  };
}

