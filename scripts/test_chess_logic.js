const fs = require('fs');

// Mock window and document
const window = {
  addEventListener: () => {},
  removeEventListener: () => {},
  localStorage: { getItem: () => null, setItem: () => {} }
};
global.window = window;

// Load chess.js
const chessCode = fs.readFileSync('js/chess.js', 'utf8');
eval(chessCode);
const Chess = global.Chess || window.Chess;
console.log('Chess loaded:', typeof Chess);

// Test chess moves
const game = new Chess();
console.log('Initial turn:', game.turn); // 'w'

// Try move e2 -> e4
const m = game.move({ from: 'e2', to: 'e4', promotion: 'q' });
console.log('Move e2->e4 legal:', !!m, m ? m.san : 'none');
console.log('Turn after move:', game.turn); // 'b'
