import json
import ollama

def embed_text(text):
    """Embed a single text using MixedBread embedding model"""
    return ollama.embeddings(model='mxbai-embed-large', prompt=text)['embedding']

def generate_character_embeddings(input_file, output_file):
    # Read the characters JSON
    with open(input_file, 'r') as f:
        characters = json.load(f)
    
    # Generate embeddings for each character
    for character in characters:
        # Combine name and description for embedding
        text_to_embed = f"{character['name']} {character['description']}"
        
        # Generate embedding
        embedding = embed_text(text_to_embed)
        
        # Add embedding to character
        character['embedding'] = embedding
    
    # Write updated characters to new JSON file
    with open(output_file, 'w') as f:
        json.dump(characters, f, indent=2)
    
    print(f"Generated embeddings and saved to {output_file}")

# Run the script
generate_character_embeddings('../characters.json', '../characters_with_embeddings.json')