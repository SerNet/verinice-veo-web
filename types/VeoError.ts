/*
 * verinice.veo web
 * Copyright (C) 2021  Philipp Ballhausen, Jonas Heitmann
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
export enum VeoErrorTypes {
  VEO_ERROR_COMMON,
  VEO_ERROR_NOT_FOUND,
  VEO_ERROR_NOT_AUTHORIZED
}

export class VeoError extends Error {
  constructor(public message: string, public code: number = 500, public type: VeoErrorTypes = VeoErrorTypes.VEO_ERROR_COMMON) {
    super(message);

    Object.setPrototypeOf(this, VeoError.prototype);
  }

  toString() {
    return `VeoError: ${this.message} (${VeoErrorTypes[this.type]})\n\tat: ${this.stack}`;
  }
}
