const fs = require("fs");
const path = require("path");
const ace = require("@adonisjs/ace");
const COMMANDS_DIR = "./commands";

fs.readdirSync(COMMANDS_DIR).forEach(dir => {
  const cmd = require(path.resolve(COMMANDS_DIR, dir));
  if (cmd.signature) ace.addCommand(cmd);
});

ace.onError(function(error, commandName) {
  const keep = ["message", "code", "status", "stack"];
  for (let key in error) {
    if (keep.indexOf(key) === -1) {
      delete error[key];
    }
  }
  console.error(error);
  process.exit(1);
});

// Boot ace to execute commands
ace.wireUpWithCommander();
ace.invoke();
