#!/usr/bin/env node

const { program } = require('commander');
const { generateFileSystemStructure, generatePages, generateIndexPage, copyStyles } = require('../index');
const { setupRenderers } = require('../marked/customRenderers');

program
    .version('1.0.0')
    .requiredOption('-i, --input <input>', 'Input directory')
    .requiredOption('-o, --output <output>', 'Output directory')
    .option('-b, --base-url-path <basePath>', 'base URL path for generated documentation', '/')
    .parse(process.argv);

const options = program.opts();

setupRenderers(options.baseUrlPath, console.log);
copyStyles(options.output).then(() => {
    const fileSystemStructure = generateFileSystemStructure(options.input, options.input, options.basePath);
    generateIndexPage(options.input, options.output, options.baseUrlPath, fileSystemStructure).then(() => {
        console.log(JSON.stringify(fileSystemStructure, null, 4));
        generatePages(fileSystemStructure, options.output, fileSystemStructure, options.baseUrlPath).then(() => {
            console.log('Site generated successfully!');
        });
    }).catch((err) => {
        console.error('Error generating site:', err);
    });
});

