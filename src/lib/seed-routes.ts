import type { RouteWaypoint } from "@/db/schema";

export type AirlineSeed = {
  name: string;
  code: string;
  callsign: string;
  country: string;
  hub: string;
  hubCode: string;
  color: string;
};

export const AIRLINES: AirlineSeed[] = [
  { name: "AeroLink", code: "AL", callsign: "AEROLINK", country: "United Kingdom", hub: "London", hubCode: "LHR", color: "#1565C0" },
  { name: "SkyBridge", code: "SB", callsign: "SKYBRIDGE", country: "United States", hub: "New York", hubCode: "JFK", color: "#0288D1" },
  { name: "Atlantic Wings", code: "AW", callsign: "ATLANTIC", country: "Ireland", hub: "Dublin", hubCode: "DUB", color: "#00897B" },
  { name: "Pacific Jet", code: "PJ", callsign: "PACJET", country: "Japan", hub: "Tokyo", hubCode: "HND", color: "#5E35B1" },
  { name: "Meridian", code: "ME", callsign: "MERIDIAN", country: "United Arab Emirates", hub: "Dubai", hubCode: "DXB", color: "#3949AB" },
  { name: "Nova Air", code: "NV", callsign: "NOVA", country: "Singapore", hub: "Singapore", hubCode: "SIN", color: "#00838F" },
  { name: "Blue Horizon", code: "BH", callsign: "HORIZON", country: "Australia", hub: "Sydney", hubCode: "SYD", color: "#1976D2" },
  { name: "Northstar", code: "NS", callsign: "NORTHSTAR", country: "Canada", hub: "Toronto", hubCode: "YYZ", color: "#C62828" },
  { name: "Iberia Line", code: "IL", callsign: "IBERIA", country: "Spain", hub: "Madrid", hubCode: "MAD", color: "#D84315" },
  { name: "Hanseatic", code: "HA", callsign: "HANSEATIC", country: "Germany", hub: "Frankfurt", hubCode: "FRA", color: "#455A64" },
];

export type RouteSeed = {
  flightNumber: string;
  airlineCode: string;
  aircraft: string;
  origin: string;
  destination: string;
  originCode: string;
  destinationCode: string;
  midLabel: string;
  midLat: number;
  midLng: number;
  durationMinutes: number;
  basePriceCents: number;
  status: "En Route" | "Boarding" | "Scheduled" | "Arrived";
};

const CITIES: Record<string, { lat: number; lng: number }> = {
  "New York": { lat: 40.6413, lng: -73.7781 },
  London: { lat: 51.47, lng: -0.4543 },
  "Los Angeles": { lat: 33.9416, lng: -118.4085 },
  Tokyo: { lat: 35.5494, lng: 139.7798 },
  Chicago: { lat: 41.9742, lng: -87.9073 },
  Paris: { lat: 49.0097, lng: 2.5479 },
  Miami: { lat: 25.7959, lng: -80.287 },
  "São Paulo": { lat: -23.4356, lng: -46.4731 },
  Boston: { lat: 42.3656, lng: -71.0096 },
  Dublin: { lat: 53.4264, lng: -6.2499 },
  "San Francisco": { lat: 37.6213, lng: -122.379 },
  Sydney: { lat: -33.9399, lng: 151.1753 },
  Seoul: { lat: 37.4602, lng: 126.4407 },
  Frankfurt: { lat: 50.0379, lng: 8.5622 },
  Toronto: { lat: 43.6777, lng: -79.6248 },
  Vancouver: { lat: 49.1947, lng: -123.179 },
  "Hong Kong": { lat: 22.308, lng: 113.9185 },
  Singapore: { lat: 1.3644, lng: 103.9915 },
  Bangkok: { lat: 13.69, lng: 100.7501 },
  Delhi: { lat: 28.5562, lng: 77.1 },
  Dubai: { lat: 25.2532, lng: 55.3657 },
  Doha: { lat: 25.2736, lng: 51.608 },
  "Abu Dhabi": { lat: 24.433, lng: 54.6511 },
  Melbourne: { lat: -37.669, lng: 144.841 },
  Auckland: { lat: -37.0082, lng: 174.785 },
  Dallas: { lat: 32.8998, lng: -97.0403 },
  Madrid: { lat: 40.4983, lng: -3.5676 },
  "Mexico City": { lat: 19.4363, lng: -99.0721 },
  Lisbon: { lat: 38.7742, lng: -9.1342 },
  "Rio de Janeiro": { lat: -22.8099, lng: -43.2505 },
  "Buenos Aires": { lat: -34.8222, lng: -58.5358 },
  Amsterdam: { lat: 52.3105, lng: 4.7683 },
  Rome: { lat: 41.8003, lng: 12.2389 },
  Zurich: { lat: 47.4582, lng: 8.5555 },
  Munich: { lat: 48.3538, lng: 11.7861 },
  Barcelona: { lat: 41.2974, lng: 2.0833 },
  Seattle: { lat: 47.4502, lng: -122.3088 },
  Atlanta: { lat: 33.6407, lng: -84.4277 },
  Denver: { lat: 39.8561, lng: -104.6737 },
  Houston: { lat: 29.9902, lng: -95.3368 },
  Shanghai: { lat: 31.1443, lng: 121.8083 },
  Beijing: { lat: 40.0799, lng: 116.6031 },
  Osaka: { lat: 34.4347, lng: 135.244 },
  "Kuala Lumpur": { lat: 2.7456, lng: 101.7072 },
  Manila: { lat: 14.5086, lng: 121.0198 },
  Taipei: { lat: 25.0797, lng: 121.2342 },
  Santiago: { lat: -33.393, lng: -70.7858 },
  Lima: { lat: -12.0219, lng: -77.1143 },
  Bogota: { lat: 4.7016, lng: -74.1469 },
  Copenhagen: { lat: 55.618, lng: 12.6508 },
  Stockholm: { lat: 59.6519, lng: 17.9186 },
  Warsaw: { lat: 52.1657, lng: 20.9671 },
  Istanbul: { lat: 41.2753, lng: 28.7519 },
  "Las Vegas": { lat: 36.084, lng: -115.1537 },
  Honolulu: { lat: 21.3187, lng: -157.9225 },
  Montreal: { lat: 45.4706, lng: -73.7408 },
  Calgary: { lat: 51.1215, lng: -114.0076 },
};

export function buildRoute(seed: RouteSeed): RouteWaypoint[] {
  const origin = CITIES[seed.origin];
  const destination = CITIES[seed.destination];

  return [
    { label: seed.origin, lat: origin.lat, lng: origin.lng },
    { label: seed.midLabel, lat: seed.midLat, lng: seed.midLng },
    { label: seed.destination, lat: destination.lat, lng: destination.lng },
  ];
}

export const ROUTE_DEFS: RouteSeed[] = [
  { flightNumber: "AL204", airlineCode: "AL", aircraft: "Airbus A350-900", origin: "Dallas", destination: "London", originCode: "DFW", destinationCode: "LHR", midLabel: "North Atlantic", midLat: 46.3, midLng: -38.5, durationMinutes: 540, basePriceCents: 64500, status: "En Route" },
  { flightNumber: "AL318", airlineCode: "AL", aircraft: "Airbus A321neo", origin: "Paris", destination: "Dubai", originCode: "CDG", destinationCode: "DXB", midLabel: "Eastern Mediterranean", midLat: 35.1, midLng: 27.2, durationMinutes: 390, basePriceCents: 52900, status: "En Route" },
  { flightNumber: "AL912", airlineCode: "AL", aircraft: "Boeing 787-9", origin: "Tokyo", destination: "Sydney", originCode: "HND", destinationCode: "SYD", midLabel: "Philippine Sea", midLat: 13.4, midLng: 144.8, durationMinutes: 570, basePriceCents: 71900, status: "En Route" },
  { flightNumber: "AL108", airlineCode: "AL", aircraft: "Boeing 777-300ER", origin: "London", destination: "New York", originCode: "LHR", destinationCode: "JFK", midLabel: "North Atlantic", midLat: 48, midLng: -32, durationMinutes: 420, basePriceCents: 58900, status: "En Route" },
  { flightNumber: "AL441", airlineCode: "AL", aircraft: "Airbus A350-900", origin: "London", destination: "Singapore", originCode: "LHR", destinationCode: "SIN", midLabel: "Central Asia", midLat: 32, midLng: 65, durationMinutes: 780, basePriceCents: 89000, status: "En Route" },
  { flightNumber: "AL772", airlineCode: "AL", aircraft: "Boeing 787-9", origin: "London", destination: "Los Angeles", originCode: "LHR", destinationCode: "LAX", midLabel: "North Atlantic", midLat: 52, midLng: -55, durationMinutes: 660, basePriceCents: 76000, status: "Scheduled" },
  { flightNumber: "SB118", airlineCode: "SB", aircraft: "Airbus A380-800", origin: "New York", destination: "London", originCode: "JFK", destinationCode: "LHR", midLabel: "North Atlantic", midLat: 46, midLng: -38, durationMinutes: 420, basePriceCents: 62000, status: "En Route" },
  { flightNumber: "SB230", airlineCode: "SB", aircraft: "Boeing 787-9", origin: "Los Angeles", destination: "Tokyo", originCode: "LAX", destinationCode: "HND", midLabel: "North Pacific", midLat: 38, midLng: -168, durationMinutes: 660, basePriceCents: 84000, status: "En Route" },
  { flightNumber: "SB445", airlineCode: "SB", aircraft: "Boeing 737 MAX 9", origin: "Chicago", destination: "Paris", originCode: "ORD", destinationCode: "CDG", midLabel: "North Atlantic", midLat: 50, midLng: -30, durationMinutes: 480, basePriceCents: 66000, status: "En Route" },
  { flightNumber: "SB334", airlineCode: "SB", aircraft: "Boeing 737 MAX 9", origin: "Miami", destination: "São Paulo", originCode: "MIA", destinationCode: "GRU", midLabel: "Caribbean", midLat: 8, midLng: -55, durationMinutes: 480, basePriceCents: 58000, status: "En Route" },
  { flightNumber: "SB901", airlineCode: "SB", aircraft: "Airbus A321neo", origin: "Seattle", destination: "New York", originCode: "SEA", destinationCode: "JFK", midLabel: "Midwest", midLat: 42, midLng: -95, durationMinutes: 310, basePriceCents: 34000, status: "En Route" },
  { flightNumber: "SB612", airlineCode: "SB", aircraft: "Boeing 777-300ER", origin: "Atlanta", destination: "Amsterdam", originCode: "ATL", destinationCode: "AMS", midLabel: "North Atlantic", midLat: 48, midLng: -40, durationMinutes: 500, basePriceCents: 71000, status: "Boarding" },
  { flightNumber: "SB288", airlineCode: "SB", aircraft: "Boeing 737 MAX 9", origin: "Denver", destination: "Los Angeles", originCode: "DEN", destinationCode: "LAX", midLabel: "Southwest", midLat: 36.5, midLng: -111, durationMinutes: 150, basePriceCents: 21000, status: "En Route" },
  { flightNumber: "SB750", airlineCode: "SB", aircraft: "Airbus A321neo", origin: "Houston", destination: "Mexico City", originCode: "IAH", destinationCode: "MEX", midLabel: "Gulf of Mexico", midLat: 25, midLng: -96, durationMinutes: 150, basePriceCents: 24000, status: "Scheduled" },
  { flightNumber: "AW412", airlineCode: "AW", aircraft: "Airbus A321neo", origin: "Boston", destination: "Dublin", originCode: "BOS", destinationCode: "DUB", midLabel: "North Atlantic", midLat: 52, midLng: -30, durationMinutes: 360, basePriceCents: 51000, status: "En Route" },
  { flightNumber: "AW507", airlineCode: "AW", aircraft: "Embraer E195-E2", origin: "Dublin", destination: "New York", originCode: "DUB", destinationCode: "JFK", midLabel: "North Atlantic", midLat: 50, midLng: -36, durationMinutes: 420, basePriceCents: 54500, status: "Boarding" },
  { flightNumber: "AW618", airlineCode: "AW", aircraft: "Airbus A321neo", origin: "Dublin", destination: "Toronto", originCode: "DUB", destinationCode: "YYZ", midLabel: "North Atlantic", midLat: 52, midLng: -55, durationMinutes: 420, basePriceCents: 54000, status: "En Route" },
  { flightNumber: "AW229", airlineCode: "AW", aircraft: "Airbus A330-300", origin: "Lisbon", destination: "Rio de Janeiro", originCode: "LIS", destinationCode: "GIG", midLabel: "South Atlantic", midLat: -12, midLng: -30, durationMinutes: 540, basePriceCents: 57000, status: "Scheduled" },
  { flightNumber: "AW880", airlineCode: "AW", aircraft: "Airbus A321neo", origin: "Dublin", destination: "Barcelona", originCode: "DUB", destinationCode: "BCN", midLabel: "Bay of Biscay", midLat: 45, midLng: -5, durationMinutes: 150, basePriceCents: 19000, status: "En Route" },
  { flightNumber: "PJ901", airlineCode: "PJ", aircraft: "Boeing 777-300ER", origin: "Tokyo", destination: "San Francisco", originCode: "HND", destinationCode: "SFO", midLabel: "North Pacific", midLat: 42, midLng: -152, durationMinutes: 540, basePriceCents: 79000, status: "En Route" },
  { flightNumber: "PJ324", airlineCode: "PJ", aircraft: "Airbus A350-900", origin: "Seoul", destination: "Vancouver", originCode: "ICN", destinationCode: "YVR", midLabel: "North Pacific", midLat: 50, midLng: -145, durationMinutes: 600, basePriceCents: 78000, status: "En Route" },
  { flightNumber: "PJ509", airlineCode: "PJ", aircraft: "Embraer E195-E2", origin: "Hong Kong", destination: "Tokyo", originCode: "HKG", destinationCode: "HND", midLabel: "East China Sea", midLat: 29, midLng: 130, durationMinutes: 240, basePriceCents: 47000, status: "Boarding" },
  { flightNumber: "PJ880", airlineCode: "PJ", aircraft: "Boeing 787-9", origin: "Tokyo", destination: "Bangkok", originCode: "HND", destinationCode: "BKK", midLabel: "South China Sea", midLat: 15, midLng: 115, durationMinutes: 360, basePriceCents: 52000, status: "En Route" },
  { flightNumber: "PJ140", airlineCode: "PJ", aircraft: "Boeing 787-9", origin: "Osaka", destination: "Honolulu", originCode: "KIX", destinationCode: "HNL", midLabel: "Central Pacific", midLat: 28, midLng: 175, durationMinutes: 450, basePriceCents: 68000, status: "En Route" },
  { flightNumber: "PJ655", airlineCode: "PJ", aircraft: "Airbus A350-900", origin: "Tokyo", destination: "Shanghai", originCode: "HND", destinationCode: "PVG", midLabel: "East China Sea", midLat: 32, midLng: 128, durationMinutes: 180, basePriceCents: 32000, status: "En Route" },
  { flightNumber: "ME721", airlineCode: "ME", aircraft: "Boeing 787-9", origin: "Dubai", destination: "London", originCode: "DXB", destinationCode: "LHR", midLabel: "Eastern Mediterranean", midLat: 42, midLng: 20, durationMinutes: 420, basePriceCents: 69000, status: "En Route" },
  { flightNumber: "ME880", airlineCode: "ME", aircraft: "Airbus A380-800", origin: "Dubai", destination: "Sydney", originCode: "DXB", destinationCode: "SYD", midLabel: "Indian Ocean", midLat: -10, midLng: 80, durationMinutes: 780, basePriceCents: 95000, status: "Scheduled" },
  { flightNumber: "ME610", airlineCode: "ME", aircraft: "Boeing 787-9", origin: "Doha", destination: "Los Angeles", originCode: "DOH", destinationCode: "LAX", midLabel: "North Atlantic", midLat: 48, midLng: -40, durationMinutes: 960, basePriceCents: 110000, status: "En Route" },
  { flightNumber: "ME449", airlineCode: "ME", aircraft: "Airbus A380-800", origin: "Abu Dhabi", destination: "Melbourne", originCode: "AUH", destinationCode: "MEL", midLabel: "Indian Ocean", midLat: -15, midLng: 90, durationMinutes: 780, basePriceCents: 98000, status: "Scheduled" },
  { flightNumber: "ME302", airlineCode: "ME", aircraft: "Boeing 777-300ER", origin: "Dubai", destination: "Istanbul", originCode: "DXB", destinationCode: "IST", midLabel: "Levant", midLat: 33, midLng: 38, durationMinutes: 240, basePriceCents: 41000, status: "En Route" },
  { flightNumber: "NV603", airlineCode: "NV", aircraft: "Airbus A321neo", origin: "Singapore", destination: "Bangkok", originCode: "SIN", destinationCode: "BKK", midLabel: "Gulf of Thailand", midLat: 8, midLng: 102, durationMinutes: 130, basePriceCents: 26000, status: "En Route" },
  { flightNumber: "NV115", airlineCode: "NV", aircraft: "Airbus A350-900", origin: "Singapore", destination: "Tokyo", originCode: "SIN", destinationCode: "HND", midLabel: "South China Sea", midLat: 20, midLng: 130, durationMinutes: 420, basePriceCents: 58000, status: "En Route" },
  { flightNumber: "NV221", airlineCode: "NV", aircraft: "Airbus A321neo", origin: "Delhi", destination: "Singapore", originCode: "DEL", destinationCode: "SIN", midLabel: "Bay of Bengal", midLat: 12, midLng: 88, durationMinutes: 300, basePriceCents: 43000, status: "En Route" },
  { flightNumber: "NV812", airlineCode: "NV", aircraft: "Boeing 787-9", origin: "Singapore", destination: "Sydney", originCode: "SIN", destinationCode: "SYD", midLabel: "Coral Sea", midLat: -20, midLng: 140, durationMinutes: 450, basePriceCents: 63000, status: "En Route" },
  { flightNumber: "NV404", airlineCode: "NV", aircraft: "Airbus A350-900", origin: "Singapore", destination: "Hong Kong", originCode: "SIN", destinationCode: "HKG", midLabel: "South China Sea", midLat: 12, midLng: 110, durationMinutes: 220, basePriceCents: 36000, status: "En Route" },
  { flightNumber: "NV933", airlineCode: "NV", aircraft: "Boeing 787-9", origin: "Kuala Lumpur", destination: "Melbourne", originCode: "KUL", destinationCode: "MEL", midLabel: "Indian Ocean", midLat: -15, midLng: 115, durationMinutes: 450, basePriceCents: 59000, status: "Boarding" },
  { flightNumber: "BH409", airlineCode: "BH", aircraft: "Boeing 737 MAX 9", origin: "Sydney", destination: "Auckland", originCode: "SYD", destinationCode: "AKL", midLabel: "Tasman Sea", midLat: -35, midLng: 163, durationMinutes: 180, basePriceCents: 31000, status: "Arrived" },
  { flightNumber: "BH777", airlineCode: "BH", aircraft: "Boeing 787-9", origin: "Melbourne", destination: "Singapore", originCode: "MEL", destinationCode: "SIN", midLabel: "Indian Ocean", midLat: -10, midLng: 105, durationMinutes: 450, basePriceCents: 61000, status: "En Route" },
  { flightNumber: "BH303", airlineCode: "BH", aircraft: "Boeing 777-300ER", origin: "Sydney", destination: "Los Angeles", originCode: "SYD", destinationCode: "LAX", midLabel: "South Pacific", midLat: -20, midLng: -140, durationMinutes: 780, basePriceCents: 92000, status: "En Route" },
  { flightNumber: "BH218", airlineCode: "BH", aircraft: "Airbus A321neo", origin: "Sydney", destination: "Honolulu", originCode: "SYD", destinationCode: "HNL", midLabel: "South Pacific", midLat: -10, midLng: -165, durationMinutes: 570, basePriceCents: 74000, status: "En Route" },
  { flightNumber: "NS101", airlineCode: "NS", aircraft: "Boeing 787-9", origin: "Toronto", destination: "London", originCode: "YYZ", destinationCode: "LHR", midLabel: "North Atlantic", midLat: 52, midLng: -40, durationMinutes: 420, basePriceCents: 64000, status: "En Route" },
  { flightNumber: "NS240", airlineCode: "NS", aircraft: "Airbus A321neo", origin: "Vancouver", destination: "Tokyo", originCode: "YVR", destinationCode: "HND", midLabel: "North Pacific", midLat: 48, midLng: -160, durationMinutes: 540, basePriceCents: 77000, status: "En Route" },
  { flightNumber: "NS355", airlineCode: "NS", aircraft: "Boeing 737 MAX 9", origin: "Montreal", destination: "Paris", originCode: "YUL", destinationCode: "CDG", midLabel: "North Atlantic", midLat: 50, midLng: -35, durationMinutes: 420, basePriceCents: 59000, status: "En Route" },
  { flightNumber: "NS488", airlineCode: "NS", aircraft: "Airbus A321neo", origin: "Calgary", destination: "Chicago", originCode: "YYC", destinationCode: "ORD", midLabel: "Great Plains", midLat: 46, midLng: -100, durationMinutes: 210, basePriceCents: 28000, status: "Scheduled" },
  { flightNumber: "IL550", airlineCode: "IL", aircraft: "Airbus A350-900", origin: "Madrid", destination: "Mexico City", originCode: "MAD", destinationCode: "MEX", midLabel: "North Atlantic", midLat: 32, midLng: -50, durationMinutes: 660, basePriceCents: 69000, status: "En Route" },
  { flightNumber: "IL702", airlineCode: "IL", aircraft: "Airbus A330-300", origin: "Madrid", destination: "Buenos Aires", originCode: "MAD", destinationCode: "EZE", midLabel: "South Atlantic", midLat: -10, midLng: -30, durationMinutes: 720, basePriceCents: 81000, status: "En Route" },
  { flightNumber: "IL316", airlineCode: "IL", aircraft: "Airbus A321neo", origin: "Barcelona", destination: "Rome", originCode: "BCN", destinationCode: "FCO", midLabel: "Western Mediterranean", midLat: 41.4, midLng: 7, durationMinutes: 110, basePriceCents: 16000, status: "En Route" },
  { flightNumber: "IL890", airlineCode: "IL", aircraft: "Boeing 787-9", origin: "Madrid", destination: "Bogota", originCode: "MAD", destinationCode: "BOG", midLabel: "Caribbean", midLat: 20, midLng: -50, durationMinutes: 600, basePriceCents: 72000, status: "Boarding" },
  { flightNumber: "HA550", airlineCode: "HA", aircraft: "Airbus A330-300", origin: "Frankfurt", destination: "New York", originCode: "FRA", destinationCode: "JFK", midLabel: "North Atlantic", midLat: 47, midLng: -35, durationMinutes: 480, basePriceCents: 64000, status: "En Route" },
  { flightNumber: "HA331", airlineCode: "HA", aircraft: "Boeing 777-300ER", origin: "Frankfurt", destination: "Tokyo", originCode: "FRA", destinationCode: "HND", midLabel: "Siberian Corridor", midLat: 55, midLng: 95, durationMinutes: 660, basePriceCents: 83000, status: "Scheduled" },
  { flightNumber: "HA702", airlineCode: "HA", aircraft: "Airbus A350-900", origin: "Frankfurt", destination: "Buenos Aires", originCode: "FRA", destinationCode: "EZE", midLabel: "South Atlantic", midLat: -8, midLng: -28, durationMinutes: 780, basePriceCents: 87000, status: "En Route" },
  { flightNumber: "HA905", airlineCode: "HA", aircraft: "Airbus A350-900", origin: "Munich", destination: "Beijing", originCode: "MUC", destinationCode: "PEK", midLabel: "Central Asia", midLat: 48, midLng: 70, durationMinutes: 570, basePriceCents: 78000, status: "En Route" },
  { flightNumber: "HA214", airlineCode: "HA", aircraft: "Airbus A321neo", origin: "Frankfurt", destination: "Zurich", originCode: "FRA", destinationCode: "ZRH", midLabel: "Alps", midLat: 48.7, midLng: 8.8, durationMinutes: 55, basePriceCents: 14000, status: "Arrived" },
  { flightNumber: "HA640", airlineCode: "HA", aircraft: "Boeing 787-9", origin: "Amsterdam", destination: "Shanghai", originCode: "AMS", destinationCode: "PVG", midLabel: "Central Asia", midLat: 50, midLng: 80, durationMinutes: 660, basePriceCents: 82000, status: "En Route" },
  { flightNumber: "NS720", airlineCode: "NS", aircraft: "Boeing 787-9", origin: "Toronto", destination: "Hong Kong", originCode: "YYZ", destinationCode: "HKG", midLabel: "Arctic Corridor", midLat: 65, midLng: -120, durationMinutes: 900, basePriceCents: 98000, status: "En Route" },
  { flightNumber: "PJ772", airlineCode: "PJ", aircraft: "Airbus A350-900", origin: "Taipei", destination: "Los Angeles", originCode: "TPE", destinationCode: "LAX", midLabel: "North Pacific", midLat: 35, midLng: -160, durationMinutes: 720, basePriceCents: 81000, status: "En Route" },
  { flightNumber: "NV560", airlineCode: "NV", aircraft: "Airbus A321neo", origin: "Manila", destination: "Singapore", originCode: "MNL", destinationCode: "SIN", midLabel: "South China Sea", midLat: 8, midLng: 110, durationMinutes: 210, basePriceCents: 29000, status: "En Route" },
  { flightNumber: "IL440", airlineCode: "IL", aircraft: "Airbus A330-300", origin: "Madrid", destination: "Lima", originCode: "MAD", destinationCode: "LIM", midLabel: "Caribbean", midLat: 15, midLng: -50, durationMinutes: 660, basePriceCents: 76000, status: "Scheduled" },
  { flightNumber: "SB419", airlineCode: "SB", aircraft: "Boeing 737 MAX 9", origin: "Las Vegas", destination: "Chicago", originCode: "LAS", destinationCode: "ORD", midLabel: "Great Plains", midLat: 39, midLng: -100, durationMinutes: 210, basePriceCents: 23000, status: "En Route" },
  { flightNumber: "AL560", airlineCode: "AL", aircraft: "Airbus A321neo", origin: "London", destination: "Rome", originCode: "LHR", destinationCode: "FCO", midLabel: "Western Europe", midLat: 47, midLng: 5, durationMinutes: 150, basePriceCents: 22000, status: "En Route" },
  { flightNumber: "HA118", airlineCode: "HA", aircraft: "Airbus A321neo", origin: "Copenhagen", destination: "Frankfurt", originCode: "CPH", destinationCode: "FRA", midLabel: "North Sea", midLat: 53.5, midLng: 10, durationMinutes: 85, basePriceCents: 17000, status: "En Route" },
  { flightNumber: "HA190", airlineCode: "HA", aircraft: "Embraer E195-E2", origin: "Stockholm", destination: "Warsaw", originCode: "ARN", destinationCode: "WAW", midLabel: "Baltic", midLat: 56, midLng: 18, durationMinutes: 90, basePriceCents: 15000, status: "Boarding" },
];
