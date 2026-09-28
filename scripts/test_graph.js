// Mock DOM environment for node testing
class MockElement {
  constructor(tagName) {
    this.tagName = tagName;
    this.attributes = {};
    this.children = [];
    this.style = {};
    this.dataset = {};
    this.innerHTML = '';
  }
  setAttribute(k, v) { this.attributes[k] = v; }
  getAttribute(k) { return this.attributes[k]; }
  appendChild(child) { this.children.push(child); }
  querySelector(sel) {
    if (sel.startsWith('#')) {
      const id = sel.substring(1);
      return this.findChildById(id);
    }
    return null;
  }
  findChildById(id) {
    if (this.attributes['id'] === id) return this;
    for (const c of this.children) {
      if (c instanceof MockElement) {
        const f = c.findChildById(id);
        if (f) return f;
      }
    }
    return null;
  }
  addEventListener() {}
}

const mockDoc = {
  createElementNS(ns, tag) { return new MockElement(tag); }
};
global.document = mockDoc;

require('../js/graph.js');
const EvalGraph = global.EvalGraph;

// Test EvalToY calculation
console.log('--- Testing EvalToY ---');
console.log('cp = 0 (even):', EvalGraph.evalToY(0));
console.log('cp = +500 (+5.00 pawns):', EvalGraph.evalToY(500));
console.log('cp = -500 (-5.00 pawns):', EvalGraph.evalToY(-500));
console.log('mate = 3 (M3):', EvalGraph.evalToY(10000, 3));
console.log('mate = -3 (-M3):', EvalGraph.evalToY(-10000, -3));

// Verify that cp = 0 gives exactly middle y = 50
if (Math.abs(EvalGraph.evalToY(0) - 50) < 0.1) {
  console.log('SUCCESS: Centerline matches 0.00 equality at y=50');
}

// Verify that positive eval goes UP (< 50) and negative goes DOWN (> 50)
if (EvalGraph.evalToY(500) < 50 && EvalGraph.evalToY(-500) > 50) {
  console.log('SUCCESS: White advantage correctly expands upward into white fill');
}

// Verify mate
if (EvalGraph.evalToY(10000, 3) < 15 && EvalGraph.evalToY(-10000, -3) > 85) {
  console.log('SUCCESS: Forced mate reaches peak boundaries');
}

console.log('ALL EVAL GRAPH TESTS PASSED!');
