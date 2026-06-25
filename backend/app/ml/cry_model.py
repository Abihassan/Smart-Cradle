"""
Cry detection model.

Phase 1-2: stub implementation that returns a plausible result based on simple
heuristics over provided audio features (or randomly if none given).

Phase 3: replace `predict()` internals with a real model — e.g. a librosa
MFCC feature extractor feeding a small CNN/MLP trained on a cry-classification
dataset (Donate-a-Cry corpus is a common starting point). The function
signature and return shape (CryPrediction) should remain unchanged so the
rest of the system (decision engine, API contract) doesn't need to change.
"""

from __future__ import annotations

import random
from dataclasses import dataclass

REASONS = ["hunger", "tired", "pain", "discomfort"]


@dataclass
class CryPrediction:
    cry: bool
    reason: str | None
    confidence: float


def predict(features: list[float] | None = None, audio_ref: str | None = None) -> CryPrediction:
    """
    Returns a cry prediction.

    Args:
        features: Optional pre-extracted audio features (e.g. MFCCs).
        audio_ref: Optional reference/path to raw audio for the real model.

    Returns:
        CryPrediction with cry flag, reason (if crying), and confidence.
    """
    if features:
        # Placeholder heuristic: use mean feature magnitude to bias toward
        # "crying" — replace with real model inference.
        avg = sum(features) / len(features)
        is_cry = avg > 0.5
        confidence = min(0.99, max(0.5, avg))
    else:
        is_cry = random.random() > 0.5
        confidence = round(random.uniform(0.6, 0.98), 2)

    if not is_cry:
        return CryPrediction(cry=False, reason=None, confidence=round(1 - confidence, 2))

    reason = random.choice(REASONS)
    return CryPrediction(cry=True, reason=reason, confidence=confidence)
