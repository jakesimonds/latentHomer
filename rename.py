import os
import re

def convert_to_filename(character_name):
    # Remove the colon, convert to lowercase, replace spaces with camelCase
    name = character_name.replace(':', '').lower()
    # Split the name and convert to camelCase
    words = name.split()
    return words[0] + ''.join(word.capitalize() for word in words[1:]) + '.webp'

def rename_photos(photos_dir):
    # Get list of photo files
    photos = [f for f in os.listdir(photos_dir) if f.endswith('.webp')]
    
    # Sort photos by number
    photos.sort(key=lambda x: int(x.split('.')[0]))
    
    # Read characters
    with open('characters.txt', 'r') as f:
        characters = [line.strip() for line in f.readlines()]
    
    # Rename photos
    for i, photo in enumerate(photos):
        if i < len(characters):
            new_name = convert_to_filename(characters[i])
            old_path = os.path.join(photos_dir, photo)
            new_path = os.path.join(photos_dir, new_name)
            os.rename(old_path, new_path)
            print(f'Renamed {photo} to {new_name}')

# Run the script in the photos directory
rename_photos('/Users/jakesimonds/Documents/LatentHomer/photos')