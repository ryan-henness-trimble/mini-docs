const fs = require('fs-extra');
import path from 'path';
import { marked, Renderer } from 'marked';
import ejs from 'ejs';

interface File {
    type: 'file';
    name: string;
    fileName: string;
    relativePath: string;
    fullPath: string;
}

interface Directory {
    type: 'directory';
    name: string;
    fileName: string;
    relativePath: string;
    fullPath: string;
    contents: Array<Directory | File>;
}

const MD_EXTENSION = '.md';
const HTML_EXTENSION = '.html';
const UTF_8 = 'utf-8';
const DOCUMENT_TEMPLATE_PATH = path.resolve(__dirname, 'templates/document.ejs');

const generateFileSystemStructure = (rootPath: string, inputPath: string): Directory | File => {
    const stats = fs.statSync(inputPath);
    const fileName = path.basename(inputPath);
    const name = convertKebabToWords(fileName);
    const relativePath = `/${path.relative(rootPath, inputPath).replace(/\\/g, '/')}`;

    if (stats.isFile()) {
        return {
            type: 'file',
            name: name,
            fileName: fileName,
            relativePath: relativePath,
            fullPath: inputPath
        };
    }

    const directory: Directory = {
        type: 'directory',
        name: name,
        fileName: fileName,
        relativePath: relativePath,
        fullPath: inputPath,
        contents: []
    };

    const items = fs.readdirSync(inputPath);
    for (const item of items) {
        const itemPath = path.join(inputPath, item);
        directory.contents.push(generateFileSystemStructure(rootPath, itemPath));
    }

    return directory;
}

const customRenderer = new Renderer();
customRenderer.link = ({ href, title, text }): string => {
    // Replace .md with .html in the href if it ends with .md
    if (href && href.endsWith('.md')) {
        href = href.replace('.md', '.html');
    }
    return `<a href="${href}"${title ? ` title="${title}"` : ''}>${text}</a>`;
};

const generatePages = async (item: Directory | File, outputPath: string, sidenavContents: Directory): Promise<void> => {
    if (item.type === 'file') {
        if (item.name.endsWith(MD_EXTENSION)) {
            const fileContent = await fs.readFile(item.fullPath, UTF_8);
            const htmlContent = marked(fileContent, { renderer: customRenderer });
            const renderedHtml = await ejs.renderFile(DOCUMENT_TEMPLATE_PATH, {
                content: htmlContent,
                title: item.name,
                sidenavContents: sidenavContents.contents
            });
            const outputFilePath = path.join(outputPath, item.fileName.replace(MD_EXTENSION, HTML_EXTENSION));
            await fs.writeFile(outputFilePath, renderedHtml);
        }
    } else if (item.type === 'directory') {
        const dirPath = path.join(outputPath, item.fileName);
        try {
            await fs.mkdir(dirPath, { recursive: true });
        } catch (err: any) {
            if (err.code !== 'EEXIST') throw err;
        }
        for (const content of item.contents) {
            await generatePages(content, dirPath, sidenavContents);
        }
    }
};

export { generateFileSystemStructure, generatePages };

const convertKebabToWords = (kebab: string): string => {
    return kebab.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
}
