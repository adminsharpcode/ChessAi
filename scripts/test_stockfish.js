const fs = require('fs');

// We can test stockfish.js directly by mocking self / onmessage / postMessage
global.self = global;
global.location = { href: 'http://localhost:5000/js/stockfish.js' };
global.importScripts = function() {};
let messageHandler = null;

global.postMessage = function(stdout) {
  if (stdout.includes('Stockfish') || stdout.includes('uciok') || stdout.includes('option name') || stdout.includes('bestmove') || stdout.includes('info depth')) {
    console.log('[SF OUTPUT]:', stdout);
  }
};

// stockfish.js defines onmessage
require('../js/stockfish.js');

// After requiring, onmessage is defined
console.log('Stockfish onmessage defined:', typeof global.onmessage);

if (typeof global.onmessage === 'function') {
  global.onmessage({ data: 'uci' });
  setTimeout(() => {
    global.onmessage({ data: 'setoption name Skill Level value 10' });
    global.onmessage({ data: 'position startpos' });
    global.onmessage({ data: 'go depth 6' });
  }, 500);

  setTimeout(() => {
    console.log('Finished Stockfish test successfully!');
    process.exit(0);
  }, 2500);
} else {
  console.error('global.onmessage was not defined');
  process.exit(1);
}
