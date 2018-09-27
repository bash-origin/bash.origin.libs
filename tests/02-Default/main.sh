#!/usr/bin/env bash.origin.script

echo "TEST_MATCH_IGNORE>>>"

rm -Rf .~* || true

inf {
    "#": "../",

    "org.pinf.genesis.inception/bash.origin.lib # map default": "./.~default",

    "org.pinf.genesis.inception # run()": "expand"
}

echo "---"

inf {
    "#": "../",

    "org.pinf.genesis.inception/bash.origin.lib # map default": "./.~default",

    "org.pinf.genesis.inception # run()": "expand"
}

echo "<<<TEST_MATCH_IGNORE"

echo "OK"
