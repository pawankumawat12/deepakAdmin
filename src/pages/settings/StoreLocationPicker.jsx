import React, { useEffect, useRef, useState, useCallback } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { MapPin, Search, Loader2, Navigation, Layers, Compass, X } from "lucide-react";
import toast from "react-hot-toast";

// Crisp SVG Bakery Location Pin
const createBakeryPinIcon = () =>
  L.divIcon({
    className: "store-location-pin",
    html: `
      <div style="
        position: relative;
        width: 40px;
        height: 40px;
        display: flex;
        align-items: center;
        justify-content: center;
        background: #e11d48;
        color: white;
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        border: 3px solid #ffffff;
        box-shadow: 0 4px 14px rgba(225, 29, 72, 0.5), 0 2px 6px rgba(0,0,0,0.4);
        cursor: grab;
      ">
        <svg style="transform: rotate(45deg); width: 20px; height: 20px; fill: white;" viewBox="0 0 24 24">
          <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
        </svg>
      </div>
    `,
    iconSize: [40, 40],
    iconAnchor: [20, 40],
    popupAnchor: [0, -40],
  });

// Tile Layer URLs
const TILE_LAYERS = {
  satellite: {
    url: "https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}",
    options: {
      attribution: "&copy; Google Maps Hybrid",
      maxZoom: 20,
      subdomains: ["mt0", "mt1", "mt2", "mt3"],
    },
  },
  streets: {
    url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    options: {
      attribution: "&copy; OpenStreetMap contributors",
      maxZoom: 19,
    },
  },
};

export default function StoreLocationPicker({
  latitude,
  longitude,
  onLocationChange,
}) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerRef = useRef(null);
  const activeTileLayerRef = useRef(null);
  const searchWrapperRef = useRef(null);

  const initialLat = Number(latitude) || 26.9124; // Default Jaipur / Rajasthan
  const initialLng = Number(longitude) || 75.7873;

  const [currentLat, setCurrentLat] = useState(initialLat);
  const [currentLng, setCurrentLng] = useState(initialLng);
  const [mapType, setMapType] = useState("satellite"); // 'satellite' | 'streets'
  const [searchQuery, setSearchQuery] = useState("");
  const [searching, setSearching] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [showResultsDropdown, setShowResultsDropdown] = useState(false);
  const [resolvedAddress, setResolvedAddress] = useState("");
  const [geocoding, setGeocoding] = useState(false);

  // Sync internal state if external props change significantly
  useEffect(() => {
    const latNum = Number(latitude);
    const lngNum = Number(longitude);
    if (!isNaN(latNum) && !isNaN(lngNum) && latNum !== 0 && lngNum !== 0) {
      if (
        Math.abs(latNum - currentLat) > 0.00001 ||
        Math.abs(lngNum - currentLng) > 0.00001
      ) {
        setCurrentLat(latNum);
        setCurrentLng(lngNum);
        if (markerRef.current) {
          markerRef.current.setLatLng([latNum, lngNum]);
        }
        if (mapInstanceRef.current) {
          mapInstanceRef.current.panTo([latNum, lngNum]);
        }
      }
    }
  }, [latitude, longitude]);

  // Click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        searchWrapperRef.current &&
        !searchWrapperRef.current.contains(e.target)
      ) {
        setShowResultsDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Live debounced search suggestions as admin types
  useEffect(() => {
    const q = searchQuery.trim();
    if (!q || q.length < 2) {
      setSearchResults([]);
      setShowResultsDropdown(false);
      return;
    }

    const timer = setTimeout(() => {
      fetchLiveSuggestions(q);
    }, 350);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const fetchLiveSuggestions = async (queryText) => {
    setSearching(true);
    try {
      // 1. Try Photon (fast autocomplete)
      const photonRes = await fetch(
        `https://photon.komoot.io/api/?q=${encodeURIComponent(queryText)}&limit=6`
      );

      let items = [];
      if (photonRes.ok) {
        const photonData = await photonRes.json();
        if (photonData?.features && photonData.features.length > 0) {
          items = photonData.features.map((f) => {
            const props = f.properties || {};
            const title = props.name || props.street || queryText;
            const subtitleParts = [
              props.city || props.district || props.county,
              props.state,
              props.postcode,
            ].filter(Boolean);
            const subtitle = subtitleParts.join(", ") || props.country || "";
            return {
              lat: f.geometry.coordinates[1],
              lon: f.geometry.coordinates[0],
              title,
              subtitle,
              display_name: [title, subtitle].filter(Boolean).join(", "),
            };
          });
        }
      }

      // 2. Fallback to Nominatim
      if (items.length === 0) {
        const nomRes = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
            queryText
          )}&countrycodes=in&limit=6&addressdetails=1`,
          { headers: { Accept: "application/json" } }
        );
        if (nomRes.ok) {
          const nomData = await nomRes.json();
          if (nomData && nomData.length > 0) {
            items = nomData.map((item) => {
              const parts = (item.display_name || "").split(",");
              const title = parts[0]?.trim() || item.name;
              const subtitle = parts.slice(1, 4).join(", ").trim();
              return {
                lat: parseFloat(item.lat),
                lon: parseFloat(item.lon),
                title,
                subtitle,
                display_name: item.display_name,
              };
            });
          }
        }
      }

      setSearchResults(items);
      setShowResultsDropdown(items.length > 0);
    } catch {
      // ignore
    } finally {
      setSearching(false);
    }
  };

  // Reverse geocoding helper to give admin visual confirmation
  const fetchAddressName = useCallback(async (lat, lng) => {
    try {
      setGeocoding(true);
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`,
        { headers: { Accept: "application/json" } }
      );
      if (res.ok) {
        const data = await res.json();
        if (data?.display_name) {
          setResolvedAddress(data.display_name);
        }
      }
    } catch {
      // ignore network errors
    } finally {
      setGeocoding(false);
    }
  }, []);

  // Switch Tile Layer (Satellite vs Street)
  const setTileLayer = useCallback((type) => {
    if (!mapInstanceRef.current) return;
    if (activeTileLayerRef.current) {
      mapInstanceRef.current.removeLayer(activeTileLayerRef.current);
    }

    const config = TILE_LAYERS[type] || TILE_LAYERS.satellite;
    const newLayer = L.tileLayer(config.url, config.options);
    newLayer.addTo(mapInstanceRef.current);
    activeTileLayerRef.current = newLayer;
    setMapType(type);
  }, []);

  // Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapInstanceRef.current) return; // Already initialized

    const map = L.map(mapContainerRef.current, {
      center: [initialLat, initialLng],
      zoom: 16,
      zoomControl: true,
      scrollWheelZoom: true,
    });

    // Default to Satellite (Hybrid) view
    const initialConfig = TILE_LAYERS.satellite;
    const tileLayer = L.tileLayer(initialConfig.url, initialConfig.options).addTo(map);
    activeTileLayerRef.current = tileLayer;

    const marker = L.marker([initialLat, initialLng], {
      icon: createBakeryPinIcon(),
      draggable: true,
    }).addTo(map);

    marker.bindPopup("<b>Bakery Location</b><br/>Drag this pin to your exact shop rooftop/entrance").openPopup();

    // On Marker Drag End
    marker.on("dragend", () => {
      const position = marker.getLatLng();
      const newLat = Math.round(position.lat * 1000000) / 1000000;
      const newLng = Math.round(position.lng * 1000000) / 1000000;
      setCurrentLat(newLat);
      setCurrentLng(newLng);
      onLocationChange?.(newLat, newLng);
      fetchAddressName(newLat, newLng);
    });

    // On Map Click - move marker to click point
    map.on("click", (e) => {
      const { lat, lng } = e.latlng;
      const newLat = Math.round(lat * 1000000) / 1000000;
      const newLng = Math.round(lng * 1000000) / 1000000;
      marker.setLatLng([newLat, newLng]);
      setCurrentLat(newLat);
      setCurrentLng(newLng);
      onLocationChange?.(newLat, newLng);
      fetchAddressName(newLat, newLng);
    });

    mapInstanceRef.current = map;
    markerRef.current = marker;

    setTimeout(() => {
      map.invalidateSize();
    }, 200);

    fetchAddressName(initialLat, initialLng);

    return () => {
      map.remove();
      mapInstanceRef.current = null;
      markerRef.current = null;
      activeTileLayerRef.current = null;
    };
  }, []);

  // Move map & pin to a selected spot from suggestion click
  const selectLocationSpot = (lat, lng, displayName, title) => {
    const cleanLat = Math.round(lat * 1000000) / 1000000;
    const cleanLng = Math.round(lng * 1000000) / 1000000;

    setCurrentLat(cleanLat);
    setCurrentLng(cleanLng);
    setSearchQuery(title || displayName);
    setResolvedAddress(displayName);
    setShowResultsDropdown(false);

    if (markerRef.current) {
      markerRef.current.setLatLng([cleanLat, cleanLng]);
      markerRef.current
        .bindPopup(`<b>Bakery Location</b><br/>${title || displayName}`)
        .openPopup();
    }

    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([cleanLat, cleanLng], 17, {
        duration: 1.2,
      });
    }

    onLocationChange?.(cleanLat, cleanLng);
    toast.success("Location pinpointed on map!");
  };

  const handleManualSearch = (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (searchQuery.trim().length >= 2) {
      fetchLiveSuggestions(searchQuery.trim());
    } else {
      toast.error("Please type at least 2 characters to search");
    }
  };

  const handleRecenter = (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (mapInstanceRef.current && markerRef.current) {
      mapInstanceRef.current.flyTo([currentLat, currentLng], 17);
      markerRef.current.openPopup();
    }
  };

  return (
    <div className="store-location-picker mt-3 position-relative">
      {/* Search Bar & Controls */}
      <div className="d-flex align-items-center gap-2 mb-2.5 flex-wrap">
        <div ref={searchWrapperRef} className="position-relative flex-grow-1">
          <div className="input-group input-group-sm">
            <span className="input-group-text bg-white border-end-0 text-muted">
              <Search size={14} />
            </span>
            <input
              type="text"
              className="form-control border-start-0 ps-1"
              placeholder="Type area, colony or city (e.g. Bajor, Sikar, Jaipur)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => {
                if (searchResults.length > 0) setShowResultsDropdown(true);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  e.stopPropagation();
                  handleManualSearch(e);
                }
              }}
            />
            {searchQuery && (
              <button
                type="button"
                className="btn btn-outline-secondary border-start-0 border-end-0 bg-white text-muted"
                onClick={() => {
                  setSearchQuery("");
                  setSearchResults([]);
                  setShowResultsDropdown(false);
                }}
              >
                <X size={13} />
              </button>
            )}
            <button
              type="button"
              onClick={handleManualSearch}
              disabled={searching}
              className="btn btn-sm btn-primary fw-medium px-3"
            >
              {searching ? (
                <>
                  <Loader2 size={13} className="spinner-border spinner-border-sm me-1" />
                  Searching...
                </>
              ) : (
                "Search"
              )}
            </button>
          </div>

          {/* Live Search Suggestions Dropdown */}
          {showResultsDropdown && searchResults.length > 0 && (
            <div
              className="position-absolute w-100 bg-white rounded-3 shadow-lg border mt-1 p-1"
              style={{ zIndex: 1100, maxHeight: "220px", overflowY: "auto" }}
            >
              <div className="d-flex align-items-center justify-content-between px-2.5 py-1 border-bottom text-muted small">
                <span className="fw-semibold text-uppercase text-xs" style={{ fontSize: "10.5px" }}>
                  Select Matching Location
                </span>
                <button
                  type="button"
                  className="btn btn-link btn-sm text-muted p-0 text-decoration-none"
                  onClick={() => setShowResultsDropdown(false)}
                >
                  Close
                </button>
              </div>
              {searchResults.map((item, idx) => (
                <button
                  key={idx}
                  type="button"
                  className="dropdown-item text-start py-2 px-2.5 rounded-2 d-flex align-items-start gap-2 border-0 bg-transparent text-dark hover-bg-light"
                  style={{ cursor: "pointer" }}
                  onClick={() =>
                    selectLocationSpot(
                      parseFloat(item.lat),
                      parseFloat(item.lon),
                      item.display_name,
                      item.title
                    )
                  }
                >
                  <div
                    className="p-1 rounded bg-danger-subtle text-danger shrink-0 mt-0.5"
                    style={{ lineHeight: 1 }}
                  >
                    <MapPin size={13} />
                  </div>
                  <div className="min-w-0 flex-grow-1">
                    <div className="fw-bold small text-truncate text-dark">{item.title}</div>
                    <div className="text-muted text-truncate" style={{ fontSize: "11px" }}>
                      {item.subtitle}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* View Toggle: Satellite vs Standard Map */}
        <div className="btn-group btn-group-sm" role="group">
          <button
            type="button"
            className={`btn btn-sm d-inline-flex align-items-center gap-1 ${
              mapType === "satellite" ? "btn-dark fw-bold" : "btn-outline-secondary"
            }`}
            onClick={() => setTileLayer("satellite")}
            title="Satellite view with real aerial imagery"
          >
            <Compass size={13} />
            <span>Satellite</span>
          </button>
          <button
            type="button"
            className={`btn btn-sm d-inline-flex align-items-center gap-1 ${
              mapType === "streets" ? "btn-dark fw-bold" : "btn-outline-secondary"
            }`}
            onClick={() => setTileLayer("streets")}
            title="Standard street map"
          >
            <Layers size={13} />
            <span>Map</span>
          </button>
        </div>

        <button
          type="button"
          onClick={handleRecenter}
          className="btn btn-sm btn-outline-secondary d-inline-flex align-items-center gap-1.5"
          title="Center map on pin"
        >
          <Navigation size={13} />
          <span>Center Pin</span>
        </button>
      </div>

      {/* Map Container */}
      <div
        style={{
          height: "380px",
          width: "100%",
          borderRadius: "14px",
          overflow: "hidden",
          border: "2px solid #cbd5e1",
          boxShadow: "0 2px 8px rgba(0,0,0,0.12)",
          position: "relative",
          zIndex: 1,
        }}
      >
        <div ref={mapContainerRef} style={{ height: "100%", width: "100%" }} />

        {/* Active View Badge */}
        <div
          style={{
            position: "absolute",
            top: "10px",
            right: "10px",
            zIndex: 1000,
            background: "rgba(0, 0, 0, 0.65)",
            backdropFilter: "blur(4px)",
            color: "#ffffff",
            padding: "4px 10px",
            borderRadius: "20px",
            fontSize: "11px",
            fontWeight: "600",
            pointerEvents: "none",
            display: "flex",
            alignItems: "center",
            gap: "5px",
          }}
        >
          <span
            style={{
              width: "6px",
              height: "6px",
              borderRadius: "50%",
              background: mapType === "satellite" ? "#4ade80" : "#60a5fa",
            }}
          />
          {mapType === "satellite" ? "Satellite (Hybrid)" : "Street Map"}
        </div>
      </div>

      {/* Helper text & address summary */}
      <div className="mt-2.5 p-2.5 bg-light rounded-3 border d-flex flex-column gap-1.5 small">
        <div className="d-flex align-items-center justify-content-between flex-wrap gap-2">
          <span className="text-muted d-inline-flex align-items-center gap-1.5">
            <MapPin size={13} className="text-danger" />
            <strong className="text-dark">Current Coordinates:</strong>
            <span className="font-monospace text-primary fw-semibold">
              {currentLat.toFixed(6)}, {currentLng.toFixed(6)}
            </span>
          </span>
          <span className="badge bg-success-subtle text-success border border-success-subtle px-2 py-1">
            Drag the red pin directly onto your shop rooftop or entrance
          </span>
        </div>

        {resolvedAddress && (
          <div className="text-muted text-truncate" title={resolvedAddress}>
            <strong>Location Spot:</strong>{" "}
            {geocoding ? "Detecting address..." : resolvedAddress}
          </div>
        )}
      </div>
    </div>
  );
}
