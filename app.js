const RecipeApp = (() => {

  // ================= DATA =================
  const recipes = [
    {
      id: 1,
      title: "Spaghetti Carbonara",
      time: 25,
      difficulty: "easy",
      description: "Classic creamy Italian pasta.",
      ingredients: [
        "Spaghetti",
        "Eggs",
        "Pancetta",
        "Cheese",
        "Pepper"
      ],
      steps: [
        "Boil pasta",
        {
          text: "Prepare sauce",
          substeps: [
            "Beat eggs",
            "Add cheese",
            {
              text: "Season",
              substeps: ["Add pepper", "Mix"]
            }
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
      ingredients: [
        "Tomatoes",
        "Cucumber",
        "Feta",
        "Olives",
        "Olive oil"
      ],
      steps: [
        "Chop vegetables",
        "Mix ingredients",
        "Serve chilled"
      ]
    }
  ];

  // ================= STATE =================
  let currentFilter = "all";
  let currentSort = null;

  // ================= DOM =================
  const recipeContainer = document.querySelector("#recipe-container");

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

  // ================= CARD =================
  const createRecipeCard = recipe => `
    <div class="recipe-card">
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
          📋 Show Steps
        </button>
        <button class="toggle-btn" data-toggle="ingredients" data-id="${recipe.id}">
          🥗 Show Ingredients
        </button>
      </div>

      <div class="ingredients-container" data-id="${recipe.id}">
        <ul>
          ${recipe.ingredients.map(i => `<li>${i}</li>`).join("")}
        </ul>
      </div>

      <div class="steps-container" data-id="${recipe.id}">
        ${renderSteps(recipe.steps)}
      </div>
    </div>
  `;

  // ================= FILTER / SORT =================
  const updateDisplay = () => {
    let result = [...recipes];

    if (currentFilter === "quick") {
      result = result.filter(r => r.time < 30);
    } else if (["easy", "medium", "hard"].includes(currentFilter)) {
      result = result.filter(r => r.difficulty === currentFilter);
    }

    if (currentSort === "name") {
      result.sort((a, b) => a.title.localeCompare(b.title));
    }
    if (currentSort === "time") {
      result.sort((a, b) => a.time - b.time);
    }

    recipeContainer.innerHTML = result.map(createRecipeCard).join("");
  };

  // ================= EVENTS =================
  const init = () => {
    document.querySelectorAll("[data-filter]").forEach(btn =>
      btn.addEventListener("click", () => {
        currentFilter = btn.dataset.filter;
        updateDisplay();
      })
    );

    document.querySelectorAll("[data-sort]").forEach(btn =>
      btn.addEventListener("click", () => {
        currentSort = btn.dataset.sort;
        updateDisplay();
      })
    );

    recipeContainer.addEventListener("click", e => {
      if (!e.target.classList.contains("toggle-btn")) return;

      const id = e.target.dataset.id;
      const type = e.target.dataset.toggle;
      const box = document.querySelector(`.${type}-container[data-id="${id}"]`);

      box.classList.toggle("visible");
      e.target.textContent = box.classList.contains("visible")
        ? `Hide ${type}`
        : `Show ${type}`;
    });

    updateDisplay();
    console.log("✅ RecipeApp Ready");
  };

  return { init };

})();

RecipeApp.init();
