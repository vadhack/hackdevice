
var express 	= require('express'),
    bodyParser 	= require('body-parser'),
	app 		= express(),
    codeEditor  = require("./libs/codeeditor/codeeditor.js"),
    terminal    = require("./libs/terminal/terminal.js"),
    socket_io   = require("socket.io")
    ;

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json());


var server = app.listen(3333, function () {
    console.log('server listening at http://localhost:%s', server.address().port);
    new codeEditor(app, null, null, io);
    new terminal(app, null, null, io);
}),
io = new socket_io(server);


app.use(express.static('public'));
