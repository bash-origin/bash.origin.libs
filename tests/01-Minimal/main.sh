#!/usr/bin/env bash.origin.script

echo "TEST_MATCH_IGNORE>>>"

rm -Rf .~* node_modules package-lock.json || true
unset ${!npm*}


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
    let LIB = require("bash.origin.lib").forPackage(__dirname);

    console.log("LIB", LIB);
    console.log("LIB.version", LIB.version);
    console.log("LIB.binPath", LIB.binPath);
    console.log("LIB.nodeModulesPath", LIB.nodeModulesPath);
    console.log("LIB.forPackage(__dirname)", LIB.forPackage(__dirname));
    console.log("LIB.forPackage(__dirname).version", LIB.forPackage(__dirname).version);
    console.log("LIB.forPackage(__dirname).nodeModulesPath", LIB.forPackage(__dirname).nodeModulesPath);

    LIB = require("bash.origin.lib").forPackage(__dirname, "0");
    console.log("LIB.version", LIB.version);
    LIB = require("bash.origin.lib").forPackage(__dirname, "0").forPackage(__dirname, "0");
    console.log("LIB.version", LIB.version);

    LIB = require("bash.origin.lib").forPackage(__dirname, "0.1");
    console.log("LIB.version", LIB.version);
    LIB = require("bash.origin.lib").forPackage(__dirname, "0.1").forPackage(__dirname, "0.1");
    console.log("LIB.version", LIB.version);
'

echo "OK"
