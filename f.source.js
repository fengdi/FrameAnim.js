;(function(host){

var mix = function(o, f){
    for(var k in f){
        o[k] = f[k];
    }
    return o;
};

var Frame = function(arg){
    this.data = [
        arguments[0]>>0,
        arguments[1]>>0,
        arguments[2]>>0
    ];
};
mix(Frame.prototype, {
    x : function(x) {
        if(arguments.length){
            this.data[0] = x;
        }else{
            return this.data[0];
        }
    },
    y : function(y) {
        if(arguments.length){
            this.data[1] = y;
        }else{
            return this.data[1];
        }
    },
    time : function(time) {
        if(arguments.length){
            this.data[2] = time;
        }else{
            return this.data[2];
        }
    }
});

var FrameAnim = function(elem, options){
    this.data = [];
    this.index = 0;
    this.elem = elem;
    this.status = "stoped";
    this.tid = null;
    this.settings = mix({
        image:"",
        width:0,
        height:0,
        speed:100,
        frames:1,
        startFrame:0,
        position:"x",
        loop:0
    }, options || {});
    this.events = [];
    this.direction = 1;
    this.loop = this.settings.loop>>0;
    this.init();
};

FrameAnim.prototype.init = function(f){
    var s = this.settings;
    if(s.image){
        this.elem.style.backgroundImage = 'url(' + s.image + ')';
        this.elem.style.backgroundRepeat = "no-repeat";
        this.elem.style.backgroundPosition = "0 0";
    }
    
    // if(s.width){
    //     this.elem.style.width = s.width+"px";
    // }
    // if(s.height){
    //     this.elem.style.height = s.height+"px";
    // }
    if(f){
        this.data = [];
    }
    if(({}.toString).call(s.frames)=="[object Number]"){
        if(s.position == "x"){
            for (var i = s.startFrame; i < s.frames; i++) {
                this.data.push(
                        new Frame(-(s.width * i), 0, s.speed)
                    );
            };
        }else if(s.position == "y"){
            for (var i = s.startFrame; i < s.frames; i++) {
                this.data.push(
                        new Frame(0, -(s.height * i), s.speed)
                    );
            };
        }
    }
};
mix(FrameAnim.prototype, {
    applyStyle : function(index){
        var self = this;
        var z = self.getFrame(index);
        self.elem.style.backgroundPosition = ""+ z.x() +"px "+ z.y() +"px";
    },
    getFrame : function(index){
        return this.data[index];
    },
    action : function(index, callback){
        var self = this;
        self.applyStyle(index);

        var z = self.getFrame(index);

        if(self.tid){
            clearTimeout(self.tid);
            self.tid = null;
        }
        self.tid = setTimeout(function(){
            callback.call(self);
        }, z.time());
    },
    onStatus : function(x){
        if(({}.toString).call(x)=="[object Function]"){
            this.events.push(x);
        }else{
            this.status = x;
            for (var i = 0; i < this.events.length; i++) {
                this.events[i].call(this, this.status);
            }
        }
    },
    running : function(index, direction){

        var self = this;

        self.direction = (direction==1||direction==-1) ? direction : self.direction;

        self.index = ({}.toString).call(index)=="[object Number]" ? index : self.index;

        self.index = (self.settings.frames * Math.abs(Math.floor(self.index/self.settings.frames))  
                + self.index) % self.settings.frames;

        if(self.index == (self.direction==1 ? self.settings.frames - 1 :  0)){
            
            if(self.loop!=0){
                self.loop--;
            }else{
                self.stop();
                return;
            }
        }
        
        self.action(self.index, function(){
            if(self.loop!=0){
                self.index = (self.index + self.direction) % self.settings.frames;
                self.running(self.index, self.direction);
            }else{
                self.stop();
            }

        });
    },
    start:function(index, direction, loop){
        this.loop = loop || this.settings.loop>>0;
        this.onStatus("running");
        this.running(index, direction);
    },
    stop : function(){
        this.onStatus("stoped");
        clearTimeout(this.tid);
    }
    // ,pause : function(){
    //     this.onStatus("stoped");
    //     clearTimeout(this.tid);
    // }
    // ,resume : function(){
    //     this.onStatus("running");
    //     this.running(index, direction);
    // }
});

host.FrameAnim = FrameAnim;

})(this);