# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository status

This project has not been implemented yet. There is no `index.html`, no JS source, no build tooling, and no git repo initialized. What exists today:

- `README.md` — one-line goal: build an Arkanoid clone with HTML/CSS/JS, zero dependencies.
- `assets/` — `spritesheet-breakout.png` (sprite sheet) and `assets/spritesheet.js`, which already defines sprite coordinates (`SPRITES`) and explosion animation frames (`EXPLOSION_FRAMES`) for paddle, ball, and colored blocks (gray/red/yellow/cyan/magenta/hotpink/green), plus `loadSpritesheet()`/`drawSprite()`/`drawFrame()` helpers for drawing from the sheet onto a canvas 2D context. `assets/sounds/` has `ball-bounce.mp3` and `break-sound.mp3`.
- `.agents/skills/` (and mirrored `.claude/skills/`) — the `spec` and `spec-impl` skills that drive this repo's workflow (see below). `skills-lock.json` pins their source to `Klerith/fernando-skills`.

There is no `specs/` directory yet — it gets created by the `/spec` skill the first time it saves a spec.

## Development workflow: spec-driven design

This repo works exclusively through a two-command cycle. **Do not write feature code ad hoc** — go through `/spec` then `/spec-impl`.

1. **`/spec <feature>`** — guided, conversational spec design (see `.agents/skills/spec/SKILL.md`). Asks clarifying questions in phases, builds the spec section by section against `.agents/skills/spec/template.md`, and saves it as `specs/NN-slug.md` in `Draft` state. Never writes code.
2. **`/spec-impl <NN-slug>`** — implements an *Approved* spec only (see `.agents/skills/spec-impl/SKILL.md`). Refuses to run if the spec's status isn't Approved (in any language). On success it creates/switches to git branch `spec-NN-slug` (git repo will need to be initialized for this — currently there is none), then implements the plan step by step, pausing for review after each step.

Key conventions from those skills, since they shape everything built here:

- Specs are numbered sequentially in `specs/` (`01-...`, `02-...`) and each has a `**Status:**` header: `Draft` → `In review` → `Approved` → `Implemented` (or `Obsolete`). Only `Approved` unlocks `/spec-impl`.
- `specs/.spec-config.yml` (created by `/spec` on first save) holds `AutoCreateBranch` (default `true`) controlling whether `/spec-impl` creates its git branch without asking.
- Specs describe, they don't contain full implementations — data models are illustrated with short snippets only.
- Implementation plans are step-by-step, and every step must leave the game runnable — no half-finished steps.

## Conventions inherited from the workspace root

(See also the root `CLAUDE.md` two levels up, at `Claude Curso/CLAUDE.md`, which indexes this whole course.)

- Plain HTML5 Canvas + vanilla JS (ES6+ classes), zero dependencies, no bundler, no `package.json`, no test suite or linter.
- Once built, run by opening `index.html` directly or serving locally with `npx serve .` from this folder.
- This subfolder is meant to become its own independent git repo, separate from the workspace root and from the other course exercises (`02-asteroids`, `03-claude-tetris`).
