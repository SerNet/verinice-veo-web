<script>
export default {
  middleware({ params, redirect }) {
    // TODO fetchAll forms und redirect zur ersten Form
    return redirect(`/${params.unit}/forms/dc763de2-84c3-40e7-b4c2-7e378aba8564/`)
  }
}
</script>
