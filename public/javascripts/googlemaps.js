const marketsqCracow = { lat: 50.061721, lng: 19.93805 };
let map = null;
let ui = null;
let behavior = null;
let defaultCenter = marketsqCracow;
let defaultZoom = 13;

export function createMapWithUi(key, zoom, center) {
  var platform = new H.service.Platform({
    apikey: key
  });

  var maptypes = platform.createDefaultLayers();
  map = new H.Map(document.getElementById('map'), maptypes.vector.normal.map, {
    center: !center ? defaultCenter : center,
    zoom: !zoom ? defaultZoom : zoom,
    pixelRatio: window.devicePixelRatio || 1
  });
  window.addEventListener('resize', () => map.getViewPort().resize());
  behavior = new H.mapevents.Behavior(new H.mapevents.MapEvents(map));
  ui = H.ui.UI.createDefault(map, maptypes);
}

export function addMarkerToMap(location, url) {
  var icon = new H.map.Icon(url);
  var marker = new H.map.Marker(location, { icon: icon });
  map.addObject(marker);
}

export function addInfoBubble(location, text) {
  var bubble = new H.ui.InfoBubble(location, {
    content: text
  });
  ui.addBubble(bubble);
}
