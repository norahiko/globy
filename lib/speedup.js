"use strict";
var fs = require("fs");
var pathModule = require("path");

try {
    var binding = require("../build/Release/speedup.node");
} catch(_) { }

if(binding === undefined) {
    // fallback
    exports.readdirSyncSafe = function(path) {
        try { return fs.readdirSync(path); } catch(_) {}
        return null;
    };

    exports.isSymbolicLinkSync = function(path) {
        try {
            return fs.lstatSync(path).isSymbolicLink();
        } catch(_) {
            return false;
        }
    };

    exports.existsSync = fs.existsSync;

} else if(process.platform === "win32") {
    exports.readdirSyncSafe = function(path) {
        return binding.readdirSyncSafe(pathModule._makeLong(path));
    };

    exports.isSymbolicLinkSync = function(path) {
        return binding.isSymbolicLinkSync(pathModule._makeLong(path));
    };

    exports.existsSync = function(path) {
        return binding.existsSync(pathModule._makeLong(path));
    };

} else {
    exports.readdirSyncSafe = binding.readdirSyncSafe;
    exports.isSymbolicLinkSync = binding.isSymbolicLinkSync;
    exports.existsSync = binding.existsSync;
}
