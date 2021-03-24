# Work items

**Can't update Angular CLI to latest version.** #TODO

Tried to type `ng update @angular/cli @angular/core` and got this error...

> Package "@angular-eslint/builder" has an incompatible peer dependency to "@angular-devkit/architect" (requires "~0.1001.4 || ~0.1100.1", would install "0.1102.2").

Identified issue at https://github.com/angular-eslint/angular-eslint/issues/323

**Possible EventEmitter memory leak** #TODO

When deleting a lot of users one at a time from emulator, see this message in the emulator output.

> functions: Finished "deleteGroceryListOnUserDelete" in ~1s
> (node:1832) MaxListenersExceededWarning: Possible EventEmitter memory leak detected. 11 log listeners added to [EventEmitter]. Use emitter.setMaxListeners() to increase limit

**Figure out how to use Material theme colors** #TODO

**Spacing of input controls when errors are displayed** #TODO

https://github.com/angular/components/issues/4580

**Testing form emits using Jasmine spy** #TODO

**Enable Ivy language service** #TODO
Disabled on 3/1/2020; buggy

**Error handler to log exceptions** #TODO

https://dev.to/buildmotion/angular-errorhandler-to-handle-or-not-to-handle-1e7l
