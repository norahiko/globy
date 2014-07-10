var assert = require("chai").assert;
var deepEqual = assert.deepEqual;

try {
    var speedup = require("../build/Release/speedup.node");
    var suite_ = suite;
} catch(_) {
    suite_ = suite.skip;
}


suite_("speedup:", function () {
    test("readdirSyncSafe('.')", function() {
        deepEqual(
            speedup.readdirSyncSafe("."),
            [".hidden_file", ".secret", "blocks", "elements", "tools"]
        );
    });


    test("readdirSyncSafe('not_exists_dir')", function() {
        deepEqual(
            speedup.readdirSyncSafe("not_exists_dir"),
            null
        );
    });



});
