import {
  sys,
  type Node,
  SyntaxKind,
  type TypeChecker,
  createProgram,
  forEachChild,
  isIdentifier,
  parseJsonConfigFileContent,
  readConfigFile,
} from "typescript";

import consola from "consola";

const config = readConfigFile("tsconfig.json", sys.readFile).config;
const parsedCommandLine = parseJsonConfigFileContent(config, sys, "./");
const rootNames = parsedCommandLine.fileNames;
const options = parsedCommandLine.options;
const program = createProgram(rootNames, options);

const checker = program.getTypeChecker();
for (const sourceFile of program.getSourceFiles()) {
  if(!sourceFile.isDeclarationFile) {
    delintNode(sourceFile);
  }
}

function delintNode(node: Node) {
  if (
    isAutoImportedIdentifier(node, checker)
  ) {
    consola.log(
      `Found auto-imported identifier: ${node.getText()}, at ${node.getSourceFile().fileName}:${node.getStart()}`,
    );
    consola.log(
      `Declaring file: ${checker.getSymbolAtLocation(node)?.getDeclarations()?.[0].getSourceFile().fileName}`,
    );

    for (const declaration of checker.getSymbolAtLocation(node)!.getDeclarations()!) {
      consola.log(`Declaration: ${declaration.kind}`);
    }
  }

  forEachChild(node, delintNode);
}
function isAutoImportedIdentifier(node: Node, checker: TypeChecker) {
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

  const symbol = checker.getSymbolAtLocation(node);
  if (!symbol) {
    return false;
  }

  const declarations = symbol.getDeclarations();

  if (!declarations) {
    return false;
  }

  return declarations.some((declaration) => {
    if (
      declaration.getSourceFile().fileName.includes("node_modules") ||
      node.getSourceFile() === declaration.getSourceFile()
    ) {
      return false;
    }
    return true;
  });
}
