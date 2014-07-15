"use strict";

var common = require("./common.js");
var speedup = common.speedup;
var assert = require("chai").assert;
var deepEqual = assert.deepEqual;


suite("speedup:", function () {
    common.speedupTest("readdirSyncSafe('.')", function() {
        deepEqual(
            speedup.readdirSyncSafe("."),
            [".hidden_file", ".secret", "blocks", "elements", "tools"]
        );
    });


    common.speedupTest("readdirSyncSafe('not_exists_dir')", function() {
        deepEqual(
            speedup.readdirSyncSafe("not_exists_dir"),
            null
        );
    });


    common.speedupTest("existsSync", function () {
        assert.ok(speedup.existsSync("."));
        assert.ok(speedup.existsSync("./"));
        assert.ok(speedup.existsSync("blocks"));
        assert.ok(speedup.existsSync("blocks"));
        assert.ok(speedup.existsSync("./blocks/"));
        assert.ok(speedup.existsSync("blocks/Stone"));

        assert.notOk(speedup.existsSync("blocks/Stone/"));
        assert.notOk(speedup.existsSync("not_exists_file"));
    });


    var isSymbolicLinkTest = speedup ? common.symlinkTest : test.skip;

    isSymbolicLinkTest("isSymbolicLink", function() {
        assert.ok(speedup.isSymbolicLinkSync("../ender_chest/tools"));

        assert.notOk(speedup.isSymbolicLinkSync("../ender_chest"));
        assert.notOk(speedup.isSymbolicLinkSync("../not_exists_file"));
    });
});
