// Инициализация карты
var map = L.map('map').setView([55.755811, 37.617617], 11);

// Оффлайн слой
var offlineLayer = L.tileLayer('/data/Tiles/{z}/{x}/{y}.png', {
    maxZoom: 14,
    minZoom: 3,
    tileSize: 256,
    zoomOffset: 0,
    attribution: 'Оффлайн карта'
});

// Онлайн слой
var onlineLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: 'Онлайн карта'
});
// Добавляем оффлайн слой по умолчанию
offlineLayer.addTo(map);
document.getElementById('offlineBtn').classList.add('active'); // Выделяем оффлайн кнопку

// отключение флага, что?
map.attributionControl.setPrefix(false)

// Обработчики для кнопок переключения оффлайн/онлайн слоя (тут есть баг из-за которого происходит нажатие карту, надо убрать, но я не знаю, как)
document.getElementById('offlineBtn').onclick = function(event) {
    event.stopPropagation(); // Предотвращаем всплытие события клика
    map.removeLayer(onlineLayer); // Убираем онлайн слой
    offlineLayer.addTo(map); // Добавляем оффлайн слой

    // Выделяем активную кнопку
    this.classList.add('active');
    document.getElementById('onlineBtn').classList.remove('active');
};

document.getElementById('onlineBtn').addEventListener('click', function(event) {
    event.stopPropagation();
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function(position) {
            map.removeLayer(offlineLayer); // Убираем оффлайн слой
            onlineLayer.addTo(map); // Добавляем онлайн слой

            // Выделяем активную кнопку
            document.getElementById('onlineBtn').classList.add('active');
            document.getElementById('offlineBtn').classList.remove('active');
        }, function() {
            alert("Нет подключения");
        });
    } else {
        alert("Неизвестная ошибка");
    }
});

// основные переменные, используемы е в проекте 
let lastMarker; // переменная для маркера, создающегося по клику

// Создание маркера по клику на карте
map.on('click', function(e) {
    const lat = e.latlng.lat;
    const lng = e.latlng.lng;

    // Установка нового маркера
    if (lastMarker) {
        map.removeLayer(lastMarker); // Удаляем предыдущий маркер
    }
    lastMarker = L.marker([lat, lng], {
        draggable: true
    }).addTo(map);
    // lastMarker.bindPopup(`Координаты: ${lat.toFixed(4)}, ${lng.toFixed(4)}`).openPopup();
    // map.setView([lat, lng], 11);

    // Обновляем значения в inputLat и inputLng
    document.getElementById('inputLat').value = lat.toFixed(4);
    document.getElementById('inputLng').value = lng.toFixed(4);

    // Получаем высоту с Node.js сервера
    fetch('http://localhost:3000/api/getElevation', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                latitude: lat,
                longitude: lng
            })
        })
        .then(response => response.json())
        .then(data => {
            document.getElementById('inputHeightSeaLevel').value = data.elevation; // Обновляем поле высоты
        })
        .catch(error => console.error('Ошибка при получении высоты:', error));

    // Обработчик движения маркера
    lastMarker.on('drag', function() {
        const currentLatLng = lastMarker.getLatLng();
        document.getElementById('inputLat').value = currentLatLng.lat.toFixed(4);
        document.getElementById('inputLng').value = currentLatLng.lng.toFixed(4);


    });
});

// Загрузка данных с сервера
fetch('http://localhost:3000/data')
    .then(response => response.json())
    .then(data => {
        const dropdown = document.getElementById('dataDropdown');
        data.forEach(item => {
            const option = document.createElement('option');
            option.value = item.id;
            option.textContent = item.Names;
            option.dataset.latitude = item.latitude;
            option.dataset.longitude = item.longitude;
            dropdown.appendChild(option);
        });

        // Короче тут какой-то баг, я хз что тут не так, он вроде ничего не ломает, он просто есть
        dropdown.addEventListener('change', (event) => {
            try {
                const selectedOption = event.target.selectedOptions[0];
                const latitude = selectedOption.dataset.latitude;
                const longitude = selectedOption.dataset.longitude;
            } catch (error) {
                console.error('Ошибка при обработке выбора:', error);
            }
        });
    });

const mainInputFreq = document.getElementById('inputFrec');
const secondInputFreq = document.getElementById('inputFrec1');

// Функция для синхронизации частоты
function syncFreq(sourceInput, targetInput) {
    targetInput.value = sourceInput.value;
}

// Добавляем обработчики событий для синхронизации
mainInputFreq.addEventListener('input', function() {
    syncFreq(mainInputFreq, secondInputFreq);
});

secondInputFreq.addEventListener('input', function() {
    syncFreq(secondInputFreq, mainInputFreq);
});

const polygonLayers = {
    main: { color: 'red', storage: [], currentLayer: null, url: 'coordinates.json' },
    noise: { color: 'yellow', storage: [], currentLayer: null, url: 'coordinates_pomexa.json' },
    ellipse: { color: 'green', storage: [], currentLayer: null, url: 'coordinates_ellipse.json' }
};

let scaleSizes = null;

async function loadScale() {
    if (!scaleSizes) {
        const response = await fetch('scale.json');
        const data = await response.json();

        // Извлекаем размеры
        scaleSizes = {
            size1: data[0].size1,
            size2: data[1].size2
        };
    }
    return scaleSizes;
}

async function loadCoordinates(type) {
    const sizes = await loadScale(); // Получаем оба размера
    const config = polygonLayers[type];
    const size = (type === 'ellipse') ? sizes.size2 : sizes.size1; // Выбираем размер в зависимости от типа

    const response = await fetch(config.url);
    const data = await response.json();
    config.storage.length = 0;

    data.forEach(coord => {
        const lat = coord.latitude;
        const lng = coord.longitude;
        const lngOffset = size / Math.cos(lat * (Math.PI / 180));

        config.storage.push([
            [lat + size, lng - lngOffset],
            [lat - size, lng + lngOffset]
        ]);
    });
}

function createMergedPolygon(boundsArray, color) {
    if (boundsArray.length === 0) return null;

    const turfPolygons = boundsArray.map(bounds => {
        return turf.polygon([
            [
                [bounds[0][1], bounds[0][0]],
                [bounds[1][1], bounds[0][0]],
                [bounds[1][1], bounds[1][0]],
                [bounds[0][1], bounds[1][0]],
                [bounds[0][1], bounds[0][0]]
            ]
        ]);
    });

    return turf.union(turf.featureCollection(turfPolygons));
}

document.getElementById('show').addEventListener('click', async function() {
    // Загружаем все координаты параллельно
    await Promise.all([
        loadCoordinates('main'),
        loadCoordinates('noise'),
        loadCoordinates('ellipse')
    ]);

    // Обрабатываем каждый тип полигонов
    for (const [type, config] of Object.entries(polygonLayers)) {
        if (config.storage.length > 0) {
            const merged = createMergedPolygon(config.storage, config.color);

            if (config.currentLayer) {
                map.removeLayer(config.currentLayer);
            }

            if (merged) {
                config.currentLayer = L.geoJSON(merged, {
                    color: config.color,
                    weight: 1
                }).addTo(map);
            }
        } else {
            console.warn(`Нет полигонов типа ${type} для объединения!`);
        }
    }
});