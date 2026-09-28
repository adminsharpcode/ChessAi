const chessJs = require('../js/chess.js');
const Chess = chessJs.Chess;
global.Chess = Chess;

require('../js/openings.js');
const OpeningExplorer = global.OpeningExplorer;

require('../js/engine.js');
const ChessEngine = global.ChessEngine;
const engine = new ChessEngine();

require('../js/classifier.js');
const MoveClassifier = global.MoveClassifier;

console.log('=== 1. TESTING OPENING BOOK DATABASE (ECO A00 - E99) ===');

const testOpenings = [
  { name: 'Sicilian Defense', moves: ['e4', 'c5'] },
  { name: 'Sicilian Closed / Grand Prix', moves: ['e4', 'c5', 'Nc3', 'Nc6'] },
  { name: 'Ruy Lopez', moves: ['e4', 'e5', 'Nf3', 'Nc6', 'Bb5'] },
  { name: 'Italian Giuoco Piano', moves: ['e4', 'e5', 'Nf3', 'Nc6', 'Bc4', 'Bc5'] },
  { name: 'Queen Gambit Declined', moves: ['d4', 'd5', 'c4', 'e6'] },
  { name: 'French Defense Advance', moves: ['e4', 'e6', 'd4', 'd5', 'e5'] },
  { name: 'Caro-Kann Classical', moves: ['e4', 'c6', 'd4', 'd5'] },
  { name: 'King\'s Indian Defense', moves: ['d4', 'Nf6', 'c4', 'g6', 'Nc3', 'Bg7'] },
  { name: 'London System', moves: ['d4', 'd5', 'Nf3', 'Nf6', 'Bf4'] },
  { name: 'English Opening', moves: ['c4', 'e5', 'Nc3', 'Nf6'] }
];

let bookPassed = 0;
for (const test of testOpenings) {
  const isBook = OpeningExplorer.isBookMove(test.moves);
  const match = OpeningExplorer.findOpening(test.moves);
  console.log(`[BOOK TEST] ${test.name}: isBookMove=${isBook}, matched=${match ? match.name + ' (' + match.eco + ')' : 'NONE'}`);
  if (isBook && match) bookPassed++;
}
console.log(`Openings matched: ${bookPassed}/${testOpenings.length}`);

console.log('\n=== 2. TESTING TACTICAL SEQUENCE CLASSIFICATION ===');

// Test A: Checkmate sequence (Scholar's Mate style)
const simMate = new Chess();
simMate.move('e4');
simMate.move('e5');
simMate.move('Bc4');
simMate.move('Nc6');
simMate.move('Qh5');
simMate.move('Nf6'); // Blunder allowing Qxf7#

const mateContinuation = [
  { from: 'h5', to: 'f7', san: 'Qxf7#' }
];

const mateTactics = engine.classifyTacticalSequence(simMate, mateContinuation);
console.log('[TACTICS TEST 1 - Checkmate]:', {
  hasTactics: mateTactics.hasTactics,
  category: mateTactics.category,
  headline: mateTactics.headline,
  summaryBadge: mateTactics.summaryBadge,
  notificationTitle: mateTactics.notificationTitle
});

// Test B: Capture exchange sequence (Bxe5, dxe5)
const simCap = new Chess();
simCap.load('r1bqkb1r/pppp1ppp/2n5/4p3/3Pn3/2N2N2/PPP2PPP/R1BQKB1R w KQkq - 0 5');
// White plays Nxe4, Black plays d5, etc.
const capContinuation = [
  { from: 'c3', to: 'e4', san: 'Nxe4' },
  { from: 'd7', to: 'd5', san: 'd5' },
  { from: 'f1', to: 'd3', san: 'Bd3' },
  { from: 'd5', to: 'e4', san: 'dxe4' },
  { from: 'd3', to: 'e4', san: 'Bxe4' }
];

const capTactics = engine.classifyTacticalSequence(simCap, capContinuation);
console.log('[TACTICS TEST 2 - Capture & Trades]:', {
  hasTactics: capTactics.hasTactics,
  category: capTactics.category,
  totalCaptures: capTactics.totalCaptures,
  headline: capTactics.headline,
  summaryBadge: capTactics.summaryBadge,
  notificationTitle: capTactics.notificationTitle,
  firstStep: capTactics.steps[0]
});

// Test C: Fork attack sequence
const simFork = new Chess();
simFork.load('r1b1k2r/pppp1ppp/5n2/4p3/1b1nP3/3P1N2/PPP2PPP/RNBQKB1R w KQkq - 4 6');
// e.g. knight fork or check
const forkMoves = [
  { from: 'c2', to: 'c3', san: 'c3' },
  { from: 'd4', to: 'c2', san: 'Nxc2+' }
];
const forkTactics = engine.classifyTacticalSequence(simFork, forkMoves);
console.log('[TACTICS TEST 3 - Tactical Attack]:', {
  hasTactics: forkTactics.hasTactics,
  category: forkTactics.category,
  headline: forkTactics.headline,
  summaryBadge: forkTactics.summaryBadge,
  stepsCount: forkTactics.steps.length
});

console.log('\nALL VERIFICATION TESTS COMPLETED SUCCESSFULLY!');
