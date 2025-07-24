import { supabase } from '@/utils/supabase';
import { fetchFedExStatus, fetchFedExExpDate } from '../../lib/fedex';
import { DateTime } from 'luxon';

export async function GET() {
  const { data, error } = await supabase
    .from('shipments')
    .select('*')
    .order('date_created', { ascending: false });

  if (error) {
    console.error('❌ GET error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }

  return Response.json({ shipments: data });
}

export async function POST(req: Request) {
  const body = await req.json();
  const { tracking_number, carrier, sample_type, priority } = body;

  let status = 'In Transit';
  let expected_delivery: string | null = null;

  if (carrier === 'FedEx') {
    try {
      const fedexStatus = await fetchFedExStatus(tracking_number);
      const fedexExpectedDelivery = await fetchFedExExpDate(tracking_number);

      if (fedexStatus) {
        status = fedexStatus;
      }

      if (fedexExpectedDelivery && typeof fedexExpectedDelivery.toISO === 'function') {
        // Convert to ISO string (length ~24) and truncate if needed
        expected_delivery = fedexExpectedDelivery.toISO();
        if (expected_delivery.length > 30) {
          expected_delivery = expected_delivery.slice(0, 30); // truncate safely
        }
      }
    } catch (err) {
      console.warn('⚠️ FedEx fetch failed:', err.message);
    }
  }

  // Server-side validation
  if (!tracking_number || tracking_number.trim().length < 6) {
    return Response.json({ error: 'Tracking number must be at least 6 characters' }, { status: 400 });
  }

  const existing = await supabase
    .from('shipments')
    .select('id')
    .eq('tracking_number', tracking_number)
    .maybeSingle();

  if (existing.data) {
    return Response.json({ error: 'Tracking number already exists' }, { status: 409 });
  }

  const { data, error } = await supabase
    .from('shipments')
    .insert([
      {
        tracking_number,
        carrier,
        status,
        sample_type,
        priority,
        expected_delivery_date: expected_delivery, // Will be ISO or null
      }
    ])
    .select()
    .single();

  if (error) {
    console.error('❌ POST error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }

  return Response.json({ message: 'Shipment added!', shipment: data });
}
