# Farm Board game

Header - add centralized leave button -> rewrite how header and pages work

- [ ] generate README.md

review logging on server
theme button - possibility to add new themes

yellow button with white text...

## Screen breakpoints

### Mobile First Approach

@media (min-width: 320px) { Mobile Small }
@media (min-width: 480px) { Mobile Large }
@media (min-width: 768px) { Tablet }
@media (min-width: 1024px) { Desktop }
@media (min-width: 1200px) { Large Desktop }
@media (min-width: 1440px) { Extra Large }

### Desktop First Approach (Curr)

@media (max-width: 1439px) { Below XL }
@media (max-width: 1199px) { Below Large }
@media (max-width: 1023px) { Below Desktop }
@media (max-width: 767px) { Below Tablet }
@media (max-width: 479px) { Below Mobile Large }

- regeneration - heal (10HP + effect that will heal based on remaining HP (less HP = more regen))
- improve action value modificators ('calculate based on what value')
- rework skill components on mobile ('i' icon to show more info, click to select)
- on preparation phase display stats (modified by selected passives in realtime)
- on battle phase display hp as line with numbers instead of just numbers

Обробка ходу:

- очищення (скіл)
- лікування (активний скіл)
- активні ефекти
- (перевірка смерті)
- накладання ефектів на себе

- Перевірка на ухилення
- Нанесення шкоди (+крит)
- Застосування шипів
- Застосування крадіжки здоровʼя
- Накладання негативних ефектів на противника
