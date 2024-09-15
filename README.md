# revert-auto-import

## What is this?

A CLI tool for identifying, extracting, and restoring TypeScript auto-imports in code.
Under development, only the identification function is implemented for the time being, and it cannot be used in production.

## Q/A

### Why revert auto-imports?

Auto-import is a great feature of TypeScript, but abuse of auto-imports can lead to difficult choices, and there may be accidentally introduced auto-imports in the project. In these cases, we may need to revert these auto-imports to manual imports.

### Why not use regular expressions?

The structure of TypeScript source code is too complex, and it is difficult to handle various edge cases using regular expressions. Using TypeScript AST can better handle these cases, and the code is easier to understand.