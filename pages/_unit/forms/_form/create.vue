<script lang="ts">
import Vue from 'vue'
import BaseObjectForm, { ObjectSchemaNames } from '@/pages/_unit/forms/_form/_object.vue'

export default BaseObjectForm.extend({
  name: 'veo-forms-objectData-create',
  computed: {
    unit(): string {
      return this.$route.params.unit
    }
  },
  methods: {
    async action(objectType: ObjectSchemaNames) {
      const createdObjectUUID = await this.create(objectType)
      if (createdObjectUUID) {
        const createdObjectURL = `/${this.unit}/forms/${this.$route.params.form}/${createdObjectUUID}`
        this.$router.push(createdObjectURL)
      } else {
        throw new Error('UUID of the create object does not exist!')
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
  }
})
</script>
