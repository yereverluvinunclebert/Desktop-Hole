/*
    fsNW.js - Yahoo! Widgets Style Filesystem for NW
    Copyright © 2014-2022 Harry Whitfield

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

    fsNW.js - Yahoo! Widgets Style Filesystem for NW
    5 February, 2022
    Copyright © 2014-2022 Harry Whitfield
    mailto:g6auc@arrl.net
*/

/*
        Konfabulator filesystem method                  Uses node method(s)
boolean filesystem.copy(path|array, destFolder)     fs.copyFileSync(path, dest)
boolean filesystem.createDirectory(path, recurse)   fs.mkdirSync(path, {recursive: recurse})
boolean filesystem.isDirectory(path)                stat = fs.lstatSync(path) and
                                                    stat.isDirectory()
boolean filesystem.itemExists(path)                 fs.existsSync(path)
boolean filesystem.move(path|array, destFolder)     fs.renameSync(path, dest)
string|array filesystem.readFile(path, asLines)     fs.readFileSync(path, "utf8")
boolean filesystem.remove(path|array, recurse)      fs.rmdirSync(path, {recursive: recurse}) or
                                                    fs.unlinkSync(path);
void filesystem.writeFile(path, text, append)       fs.writeFileSync(path, text, "utf8") or
                                                    fs.appendFileSync(path, text, "utf8")

array filesystem.getDirectoryContents(dir, recurse)
string filesystem.getDisplayName(path)
object filesytem.getFileInfo(path)
filesystem.isPathAllowed(path)
filesystem.open(path)
filesystem.reveal(path)
filesystem.volumes

filesystem.getMD5(path)
filesystem.unzip(path, destination)
filesystem.zip(path|array, destination [, baseDir])

filesystem.emptyRecycleBin()
filesystem.emptyTrash()
filesystem.getRecycleBinInfo()
filesystem.getTrashInfo()
filesystem.moveToRecycleBin()
filesystem.moveToTrash()
filesystem.openRecycleBin()
filesystem.openTrash()
*/

/*jslint browser, devel, node */

/*property
    appendFileSync, copy, copyFileSync, createDirectory, existsSync, forEach,
    homedir, isDirectory, itemExists, join, lastIndexOf, lstatSync, mkdirSync,
    move, platform, readFile, readFileSync, recursive, remove, renameSync,
    replace, rmdirSync, split, substring, unlinkSync, writeFile, writeFileSync
*/

let isMacintosh = false;

let wpFolder = (function () {
    let os;

    // check for availability of filesystem functions in node.js
    if ((typeof require === "function") && (require("fs") !== undefined)) {
        os = require("os");

        isMacintosh = (os.platform() === "darwin");

        return (
            os.platform() === "darwin"
            ? os.homedir()
            : os.homedir()  // needs a different windows path?
        );
    }
    return null;
}());

let cPath = function (path) {
    return (
        isMacintosh
        ? path.replace(/\\/g, "/")
        : path.replace(/\//g, "\\")
    );
};

// define the filesystem function
let filesystem = (function () {
    const debug = true;
    let itself;
    let fs;
    let os;
    let system;

// check for availability of filesystem functions in node.js
    if (typeof require === "function" && require("fs") !== undefined) {
        itself = {};
        fs = require("fs");
        os = require("os");
        system = {};

        system.platform = (
            os.platform() === "darwin"
            ? "macintosh"
            : "windows"
        );

        isMacintosh = (os.platform() === "darwin");

        let fileName = function (path) {
            let idx = (
                isMacintosh
                ? path.lastIndexOf("/")
                : path.lastIndexOf("\\")
            );
            return path.substring(idx);
        };

        itself.copy = function (path, dest) {
            let result = true;

            path = cPath(path);
            dest = cPath(dest);

            if (!itself.isDirectory(dest)) {
                return false;
            }

            try {
                if (typeof path === "string") {
                    fs.copyFileSync(path, dest + fileName(path));
                } else {
                    path.forEach(function (p) {
                        fs.copyFileSync(p, dest + fileName(p));
                    });
                }
            } catch (e) {
                if (debug) {
                    alert("133: filesystem.copy: " + e);
                }
                result = false;
            }
            return result;
        };

        itself.createDirectory = function (path, recurse) {
            path = cPath(path);
            recurse = Boolean(recurse);
            try {
                fs.mkdirSync(path, {recursive: recurse});
                return true;
            } catch (e) {
                if (debug) {
                    alert("filesystem.createDirectory: " + e);
                }
                return false;
            }
        };

        itself.isDirectory = function (path) {
            let stat;

            path = cPath(path);

            try {
                stat = fs.lstatSync(path);
                return stat.isDirectory();
            } catch (e) {
                // lstatSync throws an error if path doesn't exist
                if (debug) {
                    alert("filesystem.isDirectory: " + e);
                }
                return false;
            }
        };

        itself.itemExists = function (path) {
            return fs.existsSync(cPath(path));
        };

        itself.move = function (path, dest) {
            let result = true;

            path = cPath(path);
            dest = cPath(dest);

            if (!itself.isDirectory(dest)) {
                return false;
            }

            try {
                if (typeof path === "string") {
                    fs.renameSync(path, dest + fileName(path));
                } else {
                    path.forEach(function (p) {
                        fs.renameSync(p, dest + fileName(p));
                    });
                }
            } catch (e) {
                if (debug) {
                    alert("184: filesystem.move: " + e);
                }
                result = false;
            }
            return result;
        };

        itself.readFile = function (path, asLines) {
            let text;

            path = cPath(path);

            if (itself.isDirectory(path)) {
                return null;
            }

            try {
                text = fs.readFileSync(path, "utf8");

                return (
                    asLines
                    ? text.split(/\r\n?|\n/)
                    : text
                );
            } catch (e) {
                if (debug) {
                    alert("filesystem.readFile: " + e);
                }
                return null;
            }
        };

        itself.remove = function (path, recurse) {
            let result = true;

            path = cPath(path);

            if (!itself.isDirectory(path)) {    // it's a file
                try {
                    if (typeof path === "string") {
                        fs.unlinkSync(path);
                    } else {
                        path.forEach(function (p) {
                            fs.unlinkSync(p);
                        });
                    }
                } catch (e) {
                    if (debug) {
                        alert("filesystem.remove: " + e);
                    }
                    result = false;
                }
                return result;
            }

            recurse = Boolean(recurse);

            try {
                if (typeof path === "string") {
                    fs.rmdirSync(path, {recursive: recurse});
                } else {
                    path.forEach(function (p) {
                        fs.rmdirSync(p, {recursive: recurse});
                    });
                }
            } catch (ee) {
                if (debug) {
                    alert("filesystem.remove: " + ee);
                }
                result = false;
            }
            return result;
        };

        itself.writeFile = function (path, text, append) {
            path = cPath(path);

            if (typeof text === "string") {
                text = text.split(/\r\n?|\n/);
            }
            text = (
                system.platform === "macintosh"
                ? text.join("\n")
                : text.join("\r\n")
            );

            if (append) {
                fs.appendFileSync(path, text, "utf8");
            } else {
                fs.writeFileSync(path, text, "utf8");
            }
        };

        return itself;
    }
    return null;
}());

export {cPath, filesystem, isMacintosh, wpFolder};
