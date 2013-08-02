'use strict';
var watch = require('watch'),
	ps = require('child_process'),
	clint = require('clintish')(),
	path = require('path'),
	prime = require('primish'),
	options = require('primish/options'),
	emitter = require('primish/emitter'),
	lessr = require('./lessr'),
	growl = require('growl'),
	pack = require('../package');

require('colors');

// main
var irspy = prime({
	// main class
	options: {
		// compress less files?
		compress: true,

		paths: {
			// where sources are
			src: path.join('..', 'less'),

			// main file to compile
			lessMain: 'app.less',

			// where output is
			out: path.join('..', 'dist', 'css'),

			// main file to output to.
			cssMain: 'app.css'
		},

		ok: '✔'.green,
		fail: '×'.red,

		notify: {
			enabled: true
		},
		autoProcess: true
	},

	implement: [options, emitter, lessr],

	apps: {},

	constructor: function(options){
		this.setOptions(options);
		this.log('\nirspy'.red + ' ' + pack.version);
		this.registerClint();
		this.options.autoProcess && this.processArguments();
	},

	log: function(message){
		console.log(message);
	},

	alert: function(message, title){
		var obj = title ? { title: title } : {};

		growl(message, obj);
	},

	processArguments: function(args){
		args = args || process.argv.splice(2);

		if (!args.length){
			return this.cliHelp();
		}

		var self = this,
			watches = [],
			runNow = [],
			immediate = false;

		clint.on('command', function(name /*, value*/){
			switch (name){
				case '--no-compress':
					self.options.compress = false;
					break;
				case '--now':
					self.log(self.options.ok + '  Immediate compilation requested');
					immediate = true;
					runNow.push({
						run: self.build_less,
						args: ['demo']
					});
					break;
				case '--auto':
					//if (value){
					// add watch for app change for less
					// var apps = value.split(',');
					self.log(self.options.ok + '  Watching for app changes and rebuilding less file');
					watches.push({
						run: function(file){
							var isLess = /\.less/.test(file);

							if (isLess){
								self.log('?  CHANGE Detected:'.yellow + ' matching ' + path.basename(file).green + ' triggered app less build');
								self.build_less('demo');
							}
						},
						source: self.options.paths.src
					});

					break;
				case '--foo':
					this.foo = value;
			}
		});

		clint.on('complete', function(){
			// run the queue
			if (!immediate){
				watches.forEach(self.addWatch.bind(self));
				watches.length && self.log('   Press ^C to stop watching.'.grey + ' ' + self.options.fail);
			}
			else {
				runNow.forEach(function(task){
					task.run.apply(self, task.args);
				});
			}

		});

		clint.parse(args);

		return this;
	},

	registerClint: function(){
		var bool = function(value){
			if (value === 'no' || value === 'false'){
				return false;
			}
			if (value === 'yes' || value === 'true'){
				return true;
			}
			return value;
		};

		clint.command('--auto', '-a', 'Watch for changes in less files, recompiles main');
		clint.command('--now', '-n', 'Do not keep running, instead - compile now and quit', bool);
		clint.command('--no-compress', '-nc', 'Disable compression settings for less output, enabled by default, eg. ' + '--no-compress'.green + ' to disable', bool);
		clint.command('--foo', '-f', 'Set foo');
	},

	cliHelp: function(){
		this.log(clint.help(2, ' : '.grey));
	},

	addWatch: function(obj){
		// low level abstraction to add a watch monitor.
		var self = this;

		watch.createMonitor(obj.source, function(monitor){

			var runHow = typeof obj.run,
				ret = function(){
				},
				run = (function(){
					switch (runHow){
						case 'string':
							// run an external command from the shell
							ret = function(){
								ps.exec(obj.run, function(error, stdout){
									if (!error){
										self.log(stdout);
									}
									else {
										self.log('error');
									}
								});
							};
							break;
						case 'function':
							ret = function(){
								obj.run.apply(obj, arguments);
							};
							break;
					}
					return ret;
				}());

			monitor.on('created', run);
			monitor.on('removed', run);
			monitor.on('changed', run);
		});

		this.log('i'.blue + '  Watching ' + obj.source.green + ' for changes');
	}
});


module.exports = irspy;