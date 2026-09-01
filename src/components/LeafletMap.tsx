"use client";

import { useEffect, useMemo } from "react";
import L, { type LatLngExpression, type LatLngTuple } from "leaflet";
import { MapContainer, Marker, Polyline, Popup, TileLayer, useMap } from "react-leaflet";
import type { RouteWaypoint } from "@/db/schema";

type LeafletMapProps = {
  route: RouteWaypoint[];
  position: {
    lat: number;
    lng: number;
  };
  heading: number;
  label?: string;
  className?: string;
};

function Recenter({ position }: { position: LatLngExpression }) {
  const map = useMap();

  useEffect(() => {
    map.panTo(position, { animate: true, duration: 0.8 });
  }, [map, position]);

  return null;
}

export default function LeafletMap({ route, position, heading, label, className }: LeafletMapProps) {
  const routePositions = route.map((point) => [point.lat, point.lng] as LatLngTuple);
  const currentPosition = [position.lat, position.lng] as LatLngTuple;
  const center = routePositions[0] ?? currentPosition;
  const markerIcon = useMemo(
    () =>
      L.divIcon({
        className: "plane-marker-icon",
        html: `<div class="plane-marker" style="transform: rotate(${heading}deg)">✈</div>`,
        iconSize: [48, 48],
        iconAnchor: [24, 24],
      }),
    [heading],
  );

  return (
    <div className={className ?? "h-[420px] overflow-hidden rounded-3xl border border-white/10 shadow-2xl"}>
      <MapContainer center={center} zoom={4} scrollWheelZoom className="h-full min-h-[360px] w-full">
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
        />
        {routePositions.length > 1 ? (
          <Polyline positions={routePositions} pathOptions={{ color: "#42a5f5", weight: 3, opacity: 0.85 }} />
        ) : null}
        <Marker position={currentPosition} icon={markerIcon}>
          <Popup>
            <strong>{label ?? "Aircraft position"}</strong>
            <br />
            Lat {position.lat.toFixed(4)}, Lng {position.lng.toFixed(4)}
          </Popup>
        </Marker>
        {route.map((point) => (
          <Marker
            key={`${point.label}-${point.lat}-${point.lng}`}
            position={[point.lat, point.lng]}
            icon={L.divIcon({
              className: "waypoint-marker-icon",
              html: `<span title="${point.label}"></span>`,
              iconSize: [16, 16],
              iconAnchor: [8, 8],
            })}
          >
            <Popup>{point.label}</Popup>
          </Marker>
        ))}
        <Recenter position={currentPosition} />
      </MapContainer>
    </div>
  );
}
