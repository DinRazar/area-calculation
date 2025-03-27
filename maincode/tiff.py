import sys
import rasterio

def get_elevation(lat, lon):
    geotiff_file = 'tiff/globalTiff.tif'

    with rasterio.open(geotiff_file) as src:
        row, col = src.index(lon, lat)  
        height = src.read(1)[row, col]
    return height

if __name__ == '__main__':
    latitude = float(sys.argv[1])
    longitude = float(sys.argv[2])
    elevation = get_elevation(latitude, longitude)
    print(elevation)  

