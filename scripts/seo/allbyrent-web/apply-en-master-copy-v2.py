#!/usr/bin/env python3
"""Apply EN master copy v2 replacements to AllByRent-Web/index.html"""
from __future__ import annotations

import json
import sys
from pathlib import Path


def main() -> int:
  root = Path(__file__).resolve().parent
  map_path = root / "en-master-copy-v2.json"
  # default: sibling clone or CWD index.html
  target = Path(sys.argv[1]) if len(sys.argv) > 1 else Path.cwd() / "index.html"
  data = json.loads(map_path.read_text(encoding="utf-8"))
  reps = sorted(data["replacements"], key=lambda r: len(r["old"]), reverse=True)
  text = target.read_text(encoding="utf-8")
  missing = []
  applied = 0
  for r in reps:
    old, new = r["old"], r["new"]
    if old not in text:
      missing.append(old[:100])
      continue
    count = text.count(old)
    text = text.replace(old, new)
    applied += count
  target.write_text(text, encoding="utf-8")
  print(f"applied {applied} replacements to {target}")
  if missing:
    print(f"MISSING {len(missing)}:")
    for m in missing:
      print(" -", m)
    return 1
  for bad in ("business cell", "idle stuff", "Nextdoor", "A few steps turns"):
    if bad in text:
      print("LEFTOVER:", bad)
      return 2
  print("OK — no forbidden leftovers")
  return 0


if __name__ == "__main__":
  raise SystemExit(main())
