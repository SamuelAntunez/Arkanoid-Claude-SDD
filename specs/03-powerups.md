# Spec: Power-ups

**Estado:** Aprobado
**Depende de:** SPEC 01 (Arkanoid Core), SPEC 02 (Menú Principal, Pausa y Dificultad)
**Fecha:** 2026-08-01

**Objetivo:** Al romper un bloque hay 15% de probabilidad de que caiga un power-up (paddle grande, paddle chico, multi-bola o bola lenta/rápida) que el jugador recoge con el paddle, con efectos temporales de 10 segundos mostrados en el HUD.

---

## Scope

**Dentro:**
- 4 tipos de power-up: Paddle grande, Paddle chico, Multi-bola, Bola lenta/rápida (2 variantes: lenta y rápida).
- Al romper un bloque, 15% de probabilidad de soltar un power-up; tipo elegido al azar de forma uniforme entre los 4/5 disponibles.
- El power-up cae en línea recta desde el bloque roto; si el paddle lo toca se activa; si toca el suelo, se pierde sin efecto.
- Representación visual: círculo de color con letra inicial (sin usar el spritesheet existente).
- Efectos temporales de 10 segundos (`POWERUP_DURATION`).
- Reglas de combinación:
  - Mismo tipo recogido de nuevo: reinicia el timer (no se acumula el efecto).
  - Paddle grande y Paddle chico son mutuamente excluyentes: el último agarrado reemplaza al anterior (tamaño + timer).
  - Bola lenta y Bola rápida son mutuamente excluyentes entre sí, mismo criterio.
  - Efectos de distinta categoría (tamaño de paddle vs velocidad de bola vs multi-bola) conviven sin interferir.
- Multi-bola: clona la bola actual en la misma posición con ángulo espejado; se pierde una vida solo cuando cae la última bola en juego.
- HUD: se muestran los power-ups activos con ícono/letra y segundos restantes.

**Fuera (queda para specs futuras):**
- Power-ups negativos adicionales o power-ups de bonus de puntos.
- Vida extra como power-up.
- Bloques especiales que sueltan power-up garantizado (todo es probabilístico).
- Sonido específico para recoger/perder power-up (se puede reutilizar `ball-bounce.mp3` si aplica, sin agregar nuevo asset).
- Balanceo fino de probabilidades por dificultad (el 15% es igual en las 3 dificultades).

---

## Modelo de datos

**Powerup** (`powerup.js`, nuevo)
```js
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
  x, y, radius       // cae en línea recta
  type               // uno de POWERUP_TYPES
  dy                 // velocidad de caída, constante
}
```

**Paddle** (`paddle.js`, extiende el existente)
```js
class Paddle {
  baseWidth          // ancho original (el actual SPRITES.paddle.sw)
  widthScale         // 1 por defecto; 1.5 si paddle-big activo, 0.6 si paddle-small activo
  // width se deriva: baseWidth * widthScale
}
```

**Game** (`game.js`, extiende el existente)
```js
class Game {
  paddle, blocks[]
  balls[]            // reemplaza `ball` único; arranca con 1, multi-bola agrega otra
  powerups[]         // power-ups cayendo actualmente en pantalla
  activeEffects      // { size: { type, expiresAt } | null, speed: { type, expiresAt } | null }
  lives, score, difficulty, highScore, state
}
```

`expiresAt` guardado como `performance.now() + POWERUP_DURATION * 1000`, mismo patrón que ya usa `Block.explosionStart`.

---

## Plan de implementación

1. **Caída de power-ups.** `powerup.js` nuevo con clase `Powerup` y constantes. En `Block.hit()` (o en `handleBlockCollisions`), 15% de probabilidad de crear un `Powerup` de tipo aleatorio en el centro del bloque roto. `Game.powerups[]` los actualiza (caen) y renderiza (círculo + letra). Si `y` supera `canvas.height`, se elimina del array sin efecto. Juego funcional: se ven caer power-ups que desaparecen al tocar el suelo, sin recogerse aún.
2. **Recolección.** Detección de colisión paddle-powerup en `Game.update()`: si el paddle lo toca, se elimina de `powerups[]` (todavía sin aplicar ningún efecto). Juego funcional: los power-ups se pueden "agarrar" y desaparecen, confirma la mecánica de recolección.
3. **Efecto de tamaño de paddle.** Al recoger `paddle-big`/`paddle-small`, se setea `activeEffects.size = { type, expiresAt }` y `paddle.widthScale` según `POWERUP_CONFIG`. Si ya hay un efecto de tamaño activo, se reemplaza (mismo tipo reinicia timer, tipo opuesto reemplaza). Al expirar (`performance.now() > expiresAt`, chequeado en `update()`), `widthScale` vuelve a 1. Juego jugable con paddle que cambia de tamaño temporalmente.
4. **Efecto de velocidad de bola.** Mismo patrón que el paso 3 pero con `activeEffects.speed` y `ball.speed` escalado por `POWERUP_CONFIG[type].speedScale`; recalcula `dx`/`dy` manteniendo el ángulo actual. Al expirar, vuelve a la velocidad base de la dificultad (`DIFFICULTY_SPEEDS[difficulty]`). Juego jugable con velocidad de bola temporal.
5. **Multi-bola.** `Game.ball` (singular) se reemplaza por `Game.balls[]`. Todo el código que usaba `this.ball` pasa a iterar `this.balls`. Al recoger `multi-ball`, se clona la bola existente en la misma posición con ángulo espejado (`dx` invertido) y se agrega al array. Perder vida ocurre solo cuando `balls.length === 0` (todas cayeron). Juego jugable con múltiples bolas simultáneas.
6. **HUD de power-ups activos.** `renderHud()` muestra, para cada efecto activo en `activeEffects`, su letra/color y los segundos restantes (`Math.ceil((expiresAt - performance.now()) / 1000)`). Feature completa.

---

## Criterios de aceptación

- [ ] Al romper un bloque, aproximadamente 1 de cada ~6-7 bloques (15%) suelta un power-up visible (círculo de color con letra).
- [ ] El power-up cae en línea recta hacia abajo desde la posición del bloque roto.
- [ ] Si el power-up llega al borde inferior del canvas sin ser tocado por el paddle, desaparece sin efecto.
- [ ] Si el paddle toca el power-up, este desaparece y se activa su efecto.
- [ ] "Paddle grande" ensancha el paddle 1.5x durante 10 segundos; al expirar vuelve al ancho normal.
- [ ] "Paddle chico" achica el paddle a 0.6x durante 10 segundos; al expirar vuelve al ancho normal.
- [ ] Recoger "paddle chico" estando "paddle grande" activo reemplaza el efecto (ancho y timer del nuevo tipo).
- [ ] "Bola lenta" reduce la velocidad de la bola a 0.6x durante 10 segundos; al expirar vuelve a la velocidad base de la dificultad.
- [ ] "Bola rápida" aumenta la velocidad de la bola a 1.5x durante 10 segundos; al expirar vuelve a la velocidad base de la dificultad.
- [ ] Recoger el mismo tipo de power-up mientras está activo reinicia su duración a 10 segundos completos.
- [ ] "Multi-bola" agrega una segunda bola clonada en la misma posición con ángulo espejado; ambas bolas rebotan e interactúan con bloques normalmente.
- [ ] Con 2+ bolas en juego, perder una de ellas (cae debajo del paddle) no resta vida mientras quede al menos una bola activa.
- [ ] Se pierde una vida únicamente cuando la última bola en juego cae debajo del paddle.
- [ ] El HUD muestra los power-ups activos (letra/color) junto con los segundos restantes de cada efecto.

---

## Decisiones

- **5 variantes de power-up** (paddle-big, paddle-small, multi-ball, ball-slow, ball-fast) en vez de solo 4. Razón: bola lenta y bola rápida son variantes independientes del mismo tipo "velocidad de bola", cuentan como 2 opciones dentro del reparto uniforme del 15%.
- **Probabilidad fija de 15% por bloque roto**, reparto uniforme entre los 5 tipos. Razón: simplicidad, decisión explícita del usuario; no se pidió balanceo por dificultad o por color de bloque.
- **Círculo de color + letra** en vez de sprites nuevos. Razón: el spritesheet existente no tiene arte de power-ups; agregar un asset nuevo está fuera de alcance de este spec.
- **Reglas de combinación por categoría** (tamaño de paddle y velocidad de bola son mutuamente excluyentes dentro de su propia categoría, pero categorías distintas conviven). Razón: decisión explícita del usuario, evita estados confusos como paddle grande+chico simultáneo.
- **Multi-bola no tiene timer ni expira** — una vez agregada, la bola extra permanece hasta que cae. Razón: a diferencia de los otros power-ups, no tiene sentido un "efecto temporal" para una bola física; se pierde por gameplay (cae), no por reloj.
- **Vida se pierde solo cuando cae la última bola.** Razón: decisión explícita del usuario, hace que multi-bola sea un power-up de ventaja real y no solo cosmético.
- **`Game.ball` (singular) se refactoriza a `Game.balls[]`.** Razón: necesario para soportar multi-bola sin mantener dos rutas de código (una bola vs varias); el resto de la lógica (colisión con bloques, paddle, paredes) se aplica igual a cada bola del array.
- **HUD muestra segundos restantes por efecto activo.** Razón: decisión explícita del usuario, mejora feedback al jugador sobre cuándo termina cada efecto.

No se identificaron riesgos relevantes que ameriten sección aparte (sin backend, sin datos sensibles; el cambio de mayor riesgo técnico —refactor a `balls[]`— queda acotado y descrito en el plan de implementación paso 5).

---

## Qué **no** está en este spec

- Power-ups negativos adicionales o power-ups de bonus de puntos.
- Vida extra como power-up.
- Bloques especiales que sueltan power-up garantizado.
- Sonido específico para power-ups.
- Balanceo de probabilidad por dificultad.

Cada uno, si se pide, va en su propio spec.
