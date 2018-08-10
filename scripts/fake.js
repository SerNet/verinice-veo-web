const jsf = require("json-schema-faker");
const axios = require("axios");

jsf.extend("faker", function() {
  const faker = require("faker/locale/de");
  return faker;
});

const SERVER_URL =
  process.env["SERVER_URL"] ||
  "http://couch.cpmsys.io/veo/_design/api/_rewrite/";

class SchemaFaker {
  constructor(maxDeep = 3, maxLeaps = 5) {
    this.items = [];
    this.maxDeep = maxDeep;
    this.maxLeaps = maxLeaps;
  }

  async fake(schema, parent, deepness = 0) {
    const result = await jsf.resolve(schema);

    result._id = result["$veo.id"];
    result.parent = parent;
    this.items.push(result);
    if (deepness == -1) return result;

    const numChildren =
      deepness > this.maxDeep
        ? 0
        : Math.round(Math.random() * this.maxLeaps) + 1;
    for (let i = 0; i < numChildren; i++) {
      await this.fake(schema, result._id, deepness + 1);
    }
    return result;
  }

  async fakeTree(schemaUrl) {
    const schema = await axios(schemaUrl, { json: true });
    const root = await this.fake(schema.data, null);
    for (let i = 0; i < 1000; i++) {
      await this.fake(schema.data, root._id, -1);
    }
    return root;
  }

  async insert(url) {
    for (let i = 0; i < this.items.length; i += 1000) {
      const batch = this.items.slice(i, i + 1000);
      console.log(`Posting ${batch.length} items...`);
      await axios({
        url: url + "/_bulk_docs",
        data: { docs: batch },
        json: true,
        method: "POST"
      });
    }
  }

  async clean(url) {
    let elements = await axios.default(url);
    elements = elements.data;
    for (let i = 0; i < elements.length; i += 1000) {
      const batch = elements.slice(i, i + 1000);
      await axios({
        url: url + "/_bulk_docs",
        data: {
          docs: batch.map(elem => ({
            _id: elem._id,
            _rev: elem._rev,
            _deleted: true
          }))
        },
        json: true,
        method: "POST"
      });
    }
  }
}

(async function() {
  try {
    const faker = new SchemaFaker(5);
    await faker.clean(`${SERVER_URL}/elements`);
    const root = await faker.fakeTree(`${SERVER_URL}/schemas/asset.json`);
    console.log(
      `Generated ${faker.items.length - 1} items under Root[${root._id}]...`
    );
    await faker.insert(`${SERVER_URL}/elements`);
  } catch (e) {
    console.error(e.message, e.response && e.response.statusText);
  }
})();
