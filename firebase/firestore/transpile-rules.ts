// Converts the compiled rules to a format that can be imported into Firebase
// First run tsc in the folder using the special tsconfig
// Then run this script
// Can do this via npx ts-node -P ../../tsconfig.build-scripts.json transpile-rules.ts
//
// Any line in the source with OMIT is excluded
// Use namespaces in the source for each match path
// Precede each match path with a comment like // MATCH /a/b/c

/* eslint-disable max-len */
import { readFileSync, writeFileSync } from 'fs';

const inputFile = './lib/firebase/firestore/security-rules.js';
const outputFile = 'firestore.rules';
const content = readFileSync(inputFile, 'utf8');

let result = content
  .replace(
    /.get\((?<def>[^,]+).*(?=\{ return)\{ return [^.]+\.(?<path1>[^.;]+)\.(?<path2>[^.;]+)\.(?<path3>[^.;]+)\.(?<path4>[^.;]+); }\)/gm,
    `.get(["$<path1>", "$<path2>", "$<path3>", "$<path4>"], $<def>)`
  ) // Strongly-typed get with 4 path arguments
  .replace(
    /.get\((?<def>[^,]+).*(?=\{ return)\{ return [^.]+\.(?<path1>[^.;]+)\.(?<path2>[^.;]+)\.(?<path3>[^.;]+); }\)/gm,
    `.get(["$<path1>", "$<path2>", "$<path3>"], $<def>)`
  ) // Strongly-typed get with 3 path arguments
  .replace(
    /.get\((?<def>[^,]+).*(?=\{ return)\{ return [^.]+\.(?<path1>[^.;]+)\.(?<path2>[^.;]+); }\)/gm,
    `.get(["$<path1>", "$<path2>"], $<def>)`
  ) // Strongly-typed get with 2 path arguments
  .replace(
    /.get\((?<def>[^,]+).*(?=\{ return)\{ return [^.]+\.(?<path1>[^.;]+); }\)/gm,
    `.get("$<path1>", $<def>)`
  ) // Strongly-typed get with 1 path arguments
  .replace(
    /var (?<fname>(read)|(get)|(list)|(write)|(create)|(update)|(deleteIf)) = function (?<args>\([^)]*\)) {(\s|\n|\r)+return (?<body>(.|\n|\r)*?(?=};))};/gm,
    'allow $<fname>: if $<body>'
  )
  .replace(/allow deleteIf/gm, 'allow delete')
  .replace(
    /var (?<fname>\S+) = function (?<args>\([^)]*\)) (?<body>{(.|\n|\r)*?(?=};)});/gm,
    'function $<fname> $<args> $<body>'
  )
  .replace(/^\s*var (\S+);(\r|\n)\s*\(function.*$/gm, '') // namespace start
  .replace(/(?<space>^\s*})(?<moduleend>\)\(.*$)/gm, `$<space>`) //namespace end
  .replace(/\/\/ MATCH (?<path>\S*).*$/gm, `match $<path> {`) // match path comments
  .replace(/^"use.*/gm, '') // use strict
  .replace(/^\s*\/\* eslint.*/gm, '') // eslint
  .replace(/^\s*\/\/ eslint.*/gm, '')
  .replace(/var.*(?=require\(").*/gm, '') // require imports
  .replace(/===/gm, '==')
  .replace(/!==/gm, '!=')
  .replace(/(?<space>^\s*)var/gm, '$<space>let') // var to let
  .replace(/^Object.defineProperty.*/gm, '')
  .replace(/^\/\/# sourceMapping.*/gm, '')
  .replace(/^.*OMIT.*$/gm, '') // exclude any line with OMIT word in it
  .split(/(\r\n)|\n|\r/)
  .filter((i) => i !== undefined && i.trim().length > 0)
  .join('\n');

result = `rules_version = '2';
service cloud.firestore {
match /databases/{database}/documents {
${result}
}}`;

writeFileSync(outputFile, result);
