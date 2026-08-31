/*
 * verinice.veo web
 * Copyright (C) 2026 Aziz Khalledi
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
import type { IVeoElementInDomainIdRef, RequirementImplementation } from '~/types/VeoTypes';

/** Task types returned by `GET /domains/{domainId}/tasks`. More types will follow. */
export type VeoTaskType = 'requirement-implementation' | 'requirement-implementation-revision';

export interface IVeoTask {
  type: VeoTaskType;
  /** ISO date (`YYYY-MM-DD`) */
  deadline?: string;
  requirementImplementation: RequirementImplementation;
  assignee?: IVeoElementInDomainIdRef;
}
