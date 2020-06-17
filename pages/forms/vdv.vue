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
        <veo-form v-model="form.value" :schema="form.schema" :ui="form.ui" :lang="form['lang'][activeLanguage]" />
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
    const translation = await context.app.$api.translation.fetch(['de', 'en'])
    return { schema, lang: translation.lang }
  },
  data() {
    return {
      panel: true,
      activeLanguage: 'de',
      form: {
        schema: {
          type: 'object',
          required: ['abkuerzung', 'name', 'befragungDurchgefuehrtAm'],
          properties: {
            abkuerzung: {
              type: 'string'
            },
            name: {
              type: 'string'
            },
            beschreibung: {
              type: 'string'
            },
            personenbezogeneDaten: {
              type: 'boolean'
            },
            verarbeitungAlsAuftraarbeiter: {
              type: 'boolean'
            },
            artDerVerarbeitung: {
              type: 'array',
              items: {
                enum: [
                  '#lang/verarbeitungsAngaben/artDerVerarbeitung/enum/0',
                  '#lang/verarbeitungsAngaben/artDerVerarbeitung/enum/1',
                  '#lang/verarbeitungsAngaben/artDerVerarbeitung/enum/2'
                ]
              }
            },
            ortDerDatenverabeitung: {
              type: 'string',
              enum: ['#lang/verarbeitungsAngaben/ortDerDatenverabeitung/enum/0', '#lang/verarbeitungsAngaben/ortDerDatenverabeitung/enum/1']
            },
            betriebsstadium: {
              type: 'string',
              enum: [
                '#lang/verarbeitungsAngaben/betriebsstadium/enum/0',
                '#lang/verarbeitungsAngaben/betriebsstadium/enum/1',
                '#lang/verarbeitungsAngaben/betriebsstadium/enum/2',
                '#lang/verarbeitungsAngaben/betriebsstadium/enum/3'
              ]
            },
            anzahlMitarbeiter: {
              type: 'integer'
            },
            bemerkungen: {
              type: 'string'
            },
            befragungDurchgefuehrtAm: {
              type: 'string',
              format: 'date'
            },
            gemeinsamFuerDieVerarbeitungVerantwortliche: {
              type: 'boolean'
            },
            organisation: {
              type: 'string' // missing
            },
            strasse: {
              type: 'string'
            },
            postleitzahl: {
              type: 'string'
            },
            ort: {
              type: 'string'
            },
            land: {
              type: 'string' // missing
            },
            ansprechpartner: {
              type: 'string'
            },
            telefon: {
              type: 'string'
            },
            eMail: {
              type: 'string'
            },
            zweckDerVerarbeitung: {
              type: 'string'
            },
            rechtsgrundlage: {
              type: 'array',
              items: {
                type: 'string',
                enum: [
                  '#lang/rechtsgrundlage/rechtsgrundlage/enum/0',
                  '#lang/rechtsgrundlage/rechtsgrundlage/enum/1',
                  '#lang/rechtsgrundlage/rechtsgrundlage/enum/2',
                  '#lang/rechtsgrundlage/rechtsgrundlage/enum/3',
                  '#lang/rechtsgrundlage/rechtsgrundlage/enum/4'
                ]
              }
            },
            vorrangigeRechtsvorschriften: {
              type: 'string'
            },
            sonstigeRechtsgrundlagen: {
              type: 'string'
            },
            erlaeuterungen: {
              type: 'string'
            }
          }
        },
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
                  text: '#lang/verarbeitungstaetigkeit/label',
                  options: {
                    class: 'display-1'
                  }
                },
                {
                  type: 'Control',
                  scope: '#/properties/abbreviation',
                  options: {
                    label: '#lang/verarbeitungstaetigkeit/abkuerzung'
                  }
                },
                {
                  type: 'Control',
                  scope: '#/properties/name',
                  options: {
                    label: '#lang/verarbeitungstaetigkeit/name'
                  }
                },
                {
                  type: 'Control',
                  scope: '#/properties/description',
                  options: {
                    label: '#lang/verarbeitungstaetigkeit/beschreibung',
                    format: 'multiline'
                  }
                },
                {
                  type: 'Control',
                  scope: '#/properties/customAspects/properties/ProcessDsgvoCommons/properties/processStellungnahmedsbPbdaten',
                  options: {
                    label: '#lang/verarbeitungstaetigkeit/personenbezogeneDaten'
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
                  text: '#lang/verarbeitungsAngaben/label',
                  options: {
                    class: 'display-1'
                  }
                },
                {
                  type: 'Control',
                  scope: '#/properties.customAspects.properties.ProcessVaGroup.properties.processVaExternalProcessor',
                  options: {
                    label: '#lang/verarbeitungsAngaben/verarbeitungAlsAuftraarbeiter'
                  }
                },
                {
                  type: 'Control',
                  scope: '#/properties.customAspects.properties.ProcessVaGroup.properties.processVaArt',
                  options: {
                    label: '#lang/verarbeitungsAngaben/artDerVerarbeitung/label',
                    format: 'autocomplete'
                  }
                },
                {
                  type: 'Control',
                  scope: '#/properties.customAspects.properties.ProcessVaGroup.properties.processVaOrt',
                  options: {
                    label: '#lang/verarbeitungsAngaben/ortDerDatenverabeitung/label',
                    format: 'radio',
                    direction: 'horizontal'
                  }
                },
                {
                  type: 'Control',
                  scope: '#/properties.customAspects.properties.ProcessVaGroup.properties.processVaStadium',
                  options: {
                    label: '#lang/verarbeitungsAngaben/betriebsstadium/label'
                  }
                },
                {
                  type: 'Control',
                  scope: '#/properties.customAspects.properties.ProcessVaGroup.properties.processVaAnzMa',
                  options: {
                    label: '#lang/verarbeitungsAngaben/anzahlMitarbeiter'
                  }
                },
                {
                  type: 'Control',
                  scope: '#/properties.customAspects.properties.ProcessVaGroup.properties.processVaOrtBem',
                  options: {
                    label: '#lang/verarbeitungsAngaben/bemerkungen',
                    format: 'multiline'
                  }
                },
                {
                  type: 'Control',
                  scope: '#/properties.customAspects.properties.ProcessVaGroup.properties.processVaInterviewedOn',
                  options: {
                    label: '#lang/verarbeitungsAngaben/befragungDurchgefuehrtAm'
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
                  text: '#lang/gemeinsameVerantwortliche/label',
                  options: {
                    class: 'display-1'
                  }
                },
                {
                  type: 'Control',
                  scope: '#/properties.customAspects.properties.ProcessVaGemensemVerantwortliche.properties.processVaGemenVerant',
                  options: {
                    label: '#lang/gemeinsameVerantwortliche/gemeinsamFuerDieVerarbeitungVerantwortliche'
                  }
                },
                {
                  type: 'Layout',
                  options: {
                    direction: 'vertical',
                    format: 'group'
                  },
                  elements: [
                    {
                      type: 'Control',
                      scope: '#/properties/organisation', // missing
                      options: {
                        label: '#lang/gemeinsameVerantwortliche/organisation'
                      }
                    },
                    {
                      type: 'Control',
                      scope: '#/properties.customAspects.properties.ProcessVaGemensemVerantwortliche.properties.processVaGemenVerantStrass',
                      options: {
                        label: '#lang/gemeinsameVerantwortliche/strasse'
                      }
                    },
                    {
                      type: 'Control',
                      scope: '#/properties.customAspects.properties.ProcessVaGemensemVerantwortliche.properties.processVaGemenVerantPlz',
                      options: {
                        label: '#lang/gemeinsameVerantwortliche/postleitzahl'
                      }
                    },
                    {
                      type: 'Control',
                      scope: '#/properties.customAspects.properties.ProcessVaGemensemVerantwortliche.properties.processVaGemenVerantOrt',
                      options: {
                        label: '#lang/gemeinsameVerantwortliche/ort'
                      }
                    },
                    {
                      type: 'Control',
                      scope: '#/properties/land', // missing
                      options: {
                        label: '#lang/gemeinsameVerantwortliche/land'
                      }
                    },
                    {
                      type: 'Control',
                      scope: '#/properties.customAspects.properties.ProcessVaGemensemVerantwortliche.properties.processVaGemenVerantAnsprech',
                      options: {
                        label: '#lang/gemeinsameVerantwortliche/ansprechpartner'
                      }
                    },
                    {
                      type: 'Control',
                      scope: '#/properties.customAspects.properties.ProcessVaGemensemVerantwortliche.properties.processVaGemenVerantTel',
                      options: {
                        label: '#lang/gemeinsameVerantwortliche/telefon'
                      }
                    },
                    {
                      type: 'Control',
                      scope: '#/properties.customAspects.properties.ProcessVaGemensemVerantwortliche.properties.processVaGemenVerantEmail',
                      options: {
                        label: '#lang/gemeinsameVerantwortliche/eMail'
                      }
                    }
                  ],
                  rule: {
                    effect: 'HIDE',
                    condition: {
                      scope: '#/properties/gemeinsamFuerDieVerarbeitungVerantwortliche',
                      schema: { anyOf: [{ const: false }, { const: null }] }
                    }
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
                  text: '#lang/zweckbestimmung/label',
                  options: {
                    class: 'display-1'
                  }
                },
                {
                  type: 'Control',
                  scope: '#/properties.customAspects.properties.ProcessZbGroup.properties.processZbZweck',
                  options: {
                    label: '#lang/zweckbestimmung/zweckDerVerarbeitung',
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
                  text: '#lang/rechtsgrundlage/label',
                  options: {
                    class: 'display-1'
                  }
                },
                {
                  type: 'Control',
                  scope: '#/properties.customAspects.properties.ProcessDvGroupRechtsgrundlage.properties.processDvRechtsgrundlage',
                  options: {
                    label: '#lang/rechtsgrundlage/label' // ?
                  }
                },
                {
                  type: 'Control',
                  scope: '#/properties.customAspects.properties.ProcessDvGroupRechtsgrundlage.properties.processDvVorrVorschr',
                  options: {
                    label: '#lang/rechtsgrundlage/vorrangigeRechtsvorschriften'
                  }
                },
                {
                  type: 'Control',
                  scope: '#/properties.customAspects.properties.ProcessDvGroupRechtsgrundlage.properties.processDvRechtsgrundlageSonst',
                  options: {
                    label: '#lang/rechtsgrundlage/sonstigeRechtsgrundlagen'
                  }
                },
                {
                  type: 'Control',
                  scope: '#/properties.customAspects.properties.ProcessDvGroupRechtsgrundlage.properties.processDvRechtsgrundlageErl',
                  options: {
                    label: '#lang/rechtsgrundlage/erlaeuterungen',
                    format: 'multiline'
                  }
                }
              ]
            }
          ]
        },
        lang: {
          en: {
            verarbeitungstaetigkeit: {
              label: '',
              abkuerzung: '',
              name: '',
              beschreibung: '',
              personenbezogeneDaten: ''
            },
            verarbeitungsAngaben: {
              label: '',
              verarbeitungAlsAuftraarbeiter: '',
              artDerVerarbeitung: {
                label: '',
                enum: ['', '', '']
              },
              ortDerDatenverabeitung: {
                label: '',
                enum: ['', '']
              },
              betriebsstadium: {
                label: '',
                enum: ['', '', '', '']
              },
              anzahlMitarbeiter: '',
              bemerkungen: '',
              befragungDurchgefuehrtAm: ''
            },
            gemeinsameVerantwortliche: {
              label: '',
              gemeinsamFuerDieVerarbeitungVerantwortliche: '',
              organisation: '',
              strasse: '',
              postleitzahl: '',
              ort: '',
              land: '',
              ansprechpartner: '',
              telefon: '',
              eMail: ''
            },
            zweckbestimmung: {
              label: '',
              zweckDerVerarbeitung: ''
            },
            rechtsgrundlage: {
              label: '',
              rechtsgrundlage: {
                label: '',
                enum: ['', '', '', '', '']
              },
              vorrangigeRechtsvorschriften: '',
              sonstigeRechtsgrundlagen: '',
              erlaeuterungen: ''
            }
          },
          de: {
            verarbeitungstaetigkeit: {
              label: 'Verarbeitungstätigkeit',
              abkuerzung: 'Abkürzung*',
              name: 'Name*',
              beschreibung: 'Beschreibung',
              personenbezogeneDaten: 'Personenbezogene Daten'
            },
            verarbeitungsAngaben: {
              label: 'Verarbeitungsangaben',
              verarbeitungAlsAuftraarbeiter: 'Verarbeitung als Auftragsverarbeiter nach Art. 30 II DS-GVO',
              artDerVerarbeitung: {
                label: 'Art der Verarbeitung',
                enum: ['Ersterhebung', 'Neue Verarbeitung', 'Änderung einer Verarbeitung']
              },
              ortDerDatenverabeitung: {
                label: 'Ort der Datenverarbeitung',
                enum: ['Intern', 'Extern']
              },
              betriebsstadium: {
                label: 'Betriebsstadium',
                enum: ['Planung', 'Test', 'Roll-Out', 'Betrieb']
              },
              anzahlMitarbeiter: 'Anzahl Mitarbeiter',
              bemerkungen: 'Bemerkungen',
              befragungDurchgefuehrtAm: 'Befragung durchgeführt am'
            },
            gemeinsameVerantwortliche: {
              label: 'Gemeinsame Verantwortliche',
              gemeinsamFuerDieVerarbeitungVerantwortliche: 'Gemeinsam für die Verarbeitung Verantwortliche',
              organisation: 'Organisation',
              strasse: 'Straße',
              postleitzahl: 'Postleitzahl',
              ort: 'Ort',
              land: 'Land',
              ansprechpartner: 'Ansprechpartner',
              telefon: 'Telefon',
              eMail: 'E-Mail'
            },
            zweckbestimmung: {
              label: 'Zweckbestimmung',
              zweckDerVerarbeitung: 'Zweck der Verarbeitung'
            },
            rechtsgrundlage: {
              label: 'Rechtsgrundlage',
              rechtsgrundlage: {
                label: 'Rechtsgrundlage',
                enum: [
                  'Rechtsvorschriften aus DS-GVO',
                  'Ergänzende nationale Regelungen',
                  'Einwilligung des Betroffenen',
                  'Vorrangige Rechtsvorschriften (s.u.)',
                  'Sonstige Rechtsgrundlagen'
                ]
              },
              vorrangigeRechtsvorschriften: 'Vorrangige Rechtsvorschriften',
              sonstigeRechtsgrundlagen: 'Sonstige Rechtsgrundlagen',
              erlaeuterungen: 'Erläuterungen'
            }
          }
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
