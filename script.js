// Bas-URL för API:et
const API_BASE = "https://4a6l0o1px9.execute-api.eu-north-1.amazonaws.com";

// Hämtar API-nyckel
async function getApiKey() {
    const response = await fetch(API_BASE + "/key");

    if (!response.ok) throw new Error("Kunde inte hämta API-nyckeln");

    const data = await response.json();
    return data.key;
}

// Hämta planeter och visa dem
async function loadPlanets() {
    const loading = document.getElementById("loading");
    const errorBox = document.getElementById("error");

    loading.style.display = "block"; // visa laddning
    errorBox.style.display = "none"; // göm felmeddelande

    try {
        const apiKey = await getApiKey();

        const response = await fetch(API_BASE + "/bodies", {
            headers: { "x-zocom": apiKey }
        });

        if (!response.ok) throw new Error("Kunde inte hämta planeterna");

        const data = await response.json();
        if (!data || !Array.isArray(data.bodies)) throw new Error("Fel från API");

        showPlanets(data.bodies); // visa planeter

        loading.style.display = "none"; // ta bort laddning
    } catch (error) {
        loading.style.display = "none";
        errorBox.style.display = "block";
        document.getElementById("errorText").textContent =
            "Planeterna kunde inte hämtas. Försök igen senare.";
        console.error(error);
    }
}

// Skapa planet element
function showPlanets(bodies) {
    const container = document.getElementById("solarSystem");
    container.innerHTML = "";

    for (let body of bodies) {
        if (body.type !== "planet") continue;

        const planet = document.createElement("div");

        // Namn som klass (inga å, ä, ö)
        const className = body.name
            .toLowerCase()
            .replace(/å/g, "a")
            .replace(/ä/g, "a")
            .replace(/ö/g, "o");

        planet.className = "planet " + className;
        planet.setAttribute("role", "button");

        // Klick på planet visar info
        planet.addEventListener("click", () => {
            showPlanetInfo(body);
        });

        container.appendChild(planet);
    }
}

// Visa info om planet
function showPlanetInfo(planet) {
    const info = document.getElementById("planetInfo");
    const solarSystem = document.getElementById("solarSystem");

    const moons = planet.moons && planet.moons.length > 0
        ? planet.moons.join(", ")
        : "Inga";

    info.innerHTML = `
        <div class="info-card">
            <button class="back-btn" id="backBtn">Tillbaka</button>
            <h2>${planet.name}</h2>
            <em>${planet.latinName}</em>
            <p>${planet.desc}</p>
            <div class="divider"></div>
            <div class="info-grid">
                <div class="label">OMKRETS</div>
                <div class="value">${planet.circumference} km</div>
                <div class="label">KM FRÅN SOLEN</div>
                <div class="value">${planet.distance} km</div>
                <div class="label">MAX TEMPERATUR</div>
                <div class="value">${planet.temp.day} °C</div>
                <div class="label">MIN TEMPERATUR</div>
                <div class="value">${planet.temp.night} °C</div>
            </div>
            <div class="divider"></div>
            <div class="moons-title">MÅNAR</div>
            <p>${moons}</p>
        </div>
    `;

    solarSystem.style.display = "none"; // göm solsystem
    document.body.classList.add("showing-info");
    info.classList.remove("hidden");
    info.setAttribute("aria-hidden", "false");

    // Tillbaka knapp
    const backBtn = document.getElementById("backBtn");
    if (backBtn) {
        backBtn.addEventListener("click", () => {
            info.classList.add("hidden");
            info.setAttribute("aria-hidden", "true");
            solarSystem.style.display = "flex"; // visa solsystem igen
            document.body.classList.remove("showing-info");
        });
    }
}

// Kör när sidan är laddad
document.addEventListener("DOMContentLoaded", () => {
    const retryBtn = document.getElementById("retryBtn");
    if (retryBtn) retryBtn.addEventListener("click", loadPlanets);

    loadPlanets(); // hämta planeter direkt
});
