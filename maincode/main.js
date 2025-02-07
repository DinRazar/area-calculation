// Инициализация карты
var map = L.map('map').setView([55.755811, 37.617617], 11);

// Оффлайн слой
var offlineLayer = L.tileLayer('/data/Tiles/{z}/{x}/{y}.png', {
    maxZoom: 16,
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


// // Создаем контрол для переключения слоев
// var baseLayers = {
//     "Оффлайн": offlineLayer,
//     "Онлайн": onlineLayer
// };
// var layerControl = L.control.layers(baseLayers).addTo(map);

// отключение флага, что?
map.attributionControl.setPrefix(false)

// Обработчики для кнопок
document.getElementById('offlineBtn').onclick = function(event) {
    event.stopPropagation(); // Предотвращаем всплытие события клика
    map.removeLayer(onlineLayer); // Убираем онлайн слой
    offlineLayer.addTo(map); // Добавляем оффлайн слой

    // Выделяем активную кнопку
    this.classList.add('active');
    document.getElementById('onlineBtn').classList.remove('active');
};

document.getElementById('onlineBtn').onclick = function(event) {
    event.stopPropagation(); // Предотвращаем всплытие события клика

    map.removeLayer(offlineLayer); // Убираем оффлайн слой
    onlineLayer.addTo(map); // Добавляем онлайн слой

    // Выделяем активную кнопку
    this.classList.add('active');
    document.getElementById('offlineBtn').classList.remove('active');

    // Проверяем доступность онлайн слоя
    onlineLayer.on('load', function() {
        // Успешная загрузка, ничего не делаем
    });

    onlineLayer.on('error', function() {
        alert("Ошибка: Не удалось загрузить онлайн-карту!"); // Показываем alert при ошибке
        map.removeLayer(onlineLayer); // Убираем онлайн слой при ошибке
        offlineLayer.addTo(map); // Возвращаем оффлайн слой
        document.getElementById('offlineBtn').classList.add('active'); // Выделяем оффлайн кнопку
        document.getElementById('onlineBtn').classList.remove('active'); // Убираем выделение с онлайн кнопки
    });
};

let lastMarker; // переменная для маркера, создающегося по клику
let markerFromDB; // переменная для маркера из базы данных
let geodesic; // переменная для геодезической линии между lastMarker и markerFromDB
let thirdMarker; // переменная для маркера дрона
let thirdGeodesic; // переменная для геодезической линии между lastMarker и thirdMarker
let elevationValue; // переменная для значения высоты

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

    // Обновляем геодезическую линию
    updateGeodesicAndCalculations();

    // Добавляем возможность перетаскивания маркера
    lastMarker.on('drag', updateGeodesicAndCalculations);

    // Обработчик клика на маркер для отображения его координат
    lastMarker.on('drag', function() {
        const currentLatLng = lastMarker.getLatLng();
        // lastMarker.bindPopup(`Координаты: ${currentLatLng.lat.toFixed(4)}, ${currentLatLng.lng.toFixed(4)}`).openPopup();
        document.getElementById('inputLat').value = currentLatLng.lat.toFixed(4);
        document.getElementById('inputLng').value = currentLatLng.lng.toFixed(4);
    });
});

// Открытие и закрытие окна для ручного указания координта Modal1
document.getElementById('manualInputButton').addEventListener('click', function() {
    // Если окно Modal1 закрыто, то открываем его
    if (document.getElementById('modal1').style.display == 'none') {
        document.getElementById('modal1').style.display = 'block';
    } else {
        // Закрываем окно Modal1, если оно открыто
        document.getElementById('modal1').style.display = 'none';
    }
});

// Без проверки
// Закрытие модального окна
// document.getElementById('manualInputButton').addEventListener('click', function() {
//     document.getElementById('modal1').style.display = 'block';
// });

// Закрытие модального окна
document.getElementById('closeModal1').addEventListener('click', function() {
    document.getElementById('modal1').style.display = 'none';
});


// Автоопределение координат
document.getElementById('autoDetectionButton').addEventListener('click', function() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function(position) {
            const lat = position.coords.latitude;
            const lng = position.coords.longitude;

            // Установка координат маркера
            if (lastMarker) {
                map.removeLayer(lastMarker);
            }

            lastMarker = L.marker([lat, lng], {
                draggable: true
            }).addTo(map);
            // lastMarker.bindPopup(`Координаты: ${lat.toFixed(4)}, ${lng.toFixed(4)}`).openPopup();
            map.setView([lat, lng], 11);

            // Обновляем значения в inputLat и inputLng
            document.getElementById('inputLat').value = lat.toFixed(4);
            document.getElementById('inputLng').value = lng.toFixed(4);

            updateGeodesicAndCalculations(); // Обновление геодезической линии

            // Добавляем возможность перетаскивания маркера
            lastMarker.on('drag', updateGeodesicAndCalculations);
            lastMarker.on('dragend', function() {
                const currentLatLng = lastMarker.getLatLng();
                // Обновляем координаты маркера
                // console.log(`Обновленные координаты: ${currentLatLng.lat.toFixed(4)}, ${currentLatLng.lng.toFixed(4)}`);
                // lastMarker.bindPopup(`Координаты: ${currentLatLng.lat.toFixed(4)}, ${currentLatLng.lng.toFixed(4)}`).openPopup();

                document.getElementById('inputLat').value = currentLatLng.lat.toFixed(4);
                document.getElementById('inputLng').value = currentLatLng.lng.toFixed(4);

                updateGeodesicAndCalculations(); // Обновление геодезической линии
            });
        }, function() {
            alert("Не удалось получить местоположение.");
        });
    } else {
        alert("Геолокация не поддерживается вашим браузером.");
    }
});

// Подтверждение введенных координат
document.getElementById('submitCoordinates').addEventListener('click', function() {
    const lat = parseFloat(document.getElementById('inputLat').value);
    const lng = parseFloat(document.getElementById('inputLng').value);

    if (!isNaN(lat) && !isNaN(lng)) {
        if (lastMarker) {
            map.removeLayer(lastMarker);
        }

        lastMarker = L.marker([lat, lng], {
            draggable: true
        }).addTo(map);
        // lastMarker.bindPopup(`Координаты: ${lat.toFixed(4)}, ${lng.toFixed(4)}`).openPopup();
        map.setView([lat, lng], 8);

        // Обновляем значения в inputLat и inputLng
        document.getElementById('inputLat').value = lat.toFixed(4);
        document.getElementById('inputLng').value = lng.toFixed(4);

        updateGeodesicAndCalculations(); // Обновление геодезической линии

        // Добавляем возможность перетаскивания маркера
        lastMarker.on('drag', updateGeodesicAndCalculations);
        lastMarker.on('dragend', function() {
            const currentLatLng = lastMarker.getLatLng();
            // Обновляем координаты маркера
            // console.log(`Обновленные координаты: ${currentLatLng.lat.toFixed(4)}, ${currentLatLng.lng.toFixed(4)}`);
            // lastMarker.bindPopup(`Координаты: ${currentLatLng.lat.toFixed(4)}, ${currentLatLng.lng.toFixed(4)}`).openPopup();

            // Обновляем значения в inputLat и inputLng при перетаскивании
            document.getElementById('inputLat').value = currentLatLng.lat.toFixed(4);
            document.getElementById('inputLng').value = currentLatLng.lng.toFixed(4);

            updateGeodesicAndCalculations(); // Обновление геодезической линии
        });
    } else {
        alert("Пожалуйста, введите корректные координаты.");
    }
});

// Данные подгружаются с сервера
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

        dropdown.addEventListener('change', (event) => {
                const selectedOption = event.target.selectedOptions[0];
                const latitude = selectedOption.dataset.latitude;
                const longitude = selectedOption.dataset.longitude;

                if (markerFromDB) {
                    map.removeLayer(markerFromDB);
                }

                markerFromDB = L.marker([latitude, longitude]).addTo(map).bindPopup(selectedOption.textContent);
                updateGeodesicAndCalculations();

            })
            .catch(error => console.error('Ошибка загрузки данных:', error));
    });

// // Отправка координат на сервер
// fetch('http://localhost:3000/api/getElevation', {
//         method: 'POST',
//         headers: {
//             'Content-Type': 'application/json'
//         },
//         body: JSON.stringify({
//             latitude: lat,
//             longitude: lng
//         })
//     })
//     .then(response => {
//         if (!response.ok) {
//             throw new Error('Отсутствует подключение');
//         }
//         return response.json();
//     })
//     .then(data => {
//         elevationValue = data.elevation;
//         alert(`Высота: ${elevationValue}`);
//         // Привязываем всплывающее окно к маркеру (по умолчанию закрыто)
//         lastMarker.bindPopup(`Координаты: ${lat}, ${lng}<br>Высота: ${elevationValue || 'неизвестна'}`);
//     })
//     .catch(error => {
//         console.error('Ошибка:', error);
//         alert('Ошибка при получении высоты');
//     })

// функция для создания геодезических линий
function updateGeodesicAndCalculations() {
    if (geodesic) {
        map.removeLayer(geodesic);
    }

    if (lastMarker && markerFromDB) {
        document.getElementById('addPointButton').disabled = false;
        geodesic = L.geodesic([lastMarker.getLatLng(), markerFromDB.getLatLng()], { // между точкой (по клику) и из БД
            weight: 3,
            opacity: 1,
            color: 'blue',
            steps: 50
        }).addTo(map);

        // Выполнение расчетов
        performCalculations();
    };
    if (thirdMarker) {
        if (thirdGeodesic) {
            map.removeLayer(thirdGeodesic);
        }
        thirdGeodesic = L.geodesic([lastMarker.getLatLng(), thirdMarker.getLatLng()], {
            weight: 3,
            opacity: 1,
            color: 'red',
            steps: 50
        }).addTo(map);

        somethingCalcuiation()
    };
};

function updateGeodesicAndCalculationsWithThirdMarker() {
    document.getElementById('addPointButton').addEventListener('click', function() {
        // Очищаем results2 при нажатии на кнопку
        document.getElementById('results2').innerHTML = '';
        const newPointLatLng = lastMarker ? lastMarker.getLatLng() : null;

        if (thirdMarker) {
            // Удаляем третий маркер и геодезическую линию
            map.removeLayer(thirdMarker);
            thirdMarker = null;

            if (thirdGeodesic) {
                map.removeLayer(thirdGeodesic);
                thirdGeodesic = null;
            }
        } else if (newPointLatLng) {
            // Создаем третий маркер
            thirdMarker = L.marker(newPointLatLng, {
                draggable: true,
                icon: thirdMarkerIcon
            }).addTo(map);
            thirdMarker.on('drag', updateGeodesicAndCalculations);
        }

        updateGeodesicAndCalculations();
    });

};
// Иконка для третьего маркера
const thirdMarkerIcon = L.icon({
    iconUrl: 'data/alert.png',
    iconSize: [25, 25],
    iconAnchor: [12.5, 12.5],
});

// Вызов функции после ее определения
updateGeodesicAndCalculationsWithThirdMarker();

function performCalculations() {
    if (lastMarker && markerFromDB) {
        const lat1 = lastMarker.getLatLng().lat;
        const lon1 = lastMarker.getLatLng().lng;
        const satLat = markerFromDB.getLatLng().lat;
        const satLon = markerFromDB.getLatLng().lng;
        const toDegrees = (radians) => radians * (180 / Math.PI);
        const rad = Math.PI / 180;

        // Угол места
        const angle = Math.atan((Math.cos(lon1 * rad - satLon * rad) * Math.cos(lat1 * rad) - 0.151) / Math.sqrt(1 - Math.pow(Math.cos(lon1 * rad - satLon * rad), 2) * Math.pow(Math.cos(lat1 * rad), 2))) / rad;
        const elevationAngleText = `Угол места: ${angle.toFixed(2)}°`;

        // Угол поворота конвектора
        const convectorAngle = (Math.atan(Math.sin(lon1 * rad - satLon * rad) / Math.tan(lat1 * rad))) / rad;
        const convectorAngleText = `Угол поворота конвектора: ${convectorAngle.toFixed(2)}°`;

        // Истинный азимут
        const TrueAzimuth = Math.atan2(Math.sin((satLon - lon1) * rad) * Math.cos(satLat * rad), Math.cos(lat1 * rad) * Math.sin(satLat * rad) - Math.sin(lat1 * rad) * Math.cos(satLat * rad) * Math.cos((satLon - lon1) * rad));
        const TrueAzimuthD = (toDegrees(TrueAzimuth) + 360) % 360;
        const TrueAzimuthText = `Истинный азимут: ${TrueAzimuthD.toFixed(2)}°`;

        // Магнитный азимут
        const geomagData = geomag.field(lat1, lon1);
        const magneticDeclination = geomagData.declination;
        const MagneticAzimuth = (TrueAzimuthD - magneticDeclination + 360) % 360;
        const MagneticAzimuthText = `Магнитный азимут: ${MagneticAzimuth.toFixed(2)}°`;

        // Обновление результатов на странице
        const resultsContainer = document.getElementById('results');
        resultsContainer.innerHTML = `
                    <div class="result-item">${elevationAngleText}</div>
                    <div class="result-item">${convectorAngleText}</div>
                    <div class="result-item">${TrueAzimuthText}</div>
                    <div class="result-item">${MagneticAzimuthText}</div>
                `;
    } else {
        alert('Точки для расчета не выбраны.');
    };
};

function somethingCalcuiation(angle) {
    if (lastMarker && markerFromDB) {
        const lat1 = lastMarker.getLatLng().lat;
        const lon1 = lastMarker.getLatLng().lng;
        const satLon = markerFromDB.getLatLng().lng;
        const rad = Math.PI / 180;

        const angle = Math.atan((Math.cos(lon1 * rad - satLon * rad) * Math.cos(lat1 * rad) - 0.151) / Math.sqrt(1 - Math.pow(Math.cos(lon1 * rad - satLon * rad), 2) * Math.pow(Math.cos(lat1 * rad), 2))) / rad;
        const distance = lastMarker.getLatLng().distanceTo(thirdMarker.getLatLng());
        const angleInRadians = angle * (Math.PI / 180);

        // Вычисляем высоту
        const height = distance * Math.tan(angleInRadians);

        const resultsContainer = document.getElementById('results2');
        resultsContainer.innerHTML = `
                    <div class="result-item">Высота препятствия: ${height.toFixed(2)} метров</div>
                    <div class="result-item">Расстояние до препятствия: ${distance.toFixed(2)} метров</div>
                `;
    } else {
        alert('Точки для расчета не выбраны.');
    };
};

// //Обработчик клика маркера для открытия всплывающего окна
// lastMarker.on('click', function() {
//     lastMarker.openPopup();
// });