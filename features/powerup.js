const POWERUP_TYPES = [ 'paddle-big', 'paddle-small', 'multi-ball', 'ball-slow', 'ball-fast' ];
const POWERUP_DROP_CHANCE = 0.15;
const POWERUP_DURATION = 10; // segundos, efectos temporales

const POWERUP_CONFIG = {
  'paddle-big':   { label: 'G', color: '#2a2', paddleScale: 1.5 },
  'paddle-small': { label: 'P', color: '#a22', paddleScale: 0.6 },
  'multi-ball':   { label: 'M', color: '#22a' },
  'ball-slow':    { label: 'L', color: '#aa2', speedScale: 0.6 },
  'ball-fast':    { label: 'R', color: '#e70', speedScale: 1.5 },
};

class Powerup {
  constructor( x, y, type ) {
    this.x = x;
    this.y = y;
    this.radius = 12;
    this.type = type;
    this.dy = 2;
  }

  update() {
    this.y += this.dy;
  }

  render() {
    const config = POWERUP_CONFIG[ this.type ];

    ctx.fillStyle = config.color;
    ctx.beginPath();
    ctx.arc( this.x, this.y, this.radius, 0, Math.PI * 2 );
    ctx.fill();

    ctx.fillStyle = '#fff';
    ctx.font = '14px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText( config.label, this.x, this.y );
    ctx.textBaseline = 'top';
  }
}

function maybeSpawnPowerup( block ) {
  if ( Math.random() > POWERUP_DROP_CHANCE ) return null;

  const type = POWERUP_TYPES[ Math.floor( Math.random() * POWERUP_TYPES.length ) ];
  const x = block.x + block.width / 2;
  const y = block.y + block.height / 2;

  return new Powerup( x, y, type );
}
