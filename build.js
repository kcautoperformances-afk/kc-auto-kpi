// build.js - Pre-compile JSX to plain JS using Babel Node API
const fs = require('fs');
const path = require('path');

try {
  const babel = require('@babel/core');
  const html = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8');
  
  // Extract script content
  const scriptStart = html.indexOf('<script type="text/babel">');
  const scriptEnd = html.lastIndexOf('</script>');
  
  if (scriptStart === -1) {
    console.log('No babel script found, skipping build');
    process.exit(0);
  }
  
  const beforeScript = html.substring(0, scriptStart);
  const scriptContent = html.substring(scriptStart + '<script type="text/babel">'.length, scriptEnd);
  const afterScript = html.substring(scriptEnd + '</script>'.length);
  
  // Compile JSX
  const result = babel.transformSync(scriptContent, {
    presets: ['@babel/preset-react'],
    plugins: [],
  });
  
  // Build new HTML with compiled JS
  const newHtml = beforeScript + 
    '<script>' + result.code + '</script>' + 
    afterScript;
  
  // Remove babel script tags from head
  const finalHtml = newHtml
    .replace(/<script src="https:\/\/unpkg\.com\/@babel[^"]*"><\/script>\n?/g, '')
    .replace(/<script src="https:\/\/unpkg\.com\/babel[^"]*"><\/script>\n?/g, '');
  
  fs.writeFileSync(path.join(__dirname, 'index.built.html'), finalHtml);
  console.log('Build successful! index.built.html created');
  
} catch(e) {
  console.log('Build failed:', e.message);
  process.exit(1);
}
