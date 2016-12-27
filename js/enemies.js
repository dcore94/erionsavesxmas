// SNOWMAN
function Snowman(model){
  Sprite.call(this, model, GAME_BACKGROUND_SVG)
  this.position.set(model.position.x, model.position.y)
  this.origin = new Vector2D(model.position.x, model.position.y)
  this.animationspeedup = 80
  this.limit = !!model.limit ? model.limit : 200
  this.direction = -1
}

Snowman.prototype = Object.create(Sprite.prototype)
Snowman.prototype.update = function(dt, camera){
  if(this.direction === -1 && (this.position.x <= this.origin.x - this.limit)){
    this.scheduleAnimation("idleright")
    this.direction = 1
  } else if(this.direction === 1 && (this.position.x >= this.origin.x + this.limit)){
    this.scheduleAnimation("idleleft")
    this.direction = -1
  }
  
  this.position.x += this.direction * 1
  this.position.y = this.sprite.frame === 10 ? this.origin.y + 3 : this.position.y
  this.position.y = this.sprite.frame === 20 ? this.origin.y : this.position.y
  
  Sprite.prototype.update.call(this, dt, camera)
}

Snowman.prototype.physics = function(dt){
  return
}

Snowman.prototype.bounce = function(dt){
  return
}

//SNOWBALL
function Snowball(model){
  Sprite.call(this, model, GAME_BACKGROUND_SVG)
  this.exploding = false
}

Snowball.prototype = Object.create(Sprite.prototype)
Snowball.prototype.update = function(dt, camera){
  if(this.exploding && this.sprite.frame === this.sprite.animation.frames.length-1){
    this.dead = true
    this.setAnimation(null)
  }else{
    Sprite.prototype.update.call(this, dt, camera); 
  }
}

Snowball.prototype.bounce = function(floor){
  this.velocity.set()
  this.setAnimation("explode")
  this.exploding = true
}

Snowball.prototype.land = function(floor){
  this.velocity.set()
  this.setAnimation("explode")
  this.exploding = true
}

//CANNON
function Cannon(model){
  Sprite.call(this, model, GAME_BACKGROUND_SVG)
  this.position.set(model.position.x, model.position.y)
  this.animationspeedup = 10
  this.orientation = model.orientation
  this.shot = false
}

Cannon.prototype = Object.create(Sprite.prototype)
Cannon.prototype.update = function(dt, camera){
  Sprite.prototype.update.call(this, dt, camera)
  if(this.sprite.frame === 25 && !this.shot) this.shoot()
  if(this.sprite.frame === 26) this.shot = false
}

Cannon.prototype.physics = function(dt){
  return
}

Cannon.prototype.shoot = function(){
  var sb = new Snowball(GAME_MODEL.missiles["snowball"])
  sb.position.set(this.position.x + this.orientation * 25, this.position.y + 5)
  sb.acceleration.sum(new Vector2D(this.orientation * 6, 6))
  sb.setAnimation("idle")
  this.shot = true
  RENDERING_OBJECTS.push(sb)
  ENEMIES.push(sb)
}

//init
function initEnemies(enemies){
  var enemysprites = []
  for(var k in enemies){
    var e = enemies[k]
    let v = e.positions.map( 
      (pos)=>{ 
        let enemy = null
        if(k === "cannon"){
          enemy = new Cannon({ position: pos, animations : e.animations, orientation : pos.orientation === "left" ? -1 : 1})
          enemy.setAnimation(pos.orientation === "left" ? "idleleft" : "idleright")
        }else if(k === "snowman"){
          enemy = new Snowman({ position: pos, animations : e.animations})
          enemy.setAnimation("idleleft")
          
        }
        return enemy
    })
    enemysprites = enemysprites.concat(v)
  }
  return enemysprites
}