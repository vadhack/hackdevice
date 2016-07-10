

    

var fs              = require('fs'),
    path            = require('path'),
    BLACKLIST_DIR   = ["img", "node_modules"];

module.exports = function(opt, cb){
	//{path, timeout}
    opt 			= opt || {};
    BLACKLIST_DIR 	= opt.blacklist || BLACKLIST_DIR;
    opt.timeout 	= opt.timeout || 8000;
    
    var nodes = [];
    listdir(opt.path, nodes);//"public/"+
    setTimeout(function () {
        cb(nodes);
    }, opt.timeout);

};

 
function processReq(_p, res) {

    if(_p == 1 || _p == "#") _p = "public";

    var resp = [];
    fs.readdir(_p, function(err, list) {
        if(err) return res.error(err);
        for (var i = list.length - 1; i >= 0; i--) {
            resp.push(processNode(_p, list[i]));
        }
        res.ok(resp);
    });
};
 
function processNode(_p, f) {

    var route = path.join(_p, f);
    var s = fs.statSync(route);
    return {
        "id": route,
        "text": f,
        "icon" : s.isDirectory() ? 'jstree-folder' : 'jstree-file',
        "state": {
            "opened"    : true,
            "disabled"  : false,
            "selected"  : false
        },
        "li_attr": {
            "base"      : route,
            "isLeaf"    : !s.isDirectory()
        },
        "children"      : s.isDirectory()
    };
};



///


function listdir (root, nodes) {
    fs.readdir(root, function(err, list) {
        if(err) return console.log(err);
        list.forEach(function (dir) {
            setupnode(nodes, root, dir);
        });
    });
};

function setupnode (nodes, root, dir) {
    var route   = path.join(root, dir);
    var s       = fs.statSync(route);
    var last    = nodes.length;
    if(s.isDirectory()){
        nodes[last] = getnode(s, route, dir);
        if(BLACKLIST_DIR.indexOf(dir) > -1) return;
        nodes[last].children = [];
        listdir(route, nodes[last].children);
    }else{
        nodes[last] = getnode(s, route, dir);
    }
};

function getnode (s, route, dir) {
    return {
        "id": route,
        "text": dir,
        "icon" : s.isDirectory() ? 'jstree-folder' : 'jstree-file',
        "state": {
            "opened"    : false,
            "disabled"  : false,
            "selected"  : false
        },
        "li_attr": {
            "base"      : route,
            "isLeaf"    : !s.isDirectory()
        },
        "children"      : s.isDirectory()
    };
};