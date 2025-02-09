import React, { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import "./test1.css";
import axios from "axios";

// Fix map rendering issue
function FixMapRendering() {
  const map = useMap();
  useEffect(() => {
    setTimeout(() => {
      map.invalidateSize();
    }, 500);
  }, [map]);
  return null;
}

// Add new component to handle map center updates
function SetViewOnClick({ coords }) {
  const map = useMap();
  
  useEffect(() => {
    if (coords) {
      map.setView(coords, map.getZoom());
    }
  }, [coords, map]);
  
  return null;
}

// Custom marker icon
const customIcon = new L.Icon({
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

// Function to calculate distance between two lat/lon points (Haversine Formula)
const getDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Radius of the Earth in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Distance in km
};

const App1 = () => {
  const [selectedLocation, setSelectedLocation] = useState([17.385, 78.4867]); // Default: Hyderabad
  const [hospitals, setHospitals] = useState([]); // Store nearby hospitals

  // Fetch user's current location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setSelectedLocation([position.coords.latitude, position.coords.longitude]);
        },
        (error) => {
          console.error("Geolocation error:", error);
        }
      );
    }
  }, []);

  // Fetch hospitals from OpenStreetMap Overpass API
  const fetchHospitals = async () => {
    try {
      const overpassQuery = `[out:json];node(around:6000,${selectedLocation[0]},${selectedLocation[1]})["amenity"="hospital"];out;`;
      const response = await axios.get(`https://overpass-api.de/api/interpreter?data=${overpassQuery}`);

      if (response.data.elements.length > 0) {
        const hospitalData = response.data.elements
          .map((place) => ({
            id: place.id,
            lat: place.lat,
            lon: place.lon,
            name: place.tags.name || "Unnamed Hospital",
            distance: getDistance(selectedLocation[0], selectedLocation[1], place.lat, place.lon), // Calculate distance
            address: place.tags.addr || "Address not available",
            phone: place.tags.phone || "",
          }))
          .filter((hospital) => hospital.distance <= 6); // Ensure hospitals are within 6km

        setHospitals(hospitalData);
      } else {
        alert("No hospitals found within 6km.");
      }
    } catch (error) {
      console.error("Error fetching hospitals:", error);
    }
  };

  const openDirections = (hospital) => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${hospital.lat},${hospital.lon}`;
    window.open(url, '_blank');
  };

  const goToCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const newLocation = [position.coords.latitude, position.coords.longitude];
          setSelectedLocation(newLocation); // Update the location
        },
        (error) => {
          console.error("Geolocation error:", error);
        }
      );
    }
  };

  return (
    <div className="container">
      <h1>Find Nearby Hospitals</h1>
      <button className="search-btn" onClick={fetchHospitals}>
        Search Nearby Hospitals
      </button>

      

      <div className="map-container">
        <MapContainer center={selectedLocation} zoom={13} className="leaflet-map">
          <FixMapRendering />
          <SetViewOnClick coords={selectedLocation} />
          <TileLayer 
            attribution="© OpenStreetMap contributors" 
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" 
          />
          
          {/* User Location Marker */}
          <Marker position={selectedLocation} icon={customIcon}>
            <Popup>Your Location</Popup>
          </Marker>

          {/* Display Hospitals as Markers */}
          {hospitals.map((hospital) => (
            <Marker key={hospital.id} position={[hospital.lat, hospital.lon]} icon={customIcon}>
              <Popup>
                <div className="popup-content">
                  <h3 className="font-bold">{hospital.name}</h3>
                  {hospital.address && (
                    <p className="text-sm text-gray-600 mt-1">{hospital.address}</p>
                  )}
                  <p className="text-sm text-gray-600">
                    Distance: {hospital.distance.toFixed(1)} km
                  </p>
                  {hospital.phone && (
                    <p className="text-sm mt-1">
                      <a
                        href={`tel:${hospital.phone}`}
                        className="text-blue-500 hover:text-blue-700 flex items-center gap-1"
                      >
                        <i className="w-4 h-4">📞</i>
                        {hospital.phone}
                      </a>
                    </p>
                  )}
                  <button
                    onClick={() => openDirections(hospital)}
                    className="mt-2 text-sm bg-blue-500 text-white px-2 py-1 rounded flex items-center gap-1 hover:bg-blue-600 transition-colors"
                  >
                    <i className="w-4 h-4">🚗</i> Get Directions
                  </button>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>

      {/* List of hospitals */}
      {hospitals.length > 0 && (
        <div className="hospital-list">
          <h2>Nearby Hospitals</h2>
          <div className="hospitals-container">
            {hospitals.map((hospital) => (
              <div key={hospital.id} className="hospital-item">
                <div className="hospital-info">
                  <h3 className="hospital-name">{hospital.name}</h3>
                  <p className="hospital-distance">
                    Distance: {hospital.distance.toFixed(1)} km
                  </p>
                </div>
                <button className="directions-btn" onClick={() => openDirections(hospital)}>
                  Get Directions
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default App1;