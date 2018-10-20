bash.origin.lib
===============

> Because `npm` creates a lot of duplication across many packages.

The `bash.origin.lib` package provides a stable set of `npm` packages that are used as dependencies by the **bash.origin** ecosystem.

These packages are installed into a cache directory at `~/.bash.origin.lib/` and loaded using `require('bash.origin.lib').require('<PackageName>')`.

This allows common packages to be used across many projects without needing to install them within each package.

Usage
-----

**package.json**
```
{
    "main": "main.js",
    "dependencies": {
        "bash.origin.lib": "^0.1.0"
    },
    "config": {
        "bash.origin.lib": {
            "pack": "minimal"   // See `./packs/*/` for available pack aliases
        }
    }
}
```

**main.js**
```
const BO_CTX = require("bash.origin.lib").forPackage(__dirname);

// See `./packs/*/package.json : dependencies` for available packages
const LODASH = BO_CTX.LIB.LODASH;
const LODASH = BO_CTX.require("lodash");
```

Design
======

The `bash.origin.lib` package provisions a stable set of `npm` packages into `~/.bash.origin.lib/` which is the **cache directory**.

Internally it uses [nodepack.io](http://nodepack.io) which turns the *cache directory root* into `~/.bash.origin.lib/io.nodepack.inf/community.npm/`.

The cache layout for *nodepack.io* follows `bash.origin.lib.<Pack_Alias>/<Pack_MajorMinorVersion>_<NodeJS_MajorVersion>_<NodeJS_Platform>_<NodeJS_Architecture>_dependencies/node_modules/` where:

  * `<Pack_Alias>` follows directories inside `./packs/`.
  * `<Pack_MajorMinorVersion>` corresponds to the `v<Major>.<Minor>` version of the pack as declared at `./packs/*/package.json : version`.
  * `<NodeJS_MajorVersion>` is `<Major>` of `process.version` from NodeJS.
  * `<NodeJS_Platform>` is `process.platform` from NodeJS.
  * `<NodeJS_Architecture>` is `process.arch` from NodeJS.

When the `bash.origin.lib` package is installed by `npm` it calls `./inf.install.json` which will delegate installation to `./inf.install.js` and in turn to `io.nodepack.inf`. The installation proceeds as follows:

  1. The `<Pack_Alias>` is read from `package.json : config['bash.origin.lib'].pack` of the declaring package.
  2. The `<Major>.<Minor>` pack version is read from `./packs/<Pack_Alias>/package.json : version`.
  3. The *full cache path* is derived and the existing `<Patch>` version is read if it exists.
  4. If the pack does not exist or if the `<Patch>` version is smaller than `<Patch>` from `./packs/<Pack_Alias>/package.json : version` the pack is provisioned for the first time or to replace the existing pack.
  5. All `node_modules/.bin/*` commands from the cached pack are linked into `node_modules/.bin/` of the declaring package if they do not already exist.

After installation, packages from the cached pack are available in the declaring package via `require("bash.origin.lib").require("<Package_Name>")` where `<Package_Name>` is one of `./packs/<Pack_Alias>/package.json : dependencies`.

Development
===========

Update packages in packs:

    npm run update

Release preview:

    npm run release-preview

    # To use in a project use
    npm install bash.origin.test@pre

Release to all:

    npm run release-to-all
