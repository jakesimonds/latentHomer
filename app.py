from fastapi import FastAPI, Query
import json
import numpy as np
import ollama
from typing import List 
from fastapi.middleware.cors import CORSMiddleware
from sklearn.manifold import TSNE

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # your React dev server
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Load characters with embeddings once when the app starts
with open('characters_with_embeddings.json', 'r') as f:
    CHARACTERS = json.load(f)

def embed_text(text):
    """Embed a single text using MixedBread embedding model"""
    return ollama.embeddings(model='mxbai-embed-large', prompt=text)['embedding']

def manual_cosine_similarity(vec1, vec2):
    """Calculate cosine similarity manually"""
    # Convert to numpy arrays to ensure numeric operations
    vec1 = np.array(vec1)
    vec2 = np.array(vec2)
    
    # Compute dot product
    dot_product = np.dot(vec1, vec2)
    
    # Compute magnitudes
    magnitude1 = np.linalg.norm(vec1)
    magnitude2 = np.linalg.norm(vec2)
    
    # Avoid division by zero
    if magnitude1 == 0 or magnitude2 == 0:
        return 0
    
    # Calculate cosine similarity
    return dot_product / (magnitude1 * magnitude2)

@app.get("/query")
def query_characters(q: str = Query(..., description="Query string to find similar characters")):
    # Embed the query
    query_embedding = embed_text(q)
    
    # Compute similarities
    similarities = []
    for character in CHARACTERS:
        # Compute cosine similarity between query and character embedding
        similarity = manual_cosine_similarity(query_embedding, character['embedding'])
        
        # Create a new dict without the embedding
        character_without_embedding = {k: v for k, v in character.items() if k != 'embedding'}
        
        similarities.append({
            **character_without_embedding,  # Unpack character properties without embedding
            'similarity': similarity
        })
    
    # Sort characters by similarity in descending order
    similar_characters = sorted(similarities, key=lambda x: x['similarity'], reverse=True)
    
    # Return top 5 most similar characters
    return similar_characters[:5]

@app.get("/tsne-data")
def tsne_data(q: str = Query(..., description="Query string for t-SNE visualization")):
    # Load characters and embeddings
    with open('characters_with_embeddings.json', 'r') as f:
        characters = json.load(f)
    names = [char['name'] for char in characters]
    
    def format_description(desc, words_per_line=5):
        words = desc.split()
        lines = [' '.join(words[i:i+words_per_line]) for i in range(0, len(words), words_per_line)]
        return '<br>'.join(lines)

    descriptions = [format_description(char['description']) for char in characters]
    
    #descriptions = [char['description'] for char in characters]
    embeddings = np.array([char['embedding'] for char in characters])

    # Embed the query
    def embed_text(text):
        return ollama.embeddings(model='mxbai-embed-large', prompt=text)['embedding']
    query_embedding = np.array(embed_text(q))

    # Stack the query embedding with the original embeddings
    all_embeddings = np.vstack([embeddings, query_embedding])

    # Run t-SNE
    tsne = TSNE(n_components=2, random_state=42)
    all_embeddings_2d = tsne.fit_transform(all_embeddings)

    # Split out the results
    points = all_embeddings_2d[:-1].tolist()      # All character points
    query_point = all_embeddings_2d[-1].tolist()  # Query point

    return {
        "points": points,
        "names": names,
        "descriptions": descriptions,
        "query_point": query_point,
        "query_label": q
    }

# Optional: Add a health check route
@app.get("/")
def health_check():
    return {"status": "healthy", "message": "Simpsons Character Query API is running"}