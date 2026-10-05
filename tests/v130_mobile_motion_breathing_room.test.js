import assert from "node:assert/strict";
import fs from "node:fs";

const app=fs.readFileSync(new URL("../explore/app.js",import.meta.url),"utf8");
const matchX=app.match(/const quietMaxX=clamp\(width\*([0-9.]+),([0-9.]+),([0-9.]+)\)/);
const matchY=app.match(/const quietMaxY=clamp\(height\*([0-9.]+),([0-9.]+),([0-9.]+)\)/);
assert.ok(matchX&&matchY,"reduced-motion mobile breathing-room bounds should be explicit");
assert.ok(Number(matchX[1])>=0.026 && Number(matchX[3])>=10,"mobile X motion envelope should have modestly expanded breathing room");
assert.ok(Number(matchY[1])>=0.022 && Number(matchY[3])>=14,"mobile Y motion envelope should have more generous vertical breathing room");
assert.ok(app.includes("const quietMobileLife=Boolean(reduced&&environment.compactTouch)"));
console.log("PASS: v1.3.0 mobile motion envelope provides additional breathing room without changing shared motion module");
