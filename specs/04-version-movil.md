# Spec: Versión móvil (touch + responsive)

**Estado:** Aprobado
**Depende de:** SPEC 01 (Arkanoid Core), SPEC 02 (Menú Principal, Pausa y Dificultad), SPEC 03 (Power-ups)
**Fecha:** 2026-08-01

**Objetivo:** Hacer el juego jugable en móvil agregando control táctil del paddle (tap mueve a esa posición X), canvas responsive que escala manteniendo proporción, y un botón de Menú/Pausa visible en pantalla para desktop y móvil.

---

## Scope

**Dentro:**
- Meta tag viewport en `index.html` para escalado correcto en móvil.
- Canvas escala vía CSS manteniendo proporción 800x600 (resolución interna del canvas no cambia, solo su tamaño visual).
- Control táctil del paddle: `touchstart`/`touchmove` traducen posición X del toque al mismo movimiento que ya usa `mousemove`; mouse y touch conviven sin conflicto.
- Nuevo botón de Menú/Pausa dibujado en el canvas, esquina superior derecha, visible durante `state === 'playing'` en ambos modos (desktop y móvil). Tocarlo/clickearlo pausa igual que `Esc`/`P`.
- Tamaño mínimo del nuevo botón: 44x44px (mínimo recomendado táctil).

**Fuera (queda para specs futuras):**
- Agrandar hitboxes de botones existentes (Jugar, dificultad, Reanudar, Menú principal, Reintentar) — ya miden 200x50, superan el mínimo recomendado, no necesitan cambio.
- Layout vertical/portrait distinto al horizontal actual (se escala el mismo layout 800x600, no se rediseña para pantalla angosta).
- Controles alternativos (joystick virtual, botones izquierda/derecha).
- Ajustes de gameplay específicos para móvil (dificultad, velocidad, etc.).
- PWA / instalación / ícono de app.

---

## Modelo de datos

Esta feature no introduce estructuras de datos nuevas persistentes. Solo agrega:

**Game** (`game.js`, extiende el existente)
```js
class Game {
  // ...existing fields
  getMenuButtonRect()   // { x, y, w: 44, h: 44 } — esquina superior derecha del canvas, visible en 'playing'
}
```

**Paddle** (`paddle.js`, extiende el existente)
```js
class Paddle {
  // ...existing fields
  onTouchMove( e )   // mismo cálculo que onMouseMove, usa e.touches[0].clientX
}
```

**index.html**
```html
<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1">
```
```css
canvas {
  width: 100%;
  max-width: 800px;
  height: auto;
}
```

No hay nuevas claves de `localStorage` ni nuevos archivos.

---

## Plan de implementación

1. **Viewport y escalado responsive.** Agregar meta tag viewport en `index.html` y CSS (`canvas { width: 100%; max-width: 800px; height: auto; }`). Juego funcional: se ve escalado correctamente en pantalla móvil, sin cambios de lógica.
2. **Input táctil del paddle.** En `paddle.js`, agregar listeners `touchstart`/`touchmove` en el canvas que calculan la posición X igual que `onMouseMove` (usando `e.touches[0].clientX` y `getBoundingClientRect`). Juego funcional: paddle se mueve arrastrando el dedo, mouse sigue funcionando igual.
3. **Botón de Menú/Pausa en pantalla.** En `game.js`, agregar `getMenuButtonRect()` (esquina superior derecha, 44x44px), dibujarlo en `render()` cuando `state === 'playing'`, y agregar el hit-test en el `onClick()` existente para que tocarlo/clickearlo dispare la misma transición a `'paused'` que ya usan `Esc`/`P`. Juego funcional y feature completa: pausar funciona con teclado en desktop y con el botón en ambos modos.

---

## Criterios de aceptación

- [ ] `index.html` incluye meta tag viewport (`width=device-width, initial-scale=1, maximum-scale=1`).
- [ ] En una ventana angosta (simulando móvil), el canvas se escala manteniendo proporción 800x600, sin recortarse ni desbordar la pantalla.
- [ ] Arrastrar el dedo sobre el canvas mueve el paddle a la posición X del toque, igual que el mouse.
- [ ] El mouse sigue moviendo el paddle normalmente en desktop, sin conflicto con el código táctil.
- [ ] Durante `'playing'`, se ve un botón de Menú/Pausa en la esquina superior derecha del canvas, de al menos 44x44px.
- [ ] Tocar o clickear ese botón pausa el juego igual que presionar `Esc`/`P` (muestra el overlay de pausa existente).
- [ ] `Esc`/`P` siguen funcionando igual que antes en desktop.

---

## Decisiones

- **Escalado por CSS (width:100%, max-width:800px, height:auto)** en vez de redimensionar el canvas internamente o recalcular coordenadas del juego. Razón: decisión explícita del usuario, cero riesgo sobre la lógica existente (colisiones, posiciones), el canvas interno sigue siendo 800x600 siempre.
- **Sin layout distinto para portrait/vertical.** Razón: decisión explícita del usuario, se escala el mismo layout horizontal; rediseño de layout queda fuera de alcance.
- **Tap mueve el paddle a la posición X tocada** (mismo comportamiento que el mouse ya tiene), en vez de botones o joystick virtual. Razón: decisión explícita del usuario, reutiliza la lógica de `onMouseMove` sin duplicar sistemas de control.
- **Botón de Menú/Pausa nuevo, visible en ambos modos** (no solo en móvil). Razón: decisión explícita del usuario, evita lógica condicional de detección de dispositivo y da consistencia de UI entre desktop y móvil.
- **Mínimo 44x44px solo para el botón nuevo.** Razón: los botones existentes (200x50) ya superan el mínimo recomendado, no hace falta tocarlos.
- **Touch y mouse conviven sin exclusión mutua.** Razón: decisión explícita del usuario, un dispositivo híbrido (laptop táctil) puede usar cualquiera de los dos sin romper el otro.

No se identificaron riesgos relevantes que ameriten sección aparte (cambio acotado a CSS, listeners de input y un botón nuevo; no toca modelo de datos, `localStorage` ni lógica de gameplay).

---

## Qué **no** está en este spec

- Agrandar hitboxes de botones existentes.
- Layout vertical/portrait distinto al horizontal actual.
- Joystick virtual o botones de control alternativos.
- Ajustes de gameplay específicos para móvil.
- PWA / instalación / ícono de app.

Cada uno, si se pide, va en su propio spec.
