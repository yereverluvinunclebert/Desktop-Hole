//===========================================================================
// functions.js
// Desktop Hole Widget 1.0
// Written and Steampunked by Dean Beedell
// Vitality code, Mac compatibility, advice and patience from Harry Whitfield
// Dean.beedell@lightquick.co.uk
//===========================================================================
// || <- don't delete these please, I don't have a key on my keyboard that can generate these characters

/*jslint for, multivar */

/*property
    altKey, appendChild, contextMenuItems, data, desktopIniPref,
    displayLicence, event, fontsize, hOffset, hRegistrationPoint, height,
    hoffsetpref, imageCmdPref, itemExists, lastIndexOf, maxWidthPref, name,
    onSelect, open, openFilePref, platform, push, replace, reveal, round,
    soundpref, style, substring, title, userFolder1, userFolder2, userFolder3,
    vOffset, vRegistrationPoint, value, visible, voffsetpref, widgetDataFolder,
    widgetFolder, width, writeFile
*/

"use strict";

var mainWindow, Scale, deephole, deepholebright, pinarea, burns, cracks, shadow,
        smallCog, clamp, pin, startup, helpWindow, lock, debugFlg,
        LICENCE, tingingSound, pinArea, rust01, rust02, burp,
        bottomHelp, topLevelHelp, text1, text2, deepglass, pageFumble;

var isMacintosh = system && (system.platform === "macintosh");


//============================================
// function to workaround current Mac engine limitations re: debugging
//============================================
function hprint(s) {    // use in body of file instead of print(s)
    if (isMacintosh) {
        filesystem.writeFile("~/Desktop/desktop-hole-log.txt", s + "\n", true); // debug printing on Sierra
    } else {
        print(s);
    }
}
//=====================
//End function
//=====================

//============================================
// function to
//============================================
function cprint(s) {
	text1.data = s;
	text2.data = s;
}
//=====================
//End function
//=====================

//============================================
// function to workaround current Mac engine limitations re: debugging
//============================================
function lprint(s) {    // use in body of file instead of log(s)
    if (isMacintosh) {
        hprint(new Date() + ": " + s);
    } else {
        log(s);
    }
}
//=====================
//End function
//=====================

//============================================
// function to conditionally print diagnostics
//============================================
function dprint(s) {
    if (debugFlg === "1") {
        hprint(s);
    }
}
//=====================
//End function
//=====================


//======================================================================================
// Function to move the mainWindow onto the main screen
//======================================================================================
function mainScreen() {
// if the widget is off screen then move into the viewable window
    dprint("%-I-INFO, mainScreen");
    if (preferences.hoffsetpref.value > 0) {
        mainWindow.hOffset = parseInt(preferences.hoffsetpref.value, 10);
    }
    if (preferences.voffsetpref.value > 0) {
        mainWindow.vOffset = parseInt(preferences.voffsetpref.value, 10);
    }

    if (mainWindow.hOffset < -310) {
        mainWindow.hOffset = -310;
    }

    if (mainWindow.vOffset < -317) {
        mainWindow.vOffset = -317; // avoid Mac toolbar
    }
    if (mainWindow.hOffset > screen.width - 100) {
        mainWindow.hOffset = screen.width - 150;
    }
    if (mainWindow.vOffset > screen.height - 150) {
        mainWindow.vOffset = screen.height - 150; // avoid Mac toolbar
    }
}
//=====================
//End function
//=====================

//======================================================================================
// Function to scale the image
//======================================================================================
function scaleImage(o, hOffset, vOffset, width, height, hRegP, vRegP) {
    Scale = Number(preferences.maxWidthPref.value) / 100;   // sets global scale because it is used elsewhere
    o.width = Math.round(Scale * width);
    o.height = Math.round(Scale * height);
    //hprint("**SCALE**" + scale);
    hRegP = hRegP || 0;                     // hRegP and vRegP are optional parameters
    vRegP = vRegP || 0;

    hOffset += hRegP;
    vOffset += vRegP;

    o.hOffset = Math.round(Scale * hOffset);
    o.vOffset = Math.round(Scale * vOffset);

    o.hRegistrationPoint = Math.round(Scale * hRegP);
    o.vRegistrationPoint = Math.round(Scale * vRegP);
}
//=====================
//End function
//=====================

//======================================================================================
// Function to scale the text
//======================================================================================
function scaleText(o, hOffset, vOffset, width, height, fontSize) {
    Scale = Number(preferences.maxWidthPref.value) / 100;   // sets global scale because it is used elsewhere
    o.width = Math.round(Scale * width);
    o.height = Math.round(Scale * height);

    o.hOffset = Math.round(Scale * hOffset);
    o.vOffset = Math.round(Scale * vOffset);

    o.style.fontsize = (fontSize * Scale + "px");
}
//=====================
//End function
//=====================

//===============================
// function to resize all layers
//===============================
function resize() {
    dprint("%-I-INFO, resize");
    Scale = Number(preferences.maxWidthPref.value) / 100;   // sets global scale because it is used elsewhere

    var mainWindowheightDefault = 520;
    var mainWindowwidthDefault = 681;

    //main_frame.hoffset = 32 * scale;
    //main_frame.voffset = 32 * scale;

    lprint("Resizing: preferences.maxWidthPref.value: " + preferences.maxWidthPref.value);
    lprint("Scale: " + Scale);

    mainWindow.height = mainWindowheightDefault * Scale;
    mainWindow.width = mainWindowwidthDefault * Scale;

    //scaleImage(o, hOffset, vOffset, width, height, hRegP, vRegP) {
    scaleImage(bottomHelp, 1, 1, 674, 519);
    scaleImage(deephole, 41, 56, 380, 374);
    scaleImage(deepglass, 41, 230, 295, 186);
    scaleImage(deepholebright, 41, 56, 383, 383);
    scaleImage(pinArea, 40, 55, 383, 383);
    scaleImage(rust01, 139, 317, 33, 121);
    scaleImage(rust02, 170, 315, 80, 113);
    scaleImage(burns, 40, 55, 383, 383);
    scaleImage(cracks, 69, 65, 341, 332);
    scaleImage(shadow, 250, 180, 55, 55, 27.5, 27.5);
    scaleImage(smallCog, 255, 172, 55, 55, 27.5, 27.5);
    scaleImage(clamp, 278, 196, 37, 30);
    scaleImage(pin, 170, 330, 20, 20);
    scaleImage(topLevelHelp, 59, 119, 269, 218);

    scaleText(text1, 105, 315, 225, 60, 10);
    scaleText(text2, 108, 318, 225, 60, 10);

}
//=====================
//End function
//=====================

//===============================================================
// this function restarts the widget when preferences are changed
//===============================================================
function changePrefs() {
    dprint("%-I-INFO, changePrefs");
    savePreferences();
    sleep(1000);
    startup();
}
//=====================
//End function
//=====================

//===========================================
// this function opens the online help file
//===========================================
function helpScreen() {
    dprint("%-I-INFO, helpScreen");
    bottomHelp.visible = true;
    topLevelHelp.visible = true;
    if (preferences.soundpref.value === "enabled") {
		play(pageFumble, false);
    }
}
//=====================
//End function
//=====================

//===========================================
// this function opens the online help file
//===========================================
function menuitem1OnClick() {
    var answer = alert("This button opens a browser window and connects to the help page for this widget. Do you wish to proceed?", "Open Browser Window", "No Thanks");
    if (answer === 1) {
		openURL("https://www.facebook.com/profile.php?id=100012278951649");
    }
}
//=====================
//End function
//=====================

//===========================================
// this function opens the URL for paypal
//===========================================
function menuitem2OnClick() {
    var answer = alert("Help support the creation of more widgets like this, send us a coffee! This button opens a browser window and connects to the Kofi donate page for this widget). Will you be kind and proceed?", "Open Browser Window", "No Thanks");

    if (answer === 1) {
                openURL("https://www.ko-fi.com/yereverluvinunclebert");
    }
}
//=====================
//End function
//=====================

//===========================================
// this function opens my Amazon URL wishlist
//===========================================
function menuitem3OnClick() {
    var answer = alert("Help support the creation of more widgets like this. Buy me a small item on my Amazon wishlist! This button opens a browser window and connects to my Amazon wish list page). Will you be kind and proceed?", "Open Browser Window", "No Thanks");
    if (answer === 1) {
        openURL("http://www.amazon.co.uk/gp/registry/registry.html?ie=UTF8&id=A3OBFB6ZN4F7&type=wishlist");
    }
}
//=====================
//End function
//=====================


//===========================================
// this function opens other widgets URL
//===========================================
function menuitem5OnClick() {
    var answer = alert("This button opens a browser window and connects to the Steampunk widgets page on my site. Do you wish to proceed", "Open Browser Window", "No Thanks");
    if (answer === 1) {
		openURL("https://www.deviantart.com/yereverluvinuncleber/gallery/59981269/yahoo-widgets");
    }
}
//=====================
//End function
//=====================

//===========================================
// this function opens the download URL
//===========================================
function menuitem6OnClick() {
    var answer = alert("Download latest version of the widget - this button opens a browser window and connects to the widget download page where you can check and download the latest zipped .WIDGET file). Proceed?", "Open Browser Window", "No Thanks");
    if (answer === 1) {
        openURL("https://www.deviantart.com/yereverluvinuncleber/art/Steampunk-Hole-Desktop-Tidy-Tool-721172390");
    }
}
//=====================
//End function
//=====================

//===========================================
// this function opens the browser at the contact URL
//===========================================
function menuitem7OnClick() {
    var answer = alert("Visiting the support page - this button opens a browser window and connects to our contact us page where you can send us a support query or just have a chat). Proceed?", "Open Browser Window", "No Thanks");
    if (answer === 1) {
		openURL("http://www.facebook.com/profile.php?id=100012278951649");
    }
}
//=====================
//End function
//=====================

//===========================================
// this function opens the browser at the contact URL
//===========================================
function facebookChat() {
    var answer = alert("Visiting the Facebook chat page - this button opens a browser window and connects to our Facebook chat page.). Proceed?", "Open Browser Window", "No Thanks");
    if (answer === 1) {
        openURL("http://www.facebook.com/profile.php?id=100012278951649");
    }
}
//=====================
//End function
//=====================

//===========================================
// this function edits the widget
//===========================================
function editWidget() {
    //var answer = alert("Editing the widget. Proceed?", "Open Editor", "No Thanks");
    //if (answer === 1) {
		//uses the contents of imageEditPref to initiate your default editor
        performCommand("menu");
    //}
}
//=====================
//End function
//=====================



//===========================================
// this function allows a spacer in the menu
//===========================================
function nullfunction() {
    if (debugFlg === "1") {
        hprint("null");
    }
}
//=====================
//End function
//=====================

//===========================================
// this function causes explorer to be opened and the file selected
//===========================================
function findWidget() {

 // temporary development version of the widget
    var widgetFullPath = convertPathToPlatform(system.userWidgetsFolder + "/" + widgetName);
    var alertString = "The widget folder is: \n";
    if (filesystem.itemExists(widgetFullPath)) {
        alertString += system.userWidgetsFolder + " \n\n";
        alertString += "The widget name is: \n";
        alertString += widgetName + ".\n ";

        alert(alertString, "Open the widget's folder?", "No Thanks");

        filesystem.reveal(widgetFullPath);
    } else {
        widgetFullPath = resolvePath(".");   
        filesystem.reveal(widgetFullPath);
        print("widgetFullPath " + widgetFullPath);
    }
}
//=====================
//End function
//=====================

//=========================================================================
// this function assigns items to the mainWindow context menu
//=========================================================================
var bgResult;

function setmenu() {
    var items = [], mItem, sItem;

    function esc(path) {
        return path.replace(/([\W])/g, "\\$1");
    }

	function makeIniFile(iniFile) {
		var iniFileData = "[ViewState]\r\nMode=\r\nVid=\r\nFolderType=Generic\r\n";

		if (preferences.desktopIniPref.value === "0") {
			return;
		}

		if (!filesystem.itemExists(iniFile)) {
			filesystem.writeFile(iniFile, iniFileData);
		}
	}

	function openFolder(folder) {
        var folderToSelect = preferences[folder].value;
        var iniToSelect;

        if (filesystem.itemExists(folderToSelect)) {
            if (isMacintosh) {
                runCommand("open " + esc(folderToSelect));
            } else {
            	iniToSelect = folderToSelect + "/desktop.ini";
            	makeIniFile(iniToSelect);
            	if (filesystem.itemExists(iniToSelect)) {
                	filesystem.reveal(iniToSelect);
                } else {
                	filesystem.reveal(folderToSelect);
                }
            }
        } else {
        	play(burp, false);
        	hprint("No destination is defined for folder " + folder + ".");
        	alert("No destination is defined for folder " + folder + ".");
        }
    }

	function fileName(path) {
		var idx = path.lastIndexOf("/");

		return path.substring(idx + 1);
	}

	//////////////////// Standard Folders ////////////////////

    mItem = new MenuItem();
    mItem.title = "Open Standard Folders";

    sItem = new MenuItem();
    sItem.title = "Open the Documents folder";
    sItem.onSelect = function () {
    	openFolder("documentFolder");
    };
    mItem.appendChild(sItem);

    sItem = new MenuItem();
    sItem.title = "Open the Compressed Files folder";
    sItem.onSelect = function () {
    	openFolder("compressedFolder");
    };
    mItem.appendChild(sItem);

    sItem = new MenuItem();
    sItem.title = "Open the Movies folder";
    sItem.onSelect = function () {
    	openFolder("movieFolder");
    };
    mItem.appendChild(sItem);

    sItem = new MenuItem();
    sItem.title = "Open the Music folder";
    sItem.onSelect = function () {
    	openFolder("musicFolder");
    };
    mItem.appendChild(sItem);

    sItem = new MenuItem();
    sItem.title = "Open the Pictures folder";
    sItem.onSelect = function () {
    	openFolder("pictureFolder");
    };
    mItem.appendChild(sItem);

    sItem = new MenuItem();
    sItem.title = "Open the Temporary folder";
    sItem.onSelect = function () {
    	openFolder("otherFolder");
    };
    mItem.appendChild(sItem);

    sItem = new MenuItem();
    sItem.title = "Open the Widgets folder";
    sItem.onSelect = function () {
   		openFolder("widgetFolder");
    };
    mItem.appendChild(sItem);

    sItem = new MenuItem();
    sItem.title = "Open the Desktop Shortcuts folder";
    sItem.onSelect = function () {
   		openFolder("shortcutsFolder");
    };
    mItem.appendChild(sItem);

    items.push(mItem);

/*
    mItem = new MenuItem();
    mItem.title = "-";
    mItem.onSelect = function () {
        nullfunction();
    };
    items.push(mItem);
*/

	//////////////////// User-defined Folders ////////////////////

    mItem = new MenuItem();
    mItem.title = "Open User-defined Folders";

    sItem = new MenuItem();
    sItem.title = "Open user-defined folder one (" + fileName(preferences.userFolder1.value) + ")";
    sItem.onSelect = function () {
   		openFolder("userFolder1");
    };
	mItem.appendChild(sItem);

    sItem = new MenuItem();
    sItem.title = "Open user-defined folder two (" + fileName(preferences.userFolder2.value) + ")";
    sItem.onSelect = function () {
   		openFolder("userFolder2");
    };
    mItem.appendChild(sItem);

    sItem = new MenuItem();
    sItem.title = "Open user-defined folder three (" + fileName(preferences.userFolder3.value) + ")";
    sItem.onSelect = function () {
   		openFolder("userFolder3");
    };
	mItem.appendChild(sItem);

    items.push(mItem);

    ////////////////////  ////////////////////

    mItem = new MenuItem();
    mItem.title = "-";
    mItem.onSelect = function () {
        nullfunction();
    };
    items.push(mItem);

    if (preferences.menuPrefs.value === "enabled") {
        mItem = new MenuItem();
        mItem.title = "Donate a Coffee with Ko-Fi";
        mItem.onSelect = function () {
            menuitem2OnClick();
        };
        items.push(mItem);
    }


    if (preferences.menuPrefs.value === "enabled") {
        mItem = new MenuItem();
        mItem.title = "-";
        mItem.onSelect = function () {
            nullfunction();
        };
        items.push(mItem);
    }

    if (preferences.menuPrefs.value === "enabled") {
        mItem = new MenuItem();
        mItem.title = "See More Steampunk Widgets";
        mItem.onSelect = function () {
            menuitem5OnClick();
        };
        items.push(mItem);
    }

    if (preferences.menuPrefs.value === "enabled") {
        mItem = new MenuItem();
        mItem.title = "Download Latest Version";
        mItem.onSelect = function () {
            menuitem6OnClick();
        };
        items.push(mItem);
    }

    if (preferences.menuPrefs.value === "enabled") {
        mItem = new MenuItem();
        mItem.title = "Contact Support";
        mItem.onSelect = function () {
            menuitem7OnClick();
        };
        items.push(mItem);
    }

    mItem = new MenuItem();
    mItem.title = "Chat about Steampunk Widgets on Facebook";
    mItem.onSelect = function () {
        facebookChat();
    };
    items.push(mItem);


    mItem = new MenuItem();
    mItem.title = "-";
    mItem.onSelect = function () {
        nullfunction();
    };
    items.push(mItem);


    mItem = new MenuItem();
    mItem.title = "Reveal Widget in Windows Explorer";
    mItem.onSelect = function () {
        findWidget();
    };
    items.push(mItem);

    mItem = new MenuItem();
    mItem.title = "Reveal Widget's Data(Safe) Folder";
    mItem.onSelect = function () {
        filesystem.reveal(system.widgetDataFolder + "/GNU-GPL.html");
    };
    items.push(mItem);
    
	mItem = new MenuItem();
	mItem.title = "-";
	mItem.onSelect = function () {
		nullfunction();
	};
	items.push(mItem);
        
    mItem = new MenuItem();
    mItem.title = "Reload Widget (F5)";
    mItem.onSelect = function () {
        reloadWidget();
    };
    items.push(mItem);

	if (preferences.imageEditPref.value != "" && debugFlg === "1") {
	    mItem = new MenuItem();
	    mItem.title = "Edit Widget using " + preferences.imageEditPref.value ;
	    mItem.onSelect = function () {
			editWidget();
	    };
	    items.push(mItem);
	 }
	 
	mItem = new MenuItem();
    mItem.title = "-";
    mItem.onSelect = function () {
        nullfunction();
    };


    items.push(mItem);
    mItem = new MenuItem();
    mItem.title = "Show the Help for the Desktop Hole";
    mItem.onSelect = function () {
        helpScreen();
    };
    items.push(mItem);

    mItem = new MenuItem();
    mItem.title = "Display Licence Agreement...";
    mItem.onSelect = function () {
        LICENCE.displayLicence();
    };
    items.push(mItem);

    mainWindow.contextMenuItems = items;
}
//=====================
//End function
//=====================

//======================================================================================
// Function to perform commands
//======================================================================================
var runningTask;

function performCommand(method) {
    dprint("%-I-INFO, performCommand");
    var answer;

    if (preferences.soundpref.value === "enabled") {
        play(tingingSound, false);
    }

    if (system.event.altKey) { // filesystem.open() call
        if (preferences.openFilePref.value === "") {
            answer = alert("This widget has not been assigned an alt+double-click function. You need to open the preferences and select a file to be opened. Do you wish to proceed?", "Open Preferences", "No Thanks");
            if (answer === 1) {
                showWidgetPreferences();
            }
            return;
        }
        filesystem.open(preferences.openFilePref.value);
    } else { // runCommandInBg() call
        if (preferences.imageCmdPref.value === "") {
            answer = alert("This widget has not been assigned a double-click function. You need to open the preferences and enter a run command for this widget. Do you wish to proceed?", "Open Preferences", "No Thanks");
            if (answer === 1) {
                showWidgetPreferences();
            }
            return;
        }
        print("method "+method);
        if (method === "menu") {
         	runCommandInBg(preferences.imageEditPref.value, "runningTask");        		
        } else {
        	runCommandInBg(preferences.imageCmdPref.value, "runningTask");        	
        }
            
    }
}
//=====================
//End function
//=====================



//======================================================================================
// END script functions.js
//======================================================================================
