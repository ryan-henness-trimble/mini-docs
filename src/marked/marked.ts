import { Marked } from 'marked';
import { markedHighlight } from 'marked-highlight';
const Prism = require('prismjs');

// Load necessary Prism languages
require('prismjs/components/prism-css');
require('prismjs/components/prism-json');
require('prismjs/components/prism-javascript');
require('prismjs/components/prism-typescript');
require('prismjs/components/prism-csharp');
require('prismjs/components/prism-jsx');
require('prismjs/components/prism-tsx');

const marked = new Marked(
    markedHighlight({
        highlight: function(code: any, lang: any) {
            const language = Prism.languages[lang] || Prism.languages.markup;
            return Prism.highlight(code, language, lang);
        }
    })
);

export { marked };
