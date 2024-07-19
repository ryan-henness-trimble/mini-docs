# Getting Started

## Installation
```bash
npm install --save-dev @ryan-henness-trimble/mini-docs
```

## Usage

```bash
npx mini-docs --input <relativePath> --output <relativePath> --basePath <absolutePath>
```

### Options
| Option       | Alias | Description                              | Required | Default |
|--------------|-------|------------------------------------------|----------|---------|
| `--input`    | `-i`  | Relative path to the markdown directory. | Yes      | None    |
| `--output`   | `-o`  | Relative path to the output directory.   | Yes      | None    |
| `--basePath` | `-b`  | The hosted site's absolute base path.    | No       | "/"     |

### Example
```bash
npx mini-docs -i test/test-docs -o test/test-output -b /mini-docs
```

This example generates documentation from `test/test-docs` and places it in the `test/test-output` directory, with the hosted site's base path set to `/mini-docs`.

> **Note**: The `--output` path must be outside the `--input` path.


