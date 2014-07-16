globy
=====

New glob library for Node.js. Search fast and exactly.


## Installation

Requires (optional)

* [node-gyp] (https://github.com/TooTallNate/node-gyp)


Install

```sh
$ npm install globy
```

## Usage

```js
var globy = require("globy");

var options = {
    "dot": true,
    "nocase": false,
    "nofollow": false,
};

var files = globy.glob("**/*.js", options);
```


## API

### `globy.glob(pattern, [options])`

Glob search files.

* **returns** {String[]}
* `pattern` {String} filepath pattern
* `options` {Object=} search options
  * `dot`      {Boolean} (default: false) if true, `*` and `**` matchs dotfiles
  * `nocase`   {Boolean} (default: false) if true, perform case-insensitive match
  * `nofollow` {Boolean} (default: false) if true, `**` does not search symbolic link directory
