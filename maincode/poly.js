// Переменная для хранения полигона
var drawnPolygon = null;
var polygonLatLngs = []; // Массив для хранения координат

// Добавляем кнопку для отображения меню
document.getElementById('ZoneBtn').addEventListener('click', function() {
    var menu = document.getElementById('zone-menu');
    menu.style.display = menu.style.display === 'none' ? 'block' : 'none'; // Переключаем видимость
});

// Кнопка для рисования полигона
document.getElementById('draw-polygon').addEventListener('click', function() {
    // Очищаем старые данные о полигонах и начинаем новый
    polygonLatLngs = [];

    // Ожидаем кликов по карте
    map.on('click', onMapClickToDrawPolygon);
});

// Обработчик клика по карте для рисования полигона
function onMapClickToDrawPolygon(e) {
    var latlng = e.latlng;

    // Добавляем точку в массив координат
    polygonLatLngs.push(latlng);

    // Если полигон уже существует, обновляем его
    if (drawnPolygon) {
        drawnPolygon.setLatLngs(polygonLatLngs); // Обновляем координаты
    } else {
        // Создаем новый полигон
        drawnPolygon = L.polygon(polygonLatLngs, { color: 'blue' }).addTo(map);
    }
}

// Кнопка для отправки полигона
document.getElementById('send-polygon').addEventListener('click', function() {
    if (drawnPolygon) {
        var coordinates = drawnPolygon.getLatLngs(); // Получаем координаты полигона
        console.log("Отправляем координаты полигона:", coordinates);

        // Логика для отправки данных, например через AJAX
        // fetch('/api/send-polygon', { method: 'POST', body: JSON.stringify(coordinates) });

        alert("Полигон отправлен!");
    } else {
        alert("Нужно сначала нарисовать полигон.");
    }
});

// Кнопка для стирания полигона
document.getElementById('erase-polygon').addEventListener('click', function() {
    if (drawnPolygon) {
        map.removeLayer(drawnPolygon); // Удаляем полигон с карты
        drawnPolygon = null; // Обнуляем переменную
        polygonLatLngs = []; // Очищаем массив координат
        alert("Полигон удален.");
    } else {
        alert("Нет полигона для удаления.");
    }
});