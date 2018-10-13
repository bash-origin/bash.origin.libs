
exports.inf = async function (INF, ALIAS) {

    const NCU = require('npm-check-updates');
    const RELEASE_IT = require('release-it');

    return {
        invoke: async function (pointer, value) {

            if (pointer === "run()") {

                if (value.value === "update") {

                    console.log("Updating bash.origin.lib package ...");

                    // @see https://github.com/tjunnone/npm-check-updates
                    await NCU.run({
                        upgrade: true,
                        packageFile: INF.LIB.PATH.join(__dirname, 'package.json')
                    }).then((upgraded) => {

                        // TODO: If only patch version updated we update patch version of pack
                        // TODO: If minor version updated we update minor version of pack
                        // TODO: If major version updated we update major version of pack

                        console.log(`Updated bash.origin.lib package:`, upgraded);
                    });

                    console.log("Updating packs ...");

                    const packsPath = INF.LIB.PATH.join(__dirname, 'packs');
                    const packs = await INF.LIB.FS.readdirAsync(packsPath);

                    await INF.LIB.Promise.mapSeries(packs, async function (pack) {

                        console.log(`Updating packages for pack '${pack}' ...`);

                        await NCU.run({
                            upgrade: true,
                            packageFile: INF.LIB.PATH.join(packsPath, pack, 'package.json')
                        }).then((upgraded) => {

                            // TODO: If only patch version updated we update patch version of pack
                            // TODO: If minor version updated we update minor version of pack
                            // TODO: If major version updated we update major version of pack

                            console.log(`Updated packages for pack '${pack}':`, upgraded);
                        });
                    });

                } else
                if (value.value === "release-as-preview") {

                    // @see https://webpro.github.io/release-it/
                    RELEASE_IT({
                        "non-interactive": true,
                        "dry-run": true,
                        "increment": "minor",
                        "npm": {
                            "publish": false,
                            "tag": "pre"
                        }
                    }).then(output => {


                        console.log(output);
                    });


                }

                return true;
            }
        }
    };
}
