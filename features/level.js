const BLOCK_CHAR_COLORS = {
  r: 'red', y: 'yellow', c: 'cyan', m: 'magenta',
  h: 'hotpink', g: 'green', a: 'gray',
};

const BLOCK_COLS = 22;
const BLOCK_GAP = 2;
const BLOCK_MARGIN_TOP = 50;

const LEVELS = [
  // Nivel 1: filas sólidas, un color por fila (patrón original)
  [
    'r'.repeat( 22 ),
    'y'.repeat( 22 ),
    'c'.repeat( 22 ),
    'm'.repeat( 22 ),
    'h'.repeat( 22 ),
    'g'.repeat( 22 ),
    'a'.repeat( 22 ),
  ],
  // Nivel 2: marco hueco
  [
    'y'.repeat( 22 ),
    'c' + '.'.repeat( 20 ) + 'c',
    'c' + '.'.repeat( 20 ) + 'c',
    'c' + '.'.repeat( 20 ) + 'c',
    'c' + '.'.repeat( 20 ) + 'c',
    'c' + '.'.repeat( 20 ) + 'c',
    'c' + '.'.repeat( 20 ) + 'c',
    'm'.repeat( 22 ),
  ],
  // Nivel 3: diamante
  [
    '.'.repeat( 10 ) + 'r'.repeat( 2 ) + '.'.repeat( 10 ),
    '.'.repeat( 9 ) + 'y'.repeat( 4 ) + '.'.repeat( 9 ),
    '.'.repeat( 8 ) + 'c'.repeat( 6 ) + '.'.repeat( 8 ),
    '.'.repeat( 7 ) + 'm'.repeat( 8 ) + '.'.repeat( 7 ),
    '.'.repeat( 6 ) + 'h'.repeat( 10 ) + '.'.repeat( 6 ),
    '.'.repeat( 5 ) + 'g'.repeat( 12 ) + '.'.repeat( 5 ),
    '.'.repeat( 6 ) + 'a'.repeat( 10 ) + '.'.repeat( 6 ),
    '.'.repeat( 7 ) + 'g'.repeat( 8 ) + '.'.repeat( 7 ),
    '.'.repeat( 8 ) + 'h'.repeat( 6 ) + '.'.repeat( 8 ),
    '.'.repeat( 9 ) + 'm'.repeat( 4 ) + '.'.repeat( 9 ),
    '.'.repeat( 10 ) + 'c'.repeat( 2 ) + '.'.repeat( 10 ),
  ],
  // Nivel 4: tablero de ajedrez
  [
    'h.'.repeat( 11 ),
    '.g'.repeat( 11 ),
    'h.'.repeat( 11 ),
    '.g'.repeat( 11 ),
    'h.'.repeat( 11 ),
    '.g'.repeat( 11 ),
    'h.'.repeat( 11 ),
    '.g'.repeat( 11 ),
    'h.'.repeat( 11 ),
    '.g'.repeat( 11 ),
  ],
  // Nivel 5: grilla densa de 9 filas, todos los colores
  [
    'r'.repeat( 22 ),
    'y'.repeat( 22 ),
    'c'.repeat( 22 ),
    'm'.repeat( 22 ),
    'h'.repeat( 22 ),
    'g'.repeat( 22 ),
    'a'.repeat( 22 ),
    'r'.repeat( 22 ),
    'y'.repeat( 22 ),
  ],
];

function createLevel( levelIndex ) {
  const blocks = [];
  const blockWidth = SPRITES.blocks.red.sw;
  const blockHeight = SPRITES.blocks.red.sh;
  const totalWidth = BLOCK_COLS * ( blockWidth + BLOCK_GAP ) - BLOCK_GAP;
  const marginX = ( canvas.width - totalWidth ) / 2;
  const grid = LEVELS[ levelIndex ];

  grid.forEach( ( rowStr, row ) => {
    for ( let col = 0; col < rowStr.length; col++ ) {
      const char = rowStr[ col ];
      if ( char === '.' || char === ' ' ) continue;

      const color = BLOCK_CHAR_COLORS[ char ];
      const x = marginX + col * ( blockWidth + BLOCK_GAP );
      const y = BLOCK_MARGIN_TOP + row * ( blockHeight + BLOCK_GAP );
      blocks.push( new Block( x, y, color ) );
    }
  } );

  return blocks;
}
