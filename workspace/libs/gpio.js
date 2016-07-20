
var Gpio = require('onoff').Gpio;

var Pin = module.exports = function(num, direction, edge){
    var self = this;
    
    this.pin            = new Gpio(num, direction, edge);
    this.toggle_timer   = null;
    this.event          = {};
    
    if(direction == "in"){
        this.pin.watch(function (err, value) {
            if (err) return self.fire("error", err);
            self.fire("active", value);
            self.fire("press", value);
        });
    }
};

Pin.prototype.fire = function(name, p1, p2){
    this.event[name] && this.event[name](p1, p2);
};

Pin.prototype.write = function (value) {
    this.pin.writeSync(value); 
};

Pin.prototype.read = function () {
    return this.pin.readSync(); 
};

Pin.prototype.toggle = function(ms, cb){
    
    if(this.toggle_timer) return;
    
    ms = ms || 500;
    var self = this;
    
    self.toggle_timer = setInterval(function () {
        var value = self.pin.readSync();
      	self.pin.writeSync(value ^ 1); 
      	cb && cb(value);
    }, ms);
    
    return {
        off : function(){
            clearInterval(self.toggle_timer);
            self.toggle_timer = null;
        }
    };
};

Pin.prototype.on = function (name, cb) {
    this.event[name] = cb; 
};

Pin.prototype.off = function() {
    if(this.toggle_timer) clearInterval(this.toggle_timer);
    this.toggle_timer = null;
    this.write(0);
};