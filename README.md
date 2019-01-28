# Face2Face

Этот проект написан с использованием:
- React: [[документация]](https://reactjs.org/docs/getting-started.html)
- React Router: [[документация]](https://reacttraining.com/react-router/web/guides/philosophy)
- React Easy State [[документация|исходный код]](https://github.com/solkimicreb/react-easy-state)
- SCSS [[документация]](http://sass-lang.com/guide)

## Установка на сервер

Для корректной работы, необходимо, чтобы все запросы c домена перенаправлялись на index.html
Идеальный сценарий — перенести текущий сервер face2face на поддомен api.face2face.cash,

## Установка

```bash
git clone git@gitlab.com:dotterian/face2face.git
cd face2face
npm install
```

## Разработка

Разработка осуществляетс с использованием тестового сервера. Для запуска тестового сервера используйте команду
```bash
npm start
```
Тестовый сервер будет запущен по адресу `http://localhost:3000` и будет отслеживать изменения в файлах и перезагружать страницу при появлении изменений.

## Компиляция

Для компиляции программы из EcmaScript 6 в EcmaScript 5, поддерживаемый подавляющим большинством современных браузеров, используйте следующую команду:
```bash
npm run build
```
После выполнения команды будет создана папка `build`, содержащая все скомпилированные файлы. Разместите её содержимое на вашем веб-сервере.

## Редактирование переводов

Изменить перевод и добавить новый язык можно без перекомпиляции программы.

Для создания нового языка вам потребуется добавить новую запись в файл `locales.json`. Ключом записи должен являться двухбуквенный код языка, значением записи должно являться трёхбуквенное обозначение, которое будет выведено в селекторе языков.

Например для добавления Испанского языка нужно будет преобразовать файл следующим образом:
```json
{
  "en": "ENG",
  "ru": "РУС",
  "es": "ESP"
}
```

Далее следует создать в папке `locales` файл с названием `код_языка.json`. Например, для Испанского — `es.json`.
В данный файл следует скопировать содержимое любого из файлов переводов в этой папке и изменить соответствующие строки.

Для того, чтобы лучше понимать, какая строка используется в каком случае, оставьте файл перевода пустым и переключитесь на новый язык на сайте. Вместо строк перевода вы увидите идентификаторы данных строк. Например: `menu.about`.

Некоторые строки используют переменные. Переменные вставляются в строку при помощи следующего синтаксиса: `{имя переменной}`.
Например в строку: `Превышен лимит доступных средств {currency}` вставляется переменная `currency` с кодом валюты.
Обращайте внимание на подобные переменные и старайтесь внедрять их в ваш перевод.


На сервере все находится в папке  `/var/www/face2face`