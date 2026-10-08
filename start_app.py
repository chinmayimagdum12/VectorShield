import os
import sys
import webbrowser
import time
import uvicorn

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
backend_dir = os.path.join(BASE_DIR, "backend")
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

if __name__ == "__main__":
    port = int(os.getenv("PORT", "8000"))
    host = os.getenv("HOST", "127.0.0.1")

    print("\n" + "=" * 70)
    print("      VECTORSHIELD ENTERPRISE DEFENSE PLATFORM LAUNCHER")
    print("      Multi-Layered Defense & Evaluation Platform for RAG")
    print("=" * 70)
    print(f"[*] Access Web Application & UI at:  http://localhost:{port}")
    print(f"[*] Interactive OpenAPI Docs at:     http://localhost:{port}/docs")
    print(f"[*] Health & Telemetry Endpoint at:  http://localhost:{port}/api/v1/health")
    print("=" * 70 + "\n")

    # Launch browser after a brief delay
    def open_browser():
        time.sleep(1.2)
        webbrowser.open(f"http://localhost:{port}")

    import threading
    threading.Thread(target=open_browser, daemon=True).start()

    uvicorn.run("app.main:app", host=host, port=port, reload=False)
