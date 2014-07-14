"tuse strict";
// jshint unused: false

Error.stackTraceLimit = 5;

var assert = require("chai").assert;
var globy = require("../lib/globy.js");
var equal = assert.strictEqual;
var deepEqual = assert.deepEqual;
var root = process.cwd();

setup(function () {
    process.chdir("test/chest");
});

teardown(function () {
    process.chdir(root);
});


suite("glob:", function() {
    test("<empty string>", function() {
        deepEqual(globy.glob(""), []);
    });


    test("blocks", function() {
        deepEqual(globy.glob("blocks"), ["blocks"]);
    });


    test("blocks/", function() {
        deepEqual(globy.glob("blocks/"), ["blocks/"]);
    });


    test(".hidden_file", function() {
        deepEqual(globy.glob(".hidden_file"), [".hidden_file"]);
    });


    test(".hidden_file/", function() {
        deepEqual(globy.glob(".hidden_file/"), []);
    });


    test("./blocks", function() {
        deepEqual(globy.glob("./blocks"), ["./blocks"]);
    });


    test("/", function() {
        var root = process.platform === "win32" ? "C:/" : "/";
        deepEqual(globy.glob("/"), [root]);
    });


    test(".", function() {
        deepEqual(globy.glob("."), ["."]);
    });


    test("..", function() {
        deepEqual(globy.glob(".."), [".."]);
    });


    test("./", function() {
        deepEqual(globy.glob("./"), ["./"]);
    });


    test("../chest/blocks", function() {
        deepEqual(globy.glob("../chest/blocks"), ["../chest/blocks"]);
    });


    test("fullpath", function() {
        equal(
            globy.glob(root + "/test/chest/blocks/Stone").length,
            1
        );
    });


    test("not match fullpath", function() {
        equal(
            globy.glob(root + "/test/chest/blocks/Nothing").length,
            0
        );
    });
});

