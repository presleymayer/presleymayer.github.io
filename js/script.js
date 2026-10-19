// ===== Runs on every page =====

// Footer year
document.getElementById("year").textContent = new Date().getFullYear();

// Dark / light mode (remembers your choice)
const themeToggle = document.getElementById("themeToggle");

function setTheme(theme) {
  document.documentElement.setAttribute("data-theme", theme);
  document.documentElement.setAttribute("data-bs-theme", theme);
  const icon = themeToggle.querySelector("i");
  icon.className = theme === "dark" ? "bi bi-sun" : "bi bi-moon-stars";
  themeToggle.setAttribute("aria-label", theme === "dark" ? "Switch to light mode" : "Switch to dark mode");
  try { localStorage.setItem("theme", theme); } catch (e) {}
}

let savedTheme = "light";
try { savedTheme = localStorage.getItem("theme") || "light"; } catch (e) {}
setTheme(savedTheme);

themeToggle.addEventListener("click", () => {
  const current = document.documentElement.getAttribute("data-theme");
  setTheme(current === "dark" ? "light" : "dark");
});

// Greeting based on time of day (home page only)
const greeting = document.getElementById("greeting");
if (greeting) {
  const hour = new Date().getHours();
  let text = "Good evening, I'm";
  if (hour < 12) text = "Good morning, I'm";
  else if (hour < 18) text = "Good afternoon, I'm";
  greeting.textContent = text;
}

// ===== Projects page only =====
const projectGrid = document.getElementById("projectGrid");

if (projectGrid) {
  let allProjects = [];
  let currentCategory = "All";

  const filterButtons = document.getElementById("filterButtons");
  const searchBox = document.getElementById("projectSearch");
  const message = document.getElementById("projectMessage");
  const modal = new bootstrap.Modal(document.getElementById("projectModal"));

  // 1. Read the JSON file with fetch()
  fetch("data/projects.json")
    .then(response => {
      if (!response.ok) throw new Error("Could not load projects.json");
      return response.json(); // 2. Convert JSON into JavaScript objects
    })
    .then(projects => {
      allProjects = projects;
      buildFilterButtons();
      showProjects();
    })
    .catch(error => {
      console.error(error);
      message.textContent = "Projects couldn't load. Open this site with Live Server instead of double-clicking the file.";
      message.classList.remove("d-none");
    });

  // Make one filter button per category found in the JSON
  function buildFilterButtons() {
    const categories = ["All"];
    allProjects.forEach(p => {
      if (!categories.includes(p.category)) categories.push(p.category);
    });

    categories.forEach(category => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "btn filter-btn" + (category === "All" ? " active" : "");
      btn.textContent = category;
      btn.addEventListener("click", () => {
        currentCategory = category;
        document.querySelectorAll(".filter-btn").forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        showProjects();
      });
      filterButtons.appendChild(btn);
    });
  }

  // 3. Loop through the projects and 4. create a card for each one
  function showProjects() {
    const search = searchBox.value.trim().toLowerCase();
    projectGrid.innerHTML = "";

    const filtered = allProjects.filter(p => {
      const matchesCategory = currentCategory === "All" || p.category === currentCategory;
      const text = (p.title + " " + p.description + " " + p.technologies.join(" ")).toLowerCase();
      return matchesCategory && text.includes(search);
    });

    filtered.forEach(project => {
      const col = document.createElement("div");
      col.className = "col-md-6 col-lg-4";

      const badges = project.technologies
        .map(t => `<span class="badge skill-badge">${t}</span>`)
        .join("");

      col.innerHTML = `
        <div class="card project-card h-100">
          <div class="card-body d-flex flex-column">
            <p class="project-category">${project.category}</p>
            <h2 class="h5 card-title">${project.title}</h2>
            <p class="card-text">${project.description}</p>
            <div class="d-flex flex-wrap gap-2 mt-auto mb-3">${badges}</div>
            <button type="button" class="btn btn-outline-brand btn-sm align-self-start">View details</button>
          </div>
        </div>`;

      col.querySelector("button").addEventListener("click", () => openModal(project));
      projectGrid.appendChild(col);
    });

    if (filtered.length === 0) {
      message.textContent = "No projects match that search. Try a different word or pick another category.";
      message.classList.remove("d-none");
    } else {
      message.classList.add("d-none");
    }
  }

  // Search box filters as you type
  searchBox.addEventListener("input", showProjects);

  // Fill in and open the Bootstrap modal
  function openModal(project) {
    document.getElementById("projectModalTitle").textContent = project.title;
    document.getElementById("projectModalCategory").textContent = project.category;
    document.getElementById("projectModalDetails").textContent = project.details || project.description;
    document.getElementById("projectModalTech").innerHTML = project.technologies
      .map(t => `<span class="badge skill-badge">${t}</span>`)
      .join("");
    modal.show();
  }
}
