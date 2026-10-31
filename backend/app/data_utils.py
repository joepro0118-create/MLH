# backend/app/data_utils.py
import json
from pathlib import Path
from typing import Any, Dict, List

_CANDIDATE_PATHS = [
    Path(__file__).parent / "demo_ecosystem.json",
    Path(__file__).parent.parent / "demo_ecosystem.json",
    Path(__file__).parent.parent.parent / "data" / "demo_ecosystem.json",
    Path("data/demo_ecosystem.json").resolve(),
    Path("backend/app/demo_ecosystem.json").resolve(),
]

def get_ecosystem_data_path() -> Path:
    for p in _CANDIDATE_PATHS:
        if p.exists():
            return p
    # Fallback to local package copy
    return Path(__file__).parent / "demo_ecosystem.json"

_CACHED_PARTNERS: List[Dict[str, Any]] | None = None
_CACHED_MTIME: float | None = None

def load_partners() -> List[Dict[str, Any]]:
    global _CACHED_PARTNERS, _CACHED_MTIME
    path = get_ecosystem_data_path()
    try:
        mtime = path.stat().st_mtime
    except OSError:
        mtime = None

    if _CACHED_PARTNERS is not None and mtime == _CACHED_MTIME:
        return _CACHED_PARTNERS

    if not path.exists():
        return []

    with open(path, encoding="utf-8") as f:
        _CACHED_PARTNERS = json.load(f)
        _CACHED_MTIME = mtime
        return _CACHED_PARTNERS
