function FloorElement(model){
  Sprite.call(this, model, GAME_BACKGROUND_SVG)
  this.position.set(model.position.x, model.position.y)
}

FloorElement.prototype = Object.create(Sprite.prototype)

FloorElement.prototype.isFlying = function(){
  return false
}

function initFloor(floorelements){
  var floorsprites = []
  for(var k in floorelements){
    var f = floorelements[k]
    let v = f.positions.map( 
      (pos)=>{ 
        var floor = new FloorElement({ type : k, animations : f.animations, position : pos, friction : f.friction}) 
        floor.setAnimation("idle")
        return floor
    })
    floorsprites = floorsprites.concat(v)
  }
  return floorsprites
}