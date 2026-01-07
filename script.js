const map = L.map("map");

// Base map
L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution: "© OpenStreetMap contributors",
}).addTo(map);

// Get user location
navigator.geolocation.getCurrentPosition(
  (position) => {
    const userLat = position.coords.latitude;
    const userLon = position.coords.longitude;

    map.setView([userLat, userLon], 15);

    // User marker
    L.marker([userLat, userLon])
      .addTo(map)
      .bindPopup("📍 You are here")
      .openPopup();

    fetchNearbyATMs(userLat, userLon);
  },
  () => {
    alert("Please allow location access");
  }
);

// Distance calculation (Haversine formula)
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Fetch nearby ATMs
async function fetchNearbyATMs(userLat, userLon) {
  try {
    const delta = 0.05; // ~5 km
    const left = userLon - delta;
    const right = userLon + delta;
    const top = userLat + delta;
    const bottom = userLat - delta;

    const url = `https://nominatim.openstreetmap.org/search?format=json&q=atm&limit=20&viewbox=${left},${top},${right},${bottom}&bounded=1`;

    const response = await fetch(url, {
      headers: {
        "User-Agent": "NearbyATMFinder/1.0 (student-project)",
        "Accept": "application/json",
      },
    });

    const data = await response.json();

    if (!data || data.length === 0) {
      alert("No ATMs found nearby.");
      return;
    }

    data.forEach((place) => {
      const atmLat = parseFloat(place.lat);
      const atmLon = parseFloat(place.lon);

      const distance = calculateDistance(
        userLat,
        userLon,
        atmLat,
        atmLon
      ).toFixed(2);

      L.marker([atmLat, atmLon])
        .addTo(map)
        .bindPopup(
          `🏧 <b>${place.display_name}</b><br>📏 Distance: <b>${distance} km</b>`
        );
    });
  } catch (err) {
    console.error(err);
    alert("Failed to load ATMs");
  }
}
