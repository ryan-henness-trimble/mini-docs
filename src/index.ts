const fs = require('fs-extra');
import path from 'path';
import { marked } from 'marked';
import ejs from 'ejs';

interface File {
    type: 'file';
    name: string;
    fullPath: string;
}

interface Directory {
    type: 'directory';
    name: string;
    fullPath: string;
    contents: Array<Directory | File>;
}

const MD_EXTENSION = '.md';
const HTML_EXTENSION = '.html';
const UTF_8 = 'utf-8';
const DOCUMENT_TEMPLATE_PATH = path.resolve(__dirname, 'templates/document.ejs');

const generateFileSystemStructure = (inputPath: string): Directory | File => {
    const stats = fs.statSync(inputPath);

    if (stats.isFile()) {
        return {
            type: 'file',
            name: path.basename(inputPath),
            fullPath: inputPath
        };
    }

    const directory: Directory = {
        type: 'directory',
        name: path.basename(inputPath),
        fullPath: inputPath,
        contents: []
    };

    const items = fs.readdirSync(inputPath);
    for (const item of items) {
        const itemPath = path.join(inputPath, item);
        directory.contents.push(generateFileSystemStructure(itemPath));
    }

    return directory;
}

const generatePages = async (item: Directory | File, outputPath: string, sidenavContents: Directory): Promise<void> => {
    if (item.type === 'file') {
        if (item.name.endsWith(MD_EXTENSION)) {
            const fileContent = await fs.readFile(item.fullPath, UTF_8);
            const htmlContent = await marked(fileContent);
            const renderedHtml = await ejs.renderFile(DOCUMENT_TEMPLATE_PATH, { content: htmlContent, title: item.name, sidenavContents: sidenavContents.contents });
            const outputFilePath = path.join(outputPath, item.name.replace(MD_EXTENSION, HTML_EXTENSION));
            await fs.writeFile(outputFilePath, renderedHtml);
        }
    } else if (item.type === 'directory') {
        const dirPath = path.join(outputPath, item.name);
        try {
            await fs.mkdir(dirPath, { recursive: true });
        } catch (err: any) {
            if (err.code !== 'EEXIST') throw err;
        }
        for (const content of item.contents) {
            await generatePages(content, dirPath, sidenavContents);
        }
    }
}

export { generateFileSystemStructure, generatePages };
