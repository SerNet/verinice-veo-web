import { keyBy, unionWith } from "lodash";
import { createModule } from "vuex-typesafe-class";
import { ID_FIELD, PARENT_FIELD, TITLE_FIELD, TYPE_FIELD } from "~/config/api";
import HTTPError from "~/exceptions/HTTPError";
import LocalizedError from "~/exceptions/LocalizedError";
import BaseStore from "~/lib/BaseStore";
import NumericStringComparator from "~/lib/NumericStringComparator";
import { veoItemToElement } from "~/lib/utils";
import { ApiItem, UUID } from "~/types/api";
import { AppElement } from "~/types/app";

class ElementsStore extends BaseStore {
  fetchedAll: boolean = false;
  data: ApiItem[] = [];

  /**
   * Used to detect leafs and yet loaded children
   */
  childCount: Record<UUID, number> = {};

  /**
   * Record of element ids and app elements
   */
  get items(): Record<UUID, AppElement> {
    return keyBy(this.data.map(veoItemToElement), "id");
  }

  /**
   * Record of parent ids and their corresponding child ids
   */
  get children(): Record<UUID, UUID[]> {
    const comparator = new NumericStringComparator();
    return this.data
      .concat()
      .sort((a, b) => comparator.compare(a[TITLE_FIELD], b[TITLE_FIELD]))
      .filter(item => item[PARENT_FIELD]) //nur Element mit Parent
      .reduce(
        (itemMap, item) => {
          const id = item[ID_FIELD];
          const parent = item[PARENT_FIELD];
          const children = (itemMap[parent] = itemMap[parent] || []);
          if (id) children.push(id);
          itemMap[parent] = children;
          return itemMap;
        },
        {} as Record<UUID, UUID[]>
      );
  }

  /**
   * Array of root items
   */
  get roots(): AppElement[] {
    return this.data.filter(item => !item[PARENT_FIELD]).map(item => this.items[item[ID_FIELD]!]);
  }

  get knowsChildren() {
    return (id: UUID) => {
      if (this.fetchedAll) return true;
      return this.childCount[id] !== undefined;
    };
  }

  get countChildren() {
    return (id: UUID) => {
      const stateCount = this.childCount[id];
      if (stateCount !== undefined) {
        return stateCount;
      } else {
        const children = this.children[id];
        if (children) {
          return children.length;
        }
      }
      return -1;
    };
  }

  set setData(value: ApiItem[]) {
    this.data = value;
  }

  set nextData(value: ApiItem[]) {
    this.data = this.data.concat(value);
  }

  set setChildCount({ id, count }: { id: UUID; count: number }) {
    this.childCount[id] = count;
  }

  set setFetchedAll(value: boolean) {
    this.fetchedAll = value;
  }

  async init() {}

  async createItem({ parent, type }: { parent?: UUID; type: string }) {
    const response = await this.$axios.post<ApiItem>(`/api/elements`, {
      [PARENT_FIELD]: parent,
      [TYPE_FIELD]: type,
      [TITLE_FIELD]: "Neues Unterelement"
    });
    await this.fetchAll({ refresh: true });

    return String(response.headers["location"])
      .split("/")
      .pop();
  }

  async addData({ data, refresh }: { data: ApiItem[]; refresh?: boolean }) {
    const items = this.items;
    if (refresh) {
      const union = unionWith(data, this.data, (a, b) => a[ID_FIELD] == b[ID_FIELD]);

      this.setData = union;
    } else {
      const uniqueData = data.filter(item => {
        const id = item[ID_FIELD];
        return id ? !items[id] : false;
      });
      this.nextData = uniqueData;
    }
  }

  async searchItems({ q, maxResults = 10 }: { q: string; maxResults?: number }) {
    const items = this.items;
    const s = q && new RegExp(q, "i");
    const results: AppElement[] = [];
    for (let i = 0; i < this.data.length && results.length < maxResults; i++) {
      const item = this.data[i];
      if (item[TITLE_FIELD] && s ? s.test(item[TITLE_FIELD]) : true) {
        results.push(items[item[ID_FIELD]!]);
      }
    }
    return results;
  }
  /**
   * Fetch entry from Server
   */
  async fetchItem({ id, refresh }: { id: UUID; refresh?: boolean }) {
    const items = this.items;
    if (!refresh && items[id]) {
      return items[id];
    } else {
      const response: ApiItem = await this.$axios.$get<ApiItem>(`/api/elements/${id}`).catch(e => {
        throw new LocalizedError("FETCH_ELEMENT_FAILED", { id }, e);
      });
      await this.addData({ data: [response], refresh });
      return this.items[id];
    }
  }
  /**
   * Remove entry from server
   */
  async removeItems(ids: UUID[]) {
    const promises = ids.map(id =>
      this.$axios.$delete(`/api/elements/${id}`).catch(e => {
        throw new LocalizedError("REMOVE_ELEMENT_FAILED", { id }, e);
      })
    );
    await Promise.all(promises);
    await this.fetchAll({ refresh: true });
  }
  /**
   * Fetch multiple entries from Server
   */
  async fetchItems({ id, refresh }: { id: UUID[]; refresh?: boolean }) {
    await Promise.all(id.map(id => this.fetchItem({ id })));
  }
  /**
   * Fetch all nodes
   */
  async fetchAll({ refresh }: { refresh?: boolean }) {
    if (this.fetchedAll && !refresh) return;
    const response: ApiItem[] = await this.$axios.$get("/api/elements").catch(e => {
      throw new HTTPError("FETCH_ELEMENTS_FAILED", e);
    });
    this.setFetchedAll = true;
    this.setData = response;
  }
  /**
   * Fetch root nodes
   */
  async fetchRoots(payload: {}) {
    //return await dispatch("fetchAll", {});
    if (this.roots.length > 0) return;
    const roots: ApiItem[] = await this.$axios.$get("/api/elements?parent=").catch(e => {
      throw new HTTPError("FETCH_ROOT_ELEMENTS_FAILED", e);
    });

    await this.addData({ data: roots });
  }
  /**
   * Fetch children
   */
  async fetchChildren({ id }: { id: UUID }) {
    if (this.knowsChildren(id)) return;
    const response: ApiItem[] = await this.$axios.$get(`/api/elements/${id}/children`).catch(e => {
      throw new HTTPError("FETCH_CHILD_ELEMENTS_FAILED", { id }, e);
    });
    if (response) {
      this.setChildCount = { id, count: response.length };

      if (response.length > 0) {
        await this.addData({ data: response });
      }
    }
  }
  /**
   * Fetch all elements in tree including element[id] going upwards to tree root(s)
   */
  async fetchTree({ id }: { id?: UUID }) {
    await this.fetchRoots({});
    const pChildren: Promise<any>[] = [];
    if (id) {
      //Load initial item
      let item = await this.fetchItem({ id });
      //Until no more parent items exist:
      while (item.parent) {
        //Do not wait for children to be fetched
        pChildren.push(this.fetchChildren({ id: item.parent }));
        //Load parent of child
        item = await this.fetchItem({ id: item.parent });
      }
      //Wait for all children requests to be performed
      await Promise.all(pChildren);
    }
  }
}

export default createModule(ElementsStore, "elements");
