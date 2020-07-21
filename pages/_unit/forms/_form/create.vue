<template>
  <div>
    <template v-if="$fetchState.pending">
      <div class="text-center ma-12">
        <v-progress-circular indeterminate color="primary" size="50" />
      </div>
    </template>

    <template v-else>
      <div class="d-flex flex-row">
        <div class="d-flex flex-column flex-grow-1 pa-6">
          <div class="text-center my-6">
            <v-btn dark class="ma-1" @click="activeLanguage = 'en'">English</v-btn>
            <v-btn dark class="ma-1" @click="activeLanguage = 'de'">Deutsch</v-btn>
          </div>

          <div class="mx-auto pa-3" style="width:800px">
            <div class="display-1">{{ form.objectData.name }}</div>
          </div>

          <veo-form
            v-if="!$fetchState.pending"
            v-model="form.objectData"
            :schema="form.objectSchema"
            :ui="form.formSchema && form.formSchema.content"
            :lang="form.lang && form.lang[activeLanguage]"
          />
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
                    <pre>{{ JSON.stringify(form.objectData, null, 4) }}</pre>
                  </code>
                </v-expansion-panel-content>
              </v-expansion-panel>
            </v-expansion-panels>
          </div>
        </div>
      </div>

      <div class="d-flex flex-row">
        <div class="d-flex flex-column flex-grow-1 pa-6">
          <div class="mx-auto" style="width:800px">
            <v-btn color="primary" :loading="btnLoading" block @click="onClick">Speichern</v-btn>
            <AppStateAlert v-model="state" state-after-alert="start" />
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import { IForm } from '@/lib/utils'
import BaseObjectForm, { ObjectSchemaNames } from '@/pages/_unit/forms/_form/_object.vue'

export default BaseObjectForm.extend({
  name: 'Forms',
  computed: {
    unit(): string {
      return this.$route.params.unit
    }
  },
  methods: {
    async onClick() {
      this.btnLoading = true
      try {
        if (this.form.objectData.customAspects) {
          Object.keys(this.form.objectData.customAspects).forEach((key: string) => {
            this.form.objectData.customAspects[key] = { ...this.form.objectData.customAspects[key], id: '00000000-0000-0000-0000-000000000000', type: key }
          })
        }

        if (this.objectType) {
          const createdObjectUUID = await this.create(this.objectType)
          if (createdObjectUUID) {
            const createdObjectURL = `/${this.unit}/forms/${this.$route.params.form}/${createdObjectUUID}`
            this.$router.push(createdObjectURL)
          } else {
            throw new Error('UUID of the create object does not exist!')
          }
        } else {
          throw new Error('Object Type is not defined in FormSchema')
        }
      } catch (e) {
        this.state = 'error'
        console.error(e)
      } finally {
        this.btnLoading = false
      }
    },
    async create(objectType: ObjectSchemaNames): Promise<string | undefined> {
      const res = await this.$api[objectType].create({
        ...this.form.objectData,
        owner: {
          href: `/units/${this.unit}`
        }
      })
      return res.resourceId
    }
  },
  head() {
    return {
      title: 'Form'
    }
  }
})
</script>

<style lang="scss" scoped>
code {
  padding: 0;
  width: 100%;
  display: block;
}
</style>
