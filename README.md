irspy
=====

I R Spy is a small nodejs app that lets you do tasks when files change, like, compile less files for you.

## Example

Start up `example.js`:

```sh
$ node example.js
# or
$ ./example.js

irspy 0.0.1
  --auto, -a         : Watch for changes in less files, recompiles main
  --now, -n          : Do not keep running, instead - compile now and quit
  --no-compress, -nc : Disable compression settings for less output, enabled by default, eg. --no-compress to disable
```

The file can look like this:

```javascript
#!/usr/bin/env node
'use strict';

// run this file. if there's a .irspy json in the current folder, it will prefer it to local options
var fs = require('fs'),
	irspy = require('lib/irspy');

// example use case
var config = fs.existsSync('.irspy') ? JSON.parse(fs.readFileSync('.irspy', 'utf-8')) : false;

// defaults or read config
config ? new irspy(config) : new irspy();
```

Modify any `dist/less/` files. Only `dist/app.less` gets compiled. Tadaa!


## Adding multiple tasks and locations

Hack around irspy.js. runNow and watches arrays can contain multiple directories and strategies.

a `.irspy` you could use (JSON):
```
{
	"compress": true,

	"paths": {
		"src": "dist/less",
		"out": "dist/css",
		"lessMain": "app.less",
		"cssMain": "app-min.css"
	},

	"notify": {
		"enabled": true
	}
}
```

**This is not really release ready but works well enough**