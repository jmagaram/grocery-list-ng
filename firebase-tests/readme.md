To run the tests...

1. Start the emulator with the NPM script
2. Start the text with the NPM script

Issues:

- No "watch" configuration yet; kind of annoying. Note that even if I added this, we'd want to watch for changes to the rules file not just to the test code source.
- After the tests run, it is a hassle to kill the process.
- If the tests fail, they return some kind of error code that messes up the console display. The || ECHO hack in the script fixes that.
- No integration with VS Code Text Explorer.
- Must name the files unusually - _.fbspec.ts _ - so Angular doesn't complain about them.

I could not get firebase tests running with the default Angular Jasmine and Karma setup. Needed to revert to using Mocha and Chai. This might have something to do with CommonJS modules but I really have no idea.

These links were helpful.

https://dev.to/matteobruni/mocha-chai-with-typescript-37f
https://github.com/firebase/quickstart-testing/blob/master/unit-test-security-rules/package.json
https://www.npmjs.com/package/ts-mocha

The Firebase SDK is moving to modern modules, so that might help.

Eventually I should test again getting this to all work in the default Karma + Jasmine configuration.
