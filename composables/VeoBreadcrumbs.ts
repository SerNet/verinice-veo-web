/*
 * verinice.veo web
 * Copyright (C) 2022  Jonas Heitmann
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
export interface IVeoBreadcrumb {
  disabled?: boolean;
  exact?: boolean;
  key: string;
  to: string;
  text?: string;
  icon?: any;
  position?: number;
  index: number; // Can be set to zero, as the VeoBreadcrumbs.vue component will handle it.
  param: string;
}

const breadcrumbs = ref<IVeoBreadcrumb[]>([]);

export const useVeoBreadcrumbs = () => {
  const addCustomBreadcrumb = (breadcrumb: IVeoBreadcrumb) => {
    breadcrumbs.value.push(breadcrumb);
  };

  const customBreadcrumbExists = (key: string) =>
    breadcrumbs.value.findIndex((breadcrumb) => breadcrumb.key === key) > -1;

  const removeCustomBreadcrumb = (key: string) => {
    const index = breadcrumbs.value.findIndex((breadcrumb) => breadcrumb.key === key);
    if (index > -1) {
      breadcrumbs.value.splice(index, 1);
    }
  };

  const updateCustomBreadcrumb = (key: string, breadcrumb: IVeoBreadcrumb) => {
    if (!customBreadcrumbExists(key)) {
      throw new Error(`VeoBreadcrumbs::updateCustomBreadcrumb: Breadcrumb ${key} doesn't exist`);
    }
    const index = breadcrumbs.value.findIndex((breadcrumb) => breadcrumb.key === key);
    breadcrumbs.value[index] = breadcrumb;
  };

  const clearCustomBreadcrumbs = () => {
    breadcrumbs.value = [];
  };

  return {
    breadcrumbs: readonly(breadcrumbs),
    customBreadcrumbExists,
    addCustomBreadcrumb,
    clearCustomBreadcrumbs,
    updateCustomBreadcrumb,
    removeCustomBreadcrumb
  };
};
