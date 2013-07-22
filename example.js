#!/usr/bin/env node
'use strict';

// run this file. if there's a .irspy json in the current folder, it will prefer it to local options
var fs = require('fs'),
	irspy = require('./lib/irspy');

// example use case
var config = fs.existsSync('.irspy') ? JSON.parse(fs.readFileSync('.irspy', 'utf-8')) : false;

// defaults or read config
config ? new irspy(config) : new irspy();

// you can also pass your own options for config.

// structure is a little messy.
// - lessr contains the build_less mixin and a fix to recess
// - clint is a command line args tool

