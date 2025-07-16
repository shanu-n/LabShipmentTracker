import { supabase } from '@/utils/supabase';

export async function GET() {
  const { data, error } = await supabase
    .from('shipments')
    .select('*')
    .order('date_created', { ascending: false }); // ✅ lowercase

  if (error) {
    console.error('❌ GET error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }

  return Response.json({ shipments: data });
}

export async function POST(req: Request) {
  const body = await req.json();

  const { data, error } = await supabase.from('shipments').insert([
    {
      tracking_number: body.tracking_number,     // ✅ lowercase key
      carrier: body.carrier,
      status: 'In Transit',
      sample_type: body.sample_type,             // ✅ lowercase key
      priority: body.priority,
    },
  ]);

  if (error) {
    console.error('❌ POST error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }

  return Response.json({ message: 'Shipment added!', shipment: data });
}
