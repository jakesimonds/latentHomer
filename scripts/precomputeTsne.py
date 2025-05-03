import json
import numpy as np
from sklearn.manifold import TSNE

# Load data
with open('../characters_with_embeddings.json', 'r') as f:
    characters = json.load(f)
with open('../queries.json', 'r') as f:
    queries = json.load(f)

names = [char['name'] for char in characters]
descriptions = [char['description'] for char in characters]
embeddings = np.array([char['embedding'] for char in characters])

precomputed_tsne = {}

for q in queries:
    query_text = q['query']
    query_embedding = np.array(q['embedding'])
    all_embeddings = np.vstack([embeddings, query_embedding])
    tsne = TSNE(n_components=2, random_state=42)
    all_embeddings_2d = tsne.fit_transform(all_embeddings)
    points = all_embeddings_2d[:-1].tolist()
    query_point = all_embeddings_2d[-1].tolist()
    precomputed_tsne[query_text] = {
        "points": points,
        "names": names,
        "descriptions": descriptions,
        "query_point": query_point,
        "query_label": query_text
    }
    print(f"Precomputed t-SNE for query: {query_text}")

with open('tsne_precomputed.json', 'w') as f:
    json.dump(precomputed_tsne, f, indent=2)

print("Saved all precomputed t-SNE results to tsne_precomputed.json")