
exports.inf = async function (INF, ALIAS) {

    const NCU = require('npm-check-updates');
    const SEMVER = require('semver');
    const SIMPLE_GIT = require('simple-git');


    // @see https://github.com/steveukx/git-js
    const repository = SIMPLE_GIT(__dirname);
    INF.LIB.Promise.promisifyAll(repository);


    async function updatePackage (basePath) {

        const descriptorPath = INF.LIB.PATH.join(basePath, 'package.json');
        const descriptorBefore = await INF.LIB.FS.readJSONAsync(descriptorPath);

        // @see https://github.com/tjunnone/npm-check-updates
        await NCU.run({
            upgrade: true,
            packageFile: descriptorPath
        });

        const descriptorAfter = await INF.LIB.FS.readJSONAsync(descriptorPath);

        const segmentChanged = {
            "major": false,
            "minor": false,
            "patch": false,
            "prerelease": false
        };

        [
            'dependencies',
            'devDependencies'
        ].forEach(function (type) {
            if (!descriptorBefore[type]) {
                return;
            }
            Object.keys(descriptorBefore[type]).forEach(function (name) {
                if (descriptorBefore[type][name] === descriptorAfter[type][name]) {
                    // no change
                    return;
                }
                const beforeVersion = SEMVER.coerce(descriptorBefore[type][name]).version;
                const afterVersion = SEMVER.coerce(descriptorAfter[type][name]).version;

                console.log(`[bash.origin.lib] Package version selector '${name}' has changed from '${descriptorBefore[type][name]}' to '${descriptorAfter[type][name]}'`);
                
                if (SEMVER.major(beforeVersion) !== SEMVER.major(afterVersion)) {
                    segmentChanged.major = true;
                } else
                if (SEMVER.minor(beforeVersion) !== SEMVER.minor(afterVersion)) {
                    segmentChanged.minor = true;
                } else
                if (SEMVER.patch(beforeVersion) !== SEMVER.patch(afterVersion)) {
                    segmentChanged.patch = true;
                } else
                if (SEMVER.prerelease(beforeVersion) !== SEMVER.prerelease(afterVersion)) {
                    segmentChanged.prerelease = true;
                }
            });
        });

        let version = descriptorAfter.version;

        if (segmentChanged.major) {
            version = SEMVER.inc(version, "major");
        } else
        if (segmentChanged.minor) {
            version = SEMVER.inc(version, "minor");
        } else
        if (
            segmentChanged.patch ||
            segmentChanged.prerelease
        ) {
            version = SEMVER.inc(version, "patch");
        }

        if (version === descriptorAfter.version) {
            return;
        }

        console.log(`[bash.origin.lib] Declaring package version has been incremented from '${descriptorAfter.version}' to '${version}'`);

        descriptorAfter.version = version;

        await INF.LIB.FS.outputFileAsync(descriptorPath, JSON.stringify(descriptorAfter, null, 2) + "\n", "utf8");

        return version;
    }


    async function commitIfChanged (filepath, message) {

        await repository.addAsync(filepath);

        if ((await repository.statusAsync()).staged.indexOf(filepath) === -1) {
            return;
        }

        console.log(`[bash.origin.lib] Committing changes to '${filepath}'`);

        await repository.commitAsync(message);
    }


    return {
        invoke: async function (pointer, value) {

            if (pointer === "run()") {

                if (value.value === "update") {

                    if ((await repository.statusAsync()).staged.length) {
                        throw new Error("Cannot update as there are staged git changes! Remove staged changes first.");
                    }


                    console.log("[bash.origin.lib] Updating bash.origin.lib package ...");

                    const version = await updatePackage(__dirname);
                    await commitIfChanged("package.json", `Bumped 'bash.origin.lib' package version to '${version}'`);


                    console.log("[bash.origin.lib] Updating packs ...");

                    const packsPath = INF.LIB.PATH.join(__dirname, 'packs');
                    const packs = await INF.LIB.FS.readdirAsync(packsPath);

                    await INF.LIB.Promise.mapSeries(packs, async function (pack) {

                        console.log(`[bash.origin.lib] Updating packages for pack '${pack}' ...`);

                        const version = await updatePackage(INF.LIB.PATH.join(packsPath, pack));
                        await commitIfChanged(`packs/${pack}/package.json`, `Bumped '${pack}' pack version to '${version}'`);
                    });


                } else
                if (value.value === "release-preview") {



                }

                return true;
            }
        }
    };
}
