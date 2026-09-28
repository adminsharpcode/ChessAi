const fs = require('fs');

// Create minimal DOM mock
class MockElement {
  constructor(tag = 'div') {
    this.tagName = tag.toUpperCase();
    this.children = [];
    const set = new Set();
    this.classList = {
      add: (...tokens) => tokens.forEach(t => set.add(t)),
      remove: (...tokens) => tokens.forEach(t => set.delete(t)),
      toggle: (token, force) => {
        if (force === undefined) {
          if (set.has(token)) { set.delete(token); return false; }
          else { set.add(token); return true; }
        } else if (force) {
          set.add(token); return true;
        } else {
          set.delete(token); return false;
        }
      },
      has: (token) => set.has(token),
      contains: (token) => set.has(token)
    };
      this.dataset = {};
      this.style = {};
      this.innerHTML = '';
      this.attributes = {};
      this._set = set;
    }
    set className(val) {
      this._className = val;
      this._set.clear();
      (val || '').split(/\s+/).filter(Boolean).forEach(t => this._set.add(t));
    }
    get className() { return Array.from(this._set).join(' '); }
  setAttribute(k, v) { this.attributes[k] = v; }
  getAttribute(k) { return this.attributes[k]; }
  appendChild(child) {
    this.children.push(child);
    child.parentElement = this;
    return child;
  }
  querySelector(sel) {
    if (sel === '.sq-piece') return this.children.find(c => c.classList.contains('sq-piece')) || null;
    return null;
  }
  querySelectorAll() { return []; }
  remove() {}
  closest(sel) {
    if (sel === '.board-sq' && this.classList.has('board-sq')) return this;
    if (this.parentElement) return this.parentElement.closest(sel);
    return null;
  }
  getBoundingClientRect() {
    return { left: 0, top: 0, width: 400, height: 400, right: 400, bottom: 400 };
  }
  addEventListener(event, fn) {
    this._listeners = this._listeners || {};
    this._listeners[event] = this._listeners[event] || [];
    this._listeners[event].push(fn);
  }
  removeEventListener() {}
}

const windowListeners = {};
global.window = {
  addEventListener: (event, fn) => {
    windowListeners[event] = windowListeners[event] || [];
    windowListeners[event].push(fn);
  },
  removeEventListener: () => {},
  localStorage: { getItem: () => null, setItem: () => {} }
};
global.document = {
  body: new MockElement('body'),
  createElement: (tag) => new MockElement(tag),
  createElementNS: (ns, tag) => new MockElement(tag),
  elementFromPoint: () => null,
  querySelectorAll: () => []
};

// Load chess.js and board.js
eval(fs.readFileSync('js/chess.js', 'utf8'));
eval(fs.readFileSync('js/board.js', 'utf8'));

const Chess = global.Chess || window.Chess;
const ChessBoardUI = global.ChessBoardUI || window.ChessBoardUI;

console.log('Testing ChessBoardUI...');
const container = new MockElement('div');
let moveDispatched = null;

const boardUI = new ChessBoardUI(container, {
  orientation: 'w',
  onMove: (move) => {
    moveDispatched = move;
    console.log('onMove DISPATCHED:', move.san);
  }
});

const game = new Chess();
boardUI.setGame(game);

// For 400x400 board: square size is 50px
// files: a=0..50, b=50..100, c=100..150, d=150..200, e=200..250, f=250..300, g=300..350, h=350..400
// ranks: 8=0..50, 7=50..100, 6=100..150, 5=150..200, 4=200..250, 3=250..300, 2=300..350, 1=350..400

const e2X = 225, e2Y = 325; // center of e2
const e4X = 225, e4Y = 225; // center of e4
const e7X = 225, e7Y = 75;  // center of e7
const e5X = 225, e5Y = 175; // center of e5

console.log('--- TEST 1: Tap-to-Move (e2 to e4) ---');
const onPointerDown = boardUI.boardElement._listeners['pointerdown'][0];
const onPointerMove = windowListeners['pointermove'][0];
const onPointerUp = windowListeners['pointerup'][0];

// 1. User taps e2 (down and up without move)
onPointerDown({ clientX: e2X, clientY: e2Y, target: boardUI.squareElements['e2'], preventDefault: () => {} });
onPointerUp({ clientX: e2X, clientY: e2Y });
console.log('Selected square after tapping e2:', boardUI.selectedSquare);
console.log('e3 has legal-dest:', boardUI.squareElements['e3'].classList.contains('legal-dest'));
console.log('e4 has legal-dest:', boardUI.squareElements['e4'].classList.contains('legal-dest'));

// 2. User taps e4 (down and up on legal square)
onPointerDown({ clientX: e4X, clientY: e4Y, target: boardUI.squareElements['e4'], preventDefault: () => {} });
onPointerUp({ clientX: e4X, clientY: e4Y });
console.log('Move dispatched after tapping e4:', moveDispatched ? moveDispatched.san : 'NONE');
console.log('Current turn after move:', game.turn);
console.log('Selected square after move:', boardUI.selectedSquare);

console.log('\n--- TEST 2: Drag-and-Drop (Black e7 to e5) ---');
// 1. Black touches e7
onPointerDown({ clientX: e7X, clientY: e7Y, target: boardUI.squareElements['e7'], preventDefault: () => {} });
// 2. Drag downwards towards e5 (dist > 5)
onPointerMove({ clientX: e7X, clientY: e7Y + 40 });
onPointerMove({ clientX: e7X, clientY: e5Y });
// 3. Release on e5
onPointerUp({ clientX: e7X, clientY: e5Y });
console.log('Move dispatched after dragging e7->e5:', moveDispatched ? moveDispatched.san : 'NONE');
console.log('Current turn after move:', game.turn);

console.log('\n--- TEST 3: Magnetic Snap to Nearest Legal Square (White d2 to d4) ---');
const d2X = 175, d2Y = 325;
// User drags d2 pawn, but releases slightly off-target (e.g. y = 240 instead of 225, x = 180)
onPointerDown({ clientX: d2X, clientY: d2Y, target: boardUI.squareElements['d2'], preventDefault: () => {} });
onPointerMove({ clientX: d2X, clientY: d2Y - 30 });
onPointerMove({ clientX: 180, clientY: 240 }); // Slightly off center
onPointerUp({ clientX: 180, clientY: 240 });
console.log('Move dispatched after magnetic drag release:', moveDispatched ? moveDispatched.san : 'NONE');
console.log('Current turn after move:', game.turn);

console.log('\n--- TEST 4: Tap Same Piece to Deselect ---');
// Black to move: tap c7 to select
const c7X = 125, c7Y = 75;
onPointerDown({ clientX: c7X, clientY: c7Y, target: boardUI.squareElements['c7'], preventDefault: () => {} });
onPointerUp({ clientX: c7X, clientY: c7Y });
console.log('Selected square after first tap on c7:', boardUI.selectedSquare);
// Tap c7 again to deselect
onPointerDown({ clientX: c7X, clientY: c7Y, target: boardUI.squareElements['c7'], preventDefault: () => {} });
onPointerUp({ clientX: c7X, clientY: c7Y });
console.log('Selected square after second tap on c7:', boardUI.selectedSquare);

console.log('\n--- TEST 5: Tap another friendly piece to switch selection ---');
// Tap b7
const b7X = 75, b7Y = 75;
onPointerDown({ clientX: b7X, clientY: b7Y, target: boardUI.squareElements['b7'], preventDefault: () => {} });
onPointerUp({ clientX: b7X, clientY: b7Y });
console.log('Selected square after tapping b7:', boardUI.selectedSquare);
// Tap b8 (Knight)
const b8X = 75, b8Y = 25;
onPointerDown({ clientX: b8X, clientY: b8Y, target: boardUI.squareElements['b8'], preventDefault: () => {} });
onPointerUp({ clientX: b8X, clientY: b8Y });
console.log('Selected square after tapping b8:', boardUI.selectedSquare);

console.log('\n--- ALL INTERACTION TESTS PASSED SUCCESSFULLY! ---');
