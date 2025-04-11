const express = require('express');
const fs = require('fs');
const xlsx = require('xlsx');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const { spawn } = require('child_process');
const { execFile } = require('child_process');
const multer = require('multer');
const app = express();
const PORT = 3000;

app.use(cors()); // CORS для взаимодействия с API
app.use(express.static(path.join(__dirname)));
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ limit: '10mb', extended: true }));

// Настройка multer для загрузки файлов
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, '/uploads'); // Папка, куда будут сохраняться загруженные файлы
    },
    filename: (req, file, cb) => {
        cb(null, file.originalname); // Сохраняем файл с оригинальным именем
    },
});

// Взаимодействие с большими по объему файлами для избежания ошибок
const upload = multer({ storage: storage, imits: { fileSize: 10 * 1024 * 1024 } });

// Кеш для данных (не уверен, что мы вообще это использкем \0_0/)
let dataCache = null;

// Эндпоинт для загрузки файла (вообще не используется, но по хорошему надо потом это настроить)
app.post('/uploads', upload.single('file'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ status: 'error', message: 'Файл не загружен' });
    }
    console.log('Файл загружен:', req.file);
    res.json({ status: 'success', message: 'Файл успешно загружен' });
});

// Эндпоинт для получения coordinates.json (красный круг)
app.get('/coordinates.json', (req, res) => {
    res.sendFile(path.join(__dirname, 'coordinates.json'));
});

// Эндпоинт для получения coordinates_pomexa.json (жёлтый круг)
app.get('/coordinates_pomexa.json', (req, res) => {
    res.sendFile(path.join(__dirname, 'coordinates_pomexa.json'));
});

// Эндпоинт для получения coordinates_ellipse.json (зелёный эллипс)
app.get('/coordinates_ellipse.json', (req, res) => {
    res.sendFile(path.join(__dirname, 'coordinates_ellipse.json'));
});

// Эндпоинт для получения значений масштаба
app.get('/scale.json', (req, res) => {
    res.sendFile(path.join(__dirname, 'scale.json'));
});

// Чтение данных из Excel и конвертация в JSON
app.get('/data', (req, res) => {
    const workbook = xlsx.readFile('sput.xlsx');
    const sheetName = workbook.SheetNames[0]; // Используем первый лист
    const worksheet = workbook.Sheets[sheetName];
    const jsonData = xlsx.utils.sheet_to_json(worksheet); // Конвертируем в JSON
    res.json(jsonData); // Отправляем JSON на клиент

});

// Эндпоинт для получения высоты
app.post('/api/getElevation', (req, res) => {
    const { latitude, longitude } = req.body;

    // Запуск Python-скрипта с координатами
    const pythonProcess = spawn('python3', ['tiff.py', latitude, longitude]);

    pythonProcess.stdout.on('data', (data) => {
        const elevation = parseFloat(data.toString());
        res.json({ elevation });
    });

    pythonProcess.stderr.on('data', (data) => {
        console.error(`Ошибка: ${data}`);
        res.status(500).send('Ошибка при обработке запроса');
    });
});

// Место для работы с полигонами (потом будет сильно меняться и дорабатываться)
app.post('/save-polygon', (req, res) => {
    const polygon = req.body.polygon;

    if (!polygon || !Array.isArray(polygon)) {
        return res.status(400).json({ error: 'Некорректные данные' });
    }

    const filePath = path.join(__dirname, 'poly.json');
    fs.writeFile(filePath, JSON.stringify(polygon, null, 2), (err) => {
        if (err) {
            console.error('Ошибка при сохранении файла:', err);
            return res.status(500).json({ error: 'Ошибка сервера' });
        }

        console.log('Полигон сохранён в poly.json');
        res.json({ success: true });
    });
});

app.post('/save', (req, res) => {
    const data = req.body; // Получаем данные из запроса
    console.log('Полученные данные:', data);

    fs.writeFileSync('data.json', JSON.stringify(data, null, 2)); // Сохранения в файл json
    // Обновляем кеш
    dataCache = data; // Сохраняем данные в кеш
    res.json({ status: 'success', message: 'Данные сохранены' });
});

// Новый маршрут для доступа к data.json
app.get('/data.json', (req, res) => {
    res.sendFile(path.join(__dirname, 'data.json'));
});

// // Эндпоинт для получения данных из кеша или файла
// app.get('/data', (req, res) => {
//     if (dataCache) {
//         console.log('Отдаем данные из кеша');
//         return res.json(dataCache);
//     }

//     // Если кеш пуст, считываем данные из файла
//     const fileData = fs.readFileSync('data.json', 'utf-8');
//     dataCache = JSON.parse(fileData); // Кешируем данные из файла
//     console.log('Считываем данные из файла');
//     res.json(dataCache);
// });

// Эндпоинт для выполнения бинарника
app.post('/run-binary', (req, res) => {
    execFile('./Map', (error, stdout, stderr) => {
        if (error) {
            return res.status(500).json({ error: error.message });
        }
        res.json({ output: stdout, error: stderr });
    });
});

// Открытие index.html по пути http://localhost:3000/
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'))
});

app.listen(PORT, () => console.log(`Server is running on http://localhost:${PORT}`));