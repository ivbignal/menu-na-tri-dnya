export const DAYS = 3;
export const DEFAULT_PEOPLE = 2;
export const MAX_PEOPLE = 12;

export const departments = {
  produce: 'Овощи и зелень',
  protein: 'Рыба, мясо и яйца',
  dairy: 'Молочные продукты',
  pantry: 'Хлеб и бакалея',
};

const products = {
  cucumber: { name: 'Огурцы', department: 'produce', unit: 'шт.' },
  tomato: { name: 'Помидоры', department: 'produce', unit: 'шт.' },
  greens: { name: 'Руккола или другая зелень', department: 'produce', note: 'по вкусу' },
  potato: { name: 'Картофель', department: 'produce', unit: 'г', detail: 'вес без кожуры' },
  carrot: { name: 'Морковь', department: 'produce', unit: 'г', detail: 'вес без кожуры' },
  beet: { name: 'Свёкла', department: 'produce', unit: 'г', detail: 'вес без кожуры' },
  onion: { name: 'Репчатый лук', department: 'produce', unit: 'г' },
  lemon: { name: 'Лимонный сок', department: 'produce', note: 'по желанию' },
  trout: { name: 'Слабосолёная форель', department: 'protein', unit: 'г' },
  turkey: { name: 'Ветчина из индейки или готовое филе', department: 'protein', unit: 'г' },
  herring: { name: 'Филе сельди без масла', department: 'protein', unit: 'г' },
  egg: { name: 'Яйца', department: 'protein', unit: 'шт.' },
  creamCheese: { name: 'Творожный сыр 22%', department: 'dairy', unit: 'г' },
  feta: { name: 'Фета или греческий сыр', department: 'dairy', unit: 'г' },
  yogurt: { name: 'Греческий йогурт', department: 'dairy', unit: 'г' },
  tortilla: { name: 'Маленькие тортильи', department: 'pantry', unit: 'шт.' },
  ptitim: { name: 'Птитим или мелкие макароны', department: 'pantry', unit: 'г', detail: 'в сухом виде' },
  mustard: { name: 'Горчица', department: 'pantry', unit: 'г' },
  oil: { name: 'Масло для жарки', department: 'pantry', unit: 'г' },
  salt: { name: 'Соль', department: 'pantry', note: 'по вкусу' },
};

export const recipes = [
  {
    id: 'tortilla',
    meal: 'Завтрак',
    name: 'Тортилья с форелью и творожным сыром',
    intro: 'Яичная лепёшка с красной рыбой, огурцом и зеленью.',
    calories: 305,
    macros: 'Белки 20,52 г · жиры 15,72 г · углеводы 21,31 г',
    ingredients: [
      ['tortilla', 3], ['trout', 150], ['egg', 3], ['creamCheese', 60],
      ['cucumber', 1], ['greens'], ['oil', 5], ['salt'],
    ],
    steps: [
      'Нарежьте огурец и форель. Взбейте одно яйцо с солью для каждой лепёшки.',
      'Смажьте разогретую сковороду маслом. Вылейте одно взбитое яйцо, положите сверху тортилью и жарьте с одной стороны до готовности яйца.',
      'Смажьте лепёшку творожным сыром. Добавьте зелень, форель и огурец, затем сложите пополам. Повторите для остальных порций.',
    ],
    note: 'Готовьте перед подачей. В исходном рецепте указано до 10 минут на такой завтрак.',
  },
  {
    id: 'ptitim',
    meal: 'Обед',
    name: 'Птитим с индейкой, помидорами и фетой',
    intro: 'Мелкая паста с индейкой, сочными помидорами и фетой.',
    ingredients: [
      ['ptitim', 150], ['turkey', 300], ['feta', 150], ['tomato', 1, 2], ['oil', 15], ['salt'],
    ],
    steps: [
      'Отварите птитим в подсоленной воде по инструкции на упаковке. Слейте воду.',
      'Нарежьте индейку и помидоры кубиками. Разогрейте масло и прогрейте индейку с помидорами на сковороде.',
      'Добавьте птитим и перемешайте. Снимите с огня, раскрошите сверху фету и проверьте, достаточно ли соли.',
    ],
    adapted: true,
  },
  {
    id: 'shuba',
    meal: 'Ужин',
    name: 'Сельдь под шубой',
    intro: 'Слоёный салат с заправкой из греческого йогурта и горчицы.',
    calories: 476,
    macros: 'Белки 36,13 г · жиры 18,41 г · углеводы 41,82 г',
    ingredients: [
      ['potato', 300], ['carrot', 300], ['beet', 300], ['herring', 300], ['onion', 30],
      ['egg', 5], ['yogurt', 140], ['mustard', 20], ['lemon'], ['salt'],
    ],
    dressing: ['yogurt', 'mustard', 'lemon', 'salt'],
    eggSplit: { whites: 5, saladYolks: 3, dressingYolks: 2 },
    steps: [
      'Отварите картофель, морковь и свёклу до мягкости. Отдельно сварите яйца вкрутую. Остудите и натрите овощи по отдельности.',
      'Нарежьте сельдь и лук. Отделите белки от желтков. Разотрите желтки для заправки и смешайте с йогуртом, горчицей и солью. Добавьте лимонный сок по желанию.',
      'Выложите слоями картофель, сельдь с луком, морковь, тёртые белки и свёклу. Распределите заправку между слоями и посыпьте салат оставшимися желтками.',
    ],
    adapted: true,
  },
];

/** Возвращает количество продуктов для одного блюда на заданное число человек. */
export function scaleIngredients(recipe, people) {
  return recipe.ingredients.map(([id, min, max = min]) => ({
    ...products[id],
    id,
    min: min === undefined ? null : min * people,
    max: max === undefined ? null : max * people,
  }));
}

/** Объединяет одинаковые продукты в выбранных блюдах. */
export function buildShoppingList(selected, people) {
  const totals = new Map();
  for (const recipe of recipes.filter(({ id }) => selected.includes(id))) {
    for (const item of scaleIngredients(recipe, people)) {
      const existing = totals.get(item.id);
      if (existing && item.min !== null) {
        existing.min += item.min;
        existing.max += item.max;
      } else if (!existing) {
        totals.set(item.id, item);
      }
    }
  }
  return Object.keys(products).filter((id) => totals.has(id)).map((id) => totals.get(id));
}

/** Форматирует точное количество, диапазон или указание по вкусу. */
export function formatAmount({ min, max, unit, note }) {
  if (min === null) return note;
  return min === max ? `${min} ${unit}` : `${min}–${max} ${unit}`;
}
