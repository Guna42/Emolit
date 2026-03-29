"""
ruler_mapper.py  —  Maps emotion vocabulary entries to the RULER framework.

RULER (Yale Center for Emotional Intelligence):
  R – Recognize
  U – Understand
  L – Label
  E – Express
  R – Regulate
"""

from typing import Dict


def map_to_ruler(row: Dict) -> Dict[str, str]:
    """
    Given a row from the emotions vocabulary spreadsheet, produce a
    structured RULER mapping with evidence from the row's own fields.

    Parameters
    ----------
    row : dict with keys:
        word, definition, example, category, level,
        similar_words, opposite_words, cultural_context

    Returns
    -------
    dict with keys: Recognize, Understand, Label, Express, Regulate
    """
    word        = row.get("word", "")
    definition  = row.get("definition", "")
    example     = row.get("example", "")
    category    = row.get("category", "")
    level       = row.get("level", "")
    similar     = row.get("similar_words", "")
    opposite    = row.get("opposite_words", "")
    cultural    = row.get("cultural_context", "")

    # Intensity label from numeric level
    intensity_map = {1: "Basic", 2: "Moderate", 3: "Advanced", 4: "Nuanced"}
    intensity = intensity_map.get(int(level), "Unknown") if str(level).isdigit() else "Unknown"

    return {
        "Recognize": (
            f"'{word}' belongs to the '{category}' emotional category. "
            f"It can be recognized as a {intensity}-level emotion signal."
        ),
        "Understand": (
            f"Definition: {definition}. "
            f"Cultural context: {cultural}"
        ),
        "Label": (
            f"Precise label: '{word}'. "
            f"Related vocabulary: {similar}."
        ),
        "Express": (
            f"Example of expression: {example}"
        ),
        "Regulate": (
            f"Intensity level: {intensity} ({level}/4). "
            f"Opposite emotional states: {opposite}."
        ),
    }


def ruler_summary(row: Dict) -> str:
    """Return a single formatted string suitable for vector embedding."""
    mapping = map_to_ruler(row)
    lines = [f"Word: {row.get('word', '')}"]
    for dim, text in mapping.items():
        lines.append(f"[{dim}] {text}")
    return "\n".join(lines)
