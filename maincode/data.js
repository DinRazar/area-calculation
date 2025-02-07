document.addEventListener('DOMContentLoaded', () => {
    const dataStandardSelect = document.getElementById('dataStandard');
    const dataSpeedSelect = document.getElementById('dataSpeed');
    const dataModulationSelect = document.getElementById('dataModulation');

    // Опции для кодовой скорости
    const speedOptions = {
        standard1: [
            { value: 'speed1', text: '1/2' },
            { value: 'speed2', text: '2/3' },
            { value: 'speed3', text: '3/4' },
            { value: 'speed4', text: '5/6' },
            { value: 'speed5', text: '7/8' },
        ],
        standard2: [
            { value: 'speed6', text: '1/4' },
            { value: 'speed7', text: '1/3' },
            { value: 'speed8', text: '2/5' },
            { value: 'speed9', text: '1/2' },
            { value: 'speed10', text: '3/5' },
            { value: 'speed11', text: '2/3' },
            { value: 'speed12', text: '3/4' },
            { value: 'speed13', text: '4/5' },
            { value: 'speed14', text: '5/6' },
            { value: 'speed15', text: '8/9' },
            { value: 'speed16', text: '9/10' },
        ],
    };

    // Опции для типа модуляции
    const modulationOptions = {
        standard1: [
            { value: 'modulation1', text: 'QPSK' }
        ],
        standard2: [
            { value: 'modulation2', text: 'QPSK' },
            { value: 'modulation3', text: '8-PSK' },
            { value: 'modulation4', text: '16APSK' },
            { value: 'modulation5', text: '32APSK' },
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
    const dataModSelect = document.getElementById('dataMod')

    const speedOption1 = {
        standard1: [
            { value: 'sp1', text: '1/2' },
            { value: 'sp2', text: '2/3' },
            { value: 'sp3', text: '3/4' },
            { value: 'sp4', text: '5/6' },
            { value: 'sp5', text: '7/8' },
        ],
        standard2: [
            { value: 'sp6', text: '1/4' },
            { value: 'sp7', text: '1/3' },
            { value: 'sp8', text: '2/5' },
            { value: 'sp9', text: '1/2' },
            { value: 'sp10', text: '3/5' },
            { value: 'sp11', text: '2/3' },
            { value: 'sp12', text: '3/4' },
            { value: 'sp13', text: '4/5' },
        ],
    };

    const modulationOptions1 = {
        standard1: [
            { value: 'mod1', text: 'QPSK' }
        ],
        standard2: [
            { value: 'mod2', text: 'QPSK' },
            { value: 'mod3', text: '8-PSK' },
            { value: 'mod4', text: '16APSK' },
            { value: 'mod5', text: '32APSK' },
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

    // Объект для хранения выбранных значений
    let selectedValues = {
        standard: '',
        speed: '',
        modulation: '',
        polarization: '',
        frequency1: '',
        frequency2: '',
        satelliteLongitude: '', // Долгота спутника
        latitude: '',
        longitude: '',
        Power: '',
        AntennaGain: '',
        Width: '',
        Hight: '',
        Azimuth: '',
        Pol: '',
        Stand: '',
        Sp: '',
        Mod: ''
    };

    // Функция для обновления выбранных значений
    function updateSelectedValues() {
        selectedValues.standard = dataStandardSelect.value;
        selectedValues.speed = dataSpeedSelect.value;
        selectedValues.modulation = dataModulationSelect.value;
        selectedValues.polarization = dataPolarizationSelect.value;
        selectedValues.frequency1 = inputFrec.value;
        selectedValues.frequency2 = inputFrec1.value;
        selectedValues.latitude = inputLat.value;
        selectedValues.longitude = inputLng.value;
        selectedValues.Power = inputPower.value;
        selectedValues.AntennaGain = inputAntennaGain.value;
        selectedValues.Width = inputWidth.value;
        selectedValues.Hight = inputHeight.value;
        selectedValues.Azimuth = inputAzim.value;
        selectedValues.Pol = dataPolSelect.value;
        selectedValues.Stand = dataStandSelect.value;
        selectedValues.Sp = dataSpSelect.value;
        selectedValues.Mod = dataModSelect.value;
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
    // inputLat.addEventListener('input', updateSelectedValues);
    // inputLng.addEventListener('input', updateSelectedValues);
    inputWidth.addEventListener('input', updateSelectedValues);
    inputHeight.addEventListener('input', updateSelectedValues);
    inputAzim.addEventListener('input', updateSelectedValues);
    inputFrec1.addEventListener('input', updateSelectedValues);
    dataPolSelect.addEventListener('input', updateSelectedValues);
    dataStandSelect.addEventListener('change', updateSelectedValues);
    dataSpSelect.addEventListener('change', updateSelectedValues);
    dataModSelect.addEventListener('change', updateSelectedValues)



    // Обработчик для кнопки "Применить"
    applyButton.addEventListener('click', () => {
        sendData();
    });

    // Функция для отправки данных на сервер
    function sendData() {
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