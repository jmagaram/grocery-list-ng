// Deploys current build to a preview channel in Firebase

const prompts = require("prompts");
const { execSync } = require("child_process");

function exec(command) {
  execSync(command, { stdio: "inherit" });
}

(async () => {
  const build = await prompts({
    type: "select",
    name: "value",
    message: "Build first",
    choices: [
      {
        title: "Do not build",
        description: "Use whatever is in the dist folder now",
      },
      {
        title: "Quick build",
        description: "Just npm run build",
      },
      {
        title: "Full",
        description: "Slower npm ci && npm run build",
      },
    ],
    initial: 1,
  });

  switch (build.value) {
    case 0:
      break;
    case 1:
      exec("npm run build");
      break;
    case 2:
      exec("npm ci && npm run build");
      break;
  }

  const deploy = await prompts({
    type: "confirm",
    name: "value",
    message: "Should deploy a preview",
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
})();
