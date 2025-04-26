import json
import numpy as np
import ollama
from sklearn.metrics.pairwise import cosine_similarity

def embed_text(text):
    """Embed a single text using MixedBread embedding model"""
    return ollama.embeddings(model='mxbai-embed-large', prompt=text)['embedding']

def find_similar_characters(embeddings_file, query):
    # Read the characters with embeddings
    with open(embeddings_file, 'r') as f:
        characters = json.load(f)
    
    # Embed the query
    query_embedding = embed_text(query)
    
    # Compute similarities
    similarities = []
    for character in characters:
        # Compute cosine similarity between query and character embedding
        similarity = cosine_similarity([query_embedding], [character['embedding']])[0][0]
        similarities.append({
            'name': character['name'],
            'similarity': similarity,
            'description': character['description']
        })
    
    # Sort characters by similarity in descending order
    similar_characters = sorted(similarities, key=lambda x: x['similarity'], reverse=True)
    
    # Print top 5 most similar characters
    print(f"Query: {query}\n")
    print("Top 5 Most Similar Characters:")
    for i, char in enumerate(similar_characters[:5], 1):
        print(f"{i}. {char['name']} (Similarity: {char['similarity']:.4f})")
        print(f"   Description: {char['description']}\n")

# Hardcoded query to find similar characters
query = "old man"

# Run the similarity search
find_similar_characters('../characters_with_embeddings.json', query)