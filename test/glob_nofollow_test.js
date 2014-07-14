"use strict";

var common = require("./common.js");
var assert = require("chai").assert;
var globy = require("../lib/globy.js");
var deepEqual = assert.deepEqual;


suite("glob:", function() {
    common.symlinkTest("../ender_chest/**/* (follow)", function() {
        deepEqual(
            globy.glob("../ender_chest/**/*"),
            [
                "../ender_chest/tools",
                "../ender_chest/tools/Door",
                "../ender_chest/tools/Ladder",
            ]
        );
    });


    common.symlinkTest("../ender_chest/**/* (nofollow)", function() {
        deepEqual(
            globy.glob("../ender_chest/**/*", { nofollow: true }),
            [
                "../ender_chest/tools",
            ]
        );
    });


    common.symlinkTest("../ender_chest/*/* (nofollow)", function() {
        deepEqual(
            globy.glob("../ender_chest/*/*", { nofollow: true }),
            [
                "../ender_chest/tools/Door",
                "../ender_chest/tools/Ladder",
            ]
        );
    });
});
