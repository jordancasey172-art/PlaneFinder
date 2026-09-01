# Plane Finder - Professional Flight Tracking & Booking Platform

## Overview
Plane Finder is a professional, production-ready flight tracking and booking platform with a clean, modern interface. All customer-facing pages are designed for ease of use, while the admin dashboard is completely hidden from the public site.

---

## 🛫 CUSTOMER FEATURES

### 1. **Home Page** (`/`)
- Clean landing page with flight tracking overview
- Live statistics (flights tracked, aircraft airborne, airlines)
- Quick access to all customer tools
- Sample of currently airborne flights

### 2. **Live Flight Tracking** (`/live`)
- Interactive real-time map with all flights
- Dark Leaflet map showing aircraft positions
- Search and filter flights by airline/status
- Click any flight to open its detail tracker
- Updates every 3 seconds

### 3. **Flight Search** (`/flights`)
- Browse all available flights
- Filter by airline, route, or status
- Book directly from the list

### 4. **Airlines Directory** (`/airlines`)
- Browse all operating airlines
- See which airlines are currently flying
- Click any airline to see its current fleet

### 5. **Book a Flight** (`/book/[flightId]`)
- Enter passenger details (name, email, phone, nationality, document #)
- Select cabin class (Economy, Premium, Business)
- Choose your seat from available options
- Complete sandbox payment
- Instant booking confirmation

**What You Get After Booking:**
- Booking Reference (e.g., `PF-X9H9LM`)
- Ticket Number (e.g., `GT-2026-UATD8AYW`)
- Tracking ID (e.g., `GTRK-BAA622`)

---

## 📍 HOW TO TRACK YOUR BOOKING

### Method 1: Using Your Booking Reference
1. Go to `/track-booking`
2. Enter your booking reference (e.g., `PF-X9H9LM`)
3. View:
   - Complete flight details
   - Passenger information
   - Ticket status
   - **Live tracking link** to open the aircraft map

### Method 2: Using Your Tracking ID
1. Go to `/live`
2. Open the live radar map
3. Search for your flight or tracking ID
4. Watch your aircraft in real-time on the map

### Method 3: Track by Flight Number
1. Go to `/track` or `/live`
2. Enter flight number (e.g., `GT204`)
3. See full flight path and current position

---

## 🎫 TICKET MANAGEMENT

### View Your Ticket
1. Go to `/track-booking?ref=YOUR_BOOKING_REF`
2. Click "View Ticket" on your ticket
3. See full ticket details in a professional format

### Download Your Ticket
- **PDF Format:** Click "PDF" to download as printable PDF
- **PNG Format:** Click "PNG" to download as image
- **QR Code:** Both formats include a secure QR code

### Verify a Ticket
1. **Method A - QR Code:** Scan the QR code on your ticket
   - Goes directly to verification page
2. **Method B - Ticket Number:** Go to `/verify?ticket=GT-2026-XXXXXXXX`
3. **Method C - QR Token:** Scan QR shows backend-verified ticket status

**All verification queries the database** - you cannot forge a valid ticket or tracking ID.

---

## 💬 CUSTOMER SUPPORT

### Live Chat
- Bottom-right chat bubble on every page
- Type your question
- Receive instant bot response + human support
- Messages stored securely in the database

### Contact Form
- Go to `/support`
- Submit your issue with details
- Support team replies via email

### Frequently Asked Questions
- Available on `/support` page
- Topics: booking, tickets, tracking, payments

---

## 🔒 HIDDEN ADMIN DASHBOARD

### Access Methods

**Method 1: Password Entry**
1. Visit: `https://your-domain.com/ops-console-secure-access`
2. Enter your admin access code (from `ADMIN_ACCESS_CODE` environment variable)
3. You'll be logged in for 8 hours

**Method 2: Direct Token**
1. Use this link: `https://your-domain.com/ops-console-secure-access/auth?token=YOUR_TOKEN`
2. Replace `YOUR_TOKEN` with the value from `ADMIN_TOKEN` environment variable
3. Automatic login without entering password

### Admin Console Features

**Flight Management:**
- Create new flights (origin, destination, time, aircraft, price)
- View all active flights
- Cancel flights instantly
- Update flight status

**Live Map:**
- See current aircraft positions
- Manual position control (update lat/lng/altitude/speed)
- Simulation controls (start, pause, stop, speed multiplier)

**Bookings & Passengers:**
- View all bookings
- Search bookings by reference
- See passenger manifesto
- Confirm booking status

**Tickets:**
- Search tickets by number or status
- View ticket details
- Verify ticket authenticity
- Cancel tickets if needed
- Reissue PDF/PNG tickets

**Support:**
- View all customer support messages
- Reply to support threads
- Mark threads as resolved/open
- Track open support tickets

**Logout:** Click "Logout" to end session (clears secure cookie)

---

## 🛡️ SECURITY

### Customer Data
- Booking references, ticket numbers, tracking IDs all database-verified
- Cannot create fake tickets - must exist in database
- Secure QR codes point to verification endpoints
- QR verification queries backend database only

### Admin Access
- Secret URL path (`/ops-console-secure-access`) not linked anywhere
- Access via password code or token
- HTTP-only secure cookies (not accessible via JavaScript)
- Session expires after 8 hours
- All admin actions logged to database

### Payment
- Sandbox payment flow (no real charges)
- Payment records stored in database
- Confirmations sent to customer email

---

## 📊 LIVE DATA

The platform includes 32 simulated flights from major airlines:

### Airlines Flying
- GoldenAir (GA)
- SkyBridge (SB)
- Atlantic Wings (AW)
- Pacific Jet (PJ)
- Meridian (ME)
- Nova Air (NV)
- Blue Horizon (BH)
- Condor Atlantic (CA)

### Routes
- Texas ↔ London
- Paris ↔ Dubai
- Tokyo ↔ Sydney
- New York ↔ London
- Los Angeles ↔ Tokyo
- And many more...

### Simulation
- Aircraft positions update every 3 seconds
- Smooth interpolation between waypoints
- Realistic altitude/speed profiles
- Status changes (scheduled → boarding → in flight → arrived)

---

## 🌐 PUBLIC SITE STRUCTURE

```
/ (Home)
├─ /live (Live Tracking Map)
├─ /flights (Flight Directory)
├─ /airlines (Airline Directory)
├─ /book (Booking Flow)
├─ /track-booking (Find My Booking)
├─ /track (Track by Flight #)
├─ /verify (Verify Ticket)
└─ /support (Customer Support)
```

## 🔐 HIDDEN ADMIN

```
/ops-console-secure-access (Login)
├─ /ops-console-secure-access/auth (Token Auth)
└─ /ops-console-secure-access/dashboard (Full Control Panel)
```

---

## 🚀 ENVIRONMENT VARIABLES

### For Admin Access
```
ADMIN_ACCESS_CODE=your-secret-code
ADMIN_TOKEN=your-secret-token
```

If not set, admin features are available but require valid session.

---

## 📱 Responsive Design

- **Desktop:** Full feature set, interactive maps
- **Tablet:** Optimized layout, touch-friendly
- **Mobile:** Simplified navigation, readable text

---

## 🎯 KEY DIFFERENCES FROM DEMO

- ✅ Professional, clean interface (no "Golden Ticket" branding)
- ✅ Hidden admin dashboard (secret URL path)
- ✅ Customer-focused pages only
- ✅ Secure token-based admin access
- ✅ Complete booking-to-tracking workflow
- ✅ Live chat & support system integrated
- ✅ Database-backed verification (no fake tickets/tracking IDs accepted)

---

## 💡 BEST PRACTICES

1. **Always use `/track-booking`** to retrieve your booking
2. **Save your booking reference** after purchase
3. **Use tracking ID for live updates** on the map
4. **Scan QR for instant verification** (most secure)
5. **Admin: rotate tokens regularly** for security
6. **Admin: never share the secret URL path** publicly
