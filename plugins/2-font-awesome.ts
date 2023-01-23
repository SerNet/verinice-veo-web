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
import { library } from '@fortawesome/fontawesome-svg-core';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { faObjectGroup, faObjectUngroup } from '@fortawesome/free-regular-svg-icons';
import { faDiagramProject } from '@fortawesome/free-solid-svg-icons';

export default defineNuxtPlugin((nuxtApp) => {
  library.add(faDiagramProject, faObjectGroup, faObjectUngroup);
  nuxtApp.vueApp.use({
    install: (app) => {
      app.component('FontAwesomeIcon', FontAwesomeIcon);
    }
  });
});
