<template>
  <div class="toolbar-logo">
    <div class="inner hidden-xs-only">
      <div class="hidden-xs-only">
        <h1 class="app-title">verinice.VEO</h1>
      </div>
      <svg class="hidden-sm-and-up" viewBox="0 0 28 22" version="1.1" xmlns="http://www.w3.org/2000/svg">
        <g stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
          <path
            id="v."
            d="M10.1757812,21.390625 L9.19921875,21.390625 L0.234375,0.0234375 L4.296875,0.0234375 L9.82421875,14.671875 L15.46875,0.0234375 L19.3554688,0.0234375 L10.1757812,21.390625 Z M21.1328125,15.5117188 C21.9401082,15.5117188 22.6302055,15.7981742 23.203125,16.3710938 C23.7760445,16.9440133 24.0625,17.6341105 24.0625,18.4414062 C24.0625,19.248702 23.7760445,19.9420544 23.203125,20.5214844 C22.6302055,21.1009144 21.9401082,21.390625 21.1328125,21.390625 C20.3255168,21.390625 19.6354195,21.1009144 19.0625,20.5214844 C18.4895805,19.9420544 18.203125,19.248702 18.203125,18.4414062 C18.203125,17.6341105 18.4895805,16.9440133 19.0625,16.3710938 C19.6354195,15.7981742 20.3255168,15.5117188 21.1328125,15.5117188 Z"
            fill="#E53935"
          />
        </g>
      </svg>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'

export default Vue.extend({})
</script>

<style lang="scss" scoped>
.toolbar-logo {
  align-items: center;
  display: flex;
  height: 100%;
  overflow: hidden;

  .inner {
    svg {
      height: 100%;
    }
  }

  .app-title {
    color: #e53935;
    font-family: 'Trebuchet MS', Helvetica, Arial, sans-serif;
    font-size: 40px;
    font-weight: normal;
    -moz-user-select: none;
    -ms-user-select: none;
    -webkit-user-select: none;
    user-select: none;
  }
}

@media only screen and (max-width: 599px /* 959 */) {
  .toolbar-logo > .inner {
    height: 36px;
    width: 40px;
  }
}
</style>
