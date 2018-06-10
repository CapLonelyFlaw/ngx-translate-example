const path = require('path');
const fs = require('fs');
const loaderUtils = require('loader-utils');

// change relative localization paths to absolute paths at each @Localization() directive
module.exports = function (content) {
    let matchedPath = content.match(/Localization\(['|"](.*)['|"]\)/m)
    if (matchedPath && matchedPath[1]) {
        const options = loaderUtils.getOptions(this);
        let sourceRoot = options.sourceRoot;
        let locFolderName = options.locFolderName;

        let locPath = path.resolve(this.context, matchedPath[1]);
        sourceRoot = path.resolve(this._compiler.context, sourceRoot);
        if (!fs.existsSync(path.resolve(locPath, locFolderName))) {
            throw new Error(`
                Translations Loader\n\n
                specified localeFolderName(${locFolderName}) does not exists at ${locPath}`);
        }
        locPath = path.relative(sourceRoot, locPath);
        content = content.replace(/Localization\(['|"](.*)['|"]\)/m,
            `Localization('${locPath.replace(/\\/g, '/')}')`);
    }
    return content;
}