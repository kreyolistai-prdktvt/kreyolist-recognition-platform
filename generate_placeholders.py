import os
import sys

# Define the 56 images for all 14 remaining venues (Savvor Boston is preserved)
image_definitions = [
    # 1. The Obsidian Room (obsidian-ny)
    {
        "filename": "obsidian_jazz.jpg",
        "title": "Obsidian Jazz",
        "start_color": (24, 24, 28),
        "end_color": (59, 43, 31)
    },
    {
        "filename": "obsidian_tasting.jpg",
        "title": "Blind Tasting",
        "start_color": (18, 18, 18),
        "end_color": (64, 43, 23)
    },
    {
        "filename": "obsidian_skyline.jpg",
        "title": "Obsidian Skyline",
        "start_color": (20, 24, 31),
        "end_color": (48, 41, 36)
    },
    {
        "filename": "obsidian_lounge.jpg",
        "title": "Obsidian Lounge",
        "start_color": (24, 20, 20),
        "end_color": (51, 38, 32)
    },
    # 2. The Hearthstone Atelier (hearthstone-chicago)
    {
        "filename": "hearthstone_glass.jpg",
        "title": "Hearthstone Glass",
        "start_color": (20, 20, 20),
        "end_color": (82, 47, 23)
    },
    {
        "filename": "hearthstone_gastronomy.jpg",
        "title": "Molecular Gastronomy",
        "start_color": (28, 28, 28),
        "end_color": (51, 46, 41)
    },
    {
        "filename": "hearthstone_skyline.jpg",
        "title": "Chicago Skyline",
        "start_color": (25, 28, 36),
        "end_color": (56, 44, 38)
    },
    {
        "filename": "hearthstone_interior.jpg",
        "title": "Hearthstone Interior",
        "start_color": (36, 31, 28),
        "end_color": (61, 49, 38)
    },
    # 3. Elysium Audio Salon (elysium-la)
    {
        "filename": "elysium_vinyl.jpg",
        "title": "Elysium Vinyl",
        "start_color": (20, 20, 20),
        "end_color": (59, 43, 26)
    },
    {
        "filename": "elysium_speaker.jpg",
        "title": "Hi-Fi Speakers",
        "start_color": (38, 31, 26),
        "end_color": (59, 48, 36)
    },
    {
        "filename": "elysium_cocktail.jpg",
        "title": "Audiophile Cocktail",
        "start_color": (24, 22, 20),
        "end_color": (69, 49, 28)
    },
    {
        "filename": "elysium_skyline.jpg",
        "title": "Los Angeles Skyline",
        "start_color": (31, 28, 36),
        "end_color": (74, 52, 38)
    },
    # 4. The Kinetic Studio (kinetic-vegas)
    {
        "filename": "kinetic_simulator.jpg",
        "title": "Racing Simulator",
        "start_color": (18, 18, 18),
        "end_color": (48, 38, 31)
    },
    {
        "filename": "kinetic_telemetry.jpg",
        "title": "Telemetry Analytics",
        "start_color": (15, 20, 24),
        "end_color": (46, 38, 48)
    },
    {
        "filename": "kinetic_champagne.jpg",
        "title": "Champagne Lounge",
        "start_color": (24, 26, 20),
        "end_color": (59, 52, 38)
    },
    {
        "filename": "kinetic_skyline.jpg",
        "title": "Las Vegas Skyline",
        "start_color": (20, 20, 20),
        "end_color": (77, 43, 23)
    },
    # 5. Aether Wellness Canopy (aether-sf)
    {
        "filename": "aether_pool.jpg",
        "title": "Sensory Deprivation Pool",
        "start_color": (20, 24, 31),
        "end_color": (46, 52, 59)
    },
    {
        "filename": "aether_yoga.jpg",
        "title": "Redwood Yoga",
        "start_color": (34, 46, 38),
        "end_color": (56, 59, 51)
    },
    {
        "filename": "aether_tea.jpg",
        "title": "Botanical Tea",
        "start_color": (38, 34, 28),
        "end_color": (59, 51, 41)
    },
    {
        "filename": "aether_forest.jpg",
        "title": "Redwood Forest Canopy",
        "start_color": (28, 36, 31),
        "end_color": (48, 51, 46)
    },
    # 6. Soma Thermal Springs (soma-seattle)
    {
        "filename": "soma_sauna.jpg",
        "title": "Cedar Sauna",
        "start_color": (36, 31, 26),
        "end_color": (77, 49, 28)
    },
    {
        "filename": "soma_plunge.jpg",
        "title": "Mineral Plunge",
        "start_color": (20, 31, 36),
        "end_color": (41, 51, 56)
    },
    {
        "filename": "soma_forest.jpg",
        "title": "Misty Evergreen",
        "start_color": (26, 34, 31),
        "end_color": (46, 51, 48)
    },
    {
        "filename": "soma_firepit.jpg",
        "title": "Relaxation Firepit",
        "start_color": (24, 20, 18),
        "end_color": (77, 46, 23)
    },
    # 7. Komorebi Tea Pavilions (komorebi-portland)
    {
        "filename": "komorebi_matcha.jpg",
        "title": "Komorebi Matcha",
        "start_color": (31, 38, 28),
        "end_color": (54, 59, 48)
    },
    {
        "filename": "komorebi_garden.jpg",
        "title": "Zen Garden",
        "start_color": (38, 41, 43),
        "end_color": (24, 26, 28)
    },
    {
        "filename": "komorebi_tatami.jpg",
        "title": "Tatami Pavilion",
        "start_color": (51, 48, 41),
        "end_color": (34, 38, 36)
    },
    {
        "filename": "komorebi_waterfall.jpg",
        "title": "Bamboo Waterfall",
        "start_color": (31, 38, 38),
        "end_color": (20, 26, 24)
    },
    # 8. Verdant Escape (verdant-atlanta)
    {
        "filename": "verdant_singing_bowls.jpg",
        "title": "Crystal Singing Bowls",
        "start_color": (31, 28, 36),
        "end_color": (59, 46, 38)
    },
    {
        "filename": "verdant_oxygen.jpg",
        "title": "Oxygen Chamber",
        "start_color": (36, 41, 46),
        "end_color": (69, 43, 26)
    },
    {
        "filename": "verdant_juice.jpg",
        "title": "Cold-Pressed Juice",
        "start_color": (34, 46, 31),
        "end_color": (24, 28, 26)
    },
    {
        "filename": "verdant_canopy.jpg",
        "title": "Botanical Canopy",
        "start_color": (41, 48, 36),
        "end_color": (61, 56, 41)
    },
    # 9. Sanctuary of the Wind (sanctuary-wind)
    {
        "filename": "sanctuary_sage.jpg",
        "title": "Sage Smudge",
        "start_color": (41, 38, 36),
        "end_color": (61, 61, 59)
    },
    {
        "filename": "sanctuary_mud.jpg",
        "title": "Adobe Mineral Mud",
        "start_color": (48, 41, 36),
        "end_color": (28, 28, 28)
    },
    {
        "filename": "sanctuary_pergola.jpg",
        "title": "Heated Pergola",
        "start_color": (48, 38, 31),
        "end_color": (61, 48, 38)
    },
    {
        "filename": "sanctuary_cliffs.jpg",
        "title": "Red Rock Cliffs",
        "start_color": (71, 46, 38),
        "end_color": (84, 59, 46)
    },
    # 10. L'Horizon Rooftop Pavilion (horizon-miami)
    {
        "filename": "horizon_yacht.jpg",
        "title": "Teak Yacht Deck",
        "start_color": (56, 46, 38),
        "end_color": (34, 43, 51)
    },
    {
        "filename": "horizon_seafood.jpg",
        "title": "Seafood & Caviar",
        "start_color": (18, 18, 18),
        "end_color": (59, 64, 69)
    },
    {
        "filename": "horizon_sunset.jpg",
        "title": "Miami Skyline",
        "start_color": (71, 48, 38),
        "end_color": (28, 36, 46)
    },
    {
        "filename": "horizon_champagne.jpg",
        "title": "Vintage Champagne",
        "start_color": (66, 59, 46),
        "end_color": (36, 34, 31)
    },
    # 11. The Brass Botanist (brass-denver)
    {
        "filename": "brass_greenhouse.jpg",
        "title": "Glass Greenhouse Table",
        "start_color": (28, 38, 31),
        "end_color": (59, 51, 41)
    },
    {
        "filename": "brass_mixology.jpg",
        "title": "Botanical Mixology",
        "start_color": (36, 31, 28),
        "end_color": (71, 51, 34)
    },
    {
        "filename": "brass_plate.jpg",
        "title": "Floral Gourmet Plate",
        "start_color": (43, 46, 38),
        "end_color": (31, 31, 31)
    },
    {
        "filename": "brass_mountains.jpg",
        "title": "Rocky Mountains Dusk",
        "start_color": (38, 38, 43),
        "end_color": (69, 51, 38)
    },
    # 12. Nox Observatory (nox-phoenix)
    {
        "filename": "nox_telescope.jpg",
        "title": "Stargazing Telescope",
        "start_color": (24, 26, 31),
        "end_color": (48, 48, 51)
    },
    {
        "filename": "nox_campfire.jpg",
        "title": "Open-fire Campfire Grill",
        "start_color": (28, 24, 20),
        "end_color": (82, 46, 23)
    },
    {
        "filename": "nox_dome.jpg",
        "title": "Geodesic Glamping Dome",
        "start_color": (20, 20, 20),
        "end_color": (74, 48, 28)
    },
    {
        "filename": "nox_skyline.jpg",
        "title": "Phoenix Desert Skyline",
        "start_color": (24, 24, 28),
        "end_color": (41, 38, 43)
    },
    # 13. Velvet & Vine (velvet-napa)
    {
        "filename": "velvet_wine_blend.jpg",
        "title": "Wine Bottle Blending",
        "start_color": (34, 28, 26),
        "end_color": (59, 43, 36)
    },
    {
        "filename": "velvet_barrels.jpg",
        "title": "Oak Wine Barrels",
        "start_color": (31, 26, 24),
        "end_color": (59, 46, 34)
    },
    {
        "filename": "velvet_vineyard.jpg",
        "title": "Golden Vineyard Rows",
        "start_color": (59, 54, 43),
        "end_color": (74, 64, 48)
    },
    {
        "filename": "velvet_cellar_dining.jpg",
        "title": "Candlelit Cellar Dining",
        "start_color": (43, 38, 34),
        "end_color": (28, 26, 24)
    },
    # 14. The Gilded Foundry (gilded-austin)
    {
        "filename": "gilded_leather.jpg",
        "title": "Stitching Leather Tools",
        "start_color": (46, 36, 28),
        "end_color": (71, 48, 34)
    },
    {
        "filename": "gilded_whiskey.jpg",
        "title": "Whiskey Single Barrel",
        "start_color": (38, 31, 24),
        "end_color": (74, 48, 23)
    },
    {
        "filename": "gilded_foundry.jpg",
        "title": "Foundry Workshop",
        "start_color": (31, 28, 26),
        "end_color": (56, 43, 34)
    },
    {
        "filename": "gilded_austin.jpg",
        "title": "Austin Texas Skyline",
        "start_color": (34, 31, 38),
        "end_color": (64, 46, 36)
    }
]

def make_bmp_data(width, height, start_rgb, end_rgb):
    """
    Generates a raw 24-bit BMP image as a bytearray without using external libraries.
    Creates an elegant diagonal linear gradient from start_rgb to end_rgb.
    """
    row_padding = (4 - (width * 3) % 4) % 4
    padded_pixel_data_size = (width * 3 + row_padding) * height
    file_size = 54 + padded_pixel_data_size

    # File Header (14 bytes)
    header = bytearray([
        0x42, 0x4D,                         # Signature "BM"
        *file_size.to_bytes(4, 'little'),   # File size
        0x00, 0x00, 0x00, 0x00,             # Reserved
        0x36, 0x00, 0x00, 0x00              # Offset to pixel data (54)
    ])

    # DIB Header (BITMAPINFOHEADER - 40 bytes)
    dib = bytearray([
        0x28, 0x00, 0x00, 0x00,             # DIB Header size (40)
        *width.to_bytes(4, 'little'),       # Width
        *height.to_bytes(4, 'little'),      # Height
        0x01, 0x00,                         # Color planes (1)
        0x18, 0x00,                         # Bits per pixel (24 bit)
        0x00, 0x00, 0x00, 0x00,             # BI_RGB (no compression)
        *padded_pixel_data_size.to_bytes(4, 'little'), # Image size
        0x13, 0x0B, 0x00, 0x00,             # Horizontal resolution (2835 px/m)
        0x13, 0x0B, 0x00, 0x00,             # Vertical resolution (2835 px/m)
        0x00, 0x00, 0x00, 0x00,             # Colors in palette (0)
        0x00, 0x00, 0x00, 0x00              # Important colors (0)
    ])

    # Pixel data (bottom to top, left to right)
    pixels = bytearray()
    for y in range(height):
        row = bytearray()
        for x in range(width):
            # Calculate diagonal gradient factor
            factor = (x / (width - 1) + (height - 1 - y) / (height - 1)) / 2.0 if (width > 1 and height > 1) else 0.5
            
            # Interpolate BGR colors
            r = int(start_rgb[0] + (end_rgb[0] - start_rgb[0]) * factor)
            g = int(start_rgb[1] + (end_rgb[1] - start_rgb[1]) * factor)
            b = int(start_rgb[2] + (end_rgb[2] - start_rgb[2]) * factor)
            
            row.append(b)
            row.append(g)
            row.append(r)
        
        row.extend([0] * row_padding)
        pixels.extend(row)

    return header + dib + pixels

def generate_images(assets_dir):
    os.makedirs(assets_dir, exist_ok=True)
    
    print(f"Generating 56 luxury desaturated lifestyle gradient images in '{assets_dir}'...")

    for index, img_def in enumerate(image_definitions, 1):
        target_path = os.path.join(assets_dir, img_def["filename"])
        try:
            bmp_data = make_bmp_data(
                width=512, 
                height=512, 
                start_rgb=img_def["start_color"], 
                end_rgb=img_def["end_color"]
            )
            with open(target_path, "wb") as f:
                f.write(bmp_data)
            print(f"[{index}/56] Generated placeholder: {img_def['filename']}")
        except Exception as e:
            print(f"Failed to generate placeholder for {img_def['filename']}: {e}")

if __name__ == "__main__":
    assets_path = "/Users/donaldysalvant/Documents/KreyoList Exp/assets/"
    if len(sys.argv) > 1:
        assets_path = sys.argv[1]
    generate_images(assets_path)
    print("All lifestyle image assets successfully generated.")
