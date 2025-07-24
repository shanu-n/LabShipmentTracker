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

  // Server-side validation
  if (!tracking_number || tracking_number.trim().length > 6) {
    return Response.json({ error: 'Tracking number must be 6 characters' }, { status: 400 });
  }

  // Check for existing tracking number
  const existing = await supabase
    .from('shipments')
    .select('id')
    .eq('tracking_number', tracking_number)
    .maybeSingle();

  if (existing.data) {
    return Response.json({ error: 'Tracking number already exists' }, { status: 409 });
  }

  let status = 'In Transit'; // Default status
  let expected_delivery: string | null = null;

  if (carrier === 'FedEx') {
    try {
      console.log(`🔍 Validating FedEx tracking: ${tracking_number}`);
      
      const fedexStatus = await fetchFedExStatus(tracking_number);
      const fedexExpectedDelivery = await fetchFedExExpDate(tracking_number);

      console.log(`✅ FedEx Status for ${tracking_number}:`, fedexStatus);
      
      // 🚫 CRITICAL: If FedEx returns null status, the tracking number doesn't exist
      if (fedexStatus === null) {
        console.log(`❌ Invalid tracking number: ${tracking_number} - NOT saving to database`);
        return Response.json(
          { 
            error: 'This tracking number does not exist. Please verify the tracking number.',
            tracking_number 
          },
          { status: 400 }
        );
      }

      // Only update status if we got a valid response from FedEx
      status = fedexStatus;

      if (fedexExpectedDelivery && typeof fedexExpectedDelivery.toISO === 'function') {
        // Convert to ISO string (length ~24) and truncate if needed
        expected_delivery = fedexExpectedDelivery.toISO();
        if (expected_delivery.length > 30) {
          expected_delivery = expected_delivery.slice(0, 30); // truncate safely
        }
      }
    } catch (err) {
      console.warn('⚠️ FedEx fetch failed:', err.message);
      // If FedEx API fails entirely, we might want to prevent saving or use default
      // For now, we'll continue with default status, but you might want to return an error
    }
  }

  console.log(`✅ Valid tracking number: ${tracking_number} - Saving to database with status: ${status}`);

  // Insert into database only if tracking number is valid
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

  console.log(`✅ Shipment saved successfully:`, data);
  return Response.json({ message: 'Shipment added!', shipment: data });
}
