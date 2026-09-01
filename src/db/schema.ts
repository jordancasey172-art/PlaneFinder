import { relations } from "drizzle-orm";
import {
  boolean,
  doublePrecision,
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

export type RouteWaypoint = {
  label: string;
  lat: number;
  lng: number;
};

export const airlines = pgTable("airlines", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: varchar("name", { length: 120 }).notNull().unique(),
  code: varchar("code", { length: 8 }).notNull().unique(),
  callsign: varchar("callsign", { length: 80 }).notNull(),
  country: varchar("country", { length: 120 }).notNull(),
  hub: varchar("hub", { length: 160 }).notNull(),
  hubCode: varchar("hub_code", { length: 8 }).notNull(),
  color: varchar("color", { length: 16 }).notNull().default("#f5b42b"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  name: varchar("name", { length: 160 }).notNull(),
  role: varchar("role", { length: 32 }).notNull().default("customer"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const admins = pgTable("admins", {
  id: uuid("id").defaultRandom().primaryKey(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  name: varchar("name", { length: 160 }).notNull(),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const flights = pgTable("flights", {
  id: uuid("id").defaultRandom().primaryKey(),
  flightNumber: varchar("flight_number", { length: 24 }).notNull().unique(),
  airlineId: uuid("airline_id").references(() => airlines.id, { onDelete: "set null" }),
  aircraft: varchar("aircraft", { length: 80 }).notNull().default("Boeing 787-9"),
  origin: varchar("origin", { length: 160 }).notNull(),
  destination: varchar("destination", { length: 160 }).notNull(),
  originCode: varchar("origin_code", { length: 8 }).notNull(),
  destinationCode: varchar("destination_code", { length: 8 }).notNull(),
  departureTime: timestamp("departure_time", { withTimezone: true }).notNull(),
  arrivalTime: timestamp("arrival_time", { withTimezone: true }).notNull(),
  status: varchar("status", { length: 40 }).notNull().default("Scheduled"),
  cabinClasses: jsonb("cabin_classes").$type<string[]>().notNull().default(["Economy", "Premium", "Business"]),
  capacity: integer("capacity").notNull().default(126),
  basePriceCents: integer("base_price_cents").notNull().default(49900),
  routeCoordinates: jsonb("route_coordinates").$type<RouteWaypoint[]>().notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const bookings = pgTable("bookings", {
  id: uuid("id").defaultRandom().primaryKey(),
  bookingReference: varchar("booking_reference", { length: 32 }).notNull().unique(),
  flightId: uuid("flight_id")
    .notNull()
    .references(() => flights.id, { onDelete: "restrict" }),
  customerEmail: varchar("customer_email", { length: 255 }).notNull(),
  passengerCount: integer("passenger_count").notNull().default(1),
  cabinClass: varchar("cabin_class", { length: 80 }).notNull(),
  totalAmountCents: integer("total_amount_cents").notNull(),
  status: varchar("status", { length: 40 }).notNull().default("Confirmed"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const passengers = pgTable("passengers", {
  id: uuid("id").defaultRandom().primaryKey(),
  bookingId: uuid("booking_id")
    .notNull()
    .references(() => bookings.id, { onDelete: "cascade" }),
  firstName: varchar("first_name", { length: 120 }).notNull(),
  lastName: varchar("last_name", { length: 120 }).notNull(),
  email: varchar("email", { length: 255 }).notNull(),
  phone: varchar("phone", { length: 80 }),
  nationality: varchar("nationality", { length: 120 }),
  documentNumber: varchar("document_number", { length: 120 }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const trackingSessions = pgTable("tracking_sessions", {
  id: uuid("id").defaultRandom().primaryKey(),
  flightId: uuid("flight_id")
    .notNull()
    .unique()
    .references(() => flights.id, { onDelete: "cascade" }),
  trackingId: varchar("tracking_id", { length: 40 }).notNull().unique(),
  currentLat: doublePrecision("current_lat").notNull(),
  currentLng: doublePrecision("current_lng").notNull(),
  altitude: integer("altitude").notNull().default(0),
  speed: integer("speed").notNull().default(0),
  heading: integer("heading").notNull().default(90),
  status: varchar("status", { length: 40 }).notNull().default("Scheduled"),
  simulationMode: boolean("simulation_mode").notNull().default(true),
  simulationState: varchar("simulation_state", { length: 40 }).notNull().default("paused"),
  simulationProgress: doublePrecision("simulation_progress").notNull().default(0),
  simulationSpeedMultiplier: doublePrecision("simulation_speed_multiplier").notNull().default(1),
  simulationDurationSeconds: integer("simulation_duration_seconds").notNull().default(900),
  lastUpdatedAt: timestamp("last_updated_at", { withTimezone: true }).defaultNow().notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const tickets = pgTable("tickets", {
  id: uuid("id").defaultRandom().primaryKey(),
  bookingId: uuid("booking_id")
    .notNull()
    .references(() => bookings.id, { onDelete: "cascade" }),
  ticketNumber: varchar("ticket_number", { length: 40 }).notNull().unique(),
  verificationToken: varchar("verification_token", { length: 96 }).notNull().unique(),
  seat: varchar("seat", { length: 12 }).notNull(),
  cabinClass: varchar("cabin_class", { length: 80 }).notNull(),
  status: varchar("status", { length: 40 }).notNull().default("Valid"),
  issuedAt: timestamp("issued_at", { withTimezone: true }).defaultNow().notNull(),
  cancelledAt: timestamp("cancelled_at", { withTimezone: true }),
});

export const trackingEvents = pgTable("tracking_events", {
  id: uuid("id").defaultRandom().primaryKey(),
  trackingSessionId: uuid("tracking_session_id")
    .notNull()
    .references(() => trackingSessions.id, { onDelete: "cascade" }),
  lat: doublePrecision("lat").notNull(),
  lng: doublePrecision("lng").notNull(),
  altitude: integer("altitude").notNull(),
  speed: integer("speed").notNull(),
  heading: integer("heading").notNull(),
  status: varchar("status", { length: 40 }).notNull(),
  message: text("message"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const payments = pgTable("payments", {
  id: uuid("id").defaultRandom().primaryKey(),
  bookingId: uuid("booking_id")
    .notNull()
    .references(() => bookings.id, { onDelete: "cascade" }),
  amountCents: integer("amount_cents").notNull(),
  currency: varchar("currency", { length: 12 }).notNull().default("USD"),
  provider: varchar("provider", { length: 80 }).notNull().default("SandboxPay"),
  providerPaymentId: varchar("provider_payment_id", { length: 80 }).notNull().unique(),
  status: varchar("status", { length: 40 }).notNull().default("Succeeded"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const supportMessages = pgTable("support_messages", {
  id: uuid("id").defaultRandom().primaryKey(),
  threadId: varchar("thread_id", { length: 40 }).notNull(),
  name: varchar("name", { length: 160 }),
  email: varchar("email", { length: 255 }),
  subject: varchar("subject", { length: 255 }),
  direction: varchar("direction", { length: 16 }).notNull().default("in"),
  body: text("body").notNull(),
  status: varchar("status", { length: 32 }).notNull().default("open"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const airlinesRelations = relations(airlines, ({ many }) => ({
  flights: many(flights),
}));

export const flightsRelations = relations(flights, ({ many, one }) => ({
  airline: one(airlines, {
    fields: [flights.airlineId],
    references: [airlines.id],
  }),
  bookings: many(bookings),
  trackingSession: one(trackingSessions),
}));

export const bookingsRelations = relations(bookings, ({ one, many }) => ({
  flight: one(flights, {
    fields: [bookings.flightId],
    references: [flights.id],
  }),
  passengers: many(passengers),
  tickets: many(tickets),
  payments: many(payments),
}));

export const passengersRelations = relations(passengers, ({ one }) => ({
  booking: one(bookings, {
    fields: [passengers.bookingId],
    references: [bookings.id],
  }),
}));

export const ticketsRelations = relations(tickets, ({ one }) => ({
  booking: one(bookings, {
    fields: [tickets.bookingId],
    references: [bookings.id],
  }),
}));

export const trackingSessionsRelations = relations(trackingSessions, ({ one, many }) => ({
  flight: one(flights, {
    fields: [trackingSessions.flightId],
    references: [flights.id],
  }),
  events: many(trackingEvents),
}));

export const trackingEventsRelations = relations(trackingEvents, ({ one }) => ({
  trackingSession: one(trackingSessions, {
    fields: [trackingEvents.trackingSessionId],
    references: [trackingSessions.id],
  }),
}));

export const paymentsRelations = relations(payments, ({ one }) => ({
  booking: one(bookings, {
    fields: [payments.bookingId],
    references: [bookings.id],
  }),
}));
