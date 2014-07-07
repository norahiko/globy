"use strict";

var assert = require("chai").assert;
var globy = require("../lib/globy.js");


suite("fnmatch:", function() {
    function ok(pattern, path) {
        assert.ok(
            globy.fnmatch(pattern, path),
            "Match failed, RegExp('" + pattern + "') == '" + path + "'"
        );
    }

    function notOk(pattern, path) {
        assert.notOk(
            globy.fnmatch(pattern, path),
            "Match failed, Pattern('" + pattern + "') != '" + path + "'"
        );
    }

    test("file name", function() {
        ok("dir", "dir");
        ok("dir/", "dir/");
        ok("/dir", "/dir");

        notOk("dir", "dir/");
        notOk("dir", "/dir/");
        notOk("dir/", "/dir/");
        notOk("dir/", "dir/file");
        notOk("dir/", "/dir/file");
        notOk("dir/", "dir/dir/");
    });


    test("root", function() {
        ok("/root", "/root");
        ok("/root/", "/root/");
        ok("/root/dir", "/root/dir");
        notOk("/root", "/root/");
        notOk("/root", "/root/dir");
        notOk("/root", "//root");
    });


    test("?", function() {
        ok("?", "a");
        ok("?nix", "Unix");
        ok("a?t", "alt");
        ok("???", "abc");

        notOk("?", "ab");
        notOk("a?", "abc");
        notOk("?a", "aac");
        notOk("a?b", "a/b");
        notOk("a?", "a");
        notOk("a?c", "ac");
    });


    test("*", function() {
        ok("*", "file");
        ok("/*", "/file");
        ok("*/", "dir/");
        ok("/*/", "/dir/");
        ok("*/", "/");
        ok("dir/*", "dir/text");
        ok("dir/*/", "dir/images/");
        ok("*/root", "/root");
        ok("*/*", "foo/bar");
        ok("*/*", "foo/");

        notOk("dir/*", "dir/images/");
        notOk("*/", "dir/file");
        notOk("/*", "dir/");
        notOk("/*", "dir/dir");
        notOk("*/", "dir");
        notOk("*/file", "file");
        notOk("*/*", "dir");
        notOk("*/*", "foo/bar/baz");
        notOk("*/*/", "foo/bar");
        notOk("*/*/*", "foo/bar");
        notOk("*/*/*", "foo/bar/baz/foo");
    });


    test("partial *", function() {
        ok("*file", "file");
        ok("*file", "a_file");
        ok("file*", "file");
        ok("file*", "files");
        ok("*dir/*", "some_dir/file");

        ok("*spam*", "eggspamham");
        ok("*.js", "groby.js");
        ok("*/*.js", "lib/groby.js");
        ok("*.js/dir", "groby.js/dir");
        ok("a*z", "a_to_z");
        ok("a*z/", "a_to_z/");

        notOk("file*", "fil");
        notOk("file*", "a_file");
        notOk("*file", "files");
        notOk("/*root", "root");
        notOk("a*z", "amazon");
    });


    test("**", function() {
        ok("**", "foo/bar/baz");
        ok("**", "foo/bar/");
        ok("**", "/usr/lib/node");
        ok("/**", "/usr/lib/node");
        ok("**/*.js", "lib/glob.js");
        ok("**/*.js", "lib/node_modules/glob/lib/glob.js");
        ok("dir/**/*.js", "dir/foo/bar/baz/script.js");
        ok("**/lib", "/lib");
        ok("**/cat", "animal/mammal/feline/cat");
        ok("**/mammal/**", "animal/mammal/feline/cat");

        notOk("**/dir", "");
        notOk("dir/**", "dir");
        notOk("/**", "not/root");
        notOk("**/lib", "foo/bar/baz/lib/foo");
        notOk("**/lib/**", "foo/_lib_/baz");
    });
});


suite("fninclude:", function() {
    function ok(pattern, path) {
        assert.ok(
            globy.fninclude(pattern, path),
            "Include failed, RegExp('" + pattern + "') == '" + path + "'"
        );
    }

    function notOk(pattern, path) {
        assert.notOk(
            globy.fninclude(pattern, path),
            "Include failed, Pattern('" + pattern + "') != '" + path + "'"
        );
    }


    test("file name", function() {
        ok("dir", "dir");
        ok("dir", "home/dir");
        ok("dir", "dir/");
        ok("dir", "/dir/");
        ok("dir/", "dir/");
        ok("dir/", "/dir/");
        ok("dir/", "/dir/file");
        ok("dir/", "--dir/dir/");

        notOk("dir/", "dir");
        notOk("dir/", "/dir");
        notOk("dir", "-dir");
        notOk("dir", "dir-");
        notOk("dir", "-dir/file");
        notOk("dir", "dir-/file");
        notOk("home/dir", "home/dir-dev");
        notOk("dir/", "/dir");
        notOk("dir/", "/dir");

        ok("lib/node_modules", "/home/bill/lib/node_modules/globy");
        notOk("lib/node", "/home/bill/lib/node_modules/globy");
    });


    test("root", function() {
        ok("/root", "/root");
        ok("/root", "/root/dir");
        notOk("/root", "dir/root");
        notOk("/root", "//root/dir");
    });


    test("char include", function() {
        ok("?", "a");
        ok("?nix", "Unix");
        ok("a?t", "alt");
        ok("???", "abc");

        notOk("a?b", "a/b");
        notOk("a?", "a");
        notOk("a?c", "ac");
    });


    test("*", function() {
        ok("*", "file");
        ok("*", "/file");
        ok("*", "dir/");
        ok("*", "/dir/");
        ok("*/", "/");
        ok("*/", "dir/");
        ok("*/", "/dir/file");
        ok("dir/*", "dir/text");
        ok("dir/*", "dir/images/");
        ok("*/root", "/root");
        ok("*/*", "foo/bar");
        ok("*/*", "foo/bar/baz");
        ok("*/*", "foo/");

        notOk("/*", "dir/");
        notOk("/*", "dir/dir");
        notOk("*/", "dir");
        notOk("*/file", "file");
        notOk("*/*", "dir");
        notOk("*/*/", "foo/bar");
        notOk("*/*/*", "foo/bar");
    });


    test("partial *", function() {
        ok("*file", "file");
        ok("*file", "a_file");
        ok("*file", "/a_file");
        ok("file*", "file");
        ok("file*", "files");
        ok("file*", "/files");
        ok("*dir/*", "some_dir/file");

        ok("*spam*", "eggspamham");
        ok("*spam*", "egg/spam/ham");
        ok("*spam*", "egg/spamham");
        ok("*spam*", "eggspam/ham");
        ok("*.js", "groby.js");
        ok("*.js", "lib/groby.js");
        ok("*.js", "groby.js/dir");
        ok("a*z", "a_to_z");
        ok("a*z", "/a_to_z/");

        notOk("file*", "fil");
        notOk("file*", "a_file");
        notOk("*file", "files");
        notOk("/*root", "root");
        notOk("a*z", "amazon");
    });


    test("**", function() {
        ok("**", "foo/bar/baz");
        ok("**", "foo/bar/");
        ok("**", "/usr/lib/node");
        ok("/**", "/usr/lib/node");
        ok("**/*.js", "lib/glob.js");
        ok("**/*.js", "lib/node_modules/glob/lib/glob.js");
        ok("**/lib", "/lib");
        ok("**/lib", "foo/bar/baz/lib/foo/bar");
        ok("**/lib/**", "foo/bar/baz/lib/foo/bar");

        notOk("**/dir", "");
        notOk("dir/**", "dir");
        notOk("/**", "not/root");
        notOk("**/lib/**", "foo/_lib_/baz");
    });


    test("escaped char", function() {
        ok("([+|/]$^", "([+|/]$^");
        ok("\\*", "*");
    });


    test("other character", function() {
        ok("*/*", "三十三/四");
        ok("三十三/四", "三十三/四");
    });
});
