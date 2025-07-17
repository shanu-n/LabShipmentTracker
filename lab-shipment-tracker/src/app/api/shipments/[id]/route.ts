import { supabase } from '@/utils/supabase';

export async function PATCH(_: Request, { params }: { params: { id: string } }) {
  const { id } = params;
  const now = new Date().toISOString();

  const { data, error } = await supabase
    .from('shipments')
    .update({
      date_received: now,
    })
    .eq('id', id)
    .select();

  if (error) {
    console.error('❌ PATCH error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }

  return Response.json({ message: 'Shipment marked as received', shipment: data });
}
