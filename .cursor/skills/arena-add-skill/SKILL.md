---
name: arena-add-skill
description: >-
  Adds a new Arena skill (buff, debuff, active, healing, passive, stat modifier)
  across shared constants, engine, i18n, icons, and help. Use when the user asks
  to add/create/change an Arena skill, ability, strike, heal, passive, buff,
  debuff, EffectId, or cooldown; mentions ARENA_ADD_SKILL; or edits
  games/arena/shared/constants.ts SKILLS.
---

# Arena: add a skill (`ARENA_ADD_SKILL`)

Follow this path whenever adding or changing an Arena skill. Do not invent a parallel data model. Skills are data in shared constants; the server engine executes `actions`.

## Classify first

Ask (or infer from the request) and pick **one** `SkillType`:

| Kind                          | `SkillType` | Typical `actions`                                                | Cooldown                  |
| ----------------------------- | ----------- | ---------------------------------------------------------------- | ------------------------- |
| Active strike / buff / debuff | `active`    | `DAMAGE`, `APPLY_STATUS`, `MODIFY_STAT`, `LIFE_STEAL`, `CLEANSE` | required (`cooldown` ≥ 0) |
| Healing skill                 | `healing`   | `HEAL` and optionally `APPLY_STATUS` (e.g. regeneration)         | required                  |
| Passive (always on)           | `passive`   | `MODIFY_STAT` and/or `APPLY_STATUS` **without** `duration`       | omit `cooldown`           |

How to tell buff vs debuff vs “just damage”:

- **Buff** — `SkillType.active`, `target: self`, `MODIFY_STAT` (positive) and/or `APPLY_STATUS` on self.
- **Debuff** — `SkillType.active`, `target: opponent`, `MODIFY_STAT` (negative) and/or `APPLY_STATUS` (bleed/poison/stun).
- **Active ability** — any `active` used on the player’s turn (including skip with empty `actions`).
- **Passive** — `SkillType.passive`; applied once at draft via `getStatusesFromSkills`, not when used.
- **Stat modifier** — `MODIFY_STAT` on a `StatId`. Permanent if no `duration` (passives); timed if `duration` is set (actives).
- **Healing skill** — `SkillType.healing` (draft slot is separate from actives). Instant heal uses `HEAL`; HoT uses `APPLY_STATUS` + `EffectId.regeneration`.

Draft quotas (do not change unless asked): `REQUIRED_ACTIVE_COUNT = 2`, `REQUIRED_HEALING_COUNT = 1`, `REQUIRED_PASSIVE_COUNT = 2`. Base skills `attack` and `skip` are always granted; they are not drafted.

`CUSTOM_SKILLS` is derived (`SkillId` minus `BASE_SKILLS`). Do **not** append to that array by hand.

Preparation UI (`PreparationPhase`) lists skills by `SkillType` automatically. No UI wiring for a new skill beyond icons + names.

## Checklist

Copy and complete:

```
- [ ] SkillId enum + SKILLS entry in games/arena/shared/constants.ts
- [ ] Reuse existing EffectId / ActionType if possible
- [ ] If new EffectId: types, engine, helpers, NEGATIVE_EFFECTS?, LogEffectKind?, i18n, icons, help copy
- [ ] skillNames in games/arena/client/i18n/en.ts and ua.ts
- [ ] SKILL_ICONS in games/arena/client/constants/index.ts
- [ ] If new EffectId: EFFECT_ICONS + effectLabels + help.effects (en + ua)
- [ ] Typecheck: Record<SkillId, …> / Record<EffectId, …> must compile
```

## 1. Definition — `games/arena/shared/constants.ts`

1. Add a snake_case member to `SkillId` under the right comment group (base / active strikes / active debuffs / active buffs / healing / passive).
2. Add a `SKILLS[SkillId.…]` object. `id` must match the enum. `actions` must satisfy `GameAction` in `games/arena/shared/types.ts`.

Action types (`ActionType`):

| Type           | Role                                   | Notes                                                                 |
| -------------- | -------------------------------------- | --------------------------------------------------------------------- |
| `DAMAGE`       | Hit opponent                           | `value` is `InstantActionValue` (not `damageDealt`)                   |
| `HEAL`         | Restore HP                             | Usually `target: self`                                                |
| `LIFE_STEAL`   | Heal from damage this skill just dealt | **Must** be `target: self`; `value.source` is typically `damageDealt` |
| `APPLY_STATUS` | Status / named effect                  | Discriminated by `status`; see `ApplyStatusAction`                    |
| `MODIFY_STAT`  | Buff/debuff a `StatId`                 | Negative `amount` = debuff. No `duration` = permanent                 |
| `CLEANSE`      | Strip negatives                        | **Must** be `target: self`. Strips `NEGATIVE_EFFECTS` only            |

Value sources (`ActionValueSource`):

- `raw` — `{ amount }`
- `currentHp` / `maxHp` — `{ actor, percent }`
- `stat` — `{ actor, stat, percent }`
- `damageDealt` — `{ percent }` — only valid on `ReactiveActionValue` (lifesteal / some statuses), **not** on `DAMAGE`/`HEAL`/`MODIFY_STAT`

Existing `EffectId` (prefer these):

- `bleed` — % current HP DoT; duration + value required; blocked by resistance
- `poison` — flat DoT; duration + value required; blocked by resistance
- `stun` — only Skip; cooldowns do not tick; duration, no value
- `regeneration` — heal at end of **own** turn; duration + value
- `resistance` — blocks **new** bleed/poison; duration; no value
- `thorns` — reflect % of **direct** damage; value required; duration optional (omit on passives)
- `leech` — heal % of **direct** damage you deal; value required
- `pierce` — ignore that much opponent armor; value required

`NEGATIVE_EFFECTS` today: poison, bleed, stun. Add here only if Cleanse should remove the new effect.

## 2. Engine — `games/arena/server/engine.ts`

Do **not** add a per-skill `switch` on `SkillId`. The engine runs `skill.actions` in a fixed order (`processPlayerTurn`):

1. Self: CLEANSE → HEAL → APPLY_STATUS → MODIFY_STAT
2. If any action has `target: opponent`: dodge check, then DAMAGE (crit, pierce, armor), thorns, LIFE_STEAL + leech, opponent APPLY_STATUS, opponent MODIFY_STAT
3. End of turn: process own poison/bleed/regeneration, reset used skill CD, decrement other CDs (skipped if stunned), tick status durations

Passives never go through `processPlayerTurn`. They become `player.statuses` in `applySkillSelection` via `getStatusesFromSkills` (`games/arena/shared/helpers.ts`).

Cooldowns:

- Stored on `PlayerSkill.cooldown`. After use, `resetSkillCooldown` copies `SKILLS[id].cooldown`.
- Other skills decrement by 1 each turn unless stunned.
- Room rule `GAME_RULES.ZERO_COOLDOWN` sets drafted active/healing CDs to 0 at selection; base attack/skip stay 0.

Opponent-targeting `APPLY_STATUS` for bleed/poison/stun is special-cased in `applyStatusEffectsToOpponent` (refresh duration if already present; resistance). Other statuses on opponent fall through `default` (always push a new stack). Self statuses always push.

**New `EffectId`:** extend `ApplyStatusAction` and `ApplyStatusLogEffect` in `games/arena/shared/types.ts`. Then wire runtime:

- Tick / DoT / HoT → `processStatusEffects`
- On-hit (like thorns/leech/pierce) → helpers in `games/arena/server/helpers.ts` and the damage path
- Blocked by resistance → same pattern as bleed/poison
- New `ActionType` → also `splitSelfActions` / `splitOpponentActions`, `formatAction` in client `constants/index.ts`, battle log i18n, `LogEffectKind`

Do not import other game packages. Server/shared depend only on `@game/shared` + arena `shared/`.

## 3. Copy — `games/arena/client/i18n`

Add the new `SkillId` key to `skillNames` in **both** `en.ts` and `ua.ts`. Types are `Record<SkillId, string>` — missing keys fail typecheck.

Skill tooltips are generated from `actions` via `getSkillEffects` — do **not** add a free-text skill description unless asked.

If you add a **new `EffectId`**:

- `effectLabels` in en + ua (short name)
- `help.effects` in en + ua (player-facing explanation)

`ArenaHelpModal.tsx` maps `Object.values(EffectId)` to `help.effects[id]`. Do **not** hardcode a new `<li>` in the modal. Only change the modal if the help layout itself must change.

If you add a new `LogEffectKind` or action formatter string, update `battleLog` / `skillEffectLabels` in both locales.

UI strings stay in the arena plugin. Never put them in `@game/client-core`.

## 4. Icons — `games/arena/client/constants/index.ts`

- Add emoji to `SKILL_ICONS` for every new `SkillId`
- Add emoji to `EFFECT_ICONS` only for a new `EffectId`

## Patterns (copy shape, change numbers)

Active strike + existing DoT:

```ts
[SkillId.bleed_strike]: {
  id: SkillId.bleed_strike,
  type: SkillType.active,
  cooldown: 2,
  actions: [
    { type: ActionType.DAMAGE, target: ActionTarget.opponent, value: { source: ActionValueSource.raw, amount: 10 } },
    { type: ActionType.APPLY_STATUS, target: ActionTarget.opponent, status: EffectId.bleed, value: { source: ActionValueSource.raw, amount: 20 }, duration: 2 },
  ],
},
```

Self buff (timed stat):

```ts
{ type: ActionType.MODIFY_STAT, target: ActionTarget.self, stat: StatId.attack, value: { source: ActionValueSource.raw, amount: 10 }, duration: 3 },
```

Opponent stat debuff:

```ts
{ type: ActionType.MODIFY_STAT, target: ActionTarget.opponent, stat: StatId.armor, value: { source: ActionValueSource.raw, amount: -10 }, duration: 3 },
```

Healing + HoT:

```ts
[SkillId.regeneration]: {
  id: SkillId.regeneration,
  type: SkillType.healing,
  cooldown: 3,
  actions: [
    { type: ActionType.HEAL, target: ActionTarget.self, value: { source: ActionValueSource.raw, amount: 10 } },
    { type: ActionType.APPLY_STATUS, target: ActionTarget.self, status: EffectId.regeneration, value: { source: ActionValueSource.raw, amount: 8 }, duration: 3 },
  ],
},
```

Passive stats (no duration):

```ts
{ type: ActionType.MODIFY_STAT, target: ActionTarget.self, stat: StatId.hp, value: { source: ActionValueSource.raw, amount: 25 } },
```

Passive named effect (no duration):

```ts
{ type: ActionType.APPLY_STATUS, target: ActionTarget.self, status: EffectId.thorns, value: { source: ActionValueSource.raw, amount: 40 } },
```

## Guardrails

- Prefer composing existing `ActionType` + `EffectId`. A new effect is only for behavior the engine cannot already express.
- `LIFE_STEAL` and `CLEANSE` are self-only in types — do not retarget them.
- Passives must not include `cooldown`.
- Keep `SkillId` / `EffectId` string values equal to the enum member names.
- After edits, confirm TypeScript: every `Record<SkillId, …>` and `Record<EffectId, …>` is exhaustive.
