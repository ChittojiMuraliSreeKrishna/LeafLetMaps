
var map = L.map('map').setView([22, 92], 4);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors'
}).addTo(map);
// Load and display GeoJSON data
var geojsonLayer = L.geoJSON().addTo(map);

fetch('./india_composite.geojson')
    .then(response => response.json())
    .then(data => {
        geojsonLayer.addData(data);
    });