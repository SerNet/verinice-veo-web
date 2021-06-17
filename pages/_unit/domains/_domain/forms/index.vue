<script>
export default {
  middleware({ redirect }) {
    redirect(`/${this.$route.params.unit}`);
  }
};
</script>
