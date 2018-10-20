
exports.inf = async function (INF, ALIAS) {


    async function ensureInstalledForPaths (baseRoot, declaringPackageRoots, installer) {

        return INF.LIB.Promise.map(declaringPackageRoots, async function (declaringPackageRoot) {

            const declaringPackageDescriptorPath = INF.LIB.PATH.join(declaringPackageRoot, 'package.json');

            const declaringPackageDescriptor = await INF.LIB.FS.readJSONAsync(declaringPackageDescriptorPath);

            const config = INF.LIB.LODASH.get(declaringPackageDescriptor, ['config', 'bash.origin.lib'], null);

            if (INF.LIB.verbose) console.log(`[bash.origin.lib][install.inf.js] config for '${declaringPackageDescriptor.name}':`, config);

            if (!config) {
                // No 'bash.origin.lib' config present in descriptor.
                return false;
            }

            INF.LIB.ASSERT.equal(typeof config.pack, 'string', `'pack' is not set for '${declaringPackageDescriptorPath} : config["bash.origin.lib"]`);
            INF.LIB.ASSERT.equal(typeof config.stream, 'string', `'stream' is not set for '${declaringPackageDescriptorPath} : config["bash.origin.lib"]`);

            return installer({
                pack: config.pack,
                stream: config.stream,
                basePath: baseRoot
            });

            /*
                return INF.LIB.PATH.join(baseRoot, ".~_#_io.nodepack.inf_#_installed1.json");
            }).reduce(async function (mergedDescriptor, installedDescriptorPath) {
                if (!installedDescriptorPath) {
                    return;
                }
                // The 'installedDescriptor' contains all packs that are installed.
                const installedDescriptor = await INF.LIB.FS.readJSONAsync(installedDescriptorPath);
                INF.LIB.LODASH(mergedDescriptor, installedDescriptor);
                return mergedDescriptor;
            }, {}).then(function (installedDescriptor) {
            */
        });
    }


    return {
        invoke: async function (pointer, value) {

            if (pointer === "run()") {
                
                const declaringPackageRoots = [];

                if (INF.LIB.verbose) console.log("[bash.origin.lib][install.inf.js] process.env.INIT_CWD:", process.env.INIT_CWD);
                if (INF.LIB.verbose) console.log("[bash.origin.lib][install.inf.js] INF.LIB.PATH.join(process.cwd(), '../..'):", INF.LIB.PATH.join(process.cwd(), '../..'));

                const baseRoot = process.env.INIT_CWD || INF.LIB.PATH.join(process.cwd(), '../..');

                if (INF.LIB.verbose) console.log("[bash.origin.lib][install.inf.js] baseRoot:", baseRoot);

                declaringPackageRoots.push(baseRoot);
                (await INF.LIB.GLOB.async("node_modules/*/package.json", {
                    cwd: baseRoot
                })).forEach(function (path) {
                    declaringPackageRoots.push(INF.LIB.PATH.join(baseRoot, path, ".."));
                });

                if (INF.LIB.verbose) console.log("[bash.origin.lib][install.inf.js] declaringPackageRoots:", declaringPackageRoots);

                await ensureInstalledForPaths(baseRoot, declaringPackageRoots, async function (opts) {
                    return INF.run(await value.toInstructions({
                        opts: opts
                    }));                    
                });

                const installedDescriptorPath = INF.LIB.PATH.join(baseRoot, ".~_#_io.nodepack.inf_#_installed1.json");

                if (INF.LIB.verbose) console.log("[bash.origin.lib][install.inf.js] installedDescriptorPath:", installedDescriptorPath);

                if (!await INF.LIB.FS.existsAsync(installedDescriptorPath)) {
                    return true;
                }

                const installedDescriptor = await INF.LIB.FS.readJSONAsync(installedDescriptorPath);

                if (INF.LIB.verbose) console.log("[bash.origin.lib][install.inf.js] installedDescriptor:", installedDescriptor);

                const binPath = INF.LIB.PATH.join(baseRoot, "node_modules/.bin/bash.origin.lib");

                let binScript = (await INF.LIB.FS.readFileAsync(binPath, "utf8"));

                // We convert the installed packs into a lookup stack.
                const BASH_ORIGIN_LIB_BASE_PATHS = {};

                [
                    "default",
                    "minimal",
                    "full"
                ].forEach(function (pack) {

                    if (installedDescriptor.packs[`bash.origin.lib.${pack}`]) {

                        const streams = INF.LIB.LODASH.get(installedDescriptor, [
                            'packs',
                            `bash.origin.lib.${pack}`
                        ]);

                        // TODO: Sort 'streams' to keep largest minor one for each major version.

                        Object.keys(streams).forEach(function (stream) {

                            BASH_ORIGIN_LIB_BASE_PATHS[stream] = INF.LIB.LODASH.get(installedDescriptor, [
                                'packs',
                                `bash.origin.lib.${pack}`,
                                stream,
                                'dependencies'
                            ]);

                            let majorStream = stream.split(".");
                            majorStream.pop();
                            majorStream = majorStream.join(".");

                            BASH_ORIGIN_LIB_BASE_PATHS[majorStream] = INF.LIB.LODASH.get(installedDescriptor, [
                                'packs',
                                `bash.origin.lib.${pack}`,
                                stream,
                                'dependencies'
                            ]);
                        });
                    }
                });
                BASH_ORIGIN_LIB_BASE_PATHS['.'] = BASH_ORIGIN_LIB_BASE_PATHS['0'];

                if (INF.LIB.verbose) console.log("[bash.origin.lib][install.inf.js] BASH_ORIGIN_LIB_BASE_PATHS:", BASH_ORIGIN_LIB_BASE_PATHS);

                binScript = binScript.replace(
                    /(#<BASH_ORIGIN_LIB_BASE_PATHS>)([\s\S]*?)(#<\/BASH_ORIGIN_LIB_BASE_PATHS>)/m,
`$1
declare -A BASH_ORIGIN_LIB_BASE_PATHS
${Object.keys(BASH_ORIGIN_LIB_BASE_PATHS).map(function (stream) {
return `BASH_ORIGIN_LIB_BASE_PATHS[${stream}]=${BASH_ORIGIN_LIB_BASE_PATHS[stream]}`;
}).join("\n")}
$3`
                )

                if (INF.LIB.verbose) console.log("[bash.origin.lib][install.inf.js] binScript:", binScript);

                await INF.LIB.FS.removeAsync(binPath);
                await INF.LIB.FS.writeFileAsync(binPath, binScript, "utf8");
                await INF.LIB.FS.chmodAsync(binPath, 0775);

                return true;
            }
        }
    };
}
