<script lang="ts">
import { separateUUIDParam } from '~/lib/utils'
import BaseObjectForm from '~/pages/_unit/forms/_form/_entity.vue'
import { getSchemaEndpoint } from '~/plugins/api/schema'

export default BaseObjectForm.extend({
  name: 'veo-forms-objectData-create',
  computed: {
    unitId(): string {
      return separateUUIDParam(this.$route.params.unit).id
    },
    unitRoute() {
      return this.$route.params.unit
    },
    formId(): string {
      return separateUUIDParam(this.$route.params.form).id
    },
    formRoute() {
      return this.$route.params.form
    }
  },
  methods: {
    async action(objectType: string) {
      const createdObjectUUID = await this.create(objectType)
      if (createdObjectUUID) {
        this.$router.push(`/${this.unitRoute}/forms/${this.formRoute}`)
      }
    },
    async create(objectType: string): Promise<string | undefined> {
      return this.$api.entity.create(getSchemaEndpoint(this.objectType || ''), {
        ...this.form.objectData,
        owner: {
          targetUri: `/units/${this.unitId}`
        }
      }).then((data: any) => {
        return data.resourceId
      }).catch((error: { status: number; name: string }) => {
        this.alert.text = error.name
        this.alert.saveButtonText = this.$t('global.button.ok') as string
        this.alert.error = 0
        this.alert.value = true
        return undefined
      })
    }
  }
})
</script>
