/*
    Point Methods to test if a point lies between two other points
    Copyright © 2019 Harry Whitfield

    This program is free software; you can redistribute it and/or modify it
    under the terms of the GNU General Public License as published by the
    Free Software Foundation; either version 2 of the License, or (at your
    option) any later version.

    This program is distributed in the hope that it will be useful, but
    WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.    See the GNU
    General Public License for more details.

    You should have received a copy of the GNU General Public License along
    with this program; if not, write to the Free Software Foundation, Inc.,
    51 Franklin St, Fifth Floor, Boston, MA 02110-1301  USA

    Point Methods - version 1.2.3
    1 September, 2019
    Copyright 2019 Harry Whitfield
    mailto:g6auc@arrl.net
*/

/*jslint for, this */

/*property
    abs, isBetween0, isBetween01, isBetween1, isBetween2, isBetween3, prototype,
    sqrt, x, y
*/

//var eprint;   // for diagnostic printing

function Point(x, y) {  // point constructor
    this.x = x;
    this.y = y;
}


/* Point.isBetween0(p1, p2) tests whether this point lies on the line segment
   between p1 and p2.
*/

Point.prototype.isBetween0 = function (p1, p2) {    // slope method
    var dx12 = p2.x - p1.x;
    var dy12 = p2.y - p1.y;

    var dx10 = this.x - p1.x;
    var dy10 = this.y - p1.y;

    var epsilon = 1e-7;

    var colinear = (Math.abs(dy12 * dx10 - dx12 * dy10) < epsilon);
    var between_x = ((p1.x <= this.x) && (this.x <= p2.x)) || ((p1.x >= this.x) && (this.x >= p2.x));
    var between_y = ((p1.y <= this.y) && (this.y <= p2.y)) || ((p1.y >= this.y) && (this.y >= p2.y));

//  eprint("colinear: " + colinear);
//  eprint("between_x: " + between_x);
//  eprint("between_y: " + between_y);

    return colinear && between_x && between_y;
};


/* Point.isBetween01(p1, p2) tests whether this point lies on the line segment
   between p1 and p2.
*/

Point.prototype.isBetween01 = function (p1, p2) {   // area method
    var epsilon = 1e-7;

    var colinear = (Math.abs(this.x * (p1.y - p2.y) + p1.x * (p2.y - this.y) + p2.x * (this.y - p1.y)) < epsilon);
    var between_x = ((p1.x <= this.x) && (this.x <= p2.x)) || ((p1.x >= this.x) && (this.x >= p2.x));
    var between_y = ((p1.y <= this.y) && (this.y <= p2.y)) || ((p1.y >= this.y) && (this.y >= p2.y));

//  eprint("colinear: " + colinear);
//  eprint("between_x: " + between_x);
//  eprint("between_y: " + between_y);

    return colinear && between_x && between_y;
};


/* Point.isBetween1(p1, p2) tests whether this point lies within the circle centred
   midway between p1 and p2 with radius half the distance between p1 and p2.

   This circle passes through p1 and p2. Points p1 and p2 are considered to be within
   the circle. Change the <= test to a < test to exclude points on the circle.

   On 3.2GHz Intel Core i5 in Yahoo! Widgets takes < 1µS.
*/

Point.prototype.isBetween1 = function (p1, p2) {    // using circle
    return ((this.x - p1.x) * (this.x - p2.x) + (this.y - p1.y) * (this.y - p2.y)) <= 0;
};


/* Point.isBetween2(p1, p2, e) tests whether this point lies within the ellipse centred
   midway between p1 and p2 with eccentricity e.

   Points p1 and p2 are the end points of the major axis of the ellipse and are considered
   to be within the ellipse. Change the <= test to a < test to exclude points on the
   ellipse.

    On 3.2GHz Intel Core i5 in Yahoo! Widgets takes < 8µS.
*/

Point.prototype.isBetween2 = function (p1, p2, e) { // using ellipse of eccentricity e
    var alfa = 0.5 * (e + 1);
    var beta = 1 - alfa;

    var f1 = new Point(alfa * p1.x + beta * p2.x, alfa * p1.y + beta * p2.y);   // focus 1
    var f2 = new Point(beta * p1.x + alfa * p2.x, beta * p1.y + alfa * p2.y);   // focus 2

    //eprint("f1: " + f1.x + "," + f1.y);
    //eprint("f2: " + f2.x + "," + f2.y);

    var dx1 = this.x - f1.x;
    var dy1 = this.y - f1.y;

    var dx2 = this.x - f2.x;
    var dy2 = this.y - f2.y;

    var dx = p1.x - p2.x;
    var dy = p1.y - p2.y;

    var rr = dx * dx + dy * dy; // square of distance between p1 and p2

    var aa = Math.sqrt(rr);     // aa is length of the major axis of the ellipse

    //eprint("semi-major axis: " + 0.5 * aa);
    //eprint("semi-minor axis: " + 0.5 * aa * Math.sqrt(1 - e * e));

    var d1 = Math.sqrt(dx1 * dx1 + dy1 * dy1);  // distance of this point from f1
    var d2 = Math.sqrt(dx2 * dx2 + dy2 * dy2);  // distance of this point from f2

    return d1 + d2 <= aa;   // aa is length of the major axis of the ellipse
};


/* Point.isBetween3(p1, p2, e) tests whether this point lies within the ellipse centred
   midway between p1 and p2 with eccentricity e.

   Points p1 and p2 are the end points of the major axis of the ellipse and are considered
   to be within the ellipse. Change the <= test to a < test to exclude points on the
   ellipse.

   Point.isBetween3 is essentially the same as Point.isBetween2. The code has been
   modified to eliminate the Math.sqrt calls.

   On 3.2GHz Intel Core i5 in Yahoo! Widgets takes < 8µS.

Condition   sqrt(a) + sqrt(b) <= sqrt(c),  where a >= 0, b >= 0, c >= 0, is equivalent to
condition   0 <= sqr(c) - 2*c*(a+b) + sqr(a-b).

Proof:
squaring:   a + 2*sqrt(a*b) + b <= c
            2*sqrt(a*b) <= c - (a+b)
squaring:   4*a*b <= sqr(c - (a+b))
            4*a*b <= sqr(c) - 2*c*(a+b) + sqr(a+b)
            4*a*b <= sqr(c) - 2*c*(a+b)) + sqr(a) + 2*a*b + sqr(b)
            0 <= sqr(c) - 2*c*(a+b) + sqr(a) - 2*a*b + sqr(b)
            0 <= sqr(c) - 2*c*(a+b) + sqr(a-b)

Substituting r1, r2, rr for a, b, c

a === r1 = dx1 * dx1 + dy1 * dy1    // square of distance of this point from f1
b === r2 = dx2 * dx2 + dy2 * dy2    // square of distance of this point from f2
c === rr = dx * dx + dy * dy        // square of distance between p1 and p2

we get      0 <= sqr(rr) - 2*rr*(r1+r2) + sqr(r1-r2).
*/

Point.prototype.isBetween3 = function (p1, p2, e) { // using ellipse of eccentricity e
    var alfa = 0.5 * (e + 1);
    var beta = 1 - alfa;

    var f1 = new Point(alfa * p1.x + beta * p2.x, alfa * p1.y + beta * p2.y);   // focus 1
    var f2 = new Point(beta * p1.x + alfa * p2.x, beta * p1.y + alfa * p2.y);   // focus 2

    //eprint("f1: " + f1.x + "," + f1.y);
    //eprint("f2: " + f2.x + "," + f2.y);

    var dx1 = this.x - f1.x;
    var dy1 = this.y - f1.y;

    var dx2 = this.x - f2.x;
    var dy2 = this.y - f2.y;

    var dx = p1.x - p2.x;
    var dy = p1.y - p2.y;

    var rr = dx * dx + dy * dy; // square of distance between p1 and p2
/*
    var aa = Math.sqrt(rr);     // aa is length of the major axis of the ellipse
    eprint("semi-major axis: " + 0.5 * aa);
    eprint("semi-minor axis: " + 0.5 * aa * Math.sqrt(1 - e * e));
*/
    var r1 = dx1 * dx1 + dy1 * dy1; // square of distance of this point from f1
    var r2 = dx2 * dx2 + dy2 * dy2; // square of distance of this point from f2

    return 0 <= rr * rr - 2 * rr * (r1 + r2) + (r1 - r2) * (r1 - r2);
};

function eccentricity(a, b) {   // a >= b
    return Math.sqrt(1 - (b * b) / (a * a));
}

export {Point, eccentricity};

/*
// test examples

eprint("---- ----");

var p1 = new Point(0, 0);
var p2 = new Point(0, 8);

var a = 4;
var b = 1;
var e = eccentricity(a, b);

eprint("e: " + e.toFixed(7));   // 0.9682458

var p0 = new Point(1.0000006, 4);   // point outside of the ellipse

(function test1() {
    var i;
    var t0;
    var t1;

    t0 = Date.now();
    for (i = 0; i < 1000; i += 1) {
        p0.isBetween1(p1, p2);
    }
    t1 = Date.now();
    eprint("isBetween1 takes " + (t1 - t0) + " µS");
    eprint(p0.isBetween1(p1, p2));  // should return true for circle of radius 4
}());

(function test2() {
    var i;
    var t0;
    var t1;

    t0 = Date.now();
    for (i = 0; i < 1000; i += 1) {
        p0.isBetween2(p1, p2, e);
    }
    t1 = Date.now();
    eprint("isBetween2 takes " + (t1 - t0) + " µS");
    eprint(p0.isBetween2(p1, p2, e));   // should return false
}());

(function test3() {
    var i;
    var t0;
    var t1;

    t0 = Date.now();
    for (i = 0; i < 1000; i += 1) {
        p0.isBetween3(p1, p2, e);
    }
    t1 = Date.now();
    eprint("isBetween3 takes " + (t1 - t0) + " µS");
    eprint(p0.isBetween3(p1, p2, e));   // should return false
}());
*/
