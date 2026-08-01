class Ball {
  constructor( speed = 6 ) {
    this.radius = SPRITES.ball.sw / 2;
    this.baseSpeed = speed;
    this.speed = speed;
    this.reset();
  }

  setSpeed( newSpeed ) {
    const currentSpeed = Math.hypot( this.dx, this.dy );
    const scale = currentSpeed === 0 ? 1 : newSpeed / currentSpeed;
    this.dx *= scale;
    this.dy *= scale;
    this.speed = newSpeed;
  }

  reset() {
    this.x = canvas.width / 2;
    this.y = canvas.height - 100;
    this.dx = this.speed * Math.sin( -0.3 );
    this.dy = -this.speed * Math.cos( -0.3 );
  }

  bounceOffPaddle( paddle ) {
    const hitPos = ( this.x - paddle.x ) / paddle.width;
    const clamped = Math.max( 0, Math.min( 1, hitPos ) );
    const angle = ( clamped - 0.5 ) * ( Math.PI / 3 );

    this.dx = this.speed * Math.sin( angle );
    this.dy = -this.speed * Math.cos( angle );
    this.y = paddle.y - this.radius;

    bounceSound.currentTime = 0;
    bounceSound.play();
  }

  update( paddle ) {
    this.x += this.dx;
    this.y += this.dy;

    if ( this.x - this.radius < 0 ) {
      this.x = this.radius;
      this.dx = -this.dx;
      bounceSound.currentTime = 0;
      bounceSound.play();
    } else if ( this.x + this.radius > canvas.width ) {
      this.x = canvas.width - this.radius;
      this.dx = -this.dx;
      bounceSound.currentTime = 0;
      bounceSound.play();
    }

    if ( this.y - this.radius < 0 ) {
      this.y = this.radius;
      this.dy = -this.dy;
      bounceSound.currentTime = 0;
      bounceSound.play();
    }

    if (
      this.dy > 0 &&
      this.y + this.radius >= paddle.y &&
      this.y + this.radius <= paddle.y + paddle.height &&
      this.x + this.radius >= paddle.x &&
      this.x - this.radius <= paddle.x + paddle.width
    ) {
      this.bounceOffPaddle( paddle );
    }
  }

  render() {
    drawSprite( ctx, 'ball', this.x - this.radius, this.y - this.radius, this.radius * 2, this.radius * 2 );
  }
}
