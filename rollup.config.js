import { realpathSync } from "fs";
import { getPackages } from "@lerna/project";
import { filterPackages } from "@lerna/filter-packages";
import batchPackages from "@lerna/batch-packages";

import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * @param {string}[scope] - packages to only build (if you don't
 *    want to build everything)
 * @param {string}[ignore] - packages to not build
 *
 * @returns {string[]} - sorted list of Package objects that
 *    represent packages to be built.
 */
export const getSortedPackages = async (scope = [], ignore = []) => {
    const projectDirectory = realpathSync(process.cwd());
    const packages = await getPackages(projectDirectory);

    const singlePackage = packages.find(
        (pkg) => pkg.location === projectDirectory
    );
    
    if (singlePackage) return [singlePackage];

    const filtered = filterPackages(packages, scope, ignore, true, false);
    return batchPackages(filtered).reduce(
        (arr, batch) => arr.concat(batch),
        []
    );
};

export const rollupConfig = async ({ scope, ignore } = {}) => {
    /**
     * @type {import('rollup').RollupOptions}
     */
    const config = [];
    const packages = await getSortedPackages(scope, ignore);

    packages.forEach((pkg) => {
        /* Absolute path to package directory */
        const basePath = path.relative(__dirname, pkg.location);

        /* Absolute path to input file */
        const input = path.join(basePath, "src/index.ts");

        /* "main" & "modules" field from package.json file. */
        const { main, modules } = pkg.toJSON();

        /* Push build config for this package. */
        config.push({
            input,
            output: [
                {
                    file: path.join(basePath, modules),
                    format: "es",
                },
                {
                    file: path.join(basePath, main),
                    format: "cjs",
                },
            ],
        });
    });

    return config;
};

export default rollupConfig(); // @returns Promise<RollupConfig>
