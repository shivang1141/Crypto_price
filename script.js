let currentPage = 1;
const itemsPerPage = 10;
const tableBody = document.querySelector("#crypto-table tbody");
const searchInput = document.querySelector("#search");
const currentPageDisplay = document.querySelector("#current-page");

const tooltip = document.querySelector("#tooltip");
const tooltipInner = tooltip.querySelector(".tooltip-inner");



function fetchCryptoData(page, searchTerm) {
  let url = `https://api.coincap.io/v2/assets?limit=${itemsPerPage}&offset=${(page - 1) * itemsPerPage}`;
  if (searchTerm) {
    url += `&search=${searchTerm}`;
  }
  fetch(url)
    .then(response => response.json())
    .then(data => updateTable(data.data))
    .catch(error => console.error("Error fetching crypto data:", error));
}

const favorites = new Set(JSON.parse(localStorage.getItem("favorites") || "[]"));


function updateTable(cryptoData) {
  tableBody.innerHTML = "";
  cryptoData.forEach(crypto => {
    const row = document.createElement("tr");

    const changePercent = parseFloat(crypto.changePercent24Hr).toFixed(2);
    const changeClass = changePercent >= 0 ? "positive" : "negative";
    const isFavorite = favorites.has(crypto.id) ? "active" : "";

    row.innerHTML = `
            <td><span class="favorite-icon ${isFavorite}" data-crypto-id="${crypto.id}">★</span></td>
            <td>${crypto.rank}</td>
            <td>${crypto.name}</td>
            <td>${crypto.symbol}</td>
            <td>${parseFloat(crypto.priceUsd).toFixed(2)}</td>
            <td class="${changeClass}">${changePercent}</td>
        `;

    row.querySelector("td:nth-child(3)").addEventListener("mouseenter", (event) => {
      const rect = event.target.getBoundingClientRect();
      const maxSupply = crypto.maxSupply ? crypto.maxSupply : "∞";
      tooltipInner.textContent = `Name: ${crypto.name}\nMax Supply: ${maxSupply}\nTotal Supply: ${crypto.supply}`;
      tooltip.style.left = rect.right + 10 + "px";
      tooltip.style.top = rect.top + "px";
      tooltip.style.display = "block";
    });

    row.querySelector("td:nth-child(3)").addEventListener("mouseleave", () => {
      tooltip.style.display = "none";
    });

    tableBody.appendChild(row);
  });
  currentPageDisplay.textContent = currentPage;
}


function nextPage() {
  currentPage++;
  fetchCryptoData(currentPage, searchInput.value);
}

function previousPage() {
  if (currentPage > 1) {
    currentPage--;
    fetchCryptoData(currentPage, searchInput.value);
  }
}

searchInput.addEventListener('input', function () {
  currentPage = 1;
  fetchCryptoData(currentPage, this.value);
});

fetchCryptoData(currentPage);

tableBody.addEventListener("click", function (event) {
  if (event.target.matches(".favorite-icon")) {
    const cryptoId = event.target.getAttribute("data-crypto-id");
    if (favorites.has(cryptoId)) {
      favorites.delete(cryptoId);
      event.target.classList.remove("active");
    } else {
      favorites.add(cryptoId);
      event.target.classList.add("active");
    }
    localStorage.setItem("favorites", JSON.stringify(Array.from(favorites)));
  }
});

function showFavorites() {
  const favoriteCryptos = Array.from(favorites);
  const promises = favoriteCryptos.map(id => fetch(`https://api.coincap.io/v2/assets/${id}`).then(response => response.json()));
  Promise.all(promises)
    .then(data => updateTable(data.map(item => item.data)))
    .catch(error => console.error("Error fetching favorite cryptos:", error));
}

const darkModeToggle = document.querySelector("#darkModeToggle");

function setDarkMode(enabled) {
  if (enabled) {
    document.body.classList.add("dark");
  } else {
    document.body.classList.remove("dark");
  }
}

darkModeToggle.addEventListener("change", (event) => {
  setDarkMode(event.target.checked);
});
