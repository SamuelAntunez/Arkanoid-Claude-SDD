class Paddle {
  constructor() {
    this.baseWidth = SPRITES.paddle.sw;
    this.widthScale = 1;
    this.width = this.baseWidth;
    this.height = SPRITES.paddle.sh;
    this.x = ( canvas.width - this.width ) / 2;
    this.y = canvas.height - this.height - 20;
    this.speed = 8;

    this.movingLeft = false;
    this.movingRight = false;

    window.addEventListener( 'keydown', ( e ) => this.onKeyDown( e ) );
    window.addEventListener( 'keyup', ( e ) => this.onKeyUp( e ) );
    canvas.addEventListener( 'mousemove', ( e ) => this.onMouseMove( e ) );
    canvas.addEventListener( 'touchstart', ( e ) => this.onTouchMove( e ), { passive: false } );
    canvas.addEventListener( 'touchmove', ( e ) => this.onTouchMove( e ), { passive: false } );
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
    const scale = canvas.width / rect.width;
    const mouseX = ( e.clientX - rect.left ) * scale;
    this.x = mouseX - this.width / 2;
    this.clamp();
  }

  onTouchMove( e ) {
    e.preventDefault();
    const rect = canvas.getBoundingClientRect();
    const scale = canvas.width / rect.width;
    const touchX = ( e.touches[ 0 ].clientX - rect.left ) * scale;
    this.x = touchX - this.width / 2;
    this.clamp();
  }

  resetPosition() {
    this.x = ( canvas.width - this.width ) / 2;
  }

  setWidthScale( scale ) {
    const centerX = this.x + this.width / 2;
    this.widthScale = scale;
    this.width = this.baseWidth * scale;
    this.x = centerX - this.width / 2;
    this.clamp();
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
