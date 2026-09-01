# Plane Finder - Setup & Deployment Guide

## Quick Start

The platform is ready to use immediately after deployment. Here's how everything works:

### Customer Access (Public)
- **Home Page:** `https://your-domain.com/`
- **Live Tracking:** `https://your-domain.com/live`
- **Book Flight:** `https://your-domain.com/flights` → Select Flight → Booking
- **Track Booking:** `https://your-domain.com/track-booking` (Enter booking reference)
- **Verify Ticket:** `https://your-domain.com/verify` (Scan QR or enter ticket #)
- **Customer Support:** `https://your-domain.com/support`

### Admin Access (Hidden)
- **Secret Admin Path:** `https://your-domain.com/ops-console-secure-access`
- **Login Method 1:** Enter your admin access code (password)
- **Login Method 2:** Direct link with token: `https://your-domain.com/ops-console-secure-access/auth?token=YOUR_TOKEN`

---

## Environment Variables Required

Set these in your `.env` file:

```env
# Database (already configured)
DATABASE_URL=postgresql://postgres:postgres@127.0.0.1:5432/app_db

# Admin Access (set these to enable admin dashboard)
ADMIN_ACCESS_CODE=your-secure-admin-code
ADMIN_TOKEN=your-secure-admin-token

# Optional: Custom admin secret path (default: ops-console-secure-access)
ADMIN_SECRET_PATH=your-custom-secret-path

# Optional: Session Secret (auto-derived from ADMIN_ACCESS_CODE if not set)
ADMIN_SESSION_SECRET=your-session-secret
```

### Example Setup
```env
ADMIN_ACCESS_CODE=SecureAdminCode2024!
ADMIN_TOKEN=d3e4f5g6h7i8j9k0l1m2n3o4p5q6r7s8t9u0v1w2x3y4z5
```

---

## How Customers Use the Platform

### 1. **Book a Flight**
   1. Visit homepage
   2. Click "Book Now" or go to "Search Flights"
   3. Select a flight
   4. Enter passenger details
   5. Choose seat and cabin class
   6. Complete payment (sandbox - no real charge)
   7. Get booking reference (e.g., `PF-ABC123`)

### 2. **Receive Booking Confirmation**
   - Email with booking reference
   - Booking page shows:
     - Flight details
     - Passenger info
     - Seat & cabin class
     - **Ticket number** (e.g., `GT-2026-XXXXXXXX`)
     - **Tracking ID** (e.g., `GTRK-ABC123`)
   - Download PDF or PNG ticket

### 3. **Track Your Flight**
   - Option A: Use `/track-booking?ref=PF-ABC123`
   - Option B: Use `/live` and search tracking ID
   - Option C: Use `/live` and search flight number
   - See aircraft position in real-time on interactive map

### 4. **Verify Your Ticket**
   - Scan QR code on ticket → Auto-verification
   - Or visit `/verify?ticket=GT-2026-XXXXXXXX`
   - Backend confirms ticket exists and is valid

### 5. **Get Support**
   - Live chat (bottom-right bubble)
   - Contact form at `/support`
   - FAQ and self-service articles

---

## How You (Admin) Use the Platform

### 1. **Login to Admin Dashboard**
   
   **Method A - Password:**
   ```
   URL: https://your-domain.com/ops-console-secure-access
   Enter your ADMIN_ACCESS_CODE
   ```

   **Method B - Direct Token:**
   ```
   URL: https://your-domain.com/ops-console-secure-access/auth?token=YOUR_ADMIN_TOKEN
   (Automatic login)
   ```

### 2. **Create Flights**
   - Enter flight number (e.g., GT999)
   - Select airline
   - Set origin/destination cities & codes
   - Set departure & arrival times
   - Set aircraft type, capacity, base price
   - Set route coordinates (lat/lng)
   - Click "Create Flight" → Tracking session auto-created

### 3. **Manage Existing Flights**
   - View all flights in table
   - Cancel flights instantly
   - Update flight status
   - Monitor live positions on map

### 4. **View Bookings & Passengers**
   - See recent bookings with customer email & payment
   - View passenger manifest
   - Check booking status

### 5. **Manage Tickets**
   - Search tickets by number or status
   - View ticket details
   - Verify ticket authenticity
   - Cancel tickets if needed
   - Reissue PDF/PNG versions

### 6. **Live Flight Tracking**
   - Interactive map showing aircraft position
   - Manual controls:
     - Update latitude/longitude
     - Change altitude & speed
     - Adjust heading
     - Change flight status
   - Simulation controls:
     - Start/pause/stop simulation
     - Adjust simulation speed multiplier
   - All changes instantly reflect on customer's tracking page

### 7. **Customer Support**
   - View all support messages
   - Reply to customer threads
   - Mark threads resolved or reopen them
   - Track open support tickets

### 8. **Logout**
   - Click "Logout" button
   - Session cookie cleared
   - Redirects to home page

---

## Security Features

### ✅ For Customers
- **No Fake Tickets:** Ticket numbers must exist in database
- **No Fake Tracking IDs:** Tracking IDs must exist in database
- **Secure QR Codes:** Verification queries backend only
- **Booking References:** Unique per booking, database-backed
- **Encrypted Verification:** QR codes contain secure tokens

### ✅ For Admin
- **Hidden Dashboard:** Secret URL path, not linked anywhere
- **Secure Login:** Password or token-based authentication
- **Session Timeout:** 8-hour automatic logout
- **HTTP-Only Cookies:** Session cookies not accessible via JavaScript
- **No API Key Exposure:** All secrets server-side only
- **Action Logging:** All admin changes timestamped in database

### ✅ For Data
- **PostgreSQL:** Enterprise-grade database
- **Relational Schema:** Enforced data integrity
- **Foreign Keys:** Prevent orphaned records
- **Encrypted Passwords:** Secure authentication
- **Transaction Support:** Atomic booking creation

---

## Deployment Checklist

- [ ] Set `ADMIN_ACCESS_CODE` environment variable
- [ ] Set `ADMIN_TOKEN` environment variable (optional token auth)
- [ ] Configure `DATABASE_URL` (or use default local PostgreSQL)
- [ ] Run `npm install`
- [ ] Run `npx drizzle-kit push` (apply database schema)
- [ ] Test homepage loads: `https://your-domain.com/`
- [ ] Test live tracking: `https://your-domain.com/live`
- [ ] Test admin access: `https://your-domain.com/ops-console-secure-access`
- [ ] Create a test booking
- [ ] Verify test booking via `/track-booking`
- [ ] Test admin flight creation
- [ ] Test ticket verification QR code

---

## Monitoring & Maintenance

### Daily
- Check admin dashboard for new bookings
- Respond to customer support messages
- Monitor flight statuses

### Weekly
- Review analytics (bookings, passengers, revenue)
- Update flight schedules if needed
- Check database performance

### Monthly
- Rotate admin access credentials
- Review security logs
- Backup database
- Update airline information

---

## Troubleshooting

### Admin Dashboard Not Loading
1. Check `ADMIN_ACCESS_CODE` is set in `.env`
2. Verify you're accessing `/ops-console-secure-access`
3. Check browser cookies are enabled

### Bookings Not Showing
1. Verify database connection (check logs)
2. Run `npx drizzle-kit push` to ensure schema exists
3. Check customer email used for booking

### Ticket Verification Failing
1. Verify ticket number format: `GT-2026-XXXXXXXX`
2. Check ticket exists in admin dashboard
3. Ensure QR code token matches database record

### Live Tracking Not Updating
1. Verify aircraft simulation is running
2. Check admin dashboard can update position
3. Refresh tracking page in browser

---

## Support

For issues or questions:
1. Check `/support` page for FAQs
2. Contact admin via support system
3. Review database logs
4. Check environment variables

---

## Summary

**Plane Finder** is a professional, production-ready flight tracking platform with:

✅ **Clean, modern interface** (no "Golden Ticket" branding)
✅ **Hidden admin dashboard** (not visible to customers)
✅ **Secure access** (password or token-based)
✅ **Complete booking workflow** (search → book → pay → ticket → track)
✅ **Real-time aircraft tracking** (live map with simulated flights)
✅ **Ticket verification** (QR codes + database validation)
✅ **Customer support** (live chat + contact form)
✅ **Professional design** (responsive, clean, business-ready)

Enjoy your professional flight tracking platform!
