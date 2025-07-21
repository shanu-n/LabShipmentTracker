import { supabase } from '@/utils/supabase';

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

  const { data, error } = await supabase.from('shipments').insert([
    {
      tracking_number,
      carrier,
      status: 'In Transit',
      sample_type,
      priority,
    },
  ]);

  if (error) {
    console.error('❌ POST error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }

  return Response.json({ message: 'Shipment added!', shipment: data });
}
