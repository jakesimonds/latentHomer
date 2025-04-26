import json

def convert_to_filename(character_name):
    # Move this function outside to make it globally accessible
    name = character_name.lower()
    words = name.split()
    return words[0] + ''.join(word.capitalize() for word in words[1:]) + '.webp'

def convert_to_characters_json(input_file, output_file):
    # Read the characters from the text file
    with open(input_file, 'r') as f:
        characters = [line.strip().replace(':', '') for line in f.readlines()]
    
    # Convert to JSON format
    characters_json = [
        {
            "name": character, 
            "description": "", 
            "photo": convert_to_filename(character)
        } 
        for character in characters
    ]
    
    # Write to JSON file
    with open(output_file, 'w') as f:
        json.dump(characters_json, f, indent=2)
    
    print(f"Converted {input_file} to {output_file}")

# Run the conversion
convert_to_characters_json('characters.txt', 'characters.json')