import { HTML_EXTENSION, MD_EXTENSION, MdDirectory, MdFile } from './models';

const path = require('path');
const fs = require('fs');

class PathHelpers {
    static resolveInputDirRelativePath(rootPath: string, inputPath: string) {
        const normalizedRootPath = PathHelpers.normalizePath(rootPath);
        const normalizedInputPath = PathHelpers.normalizePath(inputPath);

        let relativePath = normalizedInputPath;
        if (relativePath.startsWith(normalizedRootPath)) {
            relativePath = relativePath.slice(normalizedRootPath.length);
            if (relativePath.startsWith('/')) {
                relativePath = relativePath.slice(1);
            }
        }

        return relativePath;
    }

    static resolveRelativePath(p: string) {
        return path.resolve(process.cwd(), p);
    }

    static resolveAbsolutePath(...paths: string[]) {
        return PathHelpers.normalizePath(path.resolve(process.cwd(), ...paths));
    }

    static ensurePathExists(p: string) {
        if (!fs.existsSync(p)) {
            throw new Error(`Path ${p} does not exist. Please provide a valid path.`);
        }
        return p;
    }

    static normalizeBasePath(basePath: string) {
        return basePath.endsWith('/') ? basePath.slice(0, -1) : basePath;
    }

    static normalizePath(p: string) {
        return p.replace(/\\/g, '/');
    }

    static getItemRelativePath(item: MdFile | MdDirectory) {
        return item.absolutePath.slice(item.inputDir.length + 1);
    }

    static getItemHostedPath(item: MdFile | MdDirectory, basePath: string) {
        const path = basePath === "/" ? `${basePath}${PathHelpers.getItemRelativePath(item)}` : `${basePath}/${PathHelpers.getItemRelativePath(item)}`;
        return path.replace(MD_EXTENSION, HTML_EXTENSION);
    }
}

export default PathHelpers;
