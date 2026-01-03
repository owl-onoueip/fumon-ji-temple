const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 8085;

const mimeTypes = {
    '.html': 'text/html',
    '.css': 'text/css',
    '.js': 'application/javascript',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml'
};

const server = http.createServer((req, res) => {
    // Parse URL and strip query/hash to avoid looking for files like "styles.css?v="
    const parsed = new URL(req.url, 'http://localhost');
    let pathname = parsed.pathname;

    // Default to index.html for root
    if (pathname === '/') pathname = '/index.html';

    // If no extension, try serving corresponding .html (e.g., /guide -> /guide.html)
    if (!path.extname(pathname)) {
        const htmlCandidate = path.join(__dirname, pathname + '.html');
        if (fs.existsSync(htmlCandidate)) {
            pathname = pathname + '.html';
        }
    }

    const filePath = path.join(__dirname, pathname);
    const ext = path.extname(filePath);
    const contentType = mimeTypes[ext] || 'text/plain';

    fs.readFile(filePath, (err, data) => {
        if (err) {
            res.writeHead(404);
            res.end('File not found');
            return;
        }

        res.writeHead(200, { 'Content-Type': contentType });
        res.end(data);
    });
});

server.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
