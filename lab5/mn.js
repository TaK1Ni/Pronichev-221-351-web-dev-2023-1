'use strict';

const BASE_URL = new URL("http://cat-facts-api.std-900.ist.mospolytech.ru/");

const state = {
    page: 1,
    perPage: 10,
    pageCount: 0
};

const hideLines = () => {
    let lines = document.querySelector(".lines");
    lines.setAttribute("id", "hidden");
    lines.innerHTML = "";
};

const fillLineByCollection = (collection) => {
    let lines = document.querySelector(".lines");
    lines.removeAttribute("id");
    for (let element of collection) {
        lines.innerHTML += `<p>${element}</p>`;
    }
};

const fillPageByCollection = (collection) => {
    let template = document.getElementById("post_t");
    const main = document.querySelector(".posts");
    for (let record of collection) {
        let post = template.content.cloneNode(true);
        post.querySelector("p").textContent = record.text;
        post.querySelector(".userCard").textContent = 
            record?.user?.name?.first +
            " " +
            record?.user?.name?.last;
        main.append(post);
    }
};

function pageCounter(objectPagination) {
    state.pageCount = objectPagination.total_pages;
}

function numeration() {
    let first = Math.max(1, state.page - 2);
    let btnp = document.getElementById('btn-p');
    let last = Math.min(state.page + 2, state.pageCount);
    btnp.innerHTML = "";
    for (let i = first; i <= last; i++) {
        let btn = document.createElement("button");
        btn.innerHTML = i;
        btn.onclick = () => goToPage(i);
        btn.setAttribute("class", "pageButton");
        btnp.append(btn);
    }
    for (let btn of btnp.children) {
        if (btn.innerHTML == state.page) btn.setAttribute("id", "activePage");
    }
}

function getRequest(page = 1, perPage = 10, q = "") {
    let url = new URL("facts", BASE_URL);
    url.searchParams.set("page", page);
    url.searchParams.set("per-page", perPage);
    if (q != "") url.searchParams.set("q", q);
    let xhr = new XMLHttpRequest();
    xhr.open("GET", url);
    xhr.send();
    xhr.onload = function() {
        //alert(`Есть: ${xhr.status}, ${xhr.response}`);
        let json = JSON.parse(xhr.response);
        cleanPosts();
        fillPageByCollection(json.records);
        pageCounter(json._pagination);
        numeration();
    };
}

function getAutocompletition(q = "") {
    let url = new URL("autocomplete", BASE_URL);
    url.searchParams.set("q", q);
    let xhr = new XMLHttpRequest();
    xhr.open("GET", url);
    xhr.send();
    xhr.onload = function() {
        let json = JSON.parse(xhr.response);
        hideLines();
        fillLineByCollection(json);
    };
}

function cleanPosts() {
    let main = document.querySelector(".posts");
    main.innerHTML = "";
}

function goToPage(pageNum) {
    state.page = pageNum;
    getRequest(state.page, state.perPage);
}

function getNextPage() {
    state.page++;
    getRequest(state.page, state.perPage);
}

function getBackPage() {
    state.page--;
    getRequest(state.page, state.perPage);   
}

function onPagesChange() {
    let perPage = document.getElementById('Per-page');
    state.perPage = Number(perPage.value);
    state.page = 1;
    getRequest(state.page, state.perPage);
}

function onSearchButtonClick () {
    state.page = 1;
    let field = document.querySelector(".search-field");
    getRequest(state.page, state.perPage, field.value);
}

function onKeyPress () {
    let field = document.querySelector(".search-field");
    getAutocompletition(field.value);
}

window.onload = () => {
    getRequest(state.page, state.perPage);
    document.getElementById('Per-page').onchange = onPagesChange;
    document.querySelector('.search-btn').onclick = onSearchButtonClick;
    document.querySelector(".search-field").onkeyup = onKeyPress;
    document.querySelector('.lines').onclick = (event) => {
        if (event.target.tagName == "P") {
            state.page = 1;
            getRequest(state.page, state.pageCount, event.target.innerHTML);
            hideLines();
        }
    };
};
