function Hero(model){
  Sprite.call(this, model, GAME_SVG)  
  this.position.set(model.position[0], model.position[1])
  this.frozen = false
  this.ghost = false
  this.sprite.icecube = document.createElementNS("http://www.w3.org/2000/svg",'rect')
  this.sprite.icecube.setAttribute("fill", "none")
  this.sprite.icecube.setAttribute("stroke", "none")
  this.sprite.icecube.setAttribute("rx", 20)
  this.sprite.icecube.setAttribute("width", 128)
  this.sprite.icecube.setAttribute("height", 128)
  this.sprite.svg.appendChild(this.sprite.icecube)

  this.behaviourFSM = {
    "idleright" : {
      enter : function(h){ h.animationspeedup = 0; h.scheduleAnimation("idleright") },
      transitions : {
        "left" : "idleleft",
        "right" : "runright",
        "up" : "jumpright",
        "none" : ""
      }
    },
    "idleleft" : {
      enter : function(h){ h.animationspeedup = 0; h.scheduleAnimation("idleleft") },
      transitions : {
        "left" : "runleft",
        "right" : "idleright",
        "up" : "jumpleft",
        "none" : ""
      }
    },
    "runright" : {
      enter : function(h){ h.animationspeedup = 0; h.scheduleAnimation("runright") },
      during : function(h){ 
        if(h.frozen) return;
        h.animationspeedup += (h.animationspeedup === 50 ? 0 : 1);
        h.acceleration.x = 1 
        h.velocity.x = Math.min(h.maxrunspeed, h.velocity.x) 
      },
      transitions : {
        "left" : "idleleft",
        "up" : "jumpright",
        "none" : "idleright"
      }
    },
    "runleft" : {
      enter : function(h){ h.animationspeedup = 0; h.scheduleAnimation("runleft") },
      during : function(h){ 
        if(h.frozen) return;
        h.animationspeedup += (h.animationspeedup === 50 ? 0 : 1); 
        h.acceleration.x = -1
        h.velocity.x = Math.max(-h.maxrunspeed, h.velocity.x); 
      },
      transitions : {
        "right" : "idleright",
        "up" : "jumpleft",
        "none" : "idleleft"
      }
    },
    "jumpright" : {
      enter : function(h){ 
        h.animationspeedup = 50;
        h.position.sum(new Vector2D(0,5));
        h.acceleration.set(2,20);
        h.floor = null 
        h.scheduleAnimation("jumpright");  
      },
      during : function(h){ 
        if(h.frozen) return;
        h.velocity.y = Math.min(h.maxjumpspeed, h.velocity.y); 
      },
      transitions : {
        "land" : "idleright"
      }
    },
    "jumpleft" : {
      enter : function(h){
        h.animationspeedup = 50; 
        h.position.sum(new Vector2D(0,15)); 
        h.acceleration.set(-2,20);
        h.currentfloor = null
        h.scheduleAnimation("jumpleft") 
      },
      during : function(h){ 
        if(h.frozen) return;
        h.velocity.y = Math.min(h.maxjumpspeed, h.velocity.y); 
      },
      transitions : {
        "land" : "idleleft"
      }
    }
  }

}

Hero.prototype = Object.create(Sprite.prototype)

function initHero(model){
  var hero = new Hero(model)
  hero.setAnimation("idleright")
  hero.maxwalkspeed = 2
  hero.maxrunspeed = 4
  hero.maxjumpspeed = 10
  hero.pushigright = false
  hero.pushingleft = false
  hero.pushingup = false
  
  hero.currentstate = hero.behaviourFSM.idleright
  hero.currentstate.enter(hero)
    
  return hero
}

Hero.prototype.transition = function(event){
  //console.log("transition to", event)
  if(this.currentstate.transitions[event]){
    if(this.currentstate["leave"]) this.currentstate.leave(this);
    //console.log("currentstate: ", this.currentstate.transitions[event])
    this.currentstate = this.behaviourFSM[this.currentstate.transitions[event]]
    if(this.currentstate["enter"]) this.currentstate.enter(this);
  }
}

Hero.prototype.defaultTransition = function(){
  if(this.pushingup){
    this.transition("up")
  } else if(this.pushingright){
    this.transition("right")
  }else if(this.pushingleft){
    this.transition("left")
  } else {
    this.transition("none")
  }
}

Sprite.prototype.physics = function(dt){
  this.velocity.sum(this.acceleration)
  this.position.sum(this.velocity)
  this.acceleration.set()
  if(this.isFlying()){
    this.acceleration.sum(GRAVITY)
  }else{
    if(this.currentfloor && !this.pushingright && !this.pushingleft) 
      this.velocity.scale(this.currentfloor.model.friction);
  }
}

Hero.prototype.update = function(dt, camera){
  if(this.currentstate["during"]) this.currentstate.during(this)
  this.physics(dt)
  if(!this.frozen) this.animate(dt);
  this.render(camera)
  if(this.position.y < -128) this.dead = true;
}

Hero.prototype.render = function(camera){
  this.screenposition = camera.worldToCamera(this.position)
  this.helper.place(this.sprite, camera.worldToBackground(this.screenposition))
  //this.showBB()
}

Hero.prototype.land = function(floor){
  Sprite.prototype.land.call(this, floor)
  this.transition("land")
  this.defaultTransition()
}

Hero.prototype.freeze = function(){
  if(this.frozen) return;
  this.frozen = true
  this.ghost = true
  var h = this
  window.setTimeout(()=>{ h.unfreeze() }, 5000)
  this.sprite.icecube.setAttribute("fill", "url(#ice)")
  this.sprite.icecube.setAttribute("stroke", "blue")
}

Hero.prototype.unfreeze = function(){
  this.sprite.icecube.setAttribute("fill", "none")
  this.sprite.icecube.setAttribute("stroke", "none")
  this.frozen = false
  var h = this
  window.setTimeout(()=>{ h.ghost = false }, 3000)
}

Hero.prototype.pushRight = function(){
  if(this.frozen) return;
  this.pushingright = true
  this.transition("right")
}

Hero.prototype.pushLeft = function(){
  if(this.frozen) return;
  this.pushingleft = true
  this.transition("left")
}

Hero.prototype.pushUp = function(){
  if(this.frozen) return;
  this.pushingup = true
  this.transition("up")
}

Hero.prototype.releaseRight = function(){
  this.pushingright = false
  this.defaultTransition()
}

Hero.prototype.releaseLeft = function(){
  this.pushingleft = false
  this.defaultTransition()
}

Hero.prototype.releaseUp = function(){
  this.pushingup = false
  this.defaultTransition()
}