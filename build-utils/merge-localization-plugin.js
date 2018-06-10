var objectPath = require('object-path');
var deepAssign = require('deep-assign');
// TODO: remove above packages from package.json when this plugin will be separated to own node_module
var fs = require('file-system');
var crypto = require('crypto');

function MergeLocalizationPlugin(options) {
    this.opts = options || {};
    this.omit = this.opts.omit || '';
    this.fileInput = this.opts.fileInput || '';
    this.rootDir = this.opts.rootDir || 'src';
    this.outputDir = this.opts.outputDir || '';
	this.configName = this.opts.configName || '';

    // concatenate all JSON files for translations
    this.gatherJson = function(compilation) {
        var contents = {};
        fs.recurseSync(this.rootDir, this.fileInput, function(filepath, relative, filename) {
            // watch file for hot reloading
            compilation.fileDependencies.push(filepath);

            // read path and modify for creating JSON
            // if same folder - relative path will be '-', we need remove that '-'
            var localePath = relative.replace(this.omit, '').replace(/^-/g, '').replace(filename, '');
            localePath = localePath
                .replace(/^(\/|\\{1,2})|(\/|\\{1,2})$/g, '')
                .replace(/\/|\\{1,2}/g, '.')
                .replace(/^\.{1,}|\.{1,}$/g, ''); // remove leading '.'
            var content = {};
            var data = JSON.parse(fs.readFileSync(filepath, 'utf8'));
            if(localePath) {
                objectPath.set(content, localePath, data);
            } else {
                content = data;
            }
            contents[filename] = contents[filename] || {};
            deepAssign(contents[filename], content);
        }.bind(this));
        return contents;
    }.bind(this);
}

MergeLocalizationPlugin.prototype.apply = function(compiler) {
      compiler.plugin("emit", function(compilation, callback) {
        var fullJSON = this.gatherJson(compilation);
		var assetsHashMap = {};
		
        // write each translation locale content in a separate file
        Object
            .keys(fullJSON)
            .map(fileName => {
                var values = deepAssign({}, fullJSON[fileName]);
				var shasum = crypto.createHash('md5');
				var stringOutput = JSON.stringify(values);
				var withoutExtension = fileName.split('.').slice(0,-1).join('.');
				shasum.update(stringOutput);
				var hash = shasum.digest('hex');
				var newFilename = `${withoutExtension}.${hash}.json`; 
				
				// associate file with it`s new filename that contains hash
				assetsHashMap[withoutExtension] = newFilename;
				
                compilation.assets[this.outputDir + newFilename] = {
                    source: function() {
                        return new Buffer(stringOutput);
                    },
                    size: function() {
                        return Buffer.byteLength(stringOutput);
                    }
                };
            });
			
		// create assets hash map
		var assetsMapString = JSON.stringify(assetsHashMap, null, 2);
		compilation.assets[this.outputDir + `${this.configName}`] = {
			source: function() {
				return new Buffer(assetsMapString);
			},
			size: function() {
				return Buffer.byteLength(assetsMapString);
			}
        }
        callback();
      }.bind(this));
};

module.exports = MergeLocalizationPlugin;
