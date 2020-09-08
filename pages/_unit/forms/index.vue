<script>
export default {
  middleware({ params, redirect }) {
    // TODO fetchAll forms und redirect zur ersten Form
    return redirect(`/${params.unit}/forms/50093a5c-52e1-4b32-aa52-cb2e13758a1f/`)
  }
}
</script>
