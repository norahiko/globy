"use strict";

var fnmatchCache = Object.create(null);
var fnincludeCache = Object.create(null);


function unixfy(path) {
    if(exports.isWindows) {
        return path.replace(/^[A-Za-z]:[\/\\]|\\/g, "/");
    }
    return path;
}


exports.isWindows = process.platform === "win32";


exports.toRegex = function (pattern, flags, prefix, suffix) {
    var source = prefix + exports.toRegexSource(pattern) + suffix;
    return new RegExp(source, flags);
};


exports.toRegexSource = function(pattern) {
    var ptn = pattern;
    var result = "";

    while(ptn.length !== 0) {
        for(var i = 0; i < lexer.length; i++) {
            var match = ptn.match(lexer[i].regex);
            if(match) {
                result += lexer[i].replace(match[0], ptn);
                ptn = ptn.slice(match[0].length);
                break;
            }
        }
    }

    return result;
};


exports.fnmatch = function(pattern, path) {
    if(fnmatchCache[pattern]) {
        return fnmatchCache[pattern].test(path);
    }

    var regex = exports.toRegex(pattern, "", "^", "$");
    fnmatchCache[pattern] = regex;
    return regex.test(unixfy(path));
};


exports.fninclude = function(pattern, path) {
    if(fnincludeCache[pattern]) {
        return fnincludeCache[pattern].test(path);
    }

    var lastChar = pattern[pattern.length - 1];
    var prefix = (pattern[0] === "/") ? "^" : "(?:/|^)";
    var suffix = (lastChar !== "/") ? "(?:/|$)" : "";
    var regex = exports.toRegex(pattern, "", prefix, suffix);

    fnincludeCache[pattern] = regex;
    return regex.test(unixfy(path));
};


/**
 * Lexer
 */

var lexer = [];

// recursive star
lexer.push({
    regex: /^\*\*\//,

    replace: function(token, ptn) {
        return "(?:.*/)*";
    },
});



// pattern charracter
lexer.push({
    regex: /^[*?]/,

    replace: function(token, ptn) {
        return (token === "*") ? "[^/]*" : "[^/]";
    },
});


// pattern "[0-9]" "[abc]" "[!A-Z]"
lexer.push({
    regex: /^\[[^\]/]*\]/,

    replace: function(token) {
        if(token[1] === "!") {
            return token[0] + "^" + token.slice(2);
        }
        return token;
    },
});


// regex meta character
lexer.push({
    regex: /^[.$()^+|[\]]/,

    replace: function(token, ptn) {
        return "\\" + token;
    },
});


// pattern "{foo,bar,baz}" "{foo}"
lexer.push({
    regex: /^{[^,/}\s}]+(?:,[^,/}\s]+)*}/,

    replace: function(token, ptn) {
        return "(?:" + token.slice(1, -1).replace(/,/g, "|") + ")";
    },
});


// backslash escape
lexer.push({
    regex: /^\\./,

    replace: function(token, ptn) {
        return token;
    },
});


// other character
lexer.push({
    regex: /^./,

    replace: function(token, ptn) {
        return token;
    },
});
