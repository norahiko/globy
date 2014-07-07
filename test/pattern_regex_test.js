"use strict";

var assert = require("chai").assert;
var ok = assert.ok;
var notOk = assert.notOk;
var pr = require("../lib/pattern_regex.js");


suite("pattern_regex.toRegex:", function() {
    test("*", function() {
        var r = pr.toRegex("*nix", "", "^", "$");
        ok(r.test("Unix"), "Unix");
        ok(r.test("oooooonix"), "ooooonix");
        notOk(r.test("Linux"), "Linux");
        notOk(r.test("dir/unix"), "dir/unix");
    });


    test("*foo*", function () {
        var r = pr.toRegex("*glob*", "", "^", "$");
        ok(r.test("globe"), "globe");
        ok(r.test("eglob"), "eglob");
    });


    test("{foo,bar}", function() {
        var r = pr.toRegex("README.{md,txt}", "i", "^", "$");
        ok(r.test("README.md"));
        ok(r.test("readme.md"));
        ok(r.test("README.txt"));
        ok(r.test("readme.txt"));
        ok(r.test("README.TXT"));
        notOk(r.test("__README.md"));
        notOk(r.test("README.js"));
        notOk(r.test("readme.md.js"));
    });


    test("escape meta character", function() {
        assert.doesNotThrow(function () {
            pr.toRegex(")] [($^\\+*?", "", "", "");
        });
    });


    test("[0-9]", function() {
        var r = pr.toRegex("[0-9].txt", "i", "^", "$");
        ok(r.test("1.txt"));
        ok(r.test("2.txt"));
        ok(r.test("9.txt"));
        notOk(r.test("x.txt"));
        notOk(r.test("01.txt"));
    });


    test("[ab]", function() {
        var r = pr.toRegex("[ab].txt", "i", "^", "$");
        ok(r.test("a.txt"));
        ok(r.test("b.txt"));
        notOk(r.test("c.txt"));
    });


    test("[!0-9]", function() {
        var r = pr.toRegex("[!0-9].txt", "i", "^", "$");
        ok(r.test("a.txt"));
        notOk(r.test("0.txt"));
        notOk(r.test("2.txt"));
        notOk(r.test("9.txt"));
    });
});
