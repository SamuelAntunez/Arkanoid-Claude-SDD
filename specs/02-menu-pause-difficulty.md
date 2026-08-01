# Spec: Menú Principal, Pausa y Dificultad

**Estado:** Approved
**Depende de:** SPEC 01 (Arkanoid Core)
**Fecha:** 2026-08-01

**Objetivo:** Añadir menú principal al cargar el juego con selección de dificultad (Fácil/Normal/Difícil, afecta velocidad de bola y persiste en localStorage), pausa con tecla Esc/P que congela la simulación y muestra overlay con Reanudar/Menú principal, y botón Menú principal en las pantallas de Game Over/Victoria.

---

## Scope

**Dentro:**
- Pantalla de Menú Principal al cargar `index.html` (antes de cualquier juego), con botones: Jugar y selector de Dificultad (Fácil/Normal/Difícil).
- Dificultad afecta la velocidad de la bola (magnitud del vector `dx`/`dy`); 3 niveles con velocidad escalada.
- Dificultad elegida se persiste en localStorage y se recuerda entre sesiones.
- Pausa activable con tecla `Esc` o `P` durante el juego: congela completamente la simulación (paddle, bola, colisiones) y muestra overlay semitransparente con botones "Reanudar" y "Menú principal".
- Botón "Menú principal" en pausa: abandona la partida en curso, vuelve al estado de Menú Principal (no afecta high score ya guardado).
- Botón "Menú principal" agregado a las pantallas de Game Over y Victoria (junto al "Reintentar" existente).
- High score pasa de un solo valor global a un valor por dificultad (3 claves en localStorage).

**Fuera (queda para specs futuras):**
- Power-ups / bloques especiales con bonus (SPEC 03).
- Múltiples niveles o progresión de niveles.
- Controles táctiles/móvil.
- Lista de top scores (sigue siendo un solo valor por dificultad, no historial).
- Pantalla de instrucciones/controles.
- Sonido/música específica para menú o pausa (se reutiliza lo existente, no se agrega nada nuevo).

---

## Modelo de datos

**Game** (`game.js`, extiende el existente)
```js
class Game {
  paddle, ball, blocks[]
  lives
  score
  difficulty       // 'easy' | 'normal' | 'hard'
  highScore        // leído de localStorage según difficulty actual
  state            // 'menu' | 'playing' | 'paused' | 'gameover' | 'win'
}
```

**Difficulty** (`difficulty.js`, nuevo)
```js
const DIFFICULTY_SPEEDS = {
  easy:   4,   // px/frame, velocidad inicial/constante de Ball.speed
  normal: 6,
  hard:   8,
};
```

**Menu** (`menu.js`, nuevo)
```js
class Menu {
  selectedDifficulty   // 'easy' | 'normal' | 'hard', refleja Game.difficulty
}
```
Sin instancia de estado propia más allá de qué difficulty está seleccionada — el resto se dibuja a partir de `Game.state === 'menu'`.

**Pause** (no requiere clase propia; overlay se dibuja cuando `Game.state === 'paused'`, reutilizando el `Game` congelado)

**localStorage**
- Claves: `arkanoid-highscore-easy`, `arkanoid-highscore-normal`, `arkanoid-highscore-hard` (reemplazan `arkanoid-highscore` de SPEC 01).
- Clave: `arkanoid-difficulty` — string plano (`'easy'|'normal'|'hard'`), última dificultad elegida.

Nota: esto **rompe** la clave `arkanoid-highscore` de SPEC 01 — se migra a 3 claves, sin migración automática del valor viejo (se pierde el high score único anterior, dato de prueba sin importancia).

---

## Plan de implementación

1. **Estado 'menu' y pantalla básica.** `menu.js` nuevo con botón "Jugar". `game.js` arranca en `state = 'menu'` en vez de `'playing'`. Al hacer click en "Jugar", pasa a `'playing'` con difficulty por defecto (`'normal'`). Juego funciona igual que antes, solo con un paso extra de menú.
2. **Selector de dificultad en el menú.** Agrega 3 botones (Fácil/Normal/Difícil) en `menu.js`. Selección actualiza `Game.difficulty` y la velocidad de `Ball` según `DIFFICULTY_SPEEDS` (`difficulty.js` nuevo) al iniciar partida. Menú visualmente muestra cuál está seleccionada.
3. **Persistencia de dificultad.** Al cambiar selección, se guarda en `arkanoid-difficulty`. Al cargar `index.html`, se lee esa clave y se preselecciona en el menú (default `'normal'` si no existe). Recargar la página recuerda la última dificultad.
4. **High score por dificultad.** Reemplaza lectura/escritura de `arkanoid-highscore` por `arkanoid-highscore-{difficulty}`. Se muestra en pantalla el high score correspondiente a la dificultad actual. Juego funcional con récords separados.
5. **Pausa.** Listener de teclado (`Esc`/`P`) en `game.js`: si `state === 'playing'`, pasa a `'paused'` y detiene el `update()` del loop (solo se sigue dibujando el último frame). Overlay semitransparente dibuja "Pausa" con botones "Reanudar" y "Menú principal", sin lógica de click todavía. Juego se puede pausar y ver el overlay, aunque los botones no hagan nada aún.
6. **Botones del overlay de pausa.** "Reanudar" vuelve a `state = 'playing'` y reanuda el loop. "Menú principal" resetea `Game` (paddle, bola, bloques, vidas, score) y pasa a `state = 'menu'`. Ciclo completo: jugar → pausar → reanudar o volver al menú.
7. **Botón "Menú principal" en Game Over y Victoria.** Se agrega junto al botón "Reintentar" existente en ambas pantallas, con la misma lógica de reseteo + `state = 'menu'` del paso 6. Feature completa.

---

## Criterios de aceptación

- [ ] Al cargar `index.html` se muestra el Menú Principal, no el juego directamente.
- [ ] El menú tiene un botón "Jugar" que inicia la partida.
- [ ] El menú tiene 3 opciones de dificultad (Fácil/Normal/Difícil) y muestra cuál está seleccionada.
- [ ] Elegir una dificultad distinta cambia la velocidad de la bola en la partida siguiente (Difícil > Normal > Fácil).
- [ ] La dificultad elegida se guarda en `localStorage` bajo `arkanoid-difficulty` y se recuerda al recargar la página.
- [ ] Cada dificultad tiene su propio high score, guardado en `arkanoid-highscore-easy`, `arkanoid-highscore-normal`, `arkanoid-highscore-hard`.
- [ ] En pantalla se muestra el high score correspondiente a la dificultad de la partida actual.
- [ ] Presionar `Esc` o `P` durante el juego pausa la partida: paddle y bola dejan de moverse.
- [ ] Al pausar se muestra un overlay semitransparente con botones "Reanudar" y "Menú principal".
- [ ] El botón "Reanudar" continúa la partida exactamente donde estaba (misma posición de bola/paddle, mismo score).
- [ ] El botón "Menú principal" (desde pausa) resetea la partida en curso y vuelve al Menú Principal.
- [ ] Las pantallas de Game Over y Victoria muestran, además de "Reintentar", un botón "Menú principal" que resetea y vuelve al menú.
- [ ] Recargar la página después de una partida no pierde el high score de ninguna dificultad ya jugada.

---

## Decisiones

- **Menú principal al cargar** en vez de arranque directo. Razón: decisión explícita del usuario, flujo estándar de juego arcade.
- **Dificultad solo afecta velocidad de bola** (no vidas iniciales). Razón: mantiene el cambio simple, un solo parámetro; otros efectos quedan para spec futura si hace falta.
- **Dificultad se fija en el menú, no cambia mid-partida.** Razón: decisión explícita del usuario, evita reiniciar lógica de dificultad a mitad de juego.
- **Difficulty persiste en localStorage** (`arkanoid-difficulty`). Razón: mismo patrón que high score existente, evita reelegir cada sesión.
- **High score por dificultad (3 claves)** en vez de uno solo global. Razón: decisión explícita del usuario — evita que un score en Fácil tape el récord de Difícil. Rompe la clave `arkanoid-highscore` de SPEC 01, sin migración (valor viejo se pierde).
- **Pausa congela la simulación por completo** en vez de seguir simulando detrás del overlay. Razón: decisión explícita del usuario, estándar arcade, evita bugs de colisión invisible.
- **Botón "Menú principal" agregado también a Game Over/Victoria.** Razón: decisión explícita del usuario, consistencia de navegación sin tener que recargar la página.
- **Sin clase de estado propia para Pause.** Razón: se resuelve con `Game.state === 'paused'`, evita una clase extra para algo que no tiene datos propios.

No se identificaron riesgos relevantes que ameriten sección aparte (sin backend, sin datos sensibles, cambio acotado a UI de flujo y localStorage).

---

## Qué **no** está en este spec

- Power-ups / bloques especiales con bonus (queda para SPEC 03).
- Múltiples niveles o progresión de niveles.
- Controles táctiles/móvil.
- Lista de top scores con historial.
- Pantalla de instrucciones/controles.
- Cambios de sonido/música para menú o pausa.

Cada uno, si se pide, va en su propio spec.
