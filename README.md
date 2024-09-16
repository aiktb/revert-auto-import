# revert-auto-import

## What is this?

A CLI tool for identifying, extracting, and restoring TypeScript auto-imports in code.
Under development, only the identification function is implemented for the time being, and it cannot be used in production.

Not very useful, if your project is well maintained, just remove the unnecessary auto-imports in the type file and run `tsc --noEmit`, modify the source code according to the errors that appear.

The purpose is just to get familiar with the structure of TypeScript AST.

Will not maintain.