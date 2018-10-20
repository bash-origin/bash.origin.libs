
const PATH = require("path");
const FS = require("fs");


function findInstalledInfo (originalBasePath, basePath) {
    if (!basePath) {
        basePath = originalBasePath;
    }
    const info = {};

    let declaringPackagePath = PATH.join(basePath, "package.json");
    if (FS.existsSync(declaringPackagePath)) {
        info.declaringPackagePath = basePath;
    }

    let path = PATH.join(basePath, ".~_#_io.nodepack.inf_#_installed1.json");
    if (FS.existsSync(path)) {
        info.installedDescriptorPath = path;
        return info;
    }

    let newdir = PATH.dirname(basePath);
    if (newdir === basePath) {
        throw new Error(`[bash.origin.lib] Cannot find '.~_#_io.nodepack.inf_#_installed1.json' in parent tree of '${originalBasePath}'!`);
    }

    const subInfo = findInstalledInfo(originalBasePath, newdir);
    subInfo.declaringPackagePath = info.declaringPackagePath || subInfo.declaringPackagePath;
    return subInfo;
}


function ensureInterface (basePath, stream) {
    if (!basePath) {
        basePath = process.cwd();
    } else {
        basePath = PATH.resolve(basePath);
    }
    if (!ensureInterface._cache[basePath + ":" + stream]) {

        const installedInfo = findInstalledInfo(basePath);

        const installedDescriptor = JSON.parse(FS.readFileSync(installedInfo.installedDescriptorPath, "utf8"));
        const declaringDescriptor = JSON.parse(FS.readFileSync(PATH.join(installedInfo.declaringPackagePath, "package.json"), "utf8"));

        const packConfig = declaringDescriptor.config['bash.origin.lib'];
        const aspectStreams = installedDescriptor.packs[`bash.origin.lib.${packConfig.pack}`];

        let aspectCachePath = null;
        if (aspectStreams[stream || packConfig.stream]) {
            aspectCachePath = aspectStreams[stream || packConfig.stream].dependencies;
        } else {
            let majorStreams = {};
            Object.keys(aspectStreams).map(function (stream) {

                let majorStream = stream.split(".");
                majorStream.pop();
                majorStream = majorStream.join(".");

                majorStreams[majorStream] = stream;
            });
            if (majorStreams[stream || packConfig.stream]) {
                aspectCachePath = aspectStreams[majorStreams[stream || packConfig.stream]].dependencies;
            } else {
                // TODO: Dynamically determine latest major version.
                aspectCachePath = aspectStreams[majorStreams['0']].dependencies;
            }
        }

        if (!aspectCachePath) {
            throw new Error(`Could not find 'aspectCachePath' based on basePath '${basePath}' and stream '${stream}'!`);
        }

        function makeLIB (packageBasePath) {
            const code = [
                'LIB = {'
            ];
            var usedAliases = {};
            function addGetter (name, path) {
                if (usedAliases[name]) {
                    return;
                }
                usedAliases[name] = true;
                code.push([
                    '"_path_' + PATH.basename(path) + '": "' + path + '",',
                    'get ' + name + '() {',
                    '    delete this.' + name + ';',
                    '    return (this.' + name + ' = require("' + path + '"));',
                    '},'
                ].join("\n"));
            }
            var basePaths = [
                PATH.join(packageBasePath, "node_modules"),
                PATH.join(aspectCachePath, "node_modules"),
            ];
            basePaths.forEach(function (basePath) {
                if (!FS.existsSync(basePath)) {
                    return;
                }
                FS.readdirSync(basePath).map(function (filename) {
                    var name = filename.toUpperCase().replace(/[\.-]/g, "_");
                    if (!/^[A-Z0-9_]+$/.test(name)) {
                        return;
                    }
                    addGetter(name, PATH.join(basePath, filename));
                });
            });
            addGetter('PATH', 'path');
            addGetter('FS', 'fs');
            addGetter('URI', 'uri');
            addGetter('HTTP', 'http');
            addGetter('HTTPS', 'https');
            addGetter('CRYPTO', 'crypto');
            code.push('};');
            var LIB = null;
            eval(code.join("\n"));
            return LIB;
        }

        function makeAPI (packageBasePath) {

            var API = {

                get version () {
                    return JSON.parse(FS.readFileSync(PATH.join(aspectCachePath, "package.json"), "utf8")).version;
                },

                get nodeModulesPath () {
                    return PATH.join(aspectCachePath, "node_modules");
                },

                get nodeModulesPaths () {
                    return [
                        PATH.join(packageBasePath, "node_modules"),
                        PATH.join(aspectCachePath, "node_modules")
                    ];
                },

                get binPath () {
                    return PATH.join(aspectCachePath, "node_modules/.bin");
                },

                resolve: function (uri) {
                    return API.LIB.resolve(uri);
                },

                require: function (uri) {
                    return API.LIB.require(uri);
                },

                get LIB () {
                    delete this.LIB;
                    const LIB = (this.LIB = makeLIB(packageBasePath));
                    
                    LIB.resolve = function (uri) {
                        var uri_parts = uri.split("/");
                        if (!LIB["_path_" + uri_parts[0]]) {
                            throw new Error("Cannot resolve uri '" + uri + "'!");
                        }
                        return PATH.join(LIB["_path_" + uri_parts[0]], uri_parts.slice(1).join("/"));
                    };

                    LIB.require = function (uri) {
                        return require(LIB.resolve(uri));
                    };

                    return LIB;
                },

                forPackage: function (packageBasePath, stream) {
                    if (
                        !packageBasePath &&
                        !stream
                    ) {
                        return makeAPI(installedInfo.declaringPackagePath);
                    }
                    return ensureInterface(packageBasePath, stream).forPackage();
                }
            };
        
            return API;
        }
        
        ensureInterface._cache[basePath + ":" + stream] = makeAPI(installedInfo.declaringPackagePath);
    }
    return ensureInterface._cache[basePath + ":" + stream];
}
ensureInterface._cache = {};


module.exports = {

    get version () {
        return ensureInterface().version;
    },

    get nodeModulesPath () {
        return ensureInterface().nodeModulesPath;
    },

    get nodeModulesPaths () {
        return ensureInterface().nodeModulesPaths;
    },

    get binPath () {
        return ensureInterface().binPath;
    },

    resolve: function (uri) {
        return ensureInterface().resolve(uri);
    },

    require: function (uri) {
        return ensureInterface().require(uri);
    },

    get LIB () {
        return ensureInterface().LIB;
    },

    forPackage: function (packageBasePath, stream) {
        return ensureInterface(packageBasePath, stream).forPackage();
    }
};
