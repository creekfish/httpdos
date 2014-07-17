/**
 * MS DOS Emulator Model Module (RequireJS)
 *
 * Console observer that emulates some simple MS DOS commands and
 * simulates a limited file system.
 *
 * @author Bill Herring <arcreekfish@gmail.com>
 *
 */
define(['jquery'],
    function ($) {
        "use strict";   // powered by ECMAScript 5...

        // private static members
        var x;

        var MsDosEmulator = function () {
            if (!(this instanceof MsDosEmulator)) {  // ensure constructor called with new operator
                throw new TypeError("Constructor cannot be called as a function.");
            }

            // private members
            var that = this;  // "this" for private methods
            var p = 2;

            // public members
            this.x = 'init';

            // private methods
            var privateCall = function () {
                return "private " + that.x;  // must use that for this here...
            };

            // privileged methods
            this.setP = function (val) {
                p = val;  // access to private members
            };

            this.getP = function () {
                // can access private methods too...
                return p;
            };

            // public methods, not on prototype. Can be defined here or as closure.
            this.setX = setX;
            this.getX = getX;
            this.setY = setY;
            this.getY = getY;
        };

        // public static members
        MsDosEmulator.Y = "yellow";

        // public static methods
        MsDosEmulator.staticCall = function () {

        };

        // private static methods (unless exposed by assignment in constructor)
        var setStaticX = function (val) {
            x = val;
        };

        var getStaticX = function () {
            return x;
        };

        var setX = function (val) {
            this.x = val;
        };

        var getX = function () {
            return this.x;
        };

        var setY = function (val) {
            this.Y = val;
        };

        var getY = function () {
            return this.Y;
        };


        // public methods

        MsDosEmulator.prototype.setZ = function (val) {

        };

        MsDosEmulator.prototype.getZ = function (val) {

        };

        /**
         * Return true if the variable parameter is not undefined or null.
         *
         * @param {Event} event
         * @param {Console} console
         * @returns {void}
         */
        var onTextEntered = function (event, console) {
            console.textReceived(event.enteredText);
        };

        return MsDosEmulator;
    });


