// RI = Combination of riskAffected + control

import { useRequest } from '@/composables/api/utils/request';
import { VeoElementTypePlurals } from '~/types/VeoTypes';

const { request } = useRequest();
const route = useRoute();

const state = {
  type: computed(() => VeoElementTypePlurals[route.query.type as keyof typeof VeoElementTypePlurals] || 'all'),
  riskAffected: computed(() => (route.query.riskAffected as string) || null),
  control: computed(() => (route.query.control as string) || null)
};

function getRequirementImplementationId(url: string) {
  return url.split('requirement-implementations/').pop();
}

async function fetchRequirementImplementations({
  type,
  riskAffected,
  control
}: {
  type: string;
  riskAffected: string;
  control: string;
}) {
  if (type === 'all') return; // API did not yet implement an endpoint to fetch all RIs
  if (!type || !riskAffected || !control) return;

  const url = `/api/${type}/${riskAffected}/control-implementations/${control}/requirement-implementations?size=10000`;

  return await request(url, {});
}

async function fetchRequirementImplementation({
  type,
  riskAffected,
  item
}: {
  type: string;
  riskAffected: string;
  item: any;
}) {
  const { _self } = item;
  const requirementImplementationId = getRequirementImplementationId(_self);
  const url = `/api/${type}/${riskAffected}/requirement-implementations/${requirementImplementationId}`;

  return await request(url, { params: { id: requirementImplementationId } });
}

export function useCompliance() {
  return {
    fetchRequirementImplementations,
    fetchRequirementImplementation,
    getRequirementImplementationId,
    state: state
  };
}
