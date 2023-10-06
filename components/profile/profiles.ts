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
import { useMutation } from '~~/composables/api/utils/mutation';
import domainQueryDefinitions from '~~/composables/api/queryDefinitions/domains';
import unitQueryDefinitions from '~/composables/api/queryDefinitions/units';

// TYPES
import { IVeoLink } from '~/types/VeoTypes';
export type Profile = {
  key: string;
  name: string;
  description: string;
  language: string;
}

type Profiles = {
  [key: string]: {
    name: string;
    description: string;
    language: string;
  }
}

// useUnits
type ApplyProfileParams = {
  domainId: string;
  unitId: string;
  profileKey: string;
  messages: { [key: string]: string }
}

type createUnitAndApplyProfileParams = {
  name: string;
  domains: IVeoLink[];
  description?: string | undefined;
  messages: { [key: string]: string };
}

// GLOBAL COMPOSABLES
const route = useRoute();
const { displayErrorMessage, displaySuccessMessage } = useVeoAlerts();

// STATE
watch( route, () => updateDomainId());

const initialState = {
  selectedProfiles: [] as string[],
  showDialog: false,
  isApplyingProfile: false,
  isCreatingUnit: false,
  domainId: route.params.domain as string,
  selectedUnit: null as null | string,
  newUnitName: null as null | string,
  newUnitDescription: null as null | string
};

const state = reactive({ ...initialState });

// Manipulate state
function resetState() {
  Object.assign(state, initialState);
}

function updateDomainId() {
  state.domainId = route.params.domain as string;
}

function toggleDialog() {
  if(state.isApplyingProfile || state.isCreatingUnit) return;
  state.showDialog = !state.showDialog;

  if (state.showDialog) return;
  resetState();
}

// Helpers
function handleError(err: unknown, genericMsg: string) {
  const error = (err instanceof Error) ?
    { message: err.message, cause: err.cause } :
    { message: String(err), cause: 'unknown' };

  console.error('applyProfile() failed:', err);
  displayErrorMessage(genericMsg, error.message);
}

// Local Composables
function useDomain() {
  const fetchDomainQueryParameters = computed(() => ({ id: state.domainId as string }));
  const fetchDomainQueryEnabled = computed(() => !!state.domainId);
  const { data: domain } = useQuery(domainQueryDefinitions.queries.fetchDomain, fetchDomainQueryParameters, { enabled: fetchDomainQueryEnabled });

  return {
    domain: readonly(domain)
  };
}

export function useProfiles() {
  // Fetch domain, because profiles are a member of the domain object
  const { domain } = useDomain();

  // Unpack available profiles
  const profiles = computed(() => {
    const _profiles: Profiles | undefined = toRaw(domain?.value?.profiles);

    if(!_profiles) return [];
    return Object.keys(_profiles || {}).map(key =>({key, ..._profiles[key]} )) as Profile[];
  });

  return {
    profiles: readonly(profiles),
    toggleDialog,
    updateDomainId,
    state
  };
}

export function useUnits() {
  const { mutateAsync: mutateExistingUnit } = useMutation(domainQueryDefinitions.mutations.applyProfile);
  const { mutateAsync: createNewUnit, data: unitDetailsPayload } = useMutation(unitQueryDefinitions.mutations.create);
  const { domain } = useDomain(); // Needed if user wants to create a new unit
  const { data: _units } = useQuery(unitQueryDefinitions.queries.fetchAll);
  const { userSettings } = useVeoUser();

  const hasMaxUnits = computed(() => (_units.value?.length || 0) >= userSettings.value.maxUnits);

  // Remove all units which are not in the current domain
  const units = computed(()=> _units.value ?
    _units.value.filter(unit => {
      return unit.domains.some(({targetUri}) => targetUri === domain?.value?._self);
    }) : [] );

  async function applyProfile({ profileKey, unitId, domainId, messages }: ApplyProfileParams) {
    state.isApplyingProfile = true;
    try {
      await mutateExistingUnit({ domainId, unitId, profileKey });
      redirectToUnit({ unitId, domainId });
      displaySuccessMessage(messages.success);
    }
    catch (err) {
      handleError(err, messages.error);
    }
    finally {
      resetState();
      updateDomainId();
    }
  }

  async function redirectToUnit({ unitId, domainId }:{unitId: string, domainId: string}) {
    const router = useRouter();
    if (!domainId || !unitId) return;
    router.push({
      name: 'unit-domains-domain',
      params: {
        unit: unitId,
        domain: domainId
      }
    });
  }

  async function createUnitAndApplyProfile({name, domains, description, messages}: createUnitAndApplyProfileParams) {
    state.isCreatingUnit = true;

    try {
      await createNewUnit({ name, domains, description });
      if(unitDetailsPayload.value?.resourceId) {
        await applyProfile({
          profileKey: state.selectedProfiles[0],
          unitId: unitDetailsPayload.value.resourceId as string,
          domainId: state.domainId,
          messages
        });
      }
      else {
        throw new Error('Could not apply profile');
      }
    }
    catch (err) {
      handleError(err, messages.error);
      resetState();
    }
  }

  return {
    units: readonly(units),
    domain: readonly(domain),
    hasMaxUnits: readonly(hasMaxUnits),
    toggleDialog,
    applyProfile,
    createUnitAndApplyProfile,
    state
  };
}
