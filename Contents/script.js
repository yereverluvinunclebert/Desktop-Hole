//===========================================================================
// script.js
// Desktop Hole Widget 1.0
// Written and Steampunked by Dean Beedell
// Overall functionality, Mac compatibility, advice and patience from Harry Whitfield
// Dean.beedell@lightquick.co.uk
//===========================================================================
// || <- don't delete these please, I don't have a key on my keyboard that can generate the or characters

// todos:

// the prefs especially the file extensions - do they fit on screen on windows 10?
// sparking cables - thinking about this
// fix the cog wobble - is this still a problem? Does it matter?

/*jslint for, multivar */

/*property
	altKey, burnPrefs, cogwheelPrefs, compressedExtns, compressedFolder,
	concat, copy, crackPrefs, createDirectory, ctrlKey, data, desktopIniPref,
	documentExtns, documentFolder, event, forEach, hOffset, hidden, hoffset,
	hoffsetpref, indexOf, interval, isDirectory, itemExists, kEaseOut,
	lastIndexOf, length, locked, match, maxLength, maxWidthPref, minLength,
	mouseWheelPref, move, movieExtns, movieFolder, musicExtns, musicFolder,
	onDragDrop, onDragEnter, onDragExit, onMouseDown, onMouseWheel,
	onTimerFired, onclick, opacity, otherExtns, otherFolder, pictureExtns,
	pictureFolder, pinhOffsetPref, pinvOffsetPref, push, remove, replace,
	rotation, round, scrollDelta, soundpref, sparkPrefs, split, src, start,
	substring, temporaryFolder, ticking, ticks, toLowerCase, tooltip,
	userDesktopFolder, userDocumentsFolder, userFolder1Extns, userFolder2Extns,
	userFolder3Extns, userMoviesFolder, userMusicFolder, userPicturesFolder,
	userWidgetsFolder, vOffset, value, visible, voffset, voffsetpref,
	widgetDataFolder, widgetExtns, widgetFolder, widgetLockPref
*/

"use strict";

var smallCog, shadow, deepholebright, mainScreen, setmenu, mainWindow, pin, burns, cracks,
		pinArea, Scale, clamp, isMacintosh, dprint, hprint, lprint, resize, buildVitality,
		deephole;

var debugFlg = "1";

var lock = "Resources/lock.mp3";
var sparks = "Resources/sparks.mp3";
var ting = "Resources/ting.mp3";
var burp = "Resources/mistake.mp3";
var pageFumble = "Resources/pagefumble.mp3";

var widgetName = widget.name;

var documentTypes;
var movieTypes;
var musicTypes;
var pictureTypes;
var compressedTypes;
var widgetTypes;
var otherTypes;

var packageTypes;	// experimental

var userFolder1Types;
var userFolder2Types;
var userFolder3Types;

//=================================
// checks the format of the extension pref values
//=================================
function extCheck(s, fldr) {
//	var lookFor = /^(\.\w{2,11})(,\s*(\.\w{2,11}))*$/;
	var lookFor = /^(\w{2,11})(,\s*(\w{2,11}))*$/;
	var found;
	var extn;
	var extns = [];

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
	play(burp, false);
	hprint("Syntax error in " + fldr + " Extensions Preference. The input \"" + s + "\" has been ignored.");
	alert("Syntax error in " + fldr + " Extensions Preference. The input has been ignored.");
	return "";
}
//=====================
//End function
//=====================

//=================================
// append user defined extensions
//=================================
function setExtensions() {
	dprint("%-I-INFO, setExtensions");
	// We won't need the UC versions - handled in function xtn().
	documentTypes = [".doc", ".docx", ".odt", ".rtf", ".pdf", ".txt", ".htm", ".html", ".ppt", ".pptx", ".xml"];
	movieTypes = [".avi", ".asf", ".mov", ".mpeg", ".mp4", ".mpg", ".flv", ".swf", ".vob", ".wmv"];
	musicTypes = [".m4a", ".mpg", ".mp3", ".aac", ".wav", ".wma", ".aif", ".aiff", ".au", ".snd", ".ogg", ".aac"];
	pictureTypes = [".gif", ".jpg", ".jpeg", ".png", ".bmp", ".tif", ".tiff"];
	compressedTypes = [".zip", ".rar", ".arj", ".gz", ".tgz", ".hqx", ".sit", ".sitx", ".zipx"];
	widgetTypes = [".widget", ".wdgt"];
	otherTypes = [];

	packageTypes = [".rtfd"];	// experimental to treat as a document.

	documentTypes = documentTypes.concat(extCheck(preferences.documentExtns.value, "Document"));
	compressedTypes = compressedTypes.concat(extCheck(preferences.compressedExtns.value, "Compressed File"));
	movieTypes = movieTypes.concat(extCheck(preferences.movieExtns.value, "Movie"));
	musicTypes = musicTypes.concat(extCheck(preferences.musicExtns.value, "Music"));
	pictureTypes = pictureTypes.concat(extCheck(preferences.pictureExtns.value, "Picture"));
	otherTypes = otherTypes.concat(extCheck(preferences.otherExtns.value, "Temporary File"));
	widgetTypes = widgetTypes.concat(extCheck(preferences.widgetExtns.value, "Widget"));

	userFolder1Types = extCheck(preferences.userFolder1Extns.value, "User Defined Folder 1");
	userFolder2Types = extCheck(preferences.userFolder2Extns.value, "User Defined Folder 2");
	userFolder3Types = extCheck(preferences.userFolder3Extns.value, "User Defined Folder 3");
}
//=====================
//End function
//=====================

//=================================
// setup user || default destinations
//=================================
function setFolders() {
	var userProfile;
	dprint("%-I-INFO, setFolders");

	if (preferences.documentFolder.value === "") {
		preferences.documentFolder.value = system.userDocumentsFolder;
	}

	if (preferences.compressedFolder.value === "") {
		if (isMacintosh) {
			preferences.compressedFolder.value = resolvePath("~/Downloads");
		} else {
			userProfile = runCommand("echo %UserProfile%").replace(/\\/g, "/");
			preferences.compressedFolder.value = userProfile + "/Downloads";
		}
		hprint("setFolders: compressedFolder at " + preferences.compressedFolder.value);
	}

	if (preferences.movieFolder.value === "") {
		preferences.movieFolder.value = system.userMoviesFolder;
	}

	if (preferences.musicFolder.value === "") {
		preferences.musicFolder.value = system.userMusicFolder;
	}

	if (preferences.pictureFolder.value === "") {
		preferences.pictureFolder.value = system.userPicturesFolder;
	}

	if (preferences.otherFolder.value === "") {
		preferences.otherFolder.value = system.temporaryFolder;
	}

	if (preferences.widgetFolder.value === "") {
		preferences.widgetFolder.value = system.userWidgetsFolder;
	}

	if (preferences.shortcutsFolder.value === "") {
		preferences.shortcutsFolder.value = system.userDesktopFolder + "/Shortcuts";
	}
}
//=====================
//End function
//=====================

/*
//=================================
// make desktop.ini files
//=================================
function makeIniFiles() {
	var iniFileData = "[ViewState]\r\nMode=\r\nVid=\r\nFolderType=Generic\r\n";

	function makeIniFile(folder) {
		var iniFile = preferences[folder].value + "/desktop.ini";

		if (!filesystem.itemExists(iniFile)) {
			filesystem.writeFile(iniFile, iniFileData);
		}
	}

	if (isMacintosh) {
		preferences.desktopIniPref.hidden = true;
		return;
	}

	if (preferences.desktopIniPref.value === "0") {
		return;
	}

	makeIniFile("documentFolder");
	makeIniFile("compressedFolder");
	makeIniFile("movieFolder");
	makeIniFile("musicFolder");
	makeIniFile("pictureFolder");
	makeIniFile("otherFolder");
	makeIniFile("widgetFolder");
}
//=====================
//End function
//=====================
*/

//=================================
// spinTimer timer setup
//=================================
var spinTimer = new Timer();

 spinTimer.interval = 1;
 if (preferences.cogwheelPrefs.value === "enabled") {
	spinTimer.ticking = true;

} else {
	spinTimer.ticking = false;
	//spinTimer.interval = 999;
}

spinTimer.onTimerFired = function () {
	smallCog.rotation = smallCog.rotation + 10;
	shadow.rotation = shadow.rotation + 10;
};
//=====================
//End function
//=====================

//=================================
// sparkIt function
//=================================
function sparkIt() {
	dprint("%-I-INFO, sparkIt");
	if (preferences.sparkPrefs.value === "enabled") {
		deepholebright.opacity = 255;
		sleep(50);
		deepholebright.opacity = 0;
		sleep(550);
		deepholebright.opacity = 255;
		sleep(50);
		deepholebright.opacity = 0;
		if (preferences.soundpref.value === "enabled") {
			play(sparks, false);
		}
		sleep(50);
		deepholebright.opacity = 255;
		sleep(50);
		deepholebright.opacity = 0;
	}

}
//=====================
//End function
//=====================

//==============================
//
//==============================
smallCog.onMouseDown = function () {
	var a, b;

	if (preferences.cogwheelPrefs.value === "enabled") {
		preferences.cogwheelPrefs.value = "disabled";
		spinTimer.ticking = false;
		if (preferences.animatePrefs.value === "enabled") {
        		a = new RotateAnimation(smallCog, 300, 990, animator.kEaseOut);
        		b = new RotateAnimation(shadow, 300, 990, animator.kEaseOut);
		        animator.start([a, b]);
                }
	} else {
		preferences.cogwheelPrefs.value = "enabled";
		spinTimer.ticking = true;
		if (preferences.animatePrefs.value === "enabled") {
		        a = new RotateAnimation(smallCog, -300, 990, animator.kEaseOut);
		        b = new RotateAnimation(shadow, -300, 990, animator.kEaseOut);
		        animator.start([a, b]);
                }
	}
};
//==============================
//
//==============================

//=================================
// flashTimer timer setup
//=================================
var flashTimer = new Timer();
flashTimer.ticking = true;
flashTimer.interval = 30;

flashTimer.onTimerFired = function () {
	var numberThrown = random(1, 50);
    log("numberThrown " + numberThrown);
    
	if (numberThrown >= 49) {
		sparkIt();
	} else {
		smallCog.onMouseDown();
	}
};
//=====================
//End function
//=====================

//===================================
// set the widget lock status if pinned
//===================================
function checkLocked() {
	dprint("%-I-INFO, checkLocked");
	if (preferences.widgetLockPref.value == 1) {
		mainWindow.locked = true;
                pin.opacity = 255;
		lprint("Setting the locking pin ", pin.vOffset);
		pin.hOffset = preferences.pinhOffsetPref.value;
		pin.vOffset = preferences.pinvOffsetPref.value;
		if (preferences.soundpref.value === "enabled") {
			play(lock, false);
		}
	} else {
		mainWindow.locked = false;
                pin.opacity = 0;
        }
	dprint("%-I-INFO, mainWindow.locked "+mainWindow.locked);
}
//=====================
//End function
//=====================

//===================================
// set the widget lock status if pinned
//===================================
function checkCracks() {
	dprint("%-I-INFO, checkcracks");
	if (preferences.crackPrefs.value === "enabled") {
		cracks.opacity = 255;
		lprint("Checking the cracks ");
	} else {
		cracks.opacity = 0;
	}
}
//=====================
//End function
//=====================

//===================================
// set the widget lock status if pinned
//===================================
function setInitialToolTips() {
	dprint("%-I-INFO, setInitialToolTips");
	pinArea.tooltip = "Click here to lock the widget in place.";
	smallCog.tooltip = "Wheel spins to indicate status.";
        deephole.tooltip = "Drag/drop a file here from your desktop to sort it.";
//	pin.tooltip = "Click here to unlock the widget's position.";
}

//===================================
// set the widget lock status if pinned
//===================================
function checkBurn() {
	dprint("%-I-INFO, checkBurn");
	if (preferences.burnPrefs.value === "enabled") {
		burns.opacity = 255;
		lprint("Checking the burn image");
	} else {
		burns.opacity = 0;
	}
}
//=====================
//End function
//=====================

//===========================================
// this function runs on startup
//===========================================
function startup() {
	lprint("%-I-INFO, startup");
	//showEmAll();
    debugFlg = preferences.debugflgPref.value;
    if (debugFlg === "1") {
		preferences.imageEditPref.hidden=false;
	} else {
		preferences.imageEditPref.hidden=true;		
	}
	resize();					// resize if required
	mainScreen();					// check the widget is on-screen
	setFolders();
//	makeIniFiles();					// now done on the fly - in functions.js
	preferences.desktopIniPref.hidden = isMacintosh;
	setmenu();						// build the menu
	setInitialToolTips();
	checkLocked();					// set the widget lock status if pinned
	checkBurn();
	checkCracks();
	//sparkIt();
	setExtensions();
	buildVitality("Resources/hole-dock.png"); // build the dock vitality
}
//=====================
//End function
//=====================

//==============================
//
//==============================
pinArea.onclick = function () {
	if (!mainWindow.locked) {
		mainWindow.locked = true;

		preferences.hoffsetpref.value = mainWindow.hoffset;
		preferences.voffsetpref.value = mainWindow.voffset;

		preferences.widgetLockPref.value = "1";
		pin.hOffset = system.event.hOffset - 5;
		pin.vOffset = system.event.vOffset - 5;
		// store the pin position in the original unscaled amount
		preferences.pinhOffsetPref.value = pin.hOffset / Scale;
		preferences.pinvOffsetPref.value = pin.vOffset / Scale;
		pin.opacity = 255;
		pinArea.tooltip = "Click the pin now";
		pin.tooltip = "Click here to unlock the widget's position.";
          	if (preferences.soundpref.value === "enabled") {
          		play(lock, false);
          	}
	}
	smallCog.onMouseDown();
};
//==============================
//
//==============================


//==============================
// pins the widget in place
//==============================
pin.onMouseDown = function () {
	if (mainWindow.locked) {
		mainWindow.locked = false;
		pin.opacity = 0;
		preferences.widgetLockPref.value = "0";
		preferences.hoffsetpref.value = 0;
		preferences.voffsetpref.value = 0;
		pinArea.tooltip = "Click here to lock the widget in place.";
		pin.tooltip = "";
	}
	if (preferences.soundpref.value === "enabled") {
		play(lock, false);
	}
	smallCog.onMouseDown();

};
//==============================
//
//==============================

//==============================
//
//==============================
clamp.onMouseDown = function () {
	sparkIt();
};
//==============================
//
//==============================

//==============================
// gets the extension of a file
//==============================
function xtn(s) {
	var ext, idx = s.lastIndexOf(".");

	if (idx >= 0) {
		ext = s.substring(idx);
		if (ext.length > 1) {
			return ext.toLowerCase();
		}
	}
	return undefined;
}
//=====================
//End function
//=====================

//==================================
// gets the name of a file or folder
//==================================
function fileName(path) {
	var idx = path.lastIndexOf("/");

	return path.substring(idx + 1);
}
//=====================
//End function
//=====================

//==============================
// test for alias/shortcut on Mac and Win.
//==============================
function isAlias(path) {
	var fileData;

	function esc(path) {
		return path.replace(/([\W])/g, "\\$1");
	}

	function getFileInfo(path) {
		return runCommand("file " + esc(path));
	}
	function getFileData(path) {
		return getFileInfo(path).substring(path.length + 2);
	}

	if (isMacintosh) {
		fileData = getFileData(path);
		hprint("fileData: " + fileData);	// MacOS Alias file
		return fileData === "MacOS Alias file";
	}
	return xtn(path).toLowerCase() === ".lnk";
}
//=====================
//End function
//=====================

//==============================
// test for webloc/url on Mac and Win.
//==============================
function isWebloc(path) {
	var extn = xtn(path).toLowerCase();

	if (isMacintosh) {
		return extn === ".webloc";
	}
	return extn === ".url";
}
//=====================
//End function
//=====================

//==================================
// safely move/copy packages/folders
//==================================
function safeMove(path, destFolder, fname, copyItem) {
	var destination = destFolder + "/" + fname;
	var safeFolder = system.widgetDataFolder;
	var result;
	var res;
	var isFolder = filesystem.isDirectory(destination);

	hprint("safeMove isFolder: " + isFolder);

	if (isFolder) {
		result = filesystem.copy(destination, safeFolder);
		hprint("Old folder copied to safe folder: " + result);
		if (result) {
			result = filesystem.remove(destination);
			hprint("Old folder deleted from destination folder: " + result);
		}
		if (!result) {
			play(burp, false);
			alert("Sorry - it was not possible to safely copy/move a folder.");
			return false;
		}
	}

	if (copyItem) {
		result = filesystem.copy(path, destFolder);
		hprint("Folder/file copied to destination folder: " + result);
	} else {
		result = filesystem.move(path, destFolder);
		hprint("Folder/file moved to destination folder: " + result);
	}

	if (isFolder) {
		if (result) {
			res = filesystem.remove(safeFolder + "/" + fname);
			hprint("Old folder deleted from safe folder: " + res);
		} else {
			res = filesystem.copy(safeFolder + "/" + fname, destFolder);
			hprint("Old folder restored from safe folder: " + res);
		}
	}
	return result;
}
//=====================
//End function
//=====================

//==============================
// handles file dropped on the deephole
//==============================
function handleDroppedFile(path, copyItem) {
    dprint("%-I-INFO, handleDroppedFile");
	var fname = fileName(path);
	var destination;
	var result;

	function esc(path) {
		return path.replace(/([\W])/g, "\\$1");
	}

	hprint("\n---- ---- ------ ---- ----");
	hprint("file: " + path + " has been dropped.");

	function handleFile(path, folder, folderName, fname, copyItem) {
		var dest;
		var destFolder;
		var answer;
		var res;

		destFolder = preferences[folder].value;
		dest = destFolder + "/" + fname;
		if (filesystem.itemExists(dest)) {
			play(burp, false);
			answer = alert("A file \"" + fname + "\" is already present in the " + folderName + " folder. Do you wish to proceed?", "Replace", "Cancel");
			if (answer !== 1) {
				return;
			}
		}

		//handleFile(path, "widgetFolder", "widgets", fname, copyItem);
		if (folder === "widgetFolder") {
			res = safeMove(path, destFolder, fname, copyItem);
			hprint("File moved safely to " + folderName + " folder: " + res);
			cprint("File moved safely to " + folderName + " folder: " + res);
		} else {
			if (copyItem) {
				res = filesystem.copy(path, destFolder);
				hprint("File copied to " + folderName + " folder: " + res);
				cprint("File copied to " + folderName + " folder: " + res);
			} else {
				res = filesystem.move(path, destFolder);
				hprint("File moved to " + folderName + " folder: " + res);
				cprint("File moved to " + folderName + " folder: " + res);
			}
		}
		if (res) {
			play(ting, false);
		} else {
			play(burp, false);
		}
	}

	if (userFolder1Types.indexOf(xtn(path)) !== -1) {									// User Defined Folder 1
		handleFile(path, "userFolder1", "User Defined Folder 1", fname, copyItem);
	} else if (userFolder2Types.indexOf(xtn(path)) !== -1) {							// User Defined Folder 2
		handleFile(path, "userFolder2", "User Defined Folder 2", fname, copyItem);
	} else if (userFolder3Types.indexOf(xtn(path)) !== -1) {							// User Defined Folder 3
		handleFile(path, "userFolder3", "User Defined Folder 3", fname, copyItem);
	} else if (documentTypes.indexOf(xtn(path)) !== -1) {					// documents
		handleFile(path, "documentFolder", "documents", fname, copyItem);
	} else if (movieTypes.indexOf(xtn(path)) !== -1) {						// movies
		handleFile(path, "movieFolder", "movies", fname, copyItem);
	} else if (musicTypes.indexOf(xtn(path)) !== -1) {						// music
		handleFile(path, "musicFolder", "music", fname, copyItem);
	} else if (pictureTypes.indexOf(xtn(path)) !== -1) {					// pictures
		handleFile(path, "pictureFolder", "pictures", fname, copyItem);
	} else if (compressedTypes.indexOf(xtn(path)) !== -1) {					// compressed files
		handleFile(path, "compressedFolder", "compressed files", fname, copyItem);
	} else if (widgetTypes.indexOf(xtn(path)) !== -1) {						// flat-format and zipped widgets
		handleFile(path, "widgetFolder", "widgets", fname, copyItem);
	} else if (otherTypes.indexOf(xtn(path)) !== -1) {						// other - temporary files
		handleFile(path, "otherFolder", "temporary", fname, copyItem);
	} else if (isWebloc(path)) {											// weblocs and URLs
		if (isMacintosh) {
			destination = system.userDesktopFolder + "/Weblocs";
			if (!filesystem.itemExists(destination)) {
				filesystem.createDirectory(destination);
			}
			if (copyItem) {
				result = runCommand("cp " + esc(path) + " " + esc(destination)) === "";
				hprint("Webloc copied to weblocs folder: " + result);
				cprint("Webloc copied to weblocs folder: " + result);
			} else {
				result = runCommand("mv " + esc(path) + " " + esc(destination)) === "";
				hprint("Webloc moved to weblocs folder: " + result);
				cprint("Webloc moved to weblocs folder: " + result);
			}
		} else {
			destination = system.userDesktopFolder + "/URLs";
			if (!filesystem.itemExists(destination)) {
				filesystem.createDirectory(destination);
			}
			if (copyItem) {
				result = filesystem.copy(path, destination);
				hprint("URL copied to URLs folder: " + result);
				cprint("URL copied to URLs folder: " + result);
			} else {
				result = filesystem.move(path, destination);
				hprint("URL moved to URLs folder: " + result);
				cprint("URL moved to URLs folder: " + result);
			}
		}
		if (result) {
			play(ting, false);
		} else {
			play(burp, false);
		}
	} else if (isAlias(path)) {												// aliases and shortcuts
		if (isMacintosh) {
			destination = system.userDesktopFolder + "/Aliases";
			if (!filesystem.itemExists(destination)) {
				filesystem.createDirectory(destination);
			}
			if (copyItem) {
				result = runCommand("cp " + esc(path) + " " + esc(destination)) === "";
				hprint("Alias copied to aliases folder: " + result);
				cprint("Alias copied to aliases folder: " + result);
			} else {
				result = runCommand("mv " + esc(path) + " " + esc(destination)) === "";
				hprint("Alias moved to aliases folder: " + result);
				cprint("Alias moved to aliases folder: " + result);
			}
		} else {
			destination = system.userDesktopFolder + "/Shortcuts";
			if (!filesystem.itemExists(destination)) {
				filesystem.createDirectory(destination);
			}
			if (copyItem) {
				result = filesystem.copy(path, destination);
				hprint("Shortcut copied to shortcuts folder: " + result);
				cprint("Shortcut copied to shortcuts folder: " + result);
			} else {
				result = filesystem.move(path, destination);
				hprint("Shortcut moved to shortcuts folder: " + result);
				cprint("Shortcut moved to shortcuts folder: " + result);
			}
		}
		if (result) {
			play(ting, false);
		} else {
			play(burp, false);
		}
	} else {														// anything other file
		play(burp, false);
		hprint("Sorry - no defined destination for file " + path + ".");
		alert("Sorry - no defined destination for file " + path + ".");
	}


}
//=====================
//End function
//=====================

//==============================
// handles folder dropped on the deephole
//==============================
function handleDroppedFolder(path, copyItem) {
    dprint("%-I-INFO, handleDroppedFolder");
	var fname = fileName(path);
	var destination;
	var destFolder;
	var answer;
	var result;

	hprint("\n---- ---- ------ ---- ----");
	hprint("folder: " + path + " has been dropped.");

	if (widgetTypes.indexOf(xtn(path)) !== -1) {					// bundled widgets
		destFolder = preferences.widgetFolder.value;
		destination = destFolder + "/" + fname;
		if (filesystem.itemExists(destination)) {
			play(burp, false);
			answer = alert("A widget \"" + fname + "\" is already present in the widgets folder. Do you wish to proceed?", "Replace", "Cancel");
			if (answer !== 1) {
				return;
			}
		}
		result = safeMove(path, destFolder, fname, copyItem);
		if (result) {
			play(ting, false);
		} else {
			play(burp, false);
			alert("Sorry - it was not possible to copy/move a bundled widget.");
		}
	} else if (packageTypes.indexOf(xtn(path)) !== -1) {			// macOS rtfd package
		destFolder = preferences.documentFolder.value;				// treat as a document
		destination = destFolder + "/" + fname;
		if (filesystem.itemExists(destination)) {
			play(burp, false);
			answer = alert("A package \"" + fname + "\" is already present in the documents folder. Do you wish to proceed?", "Replace", "Cancel");
			if (answer !== 1) {
				return;
			}
		}
		result = safeMove(path, destFolder, fname, copyItem);
		if (result) {
			play(ting, false);
		} else {
			play(burp, false);
			alert("Sorry - it was not possible to copy/move a package.");
		}
	} else {														// anything other folder
		play(burp, false);
		hprint("Sorry - no defined destination for folder " + path + ".");
		alert("Sorry - no defined destination for folder " + path + ".");
	}
}
//=====================
//End function
//=====================

//==============================
// handles files/folders dropped on the deephole
//==============================
deephole.onDragDrop = function (event) {
	var n = event.data.length, i, path, dropData = [], dropType, copyItem;

	copyItem = (isMacintosh)
		? event.altKey
		: event.ctrlKey;

	for (i = 0; i < n; i += 1) {
		dropData[i] = event.data[i];
	}

	dropType = dropData[0];

	if (dropType === "filenames") {
		for (i = 1; i < n; i += 1) {
			path = dropData[i];
			if (filesystem.isDirectory(path)) {
				handleDroppedFolder(path, copyItem);
			} else {
				handleDroppedFile(path, copyItem);
			}
		}
		sparkIt();				// spark it
		smallCog.onMouseDown(); // spin the wheel
	} else {
		play(burp, false);
		hprint("Invalid dropType: " + dropType);
		alert("Invalid dropType: " + dropType);
	}

	glassTimer.ticking = true;
};



//=================================
// glassTimer timer setup
//=================================
var glassTimer = new Timer();
glassTimer.interval = 5.5;
glassTimer.ticking = false;

glassTimer.onTimerFired = function () {
        glassTimer.ticking = false;
        closeGlass();
        };
//=====================
//End function
//=====================


//=====================
//
//=====================
deepglass.onMouseDown = function() {
        closeGlass();
}
//=====================
//End function
//=====================

//=====================
//
//=====================
function closeGlass() {
	deepglass.visible = false;
	text1.visible = false;
	text2.visible = false;
	sleep(50);
	deepglass.visible = true;
	text1.visible = true;
	text2.visible = true;
	sleep(50);
	deepglass.visible = false;
	text1.visible = false;
	text2.visible = false;
	sleep(50);
	deepglass.visible = true;
	text1.visible = true;
	text2.visible = true;
	sleep(50);
	deepglass.visible = false;
	text1.visible = false;
	text2.visible = false;
        };
//=====================
//End function
//=====================

//=====================
//
//=====================
function openGlass() {
	deepglass.visible = true;
	text1.visible = true;
	text2.visible = true;
	sleep(50);
	deepglass.visible = false;
	text1.visible = false;
	text2.visible = false;
	sleep(50);
	deepglass.visible = true;
	text1.visible = true;
	text2.visible = true;
	sleep(50);
	deepglass.visible = false;
	text1.visible = false;
	text2.visible = false;
	sleep(50);
	deepglass.visible = true;
	text1.visible = true;
	text2.visible = true;
        };
//=====================
//End function
//=====================

//=================================
//
//=================================
deephole.onDragEnter = function () {
  text1.data = text2.data = "awaiting drag/drop of your file for automatic sorting";
  if (preferences.glassPrefs.value === "enabled") {
       openGlass();
  }
};
//=====================
//End function
//=====================

//=================================
//
//=================================
deephole.onMouseEnter = function () {

};
//=====================
//End function
//=====================

//=================================
//
//=================================
deephole.onDragExit = function () {
  if (preferences.glassPrefs.value === "enabled") {
       openGlass();
  }
};
//=====================
//End function
//=====================

//===================================
// function to resize using mousewheel + CTRL key as per Firefox
//===================================
function capMouseWheel(event) {
	var size = Number(preferences.maxWidthPref.value),
		maxLength = Number(preferences.maxWidthPref.maxLength),
		minLength = Number(preferences.maxWidthPref.minLength),
		ticks = Number(preferences.maxWidthPref.ticks),
		step = Math.round((maxLength - minLength) / (ticks - 1));


	if (event.scrollDelta > 0) {
		if (preferences.mouseWheelPref.value === "up") {
			size -= step;
			if (size < minLength) {
				size = minLength;
			}
		} else {
			size += step;
			if (size > maxLength) {
				size = maxLength;
			}
		}
	} else if (event.scrollDelta < 0) {
		if (preferences.mouseWheelPref.value === "up") {
			size += step;
			if (size > maxLength) {
				size = maxLength;
			}
		} else {
			size -= step;
			if (size < minLength) {
				size = minLength;
			}
		}
	}
	preferences.maxWidthPref.value = String(size);
	//screenwrite("using mousewheel");
	resize();
}
//=====================
//End function
//=====================

//===================================
// function to capture a mousewheel event
//===================================
deephole.onMouseWheel = function (event) {
	if (event.ctrlKey) {
		capMouseWheel(event);	 //this event is not captured in the Xwidget version
	}
};
//=====================
//End function
//=====================


//===================================
// function to
//===================================
bottomHelp.onMouseDown = function () {
       bottomHelp.visible = false;
       topLevelHelp.visible = false;
       if (preferences.soundpref.value === "enabled") {
          play(pageFumble, false);
       }
};
//=====================
//End function
//=====================

