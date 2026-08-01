const BLOCK_ROWS = [ 'red', 'yellow', 'cyan', 'magenta', 'hotpink', 'green', 'gray' ];
const BLOCK_COLS = 22;
const BLOCK_GAP = 2;
const BLOCK_MARGIN_TOP = 50;

class Block {
  constructor( x, y, color ) {
    this.x = x;
    this.y = y;
    this.width = SPRITES.blocks[ color ].sw;
    this.height = SPRITES.blocks[ color ].sh;
    this.color = color;
    this.broken = false;
    this.explosionFrame = null;
    this.explosionStart = null;
  }

  hit() {
    if ( this.broken ) return;
    this.broken = true;
    this.explosionFrame = 0;
    this.explosionStart = performance.now();
    breakSound.currentTime = 0;
    breakSound.play();
  }

  update() {
    if ( !this.broken || this.explosionFrame === null ) return;

    const elapsed = performance.now() - this.explosionStart;
    const frame = Math.floor( elapsed / EXPLOSION_DURATION );
    const frames = EXPLOSION_FRAMES[ this.color ];

    this.explosionFrame = frame < frames.length ? frame : null;
  }

  render() {
    if ( !this.broken ) {
      drawSprite( ctx, 'block_' + this.color, this.x, this.y, this.width, this.height );
      return;
    }

    if ( this.explosionFrame === null ) return;

    const frame = EXPLOSION_FRAMES[ this.color ][ this.explosionFrame ];
    drawFrame( ctx, frame, this.x, this.y, this.width, this.height );
  }
}

function createLevel() {
  const blocks = [];
  const blockWidth = SPRITES.blocks.red.sw;
  const blockHeight = SPRITES.blocks.red.sh;
  const totalWidth = BLOCK_COLS * ( blockWidth + BLOCK_GAP ) - BLOCK_GAP;
  const marginX = ( canvas.width - totalWidth ) / 2;

  BLOCK_ROWS.forEach( ( color, row ) => {
    for ( let col = 0; col < BLOCK_COLS; col++ ) {
      const x = marginX + col * ( blockWidth + BLOCK_GAP );
      const y = BLOCK_MARGIN_TOP + row * ( blockHeight + BLOCK_GAP );
      blocks.push( new Block( x, y, color ) );
    }
  } );

  return blocks;
}

function handleBlockCollisions( ball, blocks ) {
  for ( const block of blocks ) {
    if ( block.broken ) continue;

    const closestX = Math.max( block.x, Math.min( ball.x, block.x + block.width ) );
    const closestY = Math.max( block.y, Math.min( ball.y, block.y + block.height ) );
    const dx = ball.x - closestX;
    const dy = ball.y - closestY;

    if ( dx * dx + dy * dy > ball.radius * ball.radius ) continue;

    const overlapX = ball.radius - Math.abs( dx );
    const overlapY = ball.radius - Math.abs( dy );

    if ( overlapX < overlapY ) {
      ball.dx = -ball.dx;
      ball.x += dx > 0 ? overlapX : -overlapX;
    } else {
      ball.dy = -ball.dy;
      ball.y += dy > 0 ? overlapY : -overlapY;
    }

    bounceSound.currentTime = 0;
    bounceSound.play();

    block.hit();

    return block;
  }

  return null;
}
