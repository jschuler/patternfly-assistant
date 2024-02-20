/*
To be run against https://github.com/patternfly/patternfly-react repo
to concatenate PatternFly examples into a single markdown file
*/

// ES6 version using asynchronous iterators, compatible with node v10.0+

const fs = require('fs');
const path = require('path');

async function* walk(dir) {
  for await (const d of await fs.promises.opendir(dir)) {
    const entry = path.join(dir, d.name);
    if (d.isDirectory()) yield* walk(entry);
    else if (
      d.isFile() &&
      entry.includes('/examples/') &&
      (entry.includes('/react-core/') || entry.includes('/react-charts/') || entry.includes('/react-table/')) &&
      !entry.includes('/deprecated/') &&
      !entry.includes('/demos/') &&
      !entry.includes('/next/') &&
      (entry.endsWith('.tsx') || entry.endsWith('.md'))
    )
      yield entry;
  }
}

// Then, use it with a simple async for loop
async function main() {
  const path = './packages';
  for await (const p of walk(path)) {
    console.log(p);
    const language = p.endsWith('.tsx') ? 'jsx' : 'md';
    const fileContents = `# ${p}
\`\`\`${language}
${fs.readFileSync(p).toString()}
\`\`\`

`;
    fs.appendFileSync('./combined-examples.md', fileContents);
  }
}

main();
