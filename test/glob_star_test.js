"tuse strict";
// jshint unused: false

Error.stackTraceLimit = 5;

var assert = require("chai").assert;
var globy = require("../lib/globy.js");
var equal = assert.strictEqual;
var deepEqual = assert.deepEqual;
var root = process.cwd();


suite("glob star:", function() {
    test("*", function() {
        deepEqual(
            globy.glob("*"),
            ["blocks", "elements", "tools"]
        );
    });


    test("*/", function() {
        deepEqual(
            globy.glob("*/"),
            ["blocks/", "elements/", "tools/"]
        );
    });


    test("blocks/*", function() {
        deepEqual(
            globy.glob("blocks/*"),
            [
                "blocks/CobbleStone",
                "blocks/Dirt",
                "blocks/SandStone",
                "blocks/Snow",
                "blocks/Stone",
            ]
        );
    });


    test("* (dot)", function() {
        deepEqual(
            globy.glob("*", { dot: true }),
            [".hidden_file", ".secret", "blocks", "elements", "tools"]
        );
    });


    test("*/ (dot)", function() {
        deepEqual(
            globy.glob("*/", { dot: true }),
            [".secret/", "blocks/", "elements/", "tools/"]
        );
    });


    test("./*", function() {
        deepEqual(
            globy.glob("./*"),
            ["./blocks", "./elements", "./tools"]
        );
    });


    test("./././*", function() {
        deepEqual(
            globy.glob("./././*"),
            ["./././blocks", "./././elements", "./././tools"]
        );
    });


    test(".*", function() {
        deepEqual(
            globy.glob(".*"),
            []
        );
    });


    test(".* (dot)", function() {
        deepEqual(
            globy.glob(".*", { dot: true }),
            [".hidden_file", ".secret"]
        );
    });

    test("../chest/*", function() {
        deepEqual(
            globy.glob("../chest/*"),
            ["../chest/blocks", "../chest/elements", "../chest/tools"],
            "glob ../chest/*"
        );
    });


    test("nothing/*", function() {
        deepEqual(
            globy.glob("nothing/*"),
            []
        );
    });


    test("/*", function() {
        var dirs = globy.glob("/*");
        if(process.platform !== "win32") {
            assert.include(dirs, "/bin");
            assert.include(dirs, "/tmp");
        } else {
            assert.include(dirs, "C:/Windows");
            assert.include(dirs, "C:/Users");
        }
    });
});
