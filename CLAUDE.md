# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository status

Implemented and playable. Own git repo (separate from workspace root). Layout:

- `README.md` — one-line goal + spec status list.
- `index.html` — canvas game shell, loads `assets/spritesheet.js` then each `features/*.js` file then `game.js`.
- `game.js` — main `Game` class / game loop, wiring all features together.
- `features/` — one file per gameplay feature: `difficulty.js`, `menu.js`, `paddle.js`, `ball.js`, `block.js`, `level.js`, `powerup.js`.
- `assets/` — `spritesheet-breakout.png` (sprite sheet) and `assets/spritesheet.js`, which defines sprite coordinates (`SPRITES`) and explosion animation frames (`EXPLOSION_FRAMES`) for paddle, ball, and colored blocks (gray/red/yellow/cyan/magenta/hotpink/green), plus `loadSpritesheet()`/`drawSprite()`/`drawFrame()` helpers for drawing from the sheet onto a canvas 2D context. `assets/sounds/` has `ball-bounce.mp3` and `break-sound.mp3`.
- `.agents/skills/` (and mirrored `.claude/skills/`) — the `spec` and `spec-impl` skills that drive this repo's workflow (see below). `skills-lock.json` pins their source to `Klerith/fernando-skills`.
- `specs/` — one file per feature spec, `NN-slug.md`, plus `specs/.spec-config.yml` (`AutoCreateBranch: true`).

Specs implemented so far, each built via a `spec-NN-slug` branch merged to main:

1. `01-arkanoid-core.md` — core paddle/ball/blocks gameplay loop.
2. `02-menu-pause-difficulty.md` — main menu, pause overlay, difficulty selector, per-difficulty high score.
3. `03-powerups.md` — falling power-ups (paddle big/small, ball slow/fast, multi-ball) with HUD timers.
4. `04-version-movil.md` — touch input and responsive canvas scaling for mobile.
5. `05-progresion-niveles.md` — multiple level layouts, level-complete transition, HUD level indicator.

## Development workflow: spec-driven design

This repo works exclusively through a two-command cycle. **Do not write feature code ad hoc** — go through `/spec` then `/spec-impl`.

1. **`/spec <feature>`** — guided, conversational spec design (see `.agents/skills/spec/SKILL.md`). Asks clarifying questions in phases, builds the spec section by section against `.agents/skills/spec/template.md`, and saves it as `specs/NN-slug.md` in `Draft` state. Never writes code.
2. **`/spec-impl <NN-slug>`** — implements an *Approved* spec only (see `.agents/skills/spec-impl/SKILL.md`). Refuses to run if the spec's status isn't Approved (in any language). On success it creates/switches to git branch `spec-NN-slug`, then implements the plan step by step, pausing for review after each step.

Key conventions from those skills, since they shape everything built here:

- Specs are numbered sequentially in `specs/` (`01-...`, `02-...`) and each has an `**Estado:**` header: `Borrador`/`Draft` → `En revisión` → `Aprobado`/`Approved` → `Implementado`/`Implemented` (or `Obsoleto`). Only `Aprobado`/`Approved` unlocks `/spec-impl`.
- `specs/.spec-config.yml` holds `AutoCreateBranch` (default `true`) controlling whether `/spec-impl` creates its git branch without asking.
- Specs describe, they don't contain full implementations — data models are illustrated with short snippets only.
- Implementation plans are step-by-step, and every step must leave the game runnable — no half-finished steps.

## Conventions inherited from the workspace root

(See also the root `CLAUDE.md` two levels up, at `Claude Curso/CLAUDE.md`, which indexes this whole course.)

- Plain HTML5 Canvas + vanilla JS (ES6+ classes), zero dependencies, no bundler, no `package.json`, no test suite or linter.
- Run by opening `index.html` directly or serving locally with `npx serve .` from this folder.
- This subfolder is its own independent git repo, separate from the workspace root and from the other course exercises (`02-asteroids`, `03-claude-tetris`).
