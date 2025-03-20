document.addEventListener('DOMContentLoaded', () => {
    const dataStandardSelect = document.getElementById('dataStandard');
    const dataSpeedSelect = document.getElementById('dataSpeed');
    const dataModulationSelect = document.getElementById('dataModulation');

    // Опции для кодовой скорости
    const speedOptions = {
        dvbs: [
            { value: '1/2', text: '1/2' },
            { value: '2/3', text: '2/3' },
            { value: '3/4', text: '3/4' },
            { value: '5/6', text: '5/6' },
            { value: '7/8', text: '7/8' },
        ],
        dvbs2: [
            { value: '1/4', text: '1/4' },
            { value: '1/3', text: '1/3' },
            { value: '2/5', text: '2/5' },
            { value: '1/2', text: '1/2' },
            { value: '3/5', text: '3/5' },
            { value: '2/3', text: '2/3' },
            { value: '3/4', text: '3/4' },
            { value: '4/5', text: '4/5' },
            { value: '5/6', text: '5/6' },
            { value: '8/9', text: '8/9' },
            { value: '9/10', text: '9/10' },
        ],
    };

    // Опции для типа модуляции
    const modulationOptions = {
        dvbs: [
            { value: 'QPSK', text: 'QPSK' }
        ],
        dvbs2: [
            { value: 'QPSK', text: 'QPSK' },
            { value: '8-PSK', text: '8-PSK' },
            { value: '16-APSK', text: '16-APSK' },
            { value: '32-APSK', text: '32-APSK' },
        ],
    };

    // Обработчик события изменения выбора в первом селекте
    dataStandardSelect.addEventListener('change', function() {
        // Очищаем второй и третий селекты
        dataSpeedSelect.innerHTML = '<option value="" disabled selected hidden> Кодовая скорость </option>';
        dataModulationSelect.innerHTML = '<option value="" disabled selected hidden> Тип модуляции </option>';

        // Получаем выбранное значение
        const selectedStandard = this.value;

        // Проверяем, есть ли опции для выбранного стандарта
        if (speedOptions[selectedStandard]) {
            speedOptions[selectedStandard].forEach(option => {
                const newOption = document.createElement('option');
                newOption.value = option.value;
                newOption.textContent = option.text;
                dataSpeedSelect.appendChild(newOption);
            });
        }

        if (modulationOptions[selectedStandard]) {
            modulationOptions[selectedStandard].forEach(option => {
                const newOption = document.createElement('option');
                newOption.value = option.value;
                newOption.textContent = option.text;
                dataModulationSelect.appendChild(newOption);
            });
        }
    });
});

document.addEventListener('DOMContentLoaded', () => {
    const dataStandSelect = document.getElementById('dataStand');
    const dataSpSelect = document.getElementById('dataSp');
    const dataModSelect = document.getElementById('dataMod');

    const speedOption1 = {
        dvbs: [
            { value: '1/2', text: '1/2' },
            { value: '2/3', text: '2/3' },
            { value: '3/4', text: '3/4' },
            { value: '5/6', text: '5/6' },
            { value: '7/8', text: '7/8' },
        ],
        dvbs2: [
            { value: '1/4', text: '1/4' },
            { value: '1/3', text: '1/3' },
            { value: '2/5', text: '2/5' },
            { value: '1/2', text: '1/2' },
            { value: '3/5', text: '3/5' },
            { value: '2/3', text: '2/3' },
            { value: '3/4', text: '3/4' },
            { value: '4/5', text: '4/5' },
        ],
    };

    const modulationOptions1 = {
        dvbs: [
            { value: 'QPSK', text: 'QPSK' }
        ],
        dvbs2: [
            { value: 'QPSK', text: 'QPSK' },
            { value: '8-PSK', text: '8-PSK' },
            { value: '16-APSK', text: '16-APSK' },
            { value: '32-APSK', text: '32-APSK' },
        ],
    };

    dataStandSelect.addEventListener('change', function() {
        dataSpSelect.innerHTML = '<option value="" disabled selected hidden> Кодовая скорость </option>';
        dataModSelect.innerHTML = '<option value="" disabled selected hidden> Тип модуляции </option>';

        const selectedStand = this.value;

        if (speedOption1[selectedStand]) {
            speedOption1[selectedStand].forEach(option => {
                const newOption = document.createElement('option');
                newOption.value = option.value;
                newOption.textContent = option.text;
                dataSpSelect.appendChild(newOption);
            });
        }

        if (modulationOptions1[selectedStand]) {
            modulationOptions1[selectedStand].forEach(option => {
                const newOption = document.createElement('option');
                newOption.value = option.value;
                newOption.textContent = option.text;
                dataModSelect.appendChild(newOption);
            });
        }
    });
    // Установка значений по умолчанию
    dataStandSelect.value = 'dvbs2'; // Выбор стандарта DVB-S2
    dataStandSelect.dispatchEvent(new Event('change')); // Вызываем событие изменения, чтобы заполнить speed и modulation
    dataSpSelect.value = '1/2'; // Установка кодовой скорости по умолчанию
    dataModSelect.value = 'QPSK'; // Установка типа модуляции по умолчанию

    // Обновляем выбранные значения
    // updateSelectedValues(); // Вызываем функцию обновления значений
});

document.addEventListener('DOMContentLoaded', () => {
    const dataStandardSelect = document.getElementById('dataStandard');
    const dataSpeedSelect = document.getElementById('dataSpeed');
    const dataModulationSelect = document.getElementById('dataModulation');
    const dataPolarizationSelect = document.getElementById('dataPolarization');
    const inputFrec = document.getElementById('inputFrec');
    const inputFrec1 = document.getElementById('inputFrec1')
    const applyButton = document.getElementById('applyButton'); // Кнопка "Применить"
    const dataDropdown = document.getElementById('dataDropdown');
    const inputLat = document.getElementById('inputLat');
    const inputLng = document.getElementById('inputLng');
    const inputPower = document.getElementById('inputPower');
    const inputAntennaGain = document.getElementById('inputAntennaGain');
    const inputWidth = document.getElementById('inputWidth');
    const inputHeight = document.getElementById('inputHeight');
    const inputAzim = document.getElementById('inputAzim');
    const dataPolSelect = document.getElementById('dataPol');
    const dataStandSelect = document.getElementById('dataStand');
    const dataSpSelect = document.getElementById('dataSp');
    const dataModSelect = document.getElementById('dataMod');
    const inputHeightSeaLevel = document.getElementById('inputHeightSeaLevel');
    const inputKSI = document.getElementById('inputKSI')


    // Объект для хранения выбранных значений
    let selectedValues = {
        standard: '',
        speed: '',
        modulation: '',
        polarization: '',
        frequency: '',
        // frequency2: '',
        satelliteLongitude: '', // Долгота спутника
        latitude: '',
        longitude: '',
        Power: '',
        AntennaGain: '',
        Width: '',
        HeightSeaLevel: '',
        Hight: '',
        Azimuth: '',
        Pol: '',
        Stand: '',
        Sp: '',
        Mod: '',
        ksi: ''
    };

    // Функция для обновления выбранных значений
    function updateSelectedValues() {
        selectedValues.standard = dataStandardSelect.value;
        selectedValues.speed = dataSpeedSelect.value;
        selectedValues.modulation = dataModulationSelect.value;
        selectedValues.polarization = dataPolarizationSelect.value;
        selectedValues.frequency = inputFrec.value;
        // selectedValues.frequency2 = inputFrec1.value;
        selectedValues.latitude = inputLat.value;
        selectedValues.longitude = inputLng.value;
        selectedValues.Power = inputPower.value;
        selectedValues.AntennaGain = inputAntennaGain.value;
        selectedValues.Width = inputWidth.value;
        selectedValues.Hight = inputHeight.value;
        selectedValues.HeightSeaLevel = inputHeightSeaLevel.value;
        selectedValues.Azimuth = inputAzim.value;
        selectedValues.Pol = dataPolSelect.value;
        selectedValues.Stand = dataStandSelect.value;
        selectedValues.Sp = dataSpSelect.value;
        selectedValues.Mod = dataModSelect.value;
        selectedValues.ksi = inputKSI.value;
    }

    // Загрузка данных с сервера
    fetch('http://localhost:3000/data')
        .then(response => response.json())
        .then(data => {
            data.forEach(item => {
                const option = document.createElement('option');
                option.value = item.longitude; // Сохраняем долготу как значение
                option.textContent = item.Names; // Отображаем название спутника
                option.dataset.latitude = item.latitude; // Сохраняем широту
                option.dataset.longitude = item.longitude; // Сохраняем долготу
                dataDropdown.appendChild(option);
            });

            // Обработчик изменения для выпадающего списка спутников
            dataDropdown.addEventListener('change', (event) => {
                const selectedOption = event.target.selectedOptions[0];
                selectedValues.satelliteLongitude = selectedOption.dataset.longitude; // Долгота спутника
            });
        })
        .catch(error => console.error('Ошибка загрузки данных:', error));

    // Обработчики событий для обновления значений
    dataStandardSelect.addEventListener('change', updateSelectedValues); //Стандарт вещания
    dataSpeedSelect.addEventListener('change', updateSelectedValues); //Кодовая скорость
    dataModulationSelect.addEventListener('change', updateSelectedValues); //Тип модуляции
    dataPolarizationSelect.addEventListener('change', updateSelectedValues); //Поляризация
    inputFrec.addEventListener('input', updateSelectedValues); //Частота вещания 
    inputPower.addEventListener('input', updateSelectedValues); //Мощность передатчика
    inputAntennaGain.addEventListener('input', updateSelectedValues); //Коэффициент усиления антенны
    inputLat.addEventListener('input', updateSelectedValues);
    inputLng.addEventListener('input', updateSelectedValues);
    inputWidth.addEventListener('input', updateSelectedValues);
    inputHeight.addEventListener('input', updateSelectedValues);
    inputAzim.addEventListener('input', updateSelectedValues);
    inputFrec1.addEventListener('input', updateSelectedValues);
    dataPolSelect.addEventListener('input', updateSelectedValues);
    dataStandSelect.addEventListener('change', updateSelectedValues);
    dataSpSelect.addEventListener('change', updateSelectedValues);
    dataModSelect.addEventListener('change', updateSelectedValues);
    inputHeightSeaLevel.addEventListener('input', updateSelectedValues);
    inputKSI.addEventListener('input', updateSelectedValues);


    // Обработчик для кнопки "Применить"
    applyButton.addEventListener('click', () => {
        sendData();
    });

    // Функция для отправки данных на сервер
    function sendData() {

        // Проверка на обязательные поля
        if (!selectedValues.standard || !selectedValues.speed || !selectedValues.modulation ||
            !selectedValues.polarization || !selectedValues.frequency || !selectedValues.satelliteLongitude ||
            !selectedValues.latitude || !selectedValues.longitude ||
            !selectedValues.Power || !selectedValues.AntennaGain ||
            !selectedValues.Width || !selectedValues.Hight ||
            !selectedValues.Azimuth || !selectedValues.Pol ||
            !selectedValues.Stand || !selectedValues.Sp ||
            !selectedValues.Mod || !selectedValues.HeightSeaLevel || !selectedValues.ksi) {
            alert("Пожалуйста, заполните все обязательные поля.");
            return; // Прерываем выполнение функции, если есть незаполненные поля
        }

        // Проверка на корректность координат
        if (isNaN(selectedValues.latitude) || isNaN(selectedValues.longitude)) {
            alert("Координаты должны быть числовыми значениями.");
            return; // Прерываем выполнение функции, если координаты некорректные
        }

        // Проверка на соответсвие значений (Азимут, мощность, ширина)
        if ((selectedValues.Azimuth <= 0 || selectedValues.Azimuth >= 360) ||
            (selectedValues.Power <= 0 || selectedValues.Power >= 2000) ||
            (selectedValues.Width <= 0 || selectedValues.Width >= 360) ||
            (selectedValues.ksi <= 0 || selectedValues.ksi >= 90)) {
            alert("Введены некоректные значения");
            return; // Прерываем выполнение функции, если значения некорректные 
        }

        // Обновление значений в selectedValues, если координаты не совпадают
        const inputLatValue = parseFloat(inputLat.value).toFixed(4);
        const inputLngValue = parseFloat(inputLng.value).toFixed(4);
        const inputHetSeLevel = parseFloat(inputHeightSeaLevel.value);

        if (inputLatValue !== selectedValues.latitude ||
            inputLngValue !== selectedValues.longitude ||
            inputHetSeLevel !== selectedValues.HeightSeaLevel) {
            selectedValues.latitude = inputLatValue; // Обновляем широту
            selectedValues.longitude = inputLngValue; // Обновляем долготу
            selectedValues.HeightSeaLevel = inputHetSeLevel;

        }

        fetch('http://localhost:3000/save', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(selectedValues)
            })
            .then(response => response.json())
            .then(data => {
                console.log('Данные успешно отправлены:', data);
            })
            .catch((error) => {
                console.error('Ошибка при отправке данных:', error);
            });
    }
});