function SpriteHelper(){
  var svgNS = "http://www.w3.org/2000/svg",
      xlinkNS = "http://www.w3.org/1999/xlink"
   
  this.setAnimation = function(sprite, animation){
    if(sprite.animation == animation ) return;
    sprite.animation = animation
    sprite.frame = 0
    sprite.frameoffset = 1
    if(!!animation){
      sprite.img.setAttributeNS(xlinkNS, "xlink:href", animation.image)
      sprite.img.setAttribute("width", animation.frames.length * animation.width)
      sprite.img.setAttribute("height", animation.height)
      sprite.svg.setAttribute("width", animation.width)
      sprite.svg.setAttribute("height", animation.height)
    } else {
      sprite.img.setAttributeNS(xlinkNS, "xlink:href", "")
      sprite.img.setAttribute("width", 0)
      sprite.img.setAttribute("height",0)
      sprite.svg.setAttribute("width", 0)
      sprite.svg.setAttribute("height", 0)
    }
    
  }
  
  this.play = function(gameobject){
    var sprite = gameobject.sprite
    if(sprite.animation == null) return;
    var a = sprite.animation
    if(a.play === "loop"){
      sprite.frame = (sprite.frame + sprite.frameoffset) % a.frames.length
    }else if(a.play === "pingpong"){
      if(sprite.frame === a.frames.length - 1) sprite.frameoffset = -1;
      else if(sprite.frame === 0 && sprite.frameoffset === -1 ) sprite.frameoffset = 1;
      sprite.frame += sprite.frameoffset
    }else if(a.play === "single") {
      if(sprite.frame < a.frames.length-1) sprite.frame += 1;
    }
    //scroll animation
    var newofs = - sprite.frame * sprite.animation.width
    sprite.img.setAttribute("x", newofs)
    //apply effect if any
    if(!!a.frames[sprite.frame].effect){ a.frames[sprite.frame].effect(gameobject)}
  }
  
  this.place = function(sprite, position){
    //console.log(position)
    if(sprite.animation == null) return;
    sprite.svg.setAttribute("x", position.x)
    sprite.svg.setAttribute("y", position.y - sprite.animation.height)
  }
   
  this.create = function(model, parent){
    var sprite = {}
    sprite.parent = parent
    sprite.svg = document.createElementNS(svgNS, "svg"),
    sprite.img = document.createElementNS(svgNS,'image')
    sprite.bbox = document.createElementNS(svgNS,'rect')
    sprite.svg.appendChild(sprite.img)
    sprite.bbox.setAttribute("fill", "none")
    sprite.bbox.setAttribute("stroke", "red")
    
    sprite.svg.setAttribute("x", -1000)
    sprite.svg.setAttribute("y", -1000)
    parent.appendChild(sprite.svg)
    parent.appendChild(sprite.bbox)
    
    return sprite
  }
}

var SPRITE_HELPER = new SpriteHelper()
var GRAVITY = new Vector2D(0,-.5)

function Sprite(model, parent){
  
  this.helper = SPRITE_HELPER
  this.sprite = this.helper.create(model, parent),
  this.model = model
  this.position = new Vector2D()
  this.prevposition = new Vector2D()
  this.velocity = new Vector2D()
  this.acceleration = new Vector2D()
  this.screenposition = new Vector2D()
  this.animationtime = 0
  this.animationspeedup = 0
  this.currentfloor = null
  this.scheduledanimation = null
  this.dead = false
}

Sprite.prototype.scheduleAnimation = function(anim){
  this.scheduledanimation = anim
}

Sprite.prototype.setAnimation = function(anim){
  this.helper.setAnimation(this.sprite, this.model.animations[anim])
  //console.log("current animation", anim)
}

Sprite.prototype.isVisible = function(camera){
  if(this.sprite.animation == null) return false
  return (this.position.x <= camera.getRight()) &&
         (this.position.x + this.sprite.animation.width >= camera.getLeft())
}

Sprite.prototype.isFlying = function(){
  return this.currentfloor == null
}

Sprite.prototype.update = function(dt, camera){
  this.physics(dt)
  this.animate(dt)
  this.render(camera)
}

Sprite.prototype.physics = function(dt){
  this.velocity.sum(this.acceleration)
  this.position.sum(this.velocity)
  this.acceleration.set()
  if(this.isFlying()){
    this.acceleration.sum(GRAVITY)
  }else{
    if(this.currentfloor) this.velocity.scale(this.currentfloor.model.friction);
  }
}

Sprite.prototype.animate = function(dt){
  if(!!this.scheduledanimation){
    this.setAnimation(this.scheduledanimation)
    this.scheduledanimation = null
    return
  }
  this.animationtime += dt
  if(this.sprite.frame === 0 || this.animationtime > 100 - this.animationspeedup){
    this.helper.play(this)
    this.animationtime = 0
  }
}

Sprite.prototype.render = function(camera){
  //console.log(this, this.position)
  this.screenposition = camera.worldToBackground(this.position)
  this.helper.place(this.sprite, this.screenposition)
  //this.showBB()
}

Sprite.prototype.land = function(floor){
  this.currentfloor = floor
  this.velocity.y = 0
  this.position.y = floor.position.y + floor.sprite.animation.height
}

Sprite.prototype.bounce = function(floor){
  if(this.velocity.magnitude() > 0){
    this.position.sub(this.velocity.normal().scale(1.1))  
  }
  this.velocity.set()
}

Sprite.prototype.showBB = function(){
  var objbb = COLLISION_DETECTOR.computeBB(this)
  let frame = this.sprite.animation.frames[this.sprite.frame]
  var pos = new Vector2D(this.position.x + frame.bbox[0], this.position.y + frame.bbox[3] - frame.bbox[1])
  pos = (this.sprite.parent == GAME_SVG ? CAMERA.worldToCamera(pos) : pos)
  pos = CAMERA.worldToBackground(pos)
  this.sprite.bbox.setAttribute("x", pos.x)
  this.sprite.bbox.setAttribute("y", pos.y)
  this.sprite.bbox.setAttribute("width", frame.bbox[2] - frame.bbox[0])
  this.sprite.bbox.setAttribute("height", frame.bbox[3] - frame.bbox[1])
}