const chalk = require("chalk");
const jsonServer = require("json-server");
const fs = require("fs-extra");
const path = require("path");
const consola = require("consola");
var pluralize = require("pluralize");
const jsf = require("json-schema-faker");
jsf.extend("faker", function() {
  const faker = require("faker/locale/de");
  return faker;
});

const ID_FIELD = "$veo.id";
const PARENT_FIELD = "parent";
const fakeTypes = {
  [ID_FIELD]: "random.uuid",
  ["$veo.title"]: "company.companyName"
};

module.exports = async function asyncModule() {
  const DB_FILE = path.join(this.options.buildDir, "db.json");
  this.options.proxy["/api"] = {
    target: "http://localhost:14242",
    pathRewrite: { "^/api": "" }
  };
  const jsonServer = require("json-server");
  const server = jsonServer.create();

  this.nuxt.hook("build:templates", async (nuxt, options) => {
    await initServer();
    //process.exit(0);
    consola.success("Database initialized");
  });

  let app;
  this.nuxt.hook("listen", async nuxt => {
    if (!app) {
      app = server.listen(14242);
    }

    const nuxtListening = () => {
      const apiOption = this.options.proxy["/api"];
      this.nuxt.readyMessage += ` (Using API at ${chalk.underline.blue(
        (apiOption.target || apiOption) + "/api"
      )})`;
    };
    nuxtListening();
  });

  this.nuxt.hook("close", async nuxt => {
    if (app) {
      app.stack.length = 0; //Remove existing middleware!
      app.close();
      app = null;
    }
  });

  function toObject(arr) {
    return arr.reduce((out, val) => {
      return { ...out, ...val };
    });
  }

  async function generateData() {
    const schemaDir = path.join(__dirname, "../resources/schemas");
    const files = await fs.readdir(schemaDir);
    const schemas = await Promise.all(
      files.filter(file => file.endsWith(".json")).map(async file => {
        const filename = path.join(schemaDir, file);
        const contents = await fs.readFile(filename);
        const schema = JSON.parse(contents, (key, value) => {
          if (fakeTypes[key]) {
            return { ...value, faker: fakeTypes[key] };
          }
          return value;
        });
        schema.id = path.basename(file, ".json");
        return schema;
      })
    );
    return {
      schemas,
      ...toObject(
        await Promise.all(
          schemas.map(async schema => ({
            [pluralize(schema.id)]: await fakeSchema(schema, 1000)
          }))
        )
      )
    };
  }

  async function initServer() {
    await fs.writeFile(
      DB_FILE,
      JSON.stringify(await generateData(), undefined, 2)
    );

    const router = jsonServer.router(DB_FILE);
    const middlewares = jsonServer.defaults({ logger: false });

    server.use(middlewares);
    server.use(
      jsonServer.rewriter({
        "/schemas/:id.json": "/schemas/:id"
      })
    );
    server.use(router);
  }

  async function createFakeElements(schema, num) {
    const result = await jsf.resolve({
      type: "array",
      items: JSON.parse(JSON.stringify(schema)),
      minItems: num
    });
    return result;
  }

  async function fakeSchema(schema, num) {
    const elements = await createFakeElements(schema, num);
    const root = elements[0];
    root[PARENT_FIELD] = null;
    root["id"] = root[ID_FIELD];
    const firstRange = Math.floor(0.1 * elements.length);
    for (let i = 1; i < elements.length; i++) {
      const elem = elements[i];
      const parentIndex = Math.floor(Math.random() * (firstRange - 1));
      elem["id"] = elem[ID_FIELD];
      elem[PARENT_FIELD] = elements[parentIndex][ID_FIELD];
    }
    return elements;
  }
};

module.exports.meta = require("../package.json");
