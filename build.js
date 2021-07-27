import { rollup } from "rollup";
import { rollupConfig } from "./rollup.config.js";

import minimist from "minimist";
import esbuild from "rollup-plugin-esbuild";

// Support --scope and --ignore globs if passed in via commandline
const args = minimist(process.argv.slice(2));
const [{ input, output }] = await rollupConfig(args);

const esbuildOptions = {
    target: "es2021", // default, or 'es20XX', 'esnext'
    minify: Boolean("minify" in args),
};

async function build() {
    console.time("Bundled in");

    // create a bundle
    const bundle = await rollup({ input, plugins: [esbuild(esbuildOptions)] });

    // or write the bundle to disk
    for (let outputOption of output) {
        await bundle.write(outputOption);
    }

    // closes the bundle
    await bundle.close();

    console.timeEnd("Bundled in");
}

build();
