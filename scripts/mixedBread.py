import ollama
import numpy as np
from sklearn.metrics.pairwise import cosine_similarity

def embed_text(text):
    """Embed a single text using MixedBread embedding model"""
    return ollama.embeddings(model='mxbai-embed-large', prompt=text)['embedding']

def main():
    # Create a library of embeddings
    # 3 negative examples, 1 positive example related to the query
    library = [
        "I hate programming and find it very difficult",
        "Coding is boring and makes me frustrated",
        "a;ldsfja;dlfajf;sl",
        "Software development is too complex for me",
        "I love solving problems through programming"  # Positive example
    ]
    
    # Query to match
    query = "Enjoying programming and solving challenges"
    
    # Embed the library texts and the query
    library_embeddings = [embed_text(text) for text in library]
    query_embedding = embed_text(query)
    
    # Compute cosine similarities
    similarities = [
        cosine_similarity([query_embedding], [lib_emb])[0][0] 
        for lib_emb in library_embeddings
    ]
    
    # Print results
    print("Library Texts:")
    for text, similarity in zip(library, similarities):
        print(f"'{text}' - Similarity: {similarity:.4f}")
    
    # Find the most similar text
    most_similar_index = np.argmax(similarities)
    print("\nMost Similar Text:")
    print(f"'{library[most_similar_index]}' (Similarity: {similarities[most_similar_index]:.4f})")

if __name__ == "__main__":
    main()