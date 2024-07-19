export interface MdFile {
    type: 'file';
    name: string;
    inputDir: string;
    absolutePath: string;
}

export interface MdDirectory {
    type: 'directory';
    name: string;
    inputDir: string;
    absolutePath: string;
    contents: Array<MdDirectory | MdFile>;
}

export const MD_EXTENSION = '.md';
export const HTML_EXTENSION = '.html';
