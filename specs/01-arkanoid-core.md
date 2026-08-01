# Spec: Arkanoid Core

**Estado:** Draft
**Depende de:** Ninguna (primera spec del proyecto)
**Fecha:** 2026-08-01

**Objetivo:** Construir un clon jugable de Arkanoid en un canvas 800x600 con un nivel fijo de bloques por color, física de rebote dependiente del punto de contacto, 3 vidas, puntuación en pantalla con high score persistido en localStorage, y pantallas de victoria/derrota con botón de reintentar.

---

## Scope

**Dentro:**
- Un nivel fijo con bloques organizados por color (filas por color, usando los 7 colores del spritesheet: gray, red, yellow, cyan, magenta, hotpink, green).
- Paddle controlable con teclado (flechas o A/D) y mouse.
- Bola con física de rebote: ángulo depende del punto de contacto con el paddle; rebote espejo en paredes y bloques.
- Sistema de vidas: 3 vidas, se pierde una si la bola cae debajo del paddle.
- Puntuación en pantalla, sumada al romper bloques.
- High score persistido en localStorage (un solo valor).
- Animación de explosión (`EXPLOSION_FRAMES`) al romper un bloque, antes de que desaparezca.
- Sonidos: `ball-bounce.mp3` en rebote (pared/paddle/bloque), `break-sound.mp3` al destruir bloque.
- Pantalla de Game Over (agotar vidas) con botón de reintentar.
- Pantalla de Victoria (romper todos los bloques) con botón de reintentar, igual en estructura a Game Over.
- Canvas fijo 800x600.

**Fuera (queda para specs futuras):**
- Power-ups / bloques especiales con bonus.
- Múltiples niveles o progresión de niveles.
- Menú principal, pausa, selección de dificultad.
- Controles táctiles/móvil.
- Lista de top scores (solo se guarda un valor).

---

## Modelo de datos

**Paddle** (`paddle.js`)
```js
class Paddle {
  x, y, width, height
  speed          // px/frame, movimiento por teclado
}
```

**Ball** (`ball.js`)
```js
class Ball {
  x, y, radius
  dx, dy         // velocidad vector, recalculado al rebotar en paddle según punto de contacto
  speed          // magnitud constante del vector
}
```

**Block** (`block.js`)
```js
class Block {
  x, y, width, height
  color          // 'gray' | 'red' | 'yellow' | 'cyan' | 'magenta' | 'hotpink' | 'green'
  broken         // bool
  explosionFrame // índice actual en EXPLOSION_FRAMES[color], null si no explotando
}
```

**Game** (`game.js`)
```js
class Game {
  paddle, ball, blocks[]     // instancia única de cada uno
  lives                      // arranca en 3
  score                      // arranca en 0
  highScore                  // leído de localStorage al iniciar
  state                      // 'playing' | 'gameover' | 'win'
}
```

**localStorage**
- Clave: `arkanoid-highscore`
- Valor: número plano (string numérica), sin versionado — spec futura decide si hace falta migrar.

---

## Plan de implementación

1. **Scaffold.** `index.html` con canvas 800x600, carga `assets/spritesheet.js` y sonidos. Loop de render básico que dibuja solo el fondo. Sistema arranca y se ve el canvas vacío.
2. **Paddle.** `paddle.js` con sprite, movimiento por teclado (flechas/A-D) y mouse, limitado a los bordes del canvas. Se ve y se mueve.
3. **Ball básica.** `ball.js`: bola visible, se mueve con `dx`/`dy`, rebota en paredes (izq/der/arriba) y en el paddle con ángulo según punto de contacto. Sonido `ball-bounce.mp3` en cada rebote. Si cae abajo, por ahora solo rebota en el suelo (temporal, se corrige en paso 6). Juego jugable: mover paddle, ver bola rebotar.
4. **Bloques y colisión.** `block.js`: genera layout fijo (filas por color), renderiza bloques, detecta colisión bola-bloque con rebote correcto. Bloques no desaparecen aún. Juego jugable con bloques sólidos.
5. **Rotura de bloques.** Al colisionar: bloque entra en estado `broken`, se reproduce animación de `EXPLOSION_FRAMES`, suena `break-sound.mp3`, luego desaparece. Suma a `score`, mostrado en pantalla. Juego jugable con bloques que se rompen y puntúan.
6. **Vidas y Game Over.** Si la bola cae debajo del paddle: resta vida, resetea posición de bola/paddle. Al llegar a 0 vidas: `state = 'gameover'`, se detiene el loop de juego, se muestra pantalla de Game Over con botón de reintentar (reinicia todo el estado). Juego completo con derrota funcional.
7. **Victoria.** Al romper todos los bloques: `state = 'win'`, se detiene el loop, se muestra pantalla de Victoria (misma estructura que Game Over) con botón de reintentar. Juego completo con ambos finales.
8. **High score.** Al llegar a Game Over o Win, compara `score` contra `arkanoid-highscore` en localStorage, actualiza si es mayor, y lo muestra en pantalla junto al score actual en todo momento. Juego terminado, feature completa.

---

## Criterios de aceptación

- [ ] Canvas 800x600 se renderiza con paddle, bola y bloques usando sprites de `assets/spritesheet-breakout.png`.
- [ ] Paddle se mueve con teclado (flechas o A/D) y con mouse, sin salir de los límites del canvas.
- [ ] Bola rebota en paredes izquierda, derecha y superior.
- [ ] Bola rebota en el paddle con ángulo distinto según el punto de contacto (golpe en el borde ≠ golpe al centro).
- [ ] Bola rebota en bloques y el bloque impactado queda marcado como roto.
- [ ] Al romper un bloque se reproduce la animación de `EXPLOSION_FRAMES` del color correspondiente antes de que el bloque desaparezca.
- [ ] Se reproduce `ball-bounce.mp3` en cada rebote (pared, paddle, bloque).
- [ ] Se reproduce `break-sound.mp3` al romper un bloque.
- [ ] El score aumenta al romper cada bloque y se muestra en pantalla en todo momento.
- [ ] Perder una vida (bola cae debajo del paddle) resetea posición de bola y paddle, y descuenta una vida.
- [ ] Al llegar a 0 vidas se muestra pantalla de Game Over con botón de reintentar, y el loop de juego se detiene.
- [ ] Al romper todos los bloques se muestra pantalla de Victoria con botón de reintentar, y el loop de juego se detiene.
- [ ] El botón de reintentar (en ambas pantallas) reinicia vidas, score, paddle, bola y bloques al estado inicial.
- [ ] Al finalizar una partida (Game Over o Victoria), si `score` supera el valor guardado en `arkanoid-highscore` de localStorage, se actualiza; el high score se muestra en pantalla en todo momento.

---

## Decisiones tomadas y descartadas

- **Un solo nivel fijo** en vez de sistema de niveles. Razón: mantener el core simple; progresión de niveles queda para spec futura.
- **Power-ups fuera de alcance.** Razón: usuario decidió explícitamente dejarlos para otro spec, evita mezclar mecánicas nuevas con el core.
- **Ángulo de rebote dependiente del punto de contacto** en vez de rebote espejo simple en el paddle. Razón: se siente más como Arkanoid real, decisión explícita del usuario.
- **Un solo high score** en localStorage, sin lista top N ni versionado de esquema. Razón: simplicidad, no se pidió historial.
- **Canvas fijo 800x600**, no responsive. Razón: evita distorsión de sprites al escalar, decisión explícita del usuario.
- **Archivos separados por clase** (`paddle.js`, `ball.js`, `block.js`, `game.js`) en vez de todo en un archivo. Razón: mantenibilidad, decisión explícita del usuario.
- **Pantalla de Victoria con misma estructura que Game Over** (botón de reintentar) en vez de una experiencia distinta. Razón: simplicidad, decisión explícita del usuario.

No se identificaron riesgos relevantes que ameriten sección aparte (sin backend, sin datos sensibles, sin dependencias externas).
