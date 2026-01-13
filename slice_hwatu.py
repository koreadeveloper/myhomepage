import os
from PIL import Image

def slice_hwatu(image_path, output_dir):
    if not os.path.exists(output_dir):
        os.makedirs(output_dir)

    try:
        img = Image.open(image_path)
        width, height = img.size
        print(f"Image size: {width}x{height}")

        rows = 6
        cols = 8
        
        # Calculate cell size
        cell_width = width / cols
        cell_height = height / rows
        
        print(f"Cell size: {cell_width}x{cell_height}")

        for row in range(rows):
            for col in range(cols):
                # Calculate coordinates
                left = col * cell_width
                upper = row * cell_height
                right = left + cell_width
                lower = upper + cell_height
                
                # Crop
                # Add a small margin crop to avoid border lines if necessary (e.g. 5px inner)
                # Let's try exact slice first
                card_img = img.crop((left, upper, right, lower))
                
                # Determine Month and Index
                # Row 0: Jan (0-3), Feb (4-7)
                # Row 1: Mar (0-3), Apr (4-7)
                # ...
                month_idx_in_row = col // 4 # 0 or 1
                month = (row * 2) + month_idx_in_row + 1
                
                card_idx = (col % 4) + 1 # 1, 2, 3, 4
                
                filename = f"hwatu_s_{month}_{card_idx}.png"
                save_path = os.path.join(output_dir, filename)
                
                card_img.save(save_path)
                print(f"Saved {filename}")

    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    image_path = r"C:/Users/inkyu/.gemini/antigravity/brain/9de1fcf3-a392-4c69-b784-4ad4802aef64/uploaded_image_1768311189612.jpg"
    output_dir = r"c:/Users/inkyu/AndroidStudioProjects/myhomepage/public/hwatu"
    slice_hwatu(image_path, output_dir)
