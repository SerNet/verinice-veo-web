import { Context } from "~/types/nuxt";
import { useStore } from "vuex-typesafe-class";
import authStore from "~/store/auth";

export default async function({ $axios, app, store, route, params, redirect }: Context) {
  const $auth = useStore(authStore, store);

  if (route.path.indexOf(".") === -1 && !route.path.startsWith("/login")) {
    if (!$auth.isAuthorized) {
      await $auth.redirect(route);
      redirect("/login");
    }
  }

  $axios.onError(async err => {
    if (err.response && err.response.status == 403) {
      await $auth.redirect(route);
      await $auth.logout();
      redirect("/login");
    }
  });
}
