import { readFileSync, readdirSync } from 'node:fs';

const enSlugs = readdirSync('src/content/projects/en').map(f => f.replace(/\.md$/, '')).sort();
const jaSlugs = readdirSync('src/content/projects/ja').map(f => f.replace(/\.md$/, '')).sort();
const svSlugs = readdirSync('src/content/projects/sv').map(f => f.replace(/\.md$/, '')).sort();

const slugMissing = []
  .concat(jaSlugs.filter(s => !enSlugs.includes(s)))
  .concat(enSlugs.filter(s => !jaSlugs.includes(s)))
  .concat(svSlugs.filter(s => !enSlugs.includes(s)))
  .concat(enSlugs.filter(s => !svSlugs.includes(s)));
if (slugMissing.length) throw new Error('slug parity missing: ' + [...new Set(slugMissing)].join(', '));

const featuredFromMd = (path) => {
  const m = /^featured:\s*(true|false)/m.exec(readFileSync(path, 'utf8'));
  return m && m[1] === 'true';
};

for (const slug of enSlugs) {
  const enF = featuredFromMd('src/content/projects/en/' + slug + '.md');
  const jaF = featuredFromMd('src/content/projects/ja/' + slug + '.md');
  const svF = featuredFromMd('src/content/projects/sv/' + slug + '.md');
  if (enF !== jaF || enF !== svF) {
    throw new Error('featured mismatch for "' + slug + '": en=' + enF + ' ja=' + jaF + ' sv=' + svF);
  }
}

console.log('OK slug parity: ' + enSlugs.length + ' projects per lang (en/ja/sv), all featured flags match');
