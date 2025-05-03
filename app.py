from fastapi import FastAPI, Query
import json
import numpy as np
from typing import List
from fastapi.middleware.cors import CORSMiddleware
from sklearn.manifold import TSNE

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load characters and queries with embeddings at startup
with open('characters_with_embeddings.json', 'r') as f:
    CHARACTERS = json.load(f)
with open('queries.json', 'r') as f:
    QUERIES = json.load(f)

def manual_cosine_similarity(vec1, vec2):
    vec1 = np.array(vec1)
    vec2 = np.array(vec2)
    dot_product = np.dot(vec1, vec2)
    magnitude1 = np.linalg.norm(vec1)
    magnitude2 = np.linalg.norm(vec2)
    if magnitude1 == 0 or magnitude2 == 0:
        return 0
    return dot_product / (magnitude1 * magnitude2)

def get_query_embedding(query_text):
    for q in QUERIES:
        if q["query"] == query_text:
            return q["embedding"]
    raise ValueError(f"Query '{query_text}' not found in queries.json")

@app.get("/query")
def query_characters(q: str = Query(..., description="Query string to find similar characters")):
    # Use precomputed embedding
    query_embedding = get_query_embedding(q)
    similarities = []
    for character in CHARACTERS:
        similarity = manual_cosine_similarity(query_embedding, character['embedding'])
        character_without_embedding = {k: v for k, v in character.items() if k != 'embedding'}
        similarities.append({
            **character_without_embedding,
            'similarity': similarity
        })
    similar_characters = sorted(similarities, key=lambda x: x['similarity'], reverse=True)
    return similar_characters[:5]

# @app.get("/tsne-data")
# def tsne_data(q: str = Query(..., description="Query string for t-SNE visualization")):
#     with open('characters_with_embeddings.json', 'r') as f:
#         characters = json.load(f)
#     names = [char['name'] for char in characters]
#     def format_description(desc, words_per_line=5):
#         words = desc.split()
#         lines = [' '.join(words[i:i+words_per_line]) for i in range(0, len(words), words_per_line)]
#         return '<br>'.join(lines)
#     descriptions = [format_description(char['description']) for char in characters]
#     embeddings = np.array([char['embedding'] for char in characters])
#     # Use precomputed embedding
#     query_embedding = np.array(get_query_embedding(q))
#     all_embeddings = np.vstack([embeddings, query_embedding])
#     tsne = TSNE(n_components=2, random_state=42)
#     all_embeddings_2d = tsne.fit_transform(all_embeddings)
#     points = all_embeddings_2d[:-1].tolist()
#     query_point = all_embeddings_2d[-1].tolist()
#     return {
#         "points": points,
#         "names": names,
#         "descriptions": descriptions,
#         "query_point": query_point,
#         "query_label": q
#     }

# @app.get("/available-queries")
# def available_queries():
#     return [q["query"] for q in QUERIES]

# @app.get("/")
# def health_check():
#     return {"status": "healthy", "message": "Simpsons Character Query API is running"}