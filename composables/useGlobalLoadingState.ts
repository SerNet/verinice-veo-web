/*
 * verinice.veo web
 * Copyright (C) 2025 jae
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by

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

const loadingProcesses = ref([]);

export function useGlobalLoadingState() {
  function setLoading(message = '') {
    const id = Symbol();
    loadingProcesses.value.push({ id, message });
    return id;
  }

  function clearLoading(id: symbol) {
    loadingProcesses.value = loadingProcesses.value.filter((item) => item.id !== id);
  }

  return {
    isLoading: computed(() => loadingProcesses.value.length > 0),
    loadingInfo: computed(() => loadingProcesses.value.map((item) => item.message).join(', ')),
    setLoading,
    clearLoading
  };
}
