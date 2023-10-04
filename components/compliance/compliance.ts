// RI = Combination of riskAffected + control

import { useRequest } from '@/composables/api/utils/request';

const { request } = useRequest();
const route = useRoute();

const state = {
  type: computed(() => OBJECT_TYPE_TO_URL_MAP[route.query.type as string] || 'all'),
  riskAffected: computed(() => route.query.riskAffected as string || null),
  control: computed(() => route.query.control as string || null)
};

function getRequirementImplementationId(url: string) {
  return url.split('requirement-implementations/').pop();
}

async function fetchRequirementImplementations({ type, riskAffected, control }: {type: string, riskAffected: string, control: string}) {
  if(type === 'all') return; // API did not yet implement an endpoint to fetch all RIs
  if(!type || !riskAffected || !control) return;

  const url = `/api/${type}/${riskAffected}/control-implementations/${control}/requirement-implementations`;

  return await request(url, {});
}

async function fetchRequirementImplementation({
  type,
  riskAffected,
  item
}:{ type: string, riskAffected: string, item: any}) {
  const { _self  } = item.raw;
  const requirementImplementationId = getRequirementImplementationId(_self);
  const url = `/api/${type}/${riskAffected}/requirement-implementations/${requirementImplementationId}`;

  return await request(url, {params: {id: requirementImplementationId}});
}

export function useCompliance() {
  return {
    fetchRequirementImplementations,
    fetchRequirementImplementation,
    getRequirementImplementationId,
    state: state
  };
}

// Map object types to corresponding url paths segments
type ObjectTypeToUrlMap = { [key: string]: string }
const OBJECT_TYPE_TO_URL_MAP: ObjectTypeToUrlMap = {
  scope: 'scopes',
  process: 'processes',
  asset: 'assets',
  person: 'persons',
  incident: 'incidents',
  document: 'documents',
  scenario: 'scenarios',
  control: 'controls'
};
