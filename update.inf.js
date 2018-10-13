
exports.inf = async function (INF, ALIAS) {

    const NCU = require('npm-check-updates');

    return {
        invoke: async function (pointer, value) {

            if (pointer === "run()") {

                console.log("Updating packs ...");

                const packs = await INF.LIB.FS.readdirAsync(INF.LIB.PATH.join(__dirname, 'packs'));

                await INF.LIB.Promise.mapSeries(packs, function (pack) {

                    console.log(`Updating packages for pack '${pack}' ...`);

                    await NCU.run({
                        packageFile: INF.LIB.PATH.join(INF.rootDirm, 'package.json'),
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
