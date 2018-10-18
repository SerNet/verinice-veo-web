<template>
  <div>
    <button @click="removeItemFromTop()">Test</button>
    <ul>
      <!-- <li v-for="(item) in items" :key="item['$veo.id']">
                <span>{{item['$veo.id']}}</span>
                <span>&nbsp;&middot;&nbsp;</span>
                <span>{{item['$veo.title']}}</span>
            </li> -->

      <list-element @click.native="removeItemFromTop()" v-for="(item) in items" :key="item['$veo.id']" :id="item['$veo.id']" :title="item['$veo.title']"></list-element>
    </ul>
  </div>
</template>
<script lang="ts">
import Vue from "vue";
import axios from "axios";
import ListElement from "~/components/ListElement.vue";

interface VeoElement {
  "$veo.id": string;
  test: string;
}

export default Vue.extend({
  components: {
    ListElement: ListElement
  },
  data() {
    return {
      foo: "bar",
      testItems: [],
      items: [{ id: 1, title: "Test 1" }, { id: 2, title: "Test 2" }]
    };
  },
  methods: {
    removeItemFromTop() {
      this.items.splice(0, 1);
    }
  },
  async created() {
    console.log("test.vue", "created");
    const response = await axios("/api/elements", {
      headers: {
        Authorization:
          "Bearer eyJhbGciOiJSUzUxMiJ9.eyJleHAiOjE1MzY5OTc5MDAsInN1YiI6ImFkbWluIiwiaXNzIjoidmVyaW5pY2UuVkVPIiwiaWF0IjoxNTM2MTMzOTAwLCJhdWQiOiJ2ZXJpbmljZS5SRVNUIGNsaWVudHMiLCJwcm9maWxlcyI6WyJleHBvcnQiLCJpbXBvcnQiLCJ0YXNrcyJdfQ.f_IBnRYxDv7LxhrxtI9vzFwrPKnK0Tv4kVcSAxCKLEDqiqKmvYQirbGiipibLH-tafpdDMR2kHj7LMyPgRsJxW7u6vH6y3Ac1sb01wSKtoxK18Nli6aDAu4SLkOCHQeMxV2XCqzJvwGakWYExJpcCYNFK_zW-RzAWvmGVn6B5ynmPLXItZuxEWnd-lJU71OdH_dlHLxjLTkS_2k7bccbNweSdFsM6nn8s496yU3kefHy52FfHBd2pyGPFU0uomPTThiu61OeHLaIxNNRJB5f6Nj7DSmZyBvIlaCh50cviYU8GowAW_fkyW8djkhukfNYBEnDzbNXqNxtEim0YxXgjw"
      }
    });
    const liste = response.data;
    this.testItems = liste;
  },
  mounted() {
    console.log("test.vue", "mounted");
  },
  async asyncData(context: any) {
    console.log("test.vue", "asyncData");
    return {
      testItems: await context.$axios.$get("/api/elements")
    };
  }
});
</script>
<style lang="stylus" scoped>
ul {
  margin: 10px;
}
</style>
