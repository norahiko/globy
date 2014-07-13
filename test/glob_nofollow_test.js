"use strict";

var assert = require("chai").assert;
var globy = require("../lib/globy.js");
var fs = require("fs");
var deepEqual = assert.deepEqual;


suite("glob:", function() {
    var existsLink = fs.existsSync("test/ender_chest/tools");
    var symlinkTest = existsLink ? test : test.skip;

    symlinkTest("../ender_chest/**/* (follow)", function() {
        deepEqual(
            globy.glob("../ender_chest/**/*"),
            [
                "../ender_chest/tools",
                "../ender_chest/tools/Door",
                "../ender_chest/tools/Ladder",
            ]
        );
    });


    symlinkTest("../ender_chest/**/* (nofollow)", function() {
        deepEqual(
            globy.glob("../ender_chest/**/*", { nofollow: true }),
            [
                "../ender_chest/tools",
            ]
        );
    });


    symlinkTest("../ender_chest/*/* (nofollow)", function() {
        deepEqual(
            globy.glob("../ender_chest/*/*", { nofollow: true }),
            [
                "../ender_chest/tools/Door",
                "../ender_chest/tools/Ladder",
            ]
        );
    });
});
