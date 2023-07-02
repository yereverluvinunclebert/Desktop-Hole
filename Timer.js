////////////////////////////////////////// Timer /////////////////////////////////////////
/*
function Timer() {  // constructor
    this._ticking = false;
    this.interval = 86400;
    this.intervalID = null;
    this.onTimerFired = null;
}

Timer.prototype.reset = function () {
    if (this._ticking) {
        clearInterval(this.intervalID);
        this.intervalID = setInterval(this.onTimerFired, 1000 * this.interval);
    }
};

Object.defineProperties(Timer.prototype, {
    ticking: {
        get: function () {
            return this._ticking;
        },
        set: function (v) {
            if (!this._ticking && v) {
                this._ticking = true;
                this.intervalID = setInterval(this.onTimerFired, 1000 * this.interval);
            } else if (this._ticking && !v) {
                this._ticking = false;
                clearInterval(this.intervalID);
            }
        }
    }
});
*/
//////////////////////////////////////// End Timer ///////////////////////////////////////

////////////////////////////////////////// Timer /////////////////////////////////////////

class Timer {

    constructor() {
        this._ticking = false;
        this.interval = 86400;
        this.intervalID = null;
        this.onTimerFired = null;
    }

    reset() {
        if (this._ticking) {
            clearInterval(this.intervalID);
            this.intervalID = setInterval(this.onTimerFired, 1000 * this.interval);
        }
    }

    get ticking() {
        return this._ticking;
    }

    set ticking(v) {
        if (!this._ticking && v) {
            this._ticking = true;
            this.intervalID = setInterval(this.onTimerFired, 1000 * this.interval);
        } else if (this._ticking && !v) {
            this._ticking = false;
            clearInterval(this.intervalID);
        }
    }
}

export {Timer};

//////////////////////////////////////// End Timer ///////////////////////////////////////
