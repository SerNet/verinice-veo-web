<script>
export default {
  middleware({ params, redirect }) {
    return redirect(`/data/${params.type}/-/`)
  }
}
</script>
