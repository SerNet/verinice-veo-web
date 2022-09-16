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
import { defineComponent, h } from '@nuxtjs/composition-api';

import { VeoFormsWidgetProps } from '../util';

const AVAILABLE_WIDGETS: any[] = [];

export default defineComponent({
  props: VeoFormsWidgetProps,
  setup(props) {
    const fittingComponent = AVAILABLE_WIDGETS.find((widget) => widget.name === props.name);

    if (!fittingComponent) {
      // eslint-disable-next-line no-console
      console.warn(`VeoForm::Widget: Couldn't find widget ${props.name}`);
      return null;
    }
    return () => h(fittingComponent, { props });
  }
});
