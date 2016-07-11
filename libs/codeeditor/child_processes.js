

var Processes = module.exports = function(){
    this.childs = {};
};

Processes.prototype.add = function(name, child){
    if(child){
        this.childs[name] = child;
        this.childs[name].name = name;
    }
};

Processes.prototype.kill = function(name, pro){
    var child = this.childs[name];
    if(child){
        //child.kill();
        pro.kill(-child.pid);
        delete this.childs[name];
    }
};

Processes.prototype.killall = function(){
    for(var name in this.childs){
        var child = this.childs[name];
        if(child){
            child.kill();
        }
    }
    this.childs = {};
};

Processes.prototype.child = function(name, child){
    if(child){
        this.childs[name] = child;
        this.childs[name].name = name;
    }else{
        child = this.childs[name];
    }
    return child;
};

Processes.prototype.exist = function(name){
    var child = this.childs[name];
    if(child)return true
    return false;
};

Processes.prototype.remove = function(name){
    var $child = this.childs[name];
    if($child) delete this.childs[name];
};
