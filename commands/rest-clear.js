const axios = require("axios");
const RestCommand = require("./rest-command");
const path = require("path");
const jsf = require("json-schema-faker");

module.exports = class Cmd extends RestCommand {
  static get signature() {
    return "rest:clear";
  }

  static get description() {
    return "Delete all data";
  }

  async handle({ schema, root }, { N }) {
    await this.authorize();
    const elements = await this.fetchElements();
    this.info(`Deleting ${elements.length} elements...`);
    for (let i = 0; i < elements.length; i++) {
      const element = elements[i];
      const id = element[Cmd.VEO_ID];
      try {
        await this.deleteElement(id);
        this.success(`${this.icon("success")} Deleted ${id}`);
      } catch (e) {}
      this.error(`${this.icon("error")} Cannot delete ${id}: ${e.message}`);
    }
  }
};
