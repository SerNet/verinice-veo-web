import { createModule, useStore, Mutation } from "vuex-typesafe-class";
import BaseStore from "~/lib/BaseStore";
import HTTPError from "~/exceptions/HTTPError";
import { ApiSchema } from "~/types/api";

class SchemasStore extends BaseStore {
  names: string[] = [];
  schemas: Record<string, ApiSchema> = {};

  get index() {
    return this.schemas;
  }

  get items() {
    return this.names.map(name => this.schemas[name]);
  }

  set setItems(value: string[]) {
    this.names = value;
  }

  set setSchema(value: { name: string; schema: ApiSchema }) {
    this.schemas[value.name] = value.schema;
  }

  async fetchSchema({ name }: { name: string; refresh?: boolean }) {
    const existing = this.index[name];
    if (existing) return existing;
    const schema: any = await this.$axios.$get(`/api/schemas/${name}.json`).catch(e => {
      throw new HTTPError("FETCH_SCHEMA_FAILED", { name }, e);
    });
    if (schema) {
      this.setSchema = { name, schema };
      return schema;
    }
  }

  async fetchSchemas({}) {
    if (this.items.length > 0) return;
    //Fetch list of schema files
    const response: string[] = await this.$axios.$get(`/api/schemas`).catch(e => {
      throw new HTTPError("FETCH_SCHEMAS_FAILED", {}, e);
    });
    //Save name list without extension
    this.setItems = response.map(name => String(name).replace(/\.json$/i, ""));
    return response;
  }
}

export default createModule(SchemasStore, "schemas");
