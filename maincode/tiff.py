# import rasterio

# def get_elevation(tiff_file, x, y):
#     with rasterio.open(tiff_file) as src:
#         # Преобразуем координаты в индексы пикселей
#         row, col = src.index(x, y)
        
#         # Читаем значение высоты из TIFF
#         elevation = src.read(1)[row, col]
        
#         return elevation

# # Путь к вашему TIFF-файлу
# tiff_file = 'tiff/globalTiff.tif'

# # Запрашив55.аем координаты у пользователя
# x_coord = float(input("Введите координату X: "))
# y_coord = float(input("Введите координату Y: "))

# # Получаем высоту
# try:
#     elevation = get_elevation(tiff_file, x_coord, y_coord)
#     print(f'Высота на координатах ({x_coord}, {y_coord}): {elevation}')
# except Exception as e:
#     print(f'Произошла ошибка: {e}')



import sys
import rasterio

def get_elevation(lat, lon):
    # Путь к вашему GeoTIFF файлу
    geotiff_file = 'tiff/globalTiff.tif'

    with rasterio.open(geotiff_file) as src:
        row, col = src.index(lon, lat)  # Используем долготу и широту
        height = src.read(1)[row, col]  # Читаем значение высоты из первого слоя
    return height

if __name__ == '__main__':
    latitude = float(sys.argv[1])
    longitude = float(sys.argv[2])
    elevation = get_elevation(latitude, longitude)
    print(elevation)  # Выводим высоту в stdout

