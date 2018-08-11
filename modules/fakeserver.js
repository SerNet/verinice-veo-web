const chalk = require("chalk");
const jsonServer = require("json-server");
const fs = require("fs-extra");
const path = require("path");
const consola = require("consola");
var pluralize = require("pluralize");
const jsf = require("json-schema-faker");
const jwt = require("jsonwebtoken");

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

let fakeServer = null;

module.exports = async function asyncModule() {
  const options = this.options;

  const showReady = this.nuxt.showReady;
  this.nuxt.showReady = function(clear = true) {
    if (!this.readyMessage) {
      return;
    }
    const apiOption = options.proxy["/api"];

    consola.ready({
      message:
        this.readyMessage +
        ` (Using API at ${chalk.underline.blue(
          (apiOption.target || apiOption) + "/api"
        )})`,
      badge: true,
      clear
    });
  };

  const DB_FILE = path.join(this.options.buildDir, "db.json");
  options.proxy["/api"] = {
    target: "http://localhost:14242",
    pathRewrite: { "^/api": "" }
  };

  this.nuxt.hook("build:templates", async (nuxt, options) => {
    await fs.writeFile(
      DB_FILE,
      JSON.stringify(await generateData(), undefined, 2)
    );
    consola.success("Database initialized");
    await initServer(this.nuxt);
  });

  let app;
  this.nuxt.hook("listen", async nuxt => {
    await initServer(this.nuxt);
  });

  this.nuxt.hook("close", async nuxt => {
    await closeServer(this.nuxt);
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

  async function initServer(nuxt) {
    await closeServer(nuxt);
    const jsonServer = require("json-server");
    const server = jsonServer.create();

    const router = jsonServer.router(DB_FILE);
    const middlewares = jsonServer.defaults({ logger: false });

    server.use(middlewares);
    server.post("/login", function(req, res) {
      const payload = {
        exp: 1534779266,
        sub: "admin",
        iss: "verinice.VEO",
        iat: 1533915266,
        aud: "verinice.REST clients",
        profiles: ["export", "import", "tasks"]
      };
      const token = jwt.sign(payload, "veo");
      res.header("Authorization", "Bearer " + token);
      res.status(200).send("");
    });

    function isAuthorized(req) {
      if (req.headers.authorization) {
        const token = String(req.headers.authorization)
          .split(/\s+/)
          .pop();
        try {
          return jwt.verify(token, "veo");
        } catch (err) {
          return false;
        }
      }
    }

    server.use((req, res, next) => {
      if (isAuthorized(req)) {
        // add your authorization logic here
        next(); // continue to JSON Server router
      } else {
        res.sendStatus(401);
      }
    });

    server.use(
      jsonServer.rewriter({
        "/schemas/:id.json": "/schemas/:id"
      })
    );

    server.use(router);

    return (fakeServer = server.listen(14242));
  }

  async function closeServer(nuxt) {
    if (fakeServer) {
      await new Promise(resolve => fakeServer.close(resolve));
      fakeServer = null;
    }
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
