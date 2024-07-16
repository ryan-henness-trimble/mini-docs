#!/usr/bin/env node

const { program } = require('commander');
const { generateFileSystemStructure, generatePages } = require('../index');

program
    .version('1.0.0')
    .requiredOption('-i, --input <input>', 'Input directory')
    .requiredOption('-o, --output <output>', 'Output directory')
    .parse(process.argv);

const options = program.opts();

const fileSystemStructure = generateFileSystemStructure(options.input, options.input);
generatePages(fileSystemStructure, options.output, fileSystemStructure).then(() => {
    console.log('Site generated successfully!');
    console.log(JSON.stringify(fileSystemStructure, null, 4));
}).catch((err) => {
    console.error('Error generating site:', err);
});
