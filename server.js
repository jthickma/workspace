const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 12000;

const MIME_TYPES = {
    '.html': 'text/html',
    '.css': 'text/css',
    '.js': 'text/javascript',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon',
    '.txt': 'text/plain',
};

const server = http.createServer((req, res) => {
    console.log(`${req.method} ${req.url}`);
    
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
    
    // Handle OPTIONS request
    if (req.method === 'OPTIONS') {
        res.statusCode = 200;
        res.end();
        return;
    }
    
    // Parse URL
    let url = req.url;
    
    // Default to index.html if root path
    if (url === '/') {
        url = '/index.html';
    }
    
    // Resolve file path
    const filePath = path.join(__dirname, url);
    const extname = path.extname(filePath);
    
    // Get content type based on file extension
    const contentType = MIME_TYPES[extname] || 'application/octet-stream';
    
    // Read file
    fs.readFile(filePath, (err, content) => {
        if (err) {
            if (err.code === 'ENOENT') {
                // File not found
                fs.readFile(path.join(__dirname, '404.html'), (err, content) => {
                    res.writeHead(404, { 'Content-Type': 'text/html' });
                    res.end(content || '404 Not Found', 'utf-8');
                });
            } else {
                // Server error
                res.writeHead(500);
                res.end(`Server Error: ${err.code}`);
            }
        } else {
            // Success
            res.writeHead(200, { 'Content-Type': contentType });
            res.end(content, 'utf-8');
        }
    });
});

server.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running at http://localhost:${PORT}/`);
    console.log(`Server is also accessible at https://work-1-bfrqiuuusnogkdgs.prod-runtime.all-hands.dev`);
});