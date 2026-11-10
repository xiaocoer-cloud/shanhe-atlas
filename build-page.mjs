import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.dirname(fileURLToPath(import.meta.url));
const template = fs.readFileSync(path.join(ROOT, 'src/template.html'), 'utf8');
const style = fs.readFileSync(path.join(ROOT, 'src/style.css'), 'utf8');
const app = fs.readFileSync(path.join(ROOT, 'src/app.js'), 'utf8');
const data = JSON.parse(fs.readFileSync(path.join(ROOT, 'atlas-data.json'), 'utf8'));

const dataJs = JSON.stringify(data).replace(/</g, '\\u003c').replace(/\u2028/g, '\\u2028').replace(/\u2029/g, '\\u2029');

let html = template
  .replace('/*__STYLE__*/', () => style)
  .replace('/*__DATA__*/', () => dataJs)
  .replace('/*__APP__*/', () => app);

const notice = `<!--
  山河卷 · 中国历史疆域图
  Territory outlines adapted from 江山时序 / Chronicles of the Realm
  https://github.com/DeanChensj/jiangshan-map (GPL-3.0).
  Base map: Natural Earth (public domain).
  This page is released under GPL-3.0 for the adapted territory data.
-->`;
html = html.replace('<!doctype html>', '<!doctype html>\n' + notice);

fs.writeFileSync(path.join(ROOT, 'index.html'), html);
console.log('index.html', (Buffer.byteLength(html) / 1024 / 1024).toFixed(2) + ' MB');
