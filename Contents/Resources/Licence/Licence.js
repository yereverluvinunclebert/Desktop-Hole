/*
LICENCE DISPLAY - A program to display licence information.
Copyright © 2005-2017  Ricky Romero and Harry Whitfield

This program is free software; you can redistribute it and/or modify it
under the terms of the GNU General Public Llicence as published by the
Free Software Foundation; either version 2 of the Licence, or (at your
option) any later version.

This program is distributed in the hope that it will be useful, but
WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
General Public licence for more details.

You should have received a copy of the GNU General Public licence along
with this program; if not, write to the Free Software Foundation, Inc.,
51 Franklin St, Fifth Floor, Boston, MA  02110-1301  USA

licence Display - version 7.1
2 October, 2017
Copyright © 2005-2017  Ricky Romero and Harry Whitfield
mailto:g6auc@arrl.net
*/

/*jslint multivar */

/*property
    alignment, altKey, appendChild, bgColor, bgOpacity, color, createLicence,
    data, displayLicence, event, extractFile, focus, font, hAlign, hOffset,
    height, licenceHide, mainWindow, onMouseUp, opacity, open, orientation,
    readFile, secondaryWindow, shadow, size, src, testLicence, thumbColor,
    title, tooltip, vAlign, vOffset, vScrollBar, value, visible, width, window,
    wrap
*/

/*
    Defines a global object LICENCE with the following properties:

    LICENCE.createLicence(mainWindow, secondaryWindow);  // creates a licence window.

                                        // mainWindow - the Widget's main window.
                                        // secondaryWindow - the Widget's secondary window.

    LICENCE.displayLicence();           // displays the licence window.

    LICENCE.testLicence();              // checks that the licence conditions have
                                        // been accepted, otherwise closes the Widget.
                                        // can be used repeatedly, if desired.
*/

"use strict";

var LICENCE = (function () {
    var licence_info = null,
        accept = null,
        acceptShadow = null,
        decline = null,
        declineInstruction = null,
        declineInstruction2 = null,
        declineShadow = null,
        licence = null,
        theLicenceFrame = null,
        widgetTitle = null,
        licenceTaFrame = null,
        licenceVsb = null,
        GNU_GPL = widget.extractFile("Resources/Licence/GNU-GPL.html"),
        itself = {},

        closeTheWidget = function () {
            closeWidget();
        },

        acceptLicence = function () {
            var mainWindow = licence_info.mainWindow;
            var secondaryWindow = licence_info.secondaryWindow;

            licence_info.visible = false;
            mainWindow.visible = true;
            if (secondaryWindow !== undefined) {
                secondaryWindow.visible = true;
            }
            mainWindow.focus();

            theLicenceFrame.opacity = 0;
            widgetTitle.opacity = 0;
            declineInstruction.opacity = 0;
            declineInstruction2.opacity = 0;
            licence.opacity = 0;
            acceptShadow.opacity = 0;
            accept.opacity = 0;
            declineShadow.opacity = 0;
            decline.opacity = 0;

            preferences.licenceHide.value = "1";
        },

        showLicence = function () {
            if (system.event.altKey) {
                filesystem.open(GNU_GPL);
            }
        };

    itself.displayLicence = function () {
        theLicenceFrame.opacity = 255;
        widgetTitle.opacity = 255;
        declineInstruction.opacity = 255;
        declineInstruction2.opacity = 255;
        licence.opacity = 255;
        acceptShadow.opacity = 255;
        accept.opacity = 255;
        declineShadow.opacity = 255;
        decline.opacity = 255;

        preferences.licenceHide.value = "0";
        licence_info.visible = true;
    };

    itself.testLicence = function () {
        if (licence_info.visible) {
            closeWidget();
        }
    };

    itself.createLicence = function (mainWindow, secondaryWindow) {  // mainWindow parameter is a window

        licence_info = new Window();

        licence_info.mainWindow = mainWindow;
        licence_info.secondaryWindow = secondaryWindow;

        licence_info.title = "Licence Agreement";
        licence_info.alignment = "left";
        licence_info.hOffset = 400;
        licence_info.vOffset = 150;
        licence_info.width = 365;
        licence_info.height = 310;
        licence_info.visible = false;
        licence_info.shadow = false;

        theLicenceFrame = new Image();
        theLicenceFrame.window = licence_info;
        theLicenceFrame.src = "Resources/Licence/Frame.png";
        theLicenceFrame.hOffset = 0;
        theLicenceFrame.vOffset = 0;
        theLicenceFrame.width = 365;
        theLicenceFrame.height = 310;

        widgetTitle = new Text();
        widgetTitle.window = licence_info;
        widgetTitle.data = "Licence Agreement";
        widgetTitle.hOffset = 34;
        widgetTitle.vOffset = 34;
        widgetTitle.alignment = "left";
        widgetTitle.font = "Helvetica, Arial Bold";
        widgetTitle.size = 11;
        widgetTitle.color = "#FFFFFF";

        declineInstruction2 = new Text();
        declineInstruction2.window = licence_info;
        declineInstruction2.data = "If you do not agree with the terms set forth above, please click the";
        declineInstruction2.alignment = "center";
        declineInstruction2.hOffset = 183;
        declineInstruction2.vOffset = 236;
        declineInstruction2.font = "Helvetica";
        declineInstruction2.size = 9;
        declineInstruction2.color = "#FFFFFF";

        declineInstruction = new Text();
        declineInstruction.window = licence_info;
        declineInstruction.data = "Decline button below and destroy this Widget and its documentation.";
        declineInstruction.alignment = "center";
        declineInstruction.hOffset = 183;
        declineInstruction.vOffset = 248;
        declineInstruction.font = "Helvetica";
        declineInstruction.size = 9;
        declineInstruction.color = "#FFFFFF";

        licenceTaFrame = new Frame();                   // new in version 6.1
        licence_info.appendChild(licenceTaFrame);
        licenceTaFrame.hOffset = 35;
        licenceTaFrame.vOffset = 45;
        licenceTaFrame.width = 296;
        licenceTaFrame.height = 177;
        licenceTaFrame.hAlign = "left";
        licenceTaFrame.vAlign = "top";
        licenceTaFrame.tooltip = "Alt-click to see the full licence text.";

        licenceVsb = new ScrollBar();                   // new in version 6.1
        licence_info.appendChild(licenceVsb);
        licenceVsb.orientation = "vertical";
        licenceVsb.opacity = "128";
        licenceVsb.height = "177";
        licenceVsb.hOffset = "318";
        licenceVsb.vOffset = "45";
        licenceVsb.thumbColor = "#000000";

        licenceTaFrame.vScrollBar = licenceVsb;

        licence = new Text();                           // was TextArea
        licenceTaFrame.appendChild(licence);
        licence.data = "";
        licence.hOffset = 0;
        licence.vOffset = 0;
        licence.width = 284;
        licence.height = 275;                           // 275 upwards
        licence.hAlign = "left";
        licence.font = "Helvetica";
        licence.size = 11;
        licence.color = "#FFFFFF";
        licence.bgColor = "#25443C";
        licence.opacity = 255;
        licence.bgOpacity = 192;
        licence.wrap = true;
        licence.onMouseUp = showLicence;

        acceptShadow = new Text();
        acceptShadow.window = licence_info;
        acceptShadow.data = "Accept";
        acceptShadow.hOffset = 329;
        acceptShadow.vOffset = 279;
        acceptShadow.alignment = "right";
        acceptShadow.font = "Helvetica, Arial Bold";
        acceptShadow.size = 11;
        acceptShadow.color = "#FFFFFF";
        acceptShadow.opacity = 192;
        acceptShadow.onMouseUp = acceptLicence;

        accept = new Text();
        accept.window = licence_info;
        accept.data = "Accept";
        accept.hOffset = 329;
        accept.vOffset = 278;
        accept.alignment = "right";
        accept.font = "Helvetica, Arial Bold";
        accept.size = 11;
        accept.color = "#000000";
        accept.opacity = 192;

        declineShadow = new Text();
        declineShadow.window = licence_info;
        declineShadow.data = "Decline";
        declineShadow.hOffset = 236;
        declineShadow.vOffset = 279;
        declineShadow.alignment = "left";
        declineShadow.font = "Helvetica, Arial Bold";
        declineShadow.size = 11;
        declineShadow.color = "#FFFFFF";
        declineShadow.opacity = 192;
        declineShadow.onMouseUp = closeTheWidget;

        decline = new Text();
        decline.window = licence_info;
        decline.data = "Decline";
        decline.hOffset = 236;
        decline.vOffset = 278;
        decline.alignment = "left";
        decline.font = "Helvetica, Arial Bold";
        decline.size = 11;
        decline.color = "#000000";
        decline.opacity = 192;

        licence.data = filesystem.readFile("Resources/Licence/licence.txt");

        if (preferences.licenceHide.value === "0") {
            mainWindow.visible = false;
            if (secondaryWindow !== undefined) {
                secondaryWindow.visible = false;
            }
            licence_info.visible = true;
            licence_info.focus();
        } else {
            licence_info.visible = false;
            mainWindow.visible = true;
            if (secondaryWindow !== undefined) {
                secondaryWindow.visible = true;
            }
            mainWindow.focus();
        }
    };

    return itself;
}());
