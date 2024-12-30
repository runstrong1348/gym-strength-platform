import sys
import os
from PIL import Image
import glob
from pathlib import Path

def create_gif_from_frames(input_dir, output_file, duration=100):
    """
    Create a GIF from a sequence of PNG/JPG frames
    input_dir: Directory containing the frames
    output_file: Path to save the GIF
    duration: Duration for each frame in milliseconds
    """
    # Get all image files in the directory
    frames = []
    image_files = sorted(glob.glob(os.path.join(input_dir, "*.png"))) + \
                 sorted(glob.glob(os.path.join(input_dir, "*.jpg")))
    
    if not image_files:
        print(f"No image files found in {input_dir}")
        return False

    # Open and process each frame
    for frame_file in image_files:
        frame = Image.open(frame_file)
        # Resize if needed (adjust size as needed)
        frame = frame.resize((480, 480), Image.Resampling.LANCZOS)
        frames.append(frame)

    # Save the GIF
    frames[0].save(
        output_file,
        save_all=True,
        append_images=frames[1:],
        duration=duration,
        loop=0,
        optimize=True
    )
    
    print(f"Created GIF: {output_file}")
    return True

def main():
    if len(sys.argv) < 3:
        print("Usage: python process-animation.py <input_directory> <output_name>")
        print("Example: python process-animation.py ./leg-swings-frames leg-swings.gif")
        return

    input_dir = sys.argv[1]
    output_name = sys.argv[2]
    
    # Ensure input directory exists
    if not os.path.isdir(input_dir):
        print(f"Input directory does not exist: {input_dir}")
        return

    # Create output directory if it doesn't exist
    output_dir = Path("../public/exercise-demos")
    output_dir.mkdir(parents=True, exist_ok=True)
    
    # Create the GIF
    output_file = output_dir / output_name
    if create_gif_from_frames(input_dir, output_file):
        print("Animation processing complete!")
    else:
        print("Failed to create animation.")

if __name__ == "__main__":
    main()
