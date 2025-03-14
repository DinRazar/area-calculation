# Вроде рабочая версия, где нет никаких проблем (если есть проблемы откатывайся на предидущую версию)
import rasterio
import sys

def get_elevation_from_geotiff(lat, lng, geotiff_path):
    with rasterio.open(geotiff_path) as src:
        # Получаем границы GeoTIFF файла
        bounds = src.bounds
        
        # Проверяем, попадают ли координаты в границы
        if not (bounds.left <= lng <= bounds.right and bounds.bottom <= lat <= bounds.top):
            # print("Координаты не попадают в область GeoTIFF файла.", file=sys.stderr)
            sys.exit(1)  # Прекращаем выполнение программы
        
        # Преобразование координат в индексы пикселей
        row, col = src.index(lng, lat)  # Используем lng (долгота) и lat (широта)
        
        # Чтение значения высоты
        elevation = src.read(1)[row, col]  # Читаем первый слой
        return elevation

if __name__ == "__main__":
    latitude = float(sys.argv[1])  # Широта
    longitude = float(sys.argv[2])  # Долгота
    
    # Укажите путь к вашему GeoTIFF файлу
    # geotiff_path = 'tiffs/supertiff2.tif'
    geotiff_path = 'tiffs/52.tif'

    try:
        elevation = get_elevation_from_geotiff(latitude, longitude, geotiff_path)
        print(elevation)  # Возвращаем высоту в stdout
    except Exception as e:
        print(f"Ошибка при получении высоты: {e}", file=sys.stderr)

