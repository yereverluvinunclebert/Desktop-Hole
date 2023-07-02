/*
    Desktop Hole
    Copyright © 2022 Dean Beedell and Harry Whitfield

    This program is free software; you can redistribute it and/or
    modify it under the terms of the GNU General Public License as
    published by the Free Software Foundation; either version 2 of
    the License, or (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public
    License along with this program; if not, write to the Free
    Software Foundation, Inc., 51 Franklin St, Fifth Floor, Boston,
    MA  02110-1301  USA

    Based on the Desktop Hole Yahoo! Widget written and steampunked by Dean Beedell.

    Desktop Hole - browser version 0.16
    6 February, 2022
    Copyright © 2022  Dean Beedell and Harry Whitfield
    mailto:g6auc@arrl.net
*/

/*jslint browser, for, devel */

/* global requestAnimationFrame, File, FileList, Blob */

/*property
    addEventListener, altKey, copy, createDirectory, ctrlKey, dataTransfer,
    dropEffect, files, hOffset, indexOf, innerHTML, interval, isBetween3,
    isDirectory, itemExists, lastIndexOf, length, move, name, now, offsetX,
    offsetY, onTimerFired, onclick, onload, onmousedown, opacity,
    preventDefault, random, remove, reset, rotate, rotation, size, style,
    substring, ticking, title, toLowerCase, type, vOffset, writeFile
*/

import {moveObj, newImage, newText} from "./webWidget.js";
import {getPreference, setPreference} from "./preferences.js";                      // removePreference
import {initSound, playSound} from "./sounds.js";                                   // unlockSound
import {lockBuffer, sparksBuffer, tingBuffer, mistakeBuffer} from "./sounds.js";    // pagefumbleBuffer
import {lockReady, sparksReady, tingReady, mistakeReady} from "./sounds.js";        // pagefumbleReady,
import {Timer} from "./Timer.js";
import {Point, eccentricity} from "./isBetween.js";
import {filesystem, isMacintosh, wpFolder} from "./fsNW.js";                        // cPath
import {documentTypes, compressedTypes, movieTypes, musicTypes, pictureTypes, otherTypes, widgetTypes} from "./preferences.js";
import {packageTypes, userFolder1Types, userFolder2Types, userFolder3Types} from "./preferences.js";	// setExtensions


////////////////////////////////////// User Interface ////////////////////////////////////

//const style = "font-family:Helvetica;color:black;font-weight:normal;background-color:transparent;border:none;font-size:12px;";

// webWidget function calls used in this module:
// newImage(hOffset, vOffset, width, height, src, zOrder, opacity, hRegP, vRegP, id)
// newText(hOffset, vOffset, width, height, value, zOrder, style, id)

//window: mainWindow
//const mainWindow = newWindow(0, 0);

const base = "Resources/Images/";

const bottomHelp = newImage(0, 0, 674, 519, base + "bottomHelp.png", 0, 0);
const deephole = newImage(1, 1, 380, 374, base + "deephole.png", 0, 1);
const deepholebright = newImage(1, 1, 383, 383, base + "deepholebright.png", 0, 0);
const pinArea = newImage(60, 190, 153, 130, base + "pinArea.png", 2, 1);
const deepglass = newImage(1, 1, 295, 186, base + "deepglass.png", 0, 0);
const rust01 = newImage(95, 260, 33, 121, base + "rust01.png", 0, 1);
const rust02 = newImage(130, 260, 80, 113, base + "rust02.png", 0, 1);
const burns = newImage(0, 0, 383, 383, base + "burns.png", 0, 1);
const cracks = newImage(29, 10, 341, 332, base + "cracks.png", 0, 1);
const shadow = newImage(210.5, 126.5, 55, 55, base + "shadow.png", 0, 0.76, 27.5, 27.5);
const smallCog = newImage(214.5, 117.5, 55, 55, base + "smallCog.png", 1, 1, 27.5, 27.5);
const clamp = newImage(238, 141, 37, 30, base + "clamp.png", 2, 1);
const pin = newImage(120, 268, 15, 15, base + "pin.png", 3, 1);

const topLevelHelp = newImage(0, 0, 380, 374, base + "topLevelHelp.png", 0, 0);
const text1 = newText(50, 450, 600, 256, "", 0, "font-family: 'Courier new'; font-size: 10px");

bottomHelp.title = "";
deephole.title = "Drag/drop a file here from your desktop to sort it.";
deepholebright.title = "";
pinArea.title = "Click here to lock the widget in place.";
deepglass.title = "";
rust01.title = "";
rust02.title = "";
burns.title = "";
cracks.title = "";
shadow.title = "";
smallCog.title = "Wheel spins to indicate status.";

clamp.title = "";
pin.title = "";

topLevelHelp.title = "Drag/drop a file here from your desktop to sort it.";

shadow.rotation = 0;
smallCog.rotation = 0;

initSound();

///////////////////////////////////// Rotate Animation ///////////////////////////////////

let rotateObjects = function (obj1, obj2, fromAngle, toAngle, duration) {   // duration in mS
    let oldTime = Date.now();
    let t;  // progress in mS
    let f;  // fractional progress
//  let animationID = null;

    function draw() {
        t = Date.now() - oldTime;   // progress in mS
        if (t >= duration) {
            return;
        }
        f = t / duration;
        obj1.rotation = (1 - f) * fromAngle + f * toAngle;
        obj2.rotation = obj1.rotation;
        obj1.rotate(obj1.rotation);
        obj2.rotate(obj2.rotation);
        //animationID =
        requestAnimationFrame(draw);
    }
    //animationID =
    requestAnimationFrame(draw);
};

//////////////////////////////////// smallCog Rotation ///////////////////////////////////

let spinTimer = new Timer();
spinTimer.interval = 1;
spinTimer.ticking = false;
spinTimer.onTimerFired = function () {
    rotateObjects(smallCog, shadow, smallCog.rotation, (smallCog.rotation + 10) % 360, 50);
};

smallCog.onmousedown = function () {
    if (getPreference("cogwheelPrefs") === "enabled") {
        setPreference("cogwheelPrefs", "disabled");
        spinTimer.ticking = false;
        rotateObjects(smallCog, shadow, smallCog.rotation, 600, 990);
    } else {
        setPreference("cogwheelPrefs", "enabled");
        rotateObjects(smallCog, shadow, smallCog.rotation, -600, 990);
        spinTimer.ticking = true;
    }
};

///////////////////////////////////// locking pin code ///////////////////////////////////

pin.onmousedown = function () {
    if (pin.style.opacity === "1") {
        pin.style.opacity = "0";
    } else {
        pin.style.opacity = "1";
    }

    if (getPreference("soundPref") === "enabled") {
        if (lockReady) {
            playSound(lockBuffer);
        }
    }
    smallCog.onmousedown();
};

let p1 = new Point(16, 32);     // inside pinarea
let p2 = new Point(123, 123);   // inside pinarea
let e1 = eccentricity(1, 0.25); // lower ellipse

let p3 = new Point(36, 10);     // inside pinarea
let p4 = new Point(140, 106);   // inside pinarea
let e2 = eccentricity(1, 0.35); // upper ellipse

pinArea.onclick = function (event) {
    let x = event.offsetX;
    let y = event.offsetY;
    let p0 = new Point(x, y);

    if (p0.isBetween3(p1, p2, e1) && !p0.isBetween3(p3, p4, e2)) {
        if (pin.style.opacity === "0") {
            pin.style.opacity = "1";
            moveObj(pin, pinArea.hOffset + x - 6, pinArea.vOffset + y - 4);
            if (getPreference("soundPref") === "enabled") {
                if (lockReady) {
                    playSound(lockBuffer);
                }
            }
        }
        smallCog.onmousedown();
    }
};

/////////////////////////////////////// timer actions ////////////////////////////////////

let glassTimer = new Timer();
glassTimer.interval = 25;
glassTimer.ticking = false;

glassTimer.onTimerFired = function () {
    glassTimer.ticking = false;
//  closeGlass();
};

let flashTimer = new Timer();
flashTimer.interval = 20;
flashTimer.ticking = false;

let sparkTimer = new Timer();
sparkTimer.interval = 0.050;
sparkTimer.ticking = false;

let sparkItState = 0;

function sparkIt() {
    switch (sparkItState) {
    case 0:
        deepholebright.style.opacity = 1.0;
        sparkTimer.interval = 0.050;
        sparkTimer.reset();
        sparkItState = 1;
        return;
    case 1:
        deepholebright.style.opacity = 0.0;
        sparkTimer.interval = 0.550;
        sparkTimer.reset();
        sparkItState = 2;
        return;
    case 2:
        deepholebright.style.opacity = 1.0;
        sparkTimer.interval = 0.050;
        sparkTimer.reset();
        sparkItState = 3;
        return;
    case 3:
        deepholebright.style.opacity = 0.0;

        if (getPreference("soundPref") === "enabled") {
            if (sparksReady) {
                playSound(sparksBuffer);
            }
        }

        sparkTimer.interval = 0.050;
        sparkTimer.reset();
        sparkItState = 4;
        return;
    case 4:
        deepholebright.style.opacity = 1.0;
        sparkTimer.interval = 0.050;
        sparkTimer.reset();
        sparkItState = 5;
        return;
    case 5:
        deepholebright.style.opacity = 0.0;
        sparkTimer.interval = 0.050;
        sparkTimer.reset();
        sparkItState = 0;
        sparkTimer.ticking = false;
        return;
    }
}

sparkTimer.onTimerFired = sparkIt;

flashTimer.onTimerFired = function () {
    let number = 45 * Math.random();        // [0..45)

//  console.log(new Date() + ": " + number);

    if (number < 1.0) {
//      console.log("Flashing at " + new Date());
        sparkTimer.ticking = true;
    } else {
        smallCog.onmousedown();
    }
};

clamp.onmousedown = function () {
    sparkTimer.ticking = true;
};

////////////////////////////////////// files processing //////////////////////////////////

function eprint(s) {
	filesystem.writeFile(getPreference("logFilePref"), s + "\n", true);
}

function cprint(s) {
    return;
}

function xtn(s) {
    let ext;
    let idx = s.lastIndexOf(".");

    if (idx >= 0) {
        ext = s.substring(idx);
        if (ext.length > 1) {
            return ext.toLowerCase();
        }
    }
    return undefined;
}

function fileName(path) {
    let idx = path.lastIndexOf("/");

    return path.substring(idx + 1);
}

function isAlias(path) {
    if (isMacintosh) {
        return false;                       // **** needs to be fixed.
    }
    return xtn(path).toLowerCase() === ".lnk";
}

function isWebloc(path) {
    let extn = xtn(path).toLowerCase();

    if (isMacintosh) {
        return extn === ".webloc";
    }
    return extn === ".url";
}

function safeMove(path, destFolder, fname, copyItem) {
    let destination = destFolder + "/" + fname;
    let safeFolder = getPreference("safeFolder");
    let result;
    let res;
    let isFolder = filesystem.isDirectory(destination);

    eprint("339: safeMove isFolder: " + isFolder);

    if (!filesystem.itemExists(safeFolder)) {
    	filesystem.createDirectory(safeFolder);
    } else if (!filesystem.isDirectory(safeFolder)) {
    	alert("352: Sorry - it was not possible to safely copy/move a folder.");
    	return false;
    }

    if (isFolder) {
        result = filesystem.copy(destination, safeFolder);
        eprint("350: Old folder copied to safe folder: " + result);
        if (result) {
            result = filesystem.remove(destination);
            eprint("353: Old folder deleted from destination folder: " + result);
        }
        if (!result) {
            if (mistakeReady) {
                playSound(mistakeBuffer);
            }
            alert("359: Sorry - it was not possible to safely copy/move a folder.");
            return false;
        }
    }

    if (copyItem) {
        result = filesystem.copy(path, destFolder);
        eprint("359: Folder/file copied to destination folder: " + result);
    } else {
        result = filesystem.move(path, destFolder);
        eprint("362: Folder/file moved to destination folder: " + result);
    }

    if (isFolder) {
        if (result) {
            res = filesystem.remove(safeFolder + "/" + fname);
            eprint("368: Old folder deleted from safe folder: " + res);
        } else {
            res = filesystem.copy(safeFolder + "/" + fname, destFolder);
            eprint("371: Old folder restored from safe folder: " + res);
        }
    }
    return result;
}

function handleDroppedFile(path, copyItem) {
    let fname = fileName(path);
    let destination;
    let result;
/*
    function esc(path) {
        return path.replace(/([\W])/g, "\\$1");
    }
*/
    //eprint("\n---- ---- ------ ---- ----");
    eprint("387: file: " + path + " has been dropped.");

    function handleFile(path, folder, folderName, fname, copyItem) {
        let dest;
        let destFolder;
        let answer;
        let res;

//      destFolder = preferences[folder].value;
        destFolder = getPreference(folder);
        dest = destFolder + "/" + fname;
        if (filesystem.itemExists(dest)) {
            if (mistakeReady) {
                playSound(mistakeBuffer);
            }
            answer = confirm("A file \"" + fname + "\" is already present in the " + folderName + " folder. Do you wish to proceed?");
            if (!answer) {
                return;
            }
        }

        //handleFile(path, "widgetFolder", "widgets", fname, copyItem);
        if (folder === "widgetFolder") {
            res = safeMove(path, destFolder, fname, copyItem);
            eprint("411: File moved safely to " + folderName + " folder: " + res);
            cprint("File moved safely to " + folderName + " folder: " + res);
        } else {
            if (copyItem) {
                eprint("415: path: " + path);
                eprint("416: dest: " + destFolder);
                res = filesystem.copy(path, destFolder);
                eprint("418: File copied to " + folderName + " folder: " + res);
                cprint("File copied to " + folderName + " folder: " + res);
            } else {
                eprint("421: path: " + path);
                eprint("422: dest: " + destFolder);
                res = filesystem.move(path, destFolder);
                eprint("424: File moved to " + folderName + " folder: " + res);
                cprint("File moved to " + folderName + " folder: " + res);
            }
        }
        if (res) {
            if (tingReady) {
                playSound(tingBuffer);
            }
        } else {
            if (mistakeReady) {
                playSound(mistakeBuffer);
            }
        }
    }

    if (userFolder1Types.indexOf(xtn(path)) !== -1) {                                   // User Defined Folder 1
        handleFile(path, "userFolder1", "User Defined Folder 1 (" + fileName(getPreference("userFolder1")) + ")", fname, copyItem);
    } else if (userFolder2Types.indexOf(xtn(path)) !== -1) {                            // User Defined Folder 2
        handleFile(path, "userFolder2", "User Defined Folder 2 (" + fileName(getPreference("userFolder2")) + ")", fname, copyItem);
    } else if (userFolder3Types.indexOf(xtn(path)) !== -1) {                            // User Defined Folder 3
        handleFile(path, "userFolder3", "User Defined Folder 3 (" + fileName(getPreference("userFolder3")) + ")", fname, copyItem);
    } else if (documentTypes.indexOf(xtn(path)) !== -1) {                   // documents
        handleFile(path, "documentFolder", "documents", fname, copyItem);
    } else if (movieTypes.indexOf(xtn(path)) !== -1) {                      // movies
        handleFile(path, "movieFolder", "movies", fname, copyItem);
    } else if (musicTypes.indexOf(xtn(path)) !== -1) {                      // music
        handleFile(path, "musicFolder", "music", fname, copyItem);
    } else if (pictureTypes.indexOf(xtn(path)) !== -1) {                    // pictures
        handleFile(path, "pictureFolder", "pictures", fname, copyItem);
    } else if (compressedTypes.indexOf(xtn(path)) !== -1) {                 // compressed files
        handleFile(path, "compressedFolder", "compressed files", fname, copyItem);
    } else if (widgetTypes.indexOf(xtn(path)) !== -1) {                     // flat-format and zipped widgets
        handleFile(path, "widgetFolder", "widgets", fname, copyItem);
    } else if (otherTypes.indexOf(xtn(path)) !== -1) {                      // other - temporary files
        handleFile(path, "otherFolder", "temporary", fname, copyItem);
    } else if (isWebloc(path)) {                                            // weblocs and URLs
        if (isMacintosh) {
            destination = getPreference("urlsFolder");
            if (!filesystem.itemExists(destination)) {
                filesystem.createDirectory(destination);
            }
            if (copyItem) {
                result = filesystem.copy(path, destination);
                eprint("467: Webloc copied to weblocs folder: " + result);
                cprint("Webloc copied to weblocs folder: " + result);
            } else {
                result = filesystem.move(path, destination);
                eprint("471: Webloc moved to weblocs folder: " + result);
                cprint("Webloc moved to weblocs folder: " + result);
            }
        } else {
            destination = getPreference("urlsFolder");
            if (!filesystem.itemExists(destination)) {
                filesystem.createDirectory(destination);
            }
            if (copyItem) {
                result = filesystem.copy(path, destination);
                eprint("481: URL copied to URLs folder: " + result);
                cprint("URL copied to URLs folder: " + result);
            } else {
                result = filesystem.move(path, destination);
                eprint("485: URL moved to URLs folder: " + result);
                cprint("URL moved to URLs folder: " + result);
            }
        }
        if (result) {
            if (tingReady) {
                playSound(tingBuffer);
            }
        } else {
            if (mistakeReady) {
                playSound(mistakeBuffer);
            }
        }
    } else if (isAlias(path)) {                                             // aliases and shortcuts
        if (isMacintosh) {
            destination = getPreference("shortcutsFolder");
            if (!filesystem.itemExists(destination)) {
                filesystem.createDirectory(destination);
            }
            if (copyItem) {
                result = filesystem.copy(path, destination);
                eprint("506: Alias copied to aliases folder: " + result);
                cprint("Alias copied to aliases folder: " + result);
            } else {
                result = filesystem.move(path, destination);
                eprint("510 Alias moved to aliases folder: " + result);
                cprint("Alias moved to aliases folder: " + result);
            }
        } else {
            destination = getPreference("shortcutsFolder");
            if (!filesystem.itemExists(destination)) {
                filesystem.createDirectory(destination);
            }
            if (copyItem) {
                result = filesystem.copy(path, destination);
                eprint("520: Shortcut copied to shortcuts folder: " + result);
                cprint("Shortcut copied to shortcuts folder: " + result);
            } else {
                result = filesystem.move(path, destination);
                eprint("524: Shortcut moved to shortcuts folder: " + result);
                cprint("Shortcut moved to shortcuts folder: " + result);
            }
        }
        if (result) {
            if (tingReady) {
                playSound(tingBuffer);
            }
        } else {
            if (mistakeReady) {
                playSound(mistakeBuffer);
            }
        }
    } else {                                                        // anything other file
        if (mistakeReady) {
            playSound(mistakeBuffer);
        }
        eprint("541: Sorry - no defined destination for file " + path + ".");
        //alert("Sorry - no defined destination for file " + path + ".");
    }
}

function handleDroppedFolder(path, copyItem) {
    let fname = fileName(path);
    let destination;
    let destFolder;
    let answer;
    let result;

    eprint("\n---- ---- ------ ---- ----");
    eprint("558: folder: " + path + " has been dropped.");

    if (widgetTypes.indexOf(xtn(path)) !== -1) {                    // bundled widgets
        destFolder = getPreference("widgetFolder");
        destination = destFolder + "/" + fname;
        if (filesystem.itemExists(destination)) {
            if (mistakeReady) {
                playSound(mistakeBuffer);
            }
            answer = confirm("A widget \"" + fname + "\" is already present in the widgets folder. Do you wish to proceed?");
            if (!answer) {
                return;
            }
        }
        result = safeMove(path, destFolder, fname, copyItem);
        if (result) {
            if (tingReady) {
                playSound(tingBuffer);
            }
        } else {
            if (mistakeReady) {
                playSound(mistakeBuffer);
            }
            alert("Sorry - it was not possible to copy/move a bundled widget.");
        }
    } else if (packageTypes.indexOf(xtn(path)) !== -1) {            // macOS rtfd package
        destFolder = getPreference("documentFolder");              // treat as a document
        destination = destFolder + "/" + fname;
        if (filesystem.itemExists(destination)) {
            if (mistakeReady) {
                playSound(mistakeBuffer);
            }
            answer = confirm("A package \"" + fname + "\" is already present in the documents folder. Do you wish to proceed?");
            if (!answer) {
                return;
            }
        }
        result = safeMove(path, destFolder, fname, copyItem);
        if (result) {
            if (tingReady) {
                playSound(tingBuffer);
            }
        } else {
            if (mistakeReady) {
                playSound(mistakeBuffer);
            }
            alert("Sorry - it was not possible to copy/move a package.");
        }
    } else {                                                        // anything other folder
        if (mistakeReady) {
            playSound(mistakeBuffer);
        }
        eprint("610: Sorry - no defined destination for folder " + path + ".");
        //alert("Sorry - no defined destination for folder " + path + ".");
    }
}

////////////////////////////////////// window loading ////////////////////////////////////

window.onload = function () {

    ///////////////////////////////// drop file code /////////////////////////////////////

    let handleDrop = function (evt) {
        let files = evt.dataTransfer.files;
        let file;
        let i;
        let s = "";
        let path;

        let copyItem = (
            isMacintosh
            ? evt.altKey
            : evt.ctrlKey         // **** ??
        );

        evt.preventDefault();

//      console.log("Number of files dropped: " + files.length);
        s += "Number of files dropped: " + files.length;

        for (i = 0; i < files.length; i += 1) {
            file = files[i];
//          console.log("File " + i + ": " + file.name + ", " + file.size + ", " + file.type);
            s += "<br>File " + i + ": " + file.name + ", " + file.size + ", " + file.type;

            if (isMacintosh) {
                path = getPreference("macDesktopFolder") + "/" + file.name;
            } else {
                path = getPreference("winDesktopFolder") + "/" + file.name;
            }

            if (filesystem.isDirectory(path)) {
                handleDroppedFolder(path, copyItem);
            } else {
                handleDroppedFile(path, copyItem);
            }
        }

        if (getPreference("sparkPrefs") === "enabled") {
            sparkTimer.ticking = true;
        }
        smallCog.onmousedown();

        text1.innerHTML = s;
    };

    let handleDragOver = function (evt) {
        evt.preventDefault();
        evt.dataTransfer.dropEffect = "copy";
    };


    if (File && FileReader && FileList && Blob) {
        topLevelHelp.addEventListener("dragover", handleDragOver, false);
        topLevelHelp.addEventListener("drop", handleDrop, false);

        smallCog.addEventListener("dragover", handleDragOver, false);
        smallCog.addEventListener("drop", handleDrop, false);

        clamp.addEventListener("dragover", handleDragOver, false);
        clamp.addEventListener("drop", handleDrop, false);

        pinArea.addEventListener("dragover", handleDragOver, false);
        pinArea.addEventListener("drop", handleDrop, false);

        pin.addEventListener("dragover", handleDragOver, false);
        pin.addEventListener("drop", handleDrop, false);
    } else {
        alert("File APIs are missing.");
    }

    ///////////////////////////////// initialisation /////////////////////////////////////

    glassTimer.ticking = (getPreference("glassPrefs") === "enabled");
    flashTimer.ticking = (getPreference("sparkPrefs") === "enabled");
    spinTimer.ticking = (getPreference("cogwheelPrefs") === "enabled");

    burns.style.opacity = (
        getPreference("burnPrefs") === "enabled"
        ? 1.0
        : 0.0
    );

    cracks.style.opacity = (
        getPreference("crackPrefs") === "enabled"
        ? 1.0
        : 0.0
    );

    text1.innerHTML = "isMacintosh: " + isMacintosh + ", " + "wpFolder: " + wpFolder;
    text1.innerHTML += "<br>Doc folder: " + getPreference("documentFolder");

//  console.log("isMacintosh: " + isMacintosh + ", " + "wpFolder: " + wpFolder);
//  console.log("Doc folder: " + getPreference("documentFolder"));

//  console.log(cPath("C:/Users/g6auc/OneDrive/Desktop"));
};
