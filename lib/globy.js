"use strict";

var pr = require("./pattern_regex.js");
var fs = require("fs");

var Root = "Root";
var Tail = "Tail";
var ListDir = "ListDir";
var Node = "Node";
var Regex = "Regex";
var Star = "Star";
var Recursive = "Recursive";
var DirFilter = "DirFilter";


/**
 * exports
 */

exports.glob = function(pattern, options) {
    options = options || {};

    if(hasMeta(pattern) || options.nocase) {
        var GlobClass = options.nofollow ? GlobNoFollow : Glob;
        var glob = new GlobClass(pattern, options);
        glob.search();
        return glob.result;
    }

    if(fs.existsSync(pattern)) {
        return [pattern];
    }

    return [];
};


exports.fnmatch = function(pattern, path) {
    if(fnmatchCache[pattern]) {
        return fnmatchCache[pattern].test(path);
    }

    var regex = pr.toRegex(pattern, "", "^", "$");
    fnmatchCache[pattern] = regex;
    return regex.test(unixfy(path));
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
    return regex.test(unixfy(path));
};

var fnincludeCache = Object.create(null);


exports.toRegex = pr.toRegex;

exports.toRegexSource = pr.toRegexSource;

exports.Glob = Glob;


/**
 * Rule class
 */

function Rule(type, node, next) {
    this.type = type;
    this.node = node;
    this.next = next;
}


Rule.prototype.match = function(filename, nocase) {
    if(this.regex === undefined) {
        var flags = nocase ? "i" : "";
        this.regex = pr.toRegex(this.node, flags, "^", "$");
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
    this._fsCache = options._fsCache || {};
    this.existsCache = Object.create(null);
    this.pattern = pattern;
    this.ruleList = this.createRuleList();
}


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
    var nocase = this.nocase;
    var nodes = this.pattern.split("/").reverse();
    var last = nodes.length - 1;
    var list = new Rule(Tail, null, null);

    nodes.forEach(function(node, i) {
        if(node === "*") {
            list = new Rule(ListDir, null, new Rule(Star, null, list));

        } else if(node === "**") {
            if(list.type === ListDir) {
                list = list.next;
            }
            list = new Rule(Recursive, null, list);

        } else if(node === "") {
            if(i === last) {
                list = new Rule(Root, null, list);

            } else if(i === 0) {
                list = new Rule(DirFilter, null, list);
            }
        } else if(nocase || hasMeta(node)) {
            list = new Rule(ListDir, null, new Rule(Regex, node, list));

        } else {
            list = new Rule(Node, node, list);
        }
    });

    return list;
};


Glob.ruleListCache = Object.create(null);


Glob.ruleListCacheNocase = Object.create(null);


Glob.prototype.search = function() {
    this.walk(this.ruleList, "", this.ruleList.node);
};


Glob.prototype.walk = function walk(list, path, node) {
    if(node) {
        path = pathJoin(path, node);
    }
    this[list.type](list, path, node);
};


Glob.prototype.Root = function(list, path, node) {
    var root;
    if(process.platform === "win32") {
        root = process.resolve("/").slice(0, 2) + "/";
    } else {
        root = "/";
    }
    this.walk(list.next, root, list.next.node);
};


Glob.prototype.Tail = function(list, path, node) {
    this.result.push(path);
};


Glob.prototype.Node = function(list, path, node) {
    if(node && node !== list.node) {
        return;
    }

    if(list.next.type === Tail) {
        if(fs.existsSync(path)) {
            this.result.push(path);
        }
    } else {
        this.walk(list.next, path, list.next.node);
    }
};


Glob.prototype.ListDir = function(list, path, node) {
    this.dirEach(path, function(child) {
        this.walk(list.next, path, child);
    });
};


Glob.prototype.dirEach = function(path, iterator) {
    try {
        var children = fs.readdirSync(path || ".");
    } catch(_) {
        children = [];
    }

    for(var i = 0; i < children.length; i++) {
        if(children[i][0] !== "." || this.dot) {
            iterator.call(this, children[i], i);
        }
    }
};

Glob.prototype.Regex = function(list, path, node) {
    if(list.match(node, this.nocase)) {
        this.walk(list.next, path, null);
    }
};


Glob.prototype.Star = function(list, path, node) {
    this.walk(list.next, path, null);
};


Glob.prototype.Recursive = function(list, path, node) {
    this.dirEach(path, function(child) {
        this.walk(list.next, path, child);
        if(list.next.type !== Tail) {
            this.walk(list, pathJoin(path, child), null);
        }
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


/**
 * GlobNoFollow class
 */

function GlobNoFollow(pattern, options) {
    Glob.call(this, pattern, options);
    this.inodes = {};
}


GlobNoFollow.prototype = Object.create(Glob);


GlobNoFollow.prototype.walk = function(list, path) {


};


/**
 * Utils
 */

function pathJoin(dir, node) {
    if(dir.length === 0) {
        return node;
    } else if(dir === "/") {
        return "/" + node;
    }
    return dir + "/" + node;
}

function unixfy(path) {
    if(process.platform !== "win32") {
        return path;
    }
    return path.replace(/^[A-Za-z]:[\/\\]|\\/g, "/");
}


function hasMeta(node) {
    return /[{[*?]/.test(node);
}
