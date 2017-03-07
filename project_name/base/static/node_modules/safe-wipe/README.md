# safe-wipe [![npm version](http://img.shields.io/npm/v/safe-wipe.svg?style=flat-square)](https://www.npmjs.org/package/safe-wipe)

> Safely wipe a folder.

Overview
--------

This is the perfect library for when you want to wipe a folder with
user's confirmation.

* If the folder is empty (or contains only useless files like
  `.DS_Store` or `Thumbs.db` as configured with `config.ignore`), the
  folder will be removed without asking anything.
* If `config.force` is set to `true`, wipe anyway.
* If the session is not interactive, raise an exception.
* Prompt the user for confirmation, and raise an exception if the answer
  is negative.

You can configure the following variables:

| Name                        | Description                                                                                                                                            | Default                     |
|-----------------------------|--------------------------------------------------------------------------------------------------------------------------------------------------------|-----------------------------|
| `stdin`, `stdout`, `stderr` | Streams to use for I/O.                                                                                                                                | `process.*` streams         |
| `ignore`                    | An array of files to ignore when checking if a directory is empty.                                                                                     | `.DS_Store` and `Thumbs.db` |
| `parent`                    | A (supposed) parent directory of the directory to wipe. If the parent is contained in the directory to wipe, the process will be aborted in all cases. |                             |
| `interactive`               | Whether the session is interactive.                                                                                                                    | `true`                      |
| `force`                     | Whether to force the wipe if the folder is not empty.                                                                                                  | `false`                     |
| `silent`                    | The error messages are not printed if this is set to `true`.                                                                                          | `false`                     |
| `messages`                  | An object of messages for user prompt and error display.                                                                                               |                             |

The messages are:

| Name        | Description                                                                         |
|-------------|-------------------------------------------------------------------------------------|
| `contained` | Error message when the folder to wipe is contained in the configured parent folder. |
| `confirm`   | Text to prompt the user to confirm the (not empty) directory wipe.                  |
| `abort`     | Error message when the user refuses to wipe the folder.                             |

The function is asynchronous and return a promise. Nothing is passed to
the success function, but you'll get an `Error` instance in the error
function. It can have the following `code` property:

| Code        | Description                                                                                            |
|-------------|--------------------------------------------------------------------------------------------------------|
| `CONTAINED` | Refused to remove the directory since it's containing the supposed parent.                             |
| `ABORT`     | The user aborted the operation (or we're not in an interactive session and `config.force` is `false`). |

Examples
--------

### Simple usage

```js
var safeWipe = require('safe-wipe');

safeWipe('directory', {
  parent: __dirname,
  messages: {
    abort: 'Nope.',
  },
}).then(function () {
  console.log('Successfully removed!');
}, function (e) {
  console.error(e.message, e.code);
});
```

### Bind a config object

```js
var mySafeWipe = safeWipe({
  interactive: false,
});

mySafeWipe('some-directory').then(function () {
  // ...
});

mySafeWipe('another-directory', {
  force: true,
});
```
