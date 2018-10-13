
exports.inf = async function (INF, ALIAS) {

    const NCU = require('npm-check-updates');

    return {
        invoke: async function (pointer, value) {

            if (pointer === "run()") {

                console.log("Updating bash.origin.lib package ...");

                await NCU.run({
                    packageFile: INF.LIB.PATH.join(__dirname, 'package.json'),
                    silent: true,
                    jsonUpgraded: true
                }).then((upgraded) => {

                    console.log(`Updated bash.origin.lib package:`, upgraded);

                    return true;
                });

                console.log("Updating packs ...");

                const packsPath = INF.LIB.PATH.join(__dirname, 'packs');
                const packs = await INF.LIB.FS.readdirAsync(packsPath);

                await INF.LIB.Promise.mapSeries(packs, async function (pack) {

                    console.log(`Updating packages for pack '${pack}' ...`);

                    await NCU.run({
                        packageFile: INF.LIB.PATH.join(IpacksPath, pack, 'package.json'),
                        silent: true,
                        jsonUpgraded: true
                    }).then((upgraded) => {
    
                        console.log(`Updated packages for pack '${pack}':`, upgraded);
                    });
                });

                return true;
            }
        }
    };
}
