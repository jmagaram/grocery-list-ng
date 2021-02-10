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

  const deploy = await inquirer.prompt({
    type: "confirm",
    name: "value",
    message: "Deploy a preview",
    default: true,
  });

  if (!deploy.value) {
    return;
  }

  const channel = await inquirer.prompt([
    {
      type: "input",
      name: "value",
      message: "Channel name",
      initial: "preview",
    },
  ]);

  exec("firebase hosting:channel:deploy " + channel.value);
  exec("rm -rf node_modules");
  exec("npm install");
})();
