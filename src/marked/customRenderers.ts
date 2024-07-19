import { Renderer } from 'marked';
import path from 'path';

const customRenderer = new Renderer();

const setupRenderers = (basePath: string): void => {
    customRenderer.link = ({ href, title, text }: any): string => {
        // Replace .md with .html in the href if it ends with .md
        if (href && href.endsWith('.md')) {
            href = href.replace('.md', '.html');
        }

        return `<a href="${path.join(basePath, href)}" ${title ? ` title="${title}"` : ''}>${text}</a>`;
    };

    // Render image at 100% width
    customRenderer.image = ({ href, title, text }: any): string => {
        return `<img src="${href}" alt="${text}"${title ? ` title="${title}"` : ''} style="width: 100%;" />`;
    };
}

export { customRenderer, setupRenderers };
