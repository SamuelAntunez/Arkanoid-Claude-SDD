class Paddle {
  constructor() {
    this.width = SPRITES.paddle.sw;
    this.height = SPRITES.paddle.sh;
    this.x = ( canvas.width - this.width ) / 2;
    this.y = canvas.height - this.height - 20;
    this.speed = 8;

    this.movingLeft = false;
    this.movingRight = false;

    window.addEventListener( 'keydown', ( e ) => this.onKeyDown( e ) );
    window.addEventListener( 'keyup', ( e ) => this.onKeyUp( e ) );
    canvas.addEventListener( 'mousemove', ( e ) => this.onMouseMove( e ) );
  }

  onKeyDown( e ) {
    if ( e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A' ) this.movingLeft = true;
    if ( e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D' ) this.movingRight = true;
  }

  onKeyUp( e ) {
    if ( e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A' ) this.movingLeft = false;
    if ( e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D' ) this.movingRight = false;
  }

  onMouseMove( e ) {
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    this.x = mouseX - this.width / 2;
    this.clamp();
  }

  resetPosition() {
    this.x = ( canvas.width - this.width ) / 2;
  }

  clamp() {
    if ( this.x < 0 ) this.x = 0;
    if ( this.x + this.width > canvas.width ) this.x = canvas.width - this.width;
  }

  update() {
    if ( this.movingLeft ) this.x -= this.speed;
    if ( this.movingRight ) this.x += this.speed;
    this.clamp();
  }

  render() {
    drawSprite( ctx, 'paddle', this.x, this.y, this.width, this.height );
  }
}
