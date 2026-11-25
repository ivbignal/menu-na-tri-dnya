import {
  DAYS, DEFAULT_PEOPLE, MAX_PEOPLE, buildShoppingList, departments, formatAmount, recipes, scaleIngredients,
} from './menu.mjs';

const STORAGE_KEY = 'menu-na-tri-dnya-v1';
const recipeIds = recipes.map(({ id }) => id);
const pluralRules = new Intl.PluralRules('ru');
const portionForms = { one: 'порция', few: 'порции', many: 'порций' };

const recipeGrid = document.querySelector('#recipe-grid');
const recipeDialog = document.querySelector('#recipe-dialog');
const shoppingGroups = document.querySelector('#shopping-groups');
const shoppingEmpty = document.querySelector('#shopping-empty');
const hideChecked = document.querySelector('#hide-checked');
const progressBar = document.querySelector('#progress-bar');
const progressText = document.querySelector('#shopping-progress');
const copyButton = document.querySelector('#copy-list');
const resetButton = document.querySelector('#reset-checks');
const copyFeedback = document.querySelector('#copy-feedback');
const copyDialog = document.querySelector('#copy-dialog');
const copyText = document.querySelector('#copy-text');
const fewerButton = document.querySelector('#fewer');
const moreButton = document.querySelector('#more');

const state = loadState();
let shoppingItems = [];

function loadState() {
  const defaults = { people: DEFAULT_PEOPLE, selected: recipeIds, checked: {}, hideChecked: false };
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (!saved || typeof saved !== 'object') return defaults;
    const validPeople = Number.isInteger(saved.people) && saved.people >= 1 && saved.people <= MAX_PEOPLE;
    return {
      people: validPeople ? saved.people : defaults.people,
      selected: Array.isArray(saved.selected) ? recipeIds.filter((id) => saved.selected.includes(id)) : defaults.selected,
      checked: saved.checked && typeof saved.checked === 'object' ? saved.checked : defaults.checked,
      hideChecked: saved.hideChecked === true,
    };
  } catch {
    return defaults;
  }
}

function saveState() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Если браузер отключил хранилище, список работает до перезагрузки страницы.
  }
}

function quantityLabel(count, forms) {
  return `${count} ${forms[pluralRules.select(count)]}`;
}

function isChecked(item) {
  return state.checked[item.id] === formatAmount(item);
}

function renderCards() {
  recipeGrid.innerHTML = recipes.map((recipe) => `
    <article class="recipe-card">
      <img src="./assets/${recipe.id}.webp" width="512" height="660" alt="">
      <div class="recipe-main">
        <p class="meal">${recipe.meal}</p>
        <h3>${recipe.name}</h3>
        <p class="recipe-intro">${recipe.intro}</p>
        <div class="card-actions">
          <button class="button outline" type="button" data-recipe="${recipe.id}"
                  aria-label="Открыть рецепт «${recipe.name}»">Открыть рецепт</button>
          <label class="check-control">
            <input type="checkbox" value="${recipe.id}" ${state.selected.includes(recipe.id) ? 'checked' : ''}
                   aria-label="${recipe.name} в списке покупок">
            В покупках
          </label>
        </div>
      </div>
    </article>
  `).join('');
}

function renderPeople() {
  document.querySelector('#people').value = state.people;
  const parts = state.people * DAYS;
  document.querySelector('#portions-summary').textContent = `На три дня · ${quantityLabel(parts, portionForms)} каждого блюда.`;
  fewerButton.disabled = state.people === 1;
  moreButton.disabled = state.people === MAX_PEOPLE;
}

function ingredientRow(item) {
  return `<li><span>${item.name}${item.detail ? `<small class="product-detail">${item.detail}</small>` : ''}</span>
              <strong class="amount">${formatAmount(item)}</strong></li>`;
}

function splitEggs({ whites, saladYolks, dressingYolks }) {
  const whiteForms = { one: 'белок', few: 'белка', many: 'белков' };
  const yolkForms = { one: 'желток', few: 'желтка', many: 'желтков' };
  return `Для салата возьмите ${quantityLabel(whites * state.people, whiteForms)}
    и ${quantityLabel(saladYolks * state.people, yolkForms)}.
    Для заправки возьмите ${quantityLabel(dressingYolks * state.people, yolkForms)}.`;
}

function showRecipe(recipe) {
  const ingredients = scaleIngredients(recipe, state.people);
  const mainIngredients = ingredients.filter(({ id }) => !recipe.dressing?.includes(id));
  const dressing = ingredients.filter(({ id }) => recipe.dressing?.includes(id));
  const portions = quantityLabel(state.people * DAYS, portionForms);
  const nutrition = recipe.calories ? ` · ${recipe.calories} ккал на порцию` : '';
  document.querySelector('#dialog-title').textContent = recipe.name;
  document.querySelector('#dialog-meal').textContent = recipe.meal;
  document.querySelector('#dialog-summary').textContent = `${portions}${nutrition}`;
  document.querySelector('#dialog-body').innerHTML = `
    <section>
      <h3>Ингредиенты</h3>
      <ul class="ingredient-list">${mainIngredients.map(ingredientRow).join('')}</ul>
      ${recipe.eggSplit ? `<p class="recipe-note">${splitEggs(recipe.eggSplit)}</p>` : ''}
    </section>
    ${dressing.length ? `<section>
      <h3>Заправка</h3>
      <ul class="ingredient-list">${dressing.map(ingredientRow).join('')}</ul>
    </section>` : ''}
    <section>
      <h3>Как готовить</h3>
      ${recipe.adapted ? '<p class="recipe-note">Предлагаемый способ приготовления.</p>' : ''}
      <ol>${recipe.steps.map((step) => `<li>${step}</li>`).join('')}</ol>
      ${recipe.note ? `<p class="recipe-note">${recipe.note}</p>` : ''}
      ${recipe.macros ? `<p class="recipe-note">На порцию · ${recipe.macros}</p>` : ''}
    </section>`;
  recipeDialog.showModal();
  recipeDialog.scrollTop = 0;
}

function shoppingRow(item) {
  return `<li><label class="shopping-item">
    <input type="checkbox" value="${item.id}" ${isChecked(item) ? 'checked' : ''}>
    <span class="product-name">${item.name}${item.detail ? `<small class="product-detail">${item.detail}</small>` : ''}</span>
    <strong class="amount">${formatAmount(item)}</strong>
  </label></li>`;
}

function renderShopping() {
  shoppingItems = buildShoppingList(state.selected, state.people);
  const checkedCount = shoppingItems.filter(isChecked).length;
  const visible = state.hideChecked ? shoppingItems.filter((item) => !isChecked(item)) : shoppingItems;

  hideChecked.checked = state.hideChecked;
  progressText.textContent = `Отмечено ${checkedCount} из ${shoppingItems.length}`;
  progressBar.max = shoppingItems.length || 1;
  progressBar.value = checkedCount;
  resetButton.disabled = Object.keys(state.checked).length === 0;
  copyButton.disabled = checkedCount === shoppingItems.length;
  copyFeedback.hidden = true;

  shoppingGroups.innerHTML = Object.entries(departments).map(([id, title]) => {
    const items = visible.filter(({ department }) => department === id);
    if (!items.length) return '';
    return `<section class="shopping-group"><h3>${title}</h3><ul>${items.map(shoppingRow).join('')}</ul></section>`;
  }).join('');
  shoppingEmpty.hidden = visible.length !== 0;
  shoppingEmpty.textContent = shoppingItems.length
    ? 'Все продукты отмечены.'
    : 'Добавьте хотя бы одно блюдо в покупки.';
}

function changePeople(delta) {
  const next = state.people + delta;
  if (next < 1 || next > MAX_PEOPLE) return;
  state.people = next;
  saveState();
  renderPeople();
  renderShopping();
}

async function copyRemaining() {
  const remaining = shoppingItems.filter((item) => !isChecked(item));
  const entries = Object.entries(departments).flatMap(([id, title]) => {
    const items = remaining.filter(({ department }) => department === id);
    return items.length ? [
      title,
      ...items.map((item) => `• ${item.name} — ${formatAmount(item)}${item.detail ? ` (${item.detail})` : ''}`),
      '',
    ] : [];
  });
  const text = ['Список покупок на три дня', '', ...entries].join('\n').trimEnd();
  try {
    await navigator.clipboard.writeText(text);
    copyFeedback.textContent = 'Список скопирован.';
    copyFeedback.hidden = false;
  } catch {
    copyText.value = text;
    copyDialog.showModal();
    copyText.focus();
    copyText.select();
  }
}

recipeGrid.addEventListener('click', (event) => {
  const button = event.target.closest('button[data-recipe]');
  if (!button) return;
  showRecipe(recipes.find(({ id }) => id === button.dataset.recipe));
});

recipeGrid.addEventListener('change', (event) => {
  if (event.target.type !== 'checkbox') return;
  state.selected = Array.from(recipeGrid.querySelectorAll('input:checked'), (input) => input.value);
  saveState();
  renderShopping();
});

shoppingGroups.addEventListener('change', (event) => {
  const input = event.target;
  if (input.type !== 'checkbox') return;
  const item = shoppingItems.find(({ id }) => id === input.value);
  const inputIds = Array.from(shoppingGroups.querySelectorAll('input'), ({ value }) => value);
  const index = inputIds.indexOf(item.id);
  if (input.checked) {
    state.checked[item.id] = formatAmount(item);
  } else {
    delete state.checked[item.id];
  }
  const nextFocusId = input.checked && state.hideChecked ? inputIds[index + 1] ?? inputIds[index - 1] : item.id;
  saveState();
  renderShopping();
  const nextFocus = Array.from(shoppingGroups.querySelectorAll('input')).find(({ value }) => value === nextFocusId);
  (nextFocus ?? hideChecked).focus({ preventScroll: true });
});

hideChecked.addEventListener('change', () => {
  state.hideChecked = hideChecked.checked;
  saveState();
  renderShopping();
});

resetButton.addEventListener('click', () => {
  state.checked = {};
  saveState();
  renderShopping();
  hideChecked.focus({ preventScroll: true });
});

copyButton.addEventListener('click', copyRemaining);
fewerButton.addEventListener('click', () => changePeople(-1));
moreButton.addEventListener('click', () => changePeople(1));

renderCards();
renderPeople();
renderShopping();
