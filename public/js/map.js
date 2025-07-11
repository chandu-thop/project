mapboxgl.accessToken = mapToken;

if (listing.geometry && Array.isArray(listing.geometry.coordinates)) {
  const map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/streets-v12',
    center: listing.geometry.coordinates,
    zoom: 8,
  });

  new mapboxgl.Marker({ color: 'red' })
    .setLngLat(listing.geometry.coordinates)
    .setPopup(
      new mapboxgl.Popup({ offset: 25 }).setHTML(
        `<h3>${listing.title}</h3><p>Exact location shown after booking</p>`
      )
    )
    .addTo(map);
} else {
  console.warn("No coordinates available for this listing.");
}


