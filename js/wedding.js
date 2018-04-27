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
        "rs": "Ристе и Слободанка",
        "bk": "Блаже и Катерина"
    };

    var path = window.location.pathname;

    var key = getParameterByName('who');
    console.log(key);
    console.log(invited[key]);
    $('#invited').text(invited[key]);

    $('#down-icon-container').click(function () {
        $.fn.fullpage.moveSectionDown();
    });
    $('#down-icon-container-map').click(function () {
        $.fn.fullpage.moveSectionDown();
    });
});