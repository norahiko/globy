"tuse strict";
// jshint unused: false

var assert = require("chai").assert;
var globy = require("../lib/globy.js");
var equal = assert.strictEqual;
var deepEqual = assert.deepEqual;

suite("glob:", function() {
    test("**", function() {
        deepEqual(
            globy.glob("**"),
            [
                "blocks",
                "elements",
                "tools",
            ]
        );
    });


    test("**/*", function() {
        deepEqual(
            globy.glob("**/*"),
            [
                "blocks",
                "blocks/CobbleStone",
                "blocks/Dirt",
                "blocks/SandStone",
                "blocks/Snow",
                "blocks/Stone",
                "elements",
                "elements/Coal",
                "elements/Gold.ingot",
                "elements/Iron.block",
                "elements/Iron.ingot",
                "elements/RedStone",
                "elements/Stick",
                "elements/gems",
                "elements/gems/Emerald.gem",
                "tools",
                "tools/Door",
                "tools/Ladder",
            ]
        );
    });


    test("**/* (dot)", function() {
        deepEqual(
            globy.glob("**/*", { dot: true }),
            [
                ".hidden_file",
                ".secret",
                ".secret/Diamond.gem",
                "blocks",
                "blocks/CobbleStone",
                "blocks/Dirt",
                "blocks/SandStone",
                "blocks/Snow",
                "blocks/Stone",
                "elements",
                "elements/Coal",
                "elements/Gold.ingot",
                "elements/Iron.block",
                "elements/Iron.ingot",
                "elements/RedStone",
                "elements/Stick",
                "elements/gems",
                "elements/gems/Emerald.gem",
                "tools",
                "tools/Door",
                "tools/Ladder",
            ]
        );
    });


    test("**/blocks", function() {
        deepEqual(
            globy.glob("**/blocks"),
            [
                "blocks",
            ]
        );
    });


    test("**/nothing", function() {
        deepEqual(
            globy.glob("**/nothing"),
            []
        );
    });


    test("**/blocks/**/*", function() {
        deepEqual(
            globy.glob("**/blocks/**/*"),
            [
                "blocks/CobbleStone",
                "blocks/Dirt",
                "blocks/SandStone",
                "blocks/Snow",
                "blocks/Stone",
            ]
        );
    });


    test("../ender_chest/**/* (follow)", function() {
        deepEqual(
            globy.glob("../ender_chest/**/*"),
            [
                "../ender_chest/tools",
                "../ender_chest/tools/Door",
                "../ender_chest/tools/Ladder",
            ]
        );
    });


    test("../ender_chest/**/* (nofollow)", function() {
        deepEqual(
            globy.glob("../ender_chest/**/*", { nofollow: true }),
            [
                "../ender_chest/tools",
            ]
        );
    });


    test("../ender_chest/*/* (nofollow)", function() {
        deepEqual(
            globy.glob("../ender_chest/*/*", { nofollow: true }),
            [
                "../ender_chest/tools/Door",
                "../ender_chest/tools/Ladder",
            ]
        );
    });
});

