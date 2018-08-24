<template>
  <v-layout class="form-panels" style="overflow: auto !important;" column>
    <!--<v-alert :dismissible="true" style="width: 100%;" type="basic" :value="true" icon="link">-->
    <!--<span>This element is linked to <b>two</b> elements. <a href="#">View relations</a></span>-->
    <!--</v-alert>-->
    <v-expansion-panel :value="[true]" class="px-3 " :inset="true" :expand="true">
      <v-expansion-panel-content class="grey lighten-3">
        <div slot="header">
          <v-icon>keyboard_arrow_up</v-icon>
          <span style="margin-left: 6px">Basic</span>
        </div>
        <div slot="actions">
          <v-icon>more_vert</v-icon>
        </div>
        <v-card>
          <v-card-text class="white lighten-3">
            <v-form v-if="schema && schema.properties">
              <!-- <v-text-field v-for="(item, key) in model" :key="key" :label="key" :value="item"/> -->
              <abstract-field v-for="(property, key) in schema.properties" :key="key" :name="key" :schema="property" :required="schema.required.includes(key)" :value="model[key]" />
              <!--<v-text-field label="Chapter" v-model="current.chapter" value="M 2.278" append-icon="visibility" :append-icon-cb="() => previewNav.open=true"/>
                    <v-text-field label="State" value="2014"/>
                    <v-text-field label="Title" value="Typische Einsatzszenarien von Routern und Switches"/>
                    <v-text-field label="Life cycle" value="Planung und Konzeption"/>
                    <v-text-field label="Importance" value="Ö" error-messages="Invalid importance level 'Ö'"/>
                    <v-text-field label="Document" value=""/>
                    <v-text-field label="Beschreibung" v-model="desc" multi-line="" rows="3"/>-->
            </v-form>
          </v-card-text>
        </v-card>
      </v-expansion-panel-content>
      <!-- <v-expansion-panel-content :value="true" class="grey lighten-3">
              <div slot="header">
                <v-icon>keyboard_arrow_up</v-icon>
                <span style="margin-left: 6px">IT Baseline Audit</span>
              </div>
              <div slot="actions">
                <v-icon>more_vert</v-icon>
              </div>
              <v-card>
                <v-card-text class="white">
                  <v-form>
                    <v-text-field label="Auditor"/>
                    <v-text-field label="Auditee"/>
                    <v-text-field label="Methods"/>
                    <v-text-field label="Questions"/>
                    <v-text-field label="Document" value=""/>
                    <v-text-field label="Beschreibung" v-model="desc" multi-line="" rows="3"/>
                  </v-form>
                </v-card-text>
              </v-card>
            </v-expansion-panel-content> -->
    </v-expansion-panel>
  </v-layout>
</template>

<script lang="ts">
import Vue from "vue";
import AbstractField from "~/components/Form/AbstractField.vue";

export default Vue.extend({
  components: {
    AbstractField
  },
  data() {
    return {
      current: {
        chapter: "TEST"
      },
      previewNav: { open: false },
      desc:
        "Lorem ipsum dolor sit amet, consectetur \n" +
        "adipiscing elit. Nam gravida venenatis \n" +
        "accumsan. In mi massa, tempus"
    };
  },
  props: {
    model: {
      type: Object
    },
    schema: {
      type: Object
    }
  }
});
</script>
<style lang="stylus">
.form-panels {
  ul.expansion-panel li {
    margin-top: 16px !important;
    max-width: 100% !important;

    .expansion-panel__header {
      padding: 12px;
    }
  }
}

.alert.basic {
  // color: $theme['secondary_text'];
  background-color: #EEE !important;
  border-color: #DDD !important;
}

.breadcrumb-toolbar {
  z-index: 1;

  .breadcrumbs {
    flex-wrap: nowrap;
    padding: 0;
    position: absolute;
    top: 0;
    left: 0;
    right: 0px;
    bottom: 0;

    .breadcrumb-item {
      min-width: 50px;

      a {
        display: block !important;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        padding: 12px 8px;
      }
    }

    li.breadcrumbs__divider {
      padding: 0 2px;
    }
  }
}
</style>
