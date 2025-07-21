'use client';
import { useState } from 'react';

type Props = {
  onAdd: () => void;
};

export default function AddShipmentForm({ onAdd }: Props) {
  const [form, setForm] = useState({
    tracking_number: '',
    carrier: 'FedEx',
    sample_type: 'Sample',
    priority: 'Medium',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (error) setError(null);
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch('/api/shipments', {
        method: 'POST',
        body: JSON.stringify(form),
        headers: { 'Content-Type': 'application/json' },
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to add shipment: ${errorText}`);
      }

      setForm({
        tracking_number: '',
        carrier: 'FedEx',
        sample_type: 'Sample',
        priority: 'Medium',
      });

      onAdd();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <tr className="bg-white border-t">
      <td className="p-4 border">
        <input
          name="tracking_number"
          placeholder="Tracking #"
          value={form.tracking_number}
          onChange={handleChange}
          disabled={isSubmitting}
          className="w-full p-2 border rounded"
          required
        />
      </td>
      <td className="p-4 border text-center">
        <span className="inline-block bg-yellow-100 text-yellow-800 text-sm font-medium px-2 py-1 rounded">
          Pending
        </span>
      </td>
      <td className="p-4 border">
        <select
          name="carrier"
          value={form.carrier}
          onChange={handleChange}
          disabled={isSubmitting}
          className="w-full p-2 border rounded"
        >
          <option value="FedEx">FedEx</option>
          <option value="UPS">UPS</option>
          <option value="DHL">DHL</option>
        </select>
      </td>
      <td className="p-4 border">
        <select
          name="sample_type"
          value={form.sample_type}
          onChange={handleChange}
          disabled={isSubmitting}
          className="w-full p-2 border rounded"
        >
          <option value="CLIA">CLIA</option>
          <option value="Research">Research</option>
          <option value="Office Inventory">Office Inventory</option>
          <option value="Food/Misc">Food/Misc</option>
          <option value="Sample">Sample</option>
        </select>
      </td>
      <td className="p-4 border">
        <select
          name="priority"
          value={form.priority}
          onChange={handleChange}
          disabled={isSubmitting}
          className="w-full p-2 border rounded"
        >
          <option value="Low">Low</option>
          <option value="Medium">Medium</option>
          <option value="High">High</option>
        </select>
      </td>
      <td className="p-4 border text-center text-gray-400">—</td>
      <td className="p-4 border text-center text-gray-400">—</td>
      <td className="p-2 border text-center w-28">
        <button
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="bg-[#0059c2] text-white text-sm px-3 py-1 rounded hover:bg-[#0044a8] disabled:bg-blue-300 disabled:cursor-not-allowed"
        >
          {isSubmitting ? 'Adding...' : 'Add'}
        </button>
      </td>
    </tr>
  );
}
