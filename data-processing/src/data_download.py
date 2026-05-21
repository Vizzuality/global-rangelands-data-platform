"""
Utility functions to download data from the internet.
"""

import os
import re
import zipfile

import requests
from bs4 import BeautifulSoup
from tqdm import tqdm
import rasterio
from rio_cogeo.cogeo import cog_translate
from rio_cogeo.profiles import cog_profiles

try:
    from osgeo import gdal
except ImportError:
    gdal = None


def download_and_unzip(url, directory):
    """
    Download a zip file from a URL and unzip it to a directory.
    """
    # Download the file
    response = requests.get(url)
    zip_file_name = os.path.basename(url)
    zip_file_path = os.path.join(directory, zip_file_name)
    with open(zip_file_path, "wb") as file:
        file.write(response.content)

    # Create a new directory for the unzipped files
    unzip_dir = os.path.join(directory, os.path.splitext(zip_file_name)[0])
    os.makedirs(unzip_dir, exist_ok=True)

    # Unzip the file
    with zipfile.ZipFile(zip_file_path, "r") as zip_ref:
        zip_ref.extractall(unzip_dir)

    # Remove the zip file
    os.remove(zip_file_path)


def unzip_file(zip_file_path):
    """
    Unzip a file to a directory.

    Parameters
    ----------
    zip_file_path : str
        The path to the zip file to unzip.
    """
    # Create a new directory for the unzipped files
    unzip_dir = os.path.splitext(zip_file_path)[0]
    os.makedirs(unzip_dir, exist_ok=True)

    # Unzip the file
    with zipfile.ZipFile(zip_file_path, "r") as zip_ref:
        zip_ref.extractall(unzip_dir)


def get_links(url):
    """
    Send a GET request to the provided URL and parse the HTML content to find all the links.

    Args:
        url (str): The URL to send the GET request to.

    Returns:
        list: A list of all links found on the page.
    """
    # Send a GET request
    response = requests.get(url)

    # Parse the HTML content
    soup = BeautifulSoup(response.text, "html.parser")

    # Find all the links
    links = soup.find_all("a")

    return links


class HDFProcessor:
    """
    A class to download, process and convert MODIS HDF files to COGs.

    Attributes:
        base_url (str): The base URL of the Data Pool FTP server.
        base_path (str): The base path to save the processed files.
        usr (str): The username to authenticate with the FTP server.
        pwd (str): The password to authenticate with the FTP server.
        subdataset_name (str): The name of the subdataset to extract from the HDF files.
        dataset_name (str): The name of the dataset to process.

    Methods:
        get_hdf_links(folder): Get a list of all .hdf
        download_hdf_files(folder, hdf_list): Download all .hdf files in the provided list.
        process_hdf_files(hdf_files, vrt_file_path, cog_file_path): Process the .hdf files and
            convert them to COGs.
        convert_hdf_files_to_cog(folder): Convert all .hdf files in the provided folder to a COG.
    """

    def __init__(self, base_url, base_path, usr, pwd, subdataset_name, dataset_name):
        """
        Initialize the HDFProcessor class with the provided base URL, base path, username and
        password.
        """
        self.base_url = base_url
        self.base_path = base_path
        self.usr = usr
        self.pwd = pwd
        self.subdataset_name = subdataset_name
        self.dataset_name = dataset_name

    def get_hdf_links(self, folder):
        """
        Get a list of all .hdf files in the provided folder.
        """
        url = self.base_url + "/" + folder
        links = get_links(url)
        return [link.get("href") for link in links if link.get("href").endswith(".hdf")]

    def download_hdf_files(self, folder, hdf_list):
        """
        Download all .hdf files in the provided list.
        """
        # Create a new directory for the downloaded files
        output_path = os.path.join(self.base_path, folder)
        os.makedirs(output_path, exist_ok=True)
        print("Downloading .hdf files from " + folder)

        # Download the HDF files
        for hdf_file in tqdm(hdf_list):
            # Get the file URL and name
            file_url = self.base_url + "/" + folder + hdf_file
            file_name = file_url.split("/")[-1].strip()
            output_file = os.path.join(output_path, file_name)

            # Skip the download if the file already exists
            if os.path.exists(output_file):
                print(f"File {output_file} already exists. Skipping download.")
                continue

            # Download the file
            response = requests.get(file_url, verify=True, stream=True, auth=(self.usr, self.pwd))

            if response.status_code == 200:
                with open(output_file, "wb") as file:
                    file.write(response.content)
            else:
                print(f"Failed to download the file. HTTP Status Code: {response.status_code}")

        return [os.path.join(output_path, f) for f in os.listdir(output_path) if f.endswith(".hdf")]

    def process_hdf_files(self, hdf_files, vrt_file_path, cog_file_path):
        """
        Process the .hdf files and convert them to COGs.
        """
        # Get a list of subdatasets from the HDF files
        hdf_files_subdatasets = []
        for hdf_file in hdf_files:
            dataset = gdal.Open(hdf_file)
            info = gdal.Info(dataset)
            match = re.search(rf"{self.subdataset_name}=(.*)", info)

            if match:
                subdataset_name = match.group(1)
                hdf_files_subdatasets.append(subdataset_name)

        # Build a VRT file from the HDF subdatasets
        vrt_file = gdal.BuildVRT(vrt_file_path, hdf_files_subdatasets)
        vrt_file.FlushCache()

        # Reproject the VRT file to EPSG:3857
        reprojected_vrt_file = gdal.Warp(vrt_file_path, vrt_file, dstSRS="EPSG:3857")
        reprojected_vrt_file.FlushCache()

        # Convert the VRT file to a COG
        gdal.Translate(
            cog_file_path, reprojected_vrt_file, format="COG", creationOptions=["COMPRESS=DEFLATE"]
        )

        # Remove the VRT file
        os.remove(vrt_file_path)

    def convert_hdf_files_to_cog(self, folder):
        """
        Process all .hdf files in the provided folder.
        """
        year = folder.split("/")[0].split(".")[0]
        vrt_file_path = os.path.join(self.base_path, f"{self.dataset_name}_{year}.vrt")
        cog_file_path = os.path.join(self.base_path, f"{self.dataset_name}_cog_{year}.tif")

        # Get a list of all .hdf files in the folder
        hdf_list = self.get_hdf_links(folder)
        # Download the .hdf files
        hdf_files = self.download_hdf_files(folder, hdf_list)
        # Convert the .hdf files to a COG
        print("Converting .hdf files to a COG")
        self.process_hdf_files(hdf_files, vrt_file_path, cog_file_path)
        ## Remove the .hdf files
        # print("Removing .hdf files")
        # output_path = os.path.join(self.base_path, folder)
        # os.system(f"rm -r {output_path}")


class AnthropogenicBioms(requests.Session):
    """
    A class to download and process the Anthropogenic Biomes dataset.

    Attributes:
        AUTH_HOST (str): The hostname of the Earthdata Login authentication server.
        auth (tuple): The username and password to authenticate with the Earthdata Login server.
    """

    AUTH_HOST = "urs.earthdata.nasa.gov"

    def __init__(self, username, password):
        """
        Initialize the AnthropogenicBioms class with the provided username and password.
        """
        super().__init__()
        self.auth = (username, password)

    def rebuild_auth(self, prepared_request, response):
        """
        Rebuild the authentication to handle redirects.
        """
        headers = prepared_request.headers
        url = prepared_request.url
        if "Authorization" in headers:
            original_parsed = requests.utils.urlparse(response.request.url)
            redirect_parsed = requests.utils.urlparse(url)
            if (
                (original_parsed.hostname != redirect_parsed.hostname)
                and redirect_parsed.hostname != self.AUTH_HOST
                and original_parsed.hostname != self.AUTH_HOST
            ):
                del headers["Authorization"]

    def download_file(self, url, target_path):
        """
        Download a file from a URL and save it to a target path.
        """
        filename = os.path.basename(url)
        full_path = os.path.join(target_path, filename)
        try:
            response = self.get(url, stream=True)
            print(f"Status code: {response.status_code}")
            response.raise_for_status()
            with open(full_path, "wb") as fd:
                for chunk in response.iter_content(chunk_size=1024 * 1024):
                    fd.write(chunk)
            print(f"Downloaded {full_path}")
        except requests.exceptions.HTTPError as e:
            print(e)
            raise e
        return full_path

    def unzip_file(self, zip_path, extract_to=None):
        """
        Unzip a file to a directory.
        """
        # Determine the folder where to extract the contents
        if extract_to is None:
            extract_to = os.path.dirname(zip_path)

        # Define the new directory where you want to store the unzipped files
        target_directory = os.path.join(extract_to, "anthropogenic_biomes")

        # Check if the directory exists, if not create it
        os.makedirs(target_directory, exist_ok=True)

        # Extract the files into the newly created directory
        with zipfile.ZipFile(zip_path, "r") as zip_ref:
            zip_ref.extractall(target_directory)
            print(f"Extracted {zip_path} to {target_directory}")

    # After unzipping, convert all TIFF files to COG
        for root, dirs, files in os.walk(target_directory):
            for file in files:
                if file.endswith(".tif"):
                    input_tif_path = os.path.join(root, file)
                    output_cog_path = os.path.join(root, file.replace(".tif", "_cog.tif"))
                    self.convert_to_cog(input_tif_path, output_cog_path)

    def convert_to_cog(self, input_path, output_path):
        """
        Convert a TIFF file to a Cloud Optimized GeoTIFF (COG).
        """
        profile = cog_profiles.get("deflate")
        cog_translate(input_path, output_path, profile, in_memory=True)
        print(f"Converted {input_path} to COG at {output_path}")