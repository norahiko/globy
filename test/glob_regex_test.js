"tuse strict";
// jshint unused: false

var assert = require("chai").assert;
var globy = require("../lib/globy.js");
var deepEqual = assert.deepEqual;


suite("glob regex:", function() {
    test("blocks/????", function() {
        deepEqual(
            globy.glob("blocks/????"),
            [
                "blocks/Dirt",
                "blocks/Snow",
            ]
        );
    });


    test("elements/*.ingot", function() {
        deepEqual(
            globy.glob("elements/*.ingot"),
            [
                "elements/Gold.ingot",
                "elements/Iron.ingot",
            ]
        );
    });


    test("elements/Iron.*", function() {
        deepEqual(
            globy.glob("elements/Iron.*"),
            [
                "elements/Iron.block",
                "elements/Iron.ingot",
            ]
        );
    });


    test("*/*.ingot", function() {
        deepEqual(
            globy.glob("elements/*.ingot"),
            [
                "elements/Gold.ingot",
                "elements/Iron.ingot",
            ]
        );
    });


    test("*/{Dirt,Snow}", function() {
        deepEqual(
            globy.glob("*/{Dirt,Snow}"),
            [
                "blocks/Dirt",
                "blocks/Snow",
            ]
        );
    });


    test("**/*.animal", function() {
        deepEqual(
            globy.glob("**/*.animal"),
            []
        );
    });


    test("elements/*.INGOT", function() {
        deepEqual(
            globy.glob("elements/*.INGOT"),
            []
        );
    });


    test("**/*.gem", function() {
        deepEqual(
            globy.glob("**/*.gem"),
            [
                "elements/gems/Emerald.gem",
            ]
        );
    });



    test("**/*.gem (dot)", function() {
        deepEqual(
            globy.glob("**/*.gem", { dot: true }),
            [
                ".secret/Diamond.gem",
                "elements/gems/Emerald.gem",
            ]
        );
    });


    test("**/*block*", function() {
        deepEqual(
            globy.glob("**/*block*"),
            [
                "blocks",
                "elements/Iron.block",
            ]
        );
    });
});
