//===========================================================================
// vitality.js
// Hole Widget  1.0.10
// Written and Steampunked by: Dean Beedell
// Dean.beedell@lightquick.co.uk
//===========================================================================

/*property
    appendChild, createDocument, createElement, dockOpen, setAttribute,
    setDockItem
*/

/*jslint multivar */

"use strict";

//=========================================================================
// this function builds vitality for the dock
//=========================================================================
function buildVitality(bg) {
    var d, v, dock_bg;

    if (!widget.dockOpen) {
        return;
    }

    d = XMLDOM.createDocument();
    v = d.createElement("dock-item");
    v.setAttribute("version", "1.0");
    d.appendChild(v);

    dock_bg = d.createElement("image");
    dock_bg.setAttribute("src", bg);
    dock_bg.setAttribute("hOffset", 0);
    dock_bg.setAttribute("vOffset", 0);
    v.appendChild(dock_bg);

    widget.setDockItem(d, "fade");
}
//=====================
//End function
//=====================
