# Work items

**#TODO Can't update Angular CLI to latest version.**

Tried to type `ng update @angular/cli @angular/core` and got this error...

> Package "@angular-eslint/builder" has an incompatible peer dependency to "@angular-devkit/architect" (requires "~0.1001.4 || ~0.1100.1", would install "0.1102.2").

Identified issue at https://github.com/angular-eslint/angular-eslint/issues/323

**#TODO Possible EventEmitter memory leak**

When deleting a lot of users one at a time from emulator, see this message in the emulator output.

> functions: Finished "deleteGroceryListOnUserDelete" in ~1s
> (node:1832) MaxListenersExceededWarning: Possible EventEmitter memory leak detected. 11 log listeners added to [EventEmitter]. Use emitter.setMaxListeners() to increase limit

**#TODO Figure out how to use Material theme colors**

**#TODO Spacing of input controls when errors are displayed**

https://github.com/angular/components/issues/4580

**#TODO Testing form emits using Jasmine spy**

**#TODO Error handler to log exceptions**

https://dev.to/buildmotion/angular-errorhandler-to-handle-or-not-to-handle-1e7l

**#TODO Always import from 'firebase/app'**

See https://firebase.google.com/support/release-notes/js#version_800_-_october_26_2020

Use: `import firebase from 'firebase/app'`

**#TODO Standardize display of snackbar messages**

**#TODO Ensure not duplicating id field in both document and meta data in firestore**
