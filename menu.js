class Menu {
  constructor() {
    this.selectedDifficulty = 'normal';
  }

  playButtonBounds() {
    return { x: canvas.width / 2 - 100, y: 400, w: 200, h: 50 };
  }

  onClick( mx, my ) {
    const play = this.playButtonBounds();
    if ( mx >= play.x && mx <= play.x + play.w && my >= play.y && my <= play.y + play.h ) {
      return 'play';
    }
    return null;
  }

  render() {
    ctx.fillStyle = '#000';
    ctx.fillRect( 0, 0, canvas.width, canvas.height );

    ctx.fillStyle = '#fff';
    ctx.textAlign = 'center';
    ctx.font = '48px sans-serif';
    ctx.fillText( 'Arkanoid', canvas.width / 2, 150 );

    const play = this.playButtonBounds();
    ctx.fillStyle = '#2a2';
    ctx.fillRect( play.x, play.y, play.w, play.h );
    ctx.fillStyle = '#fff';
    ctx.font = '20px sans-serif';
    ctx.textBaseline = 'middle';
    ctx.fillText( 'Jugar', canvas.width / 2, play.y + play.h / 2 );
    ctx.textBaseline = 'top';
    ctx.textAlign = 'left';
  }
}
