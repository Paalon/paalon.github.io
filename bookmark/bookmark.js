// Copyright 2017 Paalon Studio

'use strict';

// console.log('bookmark');

const width = 32;
const height = 32;

const bookmarkPath = './bookmark.json';

let xhr = new XMLHttpRequest();
xhr.open("GET", bookmarkPath, true);
xhr.send();
xhr.onload = function () {
    let bookmarkText = xhr.responseText;
    let bookmark = JSON.parse(bookmarkText);
    onBookmarkLoaded(bookmark);
};


function onBookmarkLoaded(bookmark) {
    let icons_html = [];
    for (let site of bookmark) {
        let name = site.name;
        let url = site.url;
        let icon_url;
        if ("icon_url" in site) {
            icon_url = site.icon_url;
        } else {
            let split_url = site.url.split('/');
            let sliced_url = split_url.slice(0, 3);
            icon_url = sliced_url.join('/') + '/favicon.ico';
        }
        let html = `<a href="${url}" class="icon" id="${name}"> <img src="${icon_url}" width="${width.toString()}" height="${height.toString()}"></img> </a>`;
        icons_html.push(html);
    }
    if (document.readyState == 'complete') {
        onIconsLoaded(icons_html);
    }
}
let onIconsLoaded = function (icons_html) {
    // bookmark表示
    let divBookmark = document.getElementById('bookmark');
    divBookmark.innerHTML = icons_html.join('');
    let divSiteInfo = document.getElementById('info_bar');
    let icons = document.getElementsByClassName('icon');
    let p = document.createElement("p");
    p.innerHTML = "&nbsp;"
    divSiteInfo.appendChild(p);
    divSiteInfo.style.color = '#ffffff';
    for (let icon of icons) {
        icon.onmouseover = function () {
            p.innerHTML = icon.id;
            divSiteInfo.style["background-color"] = '';
            divSiteInfo.style.webkitAnimationName = 'fadeIn';
        }
        icon.onmouseout = function () {
            p.innerHTML = "&nbsp;";
            divSiteInfo.style.webkitAnimationName = 'fadeOut';
        }
    }
}
