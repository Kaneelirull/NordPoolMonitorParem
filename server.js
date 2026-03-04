#!/usr/bin/env node

const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const { URL } = require('url');

const PORT = 3456;
const HOST = 'localhost';

// Determine if running as packaged executable or from source
const isPkg = typeof process.pkg !== 'undefined';
const baseDir = isPkg ? path.dirname(process.execPath) : __dirname;

console.log(`Running from: ${baseDir}`);
console.log(`Is packaged: ${isPkg}`);

// MIME types
const mimeTypes = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon'
};

// Proxy API request to Elering (server-side, no CORS!)
function proxyAPIRequest(req, res, queryParams) {
  const start = queryParams.get('start');
  const end = queryParams.get('end');
  
  if (!start || !end) {
    res.writeHead(400, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Missing start or end parameter' }));
    return;
  }
  
  const apiURL = `https://dashboard.elering.ee/api/nps/price?start=${encodeURIComponent(start)}&end=${encodeURIComponent(end)}`;
  
  console.log(`Proxying API request: ${apiURL}`);
  
  https.get(apiURL, (apiRes) => {
    let data = '';
    
    apiRes.on('data', (chunk) => {
      data += chunk;
    });
    
    apiRes.on('end', () => {
      res.writeHead(200, { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      });
      res.end(data);
      console.log(`✓ API request successful (${data.length} bytes)`);
    });
  }).on('error', (error) => {
    console.error(`API request failed: ${error.message}`);
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: error.message }));
  });
}

// Create HTTP server
const server = http.createServer((req, res) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);

  // Parse URL
  const parsedUrl = new URL(req.url, `http://${req.headers.host}`);
  const pathname = parsedUrl.pathname;
  
  // API proxy endpoint
  if (pathname === '/api/prices') {
    proxyAPIRequest(req, res, parsedUrl.searchParams);
    return;
  }
  
  // Static file serving
  let filePath = pathname === '/' ? '/index.html' : pathname;
  
  // Build full path
  const fullPath = path.join(baseDir, filePath);
  
  // Get file extension
  const extname = String(path.extname(fullPath)).toLowerCase();
  const mimeType = mimeTypes[extname] || 'application/octet-stream';

  // Security: prevent directory traversal
  if (!fullPath.startsWith(baseDir)) {
    res.writeHead(403, { 'Content-Type': 'text/html' });
    res.end('<h1>403 - Forbidden</h1>', 'utf-8');
    return;
  }

  // Read and serve file
  fs.readFile(fullPath, (error, content) => {
    if (error) {
      if (error.code === 'ENOENT') {
        console.error(`File not found: ${fullPath}`);
        res.writeHead(404, { 'Content-Type': 'text/html' });
        res.end(`<h1>404 - File Not Found</h1><p>Looking for: ${filePath}</p><p>Full path: ${fullPath}</p>`, 'utf-8');
      } else {
        console.error(`Server error: ${error.code}`);
        res.writeHead(500);
        res.end(`Server Error: ${error.code}`, 'utf-8');
      }
    } else {
      res.writeHead(200, { 
        'Content-Type': mimeType,
        'Cache-Control': 'no-cache'
      });
      res.end(content, 'utf-8');
    }
  });
});

// Open browser
function openBrowser(url) {
  const platform = process.platform;
  let command;

  if (platform === 'win32') {
    command = `start ${url}`;
  } else if (platform === 'darwin') {
    command = `open ${url}`;
  } else {
    command = `xdg-open ${url}`;
  }

  try {
    execSync(command);
    console.log(`✓ Opened browser at ${url}`);
  } catch (error) {
    console.log(`! Could not open browser automatically.`);
    console.log(`  Please open ${url} manually.`);
  }
}

// Start server
server.listen(PORT, HOST, () => {
  const url = `http://${HOST}:${PORT}`;
  console.log('╔════════════════════════════════════════════════╗');
  console.log('║                                                ║');
  console.log('║         NordPool Monitor v4.0                  ║');
  console.log('║                                                ║');
  console.log('╚════════════════════════════════════════════════╝');
  console.log('');
  console.log(`✓ Server running at: ${url}`);
  console.log(`✓ Serving files from: ${baseDir}`);
  console.log(`✓ Press Ctrl+C to stop the server`);
  console.log('');
  
  // List available files
  console.log('Available files:');
  const files = ['index.html', 'api.js', 'renderer.js'];
  files.forEach(file => {
    const exists = fs.existsSync(path.join(baseDir, file));
    console.log(`  ${exists ? '✓' : '✗'} ${file}`);
  });
  console.log('');
  console.log('Opening browser...');
  console.log('');

  // Open browser after a short delay
  setTimeout(() => {
    openBrowser(url);
  }, 1000);
});

// Handle shutdown gracefully
process.on('SIGINT', () => {
  console.log('\n\n✓ Shutting down NordPool Monitor...');
  server.close(() => {
    console.log('✓ Server stopped. Goodbye!');
    process.exit(0);
  });
});

process.on('SIGTERM', () => {
  server.close(() => {
    process.exit(0);
  });
});
