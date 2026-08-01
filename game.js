const canvas = document.getElementById( 'game' );
const ctx = canvas.getContext( '2d' );

const bounceSound = new Audio( 'assets/sounds/ball-bounce.mp3' );
const breakSound = new Audio( 'assets/sounds/break-sound.mp3' );

const HIGHSCORE_KEY = 'arkanoid-highscore';

class Game {
  constructor() {
    this.menu = new Menu();
    this.state = 'menu';
    this.highScore = Number( localStorage.getItem( HIGHSCORE_KEY ) ) || 0;
    canvas.addEventListener( 'click', ( e ) => this.onClick( e ) );
  }

  updateHighScore() {
    if ( this.score > this.highScore ) {
      this.highScore = this.score;
      localStorage.setItem( HIGHSCORE_KEY, String( this.highScore ) );
    }
  }

  startGame() {
    this.state = 'playing';
    this.paddle = new Paddle();
    this.ball = new Ball();
    this.blocks = createLevel();
    this.score = 0;
    this.lives = 3;
  }

  retryButtonBounds() {
    return { x: canvas.width / 2 - 100, y: 380, w: 200, h: 50 };
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

    const btn = this.retryButtonBounds();

    if ( mx >= btn.x && mx <= btn.x + btn.w && my >= btn.y && my <= btn.y + btn.h ) {
      this.startGame();
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
    if ( hitBlock ) this.score += 10;

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
    this.renderHud();

    if ( this.state === 'gameover' ) this.renderEndScreen( 'Game Over' );
    if ( this.state === 'win' ) this.renderEndScreen( '¡Victoria!' );
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
    ctx.fillText( 'Reintentar', canvas.width / 2, btn.y + btn.h / 2 );
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
