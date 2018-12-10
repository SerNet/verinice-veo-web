const axios = require("axios");
const RestCommand = require("./rest-command");
const path = require("path");
const jsf = require("json-schema-faker");

jsf.option({
  optionalsProbability: 0.8
});
jsf.extend("faker", function() {
  const faker = require("faker/locale/de");
  return faker;
});

module.exports = class Cmd extends RestCommand {
  static get signature() {
    return "rest:generate {schema?=asset : Schema type} {root? : UUID of parent } { -n=@value : Number of elements to create }";
  }

  static get description() {
    return "Generate testdata for rest service";
  }

  async insert(schemaName, root = "", num = 1) {
    const schema = await this.fetchSchema(`${schemaName}.json`, {
      [Cmd.VEO_ID]: "random.uuid",
      [Cmd.VEO_TITLE]: "name.lastName"
    });
    const fakes = await this.fake(schema, num);
    fakes.forEach(fake => {
      if (root) {
        fake[Cmd.VEO_PARENT] = root;
      } else {
        delete fake[Cmd.VEO_PARENT];
      }
    });
    for (let i = 0; i < fakes.length; i++) {
      await this.createElement(fakes[i]);
      this.success(`${this.icon("success")} ${fakes[i][Cmd.VEO_ID]}`);
    }
  }

  async fake(schema, num) {
    return await jsf.resolve({
      type: "array",
      items: schema,
      minItems: num,
      maxItems: num
    });
  }

  async handle({ schema, root }, { N }) {
    await this.authorize();
    this.info(`Creating ${N} elements of type ${schema}${root ? ` (parent: ${root})` : ""}...`);
    await this.insert(schema, root, N);
  }
};
