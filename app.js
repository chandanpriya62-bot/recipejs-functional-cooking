const RecipeApp = (() => {
  'use strict';

  // ================= DATA =================
  const recipes = [
    {
      id: 1,
      title: "Spaghetti Carbonara",
      time: 25,
      difficulty: "easy",
      description: "Classic creamy Italian pasta.",
      ingredients: ["Spaghetti", "Eggs", "Pancetta", "Cheese", "Pepper"],
      steps: [
        "Boil pasta",
        {
          text: "Prepare sauce",
          substeps: [
            "Beat eggs",
            "Add cheese",
            { text: "Season", substeps: ["Add pepper", "Mix"] }
          ]
        },
        "Mix everything",
        "Serve"
      ]
    },
    {
      id: 2,
      title: "Greek Salad",
      time: 15,
      difficulty: "easy",
      description: "Fresh and healthy salad.",
      ingredients: ["Tomatoes", "Cucumber", "Feta", "Olives", "Olive oil"],
      steps: ["Chop vegetables", "Mix ingredients", "Serve chilled"]
    }
  ];

  // ================= STATE =================
  let currentFilter = 'all';
  let currentSort = 'none';
  let searchQuery = '';
  let favorites = JSON.parse(localStorage.getItem('recipeFavorites')) || [];
  let debounceTimer;

  // ================= DOM =================
  const recipeContainer = document.querySelector('#recipe-container');
  const filterButtons = document.querySelectorAll('.filter-btn');
  const sortButtons = document.querySelectorAll('.sort-btn');
  const searchInput = document.querySelector('#search-input');
  const clearSearchBtn = document.querySelector('#clear-search');
  const recipeCountDisplay = document.querySelector('#recipe-count');

  // ================= RECURSION =================
  const renderSteps = (steps, level = 0) => {
    const className = level === 0 ? "steps-list" : "substeps-list";
    let html = `<ol class="${className}">`;

    steps.forEach(step => {
      if (typeof step === "string") {
        html += `<li>${step}</li>`;
      } else {
        html += `<li>${step.text}`;
        html += renderSteps(step.substeps, level + 1);
        html += `</li>`;
      }
    });

    html += `</ol>`;
    return html;
  };

  // ================= RENDER =================
  const createRecipeCard = recipe => {
    const isFav = favorites.includes(recipe.id);
    return `
      <div class="recipe-card">
        <button class="favorite-btn" data-recipe-id="${recipe.id}">
          ${isFav ? '❤️' : '🤍'}
        </button>

        <h3>${recipe.title}</h3>

        <div class="recipe-meta">
          <span>⏱️ ${recipe.time} min</span>
          <span class="difficulty ${recipe.difficulty}">
            ${recipe.difficulty}
          </span>
        </div>

        <p>${recipe.description}</p>

        <div class="card-actions">
          <button class="toggle-btn" data-toggle="steps" data-id="${recipe.id}">
            Show Steps
          </button>
          <button class="toggle-btn" data-toggle="ingredients" data-id="${recipe.id}">
            Show Ingredients
          </button>
        </div>

        <div class="ingredients-container" data-id="${recipe.id}">
          <ul>${recipe.ingredients.map(i => `<li>${i}</li>`).join("")}</ul>
        </div>

        <div class="steps-container" data-id="${recipe.id}">
          ${renderSteps(recipe.steps)}
        </div>
      </div>
    `;
  };

  const renderRecipes = list => {
    recipeContainer.innerHTML = list.map(createRecipeCard).join('');
  };

  // ================= FILTERS =================
  const filterBySearch = (list, query) => {
    if (!query) return list;
    const q = query.toLowerCase();
    return list.filter(r =>
      r.title.toLowerCase().includes(q) ||
      r.description.toLowerCase().includes(q) ||
      r.ingredients.some(i => i.toLowerCase().includes(q))
    );
  };

  const applyFilter = list => {
    if (currentFilter === 'favorites') {
      return list.filter(r => favorites.includes(r.id));
    }
    if (currentFilter === 'quick') {
      return list.filter(r => r.time < 30);
    }
    if (['easy', 'medium', 'hard'].includes(currentFilter)) {
      return list.filter(r => r.difficulty === currentFilter);
    }
    return list;
  };

  const applySort = list => {
    if (currentSort === 'name') {
      return [...list].sort((a, b) => a.title.localeCompare(b.title));
    }
    if (currentSort === 'time') {
      return [...list].sort((a, b) => a.time - b.time);
    }
    return list;
  };

  // ================= UI =================
  const updateRecipeCounter = (showing, total) => {
    recipeCountDisplay.textContent = `Showing ${showing} of ${total} recipes`;
  };

  const updateDisplay = () => {
    let result = filterBySearch(recipes, searchQuery);
    result = applyFilter(result);
    result = applySort(result);

    updateRecipeCounter(result.length, recipes.length);
    renderRecipes(result);
  };

  // ================= FAVORITES =================
  const saveFavorites = () => {
    localStorage.setItem('recipeFavorites', JSON.stringify(favorites));
  };

  const toggleFavorite = id => {
    id = Number(id);
    favorites = favorites.includes(id)
      ? favorites.filter(f => f !== id)
      : [...favorites, id];

    saveFavorites();
    updateDisplay();
  };

  // ================= EVENTS =================
  const setupEventListeners = () => {
    filterButtons.forEach(btn =>
      btn.addEventListener('click', () => {
        currentFilter = btn.dataset.filter;
        updateDisplay();
      })
    );

    sortButtons.forEach(btn =>
      btn.addEventListener('click', () => {
        currentSort = btn.dataset.sort;
        updateDisplay();
      })
    );

    recipeContainer.addEventListener('click', e => {
      if (e.target.classList.contains('toggle-btn')) {
        const id = e.target.dataset.id;
        const type = e.target.dataset.toggle;
        const box = document.querySelector(`.${type}-container[data-id="${id}"]`);
        box.classList.toggle('visible');
      }

      if (e.target.classList.contains('favorite-btn')) {
        toggleFavorite(e.target.dataset.recipeId);
      }
    });

    searchInput.addEventListener('input', e => {
      clearTimeout(debounceTimer);
      clearSearchBtn.style.display = e.target.value ? 'block' : 'none';
      debounceTimer = setTimeout(() => {
        searchQuery = e.target.value;
        updateDisplay();
      }, 300);
    });

    clearSearchBtn.addEventListener('click', () => {
      searchInput.value = '';
      searchQuery = '';
      clearSearchBtn.style.display = 'none';
      updateDisplay();
    });
  };

  const init = () => {
    setupEventListeners();
    updateDisplay();
    console.log('🍳 RecipeJS Ready!');
  };

  return { init };
})();

RecipeApp.init();
