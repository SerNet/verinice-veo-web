<template>
  <v-row no-gutters class="align-center">
    <v-col :cols="12" :md="5">
      <span style="font-size: 1.2rem;">{{ $t('displayType') }}:</span>
    </v-col>
    <v-col :cols="12" :md="5">
      <v-select v-model="displayType" :items="displayTypeItems" :label="$t('displayTypeInput')" clearable />
    </v-col>
    <template v-if="displayType">
      <v-col :cols="12" :md="5">
        <span style="font-size: 1.2rem;">{{ $t('condition') }}*:</span>
      </v-col>
      <v-col :cols="12" :md="5">
        <v-row no-gutters class="align-center">
          <v-select
            v-model="conditionScope"
            :label="$t('propertyInput')"
            item-text="name"
            item-value="scope"
            :items="conditionScopeItems"
            style="max-width: 171px"
          />
          <span class="mx-1" style="font-size: 1.2rem;">=</span>
          <v-select
            v-model="conditionValue"
            :items="conditionValueItems"
            :label="$t('valueInput')"
            multiple
            style="max-width:171px;"
          >
            <template v-slot:selection="{ item, index }">
              <span v-if="index === 0" class="text-truncate" style="max-width:50px;">
                {{ item }}
              </span>
              <span v-if="index === 1" class="grey--text caption ml-1"
                >(+{{ conditionValue.length - 1 }} {{ $t('othersInput') }})</span
              >
            </template>
          </v-select>
        </v-row>
      </v-col>
    </template>
  </v-row>
</template>

<script lang="ts">
import {
  defineComponent,
  inject,
  Ref,
  ref,
  computed,
  getCurrentInstance,
  WritableComputedRef
} from '@nuxtjs/composition-api'
import { JsonPointer } from 'json-ptr'
import { cloneDeep, orderBy } from 'lodash'
import vjp from 'vue-json-pointer'

import { IVeoFormSchema, IVeoFormSchemaItem, IVeoFromSchemaItemRule, IVeoObjectSchema, IVeoObjectSchemaProperty } from '~/types/VeoTypes'

interface IConditionScopeItem {
  type: 'boolean' | 'enum'
  scope: string
  name: string
  enum: (string | boolean | number)[]
}

interface IVeoFromSchemaItemRuleLocal {
  effect?: IVeoFromSchemaItemRule['effect']
  condition?: {
    scope?: IVeoFromSchemaItemRule['condition']['scope']
    schema?: IVeoFromSchemaItemRule['condition']['schema']
  }
}

interface IProps {
  value: IVeoFromSchemaItemRule
  currentScope: string | undefined
}

export default defineComponent<IProps>({
  props: {
    value: {
      type: Object,
      default: () => ({})
    },
    currentScope: {
      type: String
    }
  },
  setup(props, context) {
    const mainObjectSchema: Ref<IVeoObjectSchema> | undefined = inject('mainObjectSchema')
    const mainFormSchema: Ref<IVeoFormSchema> | undefined = inject('mainFormSchema')
    // These are LinksField Edit Dialog specific, when Links Attributes are edited
    const linkScope = inject('linkScope', null) as string | null
    const linksAttributes = inject('linksAttributes', null) as Ref<IVeoFormSchemaItem[]> | null
    const linksAttributesScopes = computed(() => linksAttributes?.value?.map(attribute => attribute.scope as string))
    const isCurrentLinkAttribute = computed(() =>
      props.currentScope ? linksAttributesScopes.value?.includes(props.currentScope) : undefined
    )

    function emitRule(rule: IVeoFromSchemaItemRuleLocal) {
      if (rule.effect && rule.condition?.schema && rule.condition.schema?.enum?.length > 0) {
        context.emit('input', rule)
      } else {
        context.emit('input', undefined)
      }
    }

    const rule: Ref<IVeoFromSchemaItemRuleLocal> = ref(cloneDeep(props.value))

    const vm = getCurrentInstance()
    const displayTypeItems = computed(() => [
      { text: vm?.$i18n.t('displayTypes.show'), value: 'SHOW' },
      { text: vm?.$i18n.t('displayTypes.hide'), value: 'HIDE' }
    ])
    const displayType: WritableComputedRef<string | undefined> = computed({
      get() {
        return rule.value.effect
      },
      set(newEffect: IVeoFromSchemaItemRule['effect'] | undefined) {
        if (newEffect) {
          vjp.set(rule.value, '/effect', newEffect)
        } else if (newEffect && typeof rule.value.effect === 'undefined') {
          rule.value = { effect: newEffect, condition: {} }
        } else {
          rule.value = {}
        }
        emitRule(rule.value)
      }
    })

    // Get all scopes which are used in FormSchema
    // or in case of LinksField: scopes of selected Links Attributes which are selected in LinksField Edit Dialog 
    const usedScopes: Ref<string[]> = ref([])
    usedScopes.value = isCurrentLinkAttribute.value
      ? linksAttributesScopes.value || []
      : Object.entries(JsonPointer.flatten(mainFormSchema?.value?.content, true) as Record<string, any>)
      .filter(([key, _value]) => /elements\/\d+\/scope$/.test(key))
      .map(([_key, value]) => value as string)
    // Current Scope of elements Checkbox & Enum should not be shown in the list of scopes,
    // because the current element cannot be conditional on own property
    if (props.currentScope) {
      usedScopes.value = usedScopes.value.filter(scope => scope !== props.currentScope)
    }

    // Generate items which include description of boolean/enum object with scope, name and enum (for selections)
    const conditionScopeItems: Ref<IConditionScopeItem[]> = ref([])
    usedScopes.value.forEach(scope => {
      // osProperty is normally value of "scope" in OS
      // However, in case of Links Attributes the scope is the composition of linksScope and linkAttribute scope
      const osProperty = JsonPointer.get(
        mainObjectSchema?.value,
        isCurrentLinkAttribute.value ? `${linkScope}${scope.replace('#/', '/items/')}` : scope
      ) as IVeoObjectSchemaProperty
      if (osProperty?.type === 'boolean') {
        conditionScopeItems.value.push({
          type: 'boolean',
          scope,
          name: scope.split('/').pop() as string,
          enum: [true, false]
        })
      } else if (osProperty?.enum) {
        conditionScopeItems.value.push({
          type: 'enum',
          scope,
          name: scope.split('/').pop() as string,
          enum: [...osProperty.enum]
        })
      }
    })
    // Order scopes by name to be easier to find in the list of items
    conditionScopeItems.value = orderBy(conditionScopeItems.value, [o => o.name.toLowerCase()], ['asc'])

    // Enable reactivity for defining and getting "scope" from rule object
    const conditionScope: WritableComputedRef<string | undefined> = computed({
      get() {
        return rule.value.condition?.scope
      },
      set(newScope) {
        // Update only if the new selected scope is not the same as the previous one
        if (newScope !== rule.value.condition?.scope) {
          vjp.set(rule.value, '/condition/scope', newScope)
          // define /condition/schema as an empty object to reset the selection values in the "value" field, when scope was changed
          vjp.set(rule.value, '/condition/schema', {})
        }
        // Emit event always
        emitRule(rule.value)
      }
    })

    // Value items are the same as the enum of the selection conditionScope
    const conditionValueItems = computed(
      () => conditionScopeItems.value.find(el => el.scope === conditionScope.value)?.enum
    )
    // Enable reactivity for defining and getting the value from "enum" in the rule object
    const conditionValue: WritableComputedRef<
      IVeoFromSchemaItemRule['condition']['schema']['enum'] | undefined
    > = computed({
      get() {
        return rule.value.condition?.schema?.enum
      },
      set(newValue) {
        vjp.set(rule.value, '/condition/schema/enum', newValue)
        emitRule(rule.value)
      }
    })

    return {
      rule,
      displayTypeItems,
      displayType,
      conditionScope,
      conditionScopeItems,
      conditionValueItems,
      conditionValue
    }
  }
})
</script>

<i18n>
{
  "en": {
    "displayType": "Type of conditional display",
    "displayTypeInput": "Type",
    "displayTypes": {
      "show": "Ehow",
      "hide": "Hide"
    },
    "condition": "Condition",
    "propertyInput": "Property",
    "valueInput": "Value",
    "othersInput": "others"
  },
  "de": {
    "displayType": "Art der bedingten Anzeige",
    "displayTypeInput": "Art",
    "displayTypes": {
      "show": "Anzeigen",
      "hide": "Verstecken"
    },
    "condition": "Bedingung",
    "propertyInput": "Eigenschaft",
    "valueInput": "Wert",
    "othersInput": "andere"

  }
}
</i18n>

<style lang="scss" scoped>
@import '~/assets/vuetify.scss';
</style>
