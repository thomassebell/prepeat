#!/usr/bin/env node
// Renders docs/backlog.md's OPEN items as a scannable page.
//
// Generated, never hand-edited: backlog.md is the single source of truth, so
// this cannot drift from it. Re-run it after editing the backlog.
//
//   npm run backlog:view
//
// It reads the format the backlog header defines: the first line of an item is
// the job, and the indented `Label: …` lines under it are the detail. Anything
// after a blank line inside an item is prose kept for the record, and is shown
// collapsed.

import { readFile, writeFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const SRC = join(root, 'docs/backlog.md')
const OUT = join(root, 'docs/backlog-view.html')

// Sections that are records rather than work, so they never carry open items
// worth scanning. Kept as a list rather than a guess about the heading text.
const SKIP_SECTIONS = new Set(['Decisions log (recent)'])

const raw = await readFile(SRC, 'utf8')
const lines = raw.split('\n')

const sections = []
let section = null
let sub = null
let item = null

const pushItem = () => {
  if (item) section.items.push(item)
  item = null
}

for (const line of lines) {
  const h2 = /^## (.+)/.exec(line)
  if (h2) {
    pushItem()
    section = { title: h2[1].trim(), items: [] }
    sub = null
    if (!SKIP_SECTIONS.has(section.title)) sections.push(section)
    continue
  }
  if (!section) continue

  const h3 = /^### (.+)/.exec(line)
  if (h3) {
    pushItem()
    sub = h3[1].trim()
    continue
  }

  // An open item. Numbered research questions ("- [ ] 1. **…**") count too.
  const open = /^- \[ \] (.*)$/.exec(line)
  if (open) {
    pushItem()
    let title = open[1]
    let refs = []
    // Report numbers, e.g. `2.10`, sit in front of the title.
    title = title.replace(/^((?:`[\d.]+`\s*)+)/, (_, m) => {
      refs = m.match(/[\d.]+/g) ?? []
      return ''
    })
    title = title.replace(/^\d+\.\s*/, '')
    item = { title: title.trim(), refs, section: sub, details: [], notes: [] }
    continue
  }

  // A new checked item, a new top-level bullet, or a heading ends the item.
  if (item && /^(- |\s*- \[x\])/.test(line) && !/^\s{6,}/.test(line)) {
    pushItem()
    continue
  }

  if (!item) continue

  // Labels only count before the item's prose starts. Body text sometimes
  // opens a line with "Capped today:" and that is not a label.
  const label = item.notes.length
    ? null
    : /^ {6}([A-Z][A-Za-z ]{1,14}):\s*(.*)$/.exec(line)
  if (label) {
    item.details.push({ label: label[1], text: label[2] })
    continue
  }
  // A continuation of the previous label, indented further.
  if (item.details.length && /^\s{8,}\S/.test(line) && !item.notes.length) {
    item.details[item.details.length - 1].text += ' ' + line.trim()
    continue
  }
  if (line.trim()) item.notes.push(line.trim())
}
pushItem()

// Strip the backlog's own how-to-write section – it is guidance, not work.
const live = sections.filter((s) => !s.title.startsWith('⚠️ HOW TO WRITE'))

const esc = (s) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

// The backlog is written in markdown; render just enough of it to read.
const md = (s) =>
  esc(s)
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/\*([^*]+)\*/g, '<em>$1</em>')
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '$1')

const total = live.reduce((n, s) => n + s.items.length, 0)

// Anything parked on a Thomas decision is pulled to the top. Work waiting on
// him is invisible otherwise: it reads as in-progress when nothing is moving.
// This is the state the ingredient-sections item sat in for four days.
const waiting = live.flatMap((s) =>
  s.items
    .filter((it) => it.details.some((d) => d.label === 'Needs'))
    .map((it) => ({ ...it, from: s.title }))
)

const itemHtml = (it) => {
  const flag = /^(⚠️|⭐|🌙|⏳)/.exec(it.title)
  const title = md(it.title.replace(/^(⚠️|⭐|🌙|⏳)\s*/, ''))
  return `
    <article class="item${flag ? ' flagged' : ''}">
      <h3>
        ${flag ? `<span class="flag">${flag[1]}</span>` : ''}
        ${it.refs.map((r) => `<span class="ref">${esc(r)}</span>`).join('')}
        <span>${title}</span>
      </h3>
      ${
        it.details.length
          ? `<dl>${it.details
              .map(
                (d) =>
                  `<dt>${esc(d.label)}</dt><dd>${md(d.text)}</dd>`
              )
              .join('')}</dl>`
          : ''
      }
      ${
        it.notes.length
          ? `<details><summary>Full note</summary><p>${it.notes
              .map(md)
              .join(' ')}</p></details>`
          : ''
      }
    </article>`
}

const sectionHtml = (s) => {
  const groups = []
  for (const it of s.items) {
    const key = it.section ?? ''
    const last = groups[groups.length - 1]
    if (last && last.key === key) last.items.push(it)
    else groups.push({ key, items: [it] })
  }
  return `
    <section>
      <h2>${md(s.title)} <span class="count" data-total="${s.items.length}">${s.items.length}</span></h2>
      ${groups
        .map(
          (g) =>
            (g.key ? `<h4>${md(g.key)}</h4>` : '') +
            g.items.map(itemHtml).join('')
        )
        .join('')}
    </section>`
}

const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Prep+Eat – open backlog</title>
<style>
  :root {
    --bg: #f8f7f7; --card: #fff; --ink: #4f4230; --subtle: #7a6f60;
    --line: #e7e3dd; --brand: #378112; --flag: #b4531a;
  }
  @media (prefers-color-scheme: dark) {
    :root {
      --bg: #1c1a17; --card: #262320; --ink: #ece7df; --subtle: #a99e8e;
      --line: #383430; --brand: #83e651; --flag: #e59b5f;
    }
  }
  * { box-sizing: border-box; }
  body {
    margin: 0; padding: 2rem 1.25rem 5rem; background: var(--bg); color: var(--ink);
    font: 16px/1.55 -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  }
  main { max-width: 46rem; margin: 0 auto; }
  header { margin-bottom: 2rem; }
  h1 { font-size: 1.5rem; margin: 0 0 .25rem; }
  .meta { color: var(--subtle); font-size: .875rem; margin: 0; }
  .filter {
    position: sticky; top: 0; z-index: 2; padding: .75rem 0; margin-bottom: 1rem;
    background: var(--bg);
  }
  .filter input {
    width: 100%; padding: .6rem .8rem; font: inherit; color: inherit;
    background: var(--card); border: 1px solid var(--line); border-radius: .5rem;
  }
  section { margin: 0 0 2.5rem; }
  h2 {
    font-size: .8rem; text-transform: uppercase; letter-spacing: .07em;
    color: var(--subtle); margin: 0 0 .75rem; font-weight: 600;
  }
  .count {
    display: inline-block; margin-left: .35rem; padding: 0 .4rem;
    border-radius: 1rem; background: var(--line); color: var(--subtle);
    font-size: .75rem; letter-spacing: 0;
  }
  h4 {
    font-size: .8rem; font-weight: 600; color: var(--subtle);
    margin: 1.25rem 0 .5rem;
  }
  .item {
    background: var(--card); border: 1px solid var(--line); border-radius: .6rem;
    padding: .85rem 1rem; margin-bottom: .6rem;
  }
  .item.flagged { border-left: 3px solid var(--flag); }
  .item h3 {
    font-size: 1rem; margin: 0; font-weight: 600; line-height: 1.4;
  }
  .flag { margin-right: .3rem; }
  .ref {
    display: inline-block; margin-right: .35rem; padding: 0 .35rem;
    border-radius: .25rem; background: var(--brand); color: var(--bg);
    font-size: .75rem; font-weight: 700; vertical-align: 2px;
  }
  dl { margin: .6rem 0 0; display: grid; grid-template-columns: auto 1fr; gap: .15rem .6rem; }
  dt { color: var(--subtle); font-size: .8125rem; font-weight: 600; white-space: nowrap; }
  dd { margin: 0; font-size: .8125rem; color: var(--subtle); }
  details { margin-top: .6rem; font-size: .8125rem; color: var(--subtle); }
  summary { cursor: pointer; color: var(--brand); }
  details p { margin: .5rem 0 0; }
  code { font-size: .85em; background: var(--line); padding: 0 .25em; border-radius: .2em; }
  .waiting { border: 1px solid var(--brand); border-radius: .7rem; padding: 1rem 1rem .4rem; margin-bottom: 2.5rem; }
  .waiting h2 { color: var(--brand); }
  .lede { margin: -.25rem 0 .9rem; font-size: .8125rem; color: var(--subtle); }
  .waiting .item { border-color: var(--line); }
  .from { margin: .5rem 0 0; font-size: .75rem; color: var(--subtle); text-transform: uppercase; letter-spacing: .05em; }
  .hidden { display: none; }
</style>
</head>
<body>
<main>
  <header>
    <h1>Prep+Eat – open backlog</h1>
    <p class="meta">${total} open items, generated from docs/backlog.md. Read-only – edit the backlog, then re-run <code>npm run backlog:view</code>.</p>
  </header>
  <div class="filter"><input id="q" type="search" placeholder="Filter tasks…" autocomplete="off"></div>
  ${
    waiting.length
      ? `<section class="waiting">
      <h2>Waiting on you <span class="count" data-total="${waiting.length}">${waiting.length}</span></h2>
      <p class="lede">Nothing moves on these until you decide or draw something. Everything else is mine.</p>
      ${waiting
        .map(
          (it) => `<article class="item">
        <h3>${it.refs.map((r) => `<span class="ref">${esc(r)}</span>`).join('')}<span>${md(
            it.title.replace(/^(⚠️|⭐|🌙|⏳)\s*/, '')
          )}</span></h3>
        <dl><dt>Needs</dt><dd>${md(
          it.details.find((d) => d.label === 'Needs').text
        )}</dd></dl>
        <p class="from">${md(it.from)}</p>
      </article>`
        )
        .join('')}
    </section>`
      : ''
  }
  <div id="list">${live.filter((s) => s.items.length).map(sectionHtml).join('')}</div>
</main>
<script>
  const q = document.getElementById('q')
  q.addEventListener('input', () => {
    const term = q.value.trim().toLowerCase()
    for (const section of document.querySelectorAll('section')) {
      let shown = 0
      for (const item of section.querySelectorAll('.item')) {
        const hit = !term || item.textContent.toLowerCase().includes(term)
        item.classList.toggle('hidden', !hit)
        if (hit) shown++
      }
      section.classList.toggle('hidden', shown === 0)
      // The count has to follow the filter, or it claims items that are hidden.
      const count = section.querySelector('.count')
      count.textContent = term ? shown + ' of ' + count.dataset.total : count.dataset.total
    }
  })
</script>
</body>
</html>
`

await writeFile(OUT, html)
console.log(`Wrote ${OUT} – ${total} open items across ${live.filter((s) => s.items.length).length} sections.`)
