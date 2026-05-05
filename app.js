const map = L.map("map", {
  zoomControl: true,
  preferCanvas: true,
  minZoom: 5
}).setView([34.7, -82.5], 6);

const coordsControl = document.createElement("div");
coordsControl.className = "coords-chip";
coordsControl.innerHTML = "Latitude: 25.5° – 38.3°<br>Longitude: -94.5° – -75.1°";
document.querySelector(".map-panel").appendChild(coordsControl);

L.tileLayer(
  "https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}",
  {
    attribution: "Tiles &copy; Esri"
  }
).addTo(map);

const elements = {
  speciesSelect: document.getElementById("speciesSelect"),
  yearSlider: document.getElementById("yearSlider"),
  yearLabel: document.getElementById("yearLabel"),
  timelineCaption: document.getElementById("timelineCaption"),
  selectedSpeciesName: document.getElementById("selectedSpeciesName"),
  selectedSpeciesCount: document.getElementById("selectedSpeciesCount"),
  visibleOccurrences: document.getElementById("visibleOccurrences"),
  totalSpecies: document.getElementById("totalSpecies"),
  detailsContent: document.getElementById("detailsContent"),
  toggleTerritories: document.getElementById("toggleTerritories")
};

const layerState = {
  invasiveData: null,
  territoriesData: null,
  filteredFeatures: [],
  currentSpecies: "Kudzu",
  currentYear: 2025,
  territoryLayer: null,
  invasiveLayer: null
};

const regionImpactBySpecies = {
  "Kudzu": "Fast-growing vine that can smother trees and edge habitat, reducing native plant cover and reshaping forest structure.",
  "Chinese Privet": "Dense thickets can displace native understory plants and reduce habitat quality for birds and pollinators.",
  "Chinese Tallowtree": "Can spread through floodplains and disturbed sites, changing forest composition and limiting native regeneration.",
  "Chinese Wisteria": "Woody vine that can blanket shrubs and trees, suppressing native growth and changing light availability.",
  "Common Reed": "Can dominate wetlands, alter hydrology, and reduce habitat diversity for marsh-dependent species.",
  "Garlic Mustard": "Can suppress native woodland plants and interfere with soil relationships that support forest biodiversity.",
  "Hydrilla": "Aggressive aquatic invader that can choke waterways, reduce oxygen, and alter freshwater habitat structure.",
  "Japanese Honeysuckle": "Sprawling vine that can overtake native vegetation and shift wildlife habitat at forest edges.",
  "Japanese Stiltgrass": "Can spread across forest floors and disturbed ground, reducing native herb diversity and changing fire behavior.",
  "Multiflora Rose": "Thorny, dense shrub that can crowd out native plants and make habitat less usable for some species.",
  "Autumn Olive": "Can spread quickly into fields and forest edges, changing soil chemistry and crowding native vegetation.",
  "Purple Loosestrife": "Can dominate wetlands and reduce the native plant variety needed by many insects and birds.",
  "Tree-of-Heaven": "Rapid colonizer of roadsides and disturbed land that competes strongly with native plants and can promote monocultures."
};

const territoryDescriptions = {
  "Alabama": {
    cultural_context: "The Alabama people are part of the deep Indigenous history of the Gulf South, with homelands tied to river corridors, trade, diplomacy, and community life across what is now Alabama and nearby regions. Their territorial presence reflects long-standing relationships to forests, floodplains, and the seasonal movement of people, foodways, and ceremony.",
    environmental_context: "In this region, invasive plants can alter bottomland forests, riparian areas, and open woodland systems that historically supported diverse plant gathering, hunting, and travel routes. Changes to water flow, understory structure, and native biodiversity can reduce ecological resilience across culturally significant landscapes."
  },
  "Biloxi": {
    cultural_context: "The Biloxi are part of the Indigenous history of the north-central Gulf Coast, where communities were connected to coastal exchange networks, river systems, and seasonal use of wetland and forest resources. Their homeland reflects strong ties to place, mobility, and regional cultural exchange.",
    environmental_context: "In Biloxi-associated landscapes, invasive species can disrupt marsh edges, pine and hardwood habitats, and river-connected ecosystems that support wildlife and native plants. Habitat simplification can weaken the ecological diversity that sustains both cultural and environmental continuity."
  },
  "Calusa": {
    cultural_context: "The Calusa are closely associated with the coastal and estuarine environments of south Florida, where complex social and political life developed in relationship to waterways, fisheries, and coastal mobility. Their history is deeply linked to mangrove, bay, and nearshore ecosystems.",
    environmental_context: "In south Florida, invasive species can reshape wetlands, estuaries, and coastal uplands by crowding out native vegetation, changing hydrology, and stressing already vulnerable habitats. These shifts affect fisheries, bird habitat, and the broader ecological integrity of coastal cultural landscapes."
  },
  "Catawba": {
    cultural_context: "The Catawba are strongly tied to the Piedmont of the Carolinas, especially river valleys that supported settlement, agriculture, trade, and ceramic traditions. Their homeland reflects long-standing connections to waterways, community networks, and place-based knowledge.",
    environmental_context: "In Catawba-associated landscapes, invasive species can affect riverbanks, piedmont forests, and disturbed edges by reducing native plant diversity and changing habitat structure. These shifts can impact pollinators, forest regeneration, and culturally meaningful relationships to land and water."
  },
  "Cherokee": {
    cultural_context: "Cherokee homelands span parts of the southern Appalachians and adjacent valleys, where mountains, rivers, and coves shaped settlement, travel, agriculture, medicine, and ceremony. The region holds deep cultural significance through long-standing relationships to land, kinship, and ecological knowledge.",
    environmental_context: "Across Appalachian and foothill environments, invasive species can spread along roadsides, stream corridors, and forest edges, suppressing native understory plants and altering habitat structure. These changes can affect medicinal and food plants, wildlife movement, and the resilience of biodiverse mountain ecosystems."
  },
  "Chickasaw": {
    cultural_context: "The Chickasaw are associated with broad homelands in the interior Southeast, especially areas connected by river valleys, uplands, and trade routes. Their territorial history reflects strong political organization, movement across landscapes, and enduring ties to place.",
    environmental_context: "In Chickasaw-associated regions, invasive species can change open woodlands, riparian zones, and agricultural edges by outcompeting native plants and increasing ecological stress. These impacts can reduce habitat quality and alter landscapes important for hunting, gathering, and community continuity."
  },
  "Choctaw": {
    cultural_context: "The Choctaw are deeply rooted in the southeastern woodlands and Gulf South, with homelands shaped by river systems, forests, agriculture, and community life. Their history reflects long-term stewardship of ecologically rich landscapes across present-day Mississippi and Alabama.",
    environmental_context: "In Choctaw-associated territories, invasive plants can transform forest understories, wetlands, and edge habitats, reducing the abundance of native species and changing ecological processes. Such shifts can affect culturally significant plants, wildlife habitat, and the overall health of land-based traditions."
  },
  "Coushatta": {
    cultural_context: "The Coushatta are part of the broader Indigenous history of the Southeast, with ties to forested homelands, river corridors, and interconnected communities. Their territorial presence reflects long-standing relations with woodland ecosystems and movement through shared regional networks.",
    environmental_context: "In these landscapes, invasive species can alter forest composition, streamside vegetation, and disturbed habitats, making it harder for native plants to recover after stress or development. This can reduce biodiversity and affect places important to ecological and cultural continuity."
  },
  "Houma": {
    cultural_context: "The Houma are closely connected to the wetlands, bayous, and lower river environments of the Gulf South, where community life has long been shaped by water, fisheries, and coastal resilience. Their homeland reflects deep knowledge of marsh and estuarine systems.",
    environmental_context: "In Houma-associated landscapes, invasive species can compound pressures from coastal erosion, saltwater intrusion, and habitat fragmentation by displacing native wetland vegetation. These changes can affect fisheries, storm-buffering marshes, and the ecological stability of water-based cultural landscapes."
  },
  "Meherrin": {
    cultural_context: "The Meherrin are associated with the riverine and coastal plain landscapes of the Mid-Atlantic South, especially areas where waterways supported settlement, agriculture, and exchange. Their homeland reflects enduring ties to local watersheds and place-based community life.",
    environmental_context: "In Meherrin-associated regions, invasive plants can spread through floodplains, roadside corridors, and secondary forests, changing native plant communities and stream health. These pressures can reduce habitat diversity and weaken the resilience of culturally significant watersheds."
  },
  "Muscogee": {
    cultural_context: "Muscogee homelands encompass broad parts of the Southeast, where river systems, towns, agriculture, and ceremonial life were central to community structure. Their territorial history reflects deep connections to land stewardship, diplomacy, and interregional movement.",
    environmental_context: "In Muscogee-associated landscapes, invasive species can disrupt pine-hardwood systems, riparian areas, and open habitats by crowding out native vegetation and altering fire or disturbance patterns. These shifts can affect biodiversity, foodways, and landscapes tied to historical memory."
  },
  "Natchez": {
    cultural_context: "The Natchez are associated with the lower Mississippi region and nearby southeastern landscapes shaped by river systems, mound-building traditions, agriculture, and political complexity. Their homelands reflect deep historical connections to fertile floodplain and bluff environments.",
    environmental_context: "In Natchez-associated territories, invasive species can alter bottomlands, floodplain forests, and disturbed river-edge habitats by reducing native regeneration and simplifying plant communities. These changes affect wildlife habitat and the ecological richness of river-centered cultural landscapes."
  },
  "Nottoway": {
    cultural_context: "The Nottoway are tied to the riverine and coastal plain environments of present-day Virginia and nearby regions, where waterways supported travel, exchange, and community life. Their homeland reflects long-term relationships to local forests, wetlands, and agricultural lands.",
    environmental_context: "In Nottoway-associated regions, invasive species can spread through stream corridors, wet lowlands, and fragmented forests, displacing native plants and altering habitat structure. This can reduce the ecological health of landscapes connected to traditional use and regional biodiversity."
  },
  "Occaneechi": {
    cultural_context: "The Occaneechi are associated with the Piedmont and river-trade landscapes of the Carolinas and Virginia, where communities were active in exchange, diplomacy, and movement along major waterways. Their homeland reflects strong ties to rivers as cultural and economic corridors.",
    environmental_context: "In Occaneechi-associated landscapes, invasive plants can affect riverbanks, floodplains, and piedmont forests by crowding out native species and changing soil and moisture conditions. These impacts can weaken watershed health and the diversity of native plants important to local ecosystems."
  },
  "Osage": {
    cultural_context: "The Osage are historically associated with broad interior homelands and movement across major river-connected landscapes, including areas that intersect the western edge of your Southeast study region. Their territorial history reflects strong relationships to mobility, trade, and land-based lifeways.",
    environmental_context: "Where Osage-associated territory overlaps your map region, invasive species can affect prairies, woodland edges, and riparian systems by reducing native cover and changing habitat structure. These pressures can diminish biodiversity and disrupt ecological transition zones."
  },
  "Pamunkey": {
    cultural_context: "The Pamunkey are deeply connected to the tidewater and river systems of Virginia, where fishing, agriculture, trade, and community life have long centered on water-based landscapes. Their homeland reflects enduring relationships with estuarine and freshwater environments.",
    environmental_context: "In Pamunkey-associated landscapes, invasive species can alter wetlands, tidal rivers, and riparian forests by outcompeting native plants and changing habitat for fish, birds, and pollinators. These shifts can affect watershed health and the ecological continuity of river-centered cultural places."
  },
  "Quapaw": {
  cultural_context: "The Quapaw are associated with Mississippi River and Arkansas-connected homelands where waterways shaped movement, trade, diplomacy, and settlement. The tribal name "Quapaw" means "downstream people" in their native language, and reflects their connection to the land and the importance of rivers water to their way of life. Their territorial presence reflects deep ties to floodplain environments and interconnected river cultures.",
    environmental_context: "In Quapaw-associated areas, invasive species can alter floodplain forests, river margins, and wet lowlands by limiting native plant regeneration and simplifying habitat structure. These changes can affect water quality, wildlife use, and the resilience of river-based ecosystems."
  },
  "Saponi": {
    cultural_context: "The Saponi are associated with Piedmont and upper river landscapes in Virginia and North Carolina, where community life was linked to trade corridors, forests, and agricultural lands. Their homeland reflects long-standing relationships to upland and riverine environments.",
    environmental_context: "In Saponi-associated regions, invasive plants can spread through forest edges, old fields, and stream corridors, reducing native herb and shrub diversity. This can affect pollinator networks, wildlife habitat, and the ecological richness of culturally meaningful landscapes."
  },
  "Shawnee": {
    cultural_context: "The Shawnee are connected to wide-ranging eastern woodlands and river-valley homelands, including areas that intersect the northern edge of your study region. Their history reflects mobility, diplomacy, and sustained relationships to forests, waterways, and hunting landscapes.",
    environmental_context: "Within Shawnee-associated overlap areas, invasive species can disrupt upland forests, floodplains, and open habitats by reshaping understory communities and limiting native regeneration. These changes reduce habitat complexity and can affect seasonal movement and resource landscapes."
  },
  "Timucua": {
    cultural_context: "The Timucua are associated with northern and central Florida, where Indigenous communities were closely linked to river systems, wetlands, forests, and coastal routes. Their homeland reflects deep historical relationships to diverse subtropical environments.",
    environmental_context: "In Timucua-associated territories, invasive species can alter hammocks, marshes, pine flatwoods, and river corridors by displacing native vegetation and stressing already dynamic habitats. These changes can affect fire regimes, wildlife use, and the resilience of Florida ecosystems."
  },
  "Tunica": {
    cultural_context: "The Tunica are associated with lower Mississippi and adjacent southeastern homelands shaped by river movement, agriculture, and exchange networks. Their territorial history reflects close relationships to alluvial landscapes and community life tied to major waterways.",
    environmental_context: "In Tunica-associated overlap areas, invasive species can affect floodplain forests, wet prairies, and disturbed riparian habitats by reducing native diversity and changing hydrologic function. These pressures can weaken ecologically rich river systems important to both wildlife and cultural memory."
  },
  "Tuscarora": {
    cultural_context: "The Tuscarora are tied to the coastal plain and river systems of the Carolinas, where settlements, agriculture, diplomacy, and mobility were closely linked to watershed networks. Their homeland reflects enduring relationships to land, water, and regional exchange.",
    environmental_context: "In Tuscarora-associated territories, invasive plants can transform swamp margins, pine systems, and riparian corridors by crowding out native species and changing habitat structure. These shifts can reduce native plant availability and strain the resilience of culturally significant ecosystems."
  },
  "Tutelo": {
    cultural_context: "The Tutelo are associated with interior Virginia and nearby upland-river landscapes where movement, exchange, and community life were shaped by forested terrain and watershed connections. Their homeland reflects ties to both upland and riverine ecological systems.",
    environmental_context: "In Tutelo-associated regions, invasive species can spread through foothill forests, stream valleys, and disturbed sites, suppressing native regeneration and altering understory composition. These impacts can reduce ecological diversity and affect culturally meaningful relationships to place."
  },
  "Yuchi": {
    cultural_context: "The Yuchi are associated with southeastern river valleys and woodlands, with strong historical ties to community networks, ceremonial life, and river-centered movement. Their homeland reflects long-standing relationships to fertile floodplains and forested landscapes.",
    environmental_context: "In Yuchi-associated territories, invasive species can alter river corridors, bottomlands, and forest edges by reducing native plant diversity and increasing ecological stress after disturbance. These changes can affect habitat quality, gathering landscapes, and watershed resilience."
  }
};

async function loadData() {
  const [invasive, territories] = await Promise.all([
    fetch("./data/invasive_species.geojson").then((r) => r.json()),
    fetch("./data/indigenous_territories_southeast_states.geojson").then((r) => r.json())
  ]);

  layerState.invasiveData = invasive;

  territories.features = territories.features.map((feature) => {
    const props = feature.properties || {};
    const territoryName = props.display_name || props.name_en || props.name_indig;
    const match = territoryDescriptions[territoryName];

    if (match) {
      feature.properties = {
        ...props,
        cultural_context: match.cultural_context,
        environmental_context: match.environmental_context
      };
    }

    return feature;
  });

  layerState.territoriesData = territories;

  initializeControls();
  buildTerritoriesLayer();
  updateMap();
}

function initializeControls() {
  const speciesList = [...new Set(layerState.invasiveData.features.map((f) => f.properties.species))]
    .filter(Boolean)
    .sort((a, b) => a.localeCompare(b));

  elements.totalSpecies.textContent = speciesList.length.toString();

  elements.speciesSelect.innerHTML = speciesList
    .map(
      (species) =>
        `<option value="${species}" ${species === layerState.currentSpecies ? "selected" : ""}>${species}</option>`
    )
    .join("");

  elements.speciesSelect.addEventListener("change", () => {
    layerState.currentSpecies = elements.speciesSelect.value;
    updateMap();
  });

  elements.yearSlider.addEventListener("input", () => {
    layerState.currentYear = Number(elements.yearSlider.value);
    elements.yearLabel.textContent = layerState.currentYear;
    elements.timelineCaption.textContent = `Showing occurrences from 2000 to ${layerState.currentYear}`;
    updateMap();
  });

  elements.toggleTerritories.addEventListener("change", syncLayerVisibility);
}

function buildTerritoriesLayer() {
  layerState.territoryLayer = L.geoJSON(layerState.territoriesData, {
    style: () => ({
      color: "#556b57",
      weight: 1.2,
      fillColor: "#bfc8ae",
      fillOpacity: 0.16
    }),
    onEachFeature: (feature, layer) => {
      const name =
        feature.properties.display_name ||
        feature.properties.name_en ||
        feature.properties.name_indig ||
        "Indigenous territory";

      layer.bindTooltip(name, {
        permanent: false,
        direction: "center",
        className: "territory-tooltip"
      });

      layer.on("click", () => renderTerritoryDetails(feature));
    }
  });

  syncLayerVisibility();
}

function syncLayerVisibility() {
  if (elements.toggleTerritories.checked) {
    if (!map.hasLayer(layerState.territoryLayer)) {
      layerState.territoryLayer.addTo(map);
    }
  } else if (layerState.territoryLayer && map.hasLayer(layerState.territoryLayer)) {
    map.removeLayer(layerState.territoryLayer);
  }
}

function updateMap() {
  if (layerState.invasiveLayer && map.hasLayer(layerState.invasiveLayer)) {
    map.removeLayer(layerState.invasiveLayer);
  }

  const species = layerState.currentSpecies;
  const year = layerState.currentYear;

  const filtered = layerState.invasiveData.features.filter((feature) => {
    const props = feature.properties || {};
    const featureYear = Number(props.year);
    return props.species === species && Number.isFinite(featureYear) && featureYear >= 2000 && featureYear <= year;
  });

  layerState.filteredFeatures = filtered;
  elements.selectedSpeciesName.textContent = species;
  elements.selectedSpeciesCount.textContent = `${filtered.length.toLocaleString()} occurrences`;
  elements.visibleOccurrences.textContent = filtered.length.toLocaleString();

  layerState.invasiveLayer = L.geoJSON(
    { type: "FeatureCollection", features: filtered },
    {
      renderer: L.canvas({ padding: 0.5 }),
      pointToLayer: (_feature, latlng) =>
        L.circleMarker(latlng, {
          radius: 2.6,
          color: "#c46056",
          weight: 0,
          fillColor: "#c46056",
          fillOpacity: 0.72
        }),
      onEachFeature: (feature, layer) => {
        layer.on("click", () => renderOccurrenceDetails(feature));
      }
    }
  ).addTo(map);

  if (filtered.length) {
    const bounds = layerState.invasiveLayer.getBounds();
    if (bounds.isValid()) map.fitBounds(bounds.pad(0.08), { animate: false });
  }

  syncLayerVisibility();
}

function renderOccurrenceDetails(feature) {
  const props = feature.properties || {};
  const point = turf.point(feature.geometry.coordinates);
  const relatedTerritory = findRelevantTerritory(point);
  const displayDate = formatDate(props.eventDate, props.year, props.month, props.day);
  const territoryName =
    relatedTerritory?.properties?.display_name ||
    relatedTerritory?.properties?.name_en ||
    relatedTerritory?.properties?.name_indig ||
    "Regional context";

  const culturalContext =
    relatedTerritory?.properties?.cultural_context ||
    "This occurrence is outside the highlighted territory polygons, but still contributes to broader regional ecological pressure across the Southeast.";

  const environmentalContext =
    relatedTerritory?.properties?.environmental_context ||
    "Invasive spread can contribute to biodiversity loss, habitat simplification, and additional stress in ecosystems affected by changing climate conditions.";

  const speciesImpact =
    regionImpactBySpecies[props.species] ||
    "This invasive species can alter habitat structure and increase ecological stress where it spreads.";

  elements.detailsContent.innerHTML = `
    <div class="badge">Occurrence point selected</div>
    <div class="info-block">
      <h3>Basic occurrence data</h3>
      <div class="info-grid">
        <div><span class="label">Scientific name</span><span>${escapeHTML(props.scientificName || props.species || "Not available")}</span></div>
        <div><span class="label">Date</span><span>${escapeHTML(displayDate)}</span></div>
        <div><span class="label">Location</span><span>${escapeHTML(props.stateProvince || props.country || "Unknown location")}</span></div>
        <div><span class="label">Coordinates</span><span>${formatCoordinates(feature.geometry.coordinates)}</span></div>
      </div>
    </div>

    <div class="info-block">
      <h3>Regional cultural context</h3>
      <p><strong>${escapeHTML(territoryName)}:</strong> ${escapeHTML(culturalContext)}</p>
      <p>${escapeHTML(props.species)} may affect traditional practices by changing access to native plant communities, altering waterways or forest edges, and reducing the ecological stability of culturally meaningful landscapes.</p>
    </div>

    <div class="info-block">
      <h3>Environmental impact</h3>
      <p>${escapeHTML(speciesImpact)}</p>
      <p>${escapeHTML(environmentalContext)}</p>
      <p>Climate-related stressors can amplify spread by extending growing seasons, increasing disturbance, and weakening native habitat resilience.</p>
    </div>
  `;
}

function renderTerritoryDetails(feature) {
  const props = feature.properties || {};
  const territoryName = props.display_name || props.name_en || props.name_indig || "Indigenous territory";

  const intersectingCount = layerState.filteredFeatures.filter((occurrence) => {
    try {
      return turf.booleanPointInPolygon(turf.point(occurrence.geometry.coordinates), feature);
    } catch {
      return false;
    }
  }).length;

  elements.detailsContent.innerHTML = `
    <div class="badge">Indigenous territory selected</div>
    <div class="info-block">
      <h3>${escapeHTML(territoryName)}</h3>
      <p><strong>Region:</strong> ${escapeHTML(props.region || "Southeastern region")}</p>
      <p>${escapeHTML(props.cultural_context || "Cultural context not available.")}</p>
    </div>
    <div class="info-block">
      <h3>Environmental context</h3>
      <p>${escapeHTML(props.environmental_context || "Environmental context not available.")}</p>
      <p><strong>Visible ${escapeHTML(layerState.currentSpecies)} occurrences inside this territory:</strong> ${intersectingCount.toLocaleString()}</p>
    </div>
  `;
}

function findRelevantTerritory(point) {
  for (const feature of layerState.territoriesData.features) {
    try {
      if (turf.booleanPointInPolygon(point, feature)) return feature;
    } catch {
      // ignore invalid geometry edge cases
    }
  }

  let nearest = null;
  let nearestDistance = Infinity;

  for (const feature of layerState.territoriesData.features) {
    const center = turf.centerOfMass(feature);
    const distance = turf.distance(point, center, { units: "miles" });
    if (distance < nearestDistance) {
      nearestDistance = distance;
      nearest = feature;
    }
  }

  return nearest;
}

function formatDate(eventDate, year, month, day) {
  if (eventDate) {
    const asDate = new Date(eventDate);
    if (!Number.isNaN(asDate.getTime())) {
      return asDate.toLocaleDateString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric"
      });
    }
    return String(eventDate);
  }

  const parts = [year, month, day].filter(Boolean);
  return parts.length ? parts.join("-") : "Not available";
}

function formatCoordinates(coords) {
  if (!Array.isArray(coords) || coords.length < 2) return "Not available";
  return `${Number(coords[1]).toFixed(4)}, ${Number(coords[0]).toFixed(4)}`;
}

function escapeHTML(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

loadData().catch((error) => {
  console.error(error);
  elements.detailsContent.innerHTML = `
    <div class="info-block">
      <h3>Could not load map data</h3>
      <p>Make sure you are running this project from a local server in VS Code, not opening <code>index.html</code> directly.</p>
      <p>Error: ${escapeHTML(error.message)}</p>
    </div>
  `;
});
