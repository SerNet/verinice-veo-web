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
        this.formatObjectData()
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
