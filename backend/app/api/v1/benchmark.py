from fastapi import APIRouter, Depends
from pydantic import BaseModel
from typing import Dict, Any, List
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.benchmark.harness import benchmark_harness, CONFIG_PRESETS

router = APIRouter(prefix="/benchmark", tags=["Benchmark"])

class RunBenchmarkRequest(BaseModel):
    config_name: str = "C6" # C0..C7 or "ALL"

@router.post("/run")
def run_benchmark(req: RunBenchmarkRequest):
    if req.config_name == "ALL":
        results = [benchmark_harness.run_suite(cfg) for cfg in ["C0", "C1", "C2", "C3", "C4", "C5", "C6", "C7"]]
        return {"mode": "batch", "results": results}
    else:
        result = benchmark_harness.run_suite(req.config_name)
        return {"mode": "single", "result": result}

@router.get("/summary")
def get_benchmark_summary():
    """
    Returns baseline matrix comparing all configurations C0 to C7.
    """
    matrix = []
    for code in ["C0", "C1", "C2", "C3", "C4", "C5", "C6", "C7"]:
        res = benchmark_harness.run_suite(code)
        matrix.append(res)
    return {
        "presets": CONFIG_PRESETS,
        "matrix": matrix
    }
