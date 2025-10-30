// Инициализация карты
const map = L.map('map').setView([55.7558, 37.6173], 5);

// отключение флага, что?
map.attributionControl.setPrefix(false)

// CartoDB слой для предпросмотра
L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png', {
    // attribution: '© OpenStreetMap contributors, © CartoDB',
    maxZoom: 18,
    subdomains: ['a', 'b', 'c', 'd']
}).addTo(map);

// Переменные для управления выделением
let drawControl;
let currentRectangle = null;

// Функция для включения режима рисования
function enableDrawing() {
    // Отключаем предыдущий контроль если есть
    if (drawControl) {
        map.removeControl(drawControl);
    }

    // Создаем контроль для рисования прямоугольников
    drawControl = new L.Control.Draw({
        draw: {
            polygon: false,
            polyline: false,
            rectangle: {
                shapeOptions: {
                    color: '#ff0000',
                    weight: 3,
                    fillOpacity: 0.2
                }
            },
            circle: false,
            circlemarker: false,
            marker: false
        },
        edit: false
    });

    map.addControl(drawControl);

    // Включаем рисование прямоугольников
    const rectangleDrawer = new L.Draw.Rectangle(map, {
        shapeOptions: {
            color: '#ff0000',
            weight: 3,
            fillOpacity: 0.2
        }
    });

    rectangleDrawer.enable();

    updateStatus('Режим выделения активен: кликните на карте и протяните мышью чтобы нарисовать прямоугольник', 'info');

    // Слушаем завершение рисования
    map.once('draw:created', function(e) {
        const layer = e.layer;

        // Убираем предыдущее выделение если есть
        if (currentRectangle) {
            map.removeLayer(currentRectangle);
        }

        // Добавляем новое выделение на карту
        currentRectangle = layer;
        map.addLayer(layer);

        // Активируем кнопку скачивания
        document.getElementById('downloadTilesBtn').disabled = false;

        updateStatus('Область выделена! Выберите уровни и нажмите "Скачать тайлы".', 'success');
        updateTileInfo();

        // Убираем контроль рисования
        map.removeControl(drawControl);
        drawControl = null;
    });
}

// Функция для расчета площади в км²
function calculateArea(bounds) {
    const latDiff = bounds.getNorth() - bounds.getSouth();
    const lngDiff = bounds.getEast() - bounds.getWest();

    const latKm = latDiff * 111.32;
    const lngKm = lngDiff * 111.32 * Math.cos((bounds.getNorth() + bounds.getSouth()) / 2 * Math.PI / 180);

    return Math.abs(latKm * lngKm);
}

// Функция для расчета количества тайлов для одного уровня
function calculateTilesForLevel(bounds, zoom) {
    const topLeft = latLngToTile(bounds.getNorth(), bounds.getWest(), zoom);
    const bottomRight = latLngToTile(bounds.getSouth(), bounds.getEast(), zoom);

    const xMin = Math.min(topLeft.x, bottomRight.x);
    const xMax = Math.max(topLeft.x, bottomRight.x);
    const yMin = Math.min(topLeft.y, bottomRight.y);
    const yMax = Math.max(topLeft.y, bottomRight.y);

    return (xMax - xMin + 1) * (yMax - yMin + 1);
}

// Функция для расчета общего количества тайлов для выбранных уровней
function calculateTotalTiles(bounds) {
    const selectedLevels = getSelectedLevels();
    let totalTiles = 0;

    selectedLevels.forEach(zoom => {
        totalTiles += calculateTilesForLevel(bounds, zoom);
    });

    return totalTiles;
}

// Функция получения выбранных уровней
function getSelectedLevels() {
    const select = document.getElementById('zoomLevels');
    const selectedOptions = Array.from(select.selectedOptions);
    return selectedOptions.map(option => parseInt(option.value));
}

// Функция обновления информации о тайлах
function updateTileInfo() {
    const tileInfoEl = document.getElementById('tileInfo');

    if (currentRectangle) {
        const bounds = currentRectangle.getBounds();
        const selectedLevels = getSelectedLevels();
        const totalTiles = calculateTotalTiles(bounds);
        const area = calculateArea(bounds);

        let infoHTML = `
            <strong>Информация о выделенной области:</strong><br>
            • Источник: <strong>CartoDB</strong><br>
            • Выбранные уровни: ${selectedLevels.join(', ')}<br>
            • Общее количество тайлов: ${totalTiles}<br>
            • Площадь области: ${area.toFixed(2)} км²<br>
            • Примерный размер: ${Math.round(totalTiles * 0.015)} MB<br>
            • Координаты: [${bounds.getSouth().toFixed(4)}, ${bounds.getWest().toFixed(4)}] - [${bounds.getNorth().toFixed(4)}, ${bounds.getEast().toFixed(4)}]<br>
            • Сохранится в: data/Tiles/{уровень}/
        `;

        // Предупреждение для больших областей
        if (totalTiles > 1000) {
            infoHTML += `<br><strong style="color: orange;">⚠ Большая область: ${totalTiles} тайлов. Скачивание может занять несколько минут.</strong>`;
        }

        tileInfoEl.innerHTML = infoHTML;
    } else {
        tileInfoEl.innerHTML = `
            <strong>Информация о скачивании:</strong><br>
            • <strong>Источник: CartoDB</strong><br>
            • Нажмите "Выделить область" и нарисуйте прямоугольник на карте<br>
            • Выберите нужные уровни масштабирования (8-14)<br>
            • Тайлы сохранятся в папку data/Tiles/<br>
            • <strong>Рекомендация:</strong> выделяйте области до 1000 тайлов для быстрого скачивания
        `;
    }
}

// Очистка выделения
document.getElementById('clearSelectionBtn').addEventListener('click', function() {
    if (currentRectangle) {
        map.removeLayer(currentRectangle);
        currentRectangle = null;
    }
    if (drawControl) {
        map.removeControl(drawControl);
        drawControl = null;
    }
    document.getElementById('downloadTilesBtn').disabled = true;
    updateStatus('Выделение очищено. Нажмите "Выделить область" чтобы начать заново.', 'info');
    updateTileInfo();
});

// Выбрать все уровни
document.getElementById('selectAllLevels').addEventListener('click', function() {
    const select = document.getElementById('zoomLevels');
    for (let i = 0; i < select.options.length; i++) {
        select.options[i].selected = true;
    }
    if (currentRectangle) {
        updateTileInfo();
    }
});

// Очистить выбор уровней
document.getElementById('deselectAllLevels').addEventListener('click', function() {
    const select = document.getElementById('zoomLevels');
    for (let i = 0; i < select.options.length; i++) {
        select.options[i].selected = false;
    }
    document.getElementById('downloadTilesBtn').disabled = true;
    updateStatus('Выберите хотя бы один уровень масштабирования.', 'info');
    if (currentRectangle) {
        updateTileInfo();
    }
});

// Кнопка выделения области
document.getElementById('drawRectBtn').addEventListener('click', function() {
    enableDrawing();
});

// Обновление информации при изменении выбора уровней
document.getElementById('zoomLevels').addEventListener('change', function() {
    const selectedLevels = getSelectedLevels();
    if (selectedLevels.length === 0) {
        document.getElementById('downloadTilesBtn').disabled = true;
        updateStatus('Выберите хотя бы один уровень масштабирования.', 'info');
    } else if (currentRectangle) {
        document.getElementById('downloadTilesBtn').disabled = false;
    }

    if (currentRectangle) {
        updateTileInfo();
    }
});

// Скачивание тайлов
document.getElementById('downloadTilesBtn').addEventListener('click', async function() {
    if (!currentRectangle) {
        updateStatus('Сначала выделите область на карте.', 'error');
        return;
    }

    const selectedLevels = getSelectedLevels();
    if (selectedLevels.length === 0) {
        updateStatus('Выберите хотя бы один уровень масштабирования.', 'error');
        return;
    }

    const bounds = currentRectangle.getBounds();
    const totalTiles = calculateTotalTiles(bounds);

    // Подтверждение для больших областей
    if (totalTiles > 500) {
        const confirmed = confirm(`Вы собираетесь скачать ${totalTiles} тайлов для уровней ${selectedLevels.join(', ')}. Это может занять несколько минут. Продолжить?`);
        if (!confirmed) return;
    }

    const downloadData = {
        north: bounds.getNorth(),
        south: bounds.getSouth(),
        east: bounds.getEast(),
        west: bounds.getWest(),
        zoomLevels: selectedLevels
    };

    try {
        updateStatus(`Начинаем скачивание ${totalTiles} тайлов для уровней ${selectedLevels.join(', ')}...`, 'info');
        document.getElementById('progress').style.display = 'block';
        document.getElementById('downloadTilesBtn').disabled = true;
        document.getElementById('drawRectBtn').disabled = true;

        const response = await fetch('/download-tiles', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(downloadData)
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Ошибка сервера');
        }

        const result = await response.json();

        let message = `Успешно! Скачано ${result.downloadedCount} тайлов с CartoDB`;
        if (result.skippedCount > 0) {
            message += `, пропущено ${result.skippedCount} (уже существовали)`;
        }
        if (result.failedCount > 0) {
            message += `, ошибок: ${result.failedCount}`;
        }
        message += `. Файлы сохранены в data/Tiles/`;

        updateStatus(message, 'success');

    } catch (error) {
        console.error('Ошибка скачивания:', error);
        updateStatus('Ошибка при скачивании: ' + error.message, 'error');
    } finally {
        document.getElementById('progress').style.display = 'none';
        document.getElementById('downloadTilesBtn').disabled = false;
        document.getElementById('drawRectBtn').disabled = false;
    }
});

// Функция обновления статуса
function updateStatus(message, type) {
    const statusEl = document.getElementById('status');
    statusEl.textContent = message;
    statusEl.className = type;
}

// Вспомогательная функция для преобразования координат в тайлы
function latLngToTile(lat, lng, zoom) {
    const x = Math.floor((lng + 180) / 360 * Math.pow(2, zoom));
    const y = Math.floor((1 - Math.log(Math.tan(lat * Math.PI / 180) + 1 / Math.cos(lat * Math.PI / 180)) / Math.PI) / 2 * Math.pow(2, zoom));
    return { x, y };
}

// Инициализация информации о тайлах
updateTileInfo();

// Обработчик клика на карту для отмены режима рисования
map.on('click', function() {
    if (drawControl && !currentRectangle) {
        updateStatus('Режим выделения отменен. Нажмите "Выделить область" чтобы попробовать снова.', 'info');
        map.removeControl(drawControl);
        drawControl = null;
    }
});