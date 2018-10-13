#!/usr/bin/env bash.origin.script

echo "TEST_MATCH_IGNORE>>>"

rm -Rf .~* node_modules package-lock.json || true
unset ${!npm*}


# TODO: Add another 'sub' package that uses a different 'stream' to ensure two streams can co-exist

#pushd "sub" > /dev/null
#    npm pack
#popd > /dev/null


npm install

echo "<<<TEST_MATCH_IGNORE"


PATH="node_modules/.bin:$PATH"

echo "-----"

which bash.origin.lib

echo "-----"

echo "binPath: $(bash.origin.lib binPath)"
echo "nodeModulesPath: $(bash.origin.lib nodeModulesPath)"

echo "binPath[0]: $(bash.origin.lib binPath 0)"
echo "nodeModulesPath[0]: $(bash.origin.lib nodeModulesPath 0)"

echo "binPath[0.1]: $(bash.origin.lib binPath 0.1)"
echo "nodeModulesPath[0.1]: $(bash.origin.lib nodeModulesPath 0.1)"

echo "-----"


node --eval '
    let LIB = require("sub").LIB;

    let basedir = require("path").dirname(require.resolve("sub"));

    console.log("LIB", LIB);
    console.log("LIB.version", LIB.version);
    console.log("LIB.binPath", LIB.binPath);
    console.log("LIB.nodeModulesPath", LIB.nodeModulesPath);
    console.log("LIB.forPackage(basedir)", LIB.forPackage(basedir));
    console.log("LIB.forPackage(basedir).version", LIB.forPackage(basedir).version);
    console.log("LIB.forPackage(basedir).nodeModulesPath", LIB.forPackage(basedir).nodeModulesPath);

    LIB = require("bash.origin.lib").forPackage(basedir, "0");
    console.log("LIB.version", LIB.version);
    LIB = require("bash.origin.lib").forPackage(basedir, "0").forPackage(basedir, "0");
    console.log("LIB.version", LIB.version);

    LIB = require("bash.origin.lib").forPackage(basedir, "0.1");
    console.log("LIB.version", LIB.version);
    LIB = require("bash.origin.lib").forPackage(basedir, "0.1").forPackage(basedir, "0.1");
    console.log("LIB.version", LIB.version);
'

echo "OK"
