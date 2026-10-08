import math
from typing import List, Dict, Any

class BenchmarkMetrics:
    """
    Standard statistical calculation for RAG Security Benchmarking.
    Computes Attack Success Rate (ASR), Retrieval Rate (RR),
    Conditional ASR, Benign Utility, and False Positive Rate (FPR).
    """
    @staticmethod
    def compute_asr(total_attacks: int, successful_breaches: int) -> float:
        if total_attacks == 0:
            return 0.0
        return round((successful_breaches / total_attacks) * 100.0, 2)

    @staticmethod
    def compute_conditional_asr(retrieved_attacks: int, successful_breaches: int) -> float:
        if retrieved_attacks == 0:
            return 0.0
        return round((successful_breaches / retrieved_attacks) * 100.0, 2)

    @staticmethod
    def compute_retrieval_rate(total_attacks: int, retrieved_attacks: int) -> float:
        if total_attacks == 0:
            return 0.0
        return round((retrieved_attacks / total_attacks) * 100.0, 2)

    @staticmethod
    def compute_utility_score(clean_evals: int, accurate_clean_answers: int) -> float:
        if clean_evals == 0:
            return 100.0
        return round((accurate_clean_answers / clean_evals) * 100.0, 2)

    @staticmethod
    def compute_fpr(clean_samples: int, falsely_blocked: int) -> float:
        if clean_samples == 0:
            return 0.0
        return round((falsely_blocked / clean_samples) * 100.0, 2)
