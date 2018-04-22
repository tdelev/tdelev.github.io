function getParameterByName(name, url) {
    if (!url) url = window.location.href;
    name = name.replace(/[\[\]]/g, "\\$&");
    var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
        results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, " "));
}

$(document).ready(function() {
    $('#fullpage').fullpage({
        anchors:['intro', 'location', 'form']
    });

    var invited = {
        "rs": "Ристе и Слободанка",
        "bk": "Бажо и Катерина со фамилијата"
    };

    var path = window.location.pathname;

    var key = getParameterByName('who');
    console.log(key);
    console.log(invited[key]);
});