requirejs.config({
    // default
    baseUrl: 'js/vendor',
    paths: {
        app: '../app'  // where the application code lives
    }
});


// start of main app
define(
    function (require) {
        // use RequireJS to fetch constructors
        var JsConsole = require('app/console');
        var EchoBack = require('app/models/echo_back');

        // instantiate objects
        var console = new JsConsole();
        var model = new EchoBack();

        // set up the Console, attaching it to a DOM node (default is 80x25 size)
        console.setConsoleNode('div.console')
            .attachTextEnteredObserver(
                model.onTextEntered
//                function (e) {
//                    console.log("Text entered "+ e.enteredText);
//                }
            )
            .prompt();
    }
);

// start of main app
define(
    function (require) {
        // use RequireJS to fetch constructors
        var Sample = require('app/models/sample_pattern');

        var model1 = new Sample();
        var model2 = new Sample();

        console.log("Model1 X = " + model1.getX() + " P = " + model1.getP() + " Y = " + model1.getY());
        console.log("Model2 X = " + model2.getX() + " P = " + model2.getP() + " Y = " + model2.getY());
        model1.setX(10);
        model1.setY("purple");
        console.log("Model1 X = " + model1.getX() + " P = " + model1.getP() + " Y = " + model1.getY());
        console.log("Model2 X = " + model2.getX() + " P = " + model2.getP() + " Y = " + model2.getY());
        model2.setX("frog");
        model2.setY("green");
        model1.setP(-1);
        console.log("Model1 X = " + model1.getX() + " P = " + model1.getP() + " Y = " + model1.getY());
        console.log("Model2 X = " + model2.getX() + " P = " + model2.getP() + " Y = " + model2.getY());
        model2.setX("20");
        model2.setP("apple");
        console.log("Model1 X = " + model1.getX() + " P = " + model1.getP() + " Y = " + model1.getY());
        console.log("Model2 X = " + model2.getX() + " P = " + model2.getP() + " Y = " + model2.getY());
    }
);