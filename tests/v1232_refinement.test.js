import assert from "node:assert/strict";
import fs from "node:fs";
const read=p=>fs.readFileSync(new URL("../"+p,import.meta.url),"utf8");
const pkg=JSON.parse(read("package.json"));
const manifest=JSON.parse(read("data/manifest.json"));
const explore=read("explore/app.js");
const standalone=read("explore/index.html");
const app=read("app.js");
const readBytes=p=>fs.readFileSync(new URL("../"+p,import.meta.url));

assert.equal(pkg.version,"1.2.48");
assert.equal(manifest.version,"1.2.48");
assert.equal(manifest.beta_version,"1.2.48");
assert.ok(explore.includes("const VERSION = '1.2.48'"));
assert.ok(standalone.includes('styles.css?v=1.2.48'));
assert.ok(standalone.includes('explore-runtime.js?v=1.2.48'));
assert.ok(app.includes("import('./explore/app.js?v=1.2.48')"));

assert.ok(explore.includes("node.type==='hub'?'EXPLORE!':"));
assert.ok(explore.includes('<h1 id="explore-entry-title">Not on desktop?</h1>'));
assert.ok(explore.includes('<strong>EXPLORE! works here, too.</strong>'));
assert.ok(explore.includes('For the fullest constellation experience, using a <strong>desktop computer</strong> is recommended.'));
assert.ok(explore.includes('EXPLORE! here'));
assert.ok(explore.includes('Start Pathfinder instead'));
assert.ok(!explore.includes('Find your way through English.'));

// Motion/environment remain frozen; the shared layout solver is intentionally revised in v1.2.48.
const before={
  motion:'fe4a545ff5d5d0e19d1206d11e40fc5f818bf7657d60de3b6e92eb1af3ea5321',
  layout:'975fe7b5d935e91ae6dbfe377aebbf3abc8e0585d0fadd662b284586b53d0dfc',
  environment:'e617fee8f16017c95c603b320181c4000290a156a637999f849768d3715e538c'
};
// Hash via built-in crypto keeps this test dependency-free.
import crypto from "node:crypto";
for(const [key,file] of Object.entries({motion:"src/explore-motion.js",layout:"src/explore-layout.js",environment:"src/explore-environment.js"})){
  const got=crypto.createHash('sha256').update(readBytes(file)).digest('hex');
  assert.equal(got,before[key],file+' must remain unchanged');
}

console.log('v1.2.48 branding and frozen-renderer checks passed');
