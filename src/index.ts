import { customRenderer, setupRenderers } from './marked/customRenderers';
const fs = require('fs-extra');
import path from 'path';
import ejs from 'ejs';
import PathHelpers from './PathHelpers';
import { HTML_EXTENSION, MD_EXTENSION, MdDirectory, MdFile } from './models';
import { marked } from './marked/marked';

const UTF_8 = 'utf-8';
const DOCUMENT_TEMPLATE_PATH = path.resolve(__dirname, 'templates/document.ejs');
const STYLES_PATH = path.resolve(__dirname, 'templates/styles');

const copyStyles = async (outputPath: string): Promise<void> => {
    await fs.copy(STYLES_PATH, path.join(outputPath, 'styles'));
}

const generateFileSystemStructure = (inputDirPath: string, itemRelativePath: string): MdDirectory | MdFile => {
    const stats = fs.statSync(itemRelativePath);
    const fileName = path.basename(itemRelativePath);
    const name = convertKebabToWords(fileName).replace(MD_EXTENSION, '');

    const inputDirItemRelativePath = PathHelpers.resolveInputDirRelativePath(inputDirPath, itemRelativePath);

    if (stats.isFile()) {
        return buildMdFile(name, inputDirPath, inputDirItemRelativePath)
    }

    return buildMdDirectory(name, inputDirPath, inputDirItemRelativePath, itemRelativePath);
}

const generatePages = async (item: MdDirectory | MdFile, outputPath: string, sidenavContents: MdDirectory, basePath: string): Promise<void> => {
    if (item.type === 'file' && item.name !== 'Index') {
        if (item.absolutePath.endsWith(MD_EXTENSION)) {
            const fileContent = await fs.readFile(item.absolutePath, UTF_8);
            const htmlContent = marked.parse(fileContent, { renderer: customRenderer });
            const renderedHtml = await ejs.renderFile(DOCUMENT_TEMPLATE_PATH, {
                content: htmlContent,
                title: item.name,
                sidenavContents: sidenavContents.contents,
                basePath: basePath,
                PathHelpers: PathHelpers
            });

            const outputFilePath = path.join(outputPath, PathHelpers.getItemRelativePath(item).replace(MD_EXTENSION, HTML_EXTENSION));
            await fs.outputFile(outputFilePath, renderedHtml);
        }
    } else if (item.type === 'directory') {
        for (const content of item.contents) {
            await generatePages(content, outputPath, sidenavContents, basePath);
        }
    }
};

// TODO - Create a better index page pattern. This is just a placeholder.
const generateIndexPage = async (inputDirPath: string, outputPath: string, basePath: string, sidenavContents: MdDirectory | MdFile): Promise<void> => {
    if (sidenavContents.type === 'file') {
        return;
    }

    const indexFileExists = fs.existsSync(path.join(inputDirPath, 'index.md'));
    let renderedContent ;
    if (indexFileExists) {
        const indexFileContent = await fs.readFile(path.join(inputDirPath, 'index.md'), UTF_8);
        renderedContent = marked.parse(indexFileContent, { renderer: customRenderer });
    } else {
        renderedContent = '<h1>Documentation Index</h1><div>Mini Docs Documentation - View docs on the left</div>';
    }

    const renderedHtml = await ejs.renderFile(DOCUMENT_TEMPLATE_PATH, {
        title: 'Documentation Index',
        sidenavContents: sidenavContents.contents,
        content: renderedContent,
        basePath: basePath,
        PathHelpers: PathHelpers
    });
    const outputFilePath = path.join(outputPath, 'index.html');
    await fs.outputFile(outputFilePath, renderedHtml);
};

export { generateFileSystemStructure, generatePages, generateIndexPage, setupRenderers, copyStyles };

const convertKebabToWords = (kebab: string): string => {
    return kebab.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
}

const buildMdFile = (name: string, inputDirPath: string, inputDirItemRelativePath: string): MdFile => {
    return {
        type: 'file',
        name: name,
        inputDir: PathHelpers.resolveAbsolutePath(inputDirPath),
        absolutePath: PathHelpers.resolveAbsolutePath(inputDirPath, inputDirItemRelativePath)
    };
}

const buildMdDirectory = (name: string, inputDirPath: string, inputDirItemRelativePath: string, itemRelativePath: string): MdDirectory => {
    const directory: MdDirectory = {
        type: 'directory',
        name: name,
        inputDir: PathHelpers.resolveAbsolutePath(inputDirPath),
        absolutePath: PathHelpers.resolveAbsolutePath(inputDirPath, inputDirItemRelativePath),
        contents: []
    };

    const items = fs.readdirSync(itemRelativePath);
    for (const item of items) {
        const itemPath = path.join(itemRelativePath, item);
        directory.contents.push(generateFileSystemStructure(inputDirPath, itemPath));
    }

    return directory;
}
