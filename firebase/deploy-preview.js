// Deploys current build to a preview channel in Firebase

const inquirer = require("inquirer");
const { execSync } = require("child_process");

function exec(command) {
  execSync(command, { stdio: "inherit" });
}

(async () => {
  const build = await inquirer.prompt([
    {
      type: "confirm",
      name: "value",
      message: "Start production build",
      default: true,
    },
  ]);

  if (build.value) {
    exec("npm run-script prod");
  }

  const deployHosting = await inquirer.prompt({
    type: "confirm",
    name: "value",
    message: "Continue and deploy a web site preview",
    default: true,
  });

  if (!deployHosting.value) {
    return;
  }

  const channel = await inquirer.prompt([
    {
      type: "input",
      name: "value",
      message: "Channel name",
      default: "preview",
    },
  ]);

  const deployRules = await inquirer.prompt({
    type: "confirm",
    name: "value",
    message: "Deploy security rules too (affects live site)",
    default: true,
  });

  const deployFunctions = await inquirer.prompt({
    type: "confirm",
    name: "value",
    message: "Deploy functions too (affects live site)",
    default: true,
  });

  exec("firebase hosting:channel:deploy " + channel.value);

  if (deployFunctions.value) {
    exec("firebase deploy --only functions");
  }

  if (deployRules.value) {
    exec("firebase deploy --only firestore:rules");
  }

  // Don't think I need these lines but have a memory of having trouble running
  // tools or building things without it.
  //
  // exec("rm -rf node_modules");
  // exec("npm install");
})();
