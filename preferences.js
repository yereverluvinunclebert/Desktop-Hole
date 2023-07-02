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
    Copyright © 2022 Dean Beedell and Harry Whitfield
    mailto:g6auc@arrl.net
*/

/*jslint browser, devel */

/*property
    burnPrefs, cogwheelPrefs, compressedExtns, compressedFolder, concat,
    crackPrefs, documentExtns, documentFolder, forEach, getItem, glassPrefs,
    keys, logFilePref, macDesktopFolder, match, movieExtns, movieFolder,
    musicExtns, musicFolder, otherExtns, otherFolder, pictureExtns,
    pictureFolder, push, removeItem, replace, safeFolder, setItem,
    shortcutsFolder, soundPref, sparkPrefs, split, toLowerCase, urlsFolder,
    userFolder1, userFolder1Extns, userFolder2, userFolder2Extns, userFolder3,
    userFolder3Extns, widgetExtns, widgetFolder, winDesktopFolder
*/

import {playSound} from "./sounds.js";
import {mistakeBuffer} from "./sounds.js";
import {mistakeReady} from "./sounds.js";
import {wpFolder} from "./fsNW.js";         // filesystem, isMacintosh

/////////////////////////////////////// Preferences //////////////////////////////////////

const widgetName = "DesktopHole";	// unique name of web widget

let preferences = {};				// "local" preferences cache

preferences.burnPrefs = "enabled";	// general prefs
preferences.crackPrefs = "enabled";
preferences.glassPrefs = "disabled";
preferences.sparkPrefs = "enabled";
preferences.cogwheelPrefs = "enabled";

preferences.soundPref = "enabled";	// sounds pref

preferences.documentFolder = wpFolder + "/Documents";	// standard folders
preferences.compressedFolder = wpFolder + "/Downloads";
preferences.movieFolder = wpFolder + "/Movies";
preferences.musicFolder = wpFolder + "/Music";
preferences.pictureFolder = wpFolder + "/Pictures";
preferences.otherFolder = wpFolder + "/Temporary";
preferences.widgetFolder = wpFolder + "/Documents/Widgets";
preferences.shortcutsFolder = wpFolder + "Desktop/Aliases";
preferences.urlsFolder = wpFolder + "Desktop/Weblocs";

preferences.documentExtns = "";		// file extensions set by function setExtensions()
preferences.compressedExtns = "";
preferences.movieExtns = "";
preferences.musicExtns = "";
preferences.pictureExtns = "";
preferences.otherExtns = "";
preferences.widgetExtns = "";

preferences.userFolder1 = wpFolder + "/Documents Local/PDFs";	// user folders
preferences.userFolder2 = wpFolder + "/Documents Local/Archives";
preferences.userFolder3 = wpFolder + "/Documents Local/JS Code";

preferences.userFolder1Extns = "pdf,ps";	// user folder extensions
preferences.userFolder2Extns = "webarchive";
preferences.userFolder3Extns = "js";

preferences.macDesktopFolder = wpFolder + "/Desktop";
preferences.winDesktopFolder = wpFolder + "/OneDrive/Desktop";
preferences.safeFolder = wpFolder + "/widgetDataFolder";

preferences.logFilePref = wpFolder + "/Logs/desktop-hole-log.txt";

/////////////////////////////////////// Access Code //////////////////////////////////////

function getPreference(key) {           // getPreference("keyCodesPref");
    let value;

    if (Storage !== undefined) {
        value = localStorage.getItem(widgetName + ":" + key);
        if (value !== null) {
            preferences[key] = value;
        }
    }
    return preferences[key];
}

function setPreference(key, value) {    // setPreference("keyCodesPref", keyCodesPref);
    preferences[key] = value;
    if (Storage !== undefined) {
        localStorage.setItem(widgetName + ":" + key, value);
    }
}

function removePreference(key) {
    if (Storage !== undefined) {
        localStorage.removeItem(widgetName + ":" + key);
    }
}

(function getPreferences() {            // initial load of stored preferences
    let keys = Object.keys(preferences);

    keys.forEach(function (key) {
        let value;

        if (Storage !== undefined) {
            value = localStorage.getItem(widgetName + ":" + key);
            if (value !== null) {
                preferences[key] = value;
            }
        }
    });
}());

/////////////////////////////////////// Access Code //////////////////////////////////////

function extCheck(s, fldr) {
    let lookFor = /^(\w{1,11})(,\s*(\w{1,11}))*$/;
    let found;
    let extn;
    let extns = [];

    function trim(s) {
        return s.replace(/^\s+|\s+$/g, "");
    }

    s = trim(s);

    if (s === "") {
        return "";
    }

    found = s.toLowerCase().match(lookFor);

    if (found !== null) {
        extn = found[0].replace(/\s/g, "").split(",");
        extn.forEach(function (ele) {
            extns.push("." + ele);
        });
        return extns;
    }

    if (mistakeReady) {
        playSound(mistakeBuffer);
    }

//	console.log("Syntax error in " + fldr + " Extensions Preference. The input \"" + s + "\" has been ignored.");
    alert("Syntax error in " + fldr + " Extensions Preference. The input has been ignored.");
    return "";
}

let documentTypes;
let compressedTypes;
let movieTypes;
let musicTypes;
let pictureTypes;
let otherTypes;
let widgetTypes;

let packageTypes;

let userFolder1Types;
let userFolder2Types;
let userFolder3Types;

function setExtensions() {
    // We won't need the UC versions - handled in function xtn().
    documentTypes = [".doc", ".docx", ".odt", ".rtf", ".txt", ".htm", ".html", ".ppt", ".pptx", ".xml"];
    compressedTypes = [".zip", ".rar", ".arj", ".gz", ".tgz", ".hqx", ".sit", ".sitx", ".zipx"];
    movieTypes = [".avi", ".asf", ".mov", ".mpeg", ".mp4", ".mpg", ".flv", ".swf", ".vob", ".wmv"];
    musicTypes = [".m4a", ".mpg", ".mp3", ".aac", ".wav", ".wma", ".aif", ".aiff", ".au", ".snd", ".ogg", ".aac"];
    pictureTypes = [".gif", ".jpg", ".jpeg", ".png", ".bmp", ".tif", ".tiff"];
    widgetTypes = [".widget", ".wdgt"];
    otherTypes = [];

    packageTypes = [".rtfd"];   // experimental to treat as a document.

    documentTypes = documentTypes.concat(extCheck(getPreference("documentExtns"), "Document"));
    compressedTypes = compressedTypes.concat(extCheck(getPreference("compressedExtns"), "Compressed File"));
    movieTypes = movieTypes.concat(extCheck(getPreference("movieExtns"), "Movie"));
    musicTypes = musicTypes.concat(extCheck(getPreference("musicExtns"), "Music"));
    pictureTypes = pictureTypes.concat(extCheck(getPreference("pictureExtns"), "Picture"));
    otherTypes = otherTypes.concat(extCheck(getPreference("otherExtns"), "Temporary File"));
    widgetTypes = widgetTypes.concat(extCheck(getPreference("widgetExtns"), "Widget"));

    userFolder1Types = extCheck(getPreference("userFolder1Extns"), "User Defined Folder 1");
    userFolder2Types = extCheck(getPreference("userFolder2Extns"), "User Defined Folder 2");
    userFolder3Types = extCheck(getPreference("userFolder3Extns"), "User Defined Folder 3");
}

setExtensions();

export {getPreference, setPreference, removePreference};
export {documentTypes, compressedTypes, movieTypes, musicTypes, pictureTypes, otherTypes, widgetTypes};
export {packageTypes, userFolder1Types, userFolder2Types, userFolder3Types};
export {setExtensions};

//////////////////////////////////////// Other Code //////////////////////////////////////

// All access to preferences should use getPreference and setPreference.

// For example, the initial setting and updating of a checkbox:

/*
import {newCheckbox} from "./webWidget.js";

const cflagBox = newCheckbox(942, 286, 20, 16, getPreference("cFlagPref"), 2, "opacity:0.0");

cflagBox.onchange = function () {
    let cFlagPref = (
        cflagBox.checked
        ? "1"
        : "0"
    );
    setPreference("cFlagPref", cFlagPref);
};
*/
