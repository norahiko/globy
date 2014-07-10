"use strict";

var pr = require("./pattern_regex.js");
var fs = require("fs");

try {
    var speedup = require("../build/Release/speedup.node");
    var readdirSyncSafe = speedup.readdirSyncSafe;
    var isSymbolicLink = speedup.isSymbolicLink;
    var existsSync = speedup.existsSync;
} catch(_) {
    readdirSyncSafe = function(path) {
        try { return fs.readdirSync(path); } catch(_) {}
        return null;
    };

    isSymbolicLink = function(path) {
        try {
            return fs.lstatSync(path).isSymbolicLink();
        } catch(_) {
            return false;
        }
    };

    existsSync = fs.existsSync;
}


var Root = "Root";
var Tail = "Tail";
var ListDir = "ListDir";
var Filename = "Filename";
var Regex = "Regex";
var Star = "Star";
var Recursive = "Recursive";
var DirFilter = "DirFilter";

var defaultOptions = {
    dot: false,
    nocase: false,
    nofollow: false,
};

/**
 * exports
 */

exports.glob = function(pattern, options) {
    options = options || defaultOptions;
    var glob = new Glob(pattern, options);
    glob.search();
    return glob.result;
};


exports.fnmatch = function(pattern, path) {
    if(fnmatchCache[pattern]) {
        return fnmatchCache[pattern].test(path);
    }

    var regex = pr.toRegex(pattern, "", "^", "$");
    fnmatchCache[pattern] = regex;
    return regex.test(exports.unixfy(path));
};

var fnmatchCache = Object.create(null);


exports.fninclude = function(pattern, path) {
    if(fnincludeCache[pattern]) {
        return fnincludeCache[pattern].test(path);
    }

    var lastChar = pattern[pattern.length - 1];
    var prefix = (pattern[0] === "/") ? "^" : "(?:/|^)";
    var suffix = (lastChar !== "/") ? "(?:/|$)" : "";
    var regex = pr.toRegex(pattern, "", prefix, suffix);

    fnincludeCache[pattern] = regex;
    return regex.test(exports.unixfy(path));
};

var fnincludeCache = Object.create(null);


exports.unixfy = function(path) {
    if(Glob.isWindows) {
        return path.replace(/^[A-Za-z]:[\/\\]|\\/g, "/");
    }
    return path;
};

exports.toRegex = pr.toRegex;

exports.toRegexSource = pr.toRegexSource;

exports.Glob = Glob;


/**
 * Rule class
 */

function Rule(type, filename, next) {
    this.type = type;
    this.filename = filename;
    this.next = next;
}


Rule.prototype.match = function(filename, nocase) {
    if(this.regex === undefined) {
        var flags = nocase ? "i" : "";
        this.regex = pr.toRegex(this.filename, flags, "^", "$");
    }
    return this.regex.test(filename);
};


/**
 * Glob class
 */

function Glob(pattern, options) {
    this.result = [];
    this.dot = !!options.dot;
    this.nocase = !!options.nocase;
    this.nofollow = !!options.nofollow;
    this.pattern = pattern;

    if(Glob.isWindows) {
        this.root = process.resolve("/").slice(0, 2) + "/";
    } else {
        this.root = "/";
    }
    this.ruleList = this.createRuleList();
}


Glob.isWindows = process.platform === "win32";


Glob.hasMeta = function(filename) {
    return /[{[*?]/.test(filename);
};


Glob.ruleListCache = Object.create(null);


Glob.ruleListCacheNocase = Object.create(null);


Glob.prototype.createRuleList = function() {
    var cache = this.nocase ? Glob.ruleListCacheNocase : Glob.ruleListCache;
    if(cache[this.pattern]) {
        return cache[this.pattern];
    }

    var ruleList = this.parse();
    cache[this.pattern] = ruleList;
    return ruleList;
};


Glob.prototype.parse = function() {
    var filenames = this.pattern.split("/");
    var last = filenames.length - 1;
    var list = new Rule(Tail, null, null);

    for(var i = last; 0 <= i; i--) {
        var filename = filenames[i];
        if(filename === "*") {
            list = new Rule(ListDir, null, new Rule(Star, null, list));

        } else if(filename === "**" && list.type !== Tail) {
            if(list.type === ListDir) {
                // case: pattern == "**/*"
                // remove ListDir
                list = list.next;
            }
            list = new Rule(Recursive, null, list);

        } else if(filename === "" && i === 0) {
            // case: pattern starts with "/"
            if(list.type === DirFilter) {
                // case: pattern == "/"
                list = new Rule(Root, null, list.next);

            } else {
                list = new Rule(Root, null, list);
            }

        } else if(filename === "" && i === last) {
            // case: pattern ends with "/"
            list = new Rule(DirFilter, null, list);

        } else if(this.nocase || Glob.hasMeta(filename)) {
            list = new Rule(ListDir, null, new Rule(Regex, filename, list));

        } else {
            list = new Rule(Filename, filename, list);
        }
    }
    return list;
};


Glob.prototype.search = function() {
    this.walk(this.ruleList, "", this.ruleList.filename);
};


Glob.prototype.walk = function(list, path, filename) {
    if(filename) {
        path = this.pathJoin(path, filename);
    }
    this[list.type](list, path, filename);
};


Glob.prototype.pathJoin = function(dir, filename) {
    if(dir.length === 0) {
        return filename;
    } else if(dir === this.root) {
        return this.root + filename;
    }
    return dir + "/" + filename;
};


Glob.prototype.dirEach = function(path, iterator) {
    var children = readdirSyncSafe(path || ".");
    if(children === null) {
        return;
    }

    for(var i = 0; i < children.length; i++) {
        if(children[i][0] !== "." || this.dot) {
            iterator.call(this, children[i]);
        }
    }
};


Glob.prototype.Root = function(list, path, filename) {
    this.walk(list.next, this.root, list.next.filename);
};


Glob.prototype.Tail = function(list, path, filename) {
    this.result.push(path);
};


Glob.prototype.Filename = function(list, path, filename) {
    if(filename && filename !== list.filename) {
        return;
    }

    if(list.next.type === Tail) {
        if(existsSync(path)) {
            this.result.push(path);
        }
    } else {
        this.walk(list.next, path, list.next.filename);
    }
};


Glob.prototype.ListDir = function(list, path, filename) {
    this.dirEach(path, function(child) {
        this.walk(list.next, path, child);
    });
};


Glob.prototype.Regex = function(list, path, filename) {
    if(list.match(filename, this.nocase)) {
        this.walk(list.next, path, null);
    }
};


Glob.prototype.Star = function(list, path, filename) {
    this.walk(list.next, path, null);
};


Glob.prototype.Recursive = function(list, path, filename) {
    this.dirEach(path, function(child) {
        if(this.nofollow) {
            var p = this.pathJoin(path, child);
            if(isSymbolicLink(p)) {
                this.result.push(p);
                return;
            }
        }

        this.walk(list.next, path, child);
        this.walk(list, path, child);
    });
};


Glob.prototype.DirFilter = function(list, path) {
    try {
        var stat = fs.statSync(path);
        if(stat.isDirectory()) {
            this.result.push(path + "/");
        }
    } catch(_) {}
};
