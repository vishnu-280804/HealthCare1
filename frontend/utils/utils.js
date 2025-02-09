export function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Earth's radius in kilometers
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }
  
  function toRad(degrees) {
    return degrees * (Math.PI / 180);
  }
  
  export async function fetchNearbyHospitals(lat, lon, radius = 6) {
    // Convert radius to meters for Overpass API
    const radiusMeters = radius * 1000;
  
    const query = `
      [out:json][timeout:25];
      (
        node["amenity"="hospital"](around:${radiusMeters},${lat},${lon});
        node["healthcare"="hospital"](around:${radiusMeters},${lat},${lon});
        way["amenity"="hospital"](around:${radiusMeters},${lat},${lon});
        way["healthcare"="hospital"](around:${radiusMeters},${lat},${lon});
      );
      out body;
      >;
      out skel qt;
    `;
  
    const response = await fetch('https://overpass-api.de/api/interpreter', {
      method: 'POST',
      body: query
    });
  
    if (!response.ok) {
      throw new Error('Failed to fetch hospitals');
    }
  
    const data = await response.json();
  
    return data.elements
      .filter(element => element.lat && element.lon) // Only include elements with coordinates
      .map(element => {
        const distance = calculateDistance(lat, lon, element.lat, element.lon);
  
        // Only include hospitals within the specified radius
        if (distance > radius) {
          return null;
        }
  
        const address = [
          element.tags?.['addr:housenumber'],
          element.tags?.['addr:street'],
          element.tags?.['addr:city'],
          element.tags?.['addr:postcode']
        ].filter(Boolean).join(', ');
  
        return {
          id: element.id.toString(),
          name: element.tags?.name || 'Unnamed Hospital',
          distance,
          position: [element.lat, element.lon],
          address: address || undefined,
          amenity: element.tags?.amenity,
          healthcare: element.tags?.healthcare,
          phone: element.tags?.phone
        };
      })
      .filter(hospital => hospital !== null)
      .sort((a, b) => a.distance - b.distance);
  }