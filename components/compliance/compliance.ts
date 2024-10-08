/*
 * verinice.veo web
 * Copyright (C) 2024 Aziz Khalledi
 *
 * This program is free software: you can redistribute it and/or modify it
 * under the terms of the GNU Affero General Public License
 * as published by the Free Software Foundation, either version 3 of the License,
 * or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY;
 * without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.
 * See the GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License along with this program.
 * If not, see <http://www.gnu.org/licenses/>.
 */
// RI = Combination of riskAffected + control

import { useRequest } from '@/composables/api/utils/request';
import { VeoElementTypePlurals } from '~/types/VeoTypes';

export type ComplianceState = {
  type: Ref<string>;
  CTLModule: Ref<any>;
};

const { request } = useRequest();
const route = useRoute();

const state: ComplianceState = {
  type: computed(() => VeoElementTypePlurals[route.query.type as keyof typeof VeoElementTypePlurals] || 'all'),
  CTLModule: ref() // if undefined, fetch it!
};

function getRequirementImplementationId(url: string) {
  return url.split('requirement-implementations/').pop();
}

async function fetchRequirementImplementations({
  type,
  riskAffected,
  control,
  sortBy,
  sortOrder,
  size
}: {
  type: string;
  riskAffected: string;
  control: string;
  sortBy: string;
  sortOrder: string;
  size: number;
}) {
  if (type === 'all') return; // API did not yet implement an endpoint to fetch all RIs
  if (!type || !riskAffected || !control) return;

  const url =
    `/api/${type}/${riskAffected}/control-implementations/${control}/requirement-implementations?size=${size}` +
    (sortBy ? `&sortBy=${sortBy}&sortOrder=${sortOrder}` : '');

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
