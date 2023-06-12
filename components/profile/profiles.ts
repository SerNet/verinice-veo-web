import { useQuery } from '~~/composables/api/utils/query';
import domainQueryDefinitions from '~~/composables/api/queryDefinitions/domains';
import unitQueryDefinitions from '~/composables/api/queryDefinitions/units';
import { separateUUIDParam } from '~/lib/utils';

const route = useRoute();
const { displayErrorMessage, displaySuccessMessage } = useVeoAlerts();

const testprofiles = [
  { abbr: '', key: 'Profile a', desc: ''},
  { abbr: '', key: 'Profile b', desc: ''},
  { abbr: '', key: 'Profile c', desc: ''},
  { abbr: '', key: 'Profile d', desc: ''},
  { abbr: '', key: 'Profile e', desc: ''},
  { abbr: '', key: 'Profile f', desc: ''},
  { abbr: '', key: 'Profile g', desc: ''},
  { abbr: '', key: 'Profile h', desc: ''},
  { abbr: '', key: 'Profile i', desc: ''},
  { abbr: '', key: 'Profile j', desc: ''},
  { abbr: '', key: 'Profile k', desc: ''},
  { abbr: '', key: 'Profile l', desc: ''},
  { abbr: '', key: 'Profile m', desc: ''},
  { abbr: '', key: 'Profile n', desc: ''},
  { abbr: '', key: 'Profile o', desc: ''},
  { abbr: '', key: 'Profile p', desc: ''},
  { abbr: '', key: 'Profile q', desc: ''},
  { abbr: '', key: 'Profile r', desc: ''},
  { abbr: '', key: 'Profile s', desc: ''},
  { abbr: '', key: 'Profile t', desc: ''}
];

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

watch(state, () => console.log(state));

function toggleDialog() {
  state.showDialog = !state.showDialog;
}

function handleError(err: unknown, genericMsg: string) {
  let error;
  if (err instanceof Error) error = { message: err.message, cause: err.cause };
  else error = { message: String(err), cause: 'unknown' };

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

