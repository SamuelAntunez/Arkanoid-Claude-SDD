class Menu {
  constructor() {
    this.selectedDifficulty = localStorage.getItem( DIFFICULTY_KEY ) || 'normal';
  }

  playButtonBounds() {
    return { x: canvas.width / 2 - 100, y: 400, w: 200, h: 50 };
  }

  difficultyButtonBounds( index ) {
    const w = 120;
    const h = 50;
    const gap = 20;
    const totalWidth = DIFFICULTIES.length * w + ( DIFFICULTIES.length - 1 ) * gap;
    const startX = canvas.width / 2 - totalWidth / 2;
    return { x: startX + index * ( w + gap ), y: 300, w, h };
  }

  onClick( mx, my ) {
    for ( let i = 0; i < DIFFICULTIES.length; i++ ) {
      const btn = this.difficultyButtonBounds( i );
      if ( mx >= btn.x && mx <= btn.x + btn.w && my >= btn.y && my <= btn.y + btn.h ) {
        this.selectedDifficulty = DIFFICULTIES[ i ];
        localStorage.setItem( DIFFICULTY_KEY, this.selectedDifficulty );
        return null;
      }
    }

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

    ctx.font = '20px sans-serif';
    ctx.fillText( 'Dificultad', canvas.width / 2, 260 );

    DIFFICULTIES.forEach( ( diff, i ) => {
      const btn = this.difficultyButtonBounds( i );
      ctx.fillStyle = diff === this.selectedDifficulty ? '#2a2' : '#333';
      ctx.fillRect( btn.x, btn.y, btn.w, btn.h );
      ctx.fillStyle = '#fff';
      ctx.font = '18px sans-serif';
      ctx.textBaseline = 'middle';
      ctx.fillText( DIFFICULTY_LABELS[ diff ], btn.x + btn.w / 2, btn.y + btn.h / 2 );
      ctx.textBaseline = 'top';
    } );

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
