import json
import ollama  # If you use a different embedding API, replace this import

def embed_text(text):
    # Use your embedding function here
    return ollama.embeddings(model='mxbai-embed-large', prompt=text)['embedding']

# List of 20 example queries
queries = [
    "old man",
    "mischievous boy",
    "blue haired woman",
    "police officer",
    "school principal",
    "bartender",
    "comic book nerd",
    "evil boss",
    "baby with pacifier",
    "bus driver",
    "clown entertainer",
    "religious neighbor",
    "bully",
    "teacher",
    "scientist",
    "doctor",
    "criminal",
    "mayor",
    "musician",
    "news anchor"
]

results = []
for q in queries:
    print(f"Embedding: {q}")
    emb = embed_text(q)
    results.append({"query": q, "embedding": emb})

with open('queries.json', 'w') as f:
    json.dump(results, f, indent=2)

print("Saved 20 queries to queries.json")