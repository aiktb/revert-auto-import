import {
  sys,
  type Node,
  type Program,
  SyntaxKind,
  type TypeChecker,
  createProgram,
  forEachChild,
  isIdentifier,
  parseJsonConfigFileContent,
  readConfigFile,
} from "typescript";

import consola from "consola";

export class AutoImportParser {
  #autoImportedDeclarationFiles: string[];
  #checker: TypeChecker;
  #program: Program;
  // import {imported as local } from 'literal'
  // local: typeof import('literal')['imported']
  #autoImportedDeclarationTextRegex =
    /(?<local>\w+): typeof import\('(?<literal>\w+)'\)\['(?<imported>\w+)'\]/;
  constructor(autoImportedDeclarationFiles: string[]) {
    this.#autoImportedDeclarationFiles = autoImportedDeclarationFiles;

    const config = readConfigFile("tsconfig.json", sys.readFile).config;
    const parsedCommandLine = parseJsonConfigFileContent(config, sys, "./");
    const rootNames = parsedCommandLine.fileNames;
    const options = parsedCommandLine.options;
    this.#program = createProgram(rootNames, options);
    this.#checker = this.#program.getTypeChecker();
  }

  parse() {
    for (const sourceFile of this.#program.getSourceFiles()) {
      if (!sourceFile.isDeclarationFile) {
        this.#delintNode(sourceFile);
      }
    }
  }

  #delintNode = (node: Node) => {
    const autoImportedIdentifierDeclaration = this.#getAutoImportedIdentifierDeclaration(node);
    if (autoImportedIdentifierDeclaration) {
      consola.log(autoImportedIdentifierDeclaration);
    }

    forEachChild(node, this.#delintNode);
  };

  #getAutoImportedIdentifierDeclaration = (node: Node) => {
    if (!isIdentifier(node)) {
      return false;
    }

    if (
      node.parent &&
      [SyntaxKind.PropertyAccessExpression, SyntaxKind.QualifiedName].includes(node.parent.kind) &&
      node.parent.getChildAt(0) !== node
    ) {
      return false;
    }

    const symbol = this.#checker.getSymbolAtLocation(node);
    if (!symbol) {
      return false;
    }

    const declarations = symbol.getDeclarations();

    if (!declarations) {
      return false;
    }

    for (const declaration of declarations) {
      if (this.#autoImportedDeclarationFiles.includes(declaration.getSourceFile().fileName)) {
        const groups = declaration.getText().match(this.#autoImportedDeclarationTextRegex)?.groups;
        const { local, literal, imported } = groups ?? {};
        if (!(local && literal && imported)) {
          return false;
        }
        return { local, literal, imported };
      }
    }

    return false;
  };
}
