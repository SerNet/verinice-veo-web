const axios = require("axios");
const { Command } = require("@adonisjs/ace");
const path = require("path");
const jsf = require("json-schema-faker");

module.exports = class Cmd extends Command {
  static get VEO_ID() {
    return "$veo.id";
  }
  static get VEO_TITLE() {
    return "$veo.title";
  }
  static get VEO_TYPE() {
    return "$veo.type";
  }
  static get VEO_PARENT() {
    return "parent";
  }

  constructor() {
    super();
    this.baseURL = process.env["URL"] || "https://v2020-rest.cpmsys.io/";
    this.username = process.env["USERNAME"] || "admin";
    this.password = process.env["PASSWORD"] || "password";
  }

  async axios(options) {
    const opts = {
      baseURL: this.baseURL,
      method: "GET",
      headers: {},
      ...options
    };
    if (this.authorization) {
      opts.headers["Authorization"] = this.authorization;
    }
    try {
      return await axios(opts);
    } catch (e) {
      if ((e.response && e.response.data) || e.response.statusText) {
        console.log(e.response);
        e.message += ` (${e.response.data || e.response.statusText})`;
      }
      throw e;
    }
  }

  async authorize(username = this.username, password = this.password) {
    const response = await this.axios({
      url: "login",
      method: "POST",
      data: { username, password }
    });
    return (this.authorization = response.headers["authorization"]);
  }

  async fetchSchemas() {
    const response = await this.axios({
      url: "schemas"
    });
    return response.data;
  }

  async fetchElements() {
    const response = await this.axios({
      url: "elements"
    });
    return response.data;
  }

  async deleteElement(id) {
    const response = await this.axios({
      url: "elements/" + encodeURI(id),
      method: "DELETE"
    });
    return response.data;
  }

  async fetchSchema(schemaName, fakeTypes) {
    const response = await this.axios({
      url: `schemas/${schemaName}`,
      transformResponse: v => v
    });
    return JSON.parse(response.data, (key, value) => {
      if (fakeTypes[key]) {
        return { ...value, faker: fakeTypes[key] || fakeTypes["default"] };
      }
      return value;
    });
  }

  async createElement(element) {
    const response = await this.axios({
      url: "elements",
      method: "POST",
      data: element
    });
    return response.data;
  }
};
