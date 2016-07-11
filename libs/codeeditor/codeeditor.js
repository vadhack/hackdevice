


var filesystem      = require("../../libs/filesystem.js"),
    child_process   = require('child_process'),
    __exec 		    = child_process.exec,
    __spawn         = child_process.spawn,
    //child,
    DIR_PUBLIC      = "workspace",
    isWin           = /^win/.test(process.platform),
    sudo            = require("sudo"),
    childs, cprocesses,
    Procesess       = require("./child_processes.js"),
    fse             = require("fs-extra");


module.exports = function(app, controller, db, io){
    
    cprocesses = new Procesess();
    
    io.on('connection', function(socket){
        socket.on('codeeditor:getfiles', function (params, callback) {
            filesystem({
                path    : params.path,
                timeout : 2000
            }, function (nodes) {
                callback(nodes);
            });
        });

        socket.on('codeeditor:getfile', function (params, callback) {
            fse.readFile(params.url, function (err, content) {
                if(err) return callback({ error : err });
                callback({ ok : true, file : content.toString() });
            });
        });

        socket.on('codeeditor:savefile', function (params, callback) {
            //{url, file}
            if(!params.file) return callback({ error : true, msg : "No existe contenido" });
            fse.writeFile(params.url, params.file,function (err) {
                if(err) return callback({ error : err });
                callback({ ok : true });
            });
        });
        
        socket.on("code:createfile", function(params, callback){
            //{url}
            if(!params.url) return callback({ error : true, msg : "No existe URL" });
            params.file = params.file || "";
            writeFile(params.url, params.file, function (err, msg) {
                if(err){
                    if(msg) return callback({ ok : false, msg : msg });
                    return callback({ error : err, msg : msg });
                }
                callback({ ok : true });
            });
        });
    
        socket.on("code:createdir", function(params, callback){
            //{url}
            if(!params.url) return callback({ error : true, msg : "No existe URL" });
            fse.ensureDir(params.url, function (err) {
                if(err) return callback({ error : err });
                callback({ ok : true });
            });
        });
        
        socket.on("code:removedir", function(params, callback){
            //{url}
            if(!params.url) return callback({ error : true, msg : "No existe URL" });
            fse.remove(params.url, function (err) {
                if(err) return callback({ error : err });
                callback({ ok : true });
            });
        });
       
        socket.on("code:rename", function(params, callback){
            //{url}
            if(!params.new) return callback({ error : true, msg : "No existe nuevo path" });
            if(!params.old) return callback({ error : true, msg : "No existe path a renombrar" });
            fse.rename(params.old, params.new, function (err) {
                if(err) return callback({ error : err });
                callback({ ok : true });
            });
        });
        
        
        //cmd
        
        socket.on("code:cmd", function(params, callback){
            //{cmd, filename}
        	
        	var child;
            
            if(!cprocesses.exist(params.filename)){
                child = __exec(params.cmd,{
            	    cwd     : process.cwd() + "/"+DIR_PUBLIC+"/",
            	    detached: false
            	});
                child = cprocesses.child(params.filename, child);
            }else {
                return callback({ok : false, msg : "process exist"});
            }
        	
        	child.stdout.on('data', function(data) {
                socket.emit("code:cmd:child:stdout", {
                    ok      : true,
                    data    : data,
                    filename: child.name
                });
            });
            child.stderr.on('data', function(data) {
                socket.emit("code:cmd:child:stderr", {
                    ok      : false,
                    data    : data,
                    filename: child.name
                });
            });
            child.on('error', function(error) {
                socket.emit("code:cmd:child:error", {
                    error   : error,
                    ok      : false,
                    filename: child.name
                });
            });
            child.on('close', function(code) {
                socket.emit("code:cmd:child:close", {
                    ok      : true,
                    data    : "closed. code: " + code,
                    filename: child.name
                });
                cprocesses.kill(child.name);
            });
        });
        
        socket.on("code:cmd:child:kill", function(params, callback){
            //{name}
            cprocesses.kill(params.name);
            callback({ok : true, name : params.name});
        });
        
        socket.on("code:cmd:child:killall", function(callback){
            //{name}
            cprocesses.killall();
            callback({ok : true});
        });
        
        socket.on("code:cmd:run", function(params, callback){
            //{cmd, filename}
            
            var child, 
                sudo = (!isWin)? "sudo " : "";
            
            if(!cprocesses.exist(params.filename)){
                child = makeSpawn(params);
                child = cprocesses.child(params.filename, child);
            }else {
                return callback({ok : false, msg : "process exist"});
            }
            
        	child.stdout.on('data', function(data) {
                socket.emit("code:cmd:child:stdout", {
                    ok      : true,
                    data    : data.toString(),
                    filename: child.name
                });
            });
            child.on('message', function(data) {
                socket.emit("code:cmd:child:stdout", {
                    ok      : true,
                    data    : data.toString(),
                    filename: child.name
                });
            });
            child.stderr.on('data', function(data) {
                socket.emit("code:cmd:child:stderr", {
                    ok      : false,
                    data    : data.toString(),
                    filename: child.name
                });
            });
            child.on('error', function(error) {
                socket.emit("code:cmd:child:error", {
                    error   : error.toString(),
                    ok      : false,
                    filename: child.name
                });
            });
            child.on('close', function(code) {
                socket.emit("code:cmd:child:close", {
                    ok      : true,
                    data    : "closed. code: " + code,
                    filename: child.name
                });
                cprocesses.kill(child.name);
            });
        });
        
        
    });


};

function makeSpawn(params){
    if(isWin){
        return __spawn(params.cmd, [process.cwd() + "/"+DIR_PUBLIC+"/" + params.filename]);
    }else{
        var options = {
            cachePassword   : true,
            prompt          : 'Password? ',
            spawnOptions    : { /* other options for spawn */ }
        };
        return sudo([ params.cmd,  process.cwd() + "/"+DIR_PUBLIC+"/" + params.filename], options);
    }
};

function writeFile (dir, content, cb) {
    fse.stat(dir, function (err, d) {
        if(err){//si existe error el archivo no existe y sera creado
            content = content || "";
            return fse.writeFile(dir, content, function($err){
                cb && cb($err);
            });
        }else{
            cb && cb(true, "File exist");
        }
    });
};
