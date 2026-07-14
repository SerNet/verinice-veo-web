/*
 * verinice.veo web
 * Copyright (C) 2026 sernet at
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
import { downloadZIP } from '~/lib/jsonToZip';
import { read } from '~/requests/crud';

export function useUnitExport() {
  const { profile } = useVeoUser();

  const username = computed(() => profile.value?.username as string);

  async function exportUnit(unitId: string) {
    const data = await read({
      path: `units/${unitId}/export`,
      options: {
        headers: {
          Accept: 'application/vnd.sernet.verinice.unit-dump.v2+json'
        }
      }
    });

    const cleanFileName = (value: unknown) => String(value).replace(/[^\w-]/g, '_');

    const safeUsername = cleanFileName(username.value);
    const safeUnitName = cleanFileName(data.unit?.name ?? 'unit_export');
    const fileName = `${safeUsername}_${safeUnitName}`;

    await downloadZIP(data, fileName);
  }

  return {
    exportUnit
  };
}
