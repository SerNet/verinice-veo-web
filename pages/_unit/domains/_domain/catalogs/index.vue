<script>
export default {
  middleware({ redirect, params }) {
    redirect(`/${params.unit}/domains/${params.domain}`);
  }
};
</script>
