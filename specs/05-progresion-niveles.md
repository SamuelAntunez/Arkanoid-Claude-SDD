# Spec: Progresión de niveles

**Estado:** Implementado
**Depende de:** SPEC 01 (Arkanoid Core), SPEC 02 (Menú, Pausa y Dificultad), SPEC 03 (Power-ups)
**Fecha:** 2026-08-01

**Objetivo:** Reemplazar el nivel único fijo por 5 niveles con patrones de bloques distintos (definidos como grillas de caracteres), que se juegan en secuencia conservando vidas y puntaje, mostrando una pantalla de "Nivel completado" entre cada uno.

---

## Scope

**Dentro:**
- 5 niveles con patrón de bloques distinto cada uno, definidos como grilla de caracteres (string por fila, cada char mapea a color o espacio vacío) en `features/level.js` nuevo.
- `createLevel(levelIndex)` reemplaza al `createLevel()` actual, genera bloques según la grilla del nivel pedido.
- Al romper todos los bloques de un nivel que no es el 5° (último): pantalla "Nivel completado" con botones "Siguiente nivel" y "Menú principal" (misma estructura visual que Game Over/Victoria).
- Al confirmar "Siguiente nivel": incrementa `Game.level`, regenera `blocks` con el layout del nuevo nivel, resetea paddle (`resetPosition()`) y bola (`respawnBall()`) igual que al perder una vida, resetea `activeEffects` (efectos de power-up no persisten entre niveles), vuelve a `state = 'playing'`.
- Vidas y score se conservan entre niveles (no se resetean al avanzar).
- Al romper todos los bloques del nivel 5: pantalla de Victoria actual, sin cambios (`state = 'win'`, mismo `renderEndScreen`).
- HUD muestra "Nivel X/5" junto al score/high score existente.

**Fuera (queda para specs futuras):**
- Velocidad de bola o dificultad extra por nivel (la velocidad sigue dependiendo solo de la dificultad elegida en el menú, igual que hoy).
- Selección manual de nivel (siempre se juega 1→5 en orden, sin saltar).
- Guardar progreso de nivel entre sesiones (si se recarga la página, se vuelve a empezar desde nivel 1; no hay persistencia de nivel en localStorage).
- Layouts generados proceduralmente o aleatorios — los 5 son fijos, escritos a mano.
- Ajustar `POWERUP_DROP_CHANCE` o reglas de power-ups por nivel.

---

## Modelo de datos

**features/level.js** (nuevo)
```js
const BLOCK_CHAR_COLORS = {
  r: 'red', y: 'yellow', c: 'cyan', m: 'magenta',
  h: 'hotpink', g: 'green', a: 'gray',
};
// '.' o ' ' = hueco, sin bloque

const LEVELS = [
  [ 'rrrrrrrrrrrrrrrrrrrrrr', 'yyyyyyyyyyyyyyyyyyyyyy', ... ], // nivel 1 (patrón actual, 7 filas llenas)
  [ ... ], // nivel 2
  [ ... ], // nivel 3
  [ ... ], // nivel 4
  [ ... ], // nivel 5
];

function createLevel( levelIndex ) {
  // igual que createLevel() actual pero itera LEVELS[levelIndex] fila por fila,
  // columna por columna, salteando '.'/' ', usando BLOCK_CHAR_COLORS[char]
}
```

**Game** (`game.js`, extiende el existente)
```js
class Game {
  // ...existing fields
  level          // índice 0-based del nivel actual (0 = nivel 1); arranca en 0 en startGame()
}
```

`state` gana un valor nuevo: `'levelcomplete'` (entre `'playing'` y `'win'`).

`features/block.js` pierde `BLOCK_ROWS`, `BLOCK_COLS` pasa a `features/level.js` (columnas siguen siendo 22, fijas para las 5 grillas), y la función `createLevel()` se elimina de ahí (se reemplaza por la de `level.js`).

No hay nuevas claves de `localStorage` (el nivel no persiste entre sesiones, según lo definido en el scope).

---

## Plan de implementación

1. **Layouts de nivel.** Crear `features/level.js` con `BLOCK_CHAR_COLORS`, las 5 grillas en `LEVELS[]` (nivel 1 = patrón actual de 7 filas, niveles 2-5 con patrones nuevos: huecos, formas, distinta cantidad de filas) y `createLevel(levelIndex)`. En `game.js`, `startGame()` inicializa `this.level = 0` y llama `createLevel(this.level)` en vez del `createLevel()` viejo. Quitar `BLOCK_ROWS`/`BLOCK_COLS`/`createLevel()` de `block.js`. Juego funcional: se sigue jugando igual que antes, solo nivel 1 (mismo patrón), sin progresión todavía.

2. **Transición entre niveles.** En `update()`, cuando todos los bloques están rotos: si `this.level < 4` pasa a `state = 'levelcomplete'` (en vez de `'win'`); si `this.level === 4` mantiene el comportamiento actual (`state = 'win'`). Agregar `nextLevelButtonBounds()`/`levelCompleteMenuButtonBounds()` y `renderLevelCompleteScreen()` (misma estructura visual que `renderEndScreen`, título "¡Nivel completado!", botones "Siguiente nivel" y "Menú principal"). En `onClick()`, manejar `state === 'levelcomplete'`: "Siguiente nivel" incrementa `this.level`, regenera `this.blocks = createLevel(this.level)`, resetea `this.paddle.resetPosition()`, `this.respawnBall()`, `this.activeEffects = { size: null, speed: null }`, vuelve a `state = 'playing'`; "Menú principal" pasa a `state = 'menu'`. Juego funcional: se puede jugar los 5 niveles en secuencia, vidas y score se conservan, efectos de power-up se resetean al pasar de nivel.

3. **HUD de nivel.** En `renderHud()`, agregar texto "Nivel `level+1`/5" junto al score/high score existente. Feature completa.

---

## Criterios de aceptación

- [x] Existen 5 niveles con patrones de bloques distintos, definidos como grillas de caracteres en `features/level.js`.
- [x] El nivel 1 tiene el mismo patrón que el nivel único actual (7 filas por color, 22 columnas).
- [x] Al romper todos los bloques de los niveles 1 a 4, se muestra la pantalla "¡Nivel completado!" con botones "Siguiente nivel" y "Menú principal", y el loop de juego deja de avanzar el gameplay (igual que Game Over/Victoria).
- [x] Al hacer clic/tap en "Siguiente nivel": se carga el patrón de bloques del nivel siguiente, el paddle y la bola vuelven a su posición inicial, los efectos de power-up activos se cancelan, y el juego vuelve a `'playing'`.
- [x] Vidas y score NO se resetean al pasar de nivel (se conservan del nivel anterior).
- [x] Al hacer clic/tap en "Menú principal" desde la pantalla de nivel completado, se vuelve al menú principal.
- [x] Al romper todos los bloques del nivel 5, se muestra la pantalla de Victoria existente (sin cambios), no la de "Nivel completado".
- [x] El HUD muestra "Nivel X/5" (X = nivel actual, 1-based) en todo momento durante `'playing'`, `'paused'` y `'levelcomplete'`.
- [x] Si se pierde la última vida en cualquier nivel (no solo el 1°), se muestra Game Over normalmente (sin importar en qué nivel se esté).
- [x] Al recargar la página o volver al menú y jugar de nuevo, la partida arranca siempre desde el nivel 1.

---

## Decisiones tomadas y descartadas

- **5 niveles fijos escritos a mano** (grillas de caracteres) en vez de generación procedural. Razón: decisión explícita del usuario, simplicidad y control total sobre el balance de cada patrón.
- **Grilla de caracteres por fila** en vez de array de posiciones explícitas {row,col,color}. Razón: decisión explícita del usuario, más compacto y fácil de editar a mano que una lista de objetos.
- **Solo el patrón de bloques cambia por nivel; la velocidad de bola sigue dependiendo únicamente de la dificultad elegida en el menú.** Razón: decisión explícita del usuario, evita mezclar dos sistemas de dificultad (menú + nivel) y mantiene la progresión enfocada en el layout.
- **Vidas y score se conservan entre niveles; efectos de power-up se resetean.** Razón: decisión explícita del usuario — vidas/score dan sensación de partida continua (como Arkanoid clásico), mientras que los efectos temporales no tendría sentido que sobrevivieran a un cambio de layout.
- **Pantalla "Nivel completado" con click-to-continue** (botón "Siguiente nivel") en vez de auto-avance por timer. Razón: decisión explícita del usuario, consistente con el resto del juego que es 100% click-driven, sin introducir un timer nuevo.
- **Pantalla "Nivel completado" con dos botones** ("Siguiente nivel" + "Menú principal"), misma estructura que Game Over/Victoria. Razón: decisión explícita del usuario, consistencia de UI y permite abandonar la partida sin tener que perder.
- **Nivel 5 conserva la pantalla de Victoria actual sin cambios.** Razón: decisión explícita del usuario, evita tocar código que ya funciona; no se pidió texto adicional sobre "completaste los 5 niveles".
- **HUD muestra "Nivel X/5" en todo momento durante la partida.** Razón: decisión explícita del usuario, da feedback de progreso sin necesidad de abrir un menú.
- **Sin persistencia del nivel en localStorage.** Razón: decisión explícita del usuario (fuera de alcance), cada partida nueva arranca en nivel 1; evita versionar un nuevo esquema de guardado.
- **Nuevo archivo `features/level.js`** en vez de agregar las grillas a `block.js` existente. Razón: decisión explícita del usuario, separa datos de nivel (qué se dibuja) de la clase `Block` (cómo se dibuja/rompe).

No se identificaron riesgos relevantes que ameriten sección aparte (sin backend, sin datos sensibles; el cambio de mayor alcance —reemplazar `createLevel()` único por `createLevel(levelIndex)`— está acotado y descrito en el paso 1 del plan).

---

## Qué **no** está en este spec

- Velocidad de bola o dificultad extra por nivel.
- Selección manual de nivel.
- Persistencia de nivel en localStorage.
- Layouts procedurales/aleatorios.
- Ajustes de power-ups por nivel.

Cada uno, si se pide, va en su propio spec.
