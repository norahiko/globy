"tuse strict";
// jshint unused: false

Error.stackTraceLimit = 5;

var assert = require("chai").assert;
var pathModule = require("path");
var ok = assert.ok;
var globy = require("../lib/globy.js");
var equal = assert.strictEqual;
var notEqual = assert.notStrictEqual;
var deepEqual = assert.deepEqual;

var root = process.cwd();

suite("glob ext", function() {
    setup(function () {
        process.chdir("test/chest");
    });
});
