/**
 * EchoBack Model Module (RequireJS)
 *
 * Simple Console observer that echoes back terminal input lines.
 *
 * @author Bill Herring <arcreekfish@gmail.com>
 *
 */
define(['jquery'],
    function ($) {
        "use strict";   // powered by ECMAScript 5...

        var EchoBack = function () {
            if (!(this instanceof EchoBack)) {  // ensure constructor called with new operator
                throw new TypeError("Constructor cannot be called as a function.");
            }

            // public methods
            this.onTextEntered = onTextEntered;
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

        return EchoBack;
    });


