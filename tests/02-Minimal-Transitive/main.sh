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

echo "bin: $(bash.origin.lib bin)"
echo "node_modules: $(bash.origin.lib node_modules)"

echo "bin[0]: $(bash.origin.lib bin 0)"
echo "node_modules[0]: $(bash.origin.lib node_modules 0)"

echo "bin[0.1]: $(bash.origin.lib bin 0.1)"
echo "node_modules[0.1]: $(bash.origin.lib node_modules 0.1)"

echo "-----"


node --eval '
    let LIB = require("sub").LIB;

    let basedir = require("path").dirname(require.resolve("sub"));

    console.log("LIB", LIB);
    console.log("LIB.version", LIB.version);
    console.log("LIB.node_modules", LIB.node_modules);
    console.log("LIB.forPackage(basedir)", LIB.forPackage(basedir));
    console.log("LIB.forPackage(basedir).version", LIB.forPackage(basedir).version);
    console.log("LIB.forPackage(basedir).node_modules", LIB.forPackage(basedir).node_modules);

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
