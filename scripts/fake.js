const jsf = require("json-schema-faker");
const axios = require("axios");

jsf.extend("faker", function() {
  const faker = require("faker/locale/de");
  return faker;
});

const SERVER_URL = process.env["SERVER_URL"];

class SchemaFaker {
  constructor(maxDeep = 5, maxLeaps = 5) {
    this.items = [];
    this.maxDeep = maxDeep;
    this.maxLeaps = maxLeaps;
  }

  async fake(schema, parent, deepness = 0) {
    const result = await jsf.resolve(schema);

    result._id = result["$veo.id"];
    result.parent = parent;
    this.items.push(result);
    const numChildren =
      deepness > this.maxDeep ? 0 : Math.round(Math.random() * this.maxLeaps);
    for (let i = 0; i < numChildren; i++) {
      await this.fake(schema, result._id, deepness + 1);
    }
    return result;
  }

  async fakeTree(schemaUrl) {
    const schema = await axios(schemaUrl, { json: true });
    return await this.fake(schema.data, null);
  }

  async insert(url) {
    return await axios({
      url: url + "/_bulk_docs",
      data: { docs: this.items },
      json: true,
      method: "POST"
    });
  }
}

(async function() {
  try {
    const faker = new SchemaFaker(5);
    const root = await faker.fakeTree(`${SERVER_URL}/schemas/asset.json`);
    console.log(
      `Generated ${faker.items.length - 1} items under Root[${root._id}]...`
    );
    await faker.insert(`${SERVER_URL}/elements`);
  } catch (e) {
    console.error(e.message);
  }
})();
