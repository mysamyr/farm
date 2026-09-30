# Arena

Arena is a turn-based 1v1 duel. Each player drafts a fighter loadout, then alternates turns using skills until one player's effective HP reaches 0.

## Match Setup

- Exactly 2 players participate.
- Each fighter starts with 100 HP.
- Turn order is randomized.
- Players must select:
  - 3 active skills
  - 1 healing skill
  - 2 passive skills
- `Attack` and `Skip` are always available.
- Players can reset their selection before confirming readiness.
- Combat begins once both players are ready.
- The optional `Zero Cooldown at start` rule makes selected skills available immediately; otherwise skills start with their normal cooldowns.

## Stats

- **HP**: Current health. The fighter is defeated when effective HP reaches 0.
- **Armor**: Reduces incoming damage.
- **Attack**: Added to the base damage of attacks.
- **Crit**: Chance to double the total damage of a turn.
- **Dodge**: Chance to completely avoid the opponent-targeting portion of a turn.

Base stats:

- HP: 100
- Armor: 0
- Attack: 0
- Crit: 5%
- Dodge: 5%

Damage before Resistance is calculated as:

`max(base damage + Attack - Armor, 1)`

Pierce ignores all of the defender's Armor. A critical hit doubles the damage before Resistance reduces it. Resistance reduces direct damage by its percentage, with a minimum of 1 damage. One critical roll is made for the turn and applies to all direct damage actions in that turn.

## Skill Types

### Active Skills

Used during the fighter's turn and usually have cooldowns.

- **Attack**: Deal 10 damage.
- **Skip**: Perform no action and end the turn.
- **Bleed Strike**: Deal 8 damage and apply Bleed for 2 turns, dealing 15% of current HP each tick (minimum 5 damage).
- **Viper Strike**: Deal 6 damage and apply Poison for 5 turns, dealing 5 damage each tick.
- **Vampiric Strike**: Deal 10 damage and heal for 50% of the damage dealt.
- **Bash Strike**: Deal 8 damage and reduce the opponent's Attack by 5 for 2 turns.
- **Knockback**: Deal 10 damage and Stun the opponent for 1 turn.
- **Corrosion**: Reduce the opponent's Armor by 5 for 3 turns.
- **Magic Shield**: Grant Resistance for 3 turns, blocking Bleed and Poison and reducing direct damage by 30%.
- **Rage**: Increase Attack by 8 for 3 turns.
- **Spiked Armor**: Reflect 60% of direct damage received for 2 turns.
- **Reflect**: Redirect incoming debuffs for 2 turns.
- **Meditation**: Reduce the fighter's cooldowns by 1.

### Healing Skills

Healing skills affect the user and have cooldowns.

- **Heal**: Restore 20 HP.
- **Regeneration**: Restore 5 HP and apply Regeneration for 3 turns. Regeneration restores 6 HP per tick.
- **Cleanse**: Remove all active effects, grant Resistance for 1 turn, then restore 10 HP.

Healing cannot exceed maximum HP.

### Passive Skills

Passives are active for the entire fight.

- **Toughened**: +20 maximum HP and +3 Armor.
- **Plating**: +5 Armor and +3 Attack.
- **Assassin**: +10% Dodge and +15% Crit.
- **Strong**: +6 Attack and +5% Crit.
- **Fanatic**: +4 Attack, +15 maximum HP, and +5% Dodge.
- **Thorns**: Reflect 40% of direct damage received.
- **Leech**: Heal for 30% of direct damage dealt.
- **Pierce**: Ignore all Armor when dealing damage.

HP bonuses increase maximum HP and also allow the fighter's current HP to remain above the normal 0 boundary until the bonus is exhausted.

## Status Effects

- **Bleed**: Deals damage based on the target's current effective HP, with a minimum of 5 damage per tick.
- **Poison**: Deals fixed damage each tick.
- **Regeneration**: Restores fixed HP each tick.
- **Resistance**: Prevents new Bleed and Poison from being applied and reduces incoming direct damage by its percentage. It does not remove existing effects.
- **Stun**: The fighter may only use `Skip`. Their skill cooldowns do not decrease while stunned.
- **Thorns**: Reflects a percentage of direct damage to the attacker.
- **Leech**: Heals the owner for a percentage of direct damage dealt.
- **Pierce**: Ignores all of the opponent's Armor.
- **Reflection**: Redirects incoming Bleed, Poison, Stun, and negative stat modifications to the attacker. Reflected effects do not bounce back again.

Timed effects are tracked in turns. Effects applied during the current turn do not tick or expire until a later turn.

## Turn Processing

A fighter's turn follows this order:

1. Remove active effects if the skill provides Cleanse.
2. Apply immediate healing.
3. Apply self-targeted statuses.
4. Apply self-targeted stat changes.
5. Roll the opponent's Dodge chance.
6. If the action is dodged, skip all opponent-targeting damage and debuffs.
7. Deal direct damage and apply critical-hit calculation.
8. Apply Thorns damage to the attacker.
9. Apply skill-based lifesteal and passive Leech healing.
10. Redirect debuffs and negative stat changes if the defender has Reflection.
11. Apply statuses to the opponent.
12. Apply stat changes to the opponent.
13. Check whether either fighter has been defeated.
14. Process the acting fighter's Poison, Bleed, and Regeneration.
15. Check for defeat again.
16. Reset the cooldown of the skill just used.
17. Reduce other skill cooldowns by 1, unless the acting fighter is stunned.
18. Apply explicit cooldown-reduction effects such as Meditation.
19. Reduce timed status durations, excluding effects applied during this turn.
20. Pass control to the other fighter.

A fighter can die from direct damage, reflected damage, damage-over-time effects, or any other effect processed during the turn. The match ends immediately when a fighter is defeated.

## Cooldowns

- Cooldowns are tracked independently for each skill.
- Using a skill resets that skill to its defined cooldown.
- Other skill cooldowns normally decrease by 1 after the turn.
- A stunned fighter does not receive normal cooldown reduction.
- Skills that explicitly reduce cooldowns can reduce all of the owner's cooldowns, including the skill currently being used.
- `Attack` and `Skip` have no cooldown.

## Victory

The fighter whose opponent reaches 0 effective HP wins. The room is marked finished and the winner is announced to both players. The battle log records every turn, skill use, damage event, heal, status application, stat change, dodge, reflection, and cooldown effect.
