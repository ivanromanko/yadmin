# yadmin

Веб-приложение для управления почтой, расположенной на сервисе Яндекс.Почта для домена.

### Описание
Представляет собой веб-страницу и скрипт на python. Страница отображает список пользователей подключённых доменов и позволяет редактировать личные данные пользователей, настраивать переадресацию писем, изменять настройки домена(в разработке).
Веб-страница отправляет команды скрипту, который их выполняет на серверах Яндекса и возвращает результат работы.

Системные требования:
 - python3.1 и старше
 - современный веб-браузер, отличный от IE

Порядок работы:
 - клонировать проект или скачать zip-архив и распаковать
 - записать token от вашего домена в список токенов в файле config/token.py и удалить токены-заглушки
 - перейти в корень проекта и запустить серверный скрипт командой ./run.py
 - в вашем браузере откроется страница с адресом http://localhost:7070/mu, если этого не произойдёт – откройте страницу самостоятельно.


### Подробности:

При открытии страницы скриптами подтягивается список подключённых доменов и время запуска сервера:
 - на основании списка доменов формируется навигационное меню
 - время запуска сервера позволяет кэшировать список пользователей в локальном хранилище браузера, если в config/settings.py включена опция кэширования списка

Следующий запрос получает список пользователей всех подключённых доменов и записывает их в локальное хранилище, рисует таблицы с пользователями на экране.
Все управляющие действия выполняются с помощью ajax-запросов, сопровождаются необходимой индикацией и оповещениями об ошибках.
