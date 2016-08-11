

    

var fs              = require('fs'),
    path            = require('path'),
    BLACKLIST_DIR   = ["img", "node_modules"];

module.exports = function(opt, cb){
	//{path, timeout}
    opt 			= opt || {};
    BLACKLIST_DIR 	= opt.blacklist || BLACKLIST_DIR;
    opt.timeout 	= opt.timeout || 8000;
    
    var nodes = [];
    listdir(opt.path, nodes);//"workspace/"+
    cb(nodes);
};

function listdir (root, nodes) {
    try{
        var list = fs.readdirSync(root);
        list.forEach(function (dir) {
            setupnode(nodes, root, dir);
        });
    }catch(err){
        return console.error(err);
    }
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