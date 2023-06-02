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
  desc: string;
}

// HELPER
function createProfileObj(_profile) {
  const profile: Profile = {
    key: _profile[0],
    desc: ''
  };
  return profile;
}

// API CALLS
async function requestProfileApplication({ domainId, unitId, profileKey }) {
  const url = `/api/domains/${domainId}/profiles/${profileKey}/units/${unitId}`;
  const response = await request(url, {method: 'POST'});
  return response;
}

// Profile Table State
const profileTable = reactive({
  selectedProfiles: [],
});

watch(profileTable, () => console.log(profileTable))

// Get current unit
const currentUnitId = computed(() => (route.params.unit && separateUUIDParam(route.params.unit as string).id) || undefined);

// UnitDialog state
const dialog = reactive({
  show: false,
  isApplyingProfile: false,
  selectedUnit: unref(currentUnitId)
});


export function useProfiles(initialState) {
  // Get domain + Unit IDs
  const domainId = computed(() => separateUUIDParam(route.params.domain as string).id);
  const unitId = computed(() => separateUUIDParam(route.params.unit as string).id);

  // Fetch current domain (profiles are a member of the domain object)
  const fetchDomainQueryParameters = computed(() => ({ id: domainId as string }));
  const fetchDomainQueryEnabled = computed(() => !!domainId);
  const { data: domain, isFetching: domainIsLoading } = useQuery(domainQueryDefinitions.queries.fetchDomain, fetchDomainQueryParameters, { enabled: fetchDomainQueryEnabled });

  // Get available profiles from domain
  const profiles = computed(() =>
    Object.entries(domain.value?.profiles || {})
      .map(entry => createProfileObj(toRaw(entry))) || []
  );

  async function applyProfile({ profileKey, unitId, domainId = domain?.value?.id  }) {
    dialog.isApplyingProfile = true;
    try {
      const response = await requestProfileApplication({ domainId, unitId, profileKey });
      displaySuccessMessage();
    }
    catch (error) {
      console.error('Applying a profile failed:', error);
      displayErrorMessage();
    }
    finally {
      // Clean up state
      dialog.isApplyingProfile = false;
      profileTable.selectedProfiles = [];
      toggleDialog();
    }
  }

  return {
    applyProfile,
    profileTable,
    profiles,
    testprofiles
  };
}

function toggleDialog() {
  dialog.show = !dialog.show;
}

export function useUnits(initialState) {
  const { data: units } = useQuery(unitQueryDefinitions.queries.fetchAll);

  return {
    units: readonly(units),
    dialog: readonly(dialog),
    toggleDialog
  };
}

