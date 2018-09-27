
'use strict';

class Lib {

    constructor (INF, ALIAS) {
        const self = this;

        self.packs = {};
        self.props = {};
        self.mappings = {};

        self.invoke = async function (pointer, value) {

            if (/^map /.test(pointer)) {
                self.mappings[pointer.substring(4)] = value;
                return true;
            } else
            if (/^\.\[\]pack /.test(pointer)) {
                self.packs[pointer.substring(8)] = value;
                return true;
            } else
            if (/^\./.test(pointer)) {
                self.props[pointer.substring(1)] = value;
                return true;
            } else
            if (pointer === "expand") {

                return INF.LIB.Promise.map(Object.keys(self.mappings), async function (name) {

                    INF.LIB.ASSERT(self.props.cache, "No 'cache' property set!");

                    const cachePath = self.props.cache.toPath();
                    const targetPath = self.mappings[name].toPath();

                    if (!self.packs[name]) throw new Error(`Pack with name '${name}' does not exist!`);

                    return INF.run(await self.packs[name].toInstructions({
                        cache: cachePath,
                        basePath: targetPath
                    }));
                });
            } else
            if (pointer === "contract") {

                return INF.LIB.Promise.map(Object.keys(self.mappings), async function (name) {

                    INF.LIB.ASSERT(self.props.cache, "No 'cache' property set!");

                    const cachePath = self.props.cache.toPath();
                    const targetPath = self.mappings[name].toPath();

                    if (!self.packs[name]) throw new Error(`Pack with name '${name}' does not exist!`);

                    return INF.run(await self.packs[name].toInstructions({
                        cache: cachePath,
                        basePath: targetPath
                    }));
                });
            }
        };
    }

}

exports.inf = async function (INF, ALIAS) {
    const lib = new Lib(INF, ALIAS);
    return lib;
}
