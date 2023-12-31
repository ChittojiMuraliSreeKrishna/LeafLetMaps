<!DOCTYPE html>
<html>

<head>
  <title>OpenStreetMap India</title>
  <meta charset='utf-8'>
  <meta name='viewport' content='initial-scale=1,maximum-scale=1,user-scalable=no'>

  <!-- Leaflet CSS -->
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.7.1/dist/leaflet.css" />
  <script src="https://api.mapbox.com/mapbox-gl-js/v1.12.0/mapbox-gl.js"></script>
  <link href="https://api.mapbox.com/mapbox-gl-js/v1.12.0/mapbox-gl.css" rel="stylesheet" />

  <!-- <script src="https://api.mapbox.com/mapbox-gl-js/plugins/mapbox-gl-geocoder/v4.5.1/mapbox-gl-geocoder.min.js">
  </script> -->
  <!-- <link href="https://api.mapbox.com/mapbox-gl-js/plugins/mapbox-gl-geocoder/v4.5.1/mapbox-gl-geocoder.css"
    rel="stylesheet" /> -->
  <script src="https://unpkg.com/leaflet@1.7.1/dist/leaflet.js"></script>
  <!-- <script src="https://cdn.jsdelivr.net/npm/@turf/turf@6/turf.min.js"></script> -->

  <!-- UIkit CSS -->
  <!-- <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/uikit@3.5.7/dist/css/uikit.min.css" /> -->

  <!-- UIkit JS -->
  <!-- <script src="https://cdn.jsdelivr.net/npm/uikit@3.5.7/dist/js/uikit.min.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/uikit@3.5.7/dist/js/uikit-icons.min.js"></script> -->

  <!-- <script src="./dist/main.js"></script> -->
  <style>
    #map {
      height: 100vh;
    }

    #toggleView {
      height: 50px;
      width: 100px;
      z-index: 999;
      background-color: bisque;
    }

    .leaflet-control-zoom-in {
      display: none;
    }

    .leaflet-control-zoom-out {
      display: none;
    }

    .leaflet-top {
      display: none;
    }

    .leaflet-control-zoom {
      display: none;
    }

    .leaflet-control-locate {
      display: none;
    }

    .mapboxgl-ctrl-attrib-inner {
      margin-right: 400px;
    }

    .mapboxgl-ctrl-group button {
      width: 100px;
    }

    .mapboxgl-ctrl-top-left .mapboxgl-ctrl-group button:nth-child(2) {
      display: none;
    }
  </style>
</head>

<body>
  <div id="map">
    <!-- <button id="toggleView">Toggle View</button> -->
  </div>

  <script src="https://unpkg.com/rss-parser/dist/rss-parser.min.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/xml2js@0.4.23/lib/xml2js.min.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/xml-js@1.6.11/dist/xml-js.min.js"></script>
  <script src="https://unpkg.com/leaflet.locatecontrol/dist/L.Control.Locate.min.js"></script>
  <script src="https://unpkg.com/moment/min/moment.min.js"></script>
  <script src="./dist/main.js"></script>
  <script>
    'use strict';

    var changesetsGeojson = {
      "type": "FeatureCollection",
      "features": []
    };

    var map = L.map('map').setView([22, 82], 5); // Centre position of India

    // Mapbox Streets India style
    L.tileLayer('https://api.mapbox.com/styles/v1/planemad/ckf4xcet7231819mm2e8njlca/tiles/{z}/{x}/{y}?access_token=pk.eyJ1Ijoib3NtaW5kaWEiLCJhIjoiY2w3dDdvNG9jMDAxNjN1cGlpdGczZjR0cyJ9.TZUuaJdTy2l99xKekZP0fA', {
      maxZoom: 18,
      attribution: '&copy; <a href="https://www.mapbox.com/about/maps/">Mapbox</a> contributors'
    }).addTo(map);

    // Add zoom control to the map.
    L.control.zoom({ position: 'bottomright' }).addTo(map);

    // Add geolocation control to the map.
    L.control.locate({ position: 'bottomright' }).addTo(map);

    // Edit the OSM map at the location
    document.getElementById('toggleView').onclick = function () {
      window.open(`https://www.openstreetmap.org/edit?editor=id#map=${map.getZoom()}/${map.getCenter().lat}/${map.getCenter().lng}`)
    }

    //
    //  Map logic
    //

    map.on('load', function () {

      // Show country boundaries as per Government of India
      filterBoundaries();

      // Add custom layers
      addMapLayers();

      // Add map interactions
      addMapEvents();

    });

    //
    // Map functions
    //

    function addMapLayers() {
      // Changesets layer
      var changesetsLayer = L.geoJSON(changesetsGeojson, {
        style: {
          color: 'red',
          fillOpacity: 0.5,
          weight: 2
        },
        onEachFeature: function (feature, layer) {
          layer.bindPopup(getPopupContent(feature));
        }
      }).addTo(map);

      // Layer control
      var baseMaps = {
        "Streets": L.tileLayer('https://api.mapbox.com/styles/v1/planemad/ckf4xcet7231819mm2e8njlca/tiles/{z}/{x}/{y}?access_token=pk.eyJ1Ijoib3NtaW5kaWEiLCJhIjoiY2w3dDdvNG9jMDAxNjN1cGlpdGczZjR0cyJ9.TZUuaJdTy2l99xKekZP0fA', {
          maxZoom: 18,
          attribution: '&copy; <a href="https://www.mapbox.com/about/maps/">Mapbox</a> contributors'
        }),
        "Railways": L.tileLayer('https://api.mapbox.com/styles/v1/planemad/ck7p3wxmp0q571imu99elwqs1/tiles/{z}/{x}/{y}?access_token=pk.eyJ1Ijoib3NtaW5kaWEiLCJhIjoiY2w3dDdvNG9jMDAxNjN1cGlpdGczZjR0cyJ9.TZUuaJdTy2l99xKekZP0fA', {
          maxZoom: 18,
          attribution: '&copy; <a href="https://www.mapbox.com/about/maps/">Mapbox</a> contributors'
        }),
        "Waterways": L.tileLayer('https://api.mapbox.com/styles/v1/planemad/ckd42fwa20n531iqrewerwla1/tiles/{z}/{x}/{y}?access_token=pk.eyJ1Ijoib3NtaW5kaWEiLCJhIjoiY2w3dDdvNG9jMDAxNjN1cGlpdGczZjR0cyJ9.TZUuaJdTy2l99xKekZP0fA', {
          maxZoom: 18,
          attribution: '&copy; <a href="https://www.mapbox.com/about/maps/">Mapbox</a> contributors'
        }),
        "Satellite": L.tileLayer('https://api.mapbox.com/styles/v1/mapbox/satellite-streets-v10/tiles/{z}/{x}/{y}?access_token=pk.eyJ1Ijoib3NtaW5kaWEiLCJhIjoiY2w3dDdvNG9jMDAxNjN1cGlpdGczZjR0cyJ9.TZUuaJdTy2l99xKekZP0fA', {
          maxZoom: 18,
          attribution: '&copy; <a href="https://www.mapbox.com/about/maps/">Mapbox</a> contributors'
        })
      };
      var overlayMaps = {
        "Changesets": changesetsLayer
      };
      L.control.layers(baseMaps, overlayMaps, { position: 'topleft' }).addTo(map);
    }

    function addMapEvents() {
      map.on('mouseover', function (e) {
        var layer = e.target;
        layer.setStyle({ fillColor: 'blue', fillOpacity: 0.3 });
      });

      map.on('mouseout', function (e) {
        var layer = e.target;
        layer.setStyle({ fillColor: 'red', fillOpacity: 0.5 });
      });
    }

    function filterBoundaries() {
      // Apply an Indian worldview filter to the boundary map layers
      // Note: You need to provide boundary data source (not available in the provided code).
      // You can add your own boundary data source (GeoJSON) and use it here.
    }

    function getPopupContent(feature) {
      var props = feature.properties;
      var description = '<b>' + props.changes + '</b> changes by ' + props.user + '<br>' +
        '<p>' + props.comment + '</p>' +
        '<br><a href="https://osmcha.org/filters?filters={%22in_bbox%22:[{%22label%22:%22bbox_osmcha%22,%22value%22:%22' + props.bbox_osmcha + '%22}],%22area_lt%22:[{%22label%22:%2210%22,%22value%22:%2210%22}]}">Check neighborhood activity with OSMCha</a>' +
        '<br><a href="https://www.openstreetmap.org/history#map=14/' + feature.geometry.coordinates[1] + '/' + feature.geometry.coordinates[0] + '">OSM History</a>';
      return description;
    }

    // Fetch OSM data
    // Note: The async/await syntax may not be supported in older browsers, consider using promises if needed.
    (async () => {

      var feed = await fetch('https://osmcha.org/api/v1/aoi/a4b27b2f-cec7-4291-afa2-38e77c863944/changesets/feed/');
      var rss = await feed.text();
      var parser = new DOMParser();
      var xmlDoc = parser.parseFromString(rss, 'text/xml');
      var items = xmlDoc.getElementsByTagName('item');

      Array.from(items).forEach(function (item) {
        var changesetId = item.getElementsByTagName('link')[0].textContent.split('/')[4];
        fetch(`https://api.openstreetmap.org/api/0.6/changeset/${changesetId}?include_discussion=true`)
          .then(response => response.text())
          .then(str => {
            parseString(str, function (err, result) {
              var changesetMetadata = result.osm.changeset[0].$;
              var changesetPolygon = bboxPolygon([
                changesetMetadata.min_lon,
                changesetMetadata.min_lat,
                changesetMetadata.max_lon,
                changesetMetadata.max_lat
              ]);

              changesetPolygon.properties = {
                title: item.getElementsByTagName('title')[0].textContent,
                user: changesetMetadata.user,
                'edit-count': result.osm.changeset[0].tag[0].$.v,
                timestamp: changesetMetadata.closed_at,
                changes: changesetMetadata.changes_count,
                comment: result.osm.changeset[0].tag.slice(-1)[0].$.v,
                bbox_osmcha: changesetMetadata.min_lon + ',' + changesetMetadata.min_lat + ',' + changesetMetadata.max_lon + ',' + changesetMetadata.max_lat
              };

              changesetsGeojson.features.push(changesetPolygon);
              map.eachLayer(layer => {
                if (layer.feature && layer.feature.geometry.type === 'Polygon') {
                  layer.setStyle({ fillColor: 'red', fillOpacity: 0.5 });
                }
              });
            });
          });
      });
    })();
  </script>
</body>

</html>
