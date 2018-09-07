<template>
    <v-layout row>
        <div v-if="history.length">
            <h2>History for element {{elementId}}</h2>

            <v-data-table :items="history" :headers="tableHeaders">
                <template slot="items" slot-scope="props">
                    <td>
                        {{toHumanReadable(props.item.timestamp)}}
                    </td>
                    <td>
                        {{props.item.author}}
                    </td>
                    <td>
                        <json-display :value="props.item.parsedData" :previousValue="props.index === 0 ? undefined : history[props.index-1].parsedData"></json-display>
                    </td>
                </template>
            </v-data-table>
        </div>
        <h2 v-else>No history found for element {{elementId}}</h2>

    </v-layout>
</template>

<script lang="ts">
import Vue from "vue";
import moment from "moment";
import JsonDisplay from "~/components/JsonDisplay.vue";

export default Vue.extend({
  components: {
    "json-display": JsonDisplay
  },
  async asyncData({ params, $axios }: any) {
    const elementId = params.id;
    const history = await $axios.$get(`/api/elements/${elementId}/history`);
    return {
      elementId: elementId,
      history: history.map(function(oldValue: any) {
        return { ...oldValue, parsedData: JSON.parse(oldValue.data) };
      }),
      tableHeaders: [
        {
          text: "Date",
          value: "timestamp",
          sortable: false
        },
        {
          text: "Author",
          value: "author",
          sortable: false
        },
        {
          text: "Data",
          value: "data",
          sortable: false
        }
      ]
    };
  },

  methods: {
    toHumanReadable: function(date: string) {
      return moment(date).calendar();
    }
  }
});
</script>

<style lang="stylus" scoped>
</style>