import pytest
from datetime import datetime
from app.services.summary_service import chunk_transcript

def test_chunk_transcript_empty():
    assert chunk_transcript([]) == []

def test_chunk_transcript_small():
    dialogue = [
        {
            "speaker": "Trainer",
            "role": "trainer",
            "text": "Hello world",
            "timestamp": datetime.now().isoformat()
        }
    ]
    chunks = chunk_transcript(dialogue, max_words=100)
    assert len(chunks) == 1
    assert "Trainer: Hello world" in chunks[0]

def test_chunk_transcript_large_chunking():
    dialogue = [
        {
            "speaker": f"User {i}",
            "role": "student",
            "text": "Word " * 200,
            "timestamp": datetime.now().isoformat()
        }
        for i in range(10)
    ]
    # 10 entries of 200 words each = 2000 words
    # Max words per chunk is 500, so we expect about 4 chunks
    chunks = chunk_transcript(dialogue, max_words=500)
    assert len(chunks) > 1
    for chunk in chunks:
        # Check that no chunk exceeds the word limit significantly
        word_count = len(chunk.split())
        assert word_count <= 650 # Allow some buffer for headers
