<template>
  <div class="d-flex fill-width align-center justify-center">
    <v-progress-circular indeterminate size="64" color="primary" class="mt-10" />
  </div>
</template>
<script>
import { createUUIDUrlParam, separateUUIDParam } from '~/lib/utils'
export default {
  middleware({ params, redirect, app }) {
    app.$api.form.fetchAll({ unit: separateUUIDParam(params.unit).id }).then(forms => {
      if (forms.length > 0) {
        redirect(`/${params.unit}/forms/${createUUIDUrlParam('form', forms[0].id)}/`)
      }
    })
  }
}
</script>
