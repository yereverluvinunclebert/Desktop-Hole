/*
    Web Widget Interface
    Copyright 2014-2020 Harry Whitfield

    This program is free software; you can redistribute it and/or modify it under
    the terms of the GNU General Public License as published by the Free Software
    Foundation; either version 2 of the License, or (at your option) any later
    version.

    This program is distributed in the hope that it will be useful, but WITHOUT ANY
    WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A
    PARTICULAR PURPOSE.  See the GNU General Public License for more details.

    You should have received a copy of the GNU General Public License along with
    this program; if not, write to the Free Software Foundation, Inc., 51 Franklin
    St, Fifth Floor, Boston, MA  02110-1301  USA

    Web Widget Interface - browser version 2.5
    3 February, 2020
    Copyright 2014-2020 Harry Whitfield
    mailto:g6auc@arrl.net
*/

/*jslint browser, devel, for, this */

/*global Image, ActiveXObject */

/*property
    PI, XMLHttpRequest, add, appendChild, body, checked, clearRect, clip, cols,
    containsPoint, createElement, createTextNode, ctx, div, drawImage, fillText,
    filter, font, forEach, getAllResponseHeaders, getContext, hOffset, hRegP,
    height, indexOf, innerHTML, keys, lastIndexOf, left, length, match,
    maxHeight, maxWidth, modifiers, naturalHeight, naturalWidth, ondrag, onload,
    onmousedown, onmouseenter, onmouseout, onmouseup, onreadystatechange,
    opacity, open, preventDefault, prototype, readyState, remove, replace,
    responseText, restore, rotate, round, rows, save, scale, send, setAttribute,
    size, split, src, srcDown, srcUp, status, stopPropagation, style, substring,
    text, timeout, toFixed, toUpperCase, top, transform, transformOrigin,
    translate, type, vOffset, vRegP, value, width, within, zOrder
*/

//////////////////////////////////// webWidget globals ///////////////////////////////////

//let gScalePref;       // declared and set in cookies.js
//let gScale = Number(gScalePref / 100);

let scale = 1.0;        // or gScale
const vtop = 20;
const left = 20;
const fScale = 6.0;     // was 6.67
const hScale = 6.3;     // hScale was 6.0
const vScale = 16;

///////////////////////////// Start of the setStyle function /////////////////////////////

function setStyle(obj, styleString) {
    let items = styleString.split(";");
    let last = items[items.length - 1];
    let that = obj.style;

    function trim(s) {
        return s.replace(/^\s+|\s+$/g, "");
    }

    function toCamelCase(s) {
        let t = "";
        let ok = /^-?[a-z]+(-[a-z]+)*$/;
        let f = false;

        function doThis(c) {
            if (c === "-") {
                f = true;
            } else {
                t += (
                    f
                    ? c.toUpperCase()
                    : c
                );
                f = false;
            }
        }

        if (s.match(ok) === null) {
            alert("Badly formed css attribute: " + s);
            return "";
        }

        s.split("").forEach(doThis);

        return t;
    }

    if ((last === "") || (last.indexOf(":") === -1)) {
        items.length -= 1;
    }   // remove empty entry

    function doThat(ele) {
        let item = ele.split(":");
        let key = trim(item[0]);
        let value = trim(item[1]);

        key = toCamelCase(key);
        if (key !== "") {
            that[key] = value;
        }
    }

    items.forEach(doThat);

}

///////////////////////////// End  of  the setStyle function /////////////////////////////

//////////////////////////// Start of the webWidget functions ////////////////////////////

function newFrame(hOffset, vOffset, width, height, src, zOrder, opacity, id) {
    let iframe = document.createElement("iframe");

    hOffset = Math.round(scale * hOffset);
    vOffset = Math.round(scale * vOffset);

    iframe.setAttribute(
        "style",
        "position: absolute; left: " + String(hOffset + left) +
        "px; top: " + String(vOffset + vtop) + "px; z-index: " + String(zOrder) + ";"
    );

    iframe.setAttribute("src", src);

    if (id !== undefined) {
        iframe.setAttribute("id", id);
    }

    iframe.style.width = Math.round(scale * width) + "px";
    iframe.style.height = Math.round(scale * height) + "px";

    document.body.appendChild(iframe);

    iframe.width = Math.round(scale * width);
    iframe.height = Math.round(scale * height);

    if (opacity === undefined) {
        opacity = "1.0";
    }
    iframe.style.opacity = String(opacity);
    iframe.style.filter = "alpha(opacity=" + Math.round(100 * opacity) + ")";
    return iframe;
}

function newElement(tagName, hOffset, vOffset, zOrder, id) {
    let div = document.createElement("div");
    let ele;

    div.setAttribute(
        "style",
        "position: absolute; left: " + String(hOffset + left) +
        "px; top: " + String(vOffset + vtop) + "px; z-index: " + String(zOrder) + ";"
    );

    if (id !== undefined) {
        div.setAttribute("id", id + "DIV");
    }

    document.body.appendChild(div);

    ele = document.createElement(tagName);
    ele.left = hOffset;
    ele.top = vOffset;
    ele.div = div;
    ele.zOrder = zOrder;
    if (id !== undefined) {
        ele.setAttribute("id", id);
    }
    div.appendChild(ele);
    return ele;
}

function newDiv(hOffset, vOffset, zOrder, id) {
    let div = document.createElement("div");

    hOffset = Math.round(scale * hOffset);  // new 20190212
    vOffset = Math.round(scale * vOffset);  // new 20190212

    div.setAttribute(
        "style",
        "position: absolute; left: " + String(hOffset + left) +
        "px; top: " + String(vOffset + vtop) + "px; z-index: " + String(zOrder) + ";"
    );

    if (id !== undefined) {
        div.setAttribute("id", id);
    }

    div.zOrder = zOrder;

    document.body.appendChild(div);

    div.hOffset = hOffset;  // new 20191115
    div.vOffset = vOffset;  // new 20191115

    return div;
}

function moveDiv(div, hOffset, vOffset) {
    hOffset = Math.round(scale * hOffset);
    vOffset = Math.round(scale * vOffset);

    div.setAttribute(
        "style",
        "position: absolute; left: " + String(hOffset + left) +
        "px; top: " + String(vOffset + vtop) + "px; z-index: " + String(div.zOrder) + ";"
    );
}

function moveObj(obj, hOffset, vOffset) {
    hOffset = Math.round(scale * hOffset);
    vOffset = Math.round(scale * vOffset);

    obj.div.setAttribute(
        "style",
        "position: absolute; left: " + String(hOffset + left) +
        "px; top: " + String(vOffset + vtop) + "px; z-index: " + String(obj.zOrder) + ";"
    );
}

function move(obj) {
    obj.div.setAttribute(
        "style",
        "position: absolute; left: " + String(obj.left + left) +
        "px; top: " + String(obj.top + vtop) + "px; z-index: " + String(obj.zOrder) + ";"
    );
}

function newImage(hOffset, vOffset, width, height, src, zOrder, opacity, hRegP, vRegP, id) {
    let img;

    hOffset = Math.round(scale * hOffset);
    vOffset = Math.round(scale * vOffset);

    img = newElement("img", hOffset, vOffset, zOrder, id);

    img.hOffset = hOffset;  // new 20190212
    img.vOffset = vOffset;  // new 20190212

    hRegP = hRegP || 0;     // hRegP and vRegP are optional parameters
    vRegP = vRegP || 0;

    img.src = src;

    if ((width === 0) || (height === 0)) {
        img.onload = function () {
            img.width = Math.round(scale * img.naturalWidth);
            img.height = Math.round(scale * img.naturalHeight);
        };
    } else {
        img.width = Math.round(scale * width);
        img.height = Math.round(scale * height);
    }

    if (opacity === undefined) {
        opacity = "1.0";
    }
    img.style.opacity = String(opacity);
    img.style.filter = "alpha(opacity=" + Math.round(100 * opacity) + ")";

    img.hRegP = Math.round(scale * hRegP);
    img.vRegP = Math.round(scale * vRegP);

    return img;
}

function newButton(hOffset, vOffset, width, height, src, srcDown, zOrder, opacity, clickAction, id) {
    let o = newImage(hOffset, vOffset, width, height, src, zOrder, opacity, id);

    o.srcUp = src;
    o.srcDown = srcDown;
    o.within = false;
    o.onmouseup = function (event) {
        event.stopPropagation();
        event.preventDefault();
        if (this.within) {
            this.src = src;
            clickAction(event);
        }
    };
    o.onmousedown = function (event) {
        event.stopPropagation();
        event.preventDefault();
        this.within = true;
        this.src = srcDown;
    };
    o.onmouseenter = function (event) {
        event.stopPropagation();
        event.preventDefault();
        this.within = true;
        this.src = srcDown;
    };
    o.onmouseout = function (event) {
        event.stopPropagation();
        event.preventDefault();
        this.within = false;
        this.src = src;
    };
    o.ondrag = function (event) {
        event.stopPropagation();
        event.preventDefault();
    };
    return o;
}

/*
function newTextX(hOffset, vOffset, width, height, value, zOrder, style, id) {
    let text;

    hOffset = Math.round(scale * hOffset);
    vOffset = Math.round(scale * vOffset);

    text = newElement("input", hOffset, vOffset, zOrder, id);
    text.type = "text";

    text.width = Math.round(scale * width);
    text.size = Math.round(scale * width / hScale);
    text.style.maxWidth = Math.round(scale * width) + "px";
    text.height = Math.round(scale * height);
    text.style.maxHeight = Math.round(scale * height) + "px";
    text.value = value;
    if (style !== undefined) {  // style is an optional parameter
        setStyle(text, style);
    }
    return text;
}
*/
function newText(hOffset, vOffset, width, height, value, zOrder, style, id) {
    let text;

//  vOffset = vOffset - 2 * height / 3;         ???

    text = newDiv(hOffset, vOffset, zOrder, id);
    text.innerHTML = value;

    width = Math.round(scale * width);
    height = Math.round(scale * height);

    setStyle(text, "width:" + width + "px; height:" + height + "px;");

    if (style !== undefined) {  // style is an optional parameter
        setStyle(text, style);
    }
    text.hOffset = hOffset; // new 20191115
    text.vOffset = vOffset; // new 20191115

    return text;
}

function newPara(hOffset, vOffset, ignore, height, value, zOrder, style, id) {
    let para;
    let text;

    vOffset = vOffset - 9 * height / 16;

    hOffset = Math.round(scale * hOffset);
    vOffset = Math.round(scale * vOffset);

    para = newElement("p", hOffset, vOffset, zOrder, id);
    text = document.createTextNode(value);
    if (style !== undefined) {  // style is an optional parameter
        setStyle(para, style);
    }
    para.appendChild(text);
    return para;                // para.innerHTML = value to change the text
}

function newTextArea(hOffset, vOffset, width, height, value, zOrder, style, id) {
    let textarea;

    hOffset = Math.round(scale * hOffset);
    vOffset = Math.round(scale * vOffset);

    textarea = newElement("textarea", hOffset, vOffset, zOrder, id);

    textarea.cols = Math.round(width / hScale);
    textarea.rows = Math.round(height / vScale);
    textarea.value = value;

    textarea.style.maxWidth = Math.round(scale * width) + "px";
    textarea.style.maxHeight = Math.round(scale * height) + "px";

    if (style !== undefined) {  // style is an optional parameter
        setStyle(textarea, style);
    }
    return textarea;
}

function newInput(hOffset, vOffset, width, height, value, zOrder, style, id) {
    let input;

    hOffset = Math.round(scale * hOffset);
    vOffset = Math.round(scale * vOffset);

    input = newElement("input", hOffset, vOffset, zOrder, id);
    input.type = "text";

    input.width = Math.round(scale * width);
    input.size = Math.round(scale * width / fScale);
    input.height = Math.round(scale * height);
    input.value = value;

    input.style.maxWidth = Math.round(scale * width) + "px";
    input.style.maxHeight = Math.round(scale * height) + "px";

    if (style !== undefined) {  // style is an optional parameter
        setStyle(input, style);
    }
    return input;
}

function newCanvas(hOffset, vOffset, width, height, src, zOrder, opacity, hRegP, vRegP, id) {
    let canvas;     // e.g. style="border:1px solid #d3d3d3;"

    hOffset = Math.round(scale * hOffset);
    vOffset = Math.round(scale * vOffset);

    canvas = newElement("canvas", hOffset, vOffset, zOrder, id);

    hRegP = hRegP || 0;     // hRegP and vRegP are optional parameters
    vRegP = vRegP || 0;

    canvas.src = src;
    if (opacity === undefined) {
        opacity = "1.0";
    }
    canvas.style.opacity = String(opacity);
    canvas.style.filter = "alpha(opacity=" + Math.round(100 * opacity) + ")";

    canvas.hOffset = hOffset;
    canvas.vOffset = vOffset;
    canvas.width = Math.round(scale * width);
    canvas.height = Math.round(scale * height);
    canvas.ctx = canvas.getContext("2d");
    canvas.hRegP = Math.round(scale * hRegP);
    canvas.vRegP = Math.round(scale * vRegP);
    return canvas;
}

function newCanvasImage(canvas, callback) {
    "use strict";
    let img = new Image(canvas.width, canvas.height);

    img.width = canvas.width;
    img.height = canvas.height;
    img.src = canvas.src;
    if (callback !== undefined) {
        img.onload = function () {
            callback(img);
        };
    }
    return img;
}

function drawImage(canvas, img, hOff, vOff, ang) {
    "use strict";
    let ctx = canvas.ctx;
    let width = canvas.width;
    let height = canvas.height;
    let hRegP = canvas.hRegP;
    let vRegP = canvas.vRegP;

    ctx.save();
    ctx.clearRect(0, 0, width, height);
    ctx.translate(hRegP, vRegP);
    ctx.rotate(Math.PI * ang / 180);
    ctx.translate(-hRegP, -vRegP);
    ctx.scale(scale, scale);
    ctx.drawImage(img, hOff, vOff);
    ctx.restore();
}

function drawText(canvas, text, hOff, vOff, ang, font) {
    let ctx = canvas.ctx;
//  let width = canvas.width;
//  let height = canvas.height;
    let hRegP = canvas.hRegP;
    let vRegP = canvas.vRegP;

    ctx.save();
    //ctx.clearRect(0, 0, width, height);
    ctx.translate(hRegP, vRegP);
    ctx.rotate(Math.PI * ang / 180);
    ctx.translate(-hRegP, -vRegP);
    ctx.scale(scale, scale);
    ctx.font = font;                    // e.g.  ctx.font = "30px Arial";
    ctx.fillText(text, hOff, vOff);
    ctx.restore();
}

function newSelector(hOffset, vOffset, width, height, value, zOrder, opacity, id) {
    let selector;

    hOffset = Math.round(scale * hOffset);
    vOffset = Math.round(scale * vOffset);

    selector = newElement("select", hOffset, vOffset, zOrder, id);

    selector.width = Math.round(scale * width);
    selector.height = Math.round(scale * height);
    selector.value = value;
    if (opacity === undefined) {
        opacity = "1.0";
    }   // opacity is an optional parameter
    selector.style.opacity = String(opacity);
    selector.style.filter = "alpha(opacity=" + Math.round(100 * opacity) + ")";

//  selector.style.fontWeight = "bold";
//  selector.style.fontSize = "14px";

    return selector;
}

function addToMenu(selector, strings) {
    let option;

    strings.forEach(function (ele) {
        option = document.createElement("option");
        option.text = ele;
        selector.add(option);
    });
}

function removeFromMenu(selector, index) {
    selector.remove(index);
}

function clearMenu(selector) {
    "use strict";
    let i;

    for (i = selector.length - 1; i >= 0; i -= 1) {
        selector.remove(i);
    }
}

function newFontSelector(hOffset, vOffset, width, height, value, zOrder, opacity, id) {
    const fonts = [
        "Andale Mono", "Arial", "Arial Black", "Brush Script MT", "Comic Sans MS",
        "Consolas", "Courier New", "Georgia", "Helvetica", "Impact", "Lucida Grande",
        "Lucida Sans Unicode", "Microsoft Sans Serif", "Monaco", "Palatino Linotype",
        "Symbol", "Tahoma", "Times New Roman", "Trebuchet MS", "Verdana", "Webdings",
        "Wingdings"
    ];

    let fontSelector = newSelector(hOffset, vOffset, width, height, value, zOrder, opacity, id);
    addToMenu(fontSelector, fonts);
    fontSelector.value = value;

    return fontSelector;
}

function newHotkey(hOffset, vOffset, width, height, value, zOrder, opacity, id) {
    const modifiers = [
        "Command", "Option", "Shift", "Control", "Command+Option", "Command+Shift",
        "Command+Control", "Option+Shift", "Option+Control", "Shift+Control"
    ];
    const keys = [
        "F1", "F2", "F3", "F4", "F5", "F6", "F7", "F8", "F9", "F10", "F11", "F12", "F13",
        "F14", "F15", "F16", "Tab", "Enter", "Help", "Home", "End", "PageUp", "PageDown"
    ];

    function modifierOf(hotkey) {       // Command+Option+F10
        let idx = hotkey.lastIndexOf("+");

        return hotkey.substring(0, idx);
    }

    function keyOf(hotkey) {            // Command+Option+F10
        let idx = hotkey.lastIndexOf("+");

        return hotkey.substring(idx + 1);
    }

    let hotkey1 = newSelector(hOffset, vOffset, width, height, modifierOf(value), zOrder, opacity, id);
    addToMenu(hotkey1, modifiers);

    let hotkey2 = newSelector(hOffset + 140, vOffset, width, height, keyOf(value), zOrder, opacity, id);
    addToMenu(hotkey2, keys);

    let hotkey = {};

    hotkey.modifiers = hotkey1;
    hotkey.keys = hotkey2;

    return hotkey;
}

function newFileSelector(hOffset, vOffset, width, height, ignore, zOrder, style, id) {
    let input;

    hOffset = Math.round(scale * hOffset);
    vOffset = Math.round(scale * vOffset);

    input = newElement("input", hOffset, vOffset, zOrder, id);
    input.type = "file";

    input.width = Math.round(scale * width);
    input.size = Math.round(scale * width / hScale);
//    input.style.maxWidth = Math.round(scale * width) + "px";
    input.height = Math.round(scale * height);
//    input.style.maxHeight = Math.round(scale * height) + "px";
//  input.value = value;
    if (style !== undefined) {  // style is an optional parameter
        setStyle(input, style);
    }
    return input;
}

function newCheckbox(hOffset, vOffset, width, height, value, zOrder, style, id) {
    let input;

    hOffset = Math.round(scale * hOffset);
    vOffset = Math.round(scale * vOffset);

    input = newElement("input", hOffset, vOffset, zOrder, id);
    input.type = "checkbox";

    input.width = Math.round(scale * width);
    input.size = Math.round(scale * width / fScale);
    input.height = Math.round(scale * height);
    input.checked = (value === "1");
    if (style !== undefined) {  // style is an optional parameter
        setStyle(input, style);
    }
    return input;
}

function newInputButton(hOffset, vOffset, width, height, value, zOrder, style) {
    let input;

    hOffset = Math.round(scale * hOffset);
    vOffset = Math.round(scale * vOffset);

    input = newElement("input", hOffset, vOffset, zOrder);
    input.type = "button";

    input.width = Math.round(scale * width);
    input.size = Math.round(scale * width / fScale);
    input.height = Math.round(scale * height);
    input.value = value;
    if (style !== undefined) {  // style is an optional parameter
        setStyle(input, style);
    }
    return input;
}

function newColor(hOffset, vOffset, width, height, value, zOrder, style, id) {
    let input;

    hOffset = Math.round(scale * hOffset);
    vOffset = Math.round(scale * vOffset);

    input = newElement("input", hOffset, vOffset, zOrder, id);
    input.type = "color";

    input.width = Math.round(scale * width);
    input.size = Math.round(scale * width / fScale);
    input.height = Math.round(scale * height);
    input.value = value;
    if (style !== undefined) {  // style is an optional parameter
        setStyle(input, style);
    }
    return input;
}

let moveImg = moveObj;  // for backwards compatibility

function getURL(url, timeout, eprint, callback) {   // timeout in seconds
    let request;
    let myStatusProc;

    if (window.XMLHttpRequest) {
        request = new XMLHttpRequest();
    } else {
        // code for IE6, IE5
        request = new ActiveXObject("Microsoft.XMLHTTP");
    }

    myStatusProc = function () {
        const banner = "==== === ResponseHeaders === ====";
        const endBan = "==== end ResponseHeaders end ====";
        let arr;
        let map = {};

        if (this.readyState === 4) {
            if (request.status === 200) {
                arr = request.getAllResponseHeaders().split(/\r\n/);
                eprint(banner);
                arr.forEach(function (line) {
                    let p;
                    if (line !== "") {
                        eprint(line);
                        p = line.split(": ");
                        map[p[0]] = p[1];
                    }
                });
                eprint(endBan);
                callback(request.responseText, request.status, map);
            } else {
                callback(null, request.status, map);
            }
        }
    };

    request.onreadystatechange = myStatusProc;
    request.open("GET", url, true);
    request.timeout = 1000 * timeout;
    request.send();
}

////////////////////////////////////// CSS Transform /////////////////////////////////////

if (!Object.prototype.rotate) {
    Object.prototype.rotate = function (angle) {
        let hReg = 100 * this.hRegP / this.width;
        let vReg = 100 * this.vRegP / this.height;

        this.style.transformOrigin = hReg.toFixed(0) + "% " + vReg.toFixed(0) + "%";
        this.style.transform = "rotate(" + angle + "deg)";
    };
}

/////////////////////////////////// End of CSS Transform /////////////////////////////////

/////////////////////////////////// Clipping Functions ///////////////////////////////////

if (!Object.prototype.containsPoint) {
    Object.prototype.containsPoint = function (x, y, delta) {
        let x0 = this.hOffset;
        let x1 = x0 + this.width;
        let y0 = this.vOffset;
        let y1 = y0 + this.height;

        return ((x >= x0 - delta) && (x < x1 + delta) && (y >= y0 - delta) && (y < y1 + delta));
    };
}

function clip(objA, objB) {     // objA is to be clipped - objB is to be the bounding box
    let topY = objB.vOffset - objA.vOffset;
    let rightX = objB.hOffset - objA.hOffset + objB.width;
    let bottomY = topY + objB.height;
    let leftX = rightX - objB.width;

    objA.setAttribute("style", "position: absolute;");
    objA.style.clip = "rect(" + topY + "px," + rightX + "px," + bottomY + "px," + leftX + "px)";
}

function unclip(objA) {
    objA.setAttribute("style", "position: absolute;");
    objA.style.clip = "auto";
}

/////////////////////////////// End of Clipping Functions ////////////////////////////////


export {scale, vtop, left, fScale, hScale, vScale};
export {setStyle};
export {newFrame, newElement, newDiv, moveDiv, moveObj, moveImg, move};
export {newImage, newButton, newText, newPara, newTextArea, newInput};
export {newCanvas, newCanvasImage, drawImage, drawText};
export {newHotkey, newSelector, addToMenu, removeFromMenu, clearMenu};
export {newFileSelector, newFontSelector, newCheckbox, newInputButton, newColor, getURL};
export {clip, unclip};

///////////////////////////// End of the webWidget functions /////////////////////////////
