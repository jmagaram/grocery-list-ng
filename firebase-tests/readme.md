To run the tests...

1. Start the emulator with the NPM script
2. View tests in the Test Explorer. There were scripts defined in a previous package.json, but they don't work as well as this.

I could not get firebase tests running with the default Angular Jasmine and Karma setup. Needed to revert to using Mocha and Chai. This might have something to do with CommonJS modules but I really have no idea.

These links were helpful.

https://dev.to/matteobruni/mocha-chai-with-typescript-37f
https://github.com/firebase/quickstart-testing/blob/master/unit-test-security-rules/package.json
https://www.npmjs.com/package/ts-mocha

The Firebase SDK is moving to modern modules, so that might help.

Eventually I should test again getting this to all work in the default Karma + Jasmine configuration.
