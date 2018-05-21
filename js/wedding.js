function getParameterByName(name, url) {
    if (!url) url = window.location.href;
    name = name.replace(/[\[\]]/g, "\\$&");
    var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
        results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, " "));
}

$(document).ready(function () {
    $('#fullpage').fullpage({
        anchors: ['intro', 'location', 'form'],
        navigation: true,
        navigationPosition: 'right',
        controlArrows: true
    });

    var invited = {
        // Tomche
        "im": "Иван и Маја",
        "blaze": "Блаже",
        "ai": "Аце и Ивана",
        "bt": "Борче и Тамара",
        "ls": "Лазе и Спаска",
        "ao": "Александар и Олга",
        "bk": "Блаже и Катерина",
        "rs": "Ристе и Слободанка",
        "z": "Зоки",
        "j": "Јоки",
        "ga": "Ѓорѓи и Анета",
        "iz": "Иван и Зорица",
        "kb": "Катарина и Бојан",
        "aa": "Александра и Александар",
        "ad": "Александра и Дејан",
        "ek": "Ефтим и Катерина",
        "pe": "Петре и Елена",
        "ha": "Христина и Атанас",
        "ii": "Ивица и Ивана",
        "dg": "проф. Дејан и Зорица",
        "iv": "Иван и Весна",
        "vv": "Владимир и Валерија",
        "is": "Игор и Сања",
        "dm": "Дионис и Мариела",
        "miki": "Мирослав",
        "dada": "Живка, Jörn и Емил",
        // Nadica
        "rb": "Родна и Благој",
        "mk": "Маја и Коста",
        "tt": "Тијана и Трајче",
        "ds": "Доне и Славица",
        "anan": "Анастасија и Антоние",
        "id": "Ивана и Диме",
        "dime": "Диме",
        "stefan": "Стефан",
        "deniz": "Дениз",
        "tm": "Тоше и Марија",
        "igor": "Игор",
        "ivana": "Ивана",
        "eb": "Елена и Бојан",
        "elenag": "Елена",
        "sanja": "Сања",
        "tb": "Тања и Борче",
        "at": "Александра и Тони",
        "dp": "Dobi and Peter",
        "radmila": "Радмила",
        "rosana": "Росана и Тасе",
        "elenap": "Елена Поповска",
        "elenam": "Елена",
        "anak": "Ана",
        "frosina": "Фросина",
        "aj": "Ане и Јован",
        "ros": "Росана",
        "zorica": "Зорица",
        "katerina": "Катерина",
        "jo": "Јанаки и Олгица"
    };

    var key = getParameterByName('who');
    // console.log(key);
    // console.log(invited[key]);
    var guest = invited[key] || "";
    var formUrl = 'https://docs.google.com/forms/d/e/1FAIpQLSeBVtaqr3Zodpko414m1VirgYnCTxLlWCwh4jceJcgKwZyEQA/viewform?embedded=true';
    formUrl = formUrl + '&entry.229359151=' + guest;
    $('#google-form').attr('src', formUrl);
    $('#invited').text(invited[key]);

    $('#down-icon-container').click(function () {
        $.fn.fullpage.moveSectionDown();
    });
    $('#down-icon-container-map').click(function () {
        $.fn.fullpage.moveSectionDown();
    });
    $('#up-icon-container').click(function () {
        $.fn.fullpage.moveTo('intro');
    });
});