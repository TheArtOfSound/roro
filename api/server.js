const express = require('express');
const { createClient } = require('@supabase/supabase-js');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'roro-booking-api' });
});

// Create booking from AI receptionist
app.post('/api/booking', async (req, res) => {
  try {
    const { name, email, phone, service, preferred_date, preferred_time, notes, source } = req.body;

    if (!name || !service) {
      return res.status(400).json({ error: 'Name and service are required' });
    }

    // Find or create client
    let clientId = null;
    if (email) {
      const { data: existing } = await supabase
        .from('clients')
        .select('id')
        .eq('email', email)
        .single();

      if (existing) {
        clientId = existing.id;
      } else {
        const { data: newClient, error: clientError } = await supabase
          .from('clients')
          .insert({
            name,
            email,
            phone: phone || null,
          })
          .select('id')
          .single();

        if (clientError) {
          console.error('Client creation error:', clientError);
          return res.status(500).json({ error: 'Failed to create client' });
        }
        clientId = newClient.id;
      }
    }

    // Build scheduled_at from preferred_date + preferred_time
    let scheduledAt = null;
    if (preferred_date) {
      if (preferred_time) {
        // Parse time like "10:00 AM" or "2:30 PM"
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

    // Create booking
    const bookingNotes = [
      notes || '',
      source ? `Source: ${source}` : '',
    ].filter(Boolean).join(' | ');

    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .insert({
        client_id: clientId,
        service,
        scheduled_at: scheduledAt,
        notes: bookingNotes || null,
        status: 'pending',
      })
      .select('id, service, status, scheduled_at')
      .single();

    if (bookingError) {
      console.error('Booking creation error:', bookingError);
      return res.status(500).json({ error: 'Failed to create booking' });
    }

    console.log(`Booking created: ${booking.id} for ${name} - ${service}`);
    res.json({
      success: true,
      booking_id: booking.id,
      client_id: clientId,
      service: booking.service,
      status: booking.status,
      scheduled_at: booking.scheduled_at,
    });
  } catch (err) {
    console.error('Booking endpoint error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// List recent AI-sourced bookings
app.get('/api/sessions', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('bookings')
      .select('*, clients(name, email, phone)')
      .ilike('notes', '%ai_receptionist%')
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    res.json({ bookings: data || [] });
  } catch (err) {
    console.error('Sessions endpoint error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Email webhook receiver (placeholder for future Mailgun/SendGrid/Zapier integration)
app.post('/api/webhook/email', async (req, res) => {
  try {
    const payload = req.body;
    console.log('Email webhook received:', JSON.stringify(payload).slice(0, 500));

    // Future: Parse email content for booking data
    // Extract: name, phone, email, service, date
    // Auto-create booking via the same logic as /api/booking
    //
    // Example flow:
    // 1. Receive forwarded email from AI receptionist summary
    // 2. Parse structured data from email body
    // 3. Call internal createBooking function
    // 4. Send confirmation email to client

    res.json({ status: 'received', timestamp: new Date().toISOString() });
  } catch (err) {
    console.error('Email webhook error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`RoRo Booking API running on port ${PORT}`);
});
