require("dotenv").config();
const express = require('express');
const { createClient } = require('@supabase/supabase-js');
const cors = require('cors');

const app = express();

// Security: Restrict CORS to roromode.com only
app.use(cors({
  origin: ['https://roromode.com', 'https://www.roromode.com'],
  methods: ['GET', 'POST'],
}));
app.use(express.json({ limit: '10kb' })); // Limit body size

// Simple rate limiter (in-memory)
const rateLimits = {};
function rateLimit(maxRequests, windowMs) {
  return (req, res, next) => {
    const ip = req.ip || req.connection.remoteAddress;
    const now = Date.now();
    if (!rateLimits[ip]) rateLimits[ip] = [];
    rateLimits[ip] = rateLimits[ip].filter(t => now - t < windowMs);
    if (rateLimits[ip].length >= maxRequests) {
      return res.status(429).json({ error: 'Too many requests. Try again later.' });
    }
    rateLimits[ip].push(now);
    next();
  };
}

// Clean up rate limit memory every 10 minutes
setInterval(() => {
  const now = Date.now();
  for (const ip in rateLimits) {
    rateLimits[ip] = rateLimits[ip].filter(t => now - t < 60000);
    if (rateLimits[ip].length === 0) delete rateLimits[ip];
  }
}, 600000);

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

// Input sanitization
function sanitize(str, maxLen = 500) {
  if (!str) return null;
  return String(str).trim().slice(0, maxLen);
}
function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'roro-booking-api' });
});

// Create booking from AI receptionist — rate limited to 10/min
app.post('/api/booking', rateLimit(10, 60000), async (req, res) => {
  try {
    const name = sanitize(req.body.name, 200);
    const email = sanitize(req.body.email, 200);
    const phone = sanitize(req.body.phone, 30);
    const service = sanitize(req.body.service, 200);
    const preferred_date = sanitize(req.body.preferred_date, 20);
    const preferred_time = sanitize(req.body.preferred_time, 20);
    const notes = sanitize(req.body.notes, 1000);
    const source = sanitize(req.body.source, 50);

    if (!name || !service) {
      return res.status(400).json({ error: 'Name and service are required' });
    }
    if (email && !isValidEmail(email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }

    // Find or create client
    let clientId = null;
    if (email) {
      const { data: existing } = await supabase
        .from('clients').select('id').eq('email', email).single();

      if (existing) {
        clientId = existing.id;
      } else {
        const { data: newClient, error: clientError } = await supabase
          .from('clients').insert({ name, email, phone }).select('id').single();
        if (clientError) {
          console.error('Client creation error:', clientError);
          return res.status(500).json({ error: 'Failed to create client' });
        }
        clientId = newClient.id;
      }
    }

    // Build scheduled_at
    let scheduledAt = null;
    if (preferred_date) {
      if (preferred_time) {
        const timeParts = preferred_time.match(/(\d{1,2}):(\d{2})\s*(AM|PM)?/i);
        if (timeParts) {
          let hours = parseInt(timeParts[1], 10);
          const minutes = parseInt(timeParts[2], 10);
          const period = timeParts[3];
          if (period && period.toUpperCase() === 'PM' && hours !== 12) hours += 12;
          if (period && period.toUpperCase() === 'AM' && hours === 12) hours = 0;
          scheduledAt = `${preferred_date}T${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:00`;
        } else {
          scheduledAt = `${preferred_date}T00:00:00`;
        }
      } else {
        scheduledAt = `${preferred_date}T00:00:00`;
      }
    }

    const bookingNotes = [notes || '', source ? `Source: ${source}` : ''].filter(Boolean).join(' | ');

    const { data: booking, error: bookingError } = await supabase
      .from('bookings').insert({
        client_id: clientId, service, scheduled_at: scheduledAt,
        notes: bookingNotes || null, status: 'pending',
      }).select('id, service, status, scheduled_at').single();

    if (bookingError) {
      console.error('Booking creation error:', bookingError);
      return res.status(500).json({ error: 'Failed to create booking' });
    }

    console.log(`Booking created: ${booking.id} for ${name} - ${service}`);
    res.json({ success: true, booking_id: booking.id, client_id: clientId, service: booking.service, status: booking.status, scheduled_at: booking.scheduled_at });
  } catch (err) {
    console.error('Booking endpoint error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// List recent AI-sourced bookings — rate limited to 30/min
app.get('/api/sessions', rateLimit(30, 60000), async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('bookings').select('*, clients(name, email, phone)')
      .ilike('notes', '%ai_receptionist%')
      .order('created_at', { ascending: false }).limit(50);
    if (error) return res.status(500).json({ error: error.message });
    res.json({ bookings: data || [] });
  } catch (err) {
    console.error('Sessions endpoint error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Email webhook — requires secret
app.post('/api/webhook/email', (req, res) => {
  const secret = req.headers['x-webhook-secret'];
  if (secret !== process.env.WEBHOOK_SECRET && process.env.WEBHOOK_SECRET) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  console.log('Email webhook received:', JSON.stringify(req.body).slice(0, 500));
  res.json({ status: 'received', timestamp: new Date().toISOString() });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`RoRo Booking API running on port ${PORT}`));
