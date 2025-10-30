const express = require('express');
const fs = require('fs');
const xlsx = require('xlsx');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const { spawn } = require('child_process');
const { execFile } = require('child_process');
const multer = require('multer');

// const fs = require('fs').promises;
const axios = require('axios');

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

// ААААААААААААААААААААААААААААААААААААААААААААААААААААААААА
// Эндпоинт для скачивания тайлов только с CartoDB
// app.post('/download-tiles', async(req, res) => {
//     const { north, south, east, west, zoomLevels } = req.body;

//     // Проверяем, что переданы уровни
//     if (!zoomLevels || !Array.isArray(zoomLevels) || zoomLevels.length === 0) {
//         return res.status(400).json({
//             error: 'Не выбраны уровни масштабирования'
//         });
//     }

//     // Проверяем допустимый диапазон масштабов
//     for (const zoom of zoomLevels) {
//         if (zoom < 8 || zoom > 14) {
//             return res.status(400).json({
//                 error: 'Уровень масштабирования должен быть от 8 до 14'
//             });
//         }
//     }

//     try {
//         let totalDownloaded = 0;
//         let totalSkipped = 0;
//         let totalFailed = 0;
//         const results = {};

//         console.log(`Скачивание тайлов с CartoDB для уровней: ${zoomLevels.join(', ')}`);

//         // Скачиваем для каждого выбранного уровня
//         for (const zoom of zoomLevels) {
//             console.log(`=== Начинаем скачивание уровня ${zoom} ===`);

//             // Вычисляем диапазон тайлов для текущего уровня
//             const topLeft = latLngToTile(north, west, zoom);
//             const bottomRight = latLngToTile(south, east, zoom);

//             const xMin = Math.min(topLeft.x, bottomRight.x);
//             const xMax = Math.max(topLeft.x, bottomRight.x);
//             const yMin = Math.min(topLeft.y, bottomRight.y);
//             const yMax = Math.max(topLeft.y, bottomRight.y);

//             const levelTotalTiles = (xMax - xMin + 1) * (yMax - yMin + 1);

//             let levelDownloaded = 0;
//             let levelSkipped = 0;
//             let levelFailed = 0;

//             console.log(`Уровень ${zoom}: ${levelTotalTiles} тайлов, X:${xMin}-${xMax}, Y:${yMin}-${yMax}`);

//             // Создаем папку для масштаба если не существует
//             const zoomDir = path.join(__dirname, 'data', 'Tiles', zoom.toString());
//             await fs.mkdir(zoomDir, { recursive: true });

//             // Скачиваем тайлы для текущего уровня
//             for (let x = xMin; x <= xMax; x++) {
//                 const xDir = path.join(zoomDir, x.toString());
//                 await fs.mkdir(xDir, { recursive: true });

//                 for (let y = yMin; y <= yMax; y++) {
//                     const tilePath = path.join(xDir, `${y}.png`);

//                     // Проверяем, существует ли уже тайл
//                     try {
//                         await fs.access(tilePath);
//                         levelSkipped++;
//                         continue;
//                     } catch (error) {
//                         // Тайл не существует, скачиваем
//                     }

//                     // URL CartoDB
//                     const subdomains = ['a', 'b', 'c', 'd'];
//                     const subdomain = subdomains[Math.floor(Math.random() * subdomains.length)];
//                     const tileUrl = `https://${subdomain}.basemaps.cartocdn.com/light_all/${zoom}/${x}/${y}.png`;

//                     try {
//                         const response = await axios.get(tileUrl, {
//                             responseType: 'arraybuffer',
//                             timeout: 15000,
//                             headers: {
//                                 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
//                                 'Accept': 'image/webp,image/apng,image/*,*/*;q=0.8',
//                                 'Referer': 'https://carto.com/'
//                             }
//                         });

//                         if (response.data && response.data.length > 500) {
//                             await fs.writeFile(tilePath, response.data);
//                             levelDownloaded++;
//                         } else {
//                             levelFailed++;
//                         }

//                     } catch (error) {
//                         levelFailed++;
//                     }

//                     // Задержка между запросами
//                     await new Promise(resolve => setTimeout(resolve, 200));
//                 }
//             }

//             // Сохраняем результаты для уровня
//             results[zoom] = {
//                 downloaded: levelDownloaded,
//                 skipped: levelSkipped,
//                 failed: levelFailed,
//                 total: levelTotalTiles
//             };

//             totalDownloaded += levelDownloaded;
//             totalSkipped += levelSkipped;
//             totalFailed += levelFailed;

//             console.log(`Уровень ${zoom} завершен: ${levelDownloaded} скачано, ${levelSkipped} пропущено, ${levelFailed} ошибок`);
//         }

//         console.log(`Скачивание завершено! Всего: ${totalDownloaded} скачано, ${totalSkipped} пропущено, ${totalFailed} ошибок`);

//         res.json({
//             success: true,
//             downloadedCount: totalDownloaded,
//             skippedCount: totalSkipped,
//             failedCount: totalFailed,
//             zoomLevels: zoomLevels,
//             results: results,
//             message: `Скачано ${totalDownloaded} тайлов с CartoDB для уровней ${zoomLevels.join(', ')}`
//         });

//     } catch (error) {
//         console.error('Ошибка при скачивании тайлов:', error);
//         res.status(500).json({
//             error: 'Ошибка при скачивании тайлов с CartoDB',
//             details: error.message
//         });
//     }
// });

// Вспомогательная функция для создания директорий с промисами
function mkdirAsync(path, options = {}) {
    return new Promise((resolve, reject) => {
        fs.mkdir(path, options, (err) => {
            if (err && err.code !== 'EEXIST') reject(err);
            else resolve();
        });
    });
}

// Вспомогательная функция для проверки существования файла с промисами
function accessAsync(path) {
    return new Promise((resolve, reject) => {
        fs.access(path, (err) => {
            if (err) reject(err);
            else resolve();
        });
    });
}

// Вспомогательная функция для записи файла с промисами
function writeFileAsync(path, data) {
    return new Promise((resolve, reject) => {
        fs.writeFile(path, data, (err) => {
            if (err) reject(err);
            else resolve();
        });
    });
}

// Эндпоинт для скачивания тайлов
app.post('/download-tiles', async(req, res) => {
    const { north, south, east, west, zoomLevels } = req.body;

    // Проверяем, что переданы уровни
    if (!zoomLevels || !Array.isArray(zoomLevels) || zoomLevels.length === 0) {
        return res.status(400).json({
            error: 'Не выбраны уровни масштабирования'
        });
    }

    // Проверяем допустимый диапазон масштабов
    for (const zoom of zoomLevels) {
        if (zoom < 8 || zoom > 14) {
            return res.status(400).json({
                error: 'Уровень масштабирования должен быть от 8 до 14'
            });
        }
    }

    try {
        let totalDownloaded = 0;
        let totalSkipped = 0;
        let totalFailed = 0;
        const results = {};

        console.log(`Скачивание тайлов с CartoDB для уровней: ${zoomLevels.join(', ')}`);

        // Скачиваем для каждого выбранного уровня
        for (const zoom of zoomLevels) {
            console.log(`=== Начинаем скачивание уровня ${zoom} ===`);

            // Вычисляем диапазон тайлов для текущего уровня
            const topLeft = latLngToTile(north, west, zoom);
            const bottomRight = latLngToTile(south, east, zoom);

            const xMin = Math.min(topLeft.x, bottomRight.x);
            const xMax = Math.max(topLeft.x, bottomRight.x);
            const yMin = Math.min(topLeft.y, bottomRight.y);
            const yMax = Math.max(topLeft.y, bottomRight.y);

            const levelTotalTiles = (xMax - xMin + 1) * (yMax - yMin + 1);

            let levelDownloaded = 0;
            let levelSkipped = 0;
            let levelFailed = 0;

            console.log(`Уровень ${zoom}: ${levelTotalTiles} тайлов, X:${xMin}-${xMax}, Y:${yMin}-${yMax}`);

            // Создаем папку для масштаба если не существует
            const zoomDir = path.join(__dirname, 'data', 'Tiles', zoom.toString());
            await mkdirAsync(zoomDir, { recursive: true });

            // Скачиваем тайлы для текущего уровня
            for (let x = xMin; x <= xMax; x++) {
                const xDir = path.join(zoomDir, x.toString());
                await mkdirAsync(xDir, { recursive: true });

                for (let y = yMin; y <= yMax; y++) {
                    const tilePath = path.join(xDir, `${y}.png`);

                    // Проверяем, существует ли уже тайл
                    try {
                        await accessAsync(tilePath);
                        levelSkipped++;
                        continue;
                    } catch (error) {
                        // Тайл не существует, скачиваем
                    }

                    // URL CartoDB
                    const subdomains = ['a', 'b', 'c', 'd'];
                    const subdomain = subdomains[Math.floor(Math.random() * subdomains.length)];
                    const tileUrl = `https://${subdomain}.basemaps.cartocdn.com/light_all/${zoom}/${x}/${y}.png`;

                    try {
                        const response = await axios.get(tileUrl, {
                            responseType: 'arraybuffer',
                            timeout: 15000,
                            headers: {
                                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                                'Accept': 'image/webp,image/apng,image/*,*/*;q=0.8',
                                'Referer': 'https://carto.com/'
                            }
                        });

                        if (response.data && response.data.length > 500) {
                            await writeFileAsync(tilePath, response.data);
                            levelDownloaded++;
                            console.log(`✓ Уровень ${zoom}: скачан тайл ${x}/${y}`);
                        } else {
                            console.log(`✗ Уровень ${zoom}: пустой тайл ${x}/${y}`);
                            levelFailed++;
                        }

                    } catch (error) {
                        console.log(`✗ Уровень ${zoom}: ошибка загрузки ${x}/${y} - ${error.message}`);
                        levelFailed++;
                    }

                    // Задержка между запросами
                    await new Promise(resolve => setTimeout(resolve, 100));
                }
            }

            // Сохраняем результаты для уровня
            results[zoom] = {
                downloaded: levelDownloaded,
                skipped: levelSkipped,
                failed: levelFailed,
                total: levelTotalTiles
            };

            totalDownloaded += levelDownloaded;
            totalSkipped += levelSkipped;
            totalFailed += levelFailed;

            console.log(`Уровень ${zoom} завершен: ${levelDownloaded} скачано, ${levelSkipped} пропущено, ${levelFailed} ошибок`);
        }

        console.log(`Скачивание завершено! Всего: ${totalDownloaded} скачано, ${totalSkipped} пропущено, ${totalFailed} ошибок`);

        res.json({
            success: true,
            downloadedCount: totalDownloaded,
            skippedCount: totalSkipped,
            failedCount: totalFailed,
            zoomLevels: zoomLevels,
            results: results,
            message: `Скачано ${totalDownloaded} тайлов с CartoDB для уровней ${zoomLevels.join(', ')}`
        });

    } catch (error) {
        console.error('Ошибка при скачивании тайлов:', error);
        res.status(500).json({
            error: 'Ошибка при скачивании тайлов с CartoDB',
            details: error.message
        });
    }
});

// Вспомогательная функция для преобразования координат в тайлы
function latLngToTile(lat, lng, zoom) {
    const x = Math.floor((lng + 180) / 360 * Math.pow(2, zoom));
    const y = Math.floor((1 - Math.log(Math.tan(lat * Math.PI / 180) + 1 / Math.cos(lat * Math.PI / 180)) / Math.PI) / 2 * Math.pow(2, zoom));
    return { x, y };
}

// Добавляем маршрут для страницы скачивания
app.get('/download', (req, res) => {
    res.sendFile(path.join(__dirname, 'download.html'));
});

// // Добавляем маршрут для автоскачивания
// app.get('/download', (_req, res) => {
//     res.sendFile(path.join(__dirname, 'download-auto.html'));
// });

//AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAaa

// Открытие index.html по пути http://localhost:3000/
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'))
});

app.listen(PORT, () => console.log(`Server is running on http://localhost:${PORT}`));