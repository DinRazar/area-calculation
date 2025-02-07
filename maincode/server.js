const express = require('express');
const fs = require('fs'); // Импортируем модуль fs
const xlsx = require('xlsx');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const { spawn } = require('child_process');
const app = express();
const PORT = 3000;

app.use(cors()); // Разрешаем CORS для взаимодействия с клиентом
app.use(express.static(path.join(__dirname)));
app.use(bodyParser.json());

// Чтение данных из Excel и конвертация в JSON

app.get('/data', (req, res) => {
    const workbook = xlsx.readFile('sput.xlsx');
    const sheetName = workbook.SheetNames[0]; // Используем первый лист
    const worksheet = workbook.Sheets[sheetName];
    const jsonData = xlsx.utils.sheet_to_json(worksheet); // Конвертируем в JSON
    res.json(jsonData); // Отправляем JSON на клиент

});

app.post('/save', (req, res) => {
    const data = req.body; // Получаем данные из запроса
    // console.log('Полученные данные:', data);

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