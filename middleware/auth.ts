import { NuxtContext, Component } from "vue/types/options";
import Vue from "vue";

export default async function({
  app,
  store,
  route,
  params,
  redirect
}: NuxtContext<any>) {
  if (route.path.indexOf(".") === -1 && !route.path.startsWith("/login")) {
    if (!store.getters["auth/isAuthorized"]) {
      await store.dispatch("auth/redirect", route);
      redirect("/login");
    }
  }
}
