 
var Pin     = require("../libs/gpio.js"),
    Email   = require("../libs/email.js");

var email   = new Email(),
    led     = new Pin(4, "out"),
    sensor  = new Pin(27, "in", 'both'),
    sirena  = new Pin(17, "out");

function monitor(value) {
    if(value == 0){
        sirena.write(1);
        var msg = "Alarma activada " + new Date().toISOString().substring(11, 19);
        email.send({
            emails  : ["valentin.arambulo@gmail.com"],
            body    : msg
        });
        console.log(msg);
    }else sirena.write(0);
};

led.toggle(700);
sensor.on("active", monitor);
console.log("Monitoreando alarma");
