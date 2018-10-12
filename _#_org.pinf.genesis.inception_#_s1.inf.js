
'use strict';

class Lib {

    constructor (INF, ALIAS) {
        const self = this;

        const ensure = [];
        self.packs = {};
        self.props = {};

        self.invoke = async function (pointer, value) {

            if (pointer === "ensure()") {
                
                INF.LIB.ASSERT(value.value.pack, "No 'ensure() : pack' property set!");
                INF.LIB.ASSERT(value.value.stream, "No 'ensure() : stream' property set!");

                ensure.push(value.value);
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

                return INF.LIB.Promise.map(ensure, async function (info) {

                    INF.LIB.ASSERT(self.props.cache, "No 'cache' property set!");

                    if (!self.packs[info.pack]) throw new Error(`Pack with name '${info.pack}' does not exist!`);

                    return INF.run(await self.packs[info.pack].toInstructions({
                        opts: {
                            cache: self.props.cache.toPath(),
                            stream: info.stream,
                            basePath: info.basePath
                        }
                    }));
                });
            } else
            if (pointer === "contract") {

                // TODO: Implement

            }
        };
    }

}

exports.inf = async function (INF, ALIAS) {
    const lib = new Lib(INF, ALIAS);
    return lib;
}
