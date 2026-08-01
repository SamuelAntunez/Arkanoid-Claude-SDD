const canvas = document.getElementById( 'game' );
const ctx = canvas.getContext( '2d' );

const bounceSound = new Audio( 'assets/sounds/ball-bounce.mp3' );
const breakSound = new Audio( 'assets/sounds/break-sound.mp3' );

class Game {
  constructor() {
    this.menu = new Menu();
    this.state = 'menu';
    canvas.addEventListener( 'click', ( e ) => this.onClick( e ) );
    window.addEventListener( 'keydown', ( e ) => this.onKeyDown( e ) );
  }

  onKeyDown( e ) {
    if ( e.key !== 'Escape' && e.key !== 'p' && e.key !== 'P' ) return;

    if ( this.state === 'playing' ) this.state = 'paused';
    else if ( this.state === 'paused' ) this.state = 'playing';
  }

  highScoreKey() {
    return `arkanoid-highscore-${ this.difficulty }`;
  }

  updateHighScore() {
    if ( this.score > this.highScore ) {
      this.highScore = this.score;
      localStorage.setItem( this.highScoreKey(), String( this.highScore ) );
    }
  }

  startGame() {
    this.difficulty = this.menu.selectedDifficulty;
    this.highScore = Number( localStorage.getItem( this.highScoreKey() ) ) || 0;
    this.state = 'playing';
    this.paddle = new Paddle();
    this.ballBaseSpeed = DIFFICULTY_SPEEDS[ this.difficulty ];
    this.balls = [ new Ball( this.ballBaseSpeed ) ];
    this.level = 0;
    this.blocks = createLevel( this.level );
    this.powerups = [];
    this.activeEffects = { size: null, speed: null };
    this.gameTime = 0;
    this.lastFrameAt = performance.now();
    this.score = 0;
    this.lives = 3;
  }

  retryButtonBounds() {
    return { x: canvas.width / 2 - 220, y: 380, w: 200, h: 50 };
  }

  endMenuButtonBounds() {
    return { x: canvas.width / 2 + 20, y: 380, w: 200, h: 50 };
  }

  menuButtonBounds() {
    return { x: canvas.width - 10 - 44, y: 10, w: 44, h: 44 };
  }

  nextLevelButtonBounds() {
    return { x: canvas.width / 2 - 220, y: 380, w: 200, h: 50 };
  }

  levelCompleteMenuButtonBounds() {
    return { x: canvas.width / 2 + 20, y: 380, w: 200, h: 50 };
  }

  onClick( e ) {
    const rect = canvas.getBoundingClientRect();
    const scale = canvas.width / rect.width;
    const mx = ( e.clientX - rect.left ) * scale;
    const my = ( e.clientY - rect.top ) * scale;

    if ( this.state === 'playing' ) {
      const menuBtn = this.menuButtonBounds();
      if ( mx >= menuBtn.x && mx <= menuBtn.x + menuBtn.w && my >= menuBtn.y && my <= menuBtn.y + menuBtn.h ) {
        this.state = 'paused';
      }
      return;
    }

    if ( this.state === 'menu' ) {
      const action = this.menu.onClick( mx, my );
      if ( action === 'play' ) this.startGame();
      return;
    }

    if ( this.state === 'paused' ) {
      const resume = this.pauseResumeButtonBounds();
      const menuBtn = this.pauseMenuButtonBounds();

      if ( mx >= resume.x && mx <= resume.x + resume.w && my >= resume.y && my <= resume.y + resume.h ) {
        this.state = 'playing';
      } else if ( mx >= menuBtn.x && mx <= menuBtn.x + menuBtn.w && my >= menuBtn.y && my <= menuBtn.y + menuBtn.h ) {
        this.state = 'menu';
      }
      return;
    }

    if ( this.state === 'levelcomplete' ) {
      const next = this.nextLevelButtonBounds();
      const menuBtn = this.levelCompleteMenuButtonBounds();

      if ( mx >= next.x && mx <= next.x + next.w && my >= next.y && my <= next.y + next.h ) {
        this.advanceToNextLevel();
      } else if ( mx >= menuBtn.x && mx <= menuBtn.x + menuBtn.w && my >= menuBtn.y && my <= menuBtn.y + menuBtn.h ) {
        this.state = 'menu';
      }
      return;
    }

    const btn = this.retryButtonBounds();
    const menuBtn = this.endMenuButtonBounds();

    if ( mx >= btn.x && mx <= btn.x + btn.w && my >= btn.y && my <= btn.y + btn.h ) {
      this.startGame();
    } else if ( mx >= menuBtn.x && mx <= menuBtn.x + menuBtn.w && my >= menuBtn.y && my <= menuBtn.y + menuBtn.h ) {
      this.state = 'menu';
    }
  }

  paddleTouchesPowerup( powerup ) {
    const closestX = Math.max( this.paddle.x, Math.min( powerup.x, this.paddle.x + this.paddle.width ) );
    const closestY = Math.max( this.paddle.y, Math.min( powerup.y, this.paddle.y + this.paddle.height ) );
    const dx = powerup.x - closestX;
    const dy = powerup.y - closestY;

    return dx * dx + dy * dy <= powerup.radius * powerup.radius;
  }

  applyPowerup( type ) {
    const expiresAt = this.gameTime + POWERUP_DURATION * 1000;

    if ( type === 'paddle-big' || type === 'paddle-small' ) {
      this.activeEffects.size = { type, expiresAt };
      this.paddle.setWidthScale( POWERUP_CONFIG[ type ].paddleScale );
    } else if ( type === 'ball-slow' || type === 'ball-fast' ) {
      this.activeEffects.speed = { type, expiresAt };
      this.balls.forEach( ( ball ) => ball.setSpeed( this.ballBaseSpeed * POWERUP_CONFIG[ type ].speedScale ) );
    } else if ( type === 'multi-ball' ) {
      const source = this.balls[ 0 ];
      const clone = new Ball( source.baseSpeed );
      clone.x = source.x;
      clone.y = source.y;
      clone.dx = -source.dx;
      clone.dy = source.dy;
      clone.speed = source.speed;
      this.balls.push( clone );
    }
  }

  updateActiveEffects() {
    if ( this.activeEffects.size && this.gameTime > this.activeEffects.size.expiresAt ) {
      this.paddle.setWidthScale( 1 );
      this.activeEffects.size = null;
    }

    if ( this.activeEffects.speed && this.gameTime > this.activeEffects.speed.expiresAt ) {
      this.balls.forEach( ( ball ) => ball.setSpeed( this.ballBaseSpeed ) );
      this.activeEffects.speed = null;
    }
  }

  advanceToNextLevel() {
    this.level += 1;
    this.blocks = createLevel( this.level );
    this.activeEffects = { size: null, speed: null };
    this.paddle.setWidthScale( 1 );
    this.paddle.resetPosition();
    this.respawnBall();
    this.state = 'playing';
  }

  respawnBall() {
    const ball = new Ball( this.ballBaseSpeed );

    if ( this.activeEffects.speed ) {
      ball.setSpeed( this.ballBaseSpeed * POWERUP_CONFIG[ this.activeEffects.speed.type ].speedScale );
    }

    this.balls = [ ball ];
  }

  loseLife() {
    this.lives -= 1;

    if ( this.lives <= 0 ) {
      this.state = 'gameover';
      this.updateHighScore();
      return;
    }

    this.respawnBall();
    this.paddle.resetPosition();
  }

  update() {
    const now = performance.now();
    const delta = Math.min( now - this.lastFrameAt, 100 );
    this.lastFrameAt = now;

    if ( this.state !== 'playing' ) return;

    this.gameTime += delta;

    this.paddle.update();
    this.balls.forEach( ( ball ) => ball.update( this.paddle ) );
    this.blocks.forEach( ( block ) => block.update() );

    this.balls.forEach( ( ball ) => {
      const hitBlock = handleBlockCollisions( ball, this.blocks );
      if ( hitBlock ) {
        this.score += 10;
        const powerup = maybeSpawnPowerup( hitBlock );
        if ( powerup ) this.powerups.push( powerup );
      }
    } );

    this.powerups.forEach( ( powerup ) => powerup.update() );

    this.powerups = this.powerups.filter( ( powerup ) => {
      if ( this.paddleTouchesPowerup( powerup ) ) {
        this.applyPowerup( powerup.type );
        return false;
      }
      return powerup.y - powerup.radius <= canvas.height;
    } );

    this.updateActiveEffects();

    this.balls = this.balls.filter( ( ball ) => ball.y - ball.radius <= canvas.height );
    if ( this.balls.length === 0 ) {
      this.loseLife();
    }

    if ( this.state === 'playing' && this.blocks.every( ( block ) => block.broken ) ) {
      if ( this.level < LEVELS.length - 1 ) {
        this.state = 'levelcomplete';
      } else {
        this.state = 'win';
        this.updateHighScore();
      }
    }
  }

  render() {
    if ( this.state === 'menu' ) {
      this.menu.render();
      return;
    }

    ctx.fillStyle = '#000';
    ctx.fillRect( 0, 0, canvas.width, canvas.height );
    this.paddle.render();
    this.balls.forEach( ( ball ) => ball.render() );
    this.blocks.forEach( ( block ) => block.render() );
    this.powerups.forEach( ( powerup ) => powerup.render() );
    this.renderHud();

    if ( this.state === 'paused' ) this.renderPauseOverlay();
    if ( this.state === 'levelcomplete' ) this.renderLevelCompleteScreen();
    if ( this.state === 'gameover' ) this.renderEndScreen( 'Game Over' );
    if ( this.state === 'win' ) this.renderEndScreen( '¡Victoria!' );
  }

  pauseResumeButtonBounds() {
    return { x: canvas.width / 2 - 220, y: 320, w: 200, h: 50 };
  }

  pauseMenuButtonBounds() {
    return { x: canvas.width / 2 + 20, y: 320, w: 200, h: 50 };
  }

  renderPauseOverlay() {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect( 0, 0, canvas.width, canvas.height );

    ctx.fillStyle = '#fff';
    ctx.textAlign = 'center';
    ctx.font = '48px sans-serif';
    ctx.fillText( 'Pausa', canvas.width / 2, 220 );

    const resume = this.pauseResumeButtonBounds();
    ctx.fillStyle = '#2a2';
    ctx.fillRect( resume.x, resume.y, resume.w, resume.h );
    ctx.fillStyle = '#fff';
    ctx.font = '20px sans-serif';
    ctx.textBaseline = 'middle';
    ctx.fillText( 'Reanudar', resume.x + resume.w / 2, resume.y + resume.h / 2 );

    const menuBtn = this.pauseMenuButtonBounds();
    ctx.fillStyle = '#555';
    ctx.fillRect( menuBtn.x, menuBtn.y, menuBtn.w, menuBtn.h );
    ctx.fillStyle = '#fff';
    ctx.fillText( 'Menú principal', menuBtn.x + menuBtn.w / 2, menuBtn.y + menuBtn.h / 2 );

    ctx.textBaseline = 'top';
    ctx.textAlign = 'left';
  }

  renderHud() {
    ctx.fillStyle = '#fff';
    ctx.font = '18px sans-serif';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    ctx.fillText( `Score: ${ this.score }   High score: ${ this.highScore }   Nivel: ${ this.level + 1 }/${ LEVELS.length }`, 10, 10 );

    const ballSize = 16;
    const gap = 6;
    const totalWidth = this.lives * ballSize + Math.max( 0, this.lives - 1 ) * gap;
    const menuBtn = this.menuButtonBounds();
    let livesX = menuBtn.x - 10 - totalWidth;

    for ( let i = 0; i < this.lives; i++ ) {
      drawSprite( ctx, 'ball', livesX, 10, ballSize, ballSize );
      livesX += ballSize + gap;
    }

    this.renderActiveEffects();
    this.renderMenuButton();
  }

  renderMenuButton() {
    const btn = this.menuButtonBounds();
    ctx.fillStyle = '#555';
    ctx.fillRect( btn.x, btn.y, btn.w, btn.h );
    ctx.fillStyle = '#fff';
    ctx.font = '20px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText( '⏸', btn.x + btn.w / 2, btn.y + btn.h / 2 );
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
  }

  renderActiveEffects() {
    const active = [ this.activeEffects.size, this.activeEffects.speed ].filter( Boolean );

    ctx.font = '14px sans-serif';
    ctx.textAlign = 'left';

    active.forEach( ( effect, i ) => {
      const config = POWERUP_CONFIG[ effect.type ];
      const secondsLeft = Math.max( 0, Math.ceil( ( effect.expiresAt - this.gameTime ) / 1000 ) );
      const y = 34 + i * 20;

      ctx.fillStyle = config.color;
      ctx.beginPath();
      ctx.arc( 18, y + 7, 8, 0, Math.PI * 2 );
      ctx.fill();

      ctx.fillStyle = '#fff';
      ctx.textBaseline = 'middle';
      ctx.fillText( config.label, 15, y + 7 );
      ctx.textBaseline = 'top';
      ctx.fillText( `${ secondsLeft }s`, 32, y );
    } );
  }

  renderLevelCompleteScreen() {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect( 0, 0, canvas.width, canvas.height );

    ctx.fillStyle = '#fff';
    ctx.textAlign = 'center';
    ctx.font = '48px sans-serif';
    ctx.fillText( '¡Nivel completado!', canvas.width / 2, 250 );

    ctx.font = '24px sans-serif';
    ctx.fillText( `Score: ${ this.score }`, canvas.width / 2, 320 );

    const next = this.nextLevelButtonBounds();
    ctx.fillStyle = '#2a2';
    ctx.fillRect( next.x, next.y, next.w, next.h );
    ctx.fillStyle = '#fff';
    ctx.font = '20px sans-serif';
    ctx.textBaseline = 'middle';
    ctx.fillText( 'Siguiente nivel', next.x + next.w / 2, next.y + next.h / 2 );

    const menuBtn = this.levelCompleteMenuButtonBounds();
    ctx.fillStyle = '#555';
    ctx.fillRect( menuBtn.x, menuBtn.y, menuBtn.w, menuBtn.h );
    ctx.fillStyle = '#fff';
    ctx.fillText( 'Menú principal', menuBtn.x + menuBtn.w / 2, menuBtn.y + menuBtn.h / 2 );

    ctx.textBaseline = 'top';
    ctx.textAlign = 'left';
  }

  renderEndScreen( title ) {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect( 0, 0, canvas.width, canvas.height );

    ctx.fillStyle = '#fff';
    ctx.textAlign = 'center';
    ctx.font = '48px sans-serif';
    ctx.fillText( title, canvas.width / 2, 250 );

    ctx.font = '24px sans-serif';
    ctx.fillText( `Score: ${ this.score }`, canvas.width / 2, 320 );

    const btn = this.retryButtonBounds();
    ctx.fillStyle = '#2a2';
    ctx.fillRect( btn.x, btn.y, btn.w, btn.h );
    ctx.fillStyle = '#fff';
    ctx.font = '20px sans-serif';
    ctx.textBaseline = 'middle';
    ctx.fillText( 'Reintentar', btn.x + btn.w / 2, btn.y + btn.h / 2 );

    const menuBtn = this.endMenuButtonBounds();
    ctx.fillStyle = '#555';
    ctx.fillRect( menuBtn.x, menuBtn.y, menuBtn.w, menuBtn.h );
    ctx.fillStyle = '#fff';
    ctx.fillText( 'Menú principal', menuBtn.x + menuBtn.w / 2, menuBtn.y + menuBtn.h / 2 );

    ctx.textBaseline = 'top';
    ctx.textAlign = 'left';
  }

  loop() {
    this.update();
    this.render();
    requestAnimationFrame( () => this.loop() );
  }
}

let game;

loadSpritesheet( () => {
  game = new Game();
  game.loop();
} );
