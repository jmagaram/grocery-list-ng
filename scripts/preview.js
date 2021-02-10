// Deploys current build to a preview channel in Firebase

const prompts = require("prompts");
const { execSync } = require("child_process");

function exec(command) {
  execSync(command, { stdio: "inherit" });
}

(async () => {
  const build = await prompts({
    type: "confirm",
    name: "value",
    message: "Start production build",
    initial: true,
  });

  if (build) {
    exec("npm run-script prod");
  }

  const deploy = await prompts({
    type: "confirm",
    name: "value",
    message: "Deploy a preview",
    initial: true,
  });

  if (!deploy.value) {
    return;
  }

  const channel = await prompts({
    type: "text",
    name: "channel",
    message: "Channel name",
    initial: "preview",
  });

  exec("firebase hosting:channel:deploy " + channel.channel);

  // This is really slow
  exec("rm -rf node_modules");
  exec("npm install");
})();
