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
    this.ball = new Ball( DIFFICULTY_SPEEDS[ this.difficulty ] );
    this.blocks = createLevel();
    this.powerups = [];
    this.score = 0;
    this.lives = 3;
  }

  retryButtonBounds() {
    return { x: canvas.width / 2 - 220, y: 380, w: 200, h: 50 };
  }

  endMenuButtonBounds() {
    return { x: canvas.width / 2 + 20, y: 380, w: 200, h: 50 };
  }

  onClick( e ) {
    if ( this.state === 'playing' ) return;

    const rect = canvas.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;

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

    const btn = this.retryButtonBounds();
    const menuBtn = this.endMenuButtonBounds();

    if ( mx >= btn.x && mx <= btn.x + btn.w && my >= btn.y && my <= btn.y + btn.h ) {
      this.startGame();
    } else if ( mx >= menuBtn.x && mx <= menuBtn.x + menuBtn.w && my >= menuBtn.y && my <= menuBtn.y + menuBtn.h ) {
      this.state = 'menu';
    }
  }

  loseLife() {
    this.lives -= 1;

    if ( this.lives <= 0 ) {
      this.state = 'gameover';
      this.updateHighScore();
      return;
    }

    this.ball.reset();
    this.paddle.resetPosition();
  }

  update() {
    if ( this.state !== 'playing' ) return;

    this.paddle.update();
    this.ball.update( this.paddle );
    this.blocks.forEach( ( block ) => block.update() );

    const hitBlock = handleBlockCollisions( this.ball, this.blocks );
    if ( hitBlock ) {
      this.score += 10;
      const powerup = maybeSpawnPowerup( hitBlock );
      if ( powerup ) this.powerups.push( powerup );
    }

    this.powerups.forEach( ( powerup ) => powerup.update() );
    this.powerups = this.powerups.filter( ( powerup ) => powerup.y - powerup.radius <= canvas.height );

    if ( this.ball.y - this.ball.radius > canvas.height ) {
      this.loseLife();
    }

    if ( this.state === 'playing' && this.blocks.every( ( block ) => block.broken ) ) {
      this.state = 'win';
      this.updateHighScore();
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
    this.ball.render();
    this.blocks.forEach( ( block ) => block.render() );
    this.powerups.forEach( ( powerup ) => powerup.render() );
    this.renderHud();

    if ( this.state === 'paused' ) this.renderPauseOverlay();
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
    ctx.fillText( `Score: ${ this.score }   High score: ${ this.highScore }`, 10, 10 );

    const ballSize = 16;
    const gap = 6;
    const totalWidth = this.lives * ballSize + Math.max( 0, this.lives - 1 ) * gap;
    let livesX = canvas.width - 10 - totalWidth;

    for ( let i = 0; i < this.lives; i++ ) {
      drawSprite( ctx, 'ball', livesX, 10, ballSize, ballSize );
      livesX += ballSize + gap;
    }
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

loadSpritesheet( () => {
  const game = new Game();
  game.loop();
} );
