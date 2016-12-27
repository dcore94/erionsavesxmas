function Bonus(model){
  Sprite.call(this, model, GAME_BACKGROUND_SVG)
  this.position.set(model.position.x, model.position.y)
}

Bonus.prototype = Object.create(Sprite.prototype)

Bonus.prototype.isFlying = function(){
  return false
}

Bonus.prototype.update = function(dt, camera){
  if(this.collected) return
  Sprite.prototype.update.call(this, dt, camera)
}

function initBonus(bonuses){
  var bonussprites = []
  for(var k in bonuses){
    var b = bonuses[k]
    let v = b.positions.map( 
      (pos)=>{ 
        var bonus = new Bonus({ type : k, animations : b.animations, position : pos}) 
        bonus.setAnimation("idle")
        return bonus
    })
    bonussprites = bonussprites.concat(v)
  }
  return bonussprites
}