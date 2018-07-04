<template>
  <v-layout row>
    <tree-nav></tree-nav>
    <v-layout column>
      <v-toolbar class="breadcrumb-toolbar" color="elevation-1" style="overflow: hidden;" dense>
        <v-breadcrumbs class="breadcrumbs" justify-start="" divider="&gt;">
          <v-breadcrumbs-item class="breadcrumb-item" @click.native="changeBreadcrumb(item)" ripple v-for="item in breadcrumb"
                              :key="item">
            {{ item }}
          </v-breadcrumbs-item>
        </v-breadcrumbs>
      </v-toolbar>
      <v-layout row>
        <v-layout class="form-panels" style="overflow: auto !important; height: calc(100vh - 64px - 48px) !important;"
                  column>
          <!--<v-alert :dismissible="true" style="width: 100%;" type="basic" :value="true" icon="link">-->
          <!--<span>This element is linked to <b>two</b> elements. <a href="#">View relations</a></span>-->
          <!--</v-alert>-->
          <v-expansion-panel class="px-3 " :inset="true" :expand="true">
            <v-expansion-panel-content :value="true" class="grey lighten-3">
              <div slot="header">
                <v-icon>keyboard_arrow_up</v-icon>
                <span style="margin-left: 6px">Basic</span>
              </div>
              <div slot="actions">
                <v-icon>more_vert</v-icon>
              </div>
              <v-card>
                <v-card-text class="white lighten-3">
                  <v-form>
                    <v-text-field label="Chapter" v-model="current.chapter" value="M 2.278" append-icon="visibility"
                                  :append-icon-cb="() => previewNav.open=true"/>
                    <v-text-field label="State" value="2014"/>
                    <v-text-field label="Title" value="Typische Einsatzszenarien von Routern und Switches"/>
                    <v-text-field label="Life cycle" value="Planung und Konzeption"/>
                    <v-text-field label="Importance" value="Ö" error-messages="Invalid importance level 'Ö'"/>
                    <v-text-field label="Document" value=""/>
                    <v-text-field label="Beschreibung" v-model="desc" multi-line="" rows="3"/>
                  </v-form>
                </v-card-text>
              </v-card>
            </v-expansion-panel-content>
            <v-expansion-panel-content :value="true" class="grey lighten-3">
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
            </v-expansion-panel-content>
          </v-expansion-panel>
        </v-layout>
      </v-layout>
    </v-layout>
    <preview-nav v-model="previewNav" style="position: absolute; top: 64px;"></preview-nav>
  </v-layout>
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
export default class Form extends Vue {
  changeBreadcrumb(item: any) {
    this.current.chapter = item;
  }
  current = {
    chapter: "TEST"
  };

  previewNav: { open: false };
  desc = "Lorem ipsum dolor sit amet, consectetur \n" +
    "adipiscing elit. Nam gravida venenatis \n" +
    "accumsan. In mi massa, tempus";

  breadcrumb = [
    "IT Network",
    "IT-Systems: Network components",
    "N1 Router zum Internet",
    "B 3.302 Router und Switches",
    "M 2.278 [Z] Typische Einsatzszenarien von Routern und Switches"
  ];
}
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