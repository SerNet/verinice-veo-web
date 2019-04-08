import { createModule, useStore, Mutation } from "vuex-typesafe-class";
import BaseStore from "~/lib/BaseStore";
import HTTPError from "~/exceptions/HTTPError";

class LinksStore extends BaseStore {
  async remove({ id }: { id: string }) {
    await this.$axios.$delete(`/api/links/${id}`).catch(e => {
      throw new HTTPError("REMOVE_LINK_FAILED", { id }, e);
    });
  }
}

export default createModule(LinksStore, "links");
