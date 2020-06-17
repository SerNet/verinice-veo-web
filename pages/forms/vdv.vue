<template>
  <div>
    <div class="d-flex flex-row">
      <div class="d-flex flex-column flex-grow-1 pa-6">
        <div class="mx-auto" style="width:800px">
          <NuxtLink to="/forms/vdv">/</NuxtLink>
          <NuxtLink to="/forms/vdv/111">111</NuxtLink>
          <NuxtLink to="/forms/vdv/222">222</NuxtLink>
          <NuxtLink to="/forms/vdv/333">333</NuxtLink>
          {{ $route.params.process }}

          <NuxtChild :key="$route.params.process" />
        </div>
      </div>
    </div>

    <div class="d-flex flex-row">
      <div class="d-flex flex-column flex-grow-1 pa-6">
        <div class="text-center my-6">
          <v-btn dark class="ma-1" @click="activeLanguage = 'en'">English</v-btn>
          <v-btn dark class="ma-1" @click="activeLanguage = 'de'">Deutsch</v-btn>
        </div>
        <veo-form v-model="form.value" :schema="schema" :ui="form.ui" :lang="lang[activeLanguage]" />
      </div>
    </div>

    <div class="d-flex flex-row">
      <div class="d-flex flex-column flex-grow-1 pa-6">
        <div class="mx-auto" style="width:800px">
          <v-expansion-panels v-model="panel">
            <v-expansion-panel>
              <v-expansion-panel-header>Generated Data</v-expansion-panel-header>
              <v-expansion-panel-content>
                <code>
                  <pre>{{ JSON.stringify(form.value, null, 4) }}</pre>
                </code>
              </v-expansion-panel-content>
            </v-expansion-panel>
          </v-expansion-panels>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'

export default Vue.extend({
  name: 'Forms',
  async asyncData(context) {
    const schema = await context.app.$api.schema.fetch('process')
    schema.$schema = 'http://json-schema.org/draft-07/schema#'
    const translation = await context.app.$api.translation.fetch(['de', 'en'])
    return { schema, lang: translation.lang }
  },
  data() {
    return {
      panel: true,
      activeLanguage: 'de',
      form: {
        ui: {
          type: 'Layout',
          options: {
            direction: 'vertical',
            format: 'group'
          },
          elements: [
            {
              type: 'Layout',
              options: {
                format: 'page'
              },
              elements: [
                {
                  type: 'Label',
                  text: '', // Translation?
                  options: {
                    class: 'display-1'
                  }
                },
                {
                  type: 'Control',
                  scope: '#/properties/abbreviation',
                  options: {
                    label: 'Abkürzung' // Translation?
                  }
                },
                {
                  type: 'Control',
                  scope: '#/properties/name',
                  options: {
                    label: 'Name' // Translation?
                  }
                },
                {
                  type: 'Control',
                  scope: '#/properties/description',
                  options: {
                    label: 'Beschreibung', // Translation?
                    format: 'multiline'
                  }
                },
                {
                  type: 'Control',
                  scope: '#/properties/customAspects/properties/ProcessDsgvoCommons/properties/processStellungnahmedsbPbdaten',
                  options: {
                    label: '#lang/processStellungnahmedsbPbdaten'
                  }
                }
              ]
            },
            {
              type: 'Layout',
              options: {
                format: 'page'
              },
              elements: [
                {
                  type: 'Label',
                  text: '', // Translation?
                  options: {
                    class: 'display-1'
                  }
                },
                {
                  type: 'Control',
                  scope: '#/properties/customAspects/properties/ProcessVaGroup/properties/processVaExternalProcessor',
                  options: {
                    label: '#lang/processVaExternalProcessor'
                  }
                },
                {
                  type: 'Control',
                  scope: '#/properties/customAspects/properties/ProcessVaGroup/properties/processVaArt',
                  options: {
                    label: '#lang/processVaArt',
                    format: 'autocomplete'
                  }
                },
                {
                  type: 'Control',
                  scope: '#/properties/customAspects/properties/ProcessVaGroup/properties/processVaOrt',
                  options: {
                    label: '#lang/processVaOrt',
                    format: 'radio',
                    direction: 'horizontal'
                  }
                },
                {
                  type: 'Control',
                  scope: '#/properties/customAspects/properties/ProcessVaGroup/properties/processVaStadium',
                  options: {
                    label: '#lang/processVaStadium'
                  }
                },
                {
                  type: 'Control',
                  scope: '#/properties/customAspects/properties/ProcessVaGroup/properties/processVaAnzMa',
                  options: {
                    label: '#lang/processVaAnzMa'
                  }
                },
                {
                  type: 'Control',
                  scope: '#/properties/customAspects/properties/ProcessVaGroup/properties/processVaOrtBem',
                  options: {
                    label: '#lang/processVaOrtBem',
                    format: 'multiline'
                  }
                },
                {
                  type: 'Control',
                  scope: '#/properties/customAspects/properties/ProcessVaGroup/properties/processVaInterviewedOn',
                  options: {
                    label: '#lang/processVaInterviewedOn'
                  }
                }
              ]
            },
            {
              type: 'Layout',
              options: {
                format: 'page'
              },
              elements: [
                {
                  type: 'Label',
                  text: '', // Translation?
                  options: {
                    class: 'display-1'
                  }
                },
                {
                  type: 'Control',
                  scope: '#/properties/customAspects/properties/ProcessVaGemensemVerantwortliche/properties/processVaGemenVerant',
                  options: {
                    label: '#lang/processVaGemenVerant'
                  }
                },
                {
                  type: 'Layout',
                  options: {
                    direction: 'vertical',
                    format: 'group'
                  },
                  elements: [
                    // {
                    //   type: 'Control',
                    //   scope: '#/properties/organisation', // missing
                    //   options: {
                    //     label: 'Test'
                    //   }
                    // },
                    {
                      type: 'Control',
                      scope: '#/properties/customAspects/properties/ProcessVaGemensemVerantwortliche/properties/processVaGemenVerantStrass',
                      options: {
                        label: '#lang/processVaGemenVerantStrass'
                      }
                    },
                    {
                      type: 'Control',
                      scope: '#/properties/customAspects/properties/ProcessVaGemensemVerantwortliche/properties/processVaGemenVerantPlz',
                      options: {
                        label: '#lang/processVaGemenVerantPlz'
                      }
                    },
                    {
                      type: 'Control',
                      scope: '#/properties/customAspects/properties/ProcessVaGemensemVerantwortliche/properties/processVaGemenVerantOrt',
                      options: {
                        label: '#lang/processVaGemenVerantOrt'
                      }
                    },
                    // {
                    //   type: 'Control',
                    //   scope: '#/properties/land', // missing
                    //   options: {
                    //     label: 'Test'
                    //   }
                    // },
                    {
                      type: 'Control',
                      scope: '#/properties/customAspects/properties/ProcessVaGemensemVerantwortliche/properties/processVaGemenVerantAnsprech',
                      options: {
                        label: '#lang/processVaGemenVerantAnsprech'
                      }
                    },
                    {
                      type: 'Control',
                      scope: '#/properties/customAspects/properties/ProcessVaGemensemVerantwortliche/properties/processVaGemenVerantTel',
                      options: {
                        label: '#lang/processVaGemenVerantTel'
                      }
                    },
                    {
                      type: 'Control',
                      scope: '#/properties/customAspects/properties/ProcessVaGemensemVerantwortliche/properties/processVaGemenVerantEmail',
                      options: {
                        label: '#lang/processVaGemenVerantEmail'
                      }
                    }
                  ]
                  // rule: {
                  //   effect: 'HIDE',
                  //   condition: {
                  //     scope: '#/properties/gemeinsamFuerDieVerarbeitungVerantwortliche',
                  //     schema: { anyOf: [{ const: false }, { const: null }] }
                  //   }
                  // }
                }
              ]
            },
            {
              type: 'Layout',
              options: {
                format: 'page'
              },
              elements: [
                {
                  type: 'Label',
                  text: '', // Translation?
                  options: {
                    class: 'display-1'
                  }
                },
                {
                  type: 'Control',
                  scope: '#/properties/customAspects/properties/ProcessZbGroup/properties/processZbZweck',
                  options: {
                    label: '#lang/processZbZweck',
                    format: 'multiline'
                  }
                }
              ]
            },
            {
              type: 'Layout',
              options: {
                format: 'page'
              },
              elements: [
                {
                  type: 'Label',
                  text: '', // Translation?
                  options: {
                    class: 'display-1'
                  }
                },
                {
                  type: 'Control',
                  scope: '#/properties/customAspects/properties/ProcessDvGroupRechtsgrundlage/properties/processDvRechtsgrundlage',
                  options: {
                    label: '#lang/processDvRechtsgrundlage'
                  }
                },
                {
                  type: 'Control',
                  scope: '#/properties/customAspects/properties/ProcessDvGroupRechtsgrundlage/properties/processDvVorrVorschr',
                  options: {
                    label: '#lang/processDvVorrVorschr'
                  }
                },
                {
                  type: 'Control',
                  scope: '#/properties/customAspects/properties/ProcessDvGroupRechtsgrundlage/properties/processDvRechtsgrundlageSonst',
                  options: {
                    label: '#lang/processDvRechtsgrundlageSonst'
                  }
                },
                {
                  type: 'Control',
                  scope: '#/properties/customAspects/properties/ProcessDvGroupRechtsgrundlage/properties/processDvRechtsgrundlageErl',
                  options: {
                    label: '#lang/processDvRechtsgrundlageErl',
                    format: 'multiline'
                  }
                }
              ]
            }
          ]
        },
        value: {}
      }
    }
  },
  async created() {
    await this.$api.schema.fetch('process')
  },
  methods: {},
  head() {
    return {
      title: 'Forms'
    }
  }
})
</script>

<style lang="scss" scoped>
code {
  padding: 20px;
  width: 100%;
}
</style>
