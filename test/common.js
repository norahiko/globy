"use strict";

var fs = require("fs");
try {
    exports.speedup = require("../build/Release/speedup.node");
    exports.speedupTest = test;
} catch(_) {
    console.warn("Could not load speedup addon");
    exports.speedup = null;
    exports.speedupTest = test.skip;
}


var sym = "test/ender_chest/tools";
if(fs.existsSync(sym)) {
    fs.unlinkSync(sym);
}

try {
    fs.symlinkSync("../chest/tools", sym, "dir");
    exports.availableSymlink = true;
    exports.symlinkTest = test;

} catch(_) {
    console.warn("Could not create symbolic link");
    exports.availableSymlink = false;
    exports.symlinkTest = test.skip;
}
