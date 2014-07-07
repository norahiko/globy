"use strict";

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


var lexer = [];

// recursive star
lexer.push({
    regex: /^\*\*/,

    replace: function(token, ptn) {
        return ".*";
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
