// Deploys current build to either a preview channel in Firebase or to the live
// site.

import { execSync } from 'child_process';
import { prompt, ConfirmQuestion, InputQuestion, ListQuestion } from 'inquirer';

const exec = (command: string): Buffer =>
  execSync(command, { stdio: 'inherit' });

// eslint-disable-next-line @typescript-eslint/no-floating-promises
(async () => {
  const buildQuestion: ConfirmQuestion = {
    type: 'confirm',
    message: 'Start production build',
    default: true,
    name: 'value',
  };
  if ((await prompt<{ value: boolean }>(buildQuestion)).value === true) {
    exec('npm run-script prod');
  }

  type Config = {
    kind: 'none' | 'prev' | 'prod';
    channel?: string;
    rules: boolean;
    functions: boolean;
  };

  const kindQuestion: ListQuestion<Config> = {
    type: 'list',
    message: 'Kind of deployment',
    choices: [
      { type: 'choice', name: 'Preview', value: 'prev' },
      { type: 'choice', name: 'Production', value: 'prod' },
      { type: 'choice', name: 'Exit', value: 'none' },
    ],
    default: 0,
    name: 'kind',
  };

  const channelQuestion: InputQuestion<Config> = {
    type: 'input',
    message: 'Channel name',
    default: 'preview',
    name: 'channel',
    when: (i) => (i as Config).kind === 'prev',
  };

  const rulesQuestion: ConfirmQuestion<Config> = {
    type: 'confirm',
    message: 'Deploy rules (affects live site too)',
    default: true,
    name: 'deployRules',
    when: (i) => (i as Config).kind === 'none',
  };

  const functionsQuestion: ConfirmQuestion<Config> = {
    type: 'confirm',
    message: 'Deploy functions (affects live site too)',
    default: true,
    name: 'deployFunctions',
    when: (i) => i.kind !== 'none',
  };

  const result = await prompt<Config>([
    kindQuestion,
    channelQuestion,
    rulesQuestion,
    functionsQuestion,
  ]);

  if (result.kind !== 'none') {
    if (result.kind === 'prev') {
      exec(`firebase hosting:channel:deploy ${result.channel}`);
    } else if (result.kind === 'prod') {
      exec(`firebase deploy --only hosting`);
    }
    if (result.functions) {
      exec('firebase deploy --only functions');
    }
    if (result.rules) {
      exec('firebase deploy --only firestore:rules');
    }
  }
})();
