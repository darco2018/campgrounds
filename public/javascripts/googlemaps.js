const marketsqCracow = { lat: 50.061721, lng: 19.93805 };
let map = null;
let ui = null;
let behavior = null;
let defaultCenter = marketsqCracow;
let defaultZoom = 13;

export function createMapWithUi(key, zoom, center) {
  let platform = new H.service.Platform({
    apikey: key
  });

  let maptypes = platform.createDefaultLayers();
  map = new H.Map(document.getElementById('map'), maptypes.vector.normal.map, {
    center: !center ? defaultCenter : center,
    zoom: !zoom ? defaultZoom : zoom,
    pixelRatio: window.devicePixelRatio || 1
  });
  window.addEventListener('resize', () => map.getViewPort().resize());
  behavior = new H.mapevents.Behavior(new H.mapevents.MapEvents(map));
  ui = H.ui.UI.createDefault(map, maptypes);
}

export function createMarker(location, iconUrl, html) {
  let icon = new H.map.Icon(iconUrl);
  let marker = new H.map.Marker(location, { icon: icon });
  marker.setData(html);
  return marker;
}

export function addMarkerToMap(marker) {
  map.addObject(marker);
}

export function addInfoBubble(location, text) {
  let bubble = new H.ui.InfoBubble(location, {
    content: text
  });
  ui.addBubble(bubble);
}

export function addGroupToMap(group) {
  map.addObject(group);
}

export function createInfoBubbleOnMarkerClick(group) {
  /* add 'tap' event listener, that opens info bubble, to the group
   event target is the marker itself, group is a parent event target
   for all objects that it contains */
  group.addEventListener(
    'tap',
    function(evt) {
      let bubble = new H.ui.InfoBubble(evt.target.getGeometry(), {
        content: evt.target.getData()
      });
      ui.addBubble(bubble);
    },
    false
  );
}
