#!/usr/bin/env python3
"""Regenerate data/runtime-data.js from the editable JSON sources.

Use this only when opening index.html directly as file://. Normal HTTP
serving reads the JSON source files directly at runtime.
"""
from pathlib import Path
import json

ROOT = Path(__file__).resolve().parent
spec = json.loads((ROOT / "pathfinder.spec.json").read_text(encoding="utf-8"))
graph = json.loads((ROOT / "explore-english.graph.json").read_text(encoding="utf-8"))
output = (ROOT / "runtime-data.js")
output.write_text(
    "/* Generated from the editable JSON source files. */\n"
    "window.__PATHFINDER_SPEC__ = " + json.dumps(spec, ensure_ascii=False, separators=(",", ":")) + ";\n"
    "window.__EXPLORE_GRAPH__ = " + json.dumps(graph, ensure_ascii=False, separators=(",", ":")) + ";\n",
    encoding="utf-8",
)
print(f"Updated {output}")
