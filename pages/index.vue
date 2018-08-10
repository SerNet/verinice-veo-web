<template>
    <div>Hello World</div>
</template>

<script lang="ts">
import {
  Component,
  Inject,
  Model,
  Prop,
  Vue,
  Watch
} from "nuxt-property-decorator";
import { namespace } from "nuxt-class-component";

@Component({})
export default class extends Vue {}
</script>

<style lang="stylus" scoped>
div {
    padding: 10px;
}
</style>