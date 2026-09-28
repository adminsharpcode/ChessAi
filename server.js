const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

const PORT = 5000;
const MIME_TYPES = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'application/javascript',
  '.json': 'application/json',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.webp': 'image/webp',
  '.apk': 'application/vnd.android.package-archive'
};

// Load Carlsen Games into memory for instant sub-millisecond retrieval
let carlsenGames = [];
let carlsenCatalog = [];

const carlsenPgnPath = path.join(__dirname, 'games', 'Carlsen.pgn');
const carlsenCatalogPath = path.join(__dirname, 'games', 'carlsen-catalog.json');

try {
  if (fs.existsSync(carlsenPgnPath)) {
    console.log('Loading Carlsen.pgn (7,818 games)...');
    const content = fs.readFileSync(carlsenPgnPath, 'utf8');
    carlsenGames = content.split(/\r?\n(?=\[Event )/);
    console.log(`Loaded ${carlsenGames.length} Carlsen games into memory.`);
  }
  if (fs.existsSync(carlsenCatalogPath)) {
    carlsenCatalog = JSON.parse(fs.readFileSync(carlsenCatalogPath, 'utf8'));
  }
} catch (e) {
  console.warn('Could not preload Carlsen games:', e.message);
}

const server = http.createServer((req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;

  // API Endpoint: Search Carlsen Catalog
  if (pathname === '/api/carlsen-games') {
    const q = (parsedUrl.query.q || '').toLowerCase().trim();
    const limit = parseInt(parsedUrl.query.limit || '40', 10);

    let results = carlsenCatalog;
    if (q) {
      results = carlsenCatalog.filter(g => 
        g.white.toLowerCase().includes(q) ||
        g.black.toLowerCase().includes(q) ||
        g.event.toLowerCase().includes(q) ||
        g.date.includes(q) ||
        g.eco.toLowerCase().includes(q)
      );
    }

    res.writeHead(200, {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*'
    });
    res.end(JSON.stringify({
      total: results.length,
      games: results.slice(0, limit)
    }));
    return;
  }

  // API Endpoint: Fetch specific Carlsen Game PGN by ID
  if (pathname === '/api/carlsen-game') {
    const id = parseInt(parsedUrl.query.id || '0', 10);
    const gamePgn = carlsenGames[id] || '';

    res.writeHead(200, {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*'
    });
    res.end(JSON.stringify({
      id: id,
      pgn: gamePgn
    }));
    return;
  }

  // Static File Serving
  let filePath = path.join(__dirname, pathname === '/' ? 'index.html' : pathname);

  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('404 Not Found');
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    res.writeHead(200, {
      'Content-Type': contentType,
      'Access-Control-Allow-Origin': '*'
    });

    fs.createReadStream(filePath).pipe(res);
  });
});

server.listen(PORT, () => {
  console.log(`ChessCoach AI running at http://localhost:${PORT}`);
});
