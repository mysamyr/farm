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

- improve action value modificators ('calculate based on what value')

Обробка ходу:

- Очищення (скіл)
- Обробити активні ефекти на собі
- (перевірка смерті)
- Лікування та накладання ефектів на себе
- Накладання зміни статів на себе

- Перевірка на ухилення
- Нанесення шкоди (+крит)
- Застосування шипів
- Застосування крадіжки здоровʼя
- Накладання ефектів на противника
- Накладання зміни статів на противника

- (перевірка смерті)
- Зкинути кулдаун навички, що оброблялася
- Зменшити кулдауни вибраних навичок (якщо не застанений)
- Зменшити тривалість активних ефектів (видалити ті, що закінчились)
