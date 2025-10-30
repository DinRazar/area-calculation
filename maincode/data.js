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

    // Опции для кодовой скорости
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

    // Опции для типа модуляции
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

    // Обработчик события изменения выбора в первом селекте
    dataStandSelect.addEventListener('change', function() {
        // Очищаем второй и третий селекты
        dataSpSelect.innerHTML = '<option value="" disabled selected hidden> Кодовая скорость </option>';
        dataModSelect.innerHTML = '<option value="" disabled selected hidden> Тип модуляции </option>';

        // Получаем выбранное значение
        const selectedStand = this.value;

        // Проверяем, есть ли опции для выбранного стандарта
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

    // Функция для изменения значения "Помехи" в зависимости от выбранного стандарта наземного вещания
    dataStandSelect.addEventListener('change', function() {
            const inputP_pomexa = document.getElementById('inputP_pomexa');
            const selected = this.value;
            if (selected === 'dvbs') {
                inputP_pomexa.value = '4';
            } else if (selected === 'dvbs2') {
                inputP_pomexa.value = '2';
            }
            updateSelectedValues();
        })
        // Установка значений по умолчанию
    dataStandSelect.value = 'dvbs2'; // Выбор стандарта DVB-S2
    dataStandSelect.dispatchEvent(new Event('change')); // Вызываем событие изменения, чтобы заполнить speed и modulation
    dataSpSelect.value = '1/2'; // Установка кодовой скорости по умолчанию
    dataModSelect.value = 'QPSK'; // Установка типа модуляции по умолчанию
});

// считывание значений из полей при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    const dataStandardSelect = document.getElementById('dataStandard');
    const dataSpeedSelect = document.getElementById('dataSpeed');
    const dataModulationSelect = document.getElementById('dataModulation');
    const dataPolarizationSelect = document.getElementById('dataPolarization');

    const inputFrec = document.getElementById('inputFrec');
    const inputFrec1 = document.getElementById('inputFrec1');

    // inputFrec.value = 11;
    // inputFrec1.value = 11;

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
    const inputKSI = document.getElementById('inputKSI');
    const dataDropdown = document.getElementById('dataDropdown');

    const inputP_pomexa = document.getElementById('inputP_pomexa');
    const inputL_pol = document.getElementById('inputL_pol');
    const inputL_fider = document.getElementById('inputL_fider');
    const inputEinm = document.getElementById('inputEinm');

    const option_1 = document.getElementById('option1');
    const option_2 = document.getElementById('option2');
    const option_3 = document.getElementById('option3');
    // const option_4 = document.getElementById('option4');

    // Загружаем JSON данные
    fetch('http://localhost:3000/data.json')
        .then(response => response.json())
        .then(data => {
            // Применение данных из JSON в поля
            dataStandardSelect.value = data.standard;
            dataSpeedSelect.value = data.speed;
            dataModulationSelect.value = data.modulation;
            dataPolarizationSelect.value = data.polarization;
            inputLat.value = data.latitude;
            inputLng.value = data.longitude;
            inputPower.value = data.Power;
            inputAntennaGain.value = data.AntennaGain;
            inputWidth.value = data.Width;
            inputHeight.value = data.Hight;
            inputAzim.value = data.Azimuth;
            dataPolSelect.value = data.Pol;
            dataStandSelect.value = data.Stand;
            dataSpSelect.value = data.Sp;
            dataModSelect.value = data.Mod;
            inputHeightSeaLevel.value = data.HeightSeaLevel;
            inputKSI.value = data.ksi;

            inputP_pomexa.value = data.P_pomexa;
            inputL_pol.value = data.L_pol;
            inputL_fider.value = data.L_fider;
            inputEinm.value = data.Einm;

            // inputFrec.value = data.frequency;
            // inputFrec1.value = data.frequency1;

            // Установим долготу спутника
            satelliteLongitude = data.satelliteLongitude;
            // Загрузка данных о спутниках (например, из вашего другого JSON файла)
            dataDropdown.addEventListener('change', (event) => {
                const selectedOption = event.target.selectedOptions[0];
                satelliteLongitude = selectedOption.dataset.longitude; // Обновление долготы спутника
            });

            // Обновление стандартов и скорости на основе данных
            updateSpeedAndModulation(data.standard);
            updateMarkerFromInputs();

        })
        .catch(error => {
            console.error('Ошибка загрузки данных JSON:', error);
        });

    // Функция для обновления стандартов и модуляции/скорости
    function updateSpeedAndModulation(standard) {
        // Перезаполнение селектов в зависимости от выбранного стандарта
        const speedOptions = {
            dvbs: ['1/2', '2/3', '3/4', '5/6', '7/8'],
            dvbs2: ['1/4', '1/3', '2/5', '1/2', '3/5', '2/3', '3/4', '4/5'],
        };

        const modulationOptions = {
            dvbs: ['QPSK'],
            dvbs2: ['QPSK', '8-PSK', '16-APSK', '32-APSK'],
        };

        // Очищаем селекты
        dataSpeedSelect.innerHTML = '';
        dataModulationSelect.innerHTML = '';

        // Заполняем опции для выбранного стандарта
        if (speedOptions[standard]) {
            speedOptions[standard].forEach(option => {
                const opt = document.createElement('option');
                opt.value = option;
                opt.textContent = option;
                dataSpeedSelect.appendChild(opt);
            });
        }

        if (modulationOptions[standard]) {
            modulationOptions[standard].forEach(option => {
                const opt = document.createElement('option');
                opt.value = option;
                opt.textContent = option;
                dataModulationSelect.appendChild(opt);
            });
        }

        // Устанавливаем значение по умолчанию
        dataSpeedSelect.value = data.speed;
        dataModulationSelect.value = data.modulation;
    }

    // Объект для хранения выбранных значений
    let selectedValues = {
        standard: '',
        speed: '',
        modulation: '',
        polarization: '',
        frequency: '',
        frequency1: '', // Это значение нужно чисто мне
        satelliteLongitude: '',
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
        ksi: '',

        P_pomexa: '',
        L_pol: '',
        L_fider: '',
        Einm: '',

        option_1: '',
        option_2: '',
        option_3: '',
        // option_4: '',
    };


    // Функция для обновления выбранных значений
    function updateSelectedValues() {
        selectedValues.standard = dataStandardSelect.value;
        selectedValues.speed = dataSpeedSelect.value;
        selectedValues.modulation = dataModulationSelect.value;
        selectedValues.polarization = dataPolarizationSelect.value;

        selectedValues.frequency = inputFrec.value;
        selectedValues.frequency1 = inputFrec1.value;
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

        selectedValues.P_pomexa = inputP_pomexa.value;
        selectedValues.L_pol = inputL_pol.value;
        selectedValues.L_fider = inputL_fider.value;
        selectedValues.Einm = inputEinm.value;

        selectedValues.option_1 = option_1.checked ? '1' : '0';
        selectedValues.option_2 = option_2.checked ? '1' : '0';
        selectedValues.option_3 = option_3.checked ? '1' : '0';
        // selectedValues.option_4 = option_4.checked ? '1' : '0';
    }

    // ахахаха не работает \0_0/ 

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
    inputPower.addEventListener('input', updateSelectedValues); //Мощность передатчика
    inputAntennaGain.addEventListener('input', updateSelectedValues); //Коэффициент усиления антенны
    inputLat.addEventListener('input', updateSelectedValues); //Широта точки
    inputLng.addEventListener('input', updateSelectedValues); //Долгота точки
    inputWidth.addEventListener('input', updateSelectedValues); //Ширина главного лепестка
    inputHeight.addEventListener('input', updateSelectedValues); //Высота подъёма над уровнем земли
    inputAzim.addEventListener('input', updateSelectedValues); //Азимут направления главного лепестка

    inputFrec.addEventListener('change', updateSelectedValues); //Частота вещания 
    inputFrec1.addEventListener('change', updateSelectedValues); //Частота вещания

    dataPolSelect.addEventListener('input', updateSelectedValues); //Частота вещания тоже
    dataStandSelect.addEventListener('change', updateSelectedValues); //Кодовая скорость
    dataSpSelect.addEventListener('change', updateSelectedValues); //Кодовая скорость но другая
    dataModSelect.addEventListener('change', updateSelectedValues); //Тип модуляции но другой
    inputHeightSeaLevel.addEventListener('input', updateSelectedValues); //Высота над уровнем моря
    inputKSI.addEventListener('input', updateSelectedValues); //Угол подъёма антенны

    // inputP_pomexa.addEventListener('input', updateSelectedValues);
    inputP_pomexa.addEventListener('change', updateSelectedValues);
    inputL_pol.addEventListener('input', updateSelectedValues);
    inputL_fider.addEventListener('input', updateSelectedValues);
    inputEinm.addEventListener('change', updateSelectedValues);

    option_1.addEventListener('change', updateSelectedValues);
    option_2.addEventListener('change', updateSelectedValues);
    option_3.addEventListener('change', updateSelectedValues);
    // option_4.addEventListener('change', updateSelectedValues);

    // Обработчик для кнопки "Применить"
    applyButton.addEventListener('click', () => {
        sendData();
    });

    // Функция для отправки данных на сервер
    function sendData() {
        // Проверка на обязательные поля
        if (!selectedValues.standard || !selectedValues.speed || !selectedValues.modulation ||
            !selectedValues.polarization || !selectedValues.satelliteLongitude ||
            !selectedValues.latitude || !selectedValues.longitude ||
            !selectedValues.Power || !selectedValues.AntennaGain ||
            !selectedValues.Width || !selectedValues.Hight ||
            !selectedValues.Azimuth || !selectedValues.Pol ||
            !selectedValues.Stand || !selectedValues.Sp ||
            !selectedValues.Mod || !selectedValues.HeightSeaLevel || !selectedValues.ksi ||
            !selectedValues.Einm
        ) {
            // alert("Пожалуйста, заполните все обязательные поля.");
            return; // Прерываем выполнение функции, если  поля не заполнены
        }

        // Проверка на корректность координат
        if (isNaN(selectedValues.latitude) || isNaN(selectedValues.longitude)) {
            alert("Координаты должны быть числовыми значениями.");
            return; // Прерываем выполнение функции, если координаты некорректны
        }

        // Проверка на соответсвие значений (Азимут, мощность, ширина)
        if ((selectedValues.Azimuth <= -1 || selectedValues.Azimuth >= 360) ||
            (selectedValues.Power <= 0 || selectedValues.Power >= 2000) ||
            (selectedValues.Width <= 0 || selectedValues.Width >= 360) ||
            (selectedValues.ksi >= 91) ||
            (selectedValues.Einm <= -1 || selectedValues.Einm >= 151)
            // Вроде логично, ну раньше так работало, теперь не работает
            // ||
            // (selectedValues.latitude <= -90 || selectedValues.latitude >= 90) ||
            // (selectedValues.longitude <= -180 || selectedValues.longitude >= 180)
        ) {
            // alert("Введены некоректные значения");
            return; // Прерываем выполнение функции, если значения некорректны 
        }
        if (parseFloat(selectedValues.ksi) < 0.5 * (-parseFloat(selectedValues.Width))) {
            alert("Угол подъёма антенны должен быть больше минус половины ширины главного лепестка антены");
            return;
        }

        // Обновление значений в selectedValues, если координаты не совпадают (костыль от нерабочей штуки)
        const inputLatValue = parseFloat(inputLat.value).toFixed(4);
        const inputLngValue = parseFloat(inputLng.value).toFixed(4);
        const inputHetSeLevel = inputHeightSeaLevel.value;

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