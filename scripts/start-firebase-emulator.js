// Starts the firebase emulator
const inquirer = require("inquirer");
const { execSync } = require("child_process");

function exec(command) {
  execSync(command, { stdio: "inherit" });
}

(async () => {
  const save = await inquirer.prompt([
    {
      type: "confirm",
      name: "value",
      message: "Load and save data",
      default: false,
    },
  ]);

  if (save.value) {
    const path =
      "C:/Users/justi/source/repos/grocery-list-ng/firebase-emulator-data";
    exec(`firebase emulators:start --import=${path} --export-on-exit`);
  } else {
    exec(`firebase emulators:start`);
  }
})();
