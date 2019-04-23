import { ApiItem, ApiLink, ApiHistory, UUID } from "~/types/api";
import { AppElement, AppHistory, AppLink } from "~/types/app";
import { JSONSchema6 } from "json-schema";
import { createModule, useStore } from "vuex-typesafe-class";
import NumericStringComparator from "~/lib/NumericStringComparator";
import { uniq } from "lodash";
import BaseStore from "~/lib/BaseStore";
import { veoItemToElement, veoLinkToLink } from "~/lib/utils";
import ElementsStore from "../index";
import SchemasStore from "~/store/schemas";
import moment from "moment";
import HTTPError from "~/exceptions/HTTPError";
import { ID_FIELD } from "~/config/api";

class ActiveElementsStore extends BaseStore {
  data?: ApiItem = undefined;
  schemaData?: JSONSchema6 = undefined;
  linksData: ApiLink[] = [];
  historyData: ApiHistory[] = [];

  get $parent() {
    return useStore(ElementsStore, this);
  }

  get $schemas() {
    return useStore(SchemasStore, this);
  }

  get schema() {
    return this.schemaData;
  }
  get item(): AppElement | undefined {
    return this.data && veoItemToElement(this.data);
  }
  get breadcrumb(): AppElement[] {
    const items = this.$parent.items;
    let item = this.item;
    const path: AppElement[] = [];
    while (item) {
      path.unshift(item);
      const parent = item.parent;
      item = parent ? items[parent] : undefined;
    }
    return path;
  }
  get schemaName(): string | undefined {
    return this.item && this.item.type;
  }
  get links(): AppLink[] | undefined {
    const comparator = new NumericStringComparator();
    const links = this.linksData;
    const itemMap = this.$parent.items;
    return (
      links &&
      links
        .map(data => {
          const item = veoLinkToLink(data);
          item.source = itemMap[item.sourceId];
          item.target = itemMap[item.targetId];
          return item;
        })
        .sort((a, b) => comparator.compare(a.source && a.source.title, b.source && b.source.title))
    );
  }
  get history(): AppHistory[] | undefined {
    return this.historyData
      ? this.historyData
          .map(item => {
            return {
              id: moment(item.timestamp).unix(),
              author: item.author,
              timestamp: item.timestamp,
              data: item.data
            };
          })
          .sort((a, b) => b.id - a.id)
      : undefined;
  }
  get children(): AppElement[] {
    const items = this.$parent.items;
    const item = this.item;
    const childMap = this.$parent.children;
    const childs: UUID[] = (item && childMap[item.id]) || [];
    return childs.map(id => items[id]);
  }

  set setItem(value: ApiItem | undefined) {
    this.data = value;
  }
  set setSchema(value: JSONSchema6) {
    this.schemaData = value;
  }
  set setLinks(value: ApiLink[]) {
    this.linksData = value;
  }
  set setHistory(value: ApiHistory[]) {
    this.historyData = value;
  }

  async fetchItem({ id, refresh }: { id: UUID; refresh?: boolean }) {
    const currentItem = this.item;
    if (currentItem && currentItem.id == id && !refresh) {
      return; //already loaded
    }
    this.setItem = undefined;
    const item = await this.$parent.fetchItem({ id, refresh });

    const response: ApiItem = item.data;
    this.setItem = response;

    let pLinks, pHistory, pChildren, pBreadcrumbs;

    pLinks = this.fetchLinks({ id });
    pHistory = this.fetchHistory({ id });
    pChildren = this.$parent.fetchChildren({ id });
    pBreadcrumbs = this.fetchBreadcrumb({ id });
    await Promise.all([pLinks, pHistory, pChildren, pBreadcrumbs]);
    return item;
  }
  async fetchBreadcrumb({ id }: { id: UUID }) {
    await this.$parent.fetchTree({ id });
  }
  async fetchSchema({ name }: { name: string }) {
    const schema = await this.$schemas.fetchSchema({ name });
    this.setSchema = schema;
  }
  async fetchLinks({ id }: { id: UUID }) {
    //commit("setLinks", []);
    const response: any = await this.$axios.$get(`/api/elements/${id}/links`).catch(e => {
      throw new HTTPError("FETCH_LINKS_FAILED", { id }, e);
    });
    if (response) {
      this.setLinks = response;
      const links = this.links;
      if (links) {
        const ids = links.reduce(
          (out, link) => {
            out.push(link.sourceId);
            out.push(link.targetId);
            return out;
          },
          [] as UUID[]
        );
        await this.$parent.fetchItems({ id: uniq(ids) });
      }
    }
  }
  async fetchHistory({ id }: { id: UUID }) {
    const response: any = await this.$axios.$get(`/api/elements/${id}/history`).catch(e => {
      throw new HTTPError("FETCH_HISTORY_FAILED", { id }, e);
    });
    if (response) {
      this.setHistory = response;
    }
  }
  async save(payload: ApiItem) {
    let id = payload[ID_FIELD];

    if (id) {
      await this.$axios.$put(`/api/elements/${id}`, payload).catch(e => {
        throw new HTTPError("UPDATE_ELEMENT_FAILED", { id: id || "?" }, e);
      });
    } else {
      const response = await this.$axios.post(`/api/elements`, payload).catch(e => {
        throw new HTTPError("CREATE_ELEMENT_FAILED", e);
      });
      const location = response.headers.location || "";
      id = location.split("/").pop();
    }

    id && (await this.fetchItem({ id, refresh: true }));
    return id;
  }
}

export default createModule(ActiveElementsStore, "elements/active");
