FROM node

# Установка зависимостей
RUN apt-get update && apt-get install -y \
    python3 python3-pip python3-venv \
    libc6 libstdc++6 libgcc-s1 libgomp1 \
    libgdal-dev libcurl4 qtbase5-dev libqt5core5a \
    && rm -rf /var/lib/apt/lists/*

# Настройка Python
RUN python3 -m venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"
RUN pip install --no-cache-dir rasterio

WORKDIR /usr/share/node/app

# Установка Node.js
COPY package*.json ./
RUN npm install

# Копирование всех файлов
COPY . .

# Перемещение папки Calculation_of_coverage_areas в /usr/share/
RUN mv ./Calculation_of_coverage_areas /usr/share/ && \
    chmod +x ./Map

# Установка полных прав
RUN chmod +x ./Map

EXPOSE 3000
CMD ["node", "server.js"]

