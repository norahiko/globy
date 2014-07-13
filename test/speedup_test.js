"use strict";

var assert = require("chai").assert;
var fs = require("fs");
var deepEqual = assert.deepEqual;

try {
    var speedup = require("../build/Release/speedup.node");
} catch(_) {
    console.warn("Could not load speedup addon");
}


var sym = "test/ender_chest/tools";
if(fs.existsSync(sym)) {
    fs.unlinkSync(sym);
}

try {
    fs.symlinkSync("../chest/tools", sym);
} catch(_) {
    console.warn("Could not create symbolic link");
}


suite("speedup:", function () {
    var speedupTest = speedup ? test : test.skip;
    var existsLink = fs.existsSync("test/ender_chest/tools");
    var symlinkTest = existsLink ? speedupTest : test.skip;



    speedupTest("readdirSyncSafe('.')", function() {
        deepEqual(
            speedup.readdirSyncSafe("."),
            [".hidden_file", ".secret", "blocks", "elements", "tools"]
        );
    });


    speedupTest("readdirSyncSafe('not_exists_dir')", function() {
        deepEqual(
            speedup.readdirSyncSafe("not_exists_dir"),
            null
        );
    });


    speedupTest("existsSync", function () {
        assert.ok(speedup.existsSync("."));
        assert.ok(speedup.existsSync("./"));
        assert.ok(speedup.existsSync("blocks"));
        assert.ok(speedup.existsSync("blocks"));
        assert.ok(speedup.existsSync("./blocks/"));
        assert.ok(speedup.existsSync("blocks/Stone"));

        assert.notOk(speedup.existsSync("blocks/Stone/"));
        assert.notOk(speedup.existsSync("not_exists_file"));
    });


    symlinkTest("isSymbolicLink", function() {
        assert.ok(speedup.isSymbolicLink("../ender_chest/tools"));
        assert.ok(speedup.isSymbolicLink("../ender_chest/tools/Door"));

        assert.notOk(speedup.isSymbolicLink("../ender_chest"));
        assert.notOk(speedup.isSymbolicLink("../not_exists_file"));
    });
});
