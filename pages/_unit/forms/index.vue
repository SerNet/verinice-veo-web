<template>
  <div class="d-flex align-center justify-center">
    <v-progress-circular indeterminate size="64" color="primary" class="mt-10" />
  </div>
</template>
<script>
export default {
  middleware({ params, redirect, app }) {
    app.$api.form.fetchAll().then((forms) => {
      if (forms.length > 0) {
        redirect(`/${params.unit}/forms/${forms[0].id}/`)
      }
    })
  }
}
</script>
