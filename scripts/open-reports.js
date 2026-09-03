const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

const reportsDir = path.resolve(process.cwd(), 'reports');

/**
 * Recursively find all HTML files in a directory
 */
function findHtmlFiles(dir) {
  if (!fs.existsSync(dir)) return [];
  let results = [];
  const list = fs.readdirSync(dir);
  for (const file of list) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat.isDirectory()) {
      results = results.concat(findHtmlFiles(filePath));
    } else if (file.endsWith('.html') && file !== 'index.html') {
      results.push(filePath);
    }
  }
  return results;
}

const htmlFiles = findHtmlFiles(reportsDir);

if (htmlFiles.length === 0) {
  console.log('⚠️ No HTML reports found in reports/. Please run tests first:');
  console.log('   npm test');
  process.exit(0);
}

// Generate an index dashboard linking all reports
const indexHtmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Evinced Accessibility Reports Hub</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; margin: 40px; background: #f8fafc; color: #1e293b; }
    .container { max-width: 800px; margin: 0 auto; background: white; padding: 32px; border-radius: 12px; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1); }
    h1 { color: #0f172a; margin-top: 0; display: flex; align-items: center; gap: 12px; font-size: 24px; }
    p { color: #64748b; margin-bottom: 24px; }
    ul { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 12px; }
    li a { display: block; padding: 16px 20px; background: #f1f5f9; border-radius: 8px; text-decoration: none; color: #2563eb; font-weight: 600; transition: all 0.2s; border: 1px solid #e2e8f0; }
    li a:hover { background: #e0e7ff; color: #1d4ed8; border-color: #cbd5e1; transform: translateY(-1px); }
    .tag { display: inline-block; font-size: 12px; padding: 2px 8px; border-radius: 4px; background: #e2e8f0; color: #475569; margin-left: 8px; font-weight: normal; }
  </style>
</head>
<body>
  <div class="container">
    <h1><span>📊</span> Evinced Accessibility Reports Hub</h1>
    <p>The following reports were generated from your test runs:</p>
    <ul>
      ${htmlFiles.map(f => {
        const rel = path.relative(reportsDir, f);
        const name = path.basename(f, '.html').replace(/_/g, ' ');
        const isSuite = rel.includes('scale-suite') ? '<span class="tag">Scale Suite</span>' : '<span class="tag">Core Suite</span>';
        return `<li><a href="${rel}" target="_blank">${name} ${isSuite}</a></li>`;
      }).join('\n      ')}
    </ul>
  </div>
</body>
</html>`;

const indexPath = path.join(reportsDir, 'index.html');
fs.writeFileSync(indexPath, indexHtmlContent, 'utf8');

console.log(`\nFound ${htmlFiles.length} Evinced accessibility report(s):`);
htmlFiles.forEach(f => console.log(` - ${path.relative(process.cwd(), f)}`));

// Determine system open command
const platform = process.platform;
let openCmd = 'open';
if (platform === 'win32') openCmd = 'start ""';
else if (platform === 'linux') openCmd = 'xdg-open';

// Open all individual reports
console.log('\nOpening all reports in your browser...\n');
htmlFiles.forEach(file => {
  exec(`${openCmd} "${file}"`, err => {
    if (err) console.error(`Failed to open ${file}:`, err.message);
  });
});
