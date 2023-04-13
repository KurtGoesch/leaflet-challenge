var queryURL = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_day.geojson";

d3.json(queryURL).then(function (data) {
  createFeatures(data.features);
});


function createFeatures(response) {

  // Give each feature a popup describing the place and time of the earthquakes
  function onEachFeature(feature, layer) {
    p = feature.properties
    
    layer.bindPopup(`<h3>Where: ${p.place}</h3><hr><p>Time: ${new Date(p.time)}</p><hr><p>Magnitude: ${p.mag}</p>`);
  }

  function createCircleMarker(feature, latlng) {
    let options = {
      radius: feature.properties.mag * 5,
      fillColor: chooseColor(feature.properties.mag),
      color: chooseColor(feature.properties.mag),
      weight: 1,
      opacity: 0.6,
      fillOpacity: 0.35
    }
    return L.circleMarker(latlng, options);
  }
  let earthquakes = L.geoJSON(response, {
    onEachFeature: onEachFeature,
    pointToLayer: createCircleMarker
  });

  createMap(earthquakes);
}

function chooseColor(mag) {
  switch (true) {
    case (1.0 <= mag && mag <= 2.0):
      return "#0071BC"; // Strong blue
    case (2.0 <= mag && mag <= 3.0):
      return "#35BC00";
    case (3.0 <= mag && mag <= 4.0):
      return "#BCBC00";
    case (4.0 <= mag && mag <= 5.0):
      return "#BC3500";
    case (5.0 <= mag && mag <= 20.0):
      return "#BC0000";
    default:
      return "#E2FFAE";
  }
}

let legend = L.control({ position: 'topright' });

legend.onAdd = function () {
  var div = L.DomUtil.create('div', 'info legend');
  var grades = [1.0, 2.0, 3.0, 4.0, 5.0];
  var labels = [];
  var legendInfo = "<h4>Magnitude</h4>";

  div.innerHTML = legendInfo

  for (var i = 0; i < grades.length; i++) {
    labels.push('<ul style="background-color:' + chooseColor(grades[i] + 1) + '"> <span>' + grades[i] + (grades[i + 1] ? '&ndash;' + grades[i + 1] + '' : '+') + '</span></ul>');
  }

  div.innerHTML += "<ul>" + labels.join("") + "</ul>";

  return div;
};


function createMap(earthquakes) {
  let streetstylemap = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 20,
    id: "outdoors-v11",
    accessToken: API_KEY
  })

  let graymap = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 20,
    id: "light-v10",
    accessToken: API_KEY
  });

  let baseMaps = {
    "Outdoors": streetstylemap,
    "Grayscale": graymap
  };

  let overlayMaps = {
    Earthquakes: earthquakes
  };

  let myMap = L.map("myMap", {
    center: [
      0, 0
    ],
    zoom: 3,
    layers: [streetstylemap, earthquakes]
  });
  // Add the layer control to the map
  L.control.layers(baseMaps, overlayMaps, {
    collapsed: false
  }).addTo(myMap);
  legend.addTo(myMap);
}