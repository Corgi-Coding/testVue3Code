const args = require("minimist")(process.argv.slice(2));
const { build } = require("esbuild");
const { resolve } = require('path');

// minist 用来解析命令行参数的

const target = args._[0] || 'reactivity';
const format = args.f || 'global';

const pkg = require(resolve(__dirname, `../packages/${target}/package.json`))

const outputFormat = format.startsWith('global') ? 'iife' : format === 'cjs' ? 'cjs' : 'esm';

const outfile = resolve(__dirname, `../packages/${target}/dist/${target}.${format}.js`);

build({
    entryPoints: [resolve(__dirname, `../packages/${target}/src/index.ts`)],
    outfile,
    bundle: true,
    format: outputFormat,
    globalName: pkg.buildOptions?.name,
    platform: format === 'cjs' ? 'node' : 'browser',
    watch: {
        onRebuild(err) {
            if (!err) console.log('corgi-vue: rebuild');
        }
    }
}).then(() => {
    console.log('corgi-vue: watching');
})
