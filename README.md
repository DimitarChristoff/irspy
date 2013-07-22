irspy
=====

I R Spy is a small nodejs app that lets you do stuff when files change, like, compile less files for you.

## Example

Start up `example.js`:

```sh
$ node example.js
# or
$ ./example.js
$ ./example.js

irspy 0.0.1
  --auto, -a         : Watch for changes in less files, recompiles main
  --now, -n          : Do not keep running, instead - compile now and quit
  --no-compress, -nc : Disable compression settings for less output, enabled by default, eg. --no-compress to disable
```

Modify any `dist/less/` files. Only `dist/app.less` gets compiled. Tadaa!

## Adding multiple tasks and locations

Hack around irspy.js. runNow and watches arrays can contain multiple directories and strategies.

**This is not release ready but works well enough**