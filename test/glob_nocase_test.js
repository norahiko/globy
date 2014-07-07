"tuse strict";
// jshint unused: false

var assert = require("chai").assert;
var globy = require("../lib/globy.js");
var deepEqual = assert.deepEqual;
var opt = { nocase: true };

suite("glob nocase:", function() {
    test("BLOCKS (nocase)", function() {
        deepEqual(globy.glob("blocks", opt), ["blocks"]);
        deepEqual(globy.glob("BLOCKS", opt), ["blocks"]);
        deepEqual(globy.glob("BloCkS", opt), ["blocks"]);
    });


    test("eleMENTs/geMs/emErald.gem (nocase)", function() {
        deepEqual(
            globy.glob("eleMENTs/geMs/emErald.gem", opt),
            ["elements/gems/Emerald.gem"]
        );
    });


    test("ELEMENTS/*.INGOT (nocase)", function() {
        deepEqual(
            globy.glob("ELEMENTS/*.INGOT", opt),
            [
                "elements/Gold.ingot",
                "elements/Iron.ingot",
            ]
        );
    });


    test("elements/*.INGOT (case)", function() {
        deepEqual(
            globy.glob("elements/*.INGOT"),
            []
        );
    });


    test("*/DIAMOND.gem (dot, nocase)", function() {
        deepEqual(
            globy.glob("*/DIAMOND.gem", { nocase: true, dot: true }),
            [".secret/Diamond.gem"]
        );
    });


    test("**/*.{INGOT,GEM} (dot, nocase)", function() {
        deepEqual(
            globy.glob("**/*.{INGOT,GEM}", opt),
            [
                "elements/Gold.ingot",
                "elements/Iron.ingot",
                "elements/gems/Emerald.gem",
            ]
        );
    });
});
