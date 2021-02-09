// Deploys current build to a preview channel in Firebase

const prompts = require("prompts");
const { execSync } = require("child_process");

function exec(command) {
  execSync(command, { stdio: "inherit" });
}

(async () => {
  const shouldBuild = await prompts({
    type: "confirm",
    name: "value",
    message: "Build first?",
    initial: true,
  });

  if (shouldBuild.value) {
    exec("ng build");
  }

  const shouldDeploy = await prompts({
    type: "confirm",
    name: "value",
    message: "Should deploy a preview?",
    initial: true,
  });

  if (!shouldDeploy.value) {
    return;
  }

  const channelName = await prompts({
    type: "text",
    name: "channel",
    message: "Channel name?",
    initial: "preview",
  });

  exec("firebase hosting:channel:deploy " + channelName.channel);
})();
