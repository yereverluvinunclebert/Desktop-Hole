/*
    Web Audio API
    Based on code samples from the page "Getting Started with Web Audio API"
    by Boris Smus at http://www.html5rocks.com/en/tutorials/webaudio/intro/ .
    Code samples licensed under the Apache 2.0 License.
*/

/*jslint browser, devel */

/*property
    AudioContext, buffer, connect, createBuffer, createBufferSource,
    decodeAudioData, destination, onload, open, response, responseType, send,
    start, webkitAudioContext
*/

let lockBuffer = null;
let mistakeBuffer = null;
let pagefumbleBuffer = null;
let sparksBuffer = null;
let tingBuffer = null;

let lockReady = false;
let mistakeReady = false;
let pagefumbleReady = false;
let sparksReady = false;
let tingReady = false;

//window.AudioContext = window.AudioContext || window.webkitAudioContext;
//let context = new AudioContext();

let AudioCtx = window.AudioContext || window.webkitAudioContext;

let context = new AudioCtx();

function onError(e) {
    alert("sounds:onError: " + e);
}

function loadBuffer(url, callback) {
    let request = new XMLHttpRequest();

    request.open("GET", url, true);
    request.responseType = "arraybuffer";

    request.onload = function () {
        context.decodeAudioData(request.response, function (buffer) {
            callback(buffer);
        }, onError);
    };
    request.send();
}

function initSound() {
    const lockURL = "Resources/Sounds/lock.mp3";
    const mistakeURL = "Resources/Sounds/mistake.mp3";
    const pagefumbleURL = "Resources/Sounds/pagefumble.mp3";
    const sparksURL = "Resources/Sounds/sparks.mp3";
    const tingURL = "Resources/Sounds/ting.mp3";

    loadBuffer(lockURL, function (buffer) {
        lockBuffer = buffer;
        lockReady = true;
    });

    loadBuffer(mistakeURL, function (buffer) {
        mistakeBuffer = buffer;
        mistakeReady = true;
    });

    loadBuffer(pagefumbleURL, function (buffer) {
        pagefumbleBuffer = buffer;
        pagefumbleReady = true;
    });

    loadBuffer(sparksURL, function (buffer) {
        sparksBuffer = buffer;
        sparksReady = true;
    });

    loadBuffer(tingURL, function (buffer) {
        tingBuffer = buffer;
        tingReady = true;
    });
}

function playSound(buffer) {
    let source = context.createBufferSource();

    source.buffer = buffer;
    source.connect(context.destination);
    source.start(0);
}

function unlockSound() {
    let buffer = context.createBuffer(1, 1, 22050);

    playSound(buffer);
}

export {initSound, playSound, unlockSound};
export {lockBuffer, mistakeBuffer, pagefumbleBuffer, sparksBuffer, tingBuffer};
export {lockReady, mistakeReady, pagefumbleReady, sparksReady, tingReady};
