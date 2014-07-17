/**
 * Console module (RequireJS)
 *
 * Simulate a text console window in a specified DOM node,
 * accepting text input and showing text output via method calls.
 *
 * @author Bill Herring <arcreekfish@gmail.com>
 *
 */
define(['jquery'],
    function ($) {
        "use strict";   // powered by ECMAScript 5...

        // static properties

        var that;  // that = this (must set in constructor)

        /**
         * Console module constructor
         *
         * @constructor
         */
        var Console = function () {
            if (!(this instanceof Console)) {  // ensure constructor called with new operator
                throw new TypeError("Constructor cannot be called as a function.");
            }

            /*
             * private members
             */

            var that = this;  // for private methods

            /**
             * Node that this Console is bound to
             * @type {jQuery}
             */
            var consoleNode;

            /**
             * Number of columns in the console
             * @type {number}
             */
            var consoleColumns = 80;

            /**
             * Number of rows in the console
             * @type {number}
             */
            var consoleRows = 25;

            /**
             * Width of the console in pixels
             * @type {number}
             */
            var consoleWidth;

            /**
             * Height of the console in pixels
             * @type {number}
             */
            var consoleHeight;

            /**
             * Current row active in the console, equal to the number of
             * rows output/entered so far.
             * @type {number}
             */
            var currentRow;

            /**
             * The prompt
             * @type {String}
             */
            var promptString = 'C:\\> ';

            /**
             * "Observer" callback for text entered.
             * @type {Function}
             */
            var textEnteredObserver;


            /*
             * private methods (unless exported as privileged)
             */

            /**
             * Return the node parameter if set, otherwise return
             * the console node.
             *
             * @param {jQuery|HTMLElement|String} node DOM node, jQuery selector string, or jQuery object
             * @returns {*}
             * @throws Error if neither node or console node is set
             */
            var getConsoleNode = function (node) {
                node = setDefault(node, consoleNode);
                if (!isSet(node))
                {
                    throw new Error('No node associated with Console: see setConsoleNode().');
                }
                return getJQueryNode(node);
            };

            /**
             * Overlay the console node with an array of console text input elements,
             * one per line.
             *
             * @param {jQuery|HTMLElement|String} node optional node to attach observer to (default is console node)
             * @returns {Console} fluent api
             */
            var initializeTextLines = function (node) {
                node = getConsoleNode(node);
                for (var row = 1 ; row <= consoleRows ; row++) {
                    addNewTextLine(row, node);
                }
                return that;
            };

            /**
             * Add a new console text line to the given node as the given row number.
             *
             * @param {number} row
             * @param {jQuery|HTMLElement|String} node DOM node, jQuery selector string, or jQuery object
             */
            var addNewTextLine = function (row, node) {
                node = getConsoleNode(node);
                // add line to the console node and adjust width
                var line = $('<input id="consoleLine'+row+'" class="console" value=""/>').appendTo(node);
                line.css('width', consoleWidth);
                // disable mouse clicks for all text lines (no mouse in the console world)
                line.mousedown(function () { return false; });
            };

            /**
             * Overlay the console node with an array of console text input elements,
             * one per line.
             *
             * @param {jQuery|HTMLElement|String} node DOM node, jQuery selector string, or jQuery object
             * @returns {Console} fluent api
             */
            var prompt = function (node) {
                node = getConsoleNode(node);

                var promptInputElem = getCurrentLine(node);
                promptInputElem.val(getPromptString()).focus();

                attachKeyPressObserver(
                    function (e) {
                        var val = promptInputElem.val();
                        var lineLength = val.length - getPromptString().length;
                        var keyCode = e.keyCode || e.which;
                        var startPos = promptInputElem[0].selectionStart;
                        if (isEnterKey(keyCode)) {
                            // disable current input line completely (when enter is pressed, no more input)
                            promptInputElem.keydown(function () { return false; });
                            // send entered text to observer
//todo create a custom event and either pass it to observer or, better, raise a custom jQuery event...
//todo the jQuery thing just lets you do global events, right?  The key is defining event as an object
//todo Might be cool to have an Event interface/root-class, that events could inherit from?
                            var event = {};
                            event.enteredText = val.substr(getPromptString().length);
                            notifyTextEntered(event);
                            // advance to the next line
                            nextLine();
//fixme - this is plain old broke - should only need to print prompt... right, then event calls this?
//fixme - are we leaking memory here?  Closure holding references or freed?
                            prompt();
                        }
                        if (isArrowKey(keyCode)) {
                            return false;  // no arrow keys in console land...
                        }
//fixme THIS has got to be buggy code - look at why we need to do this at all!
//fixme Look at the last if statement below - can it be changed to eliminate this code!!??
                        if (lineLength <= 0 && isAdditiveKey(keyCode)) {
                            return true;
                        }
                        if (startPos < getPromptString().length) {
                            // if the cursor ever manages to get inside the prompt, move it out!
                            // (shouldn't be an issue if mouse clicks and arrow keys are disabled)
                            promptInputElem[0].selectionStart = getPromptString().length;
                        }
                        ////console.log("Here is the value = '" + val + "' " + keyCode);
                        if (val.length < getPromptString().length + 1) {
                            // prevent backing up over the prompt
                            promptInputElem.val(val);
                            return false;
                        }
                        return true;
                    }
                    ,
                    promptInputElem
                );
                return that;
            };

            /**
             * Return the current console line element that the user
             * should be prompted in.
             *
             * @param {jQuery|HTMLElement|String} node DOM node, jQuery selector string, or jQuery object
             * @returns {jQuery}
             */
            var getCurrentLine = function(node) {
                node = getConsoleNode(node);
                if (typeof(currentRow) == "undefined" || currentRow < 1) {
                    currentRow = 1;
                }
                return node.children('#consoleLine'+currentRow).first();
            };

            /**
             * Advance to the next line, creating new ones as we go
             */
            var nextLine = function () {
                currentRow++;
                var topScreenRow = currentRow - 24;
                if (topScreenRow > 0) {
                    console.log("Adding row " + currentRow + " and removing " + topScreenRow);
                    // remove the top row as new one is entered
                    $("#consoleLine"+topScreenRow).remove();
                    // add the new line
                    addNewTextLine(currentRow);
                }
            };

            /**
             * Attach an observer that is notified on each key press.
             *
             * @param {function} observer
             * @param {jQuery|HTMLElement|String} node - node to attach observer to (default is console node)
             * @returns {void}
             */
            var attachKeyPressObserver = function (observer, node) {
                node.keydown(observer);
            };

            /**
             * Attach an observer that is notified each time a line of text
             * is input into the Console.
             *
             * @param {function} observer
             * @param {jQuery|HTMLElement|String} node optional node to attach observer to (default is console node)
             * @returns {Console} fluent api
             */
            var attachTextEnteredObserver = function (observer, node) {
                textEnteredObserver = observer;
                return that;
            };

            /**
             * Notify observer that text was entered.
             *
             * @param event
             */
            var notifyTextEntered = function (event) {
                textEnteredObserver(event, that);
            };

            /**
             * Set the console node to the given node (or jQuery
             * collection of nodes).
             *
             * @param {jQuery|HTMLElement|String} node DOM element, jQuery selector, or jQuery object
             * @returns {Console} fluent api
             */
            var setConsoleNode = function (node) {
                consoleNode = getJQueryNode(node);
                setConsoleSize(consoleColumns, consoleRows);
                initializeTextLines(node);
                return that;
            };

            /**
             * Set the size of the console
             *
             * @param cols number of columns
             * @param rows number of rows
             * @param {jQuery|HTMLElement|String} node optional node to set size of (default is console node)
             * @returns {Console} fluent api
             */
            var setConsoleSize = function (cols, rows, node) {
                if (!$.isNumeric(cols) || !$.isNumeric(rows)) {
                    throw new TypeError('Console columns and rows must be numeric.');
                }
                node = getConsoleNode(node);
                var charSize = getCharacterSize(node);
                consoleColumns = cols;
                consoleRows = rows;
                consoleWidth = charSize.width * consoleColumns + 1;
                consoleHeight = charSize.width * consoleRows + 1;
                node.css('width', consoleWidth + 'px');
                node.css('height', consoleHeight + 'px');
                return that;
            };

            /**
             * Set the prompt.
             *
             * @param {String} prompt
             * @returns {Console} fluent api
             */
            var setPromptString = function (prompt) {
                promptString = prompt;
                return that;
            };


            var getPromptString = function () {
                return promptString;
            };

            /**
             * Writes text, creating multiple lines as needed
             * when there are CR/LF in the text.
             *
             * @param {String} text
             * @returns {void}
             */
            var textReceived = function (text) {
                if (isSet(text) && text !== "")
                {
                    var textLines = text.split(/\r\n|\r|\n/g);
                    for (var i = 0; i < textLines.length; i++) {
                        var textLine = textLines[i];
                        nextLine();
                        var currentLine = getCurrentLine();
                        currentLine.val(textLine);
                    }
                }
            };


            /*
             * export privileged methods
             */

            this.setConsoleNode = setConsoleNode;
            this.setConsoleSize =  setConsoleSize;
            this.setPromptString = setPromptString;
            this.initializeTextLines =initializeTextLines;
            this.prompt = prompt;
            this.textReceived = textReceived;
            this.attachTextEnteredObserver = attachTextEnteredObserver;
            this.attachKeyPressObserver = attachKeyPressObserver;
        };


        /*
         * private static methods
         */

        /**
         * Return true if the variable parameter is not undefined or null.
         *
         * @param variable
         * @returns {boolean}
         */
        var isSet = function (variable) {
            return (typeof(variable) != "undefined" && variable !== null);
        };

        /**
         * Return the value if it is set, otherwise return
         * the default value if it is set, otherwise return undefined.
         *
         * @param value the value
         * @param defaultValue the default value
         * @returns {*}
         */
        var setDefault = function (value, defaultValue) {
            if (!isSet(value))
            {
                if (isSet(defaultValue)) {
                    return  defaultValue;
                } else {
                    return undefined;
                }
            }
            return value;
        };

        /**
         * Return jQuery object (collection of nodes) given either a
         * valid jQuery selector, a DOM element, or a jQuery object.
         *
         * @param {jQuery|HTMLElement|String} node DOM node, jQuery selector string, or jQuery object
         * @returns {jQuery};
         */
        var getJQueryNode = function (node) {
            var jq;
            if (typeof(node) === 'string' || node instanceof HTMLElement) {
                jq = $(node);
            } else if (!(node instanceof jQuery)) {
                throw new TypeError('Console node must be either jQuery object, DOM element, or selector string.');
            } else {
                jq = node;
            }
            if (jq.size() == 0) {
                throw new Error('Console node not valid jQuery object or selector.');
            }
            return jq;
        };

        /**
         * Return dimensions (width, height) of a text character in
         * the given node.
         *
         * @param {jQuery|HTMLElement|String} node optional node to get char size for (default is console node)
         * @returns {Object} {width, height} in pixels
         */
        var getCharacterSize = function (node) {
            // add a span with &nbsp; in it and measure the dimensions of the span
            // note that &nbsp; is can't be in an innerHTML assignment in most browsers, so &#160; is used
            node.append('<div id="testcharsize"><span>&#160;</span></div>');
            var spanNode = $('#testcharsize span');
            var w = spanNode.width();
            var h = spanNode.height();
            // discard the test div
            $('#testcharsize').remove();
            // return width and height as object literal
            return { width: w, height: h };
        };

        var isAdditiveKey = function (keyCode) {
            return (keyCode != 8);
        };

        var isArrowKey = function (keyCode) {
            return (keyCode >= 37 && keyCode <= 40);
        };

        var isEnterKey = function (keyCode) {
            return (keyCode == 13);
        };

        // return constructor
        return Console;
    });


