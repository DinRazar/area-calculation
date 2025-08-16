var rulerTool = {
    isActive: false,
    markers: [],
    tempMarkers: null,
    polyline: null,
    totalDistance: 0
};

// Обработчик кнопки линейки
document.getElementById('rulerButton').addEventListener('click', function(e) {
    e.stopPropagation();

    if (rulerTool.isActive) {
        disableRulerTool();
        this.classList.remove('active');
        document.getElementById('ZoneBtn').classList.remove('active');

    } else {
        enableRulerTool();
        this.classList.add('active');
        document.getElementById('ZoneBtn').classList.add('active');
    }
});

function enableRulerTool() {
    // Сброс предыдущего состояния
    if (rulerTool.isActive) disableRulerTool();

    rulerTool.isActive = true;
    rulerTool.markers = [];
    rulerTool.tempMarkers = null;
    rulerTool.polyline = null;
    rulerTool.totalDistance = 0;

    // Изменение курсора
    map.getContainer().style.cursor = 'crosshair';

    // Добавление обработчиков
    map.on('click', addRulerPoint);
    map.on('dblclick', removeLastRulerPoint);
}

function disableRulerTool() {
    if (!rulerTool.isActive) return;

    // Очистка
    clearRuler();

    // Восстановление курсора
    map.getContainer().style.cursor = '';

    // Удаление обработчиков
    map.off('click', addRulerPoint);
    map.off('dblclick', removeLastRulerPoint);

    rulerTool.isActive = false;
}

function addRulerPoint(e) {
    // Создание маркера
    var marker = L.marker(e.latlng, {
        icon: L.divIcon({
            className: 'ruler-marker',
            html: '<div class="ruler-marker-inner"></div>',
            iconSize: [16, 16]
        }),
        draggable: true
    }).addTo(map);

    marker.on('drag', function() {
        updateRulerLine();
        updateDistance();
        updateAlltooltips();
    })

    // Добавление в массив
    rulerTool.markers.push(marker);

    // Обновление линии и расчет расстояния
    updateRulerLine();
    updateDistance();

    // Добавление тултипа с кнопками управления
    addTooltipToMarker(marker);
}

function removeLastRulerPoint() {
    if (rulerTool.markers.length === 0) return;

    // Удаление последнего маркера
    var lastMarker = rulerTool.markers.pop();
    map.removeLayer(lastMarker);

    // Обновление линии и расстояния
    updateRulerLine();
    updateDistance();

    // Обновление тултипа предыдущего маркера
    if (rulerTool.markers.length > 0) {
        addTooltipToMarker(rulerTool.markers[rulerTool.markers.length - 1]);
    }
}

function updateRulerLine() {
    var latlngs = rulerTool.markers.map(m => m.getLatLng());

    if (latlngs.length >= 2) {
        if (!rulerTool.polyline) {
            rulerTool.polyline = L.polyline(latlngs, {
                color: '#4CAF50',
                weight: 3,
                dashArray: '5, 5'
            }).addTo(map);
        } else {
            rulerTool.polyline.setLatLngs(latlngs);
        }
    } else if (rulerTool.polyline) {
        map.removeLayer(rulerTool.polyline);
        rulerTool.polyline = null;
    }
}

function updateDistance() {
    rulerTool.totalDistance = 0;

    if (rulerTool.markers.length < 2) return;

    for (var i = 1; i < rulerTool.markers.length; i++) {
        var prev = rulerTool.markers[i - 1].getLatLng();
        var curr = rulerTool.markers[i].getLatLng();
        rulerTool.totalDistance += prev.distanceTo(curr);
    }
}

function updateAlltooltips() {
    rulerTool.markers.forEach(marker => {
        marker.unbindTooltip();
        addTooltipToMarker(marker);
    })
}

// Обновленная функция добавления тултипа
function addTooltipToMarker(marker) {
    var isLast = marker === rulerTool.markers[rulerTool.markers.length - 1];
    var index = rulerTool.markers.indexOf(marker);

    // Расчет расстояния
    var segmentDistance = 0;
    if (index > 0) {
        var prev = rulerTool.markers[index - 1].getLatLng();
        segmentDistance = prev.distanceTo(marker.getLatLng());
    }

    // Форматирование расстояния
    var formatDist = function(d) {
        return d >= 1000 ? (d / 1000).toFixed(2) + ' км' : Math.round(d) + ' м';
    };

    // HTML тултипа
    var tooltipHTML = `
        <div class="ruler-tooltip">
            <div>Сегмент: ${formatDist(segmentDistance)}</div>
            <div>Всего: ${formatDist(rulerTool.totalDistance)}</div>
            ${isLast ? `
            <div class="ruler-controls">
                <button class="ruler-delete-all">🗑️ Удалить все</button>
            </div>
            ` : ''}
        </div>
    `;

    // удалил вот эту строку, так как она всё ломала "<button class="ruler-finish">✓ Готово</button>"
    
    // Привязка тултипа с правильными настройками
    marker.bindTooltip(tooltipHTML, {
        permanent: true,
        direction: 'right',
        offset: [15, 0],
        className: 'ruler-tooltip-container',
        interactive: true // Это ключевой параметр!
    }).openTooltip();
    
    // Добавление обработчиков для кнопок
    if (isLast) {
        // Используем делегирование событий для динамических элементов
        marker._tooltip._contentNode.addEventListener('click', function(e) {
            if (e.target.classList.contains('ruler-delete-all')) {
                e.stopPropagation();
                clearRuler();
            } else if (e.target.classList.contains('ruler-finish')) {
                e.stopPropagation();
                disableRulerTool();
            }
        });
    }
}

function clearRuler() {
    // Удаление всех маркеров
    rulerTool.markers.forEach(m => map.removeLayer(m));
    rulerTool.markers = [];
    
    // Удаление линии
    if (rulerTool.polyline) {
        map.removeLayer(rulerTool.polyline);
        rulerTool.polyline = null;
    }
    
    // Сброс расстояния
    rulerTool.totalDistance = 0;
}