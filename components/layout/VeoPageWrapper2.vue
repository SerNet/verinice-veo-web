<!--
   - verinice.veo web
   - Copyright (C) 2021  Jonas Heitmann, Davit Svandize
   - 
   - This program is free software: you can redistribute it and/or modify
   - it under the terms of the GNU Affero General Public License as published by
   - the Free Software Foundation, either version 3 of the License, or
   - (at your option) any later version.
   - 
   - This program is distributed in the hope that it will be useful,
   - but WITHOUT ANY WARRANTY; without even the implied warranty of
   - MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
   - GNU Affero General Public License for more details.
   - 
   - You should have received a copy of the GNU Affero General Public License
   - along with this program.  If not, see <http://www.gnu.org/licenses/>.
-->
<script lang="ts">
import { defineComponent, h, ref, watch } from '@nuxtjs/composition-api';

import VeoCollapseButton from '~/components/layout/VeoCollapseButton.vue';

interface IProps {
  title: String;
  titleClass: String;
  collapsableLeft: Boolean;
  collapsableRight: Boolean;
}

export default defineComponent<IProps>({
  components: {
    VeoCollapseButton
  },
  props: {
    title: {
      type: String,
      default: undefined
    },
    titleClass: {
      type: String,
      default: undefined
    },
    collapsableLeft: {
      type: Boolean,
      default: false
    },
    collapsableRight: {
      type: Boolean,
      default: false
    }
  },
  setup(props, context) {
    const wrapper = ref<HTMLDivElement>();
    const observer = new MutationObserver((value) => {
      console.log('Bla', value);
    });
    console.log('1', wrapper);
    // observer.observe(wrapper as any);
    watch(
      wrapper,
      (newValue) => {
        console.log('2', newValue);
      },
      { deep: true }
    );
    return () =>
      h(
        'div',
        {
          class: 'fill-width fill-height d-flex flex-column overflow-hidden'
        },
        [
          h(
            'div',
            {
              class: props.titleClass,
              ref: (el) => (wrapper.value = el)
            },
            [
              ...(props.title
                ? [
                    h('h1', {
                      domProps: {
                        innerText: props.title
                      },
                      class: 'd-inline px-4 py-1 flex-grow-0'
                    })
                  ]
                : [context.slots.title ? context.slots.title() : []]),
              context.slots.header ? context.slots.header() : []
            ]
          ),
          h(
            'div',
            {
              props: {
                noGutters: true
              },
              class: 'row flex-nowrap overflow-hidden',
              ref: 'wrapper'
            },
            (context.slots.default ? context.slots.default() : []).map((slotItem, index) =>
              h(
                'div',
                {
                  style: {
                    background: 'red'
                  }
                },
                [slotItem]
              )
            )
          ),
          context.slots.helper ? context.slots.helper() : [],
          h('div', wrapper.value + '_abc')
        ]
      );
  }
  /* render(h) {
    return h(
      'div',
      {
        class: 'fill-width fill-height d-flex flex-column overflow-hidden'
      },
      [
        h(
          'div',
          {
            class: this.$props.titleClass,
            ref: wrapper // oder (el) => (wrapper.value = el)
          },
          [
            ...(this.$props.title
              ? [
                  h('h1', {
                    domProps: {
                      innerText: this.$props.title
                    },
                    class: 'd-inline px-4 py-1 flex-grow-0'
                  })
                ]
              : [this.$slots.title ? this.$slots.title : []]),
            this.$slots.header ? this.$slots.header : []
          ]
        ),
        h(
          'div',
          {
            props: {
              noGutters: true
            },
            class: 'row flex-nowrap overflow-hidden',
            ref: 'wrapper'
          },
          (this.$slots.default ? this.$slots.default : []).map((slotItem, index) =>
            h(
              'div',
              {
                style: {
                  background: 'red'
                }
              },
              [slotItem]
            )
          )
        ),
        this.$slots.helper ? this.$slots.helper : []
      ]
    );
  } */
});
</script>
