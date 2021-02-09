// Starts the firebase emulator

const prompts = require("prompts");
const { execSync } = require("child_process");

function exec(command) {
  execSync(command, { stdio: "inherit" });
}

exec("firebase emulators:start");
