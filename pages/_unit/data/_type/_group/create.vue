<script lang="ts">
import Vue from 'vue'
import BaseObjectFormCreate, { ObjectSchemaNames } from '@/pages/_unit/forms/_form/create.vue'

export default BaseObjectFormCreate.extend({
  name: 'veo-data-objectData-create',
  async fetch() {
    this.objectType = this.$route.params.type as ObjectSchemaNames
    const formSchema = undefined
    const objectSchema = await this.$api.schema.fetch(this.objectType)
    const objectData = {}
    const { lang } = await this.$api.translation.fetch(['de', 'en'])
    this.form = {
      objectSchema,
      formSchema,
      objectData,
      lang
    }
  },
  computed: {
    objectGroup(): string {
      return this.$route.params.group
    }
  },
  methods: {
    async action(objectType: ObjectSchemaNames) {
      const createdObjectUUID = await this.create(objectType)
      if (createdObjectUUID) {
        const createdObjectURL = `/${this.unit}/data/${this.objectType}/${this.objectGroup}/${createdObjectUUID}/links`
        this.$router.push(createdObjectURL)
      } else {
        throw new Error('UUID of the create object does not exist!')
      }
    }
  }
})
</script>
