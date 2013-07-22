'use strict';

var fs = require('fs'),
	path = require('path'),
	prime = require('primish'),
	recess = require('recess');

require('colors');

// need to fix recess due to double compile of escaped expressions
(function(){
	var RECESS = recess.Constructor;
	recess.Constructor.prototype.compile = function(){
		var that = this,
			css;

		// activate all relevant compilers
		Object.keys(this.options).forEach(function(key){
			that.options[key] && RECESS.COMPILERS[key] && RECESS.COMPILERS[key].on.call(that);
		});

		// iterate over defintions and compress them (join with new lines)

		css = this.parsed ? this.data : this.definitions.map(function(def){
			return def.toCSS([
				[]
			], { data: that.data, compress: that.options.compress });
		}).join(this.options.compress ? '' : '\n');

		// minify with cssmin
		if (that.options.compress) css = require('recess/lib/min').compressor.cssmin(css);

		// deactivate all relevant compilers
		Object.keys(this.options).reverse().forEach(function(key){
			that.options[key] && RECESS.COMPILERS[key] && RECESS.COMPILERS[key].off();
		});

		// cleanup trailing newlines
		css = css.replace(/[\n\s\r]*$/, '');

		// output css
		this.log(css, true);

		// callback and exit
		this.callback && this.callback();
	};
}());

module.exports = prime({
	// mixin

	build_less: function(){
		var self = this,
			less = path.join(self.options.paths.src, self.options.paths.lessMain),
			out = path.join(self.options.paths.out, self.options.paths.cssMain);

		recess(less, {
			compress: self.options.compress,
			compile: true
		}, function(error, obj){
			if (error){
				self.log(self.options.fail + '  RECESS Error:'.red + ' failed to compile ' + path.basename(less).red);
				self.alert('Failed to compile ' + path.basename(less), 'RECESS FAILURE');
				self.trigger('error', error);
			}
			else {
				obj = obj[0]; // recess 1.1.8
				self.log(self.options.ok + '  RECESS Success:'.green + ' compiled ' + path.basename(less).green);
				fs.writeFile(out, obj.output, function(error){
					if (error){
						self.log(self.options.fail + '  EXPORT Failed:'.red + ' CSS file not saved ' + path.basename(out).green + ' ' + error);

						self.trigger('error', error);
					}
					else {
						self.log(self.options.ok + '  EXPORT Success:'.green + ' CSS file saved ' + path.basename(out).green);
						self.alert('CSS exported and file saved ' + path.basename(out), 'RECESS SUCCESS');

						self.trigger('build', less);
					}
				});
			}
		});
	}

});