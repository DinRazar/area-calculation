var drawnPolygon = null;
var polygonLatLngs = [];
var isDrawingPolygon = false; // Флаг режима рисования

// Кнопка меню зон
document.getElementById('ZoneBtn').addEventListener('click', function(e) {
    e.stopPropagation(); // Остановить всплытие
    var menu = document.getElementById('zone-menu');
    menu.style.display = menu.style.display === 'none' ? 'block' : 'none';
});

// Кнопка начала рисования
document.getElementById('draw-polygon').addEventListener('click', function(e) {
    e.stopPropagation();
    polygonLatLngs = [];
    isDrawingPolygon = true;

    if (drawnPolygon) {
        map.removeLayer(drawnPolygon);
        drawnPolygon = null;
    }

    map.on('click', onMapClickToDrawPolygon);
});

// Обработчик клика по карте
function onMapClickToDrawPolygon(e) {
    if (!isDrawingPolygon) return;

    var latlng = e.latlng;
    polygonLatLngs.push(latlng);

    if (drawnPolygon) {
        drawnPolygon.setLatLngs(polygonLatLngs);
    } else {
        drawnPolygon = L.polygon(polygonLatLngs, { color: 'blue' }).addTo(map);
    }
}

// Кнопка завершения рисования (или использовать ту же кнопку, что "send")
document.getElementById('send-polygon').addEventListener('click', function(e) {
    e.stopPropagation();

    if (drawnPolygon) {
        var coordinates = drawnPolygon.getLatLngs()[0].map(latlng => ({
            lat: latlng.lat,
            lng: latlng.lng
        }));

        console.log("Отправляем координаты полигона:", coordinates);

        // Отправка на сервер
        fetch('/save-polygon', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ polygon: coordinates })
            })
            .then(response => {
                if (!response.ok) throw new Error('Ошибка при сохранении');
                return response.json();
            })
            .then(data => {
                console.log('Успешно сохранено:', data);
                alert("Полигон отправлен и сохранён!");
            })
            .catch(error => {
                console.error('Ошибка при отправке:', error);
                alert("Ошибка при отправке полигона.");
            });

        isDrawingPolygon = false;
        map.off('click', onMapClickToDrawPolygon);
    } else {
        alert("Нужно сначала нарисовать полигон.");
    }
});


// Кнопка стирания
document.getElementById('erase-polygon').addEventListener('click', function(e) {
    e.stopPropagation();

    if (drawnPolygon) {
        map.removeLayer(drawnPolygon);
        drawnPolygon = null;
        polygonLatLngs = [];
        isDrawingPolygon = false;
        map.off('click', onMapClickToDrawPolygon);
        alert("Полигон удален.");
    } else {
        alert("Нет полигона для удаления.");
    }
});


// Удалить последнюю точку по ПКМ
map.on('contextmenu', function(e) {
    if (!isDrawingPolygon || polygonLatLngs.length === 0) return;

    // Удаляем последнюю точку
    polygonLatLngs.pop();

    // Обновляем полигон или удаляем, если точек нет
    if (polygonLatLngs.length === 0) {
        if (drawnPolygon) {
            map.removeLayer(drawnPolygon);
            drawnPolygon = null;
        }
    } else {
        drawnPolygon.setLatLngs(polygonLatLngs);
    }
});

// Удалить последнюю точку по Shift + ЛКМ
function onMapClickToDrawPolygon(e) {
    if (!isDrawingPolygon) return;

    if (e.originalEvent.shiftKey) {
        if (polygonLatLngs.length === 0) return;

        polygonLatLngs.pop();
        if (polygonLatLngs.length === 0) {
            if (drawnPolygon) {
                map.removeLayer(drawnPolygon);
                drawnPolygon = null;
            }
        } else {
            drawnPolygon.setLatLngs(polygonLatLngs);
        }
        return;
    }

    // Обычное добавление точки
    var latlng = e.latlng;
    polygonLatLngs.push(latlng);

    if (drawnPolygon) {
        drawnPolygon.setLatLngs(polygonLatLngs);
    } else {
        drawnPolygon = L.polygon(polygonLatLngs, { color: 'blue' }).addTo(map);
    }
}