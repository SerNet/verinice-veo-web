<script>
export default {
  middleware({ params, redirect }) {
    return redirect(`/${params.unit}/objects/${params.type}/-/`)
  }
}
</script>
