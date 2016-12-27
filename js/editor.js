function GF(x, y){
  LAST_OBJECT = new FloorElement({ position : {x:x, y:y}, animations: GAME_MODEL.floor.grassfloor.animations, friction : 0.5 })
  LAST_OBJECT.setAnimation("idle")
  LAST_OBJECT._origin = {x:x, y:y}
  add(FLOOR_ELEMENTS, GAME_MODEL.floor.grassfloor.positions)
}

function SF(x, y){
  LAST_OBJECT = new FloorElement({ position : {x:x, y:y}, animations: GAME_MODEL.floor.snowfloor.animations, friction: 0.8 })
  LAST_OBJECT.setAnimation("idle")
  LAST_OBJECT._origin = {x:x, y:y}
  add(FLOOR_ELEMENTS, GAME_MODEL.floor.snowfloor.positions)
}

function SM(x, y, limit){
  LAST_OBJECT = new Snowman({ position : {x:x, y:y}, limit: limit, animations: GAME_MODEL.enemies.snowman.animations })
  LAST_OBJECT.setAnimation("idleleft")
  LAST_OBJECT._origin = {x:x, y:y, limit: limit}
  add(ENEMIES, GAME_MODEL.enemies.snowman.positions)
}

function CAN(x, y, o){
  LAST_OBJECT = new Cannon({ position : {x:x, y:y}, orientation : o, animations: GAME_MODEL.enemies.cannon.animations })
  LAST_OBJECT.setAnimation(o === -1 ? "idleleft" : "idleright")
  LAST_OBJECT._origin = {x:x, y:y, orientation : o === -1 ? "left" : "right"}
  add(ENEMIES, GAME_MODEL.enemies.cannon.positions)
}

function B(x, y){
  LAST_OBJECT = new Bonus({ position : {x:x, y:y}, animations: GAME_MODEL.bonuses.parcel.animations })
  LAST_OBJECT.setAnimation("idle")
  LAST_OBJECT._origin = {x:x, y:y}
  add(BONUSES, GAME_MODEL.bonuses.parcel.positions)
}

function add(arr, positions, pos){
  LAST_POSITIONS = positions
  RENDERING_OBJECTS.push(LAST_OBJECT)
  arr.push(LAST_OBJECT)
  LAST_POSITIONS.push(LAST_OBJECT._origin)
}

LAST_OBJECT = null
LAST_POSITIONS = null
function U(){
  if(!!LAST_OBJECT){
    LAST_OBJECT.setAnimation(null)
    RENDERING_OBJECTS.splice(RENDERING_OBJECTS.indexOf(LAST_OBJECT),1)
    ENEMIES.splice(ENEMIES.indexOf(LAST_OBJECT),1)
    FLOOR_ELEMENTS.splice(FLOOR_ELEMENTS.indexOf(LAST_OBJECT),1)
    BONUSES.splice(BONUSES.indexOf(LAST_OBJECT),1)
    LAST_POSITIONS.splice(LAST_POSITIONS.indexOf(LAST_OBJECT._origin),1)
    LAST_POSITIONS = LAST_OBJECT = null
  }
}

function dump(){
  console.log("grassfloor", JSON.stringify(GAME_MODEL.floor.grassfloor.positions))
  console.log("snowfloor", JSON.stringify(GAME_MODEL.floor.snowfloor.positions))
  console.log("snowman", JSON.stringify(GAME_MODEL.enemies.snowman.positions))
  console.log("cannon", JSON.stringify(GAME_MODEL.enemies.cannon.positions))
  console.log("bonuses", JSON.stringify(GAME_MODEL.bonuses.parcel.positions))
}