function parseMd(md){

    var md0 = md;

    //at
    md = md.replace(/\n[\@]{1}([^\s]+)\s(.+)\n\n([\s\S][^\@]+)\n\n[\`]{1}([^\`]+)[\`]{1}/g, '<div class="tweet_wrapper"><a href="?p=account/$1"><img src="img/$1.png" class="profile_image"></img></a><div class="tweet"><div class="username">$2</div><div class="userid">@$1</div><div class="tweet_contents">$3</div><code>$4</code></div></div>');
    //md = md.replace(/\n[\@\*]{1}(.+)/g, '<img src="img/$1.png" class="profile_image"></img><div class="username">@$1</div>');

    md = md.replace(/\n\[(.+)\]\n\n[\*]{2}([^\*]+)[\*]{2}\n\n[\@]{1}([^\s]+)/g, '<div class="account_wrapper"><img src="img/$1.png" class="header_image"></img><div class="account"><img src="img/$3.png" class="profile_image"></img></div><div class="user"><div class="username">$2</div><div class="userid">@$3</div></div>');

    md = md.replace(/\n[\@]{1}([^\s]+)\s(.+)\n\n([[\s\S][^\@]+)\n\n\[more\]/g, '<div class="tweet_wrapper"><a href="?p=account/$1"><img src="img/$1.png" class="profile_image"></img></a><div class="user"><div class="username">$2</div><div class="userid">@$1</div><div class="user_bio">$3</div></div><a href="?p=account/$1"><div class="button">더보기</div></a></div>');
  
    //ul
    md = md.replace(/^\s*\n\*\s/gm, '<ul>\n* ');
    md = md.replace(/^(\*\s.+)\s*\n([^\*])/gm, '$1\n</ul>\n\n$2');
    md = md.replace(/^\*\s(.+)/gm, '<li class="before">$1</li>');
    
    //ul
    md = md.replace(/^\s*\n\-\s/gm, '<ul>\n* ');
    md = md.replace(/^(\-\s.+)\s*\n([^\-])/gm, '$1\n</ul>\n\n$2');
    md = md.replace(/^\-\s(.+)/gm, '<li class="before">$1</li>');
    
    //ol
    md = md.replace(/^\s*\n\d\.\s/gm, '<ol>\n1. ');
    md = md.replace(/^(\d\.\s.+)\s*\n([^\d\.])/gm, '$1\n</ol>\n\n$2');
    md = md.replace(/^\d\.\s(.+)/gm, '<li>$1</li>');
    
    //blockquote
    md = md.replace(/^\>(.+)/gm, '<blockquote>$1</blockquote>');
    md = md.replace('</blockquote><blockquote>', '');
    md = md.replace('</blockquote>\n<blockquote>', '\n');

    //hr
    md = md.replace(/[\-]{3}/g, '<hr>');
    
    //h
    md = md.replace(/\n[\#]{6}(.+)/g, '<h6>$1</h6>');
    md = md.replace(/\n[\#]{5}(.+)/g, '<h5>$1</h5>');
    md = md.replace(/\n[\#]{4}(.+)/g, '<h4>$1</h4>');
    md = md.replace(/\n[\#]{3}(.+)/g, '<h3>$1</h3>');
    md = md.replace(/\n[\#]{2}(.+)/g, '<h2>$1</h2>');
    md = md.replace(/\n[\#]{1}(.+)/g, '</div></div><div class="item_wrap"><div class="item"><h1><i class="bx bxs-comment-dots" ></i> $1</h1>');

    
    //images with links
    md = md.replace(/\!\[([^\]]+)\]\(([^\)]+)\)[\(]{1}([^\)\"]+)(\"(.+)\")?[\)]{1}/g, '<div class="gallery"><a href="$3"><img src="$2" alt="$1" width="100%" /></a></div>');
    
    //images
    md = md.replace(/\!\[([^\]]+)\]\(([^\)]+)\)/g, '<img src="$2" alt="$1" width="100%" />');
    
    //links
    md = md.replace(/[\[]{1}([^\]]+)[\]]{1}[\(]{1}([^\)\"]+)(\"(.+)\")?[\)]{1}/g, '<a href="$2" title="$4">$1</a>');
    
    //font styles
    md = md.replace(/[\*]{2}([^\*]+)[\*]{2}/g, '<strong>$1</strong>');
    md = md.replace(/[\*]{1}([^\*]+)[\*]{1}/g, '<i>$1</i>');
    md = md.replace(/[\~]{2}([^\~]+)[\~]{2}/g, '<del>$1</del>');


    //주석
    md = md.replace(/\n[\/]{2}(.+)/g, '');
    

    //pre
    
    var mdpos = [];
    var rawpos = [];
    let pos1 = -1;
    let k = 0;

    var diff = [0]

    while( (pos1 = md0.indexOf('\n```', pos1 + 1)) != -1 ) { 
        if (k % 2 == 0){
            rawpos[k] = pos1 + 4;
        } else {
            rawpos[k] = pos1;
        }
        k++;
    }

    let pos2 = -1;
    let l = 0;

    while( (pos2 = md.indexOf('\n```', pos2 + 1)) != -1 ) { 
        if (l % 2 == 0){
            mdpos[l] = pos2 - 1;
        } else {
            mdpos[l] = pos2 + 5;
        }
        l++;
    }


    for (var i = 0; i < mdpos.length; i++){
        if (i % 2 == 0){
            md = md.replace(md.substring(mdpos[i] - diff[i], mdpos[i+1] - diff[i]), '<pre class="code">'+md0.substring(rawpos[i], rawpos[i+1])+'</pre>');

            var mdSubStringLength = mdpos[i+1] - mdpos[i];
            var rawSubStringLength = rawpos[i+1] - rawpos[i] + '<pre class="code">'.length + '</pre>'.length;
            diff[i+2] = diff[i] + mdSubStringLength - rawSubStringLength;

        }
    }

    //code
    md = md.replace(/[\`]{1}([^\`]+)[\`]{1}/g, '<code>$1</code>');

    //br
    md = md.replace(/\n\n/g, '</p><p>');
    
    return md;
    
}

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
        document.querySelector("#markdown_title").innerHTML = 'Yeojibur.in'
        document.querySelector("#markdown_content").innerHTML += parseMd(out)
    })
    .catch(err => { throw err });
} else if (song) {
    var url = "https://api.github.com/repos/jyhyun1008/peacht.art/issues/"+song;
    fetch(url)
    .then(res => res.text())
    .then((out) => {
        var urlc = "https://api.github.com/repos/jyhyun1008/peacht.art/issues/"+song+"/comments";
        fetch(urlc)
        .then(res => res.text())
        .then((outc) => {
            var result = JSON.parse(out);
            var resultc = JSON.parse(outc);

            var ownedUserId = result.user.login;
            var ownedUserAvatar = result.user.avatar_url;
            var firstCreatedAt = result.created_at;
            var songTitle = result.title;
            var songInfo = result.body.split('#')[1];
            var infoTempo = songInfo.split('BPM')[1].split('*')[0];
            var infoBeat = songInfo.split('Beat')[1].split('*')[0].split('/');
            var trackInfo = result.body.split('#')[2].split('*')[1].split(' ');

            var trackTitle = [];
            var trackVolume = [];
            var trackDelay = [];
            var trackUrl = [];

            for (var i=0; i<trackInfo.length; i++){
                if (trackInfo[i].includes('\\T')){
                    trackTitle.push(trackInfo[i].split('\\T')[1]);
                } else if (trackInfo[i].includes('\\V')){
                    trackVolume.push(trackInfo[i].split('\\V')[1]);
                } else if (trackInfo[i].includes('\\D')){
                    trackDelay.push(trackInfo[i].split('\\D')[1]);
                } else if (trackInfo[i].includes('\\http')){
                    trackUrl.push(trackInfo[i].split('\\')[1].split('\n')[0].split('\r')[0]);
                }
            }

            userId = [ownedUserId];
            userAvatar = [ownedUserAvatar];


            for (var j=0; j<resultc.length; j++){
                userId.push(resultc[j].user.login);
                userAvatar.push(resultc[j].user.avatar_url);
                trackInfo = resultc[j].body.split('*')[1].split(' ');
                for (var i=0; i<trackInfo.length; i++){
                    if (trackInfo[i].includes('\\T')){
                        trackTitle.push(trackInfo[i].split('\\T')[1]);
                    } else if (trackInfo[i].includes('\\V')){
                        trackVolume.push(trackInfo[i].split('\\V')[1]);
                    } else if (trackInfo[i].includes('\\D')){
                        trackDelay.push(trackInfo[i].split('\\D')[1]);
                    } else if (trackInfo[i].includes('\\http')){
                        trackUrl.push(trackInfo[i].split('\\')[1].split('\n')[0].split('\r')[0]);
                    }
                }
            }

            document.getElementsByClassName('songtitle')[0].innerHTML = songTitle;
            document.getElementsByClassName('artist')[0].innerHTML = '<img src="'+ownedUserAvatar+'" class="user_avatar"><div>'+ownedUserId+'</div>';
            document.getElementById('bpm').innerText = parseInt(infoTempo);
            document.getElementById('beat1').innerText = parseInt(infoBeat[0]);
            document.getElementById('beat2').innerText = parseInt(infoBeat[1]);
            document.getElementById('trackCounts').innerText = trackTitle.length;

            console.log(infoTempo, infoBeat, trackTitle, trackVolume, trackDelay, trackUrl);

            var audioArray = [];
            var indexArray = [];

            const BPM = parseInt(infoTempo);
            const BEAT = parseInt(infoBeat[0])/parseInt(infoBeat) * 4;
            const trackCounts = trackTitle.length;

            for (var i=0; i<trackTitle.length; i++){
                audioArray.push(new Audio(trackUrl[i]));
                indexArray.push(i);
                addAudio(trackUrl[i], trackTitle[i], i, trackDelay[i]);
            }


            var vLine = document.getElementsByClassName('v-line')[0];
            var vLinePosition = 0;
            vLine.setAttribute('style', 'height: '+trackTitle.length * 110+'px; margin-bottom: '+trackTitle.length * -110+'px; left: '+vLinePosition+'px;');

            function asyncPlay(index) {
                return new Promise((resolve, reject) => {
                    setTimeout(() => {
                        audioArray[index].play();
                        resolve();
                    }, delayArray[index]);
                });
            }

            async function parallel(array) {
                const promises = array.map((index) => asyncPlay(index));
                await Promise.all(promises);
                console.log("all done :)");
            }

            playButton.addEventListener('click', function(event){
                if (playButton.innerHTML == '<i class="bx bx-play-circle"></i>') {
                    playButton.innerHTML = '<i class="bx bx-pause-circle"></i>';
                    parallel(indexArray);
                    (function repeatOften() {
                        vLinePosition += 32*BPM/60/60;
                        vLine.setAttribute('style', 'height: '+trackTitle.length * 110+'px; margin-bottom: '+trackTitle.length * -110+'px; left: '+vLinePosition+'px;');
                        playAnimation = requestAnimationFrame(repeatOften);
                    })();
                } else if (playButton.innerHTML == '<i class="bx bx-pause-circle"></i>') {
                    playButton.innerHTML = '<i class="bx bx-play-circle"></i>';
                    for (var i = 0; i < trackTitle.length; i++){
                        audioArray[i].pause();
                        cancelAnimationFrame(playAnimation);
                    }
                }
            });

            document.getElementsByClassName('tracklist')[0].addEventListener('click', function(event){
                var x = event.offsetX;
                vLinePosition = x;
                vLine.setAttribute('style', 'height: '+trackTitle.length * 110+'px; margin-bottom: '+trackTitle.length * -110+'px; left: '+vLinePosition+'px;');
                playButton.innerHTML = '<i class="bx bx-play-circle"></i>';
                for (var i = 0; i < trackTitle.length; i++){
                    audioArray[i].pause();
                    cancelAnimationFrame(playAnimation);
                    audioArray[i].currentTime = x*60/32/BPM;
                }
            });

        })
    })
    .catch(err => { throw err });
    
}

