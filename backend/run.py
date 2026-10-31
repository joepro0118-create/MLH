# backend/run.py — start the BridgeWise backend
import os
from dotenv import load_dotenv

load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), "..", ".env"))

import uvicorn

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8000))
    reload_enabled = os.environ.get("RELOAD", "true" if "PORT" not in os.environ else "false").lower() == "true"
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=port,
        reload=reload_enabled,
        log_level="info",
    )
