const fs = require('fs');
const path = require('path');

function walk(dir, filterExts) {
  const results = [];
  const stack = [dir];
  while (stack.length) {
    const current = stack.pop();
    let entries = [];
    try {
      entries = fs.readdirSync(current, { withFileTypes: true });
    } catch {
      continue;
    }
    for (const entry of entries) {
      const full = path.join(current, entry.name);
      if (entry.isDirectory()) {
        if (full.includes('node_modules')) continue;
        if (full.includes('build')) continue;
        if (full.includes('dist')) continue;
        if (full.includes('static')) continue;
        stack.push(full);
      } else {
        const ext = path.extname(entry.name).toLowerCase();
        if (!filterExts || filterExts.includes(ext)) {
          results.push(full);
        }
      }
    }
  }
  return results;
}

function readLines(file) {
  try {
    const content = fs.readFileSync(file, 'utf8');
    return content.split(/\r?\n/);
  } catch {
    return [];
  }
}

function scanFile(file, rules) {
  const issues = [];
  const lines = readLines(file);
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    for (const rule of rules) {
      if (rule.regex.test(line)) {
        issues.push({
          file,
          line: i + 1,
          issue: rule.name,
          snippet: line.trim().slice(0, 300),
          severity: rule.severity
        });
      }
    }
  }
  return issues;
}

function uniqueIssues(list) {
  const seen = new Set();
  const out = [];
  for (const it of list) {
    const key = `${it.file}:${it.line}:${it.issue}`;
    if (!seen.has(key)) {
      seen.add(key);
      out.push(it);
    }
  }
  return out;
}

function run() {
  const root = process.cwd();
  const frontendSrc = path.join(root, 'frontend', 'hjzdm-frontend', 'src');
  const backendJava = path.join(root, 'src', 'main', 'java');
  const backendYaml = path.join(root, 'src', 'main', 'resources', 'application.yaml');

  const feFiles = fs.existsSync(frontendSrc) ? walk(frontendSrc, ['.ts', '.tsx', '.js', '.jsx']) : [];
  const beJavaFiles = fs.existsSync(backendJava) ? walk(backendJava, ['.java']) : [];
  const allIssues = [];

  const feRules = [
    { name: 'console-log', regex: /\bconsole\.(log|debug|trace)\b/, severity: 'minor' },
    { name: 'debugger-statement', regex: /\bdebugger\b/, severity: 'major' },
    { name: 'window-dialog', regex: /\bwindow\.(alert|confirm|prompt)\b/, severity: 'minor' },
    { name: 'ts-any', regex: /\bany\b/, severity: 'minor' },
    { name: 'absolute-http-url', regex: /https?:\/\/[^\s'"]+/, severity: 'major' },
    { name: 'localhost-backend', regex: /localhost:9090/, severity: 'info' }
  ];
  const beRules = [
    { name: 'system-out', regex: /\bSystem\.out\.println\b/, severity: 'minor' },
    { name: 'hardcoded-http', regex: /https?:\/\/[^\s'"]+/, severity: 'major' }
  ];

  for (const f of feFiles) {
    allIssues.push(...scanFile(f, feRules));
  }
  for (const f of beJavaFiles) {
    allIssues.push(...scanFile(f, beRules));
  }

  const yamlIssues = [];
  if (fs.existsSync(backendYaml)) {
    const lines = readLines(backendYaml);
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (/\b(secret|access-key|secret-key|token|client-id|app-id)\b/i.test(line)) {
        const val = line.split(':').slice(1).join(':').trim();
        if (val && !/YOUR_/i.test(val)) {
          yamlIssues.push({
            file: backendYaml,
            line: i + 1,
            issue: 'potential-secret-in-config',
            snippet: line.trim().slice(0, 300),
            severity: 'major'
          });
        }
      }
    }
  }
  allIssues.push(...yamlIssues);

  const deduped = uniqueIssues(allIssues);
  const summary = {
    total: deduped.length,
    bySeverity: {
      major: deduped.filter(i => i.severity === 'major').length,
      minor: deduped.filter(i => i.severity === 'minor').length,
      info: deduped.filter(i => i.severity === 'info').length
    }
  };

  const report = {
    summary,
    issues: deduped
  };

  const text = [];
  text.push(`Code Review Summary`);
  text.push(`Total: ${summary.total}`);
  text.push(`Major: ${summary.bySeverity.major}, Minor: ${summary.bySeverity.minor}, Info: ${summary.bySeverity.info}`);
  for (const it of deduped) {
    text.push(`[${it.severity}] ${it.issue} @ ${it.file}:${it.line}`);
    text.push(`  ${it.snippet}`);
  }

  try {
    fs.mkdirSync(path.join(root, 'reports'), { recursive: true });
    fs.writeFileSync(path.join(root, 'reports', 'code-review.json'), JSON.stringify(report, null, 2));
    fs.writeFileSync(path.join(root, 'reports', 'code-review.txt'), text.join('\n'));
  } catch {}

  console.log(text.join('\n'));
  process.exit(0);
}

run();
