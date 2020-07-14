<script>
export default {
  middleware({ params, redirect }) {
    return redirect(`/${params.unit}/data/asset/-/`)
  }
}
</script>
