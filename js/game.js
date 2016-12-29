var CAMERA = null,
  HERO = null,
  RENDERING_OBJECTS = [],
  FLOOR_ELEMENTS = [],
  BONUSES = [],
  ENEMIES = [],
  GAME_SVG = null,
  GAME_BACKGROUND_SVG = null,
  BG_IMG = null,
  WORLD = null,
  COLLISION_DETECTOR = null,
  PREV_TIME = Date.now(),
  TIME = null,
  TIMER = null,
  COLLECTED = null,
  BONUS_DISPLAY = null
  
function init(){
  
  WORLD = new World(GAME_MODEL.world)
  CAMERA = new Camera(GAME_MODEL.camera)
  RENDERING_OBJECTS.push(CAMERA)
  
  FLOOR_ELEMENTS = initFloor(GAME_MODEL.floor)
  RENDERING_OBJECTS = RENDERING_OBJECTS.concat(FLOOR_ELEMENTS)
  
  BONUSES = initBonus(GAME_MODEL.bonuses)
  RENDERING_OBJECTS = RENDERING_OBJECTS.concat(BONUSES)
  
  ENEMIES = initEnemies(GAME_MODEL.enemies, GAME_MODEL.missiles)
  RENDERING_OBJECTS = RENDERING_OBJECTS.concat(ENEMIES)
  
  HERO = initHero(GAME_MODEL.hero) 
  RENDERING_OBJECTS.push(HERO)
  
  COLLISION_DETECTOR = new CollisionDetector()
  
  /* add event */ 
  document.addEventListener("keydown", keyDownEvents )
  document.addEventListener("keyup", keyUpEvents )
  var buttons = [
       document.querySelector("button#left"),
       document.querySelector("button#right"),
       document.querySelector("button#jump1"),
       document.querySelector("button#jump2")]
  
  buttons.forEach((b)=>{
    b.addEventListener('mouseup', mouseupEvents)
    b.addEventListener('mouseleave', mouseupEvents)
    b.addEventListener('mousedown', mousedownEvents)
    b.addEventListener('touchstart', mousedownEvents)
    b.addEventListener('touchend', mouseupEvents)
  })
  
  document.querySelector("#titlescreen").addEventListener("click", (ev)=>{start()})
 
  TIME = 100
  TIMER = document.querySelector("span#timer")
  
  COLLECTED = 0
  RESULT = BONUSES.length
  BONUS_DISPLAY = document.querySelector("span#bonus")

  document.querySelector("text#successmessage").setAttribute("fill", "none")
  document.querySelector("text#failuremessage").setAttribute("fill", "none")
}

function CollisionDetector(){
     
  this.computeBB = function(object){
    var frame = object.sprite.animation.frames[object.sprite.frame]
    return { 
      l : object.position.x + frame.bbox[0], 
      r : object.position.x + frame.bbox[2],
      t : object.position.y + object.sprite.animation.height - frame.bbox[1],
      b : object.position.y + object.sprite.animation.height - frame.bbox[3]
    }
  }
  
  var
    NONE = 0,
    BOTTOM = 1, 
    TOP = 2,
    LEFT = 4,
    RIGHT = 8,
    VOVER = 16,
    HOVER = 32,
    OVER = 64

  this.checkCollision = function(bb1, bb2){
    var ret = this.NONE
    var 
      bot = (bb1.b <= bb2.t && bb1.b >= bb2.b) * BOTTOM,
      top = (bb1.t <= bb2.t && bb1.t >= bb2.b) * TOP,
      left = (bb1.l <= bb2.r && bb1.l >= bb2.l) * LEFT,
      right = (bb1.r <= bb2.r && bb1.r >= bb2.l) * RIGHT,
      vover = (( left || right ) && (bb1.b <= bb2.b && bb1.t >= bb2.t)) * VOVER,
      hover = (( top || bot ) && (bb1.l <= bb2.l && bb1.r >= bb2.r)) * HOVER,
      over = ((bb1.b <= bb2.b && bb1.t >= bb2.t) && (bb1.l <= bb2.l && bb1.r >= bb2.r)) * OVER
    return ret | bot | top | left | right | vover | hover | over
  }
   
  var computeBB = this.computeBB,
      checkCollision = this.checkCollision
 
  this.detect = function(){
    var herobb = computeBB(HERO)
    this.detectWithFloor(HERO, herobb, true)
    this.detectWithBonus(HERO, herobb)
    if(!HERO.ghost) this.detectWithEnemies(HERO, herobb);
    ENEMIES.forEach( (e)=>{ if(!e.dead) this.detectWithFloor(e, computeBB(e), false); } )
  }
  
  this.detectWithBonus = function(obj, objbb){
    BONUSES.forEach(
      (b)=>{
        if(b.isVisible(CAMERA) && !b.collected){
          var bonusbb = computeBB(b)
          var colltype = checkCollision(objbb, bonusbb)
          if((colltype === 6) || (colltype === 10) || (colltype === 20) || (colltype === 24) || (colltype === 16) || (colltype === 32) || colltype >= 64){
            COLLECTED += 1
            b.dead = true
            b.setAnimation(null)
          }
        }
      }
    )
  }
  
  this.detectWithEnemies = function(obj, objbb){
    ENEMIES.forEach(
      (e)=>{
        if(e.isVisible(CAMERA) && !e.dead){
          var enemybb = computeBB(e)
          var colltype = checkCollision(objbb, enemybb)
          if((colltype === 6) || (colltype === 10) || (colltype === 20) || (colltype === 24) || (colltype === 16) || (colltype === 32)){
            obj.freeze()
          }
        }
      }
    )
  }
  
  this.detectWithFloor = function(obj, objbb, onlyvisible){
    obj.currentfloor = null
    FLOOR_ELEMENTS.forEach(
      function(floor){
        if(floor.isVisible(CAMERA) || !onlyvisible){
          var floorbb = computeBB(floor)
          var colltype = checkCollision(objbb, floorbb)
          if((colltype === 5) || (colltype === 9) || (colltype === 13)){
            obj.land(floor)
          } else if((colltype === 6) || (colltype === 10) || (colltype === 20) || (colltype === 24) || (colltype === 16) || (colltype === 32)){
            obj.bounce(floor)
          }     
        }
     }
    )
  }
}

function World(model){
  this.model = model
}

function Camera(model){
 
  GAME_SVG = document.querySelector("#GAME")
  GAME_BACKGROUND_SVG = document.querySelector("#BACKGROUND")
  BG_SKY = GAME_BACKGROUND_SVG.querySelector("rect")
  
  this.model = model
  
  this.minx = this.model.width / 2, 
  this.maxx = WORLD.model.width - this.model.width / 2
  this.halfwidth = this.model.width / 2
  
  this.position = new Vector2D(this.minx, this.model.height / 2)
  
  GAME_SVG.setAttribute("width", this.model.width)
  GAME_SVG.setAttribute("height", this.model.height)
  GAME_BACKGROUND_SVG.setAttribute("width", WORLD.model.width)
  GAME_BACKGROUND_SVG.setAttribute("height", WORLD.model.height)
  BG_SKY.setAttribute("width", WORLD.model.width)
  BG_SKY.setAttribute("height", WORLD.model.height)
  
  this.worldToBackground = function(pos){
    return new Vector2D(pos.x, this.model.height - 1 - pos.y)
  }
  
  this.worldToCamera = function(pos){
    return new Vector2D(pos.x - this.getLeft(), pos.y)
  }
  
  this.synchWithHero = function(){
    this.position.x = HERO.position.x
    this.position.x = Math.min(this.position.x, WORLD.model.width - this.halfwidth)
    this.position.x = Math.max(this.position.x, this.halfwidth)
  }
  
  this.getLeft = function(){
    return this.position.x - this.halfwidth
  }
  
  this.getRight = function(){
    return this.position.x + this.halfwidth
  }
  
  this.update = function(){
    //Resolve camera_to_hero constraint
    if(HERO.screenposition.x >= this.halfwidth || HERO.screenposition.x <= this.halfwidth) this.synchWithHero();

    //move background
    GAME_BACKGROUND_SVG.setAttribute("x", -(this.position.x - this.minx))
  }
}

// EVENT MEDIATORS
function keyDownEvents(event){
  if(event.which === 39){
    
    HERO.pushRight()
    
  }else if(event.which === 37){
    
    HERO.pushLeft()
    
  }else if(event.which === 38){
    
    HERO.pushUp()
    
  }
  event.stopPropagation()
}

function keyUpEvents(event){
  if(event.which === 39){
    HERO.releaseRight()

  }else if(event.which === 37){  
    HERO.releaseLeft()
    
  }else if(event.which === 38){  
    HERO.releaseUp()
    
  }
  event.stopPropagation()
}

function mousedownEvents(event){
  var tgt = event.target
  if(tgt.id === "left"){
    HERO.pushLeft()
  } else if(tgt.id === "right"){
    HERO.pushRight()
  } else if(tgt.id === "jump1" || tgt.id === "jump2"){
    HERO.pushUp()
  }
}

function mouseupEvents(event){
  var tgt = event.target
  if(tgt.id === "left"){
    HERO.releaseLeft()
  } else if(tgt.id === "right"){
    HERO.releaseRight()
  } else if(tgt.id === "jump1" || tgt.id === "jump2"){
    HERO.releaseUp()
  }
}

// MAIN LOOP 
function update(){
  var now = Date.now()
  var ts = now - PREV_TIME
  PREV_TIME = now
  
  RENDERING_OBJECTS.forEach(function(o){ o.update(ts, CAMERA) })
  COLLISION_DETECTOR.detect()

  TIMER.textContent = TIME
  BONUS_DISPLAY.textContent = COLLECTED
}

function mainLoop(){
  RENDERING_OBJECTS = RENDERING_OBJECTS.filter((o)=>{ return !o.dead })
  ENEMIES = ENEMIES.filter((o)=>{ return !o.dead})
  update();
  if(COLLECTED === BONUSES.length){
    success()
  } else if( HERO.dead || TIME === 0){
    fail()
  } else{
    window.requestAnimationFrame(mainLoop) 
  }
}

function success(){
  document.querySelector("text#successmessage").setAttribute("fill", "yellow")
  window.setTimeout(stop, 5000)
}

function fail(){
  document.querySelector("text#failuremessage").setAttribute("fill", "yellow")
  window.setTimeout(stop, 5000)
}

function startTimer(){
  TIME -=1
  window.setTimeout(startTimer, 1000)
}

function start(){
  document.querySelector("#titlescreen").style.display = "none"
  document.querySelector("#gamescreen").style.display = "flex"
  startTimer()
  mainLoop()
}

function stop(){
  document.querySelector("#titlescreen").style.display = "flex"
  document.querySelector("#gamescreen").style.display = "none"
  location.reload()
}