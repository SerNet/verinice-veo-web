import { NuxtContext, Component } from "vue/types/options";
import Vue from "vue";

export default async function({ app, store, route, params }: NuxtContext<any>) {
  if (route.matched) {
    route.matched.forEach(match => {
      //console.log("CMP", match.components);
      match.components["left"] = Vue.extend({ template: "<h1>TESTX</h1>" });
      //match.components["left"] = null;
    });
  }
  /* const router = app.router;
  const leftRoute = route.query.left;
  let leftComponent: any;
  //const metadata = route.meta[0];

  const matched = router
    .getMatchedComponents(leftRoute)
    .map((component: any) => {
      if (typeof component === "object" && !component.options) {
        // Updated via vue-router resolveAsyncComponents()
        component = Vue.extend(component);
        component["_Ctor"] = component;
      }
    });

  leftComponent = (matched && matched.length && matched[0]) || undefined;

  route["leftComponent"] = leftComponent;

  if (route.matched) {
    route.matched.forEach(match => {
      //console.log("CMP", match.components);
      match.components["left"] = leftComponent;
      //match.components["left"] = null;
    });
  }*/
}
