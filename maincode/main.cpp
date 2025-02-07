#include <iostream>
#include <string>
#include <curl/curl.h>

// Функция обратного вызова для записи данных
size_t WriteCallback(void* contents, size_t size, size_t nmemb, void* userp) {
    ((std::string*)userp)->append((char*)contents, size * nmemb);
    return size * nmemb;
}

int main() {
    CURL* curl;
    CURLcode res;
    std::string readBuffer;

    curl = curl_easy_init(); // Инициализация cURL
    if(curl) {
        curl_easy_setopt(curl, CURLOPT_URL, "http://localhost:3000/data.json"); // Установка URL
        curl_easy_setopt(curl, CURLOPT_WRITEFUNCTION, WriteCallback); // Установка функции обратного вызова
        curl_easy_setopt(curl, CURLOPT_WRITEDATA, &readBuffer); // Установка буфера для записи данных
        curl_easy_setopt(curl, CURLOPT_FOLLOWLOCATION, 1L); // Следовать за перенаправлениями

        res = curl_easy_perform(curl); // Выполнение запроса

        if(res != CURLE_OK) {
            std::cerr << "curl_easy_perform() failed: " << curl_easy_strerror(res) << std::endl;
        } else {
            std::cout << "Received data:\n" << readBuffer << std::endl; // Вывод полученных данных
        }

        curl_easy_cleanup(curl); // Очистка cURL
    }
    return 0;
}
