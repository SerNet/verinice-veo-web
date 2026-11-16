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
export type VeoTaskType = 'inspection-finding' | 'requirement-implementation' | 'requirement-implementation-revision';
export type VeoTaskSeverity = 'ERROR' | 'HINT' | 'WARNING';

interface IVeoBaseTask {
  type: VeoTaskType;
  /** ISO date (`YYYY-MM-DD`) */
  deadline?: string;
  assignee?: IVeoElementInDomainIdRef;
}

export interface IVeoRequirementImplementationTask extends IVeoBaseTask {
  type: 'requirement-implementation' | 'requirement-implementation-revision';
  requirementImplementation: RequirementImplementation;
}

export interface IVeoInspectionFindingTask extends IVeoBaseTask {
  type: 'inspection-finding';
  description: Record<string, string>;
  object: IVeoElementInDomainIdRef;
  severity: VeoTaskSeverity;
}

export type IVeoTask = IVeoInspectionFindingTask | IVeoRequirementImplementationTask;

export function isRequirementImplementationTask(task: IVeoTask): task is IVeoRequirementImplementationTask {
  return task.type === 'requirement-implementation' || task.type === 'requirement-implementation-revision';
}
