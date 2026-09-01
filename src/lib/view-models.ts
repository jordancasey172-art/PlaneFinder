import type { TrackingSnapshot } from "./tracking";
import type { TrackingViewModel } from "@/components/TrackingExperience";

export function toTrackingViewModel(snapshot: TrackingSnapshot): TrackingViewModel {
  return {
    flightNumber: snapshot.flight.flightNumber,
    airline: snapshot.airline
      ? { name: snapshot.airline.name, code: snapshot.airline.code, color: snapshot.airline.color }
      : null,
    aircraft: snapshot.flight.aircraft,
    origin: snapshot.flight.origin,
    destination: snapshot.flight.destination,
    originCode: snapshot.flight.originCode,
    destinationCode: snapshot.flight.destinationCode,
    departureTime: snapshot.flight.departureTime.toISOString(),
    arrivalTime: snapshot.flight.arrivalTime.toISOString(),
    trackingId: snapshot.session.trackingId,
    currentLat: snapshot.session.currentLat,
    currentLng: snapshot.session.currentLng,
    altitude: snapshot.session.altitude,
    speed: snapshot.session.speed,
    heading: snapshot.session.heading,
    status: snapshot.session.status,
    lastUpdatedAt: snapshot.session.lastUpdatedAt.toISOString(),
    currentLocationLabel: snapshot.currentLocationLabel,
    route: snapshot.route,
    simulatedNotice: snapshot.simulatedNotice,
    simulationState: snapshot.session.simulationState,
    simulationSpeedMultiplier: snapshot.session.simulationSpeedMultiplier,
  };
}
