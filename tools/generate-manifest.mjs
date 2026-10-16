#!/usr/bin/env node
import { readdirSync, statSync, writeFileSync, existsSync } from 'node:fs';
import { join, relative } from 'node:path';

const ROOT = process.cwd();
const PAPERS_DIR = join(ROOT, 'papers');
const PERIODS = {
  'first-cert': { name: 'First Certification Period', when: 'May / June 2027' },
  'revision':   { name: 'Targeted Revision Period',   when: 'September 2027' },
  'final':      { name: 'Final Certification Period', when: 'Oct / Nov 2027' },
  'resources':  { name: 'Study Resources',            when: '2027' }
};
const SUBJECT_NAMES = {
  'mathematics': 'Mathematics', 'web-foundations': 'Web Foundations',
  'programming-fundamentals': 'Programming Fundamentals',
  'full-stack-systems': 'Full Stack Systems', 'frontend-systems': 'Frontend Systems',
  'backend-systems': 'Backend Systems', 'visual-systems': 'Visual Systems',
  'experience-design': 'Experience Design', 'physical-sciences': 'Physical Sciences',
  'stream-subject': 'Stream Subject', 'electives': 'Electives',
  'admission-guide': 'Admission Examination Guide',
  'mathematics-prep': 'Mathematics Preparation',
  'logic-reasoning': 'Logic & Reasoning Practice',
  'reading-comprehension': 'Reading & Comprehension',
  'sample-admission': 'Sample Admission Paper',
  'exam-day': 'Exam Day Instructions'
};
function walk(dir) {
  const out = [];
  if (!existsSync(dir)) return out;
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) out.push(...walk(full));
    else if (entry.endsWith('.html')) out.push(full);
  }
  return out;
}
function parse(full) {
  const rel = relative(PAPERS_DIR, full).replace(/\\/g, '/');
  const parts = rel.split('/');
  if (parts.length < 2) return null;
  const folder = parts[0];
  const file = parts[parts.length - 1];
  const m = file.match(/^([a-z0-9-]+?)-(\d+)(-memo)?\.html$/);
  if (!m) return null;
  const slug = m[1];
  const memo = !!m[3];
  const subject = SUBJECT_NAMES[slug] || slug.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
  return { folder, subject, file: rel, type: memo ? 'memo' : 'question' };
}
function build() {
  const files = walk(PAPERS_DIR).map(parse).filter(Boolean);
  const periods = {};
  const resources = [];
  for (const f of files) {
    if (f.folder === 'resources') { resources.push({ title: f.subject, file: f.file }); continue; }
    if (!periods[f.folder]) periods[f.folder] = { id: f.folder, ...(PERIODS[f.folder] || { name: f.folder, when: '' }), papers: [] };
    periods[f.folder].papers.push({ subject: f.subject, file: f.file, type: f.type });
  }
  const manifest = {
    generated: new Date().toISOString(),
    periods: Object.values(periods).map(p => ({
      ...p,
      papers: p.papers.sort((a, b) => a.subject.localeCompare(b.subject) || a.type.localeCompare(b.type))
    })),
    resources
  };
  writeFileSync(join(PAPERS_DIR, 'manifest.json'), JSON.stringify(manifest, null, 2));
  console.log(`Manifest: ${manifest.periods.length} periods, ${manifest.resources.length} resources.`);
}
build();