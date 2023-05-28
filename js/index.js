function getQueryStringObject() {
    var a = window.location.search.substr(1).split('&');
    if (a == "") return {};
    var b = {};
    for (var i = 0; i < a.length; ++i) {
        var p = a[i].split('=', 2);
        if (p.length == 1)
            b[p[0]] = "";
        else
            b[p[0]] = decodeURIComponent(p[1].replace(/\+/g, " "));
    }
    return b;
}

var qs = getQueryStringObject();
var song = qs.song;


if (!song) {
    var url = "https://raw.githubusercontent.com/jyhyun1008/peacht.art/main/README.md"
    fetch(url)
    .then(res => res.text())
    .then((out) => {
        document.querySelector(".tline_title").innerHTML = 'Yeojibur.in'
        document.querySelector("#tline_list").innerHTML += parseMd(out)
    })
    .catch(err => { throw err });
} else if (song) {
    var url = "https://api.github.com/repos/jyhyun1008/peacht.art/issues/"+song;
    fetch(url)
    .then(res => res.text())
    .then((out) => {
        result = JSON.parse(out);
        console.log(out);
        user = out.user.login;
        userAvatar = out.user.avatar_url;
    })
    .catch(err => { throw err });
    
}

