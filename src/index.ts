const fs = require('fs-extra');
import path from 'path';
const { Marked, Renderer } = require('marked');
const { markedHighlight } = require('marked-highlight');
const Prism = require('prismjs');
import ejs from 'ejs';

// Load necessary Prism languages
require('prismjs/components/prism-javascript');
require('prismjs/components/prism-css');
require('prismjs/components/prism-python');

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
    const name = convertKebabToWords(fileName).replace(MD_EXTENSION, '');
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
customRenderer.link = ({ href, title, text }: any): string => {
    // Replace .md with .html in the href if it ends with .md
    if (href && href.endsWith('.md')) {
        href = href.replace('.md', '.html');
    }
    return `<a href="${href}"${title ? ` title="${title}"` : ''}>${text}</a>`;
};

// Render image at 100% width
customRenderer.image = ({ href, title, text }: any): string => {
    return `<img src="${href}" alt="${text}"${title ? ` title="${title}"` : ''} style="width: 100%;" />`;
};

const marked = new Marked(
    markedHighlight({
        highlight: function(code: any, lang: any) {
            const language = Prism.languages[lang] || Prism.languages.markup;
            return Prism.highlight(code, language, lang);
        }
    })
);

const generatePages = async (item: Directory | File, outputPath: string, sidenavContents: Directory): Promise<void> => {
    if (item.type === 'file') {
        if (item.relativePath.endsWith(MD_EXTENSION)) {
            const fileContent = await fs.readFile(item.fullPath, UTF_8);
            const htmlContent = marked.parse(fileContent, { renderer: customRenderer });
            const renderedHtml = await ejs.renderFile(DOCUMENT_TEMPLATE_PATH, {
                content: htmlContent,
                title: item.name,
                sidenavContents: sidenavContents.contents
            });
            const outputFilePath = path.join(outputPath, item.relativePath.replace(MD_EXTENSION, HTML_EXTENSION));
            await fs.outputFile(outputFilePath, renderedHtml);
        }
    } else if (item.type === 'directory') {
        for (const content of item.contents) {
            await generatePages(content, outputPath, sidenavContents);
        }
    }
};

export { generateFileSystemStructure, generatePages };

const convertKebabToWords = (kebab: string): string => {
    return kebab.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
}