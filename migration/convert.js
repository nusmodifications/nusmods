const fs = require('fs');
const { promisify } = require('util');
const CLIEngine = require('eslint').CLIEngine;
const prettier = require('prettier');

const glob = require('glob');
const _ = require('lodash');

const afs = {
  readFile: promisify(fs.readFile),
  writeFile: promisify(fs.writeFile),
  rename: promisify(fs.rename),
  resolveConfig: promisify(prettier.resolveConfig),
};

const prettierConfig = {
  ...require('../.prettierrc.js'),
  parser: 'typescript',
};

async function convert(filePath) {
  let file = await afs.readFile(filePath, 'utf8');
  file = file
    // remove // @flow and // $FlowFixMe
    .replace(/^\s*\/\/\W+flow.*\n/gi, '')
    // <Props: {}> -> <Props>
    .replace(/<Props: {}>/g, '<Props>')
    // import React from 'react' -> import * as React from 'react'
    .replace(/import.+'react'.*/, "import * as React from 'react'")
    // extends Component -> extends React.Component
    .replace(/extends (PureComponent|Component)/g, 'extends React.$1')
    // ComponentType<*> -> React.ComponentType<*>
    .replace(/(?<!React\.)(ComponentType|SyntheticEvent)/g, 'React.$1')
    // Node to React.ReactNode
    .replace(/\bNode</g, 'React.ReactNode')
    // <Frament> -> <>
    .replace(/<.*Fragment/g, '<')
    // ContextRouter -> RouteComponentProps
    .replace(/ContextRouter\b/g, 'RouteComponentProps')
    // remove import type expressions
    .replace(/(\{ |, |import |  )type /g, '$1')
    // export type { -> export {
    .replace(/export type \{/g, 'export {')
    // [ModuleCode]: Config -> [moduleCode: string]: Config
    .replace(/\[([A-Z][\w<>]+)\]:/g, (match, p1) => {
      if (p1.toUpperCase() === p1) return match; // Ignore [CONSTANT]
      return `[${_.camelCase(p1)}: string]:`;
    })
    // [string]: Config -> [key: string]: Config
    .replace(/\[(?:string)\]:/g, (match, p1) => {
      return `[key: string]:`;
    })
    // {| |} -> { }
    .replace(/{\|/g, '{')
    .replace(/\|}/g, '}')
    // +ModuleCode -> readonly ModuleCode
    .replace(/ \+(\S+):/g, ' readonly $1:')
    // { ...Type } -> Type & {
    .replace(/\{\s+\.\.\.([A-Z][\w<>]+),?\n?/g, '$1 & {')
    // : (X) => Y -> (x: X) => Y
    .replace(/: \(([\w ,\?<>\[\]]+)\) =>/g, (match, p1) => {
      const sub = p1.split(', ');
      const typed = sub.map((p) => {
        let arg;
        if (p === 'string') {
          arg = 'str';
        } else {
          arg = _.camelCase(p);
        }
        return `${arg}: ${p}`;
      });
      return `: (${typed.join(', ')}) =>`;
    })
    // ?Faculty -> Faculty | null | undefined
    .replace(/( |\()\?([\w<>]+)/g, '$1$2 | null | undefined')
    // <*> -> <any>
    .replace(/(<|, )\*/g, '$1any')
    // (X: any) -> (X as any)
    .replace(/\(([\w\{\}: ,\n]+): any\)(?! =>|:| \{)/g, '($1 as any)')
    // <T : X> -> <T extends X>
    .replace(/<(\w+): ([\w\{\}: ,\n]+)>/g, '<$1 extends $2>')
    // $Keys<X> -> keyof X
    .replace(/\$Keys<(\w+)>/g, 'keyof $1')
    // $Values<X> -> X[keyof X]
    .replace(/\$Values<(\w+)>/g, '$1[keyof $1]')
    // $Readonly<X> -> Readonly<X>
    .replace(/\$Readonly<(\w+)>/g, 'Readonly<$1>')
    // $Exact<X> -> X
    .replace(/\$Exact<(\w+)>/g, '$1')
    // $Diff<X, Y> -> Pick<X, Exclude<keyof X, keyof Y>>
    .replace(/\$Diff<([\w<>]+), ([\w ,\?<>:\[\]\{\}]+)>/g, 'Pick<$1, Exclude<keyof $1, keyof $2>>');

  try {
    file = prettier.format(file, prettierConfig);
  } catch (e) {}
  // console.log(filePath);
  // console.log(file.slice(0));
  await afs.writeFile(filePath, file);
  // await afs.rename(filePath, filePath.replace('.js', '.ts'));
}

const cli = new CLIEngine({ fix: true });
const files = glob.sync('src/js/**/*.{ts,tsx}');
const fileChunks = _.chunk(files, 50).map(async (chunk) => {
  await Promise.all(chunk.map(convert));
  try {
    cli.executeOnFiles(chunk);
  } catch (e) {}
});

Promise.all(fileChunks).then(() => {
  console.log(`completed converting ${files.length} files`);
});
