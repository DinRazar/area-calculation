const express = require('express');
const fs = require('fs'); // Импортируем модуль fs
const xlsx = require('xlsx');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const { spawn } = require('child_process');
const multer = require('multer'); // Импортируем multer
const app = express();
const PORT = 3000;

app.use(cors()); // Разрешаем CORS для взаимодействия с клиентом
app.use(express.static(path.join(__dirname)));
app.use(bodyParser.json());

// Чтение данных из Excel и конвертация в JSON

// Настройка multer для загрузки файлов
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, './uploads'); // Папка, куда будут сохраняться загруженные файлы
    },
    filename: (req, file, cb) => {
        cb(null, file.originalname); // Сохраняем файл с оригинальным именем
    },
});

const upload = multer({ storage: storage });

// Эндпоинт для загрузки файла
app.post('/upload', upload.single('file'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ status: 'error', message: 'Файл не загружен' });
    }
    console.log('Файл загружен:', req.file);
    res.json({ status: 'success', message: 'Файл успешно загружен' });
});

// Эндпоинт для получения coordinates.json
app.get('/coordinates.json', (req, res) => {
    res.sendFile(path.join(__dirname, 'uploads', 'coordinates.json')); // Убедитесь, что файл находится в папке uploads
});

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


app.post('/save', (req, res) => {
    const data = req.body; // Получаем данные из запроса
    console.log('Полученные данные:', data);

    fs.writeFileSync('data.json', JSON.stringify(data, null, 2)); // Сохранения в файл json

    res.json({ status: 'success', message: 'Данные сохранены' });
});

// Новый маршрут для доступа к data.json
app.get('/data.json', (req, res) => {
    res.sendFile(path.join(__dirname, 'data.json'));
});


app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'))
});

app.listen(PORT, () => console.log(`Server is running on http://localhost:${PORT}`));