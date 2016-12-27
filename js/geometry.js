function Vector2D(x,y){
  
  if(x instanceof Vector2D ){
    this.x = x.x
    this.y = x.y
  } else {
    this.x = (x != null || x != undefined) ? Number(x) : 0
    this.y = (y != null || y != undefined) ? Number(y) : 0 
  }
  
  this.scale = function(fact){
    this.x *= fact
    this.y *= fact
    return this
  }
  
  this.sum = function(v){
    this.x += v.x
    this.y += v.y
    return this
  }
  
  this.sub = function(v){
    this.x -= v.x
    this.y -= v.y
    return this
  }
  
  this.set = function(x, y){
    var clampx = (x != null || x != undefined) ? x : 0
    var clampy = (y != null || y != undefined) ? y : clampx
    this.x = clampx
    this.y = clampy
    return this
  }
  
  this.magnitude = function(){
    return Math.sqrt(this.x * this.x + this.y * this.y)
  }
  
  this.normal = function(){
    var mag = this.magnitude()
    if(mag === 0) throw "Cannot compute normal of 0 vector";
    return new Vector2D(this.x / mag, this.y / mag)
  }
  
  this.inverse = function(){
    return this.scale(-1)
  }
  
  this.dot = function(v){
    var dx = this.x * v.x,
        dy = this.y * v.y
    return dx + dy
  }
}