
var serialPort 	= require('serialport'),
    port,
	SerialPort 	= serialPort.SerialPort;


module.exports = function(app, controller, db, io){
    io.on('connection', function(socket){
        socket.on('terminal:opened', function (callback) {
            serialPort.list(function (err, ports) {
                if(err) return callback({error : err});
        		callback({ok : true, data : {
            	    ports : ports,
            	    //bauds : [9600]
            	}});
        	});
        });
        //terminal:connect
        socket.on('terminal:connect', function (params, callback) {
            port = new SerialPort( params.port || '/dev/ttyUSB0', {
        	  	baudRate    : params.baud || 57600
        	});
        	port.on('open', function () {
        		callback({ok : true});
        	});
        	port.on('error', function (err) {
        	    err = err || true;
        		callback({error : err});
        	});
        	port.on('disconnect', function () {
        		socket.emit("terminal:say:disconnect");
        	});
        	port.on('close', function () {
        		socket.emit("terminal:say:close");
        	});
        	port.on("data", function(reply){
        		socket.emit("terminal:say:data", reply);
        	});
        });
        socket.on('terminal:send', function (params, callback) {
            if(!port) return callback({ok : false, msg : "port is disconnected"});
    
            params = new String(params, "binary");
            var buffer = new Buffer(params, "binary");
            
            port.write(buffer, function(err, num){
                if(err) return (callback && callback({error : err}));
          		callback && callback({ok : true, data : num});
          	});
        });
        
        socket.on('terminal:disconnect', function (callback) {
            port = null;
            callback({ok : true});
        });
    });
};

        