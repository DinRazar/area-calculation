#!/bin/bash

# Остановка и удаление старого контейнера (если он существует)
sudo docker stop area-calculation || true
sudo docker rm area-calculation || true
# Импортируем образ из файла mapsat.tar
docker load -i area-calculation.tar

# Запускаем контейнер в фоновом режиме с перенаправлением порта
docker run -d -p 3000:3000 --restart=always --name area-calculation area-calculation

# Открытие браузера с локальным адресом
echo http://localhost:3000  # Для Linux
# open http://localhost:3000  # Для macOS
