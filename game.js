const canvas = document.getElementById( 'game' );
const ctx = canvas.getContext( '2d' );

const bounceSound = new Audio( 'assets/sounds/ball-bounce.mp3' );
const breakSound = new Audio( 'assets/sounds/break-sound.mp3' );

class Game {
  constructor() {
    this.state = 'playing';
    this.paddle = new Paddle();
    this.ball = new Ball();
  }

  update() {
    this.paddle.update();
    this.ball.update( this.paddle );
  }

  render() {
    ctx.fillStyle = '#000';
    ctx.fillRect( 0, 0, canvas.width, canvas.height );
    this.paddle.render();
    this.ball.render();
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
