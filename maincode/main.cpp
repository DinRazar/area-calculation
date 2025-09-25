#include <QCoreApplication>
#include <iostream>
#include <fstream>
#include <string>
#include <cmath>
#include <vector>
#include <json.hpp>
#include <curl/curl.h>

using namespace std;
using nlohmann::json;

// Технические функции--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

// Отправка файлов json на сервер

void sendFileToLocalhost(const std::string& filePath)
{
    CURL* curl;
    CURLcode res;

    curl_global_init(CURL_GLOBAL_DEFAULT);
    curl = curl_easy_init();

    if (curl)
    {
        struct curl_slist* headers = NULL;
        headers = curl_slist_append(headers, "Content-Type: application/json");

        // Укажите URL вашего локального сервера

        //curl_easy_setopt(curl, CURLOPT_URL, "http://192.168.1.13:3000/data.json"); // Замените на ваш URL
        curl_easy_setopt(curl, CURLOPT_URL, "http://localhost:3000/data.json"); // Замените на ваш URL
        curl_easy_setopt(curl, CURLOPT_HTTPHEADER, headers);

        // Открываем файл для отправки

        FILE* file = fopen(filePath.c_str(), "rb");

        if (file)
        {
            curl_easy_setopt(curl, CURLOPT_READDATA, file);
            curl_easy_setopt(curl, CURLOPT_UPLOAD, 1L);

            // Выполняем запрос

            res = curl_easy_perform(curl);

            if (res != CURLE_OK)
            {
                std::cerr << "curl_easy_perform() failed: " << curl_easy_strerror(res) << std::endl;
            }

            fclose(file);
        }
        else
        {
            std::cerr << "Failed to open file: " << filePath << std::endl;
        }

        curl_slist_free_all(headers);
        curl_easy_cleanup(curl);
    }

    curl_global_cleanup();
}

// Функция обратного вызова для записи данных

size_t WriteCallback(void* contents, size_t size, size_t nmemb, void* userp)
{
    ((std::string*)userp)->append((char*)contents, size * nmemb);
    return size * nmemb;
}

// Функции ввода--------------------------------------------------------------------------------------------------------------------------------------------------------------------------

// Выделение числа между разделителями

int expression_number_section(string expression, int start, int finish)
{
    int number;
    int sign;
    int sign_count = 0;
    int first = 0;
    int expression_L = expression.length();
    string number_str = "";
    string::iterator it;
    string::iterator it_start = expression.begin() + start;
    string::iterator it_finish = expression.end() - expression_L + 1 + finish;

    for (it = it_start; it < it_finish; it++)
    {
        if (*it >= '0' && *it <= '9')
        {
            number_str = number_str + *it;
        }

        if ((first == 0 && *it == '-') || (first > 0 && *it == '-' && *(it - 1) != 'v' && *(it - 1) != 'V'))
        {
            ++sign_count;
        }

        ++first;
    }

    if (sign_count % 2 == 0)
    {
        sign = 1;
    }
    else
    {
        sign = -1;
    }

    number_str = "0" + number_str;
    number = sign * stoi(number_str);
    return number;
}

// Счётчик разделителей

int separator_str_count(string expression, string separator)
{
    unsigned separator_count{};
    size_t position;

    for (unsigned i{}; i < expression.length() - separator.length() + 1; i = position + 1)
    {
        position = expression.find(separator, i);
        if (position == std::string::npos) break;
        ++separator_count;
    }

    return separator_count;
}

// Преобразование строки в число с плавающей запятой

double double_str(string str)
{
    int separator_count = separator_str_count(str, ".");

    if (separator_count == 0)
    {
        return 1.0 * expression_number_section(str, 0, str.length() - 1);
    }
    else
    {
        int separator_number = str.find(".");
        double left = 1.0 * expression_number_section(str, 0, separator_number);
        double right = 1.0 * expression_number_section(str, separator_number, str.length() - 1);
        double logarifm;

        if (right == 0)
        {
            return left;
        }
        else
        {
            logarifm = 1.0 + floor(log10(right));
            return left + right / pow(10, logarifm);
        }
    }
}

// Математические функции----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

// Функция Лапласса

double Laplas(double x, int system, string std_way)
{
    string way;
    double line_number;
    double Laplas;

    if (x < 2.0)
    {
        if (system == 1)
        {
            way = "Mathematics\\Laplace_1.txt";
        }
        else if (system == 2)
        {
            way = std_way + "Mathematics/Laplace_1.txt";
        }

        ifstream in_6(way);
        line_number = (int)(x / 0.01);

        for (int i = 0; i < line_number; i++)
        {
            in_6.ignore(numeric_limits<streamsize>::max(), '\n');
        }

        in_6 >> Laplas;
    }
    else if (x < 3.0)
    {
        if (system == 1)
        {
            way = "Mathematics\\Laplace_2.txt";
        }
        else if (system == 2)
        {
            way = std_way + "Mathematics/Laplace_2.txt";
        }

        ifstream in_6(way);
        double x_0_02 = 0.02 * round(x / 0.02);
        line_number = (int)((x_0_02 - 2.0) / 0.02);

        for (int i = 0; i < line_number; i++)
        {
            in_6.ignore(numeric_limits<streamsize>::max(), '\n');
        }

        in_6 >> Laplas;
    }
    else
    {
        Laplas = 0.5;
    }

    return 0.5 - Laplas;

    // Тест:
    // cout << 0.3413 << "   " << 0.5 - Laplas(1.00) << endl;
    // cout << 0.4938 << "   " << 0.5 - Laplas(2.50) << endl;
    // cout << 0.5 << "   " << 0.5 - Laplas(3.50) << endl << endl;
}

// Обратная функция Лапласса

double Laplas_reverse(double x, int system, string std_way)
{
    string way;
    double Laplas_reverse = 0;
    double count = 0;

    if (0.5 - x < 0.4772)
    {
        if (system == 1)
        {
            way = "Mathematics\\Laplace_1.txt";
        }
        else if (system == 2)
        {
            way = std_way + "Mathematics/Laplace_1.txt";
        }

        ifstream in_6(way);

        while (count < 0.5 - x)
        {
            in_6 >> count;
            ++Laplas_reverse;
        }

        Laplas_reverse = (Laplas_reverse - 1) * 0.01;
    }
    else if (0.5 - x < 0.49865)
    {
        if (system == 1)
        {
            way = "Mathematics\\Laplace_2.txt";
        }
        else if (system == 2)
        {
            way = std_way + "Mathematics/Laplace_2.txt";
        }

        ifstream in_6(way);

        while (count < 0.5 - x)
        {
            in_6 >> count;
            ++Laplas_reverse;
        }

        Laplas_reverse = (Laplas_reverse - 1) * 0.02 + 2.0;
    }
    else
    {
        Laplas_reverse = 3.0;
    }

    return Laplas_reverse;

    // Тест:
    // cout << 1.00 << "   " << Laplas_reverse(0.5 - 0.3413) << endl;
    // cout << 2.50 << "   " << Laplas_reverse(0.5 - 0.4938) << endl;
    // cout << 3.00 << "   " << Laplas_reverse(0.5 - 0.49988) << endl << endl;
}

// Геометрические функции---------------------------------------------------------------------------------------------------------------------------------------------------------------------------

// Альтернативная долгота (градусы) (от 0 до 360)

double alternative(double lon)
{
    double lon_alt;

    if (lon < 0)
    {
        lon_alt = 360.0 + lon;
    }
    else
    {
        lon_alt = lon;
    }

    return lon_alt;
}

// Инверсия азимута

double inverse(double azimuth)
{
    if (azimuth > 180)
    {
        return azimuth - 180;
    }
    else
    {
        return azimuth + 180;
    }
}

// Аргумент

double arg(double x, double y)
{
    const double pi = 3.14159265;  // Число пи
    double arg;

    if (x == 0 && y > 0)
    {
        return 90;
    }
    else if (x == 0 && y < 0)
    {
        return -90;
    }
    else
    {
        arg = 180 / pi * atan(y / x);

        if (x > 0)
        {
            return arg;
        }
        else if (y > 0)
        {
            return arg + 180;
        }
        else
        {
            return arg - 180;
        }
    }
}

// Угловое расстояние

double delta_angle(double angle_1, double angle_2)
{
    double delta_angle = abs(angle_1 - angle_2);

    if (delta_angle > 180)
    {
        delta_angle = 360 - delta_angle;
    }

    return delta_angle;
}

// Угол поляризации

double angle_of_polarization(string polarization)
{
    double angle_polarization = 0;

    if (polarization == "R")
    {
        angle_polarization = 45;
    }
    else if (polarization == "L")
    {
        angle_polarization = -45;
    }
    else if (polarization == "H")
    {
        angle_polarization = 0;
    }
    else if (polarization == "V")
    {
        angle_polarization = 90;
    }

    return angle_polarization;
}

// Проекция длины на географическую плоскость для широты

double projection_lat(double lat, double lon, double azimuth)
{
    // Константы

    const double pi = 3.14159265;  // Число пи

    // Вычисление проекции

    return lat * cos(azimuth / 180 * pi) - lon * sin(azimuth / 180 * pi);
}

// Проекция длины на географическую плоскость для долготы

double projection_lon(double lat, double lon, double azimuth)
{
    // Константы

    const double pi = 3.14159265;  // Число пи

    // Вычисление проекции

    return lat * sin(azimuth / 180 * pi) + lon * cos(azimuth / 180 * pi);
}

// Полярный угол спутника

double teta(double lat, double lon, double lon_sp)
{
    // Константы

    const double pi = 3.14159265;  // Число пи
    const double R = 6371;  // Радиус Зесли (км)
    const double H_sp = 42170;  // Высота геостационарной орбиты спутника над центром Земли (км)

    // Результат выполнения функции

    return 180 / pi * asin((H_sp * cos(lat / 180 * pi) * cos((lon - lon_sp) / 180 * pi) - R) / pow(pow(H_sp, 2) + pow(R, 2) - 2 * H_sp * R * cos(lat / 180 * pi) * cos((lon - lon_sp) / 180 * pi), 0.5));
}

// Азимут спутника

double azimuth(double lat, double lon, double lon_sp)
{
    // Константы

    const double pi = 3.14159265;  // Число пи

    // Расчёт азимута

    int k_azimuth = 0;

    if (lat > 0)
    {
        k_azimuth = 1;
    }

    // Результат выполнения функции

    return 180 / pi * atan(tan((lon - lon_sp) / 180 * pi) / (sin(lat / 180 * pi))) + k_azimuth * 180;
}

// Естественное ослабление в земных масштабах

double Natural(double lat_1, double lon_1, double h_1, double lat_2, double lon_2, double h_2, double f)
{
    // Константы

    const double pi = 3.14159265;  // Число пи
    const double R = 6371;  // Радиус Зесли (км)
    const double c = 3 * pow(10, 5);  // Скорость света (км/c)

    // Рассчёт расстояния между точками

    double d = pow((pow((lat_1 - lat_2) / 180 * pi, 2) + pow((lon_1 - lon_2) / 180 * pi * cos((lat_1 + lat_2) / 2 / 180 * pi), 2)) * pow(R, 2) + pow(h_1 - h_2, 2), 0.5);

    // Рассчёт естественного ослабления сигнала

    double L = 20 * log10(4 * pi * d * f * pow(10, 9) / c);

    // Результат выполнения функции

    return L;
}

// Естественное ослабление в космических масштабах

double Natural_space(double lat, double lon, double lon_sp, double f, int output)
{
    // Константы

    const double pi = 3.14159265;  // Число пи
    const double R = 6371;  // Радиус Зесли (км)
    const double H_sputnik = 42170;  // Высота геостационарной орбиты спутника над центром Земли (км)
    const double c = 3 * pow(10, 5);  // Скорость света (км/c)

    // Рассчёт расстояния между точками

    double d_sp = pow(pow(H_sputnik, 2) + pow(R, 2) - 2 * H_sputnik * R * cos(lat / 180 * pi) * cos((lon - lon_sp) / 180 * pi), 0.5);

    // Вывод расстояния до спутника

    if (output == 1)
    {
        cout << endl;
        cout << "Sputnik and dron:__________________________________________________________________________________________________________" << endl << endl;

        cout << "d_sp = " << d_sp << " km" << endl << endl;
    }

    // Рассчёт естественного ослабления сигнала

    double L = 20 * log10(4 * pi * d_sp * f * pow(10, 9) / c);

    // Результат выполнения функции

    return L;
}

// Предельное расстояние сигнала

double Signal_limit(double L_pomexa, double f)
{
    // Константы

    const double pi = 3.14159265;  // Число пи
    const double c = 3 * pow(10, 5);  // Скорость света (км/c)

    // Рассчёт расстояния до помехи

    double d_pomexa = pow(10, L_pomexa / 20) * c / (4 * pi * f * pow(10, 9));

    // Результат выполнения функции

    return d_pomexa;
}

// Функции ослабления----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

// Рассчёт высоты слоя дождя

double height_rain(double lat, double lon, int system, string std_way)
{
    string way;
    double lon_alt = alternative(lon);
    double lat_round_1_5 = 1.5 * round(lat / 1.5);
    double lon_alt_round_1_5 = 1.5 * round(lon_alt / 1.5);
    int line_number = (int)((90.0 - lat_round_1_5) / 1.5);
    int column_number = (int)(lon_alt_round_1_5 / 1.5);
    double h_0 = 0;
    double h_R;

    if (system == 1)
    {
        way = "839\\h0.txt";
    }
    else if (system == 2)
    {
        way = std_way + "839/h0.txt";
    }

    ifstream in_1(way);

    if (in_1.is_open())
    {
        for (int i = 0; i < line_number; i++)
        {
            in_1.ignore(numeric_limits<streamsize>::max(), '\n');
        }

        for (int i = 0; i < column_number + 1; i++)
        {
            in_1 >> h_0;
        }
    }

    in_1.close();
    h_R = h_0 + 0.36;
    return h_R;

    // Тест: h_R(-87; -3 / 357) = 3.093
}

// Длина горизонтальной проекции наклонной трассы ниже высоты слоя дождя для спутника

double oblique(double lat, double lon, double lon_sp, double h_S, int system, string std_way)
{
    const double pi = 3.14159265;  // Число пи
    const double R_e = 8500;  // Эффективный радиус Земли (км)
    double teta_main = teta(lat, lon, lon_sp);
    double h_R = height_rain(lat, lon, system, std_way);
    double L_S;

    if (teta_main < 0)
    {
        L_S = 0;
    }
    else if (teta_main > 5)
    {
        L_S = (h_R - h_S) / sin(teta_main / 180 * pi);
    }
    else
    {
        L_S = 2 * (h_R - h_S) / (pow(pow(sin(teta_main / 180 * pi), 2) + 2 * (h_R - h_S) / R_e, 0.5) + sin(teta_main / 180 * pi));
    }

    double L_G = L_S * cos(teta_main / 180 * pi);
    return L_G;
}

// Температура воздуха

double temperature(double lat, double lon, int system, string std_way)
{
    // Путь файла

    string way;

    // Константы

    const double T_0 = 273.15;  // Температура абсолютного нуля (К)

    // Квантование координат

    double lat_round_0_75 = 0.75 * round(lat / 0.75);
    double lon_round_0_75 = 0.75 * round(lon / 0.75);

    // Температура в конкретном месяце

    int line_number = (int)((90.0 + lat_round_0_75) / 0.75);
    int column_number = (int)((180.0 + lon_round_0_75) / 0.75);
    vector<double> T_Month;
    vector<double> T_C_Month;

    for (int i = 0; i < 12; i++)
    {
        T_Month.push_back(0);
        T_C_Month.push_back(0);
    }

    for (int i = 0; i < 12; i++)
    {
        if (system == 1)
        {
            way = "1510\\T_Month" + to_string(i + 1) + ".txt";
        }
        else if (system == 2)
        {
            way = std_way + "1510/T_Month" + to_string(i + 1) + ".txt";
        }


        ifstream in_2(way);

        if (in_2.is_open())
        {
            for (int j = 0; j < line_number; j++)
            {
                in_2.ignore(numeric_limits<streamsize>::max(), '\n');
            }

            for (int j = 0; j < column_number + 1; j++)
            {
                in_2 >> T_Month[i];
            }
        }

        in_2.close();
        T_C_Month[i] = T_Month[i] - T_0;
    }

    // Тест: T_Month[0](88.5; 178.5 / 178.5) = 245.717

    // Число дней в месяце

    vector<double> N_Month;

    N_Month.push_back(31.0);
    N_Month.push_back(28.25);
    N_Month.push_back(31.0);
    N_Month.push_back(30.0);
    N_Month.push_back(31.0);
    N_Month.push_back(30.0);
    N_Month.push_back(31.0);
    N_Month.push_back(31.0);
    N_Month.push_back(30.0);
    N_Month.push_back(31.0);
    N_Month.push_back(30.0);
    N_Month.push_back(31.0);

    // Средняя температура воздуха

    double T_up = 0;
    double T_down = 0;

    for (int i = 0; i < 12; i++)
    {
        T_up = T_up + T_Month[i] * N_Month[i];
        T_down = T_down + N_Month[i];
    }

    double T = T_up / T_down;

    // Результат выполнения функции

    return T;
}

// Ослабления в дожде

double rain(double lat, double lon, double lon_sp, double h_S, double L_G, double f, double p, int system, string std_way, string polarization)
{
    // Путь к файлам

    string way;

    // Константы

    const double pi = 3.14159265;  // Число пи

    // Квантование координат

    double lat_round_0_25 = 0.25 * round(lat / 0.25);
    double lon_round_0_25 = 0.25 * round(lon / 0.25);

    double lat_round_0_125 = 0.125 * round(lat / 0.125);
    double lon_round_0_125 = 0.125 * round(lon / 0.125);

    int line_number;
    int column_number;

    // Угол места

    double teta_main = teta(lat, lon, lon_sp);

    // Высота слоя дождя

    double h_R = height_rain(lat, lon, system, std_way);

    // Интенсивность осадков

    line_number = (int)((90.0 + lat_round_0_25) / 0.25);
    column_number = (int)((180.0 + lon_round_0_25) / 0.25);
    vector<double> MT_Month;

    for (int i = 0; i < 12; i++)
    {
        MT_Month.push_back(0);
    }

    for (int i = 0; i < 12; i++)
    {
        if (system == 1)
        {
            way = "837\\MT_Month" + to_string(i + 1) + ".txt";
        }
        else if (system == 2)
        {
            way = std_way + "837/MT_Month" + to_string(i + 1) + ".txt";
        }

        ifstream in_3(way);

        if (in_3.is_open())
        {
            for (int j = 0; j < line_number; j++)
            {
                in_3.ignore(numeric_limits<streamsize>::max(), '\n');
            }

            for (int j = 0; j < column_number + 1; j++)
            {
                in_3 >> MT_Month[i];
            }
        }

        in_3.close();
    }

    // Тест: MT_Month[0](89.75; 179.75 / 179.75) = 0.723

    // Интеграл вероятности превышения заданной интенсивности осадков

    line_number = (int)((90.0 + lat_round_0_125) / 0.125);
    column_number = (int)((180.0 + lon_round_0_125) / 0.125);
    double R_001 = 1.0;

    if (system == 1)
    {
        way = "837\\R001.txt";
    }
    else if (system == 2)
    {
        way = std_way + "837/R001.txt";
    }

    ifstream in_4(way);

    if (in_4.is_open())
    {
        for (int i = 0; i < line_number; i++)
        {
            in_4.ignore(numeric_limits<streamsize>::max(), '\n');
        }

        for (int i = 0; i < column_number + 1; i++)
        {
            in_4 >> R_001;
        }
    }

    in_4.close();

    // Тест: R_001(89.75; 179.75 / 179.75) = 6.069

    // Погонное ослабление в дожде

    double k_H = 0;
    double a_H = 0;
    double k_V = 0;
    double a_V = 0;

    double a_j = 0;
    double b_j = 0;
    double c_j = 0;

    // Коэффициенты k_H

    for (int j = 1; j < 5; j++)
    {
        if (system == 1)
        {
            way = "838\\838_1.txt";
        }
        else if (system == 2)
        {
            way = std_way + "838/838_1.txt";
        }

        ifstream in_5(way);

        for (int i = 0; i < j - 1; i++)
        {
            in_5.ignore(numeric_limits<streamsize>::max(), '\n');
        }

        in_5 >> a_j;
        in_5 >> b_j;
        in_5 >> c_j;
        k_H = k_H + a_j * exp(-1 * pow((log10(f) - b_j) / c_j, 2));
    }

    // Коэффициенты k_V

    for (int j = 1; j < 5; j++)
    {
        if (system == 1)
        {
            way = "838\\838_2.txt";
        }
        else if (system == 2)
        {
            way = std_way + "838/838_2.txt";
        }

        ifstream in_5(way);

        for (int i = 0; i < j - 1; i++)
        {
            in_5.ignore(numeric_limits<streamsize>::max(), '\n');
        }

        in_5 >> a_j;
        in_5 >> b_j;
        in_5 >> c_j;
        k_V = k_V + a_j * exp(-1 * pow((log10(f) - b_j) / c_j, 2));
    }

    // Коэффициенты a_H

    for (int j = 1; j < 6; j++)
    {
        if (system == 1)
        {
            way = "838\\838_3.txt";
        }
        else if (system == 2)
        {
            way = std_way + "838/838_3.txt";
        }

        ifstream in_5(way);

        for (int i = 0; i < j - 1; i++)
        {
            in_5.ignore(numeric_limits<streamsize>::max(), '\n');
        }

        in_5 >> a_j;
        in_5 >> b_j;
        in_5 >> c_j;
        a_H = a_H + a_j * exp(-1 * pow((log10(f) - b_j) / c_j, 2));
    }

    // Коэффициенты a_V

    for (int j = 1; j < 6; j++)
    {
        if (system == 1)
        {
            way = "838\\838_4.txt";
        }
        else if (system == 2)
        {
            way = std_way + "838/838_4.txt";
        }

        ifstream in_5(way);

        for (int i = 0; i < j - 1; i++)
        {
            in_5.ignore(numeric_limits<streamsize>::max(), '\n');
        }

        in_5 >> a_j;
        in_5 >> b_j;
        in_5 >> c_j;
        a_V = a_V + a_j * exp(-1 * pow((log10(f) - b_j) / c_j, 2));
    }

    // Добавление частотного слагаемого

    k_H = k_H - 0.18961 * log10(f) + 0.71147;
    k_V = k_V - 0.16398 * log10(f) + 0.63297;
    a_H = a_H + 0.67849 * log10(f) - 1.95537;
    a_V = a_V - 0.053739 * log10(f) + 0.83433;

    // Потенциирование

    k_H = pow(10, k_H);
    k_V = pow(10, k_V);

    // Степенной закон погонного ослабления

    double angle_polarization = angle_of_polarization(polarization);
    double k = (k_H + k_V + (k_H - k_V) * pow(cos(teta_main / 180 * pi), 2) * cos(2 * angle_polarization / 180 * pi)) / 2;
    double a = (k_H * a_H + k_V * a_V + (k_H * a_H - k_V * a_V) * pow(cos(teta_main / 180 * pi), 2) * cos(2 * angle_polarization / 180 * pi)) / (2 * k);
    double gamma_R = k * pow(R_001, a);

    // Вычисление коээфициента ослабления по горизонтали

    double r_001 = 1.0 / (1.0 + 0.78 * pow(L_G * gamma_R / f, 0.5) - 0.38 * (1.0 - exp(-2.0 * L_G)));

    // Вертикальный подстроичный угол

    double zeta = 180 / pi * atan((h_R - h_S) / (L_G * r_001));

    // Вертикальная подстроичная длина

    double L_R;

    if (zeta > 0)
    {
        L_R = (L_G * r_001) / cos(teta_main / 180 * pi);
    }
    else
    {
        L_R = (h_R - h_S) / sin(teta_main / 180 * pi);
    }

    // Квазиширота

    double chi;

    if (abs(lat) < 36)
    {
        chi = 36 - abs(lat);
    }
    else
    {
        chi = 0;
    }

    // Коэффициент подстройки по вертикали

    double nu_001 = 1.0 / (1.0 + pow(sin(teta_main / 180 * pi), 0.5) * (31.0 * (1 - exp(-1.0 * teta_main / (180 / pi + chi))) * pow(L_R * gamma_R, 0.5) / pow(f, 2) - 0.45));

    // Эффективная длина трассы

    double L_E = L_R * nu_001;

    // Прогнозируемое значение ослабления в течение 0.01% времени

    double A_001 = gamma_R * L_E;

    // Прогнозируемое значение ослабления для других процентов времени

    double beta;

    if (p > 1 || abs(lat) > 36)
    {
        beta = 0;
    }
    else if (p < 1 && abs(lat) < 36 && teta_main > 25)
    {
        beta = -0.005 * (abs(lat) - 36);
    }
    else
    {
        beta = -0.005 * (abs(lat) - 36) + 1.8 - 4.25 * sin(teta_main / 180 * pi);
    }

    double A_p = A_001 * pow(p / 0.01, -1.0 * (0.655 + 0.033 * log(p) - 0.045 * log(A_001) - beta * (1 - p) * sin(teta_main / 180 * pi)));

    // Результат выполнения функции

    return A_p;
}

// Ослабление засчёт кросс-поляризации

double cross(double lat, double lon, double lon_sp, double f, double  p, double A_p, int system, string std_way, string polarization)
{  
    // Константы

    const double pi = 3.14159265;  // Число пи

    // Азимутальные координаты спутника

    double teta_main = teta(lat, lon, lon_sp);

    // Частотно-зависимая составляющая

    double C_f = 0;

    if (f >= 6 && f < 9)
    {
        C_f = 60 * log10(f) - 28.3;
    }
    else if (f >= 9 && f < 36)
    {
        C_f = 26 * log10(f) + 4.1;
    }
    else if (f >= 36 && f < 55)
    {
        C_f = 35.9 * log10(f) - 11.3;
    }

    // Составляюшая, зависимая от ослабления в дожде

    double V_f = 0;

    if (f >= 6 && f < 9)
    {
        V_f = 30.8 * pow(f, -0.21);
    }
    else if (f >= 9 && f < 20)
    {
        V_f = 12.8 * pow(f, 0.19);
    }
    else if (f >= 20 && f < 40)
    {
        V_f = 22.6;
    }
    else if (f >= 40 && f < 55)
    {
        V_f = 13.0 * pow(f, 0.15);
    }

    double C_A = V_f * A_p;

    // Коэффициент улучшения засчёт поляризации

    double angle_polarization = angle_of_polarization(polarization);
    double C_taw = -10 * log10(1 - 0.484 * (1 + cos(4 * angle_polarization / 180 * pi)));

    // Составляющая, зависящая от угла места

    double C_teta = -40 * log10(cos(teta_main / 180 * pi));

    // Составляющая, зависящая от угла наклона

    double sigma = 0;

    if (p == 1)
    {
        sigma = 0;
    }
    else if (p == 0.1)
    {
        sigma = 5;
    }
    else if (p == 0.01)
    {
        sigma = 10;
    }
    else if (p == 0.001)
    {
        sigma = 15;
    }
    else
    {
        cout << "ERROR: There is no sigma for this p";
    }

    double С_sigma = 0.0053 * pow(sigma, 2);

    // Величина кросс-поляризации

    double XPD_rain = C_f - C_A + C_taw + C_teta + С_sigma;

    // Составляющая, учитывающая влияние льда

    double C_ice = XPD_rain * (0.3 + 0.1 * log10(p)) / 2;

    // Величина кросс-поляризации с учётом влияния льда

    double XPD_p = XPD_rain - C_ice;

    // Нормальное распределение

    double normal_sigma = 0.038;
    double centre = pow(10, -XPD_rain / 20);
    double r = pow(10, -XPD_p / 20);
    double delta = abs(r - centre) / normal_sigma;
    double P_XPD = 0.5 - Laplas(delta, system, std_way);
    double XPD = P_XPD * XPD_p;

    // Итоговое ослабление

    return XPD;
}

// Ослабление засчёт отражения от препятствий

double barrier(double lat, double lon, double lon_sp, double f)
{
    // Констатны

    const double pi = 3.14159265;  // Число пи

    // Азимутальные координаты спутника

    double teta_main = teta(lat, lon, lon_sp);

    // Расчёт ослабления

    double K_1 = 93 * pow(f, 0.175);
    double L_ces = pow(K_1 * log(2) / tan(0.05 * (1 - teta_main / 90) + teta_main / 180 * pi), 0.5 * (90 - teta_main) / 90) - 1;

    // Результат выполнения функции

    return L_ces;
}

// Ослабление засчёт замираний

double fading(double lat, double lon, double lon_sp, double neta, double D, double f, double p, int system, string std_way)
{
    // Путь к файлам

    string way;

    // Константы

    const double pi = 3.14159265;  // Число пи
    const double h_L = 1000;  // Высота турбулентности (км)

    // Альтернативная долгота

    double lon_alt = alternative(lon);

    // Азимутальные координаты спутника

    double teta_main = teta(lat, lon, lon_sp);

    // Квантование координат

    double lat_round_1_125 = 1.125 * round(lat / 1.125);
    double lon_alt_round_1_125 = 1.125 * round(lon_alt / 1.125);

    // Плотность водяных паров

    int line_number = (int)((90.0 - lat_round_1_125) / 1.125);
    int column_number = (int)(lon_alt_round_1_125 / 1.125);
    double ro_h_0 = 0;

    if (system == 1) // Угол наклона оси поляризации (градусы)
    {
        way = "836\\RHO\\RHO_5_v4.txt";
    }
    else if (system == 2)
    {
        way = std_way + "836/RHO/RHO_5_v4.txt";
    }

    ifstream in_6(way);

    if (in_6.is_open())
    {
        in_6 >> ro_h_0;

        for (int i = 0; i < line_number; i++)
        {
            in_6.ignore(numeric_limits<streamsize>::max(), '\n');
        }

        for (int i = 0; i < column_number + 1; i++)
        {
            in_6 >> ro_h_0;
        }
    }

    in_6.close();

    // Тест: ro(-88.875; -1.125 / 358.875) = 0.85608

    // Температура водяных паров

    double T = temperature(lat, lon, system, std_way);

    // Давление водяных паров

    double e = ro_h_0 * T / 216.7;

    // Рефракция радиоволн влажным воздухом

    double N_wet = 72.0 * e / T + 3.75 * pow(10, 5) * e / pow(T, 2);

    // Стандартное отклонение амплитуды эталонного сигнала

    double sigma_ref = 3.6 * pow(10, -3) + N_wet * pow(10, -4);

    // Эффективная длина трассы

    double L = 2.0 * h_L / (pow(pow(sin(teta_main / 180 * pi), 2) + 2.35 * pow(10, -4), 0.5) + sin(teta_main / 180 * pi));

    // Эффективный диаметр антенны

    double D_eff = pow(neta, 0.5) * D;

    // Параметр усреднения

    double x = 1.22 * pow(D_eff, 2) * f / L;
    double A_s = 0;

    if (x > 7)
    {
        A_s = 0;
    }
    else
    {
        // Коэффициент усреднения антенны

        double g = pow(3.86 * pow(pow(x, 2) + 1, 11.0 / 12.0) * sin(11.0 / 6.0 * atan(1 / x)) - 7.08 * pow(x, 5.0 / 6.0), 0.5);

        // Стандартное отклонение сигнала

        double sigma = sigma_ref * pow(f, 7.0 / 12.0) * g / pow(sin(teta_main / 180 * pi), 1.2);

        // Коэффициент процента времени

        double a_p_1 = -0.061 * pow(log10(p), 3) + 0.072 * pow(log10(p), 2) - 1.71 * log10(p) + 3.0;

        // Глубина замираний

        A_s = a_p_1 * sigma;
    }

    // Результат выполнения функции

    return A_s;
}

// Суммарное ослабление

double A_result(double A_p, double XPD, double L_ces, double A_s, int option_1, int option_2, int option_3, int option_4)
{
    double A_result = option_1 * pow(A_p, 2) + option_2 * pow(XPD, 2) + option_3 * pow(L_ces, 2) + option_4 * pow(A_s, 2);
    return pow(A_result, 0.5);
}

// Сигнальные функции-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

// Максимальный сигнал спутника

double sputnic_max(double D, double f, double neta)
{
    // Константы

    const double pi = 3.14159265;  // Число пи
    const double c = 3 * pow(10, 5);  // Скорость света (км/c)

    // Рассчёт максимального сигнала антенны

    double G_max = 10 * log10(neta * pow(pi * D * f * pow(10, 6) / c, 2));

    // Результат выполнения функции

    return G_max;
}

// Диаграмма направленности антенны

double Diagram(double D, double f, double neta, double psi, int output)
{
    // Константы

    const double pi = 3.14159265;  // Число пи
    const double c = 3 * pow(10, 5);  // Скорость света (км/c)

    // Рассчёт диаграммы направленности антенны

    double G_max = 10 * log10(neta * pow(pi * D * f * pow(10, 6) / c, 2));
    double psi_max = 95 * c / (D * f * pow(10, 6));
    double G_1 = 29 - 25 * log10(psi_max);
    double psi_min = c / (D * f * pow(10, 6)) * sqrt(1000 * (G_max - G_1) / 2.5);
    double G_co = 0;

    if (psi > 0 && psi < psi_min)
    {
        G_co = G_max - 2.5 / 1000 * pow(psi * D * f * pow(10, 6), 2);
    }
    else if (psi > psi_min && psi < psi_max)
    {
        G_co = G_1;
    }
    else if (psi > psi_max && psi < 23)
    {
        G_co = 29 - 25 * log10(psi);
    }
    else if (psi > 23 && psi < 70)
    {
        G_co = -5;
    }
    else if (psi > 70 && psi < 180)
    {
        G_co = 0;
    }

    // Вывод функции

    if (output == 1)
    {
        cout << "G_max = " << G_max << endl;
        cout << "psi_max = " << psi_max << " grad" << endl;
        cout << "G_1 = " << G_1 << endl;
        cout << "psi_min = " << psi_min << " grad" << endl;
    }

    // Результат выполнения функции

    return G_co;
}

// Сигнал от спутника

double sputnik(double lat, double lon, double lon_sp, double h_S, double L_S_sputnik, double D, double p, double f, double neta, double E_iim, double L_fider, int option_1, int option_2, int option_3, int option_4, int system, int output, string std_way, vector<string> polarization)
{
    double E_iim_sp = E_iim + 30;
    double K_lnb = 55;
    double G_max = sputnic_max(D, f, neta);
    double L_sp = Natural_space(lat, lon, lon_sp, f, output);
    double A_p_sp = rain(lat, lon, lon_sp, h_S, L_S_sputnik, f, p, system, std_way, polarization[0]);
    double XPD_sp = cross(lat, lon, lon_sp, f, p, A_p_sp, system, std_way, polarization[0]);
    double L_ces_sp = 0;
    double A_s_sp = fading(lat, lon, lon_sp, neta, D, f, p, system, std_way);
    double A_res_sp = A_result(A_p_sp, XPD_sp, A_s_sp, L_ces_sp, option_1, option_2, option_3, option_4);
    double P_res_sp = E_iim_sp - L_sp - A_res_sp + G_max + K_lnb - L_fider;
    return P_res_sp;
}

// Сигнал от дрона

double dron(double lat, double lon, double lat_0, double lon_0, double psi, double lon_sp, double h_S, double L_S_dron, double h_e, double D, double p, double f, double neta, double W, double k_dBi, double L_fider, int option_1, int option_2, int option_3, int option_4, int system, int output, string std_way, vector<string> polarization)
{
    double E_iim_dron = 10 * log10(1000 * W) + k_dBi;
    double K_lnb = 55;
    double G_co = Diagram(D, f, neta, psi, output);
    double L_dron = Natural(lat_0, lon_0, 0, lat, lon, h_e, f);
    double A_p_dron = rain(lat, lon, lon_sp, h_S, L_S_dron, f, p, system, std_way, polarization[1]);
    double XPD_dron = cross(lat, lon, lon_sp, f, p, A_p_dron, system, std_way, polarization[1]);
    double L_ces_dron = barrier(lat, lon, lon_sp, f);
    double A_s_dron = fading(lat, lon, lon_sp, neta, D, f, p, system, std_way);
    double A_res_dron = A_result(A_p_dron, XPD_dron, L_ces_dron, A_s_dron, option_1, option_2, option_3, option_4);
    double P_res_dron = E_iim_dron - L_dron - A_res_dron + G_co + K_lnb - L_fider;
    return P_res_dron;
}

// Радиус энергетической зоны

double Radius_energy(double lat, double lon, double lon_sp, double psi, double h_S, double h_e, double L_S_sputnik, double L_S_dron, double D, double p, double f, double neta, double W, double k_dBi, double E_iim, double P_pomexa, double L_pol, int option_1, int option_2, int option_3, int option_4, int system, int output, string std_way, vector<string> polarization)
{
    double P_pomexa_res = P_pomexa + L_pol;

    double E_iim_sp = E_iim + 30;
    double G_max = sputnic_max(D, f, neta);
    double L_sp = Natural_space(lat, lon, lon_sp, f, output);
    double A_p_sp = rain(lat, lon, lon_sp, h_S, L_S_sputnik, f, p, system, std_way, polarization[0]);
    double XPD_sp = cross(lat, lon, lon_sp, f, p, A_p_sp, system, std_way, polarization[0]);
    double L_ces_sp = 0;
    double A_s_sp = fading(lat, lon, lon_sp, neta, D, f, p, system, std_way);
    double A_res_sp = A_result(A_p_sp, XPD_sp, A_s_sp, L_ces_sp, option_1, option_2, option_3, option_4);

    double E_iim_dron = 10 * log10(1000 * W) + k_dBi;
    double G_co = Diagram(D, f, neta, psi, output);
    double A_p_dron = rain(lat, lon, lon_sp, h_S, L_S_dron, f, p, system, std_way, polarization[1]);
    double XPD_dron = cross(lat, lon, lon_sp, f, p, A_p_dron, system, std_way, polarization[1]);
    double L_ces_dron = barrier(lat, lon, lon_sp, f);
    double A_s_dron = fading(lat, lon, lon_sp, neta, D, f, p, system, std_way);
    double A_res_dron = A_result(A_p_dron, XPD_dron, L_ces_dron, A_s_dron, option_1, option_2, option_3, option_4);

    double L_dron = L_sp + (E_iim_dron - E_iim_sp) + (G_co - G_max) + (A_res_sp - A_res_dron) - P_pomexa_res;
    double d = Signal_limit(L_dron, f);
    double R = pow(pow(d, 2) - pow(h_e, 2), 0.5);

    // Энергетический вывод

    if (output == 1)
    {
        cout << endl;
        cout << "Energy_zone:__________________________________________________________________________________________________________" << endl << endl;

        cout << "P_pomexa = " << P_pomexa << endl;
        cout << "L_pol = " << L_pol << endl;
        cout << "P_pomexa_res = " << P_pomexa_res << endl << endl;

        cout << "E_iim_sp = " << E_iim_sp << endl;
        cout << "G_max = " << G_max << endl;
        cout << "L_sp = " << L_sp << endl;
        cout << "A_p_sp = " << A_p_sp << endl;
        cout << "XPD_sp = " << XPD_sp << endl;
        cout << "L_ces_sp = " << L_ces_sp << endl;
        cout << "A_s_sp = " << A_s_sp << endl;
        cout << "A_res_sp = " << A_res_sp << endl << endl;

        cout << "E_iim_dron = " << E_iim_dron << endl;
        cout << "G_co = " << G_co << endl;
        cout << "A_p_dron = " << A_p_dron << endl;
        cout << "XPD_dron = " << XPD_dron << endl;
        cout << "L_ces_dron = " << L_ces_dron << endl;
        cout << "A_s_dron = " << A_s_dron << endl;
        cout << "A_res_dron = " << A_res_dron << endl << endl;

        cout << "L_sp + (E_iim_dron - E_iim_sp) + (G_co - G_max) + (A_res_sp - A_res_dron) - P_pomexa_res = L_dron" << endl;
        cout << L_sp << " + (" << E_iim_dron << " - " << E_iim_sp << ") + (" << G_co << " - " << G_max << ") + (" << A_res_sp << " - " << A_res_dron << ") - " << P_pomexa_res << " = " << L_dron << endl;
        cout << "L_dron = " << L_dron << endl;
        cout << "d_energy = " << d << " km" << endl;
        cout << "R_energy = " << R << " km" << endl << endl;
    }

    // Вывод результата функции

    return d;
}

// Радиус зоны помехи

double Radius_pomexa(double lat, double lon, double lon_sp, double psi, double h_S, double h_e, double L_S_sputnik, double L_S_dron, double D, double p, double f, double neta, double W, double k_dBi, double E_iim, double P_pomexa, double L_pol, int option_1, int option_2, int option_3, int option_4, int system, int output, string std_way, vector<string> polarization)
{
    double P_pomexa_res = P_pomexa + L_pol;

    double E_iim_sp = E_iim + 30;
    double G_max = sputnic_max(D, f, neta);
    double L_sp = Natural_space(lat, lon, lon_sp, f, output);
    double A_p_sp = rain(lat, lon, lon_sp, h_S, L_S_sputnik, f, p, system, std_way, polarization[0]);
    double XPD_sp = cross(lat, lon, lon_sp, f, p, A_p_sp, system, std_way, polarization[0]);
    double L_ces_sp = 0;
    double A_s_sp = fading(lat, lon, lon_sp, neta, D, f, p, system, std_way);
    double A_res_sp = A_result(A_p_sp, XPD_sp, A_s_sp, L_ces_sp, option_1, option_2, option_3, option_4);

    double E_iim_dron = 10 * log10(1000 * W) + k_dBi;
    double G_co = Diagram(D, f, neta, psi, output);
    double A_p_dron = rain(lat, lon, lon_sp, h_S, L_S_dron, f, p, system, std_way, polarization[1]);
    double XPD_dron = cross(lat, lon, lon_sp, f, p, A_p_dron, system, std_way, polarization[1]);
    double L_ces_dron = barrier(lat, lon, lon_sp, f);
    double A_s_dron = fading(lat, lon, lon_sp, neta, D, f, p, system, std_way);
    double A_res_dron = A_result(A_p_dron, XPD_dron, L_ces_dron, A_s_dron, option_1, option_2, option_3, option_4);

    double L_dron = L_sp + (E_iim_dron - E_iim_sp) - (A_res_dron - A_res_sp) + (G_co - G_max) + P_pomexa_res;
    double d = Signal_limit(L_dron, f);
    double R = pow(pow(d, 2) - pow(h_e, 2), 0.5);

    // Энергетический вывод

    if (output == 1)
    {
        cout << endl;
        cout << "Energy_zone:__________________________________________________________________________________________________________" << endl << endl;

        cout << "P_pomexa = " << P_pomexa << endl;
        cout << "L_pol = " << L_pol << endl;
        cout << "P_pomexa_res = " << P_pomexa_res << endl << endl;

        cout << "E_iim_sp = " << E_iim_sp << endl;
        cout << "G_max = " << G_max << endl;
        cout << "L_sp = " << L_sp << endl;
        cout << "A_p_sp = " << A_p_sp << endl;
        cout << "XPD_sp = " << XPD_sp << endl;
        cout << "L_ces_sp = " << L_ces_sp << endl;
        cout << "A_s_sp = " << A_s_sp << endl;
        cout << "A_res_sp = " << A_res_sp << endl << endl;

        cout << "E_iim_dron = " << E_iim_dron << endl;
        cout << "G_co = " << G_co << endl;
        cout << "A_p_dron = " << A_p_dron << endl;
        cout << "XPD_dron = " << XPD_dron << endl;
        cout << "L_ces_dron = " << L_ces_dron << endl;
        cout << "A_s_dron = " << A_s_dron << endl;
        cout << "A_res_dron = " << A_res_dron << endl << endl;

        cout << "L_sp + (E_iim_dron - E_iim_sp) + (G_co - G_max) + (A_res_sp - A_res_dron) + P_pomexa_res = L_dron" << endl;
        cout << L_sp << " + (" << E_iim_dron << " - " << E_iim_sp << ") + (" << G_co << " - " << G_max << ") + (" << A_res_sp << " - " << A_res_dron << ") + " << P_pomexa_res << " = " << L_dron << endl;
        cout << "L_dron = " << L_dron << endl;
        cout << "d_pomexa = " << d << " km" << endl;
        cout << "R_pomexa = " << R << " km" << endl << endl;
    }

    // Вывод результата функции

    return d;
}

// Главная функция

int main() // main(int argc, char *argv[])
{
    // Путь к файлам

    string way;
    string std_way = "/usr/share/Calculation_of_coverage_areas/";

    // Операционная система

    int system = 2;

    // 1 => Windows
    // 2 => Linux

    // Режим работы программы

    int mode = 3;

    // 0 => входные данные по умолчанию
    // 1 => входные данные из текстого файла (от -180 до 180)
    // 2 => входные данные из текстого файла с учётом инверсии по долготе (от 0 до 360)
    // 3 => входные данные из json файла (от -180 до 180)
    // 4 => входные данные из json файла с учётом инверсии по долготе (от 0 до 360)
    // 5 => входные данные из json сервера (от -180 до 180)
    // 6 => входные данные из json сервера с учётом инверсии по долготе (от 0 до 360)

    // Тип построения

    int combination = 1;

    // 0 => Раздельный
    // 1 => Совмещённый

    // Вычислительные параметры

    int it = 0;  // Число итерраций в численных методах [10]
    double p = 0.1;  // Доверительная вероятность случайных процессов (проценты) [0.1]

    // Опциональные параметры

    int option_1 = 0;  // Дождь A_p [1]
    int option_2 = 0;  // Кросс-поляризация XPD [1]
    int option_3 = 0;  // Отражение от препятствий L_ces [1]
    int option_4 = 0;  // Замирания A_s [1]

    // Текстовые технические параметры для спутника и дрона

    vector<string> standart = {"0", "0"};  // Стандарт вещания (dvbs, dvbs2) [{"dvbs", "dvbs2"}]
    vector<string> polarization = {"0", "0"};  // Тип поляризации (L, R, V, H) [{"V", "L"}]
    vector<string> modulation = {"0", "0"};  // Тип модуляции (QPSK, 8-PSK, 16-APSK, 32-APSK)[{"QPSK", "8-PSK"}]
    vector<string> speed = {"0", "0"};  // Кодовая скорость спутника вещания (1/4, 1/3, 2/5, 1/2, 3/5, 2/3, 3/4, 4/5, 5/6, 7/8, 8/9, 9/10) [{"1/2", "1/3"}]

    // Место расположения оборудования

    // [0] => Спутник
    // [1] => Дрон

    // Угловые технические параметры

    double lat = 0;  // Широта приёмника (градусы) (от -90 до 90) [55.75]
    double lon = 0;  // Долгота приёмника (градусы) (от -180 до 180) [37.6]
    double lon_sp = 0;  // Долгота спутника (градусы) (от -180 до 180) [13.0]
    double phi = 0;  // Ширина главного лепестка антенны (от 0 до 360) (градусы) [20.0]
    double ksi = 0;  // Угол подъёма антенны (градусы) [30.0]
    double azimuth_antenna = 0;  // Азимут главного лепестка антенны (градусы) (от 0 до 360) [180.0]

    // Метрические входные данные

    double h_e = 0;  // Высота дрона над уровнем Земли (м) [100.0]
    double h_S = 0;  // Высота места запуска дрона над уровнем моря (м) [135.0]
    double D = 0;  // Физический диаметр антенны (м) [0.6] <по умолчанию>

    // Размерные технические параметры

    double W = 0;  // Мощность передатчика (Вт) (от 0 до 2000) [2.0]
    double f = 0;  // Частота вещания (ГГц) [11.0]

    // Логарифмические технические параметры

    double k_dBi = 0;  // Коэффициент усиления антенны (dBi) [20.0]
    double E_iim = 0;  // Мощность источника сигнала (dBi) [44.0]
    double L_fider = 0;  // Потери в фидере (dBi) [2.5]
    double P_pomexa = 0;  // Величина помехи (dBi) [2.0 - у дрона "dvbs2" / 4.0 - у дрона "dvbs"]
    double L_pol = 0;  // Потери на поляризации (dBi) [3.0]

    // Безразмерные технические параметры

    double neta = 0;  // Эффективность антенны [0.65] <по умолчанию>

    // Ввод данных из файла

    if (mode == 1 || mode == 2)
    {
        if (system == 1)
        {
            way = "Input\\Input_data.txt";
        }
        else if (system == 2)
        {
            way = std_way + "Input/Input_data.txt";
        }

        ifstream in_0(way);

        if (in_0.is_open())
        {
            in_0 >> option_1;
            in_0 >> option_2;
            in_0 >> option_3;
            in_0 >> option_4;

            in_0 >> standart[0];
            in_0 >> polarization[0];
            in_0 >> modulation[0];
            in_0 >> speed[0];

            in_0 >> standart[1];
            in_0 >> polarization[1];
            in_0 >> modulation[1];
            in_0 >> speed[1];

            in_0 >> lat;
            in_0 >> lon;
            in_0 >> lon_sp;
            in_0 >> phi;
            in_0 >> ksi;
            in_0 >> azimuth_antenna;

            in_0 >> h_e;
            in_0 >> h_S;
            D = 0.6;

            in_0 >> W;
            in_0 >> f;

            in_0 >> k_dBi;
            in_0 >> E_iim;
            in_0 >> L_fider;
            in_0 >> P_pomexa;
            in_0 >> L_pol;

            neta = 0.65;
        }

        in_0.close();
    }
    else if (mode == 3 || mode == 4)
    {
        if (system == 1)
        {
            way = "Input\\data.json";
        }
        else if (system == 2)
        {
            way = std_way + "Input/data.json";
        }

        ifstream in_0(way, ios_base::binary);

        if (in_0.is_open())
        {
            string jsonString = {istreambuf_iterator<char>(in_0), istreambuf_iterator<char>()};
            json j = json::parse(jsonString);

            option_1 = (int) double_str(to_string(j["option_1"]));
            option_2 = (int) double_str(to_string(j["option_2"]));
            option_3 = (int) double_str(to_string(j["option_3"]));
            option_4 = (int) double_str(to_string(j["option_4"]));

            standart[0] = j["standard"];
            polarization[0] = j["polarization"];
            modulation[0] = j["modulation"];
            speed[0] = j["speed"];

            standart[1] = j["Stand"];
            polarization[1] = j["Pol"];
            modulation[1] = j["Mod"];
            speed[1] = j["Sp"];

            lat = double_str(to_string(j["latitude"]));
            lon = double_str(to_string(j["longitude"]));
            lon_sp = double_str(to_string(j["satelliteLongitude"]));
            phi = double_str(to_string(j["Width"]));
            ksi = double_str(to_string(j["ksi"]));
            azimuth_antenna = double_str(to_string(j["Azimuth"]));

            h_e = double_str(to_string(j["Hight"]));
            h_S = double_str(to_string(j["HeightSeaLevel"]));
            D = 0.6;

            W = double_str(to_string(j["Power"]));
            f = double_str(to_string(j["frequency"]));

            k_dBi = double_str(to_string(j["AntennaGain"]));
            E_iim = double_str(to_string(j["Einm"]));
            L_fider = double_str(to_string(j["L_fider"]));
            P_pomexa = double_str(to_string(j["P_pomexa"]));
            L_pol = double_str(to_string(j["L_pol"]));

            neta = 0.65;
        }

        in_0.close();
    }
    else if (mode == 5 || mode == 6)
    {
        CURL* curl;
        CURLcode res;
        string readBuffer;
        curl_global_init(CURL_GLOBAL_DEFAULT);
        curl = curl_easy_init(); // Инициализация cURL

        if(curl)
        {
            //curl_easy_setopt(curl, CURLOPT_URL, "http://192.168.1.13:3000/data.json"); // Установка URL
            curl_easy_setopt(curl, CURLOPT_URL, "http://localhost:3000/data.json"); // Установка URL
            curl_easy_setopt(curl, CURLOPT_WRITEFUNCTION, WriteCallback); // Установка функции обратного вызова
            curl_easy_setopt(curl, CURLOPT_WRITEDATA, &readBuffer); // Установка буфера для записи данных
            curl_easy_setopt(curl, CURLOPT_FOLLOWLOCATION, 1L); // Следовать за перенаправлениями
            res = curl_easy_perform(curl); // Выполнение запроса

            if(res != CURLE_OK)
            {
                cerr << "curl_easy_perform() failed: " << curl_easy_strerror(res) << std::endl;
            }
            else
            {
                json j = json::parse(readBuffer);

                option_1 = (int) double_str(to_string(j["option_1"]));
                option_2 = (int) double_str(to_string(j["option_2"]));
                option_3 = (int) double_str(to_string(j["option_3"]));
                option_4 = (int) double_str(to_string(j["option_4"]));

                standart[0] = j["standard"];
                polarization[0] = j["polarization"];
                modulation[0] = j["modulation"];
                speed[0] = j["speed"];

                standart[1] = j["Stand"];
                polarization[1] = j["Pol"];
                modulation[1] = j["Mod"];
                speed[1] = j["Sp"];

                lat = double_str(to_string(j["latitude"]));
                lon = double_str(to_string(j["longitude"]));
                lon_sp = double_str(to_string(j["satelliteLongitude"]));
                phi = double_str(to_string(j["Width"]));
                ksi = double_str(to_string(j["ksi"]));
                azimuth_antenna = double_str(to_string(j["Azimuth"]));

                h_e = double_str(to_string(j["Hight"]));
                h_S = double_str(to_string(j["HeightSeaLevel"]));
                D = 0.6;

                W = double_str(to_string(j["Power"]));
                f = double_str(to_string(j["frequency"]));

                k_dBi = double_str(to_string(j["AntennaGain"]));
                E_iim = double_str(to_string(j["Einm"]));
                L_fider = double_str(to_string(j["L_fider"]));
                P_pomexa = double_str(to_string(j["P_pomexa"]));
                L_pol = double_str(to_string(j["L_pol"]));

                neta = 0.65;
            }

            curl_easy_cleanup(curl); // Очистка cURL
        }
    }

    // Инверсия входных данных по долготе

    if (mode == 2 || mode == 4 || mode == 6)
    {
        if (lon > 180)
        {
            lon = lon - 360;
        }

        if (lon_sp > 180)
        {
            lon_sp = lon_sp - 360;
        }
    }

    // Перевод метров в километры

    h_e = h_e / 1000;
    h_S = h_S / 1000;

    // Азимутальные координаты

    double teta_main = teta(lat, lon, lon_sp);
    double azimuth_main = azimuth(lat, lon, lon_sp);

    // Зенитный угол

    double psi = delta_angle(inverse(azimuth_antenna), azimuth_main);

    // Константы

    const double pi = 3.14159265;  // Число пи
    const double R = 6371;  // Радиус Зесли (км)
    const double H_sputnik = 42170;  // Высота геостационарной орбиты спутника над центром Земли (км)
    const double T_0 = 273.15;  // Температура абсолютного нуля (К)
    const double h_L = 1000;  // Высота турбулентности (км)
    const double c = 3 * pow(10, 5);  // Скорость света (км/c)

    // Вывод констант

    cout << "Constant:_________________________________________________________________________________" << endl << endl;

    cout << "pi = " << pi << " " << endl;
    cout << "R = " << R << " km" << endl;
    cout << "H_sputnik = " << H_sputnik << " km" << endl;
    cout << "T_0 = " << T_0 << " K" << endl;
    cout << "h_L = " << h_L << " km" << endl;
    cout << "c = " << c << " km / s" << endl << endl;

    // Основной вывод

    cout << "Input:_________________________________________________________________________________" << endl << endl;

    cout << "system = " << system << " " << endl;
    cout << "mode = " << mode << " " << endl;
    cout << "combination = " << combination << " " << endl;
    cout << "it = " << it << " " << endl;
    cout << "p = " << p << " " << endl << endl;

    cout << "option_1 = " << option_1 << " " << endl;
    cout << "option_2 = " << option_2 << " " << endl;
    cout << "option_3 = " << option_3 << " " << endl;
    cout << "option_4 = " << option_3 << " " << endl << endl;

    cout << "standart[0] = " << standart[0] << " " << endl;
    cout << "polarization[0] = " << polarization[0] << " " << endl;
    cout << "modulation[0] = " << modulation[0] << " " << endl;
    cout << "speed[0] = " << speed[0] << " " << endl << endl;

    cout << "standart[1] = " << standart[1] << " " << endl;
    cout << "polarization[1] = " << polarization[1] << " " << endl;
    cout << "modulation[1] = " << modulation[1] << " " << endl;
    cout << "speed[1] = " << speed[1] << " " << endl << endl;

    cout << "lat = " << lat << " grad" << endl;
    cout << "lon = " << lon << " grad" << endl;
    cout << "lon_sp = " << lon_sp << " grad" << endl;
    cout << "phi = " << phi << " " << endl;
    cout << "ksi = " << ksi << " " << endl;
    cout << "azimuth_antenna = " << azimuth_antenna << " grad" << endl << endl;

    cout << "teta_main = " << teta_main << " grad" << endl;
    cout << "azimuth_main = " << azimuth_main << " grad" << endl;
    cout << "psi = " << psi << " grad" << endl << endl;

    cout << "h_e = " << h_e << " km" << endl;
    cout << "h_S = " << h_S << " km" << endl;
    cout << "D = " << D << " m" << endl << endl;

    cout << "W = " << W << " W" << endl;
    cout << "f = " << f << " GHz" << endl << endl;

    cout << "k_dBi = " << k_dBi << " dBi" << endl;
    cout << "E_iim = " << E_iim << " dBi" << endl;
    cout << "L_fider = " << L_fider << " dBi" << endl;
    cout << "P_pomexa = " << P_pomexa << " dBi" << endl;
    cout << "L_pol = " << L_pol << " dBi" << endl << endl;

    cout << "neta = " << neta << " " << endl << endl;

    // Длина наклонной трассы ниже высоты слоя дождя для спутника

    double L_S_sputnik = oblique(lat, lon, lon_sp, h_S, system, std_way);

    // Энергетический радиус

    vector<double> Radius_energy_main_vector;

    for (int i = 0; i < it + 1; i++)
    {
        if (i == 0)
        {
            Radius_energy_main_vector.push_back(Radius_energy(lat, lon, lon_sp, psi, h_S, h_e, L_S_sputnik, 0, D, p, f, neta, W, k_dBi, E_iim, P_pomexa, L_pol, option_1, option_2, option_3, option_4, system, 1, std_way, polarization));
        }
        else
        {
            Radius_energy_main_vector.push_back(Radius_energy(lat, lon, lon_sp, psi, h_S, h_e, L_S_sputnik, Radius_energy_main_vector[i - 1], D, p, f, neta, W, k_dBi, E_iim, P_pomexa, L_pol, option_1, option_2, option_3, option_4, system, 0, std_way, polarization));
        }
    }

    double Radius_energy_main = Radius_energy_main_vector[it];

    // Итерационный энергетический вывод

    cout << "Iterative energy output:_________________________________________________________________________________" << endl << endl;

    for (int i = 0; i < it + 1; i++)
    {
        cout << i << " --> " << Radius_energy_main_vector[i] << " km" << endl;
    }

    cout << endl;

    // Радиус зоны помехи

    vector<double> Radius_pomexa_main_vector;

    for (int i = 0; i < it + 1; i++)
    {
        if (i == 0)
        {
            Radius_pomexa_main_vector.push_back(Radius_pomexa(lat, lon, lon_sp, psi, h_S, h_e, L_S_sputnik, 0, D, p, f, neta, W, k_dBi, E_iim, P_pomexa, L_pol, option_1, option_2, option_3, option_4, system, 1, std_way, polarization));
        }
        else
        {
            Radius_pomexa_main_vector.push_back(Radius_pomexa(lat, lon, lon_sp, psi, h_S, h_e, L_S_sputnik, Radius_pomexa_main_vector[i - 1], D, p, f, neta, W, k_dBi, E_iim, P_pomexa, L_pol, option_1, option_2, option_3, option_4, system, 0, std_way, polarization));
        }
    }

    double Radius_pomexa_main = Radius_pomexa_main_vector[it];

    // Итерационный вывод помехи

    cout << "Iterative pomexa output:_________________________________________________________________________________" << endl << endl;

    for (int i = 0; i < it + 1; i++)
    {
        cout << i << " --> " << Radius_pomexa_main_vector[i] << " km" << endl;
    }

    cout << endl;

    // Горизонт

    double horisont = pow(pow(R + h_e, 2) - pow(R, 2), 0.5);

    // Эллипс покрытия

    double L_1 = h_e / tan((ksi + phi / 2) / 180 * pi);
    double L_2 = h_e / tan((ksi - phi / 2) / 180 * pi);
    double L_a = (L_2 + L_1) / 2;
    double a = (L_2 - L_1) / 2;
    double et = cos(ksi / 180 * pi) / cos((phi / 2) / 180 * pi);
    double ce = et * a;
    double b = pow(pow(a, 2) - pow(ce, 2), 0.5);
    double L_f_1 = L_a - ce;
    double L_f_2 = L_a + ce;

    // Гипербола покрытия

    double ah = h_e / tan((ksi + phi / 2) / 180 * pi);
    double eth = cos(ksi * pi / 180) / cos((phi / 2) * pi / 180);
    double ceh = eth * ah;
    double ch = (horisont + ah) / 2;
    double rasmax = (horisont - ah) / 2;

    // Грань

    double gran_1 = Radius_pomexa_main;
    double gran_2;
    double gran_3;

    if (ksi > phi / 2)
    {
        // Эллипс

        gran_2 = a;

        if (L_2 < Radius_pomexa_main)
        {
            gran_3 = L_2;
        }
        else
        {
            gran_3 = Radius_pomexa_main;
        }
    }
    else
    {
        // Гипербола

        gran_2 = rasmax;

        if (horisont < Radius_pomexa_main)
        {
            gran_3 = horisont;
        }
        else
        {
            gran_3 = Radius_pomexa_main;
        }
    }

    // Диаметр разбиения

    double point_limit = 50;
    double delta_point_1 = gran_1 / point_limit;
    double delta_point_2 = gran_2 / point_limit;
    double delta_point_3 = gran_3 / point_limit;

    // Вывод зон покрытия

    cout << "Geometric zone:_________________________________________________________________________________" << endl << endl;

    cout << "horisont = " << horisont << " km" << endl << endl;

    cout << "L_1 = " << L_1 << " km" << endl;
    cout << "L_2 = " << L_2 << " km" << endl;
    cout << "L_a = " << L_a << " km" << endl;
    cout << "a = " << a << " km" << endl;
    cout << "et = " << et << endl;
    cout << "ce = " << ce << " km" << endl;
    cout << "b = " << b << " km" << endl;
    cout << "L_f_1 = " << L_f_1 << " km" << endl;
    cout << "L_f_2 = " << L_f_2 << " km" << endl << endl;

    cout << "ah = " << ah << " km" << endl;
    cout << "eth = " << eth << endl;
    cout << "ceh = " << ceh << " km" << endl;
    cout << "ch = " << ch << " km" << endl;
    cout << "rasmax = " << rasmax << " km" << endl << endl;

    cout << "Radius_energy_main = " << Radius_energy_main << " km" << endl;
    cout << "Radius_pomexa_main = " << Radius_pomexa_main << " km" << endl << endl;

    cout << "gran_1 = " << gran_1 << " km" << endl;
    cout << "gran_2 = " << gran_2 << " km" << endl;
    cout << "gran_3 = " << gran_3 << " km" << endl << endl;

    cout << "delta_point_1 = " << delta_point_1 << " km" << endl;
    cout << "delta_point_2 = " << delta_point_2 << " km" << endl;
    cout << "delta_point_3 = " << delta_point_3 << " km" << endl << endl;

    // Текстовые выходные данные

    ofstream output_data;
    output_data.open("output_data.txt");

    // Построение энергетического точечного графика

    ofstream point_draw_1;
    point_draw_1.open("point_draw_1.txt");

    // Построение геометрического точечного графика

    ofstream point_draw_2;
    point_draw_2.open("point_draw_2.txt");

    // Построение совмещённого точечного графика

    ofstream point_draw_3;
    point_draw_3.open("point_draw_3.txt");

    // Создание json массивов

    json jsonArray_delta = json::array();
    json jsonArray = json::array();
    json jsonArray_pomexa = json::array();
    json jsonArray_ellipse = json::array();

    // Рассчёт энергетического диаметра разбиения

    json delta1;

    if (combination == 0)
    {
        delta1["size1"] = delta_point_1 / 2 * 1.5 * 180 / (R * pi);
    }
    else
    {
        delta1["size1"] = delta_point_3 / 2 * 1.5 * 180 / (R * pi);
    }

    jsonArray_delta.push_back(delta1);

    // Рассчёт геометрического диаметра разбиения

    json delta2;

    if (combination == 0)
    {
        delta2["size2"] = delta_point_2 / 2 * 1.5 * 180 / (R * pi);
    }
    else
    {
        delta2["size2"] = delta_point_3 / 2 * 1.5 * 180 / (R * pi);
    }
    jsonArray_delta.push_back(delta2);

    // Переменные построения

    double point_count_1;
    double point_count_2;
    double point_count_3;
    double point_count_4;
    double point_count_5;
    double r_i_j;
    double r_focus_1;
    double r_focus_2;
    double r_c;
    double r_focush_1;
    double r_focush_2;
    double arg_i_j;
    double arg_limit;

    // Предельный азимутальный угол

    if (combination == 1 && ksi > phi / 2)
    {
        arg_limit = azimuth_main - azimuth_antenna;
    }
    else
    {
        arg_limit = azimuth_main - inverse(azimuth_antenna);
    }

    // Зоны покрытия

    // ".X." - центр энергетической зоны

    // "(o)" - энергетичкая зона
    // "<v>" - зона помехи
    // "{*}" - геометрическая зона
    // "/_/" - направленная геометрическая зона

    // [T] - энергетическая зона + геометрическая зона
    // |L| - энергетическая зона + направленная зона
    // ":E:" - зона помехи + геометрическая зона
    // "!@!" - зона помехи + направленная зона

    // "   " - пустая зона

    // Рассчёт точек энергетической зоны покрытия

    cout << "Point_energetic:_________________________________________________________________________________" << endl << endl;

    point_count_1 = 0;
    point_count_2 = 0;

    for (int i = -point_limit; i <= point_limit; i++)
    {
        for (int j = -point_limit; j <= point_limit; j++)
        {
            r_i_j = pow(pow(i * delta_point_1, 2) + pow(j * delta_point_1, 2), 0.5);

            if (r_i_j < Radius_pomexa_main && r_i_j > Radius_energy_main) // Зона помехи
            {
                ++point_count_1;
                json point_pomexa_pom;
                point_pomexa_pom["latitude"] = lat + projection_lat(i * delta_point_1, j * delta_point_1, azimuth_antenna) * 180 / (R * pi);
                point_pomexa_pom["longitude"] = lon + projection_lon(i * delta_point_1, j * delta_point_1, azimuth_antenna) * 180 / (R * pi) / cos(lat * pi / 180);

                if (combination == 0)
                {
                    jsonArray_pomexa.push_back(point_pomexa_pom);
                }

                point_draw_1 << "<v>";
            }
            else if (r_i_j < Radius_energy_main) // Энергетическая зона
            {
                ++point_count_2;
                json point;
                point["latitude"] = lat + projection_lat(i * delta_point_1, j * delta_point_1, azimuth_antenna) * 180 / (R * pi);
                point["longitude"] = lon + projection_lon(i * delta_point_1, j * delta_point_1, azimuth_antenna) * 180 / (R * pi) / cos(lat * pi / 180);

                if (combination == 0)
                {
                    jsonArray.push_back(point);
                }

                if (i == 0 && j == 0) // Центр энергетической зоны
                {
                    point_draw_1 << ".X.";
                }
                else
                {
                    point_draw_1 << "(o)";
                }
            }
            else
            {
                point_draw_1 << "   ";
            }
        }

        point_draw_1 << "|\n";
    }

    for (int i = -point_limit; i <= point_limit; i++)
    {
        point_draw_1 << "___";
    }

    point_draw_1 << endl;

    cout << "point_count_1 = " << point_count_1 << endl << endl;
    cout << "point_count_2 = " << point_count_2 << endl << endl;

    // Рассчёт точек геометрической зоны покрытия

    cout << "Point_geometric:_________________________________________________________________________________" << endl << endl;

    point_count_3 = 0;

    for (int i = -point_limit; i <= point_limit; i++)
    {
        for (int j = -point_limit; j <= point_limit; j++)
        {
            if (ksi > phi / 2)
            {
                // Эллипс

                r_focus_1 = pow(pow(i * delta_point_2 + ce, 2) + pow(j * delta_point_2, 2), 0.5);
                r_focus_2 = pow(pow(i * delta_point_2 - ce, 2) + pow(j * delta_point_2, 2), 0.5);
                r_c = pow(pow(i * delta_point_2 - L_a, 2) + pow(j * delta_point_2, 2), 0.5);
                arg_i_j = -arg(i * delta_point_2 - L_a, j * delta_point_2);

                if (r_focus_1 + r_focus_2 < 2 * a && r_c < horisont && delta_angle(arg_limit, arg_i_j) > 90) // Направленная зона
                {
                    ++point_count_3;
                    json point_ellipse;
                    point_ellipse["latitude"] = lat + projection_lat(L_a - i * delta_point_2, j * delta_point_2, azimuth_antenna) * 180 / (R * pi);
                    point_ellipse["longitude"] = lon + projection_lon(L_a - i * delta_point_2, j * delta_point_2, azimuth_antenna) * 180 / (R * pi) / cos(lat * pi / 180);
                    point_draw_2 << "/_/";

                    if (combination == 0)
                    {
                        jsonArray_ellipse.push_back(point_ellipse);
                    }
                }
                else if (r_focus_1 + r_focus_2 < 2 * a && r_c < horisont) // Энергетическая зона
                {
                    point_draw_2 << "{*}";
                }
                else
                {
                    point_draw_2 << "   ";
                }
            }
            else
            {
                // Гипербола

                r_focush_1 = pow(pow(i * delta_point_2 - ch + ceh, 2) + pow(j * delta_point_2, 2), 0.5);
                r_focush_2 = pow(pow(i * delta_point_2 - ch - ceh, 2) + pow(j * delta_point_2, 2), 0.5);
                r_c = pow(pow(i * delta_point_2 - ch, 2) + pow(j * delta_point_2, 2), 0.5);
                arg_i_j = -arg(i * delta_point_2 - ch, j * delta_point_2);

                if (r_focush_2 - r_focush_1 > 2 * ah && r_c < horisont && delta_angle(arg_limit, arg_i_j) > 90) // Направленная зона
                {
                    ++point_count_3;
                    json point_ellipse;
                    point_ellipse["latitude"] = lat + projection_lat(ch - i * delta_point_2, j * delta_point_2, azimuth_antenna) * 180 / (R * pi);
                    point_ellipse["longitude"] = lon + projection_lon(ch - i * delta_point_2, j * delta_point_2, azimuth_antenna) * 180 / (R * pi) / cos(lat * pi / 180);
                    point_draw_2 << "/_/";

                    if (combination == 0)
                    {
                        jsonArray_ellipse.push_back(point_ellipse);
                    }
                }
                else if (r_focush_2 - r_focush_1 > 2 * ah && r_c < horisont) // Геометрическая зона
                {
                    point_draw_2 << "{*}";
                }
                else
                {
                    point_draw_2 << "   ";
                }
            }
        }

        point_draw_2 << "|\n";
    }

    for (int i = -point_limit; i <= point_limit; i++)
    {
        point_draw_2 << "___";
    }

    point_draw_2 << endl;

    cout << "point_count_3 = " << point_count_3 << endl << endl;

    // Рассчёт точек совмещённой зоны покрытия

    cout << "Point_combination:_________________________________________________________________________________" << endl << endl;

    point_count_4 = 0;
    point_count_5 = 0;

    for (int i = -point_limit; i <= point_limit; i++)
    {
        for (int j = -point_limit; j <= point_limit; j++)
        {
            r_i_j = pow(pow(i * delta_point_3, 2) + pow(j * delta_point_3, 2), 0.5);
            arg_i_j = -arg(i * delta_point_3, j * delta_point_3);

            if (ksi > phi / 2)
            {
                // Эллипс

                r_focus_1 = pow(pow(i * delta_point_3 - L_f_1, 2) + pow(j * delta_point_3, 2), 0.5);
                r_focus_2 = pow(pow(i * delta_point_3 - L_f_2, 2) + pow(j * delta_point_3, 2), 0.5);

                if (r_i_j < Radius_pomexa_main && r_i_j > Radius_energy_main) // Зона помехи
                {
                    if (r_focus_1 + r_focus_2 < 2 * a && delta_angle(arg_limit, arg_i_j) > 90 && r_i_j < horisont) // Направленная зона
                    {
                        ++point_count_4;
                        json point_pomexa_pom;
                        point_pomexa_pom["latitude"] = lat + projection_lat(i * delta_point_3, j * delta_point_3, azimuth_antenna) * 180 / (R * pi);
                        point_pomexa_pom["longitude"] = lon + projection_lon(i * delta_point_3, j * delta_point_3, azimuth_antenna) * 180 / (R * pi) / cos(lat * pi / 180);

                        if (combination == 1)
                        {
                            jsonArray_pomexa.push_back(point_pomexa_pom);
                        }

                        point_draw_3 << "!@!";
                    }
                    else if (r_focus_1 + r_focus_2 < 2 * a && r_i_j < horisont)  // Геометрическая зона
                    {
                        point_draw_3 << ":E:";
                    }
                    else
                    {
                        point_draw_3 << "<v>";
                    }
                }
                else if (r_i_j < Radius_energy_main) // Энергетическая зона
                {
                    if (r_focus_1 + r_focus_2 < 2 * a && delta_angle(arg_limit, arg_i_j) > 90 && r_i_j < horisont) // Направленная зона
                    {
                        ++point_count_5;
                        json point;
                        point["latitude"] = lat + projection_lat(i * delta_point_3, j * delta_point_3, azimuth_antenna) * 180 / (R * pi);
                        point["longitude"] = lon + projection_lon(i * delta_point_3, j * delta_point_3, azimuth_antenna) * 180 / (R * pi) / cos(lat * pi / 180);

                        if (combination == 1)
                        {
                            jsonArray.push_back(point);
                        }

                        if (i == 0 && j == 0) // Центр энергетической зоны
                        {
                            point_draw_3 << ".X.";
                        }
                        else
                        {
                            point_draw_3 << "|L|";
                        }
                    }
                    else if (r_focus_1 + r_focus_2 < 2 * a && r_i_j < horisont) // Геометрическая зона
                    {
                        if (i == 0 && j == 0) // Центр энергетической зоны
                        {
                            point_draw_3 << ".X.";
                        }
                        else
                        {
                            point_draw_3 << "[T]";
                        }
                    }
                    else
                    {
                        if (i == 0 && j == 0) // Центр энергетической зоны
                        {
                            point_draw_3 << ".X.";
                        }
                        else
                        {
                            point_draw_3 << "(o)";
                        }
                    }
                }
                else
                {
                    point_draw_3 << "   ";
                }
            }
            else
            {
                // Гипербола

                r_focush_1 = pow(pow(i * delta_point_3 + ceh, 2) + pow(j * delta_point_3, 2), 0.5);
                r_focush_2 = pow(pow(i * delta_point_3 - ceh, 2) + pow(j * delta_point_3, 2), 0.5);

                if (r_i_j < Radius_pomexa_main && r_i_j > Radius_energy_main) // Зона помехи
                {
                    if (r_focush_2 - r_focush_1 > 2 * ah && r_i_j < horisont && delta_angle(arg_limit, arg_i_j) > 90) // Направленная зона
                    {
                        ++point_count_4;
                        json point_pomexa_pom;
                        point_pomexa_pom["latitude"] = lat + projection_lat(i * delta_point_3, j * delta_point_3, inverse(azimuth_antenna)) * 180 / (R * pi);
                        point_pomexa_pom["longitude"] = lon + projection_lon(i * delta_point_3, j * delta_point_3, inverse(azimuth_antenna)) * 180 / (R * pi) / cos(lat * pi / 180);

                        if (combination == 1)
                        {
                            jsonArray_pomexa.push_back(point_pomexa_pom);
                        }

                        point_draw_3 << "!@!";
                    }
                    else if (r_focush_2 - r_focush_1 > 2 * ah && r_i_j < horisont) // Энергетическая зона
                    {
                        point_draw_3 << ":E:";
                    }
                    else
                    {
                        point_draw_3 << "<v>";
                    }
                }
                else if (r_i_j < Radius_energy_main)  // Энергетическая зона
                {
                    if (r_focush_2 - r_focush_1 > 2 * ah && r_i_j < horisont && delta_angle(arg_limit, arg_i_j) > 90) // Направленная зона
                    {
                        ++point_count_5;
                        json point;
                        point["latitude"] = lat + projection_lat(i * delta_point_3, j * delta_point_3, inverse(azimuth_antenna)) * 180 / (R * pi);
                        point["longitude"] = lon + projection_lon(i * delta_point_3, j * delta_point_3, inverse(azimuth_antenna)) * 180 / (R * pi) / cos(lat * pi / 180);

                        if (combination == 1)
                        {
                            jsonArray.push_back(point);
                        }

                        if (i == 0 && j == 0) // Центр энергетической зоны
                        {
                            point_draw_3 << ".X.";
                        }
                        else
                        {
                            point_draw_3 << "|L|";
                        }
                    }
                    else if (r_focush_2 - r_focush_1 > 2 * ah && r_i_j < horisont) // Геометрическая зона
                    {
                        if (i == 0 && j == 0) // Центр энергетической зоны
                        {
                            point_draw_3 << ".X.";
                        }
                        else
                        {
                            point_draw_3 << "[T]";
                        }
                    }
                    else
                    {
                        if (i == 0 && j == 0) // Центр энергетической зоны
                        {
                            point_draw_3 << ".X.";
                        }
                        else
                        {
                            point_draw_3 << "(o)";
                        }
                    }
                }
                else
                {
                    point_draw_3 << "   ";
                }
            }
        }

        point_draw_3 << "|\n";
    }

    for (int i = -point_limit; i <= point_limit; i++)
    {
        point_draw_3 << "___";
    }

    point_draw_3 << endl;

    cout << "point_count_4 = " << point_count_4 << endl << endl;
    cout << "point_count_5 = " << point_count_5 << endl << endl;

    // Запись json массива помехи в файл

    ofstream file_out_delta("scale.json");
    ofstream file_out("coordinates.json");
    ofstream file_out_pomexa("coordinates_pomexa.json");
    ofstream file_out_ellipse("coordinates_ellipse.json");

    file_out_delta << jsonArray_delta.dump(4);
    file_out << jsonArray.dump(4);
    file_out_pomexa << jsonArray_pomexa.dump(4);
    file_out_ellipse << jsonArray_ellipse.dump(4);

    file_out_delta.close();
    file_out.close();
    file_out_pomexa.close();
    file_out_ellipse.close();

    sendFileToLocalhost("scale.json");
    sendFileToLocalhost("coordinates.json");
    sendFileToLocalhost("coordinates_pomexa.json");
    sendFileToLocalhost("coordinates_ellipse.json");

    // Время публикации кода

    string data = "13_53_06_08_2025";
    cout << data << endl;
    output_data << data;
    point_draw_1 << "energetic -> " << data;
    point_draw_2 << "geometric -> " << data;
    point_draw_3 << "combination -> " << data;

    // Завершение работы с выходными данными

    output_data.close();
    point_draw_1.close();
    point_draw_2.close();
    point_draw_3.close();

    // Завершение программы

    cout << "The end!" << endl;
    return 0;
}
