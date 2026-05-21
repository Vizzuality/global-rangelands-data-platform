"""
Module for creating animated tiles from Cloud Optimized GeoTIFFs (COGs)
"""

import io
import os
import re
from multiprocessing import Pool
from pathlib import Path

import mercantile
import numpy as np
import rasterio
from apng import APNG
from PIL import Image
from rio_tiler.colormap import ColorMapType
from rio_tiler.errors import TileOutsideBounds
from rio_tiler.io import Reader
from tqdm import tqdm


class AnimatedTiles:
    """
    Class for creating animated tiles.
    """

    TILE_SIZE = 256

    def __init__(
        self,
        input_folder: Path,
        output_folder: Path,
        min_z: int = 0,
        max_z: int = 12,
        color_map: ColorMapType | None = None,
        vmin: float = 0,
        vmax: float = 30000,
    ):
        """
        Initialize the AnimatedTiles class.

        Attributes:
        input_folder (str): The name of the local folder where the GeoTIFF files will be located.
        output_folder (str): The name of the local folder where the animated tiles will be exported.
        min_zz (int, optional): The min_zmum zoom level. Defaults to 0.
        max_z (int, optional): The maximum zoom level. Defaults to 12.
        color_map (dict or sequence, optional): RGBA Color Table dictionary or sequence.
        vmin (float): The minimum value for rescaling the data.
        vmax (float): The maximum value for rescaling the data.
        """
        self.input_folder = input_folder
        self.output_folder = output_folder
        self.min_z = min_z
        self.max_z = max_z
        self.zooms = list(np.arange(min_z, max_z + 1))
        self.color_map = color_map
        self.vmin = vmin
        self.vmax = vmax

    def _get_files_with_years(self):
        """
        Get a list of all files in the directory sorted by year.

        Returns:
        list: A list of tuples, where each tuple contains the filename and the year.
        """
        # Get a list of all files in the directory
        files = os.listdir(self.input_folder)
        # Create a list of tuples, where each tuple contains the filename and the year
        files_with_years = [
            (f, int(re.search(r"(\d{4})\.tif$", f).group(1)))
            for f in files
            if re.search(r"(\d{4})\.tif$", f)
        ]
        # Sort the list of tuples based on the year
        sorted_files = sorted(files_with_years, key=lambda x: x[1])
        return sorted_files

    def _create_tile(
        self,
        tile: mercantile.Tile = None,
        tif_file_path: str = None,
        n: int = 0,
        num_bands: int = 4,
        indexes: tuple[int] | None = (1, 2, 3, 4),
        colormap: ColorMapType | None = None,
    ):
        """
        Generate a PNG tile from a GeoTIFF file using rio-tiler.

        Args:
            tile (mercantile.Tile): A mercantile tile object.
            tif_file_path (str): The file path to the GeoTIFF file.
            n (int): The index of the GeoTIFF file in the list of files.
            num_bands (int): The number of bands in the GeoTIFF file.
            indexes (int or sequence of int, optional): Band indexes.
            colormap (dict or sequence, optional): RGBA Color Table dictionary or sequence.
            vmin (float): The minimum value for rescaling the data.
            vmax (float): The maximum value for rescaling the data.
        """
        try:
            with Reader(tif_file_path) as dst:
                # Get the tile data and mask
                img = dst.tile(tile.x, tile.y, tile.z, indexes=indexes, tilesize=self.TILE_SIZE)
                # Convert the data to an image
                if num_bands == 1:
                    # Rescale the data linearly from 0-10000 to 0-255
                    img.rescale(in_range=((self.vmin, self.vmax),), out_range=((0, 255),))
                    # Apply colormap and create a PNG buffer
                    buff = img.render(colormap=colormap, add_mask=True)
                    # Open the image from the buffer
                    image = Image.open(io.BytesIO(buff))
                else:
                    image = Image.fromarray(np.uint8(np.transpose(img.data, (1, 2, 0))))

                # Save the image as a PNG
                number = "{:03d}".format(n)
                tile_dir = os.path.join(self.output_folder, str(tile.z), str(tile.x))
                tile_file = os.path.join(tile_dir, f"{tile.y}_{number}.png")
                os.makedirs(tile_dir, exist_ok=True)
                image.save(tile_file, "PNG")
        except TileOutsideBounds:
            pass
        except Exception as e:
            print(f"An error occurred while generating tiles: {e}")

    def _process_tile_pool(self, tile):
        return self._create_tile(
            tile,
            tif_file_path=self.tif_file_path,
            n=self.n,
            num_bands=self.num_bands,
            indexes=self.indexes,
            colormap=self.color_map,
        )

    def _generate_tiles(self, sorted_files: list):
        """
        Generate tiles for a GeoTIFF file.

        Args:
            sorted_file (tuple): A tuple containing the filename and the year.
            n (int): The index of the GeoTIFF file in the list of files.

        Returns:
            str: The name of the local folder where the tiles are located.
        """
        for self.n, sorted_file in tqdm(enumerate(sorted_files)):
            # Get the GeoTIFF file
            tif_file = sorted_file[0]
            self.tif_file_path = os.path.join(self.input_folder, tif_file)

            if self.n == 0:
                # Open the GeoTIFF file
                with rasterio.open(self.tif_file_path) as src:
                    # Get the bounding box
                    bbox = list(src.bounds)
                    # Get the count of bands
                    self.num_bands = src.count

                # Calculate the tiles within the bounding box at the given zoom level
                self.tiles = list(
                    mercantile.tiles(bbox[0], bbox[1], bbox[2], bbox[3], zooms=self.zooms)
                )

                # Set the indexes parameter based on the number of bands
                self.indexes = (1, 2, 3, 4) if self.num_bands == 4 else None

            # Create a Pool
            with Pool() as p:
                # Use the pool to map the function to the data
                p.map(self._process_tile_pool, self.tiles)

    def _create_apngs(self):
        """
        Create APNGs from the tiles.
        """
        tile_dir = self.output_folder
        for z_dir in os.listdir(tile_dir):
            for x_dir in os.listdir(os.path.join(tile_dir, z_dir)):
                file_names = os.listdir(os.path.join(tile_dir, z_dir, x_dir))

                tiles = [x.split("_")[0] for x in file_names]
                tiles = list(set(tiles))
                for tile in tiles:
                    png_files = list(filter(lambda x: x.split("_")[0] == tile, file_names))
                    png_files = sorted(png_files, key=lambda x: float(x.split(".")[0]))
                    png_files = [os.path.join(tile_dir, z_dir, x_dir, i) for i in png_files]
                    # Create APNG
                    APNG.from_files(png_files, delay=1).save(png_files[0][:-8] + ".png")
                    # Remove PNGs
                    [os.remove(file) for file in png_files]

    def create(self):
        """
        Create animated-tiles.
        """
        # Get a list of all files in the directory sorted by year
        sorted_files = self._get_files_with_years()
        # Create Tiles
        print("Creating tiles ...")
        self._generate_tiles(sorted_files)
        # Create APNGs
        print("Creating APNGs")
        self._create_apngs()
