import fs from 'node:fs';
import assert from 'node:assert/strict';
const layout=fs.readFileSync(new URL('../src/explore-layout.js',import.meta.url),'utf8');
assert.ok(layout.includes('const mobileMinRX=width*.14, mobileMaxRX=width*(rootMode?.32:.36);'));
assert.ok(layout.includes('const mobileMinRY=height*.12, mobileMaxRY=height*(rootMode?.285:.315);'));
assert.ok(layout.includes('if(mobile){'));
assert.ok(layout.includes('y=Math.sin(baseAngle+spiral)*ry;'));
assert.ok(layout.includes("y=Math.sin(baseAngle+spiral)*r*.78;"),'desktop/narrow radial path must remain intact');
console.log('PASS: mobile initial layout uses independent tall/wide breathing-room radii while desktop path remains unchanged');
