#!/usr/bin/env node
import fs from "node:fs";
import cac from "cac";
import { description, version } from "../package.json";
import { AutoImportParser } from "./parse";

const cli = cac();

cli.command("[...files]", description).action((files: string[]) => {
  const absoluteFiles = files.map((file) => fs.realpathSync(file));
  const parser = new AutoImportParser(absoluteFiles);
  parser.parse();
});

cli.help();

cli.version(version);

cli.parse();
