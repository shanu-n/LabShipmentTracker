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
  const [success, setSuccess] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    // Clear error when user starts typing
    if (error) setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setSuccess(false);

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

      // Show success message
      setSuccess(true);
      
      // Reset form
      setForm({
        tracking_number: '',
        carrier: 'FedEx',
        sample_type: 'Sample',
        priority: 'Medium',
      });

      // Call parent callback
      onAdd();

      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(false), 3000);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-6 bg-white rounded shadow max-w-xl mx-auto mt-6">
      <h2 className="text-xl font-bold text-center text-gray-800">Add New Shipment</h2>
      
      {/* Success Message */}
      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
          Shipment added successfully!
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <input
        name="tracking_number"
        placeholder="Tracking Number"
        value={form.tracking_number}
        onChange={handleChange}
        required
        disabled={isSubmitting}
        className="border p-2 w-full rounded text-black placeholder-gray-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
      />

      <select
        name="carrier"
        value={form.carrier}
        onChange={handleChange}
        disabled={isSubmitting}
        className="border p-2 w-full rounded text-black disabled:bg-gray-100 disabled:cursor-not-allowed"
      >
        <option value="FedEx">FedEx</option>
        <option value="UPS">UPS</option>
        <option value="DHL">DHL</option>
      </select>

      <select
        name="sample_type"
        value={form.sample_type}
        onChange={handleChange}
        disabled={isSubmitting}
        className="border p-2 w-full rounded text-black disabled:bg-gray-100 disabled:cursor-not-allowed"
      >
        <option value="CLIA">CLIA</option>
        <option value="Research">Research</option>
        <option value="Office Inventory">Office Inventory</option>
        <option value="Food/Misc">Food/Misc</option>
        <option value="Sample">Sample</option>
      </select>

      <select
        name="priority"
        value={form.priority}
        onChange={handleChange}
        disabled={isSubmitting}
        className="border p-2 w-full rounded text-black disabled:bg-gray-100 disabled:cursor-not-allowed"
      >
        <option value="Low">Low</option>
        <option value="Medium">Medium</option>
        <option value="High">High</option>
      </select>

      <button 
        type="submit" 
        disabled={isSubmitting}
        className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed text-white px-4 py-2 rounded w-full font-semibold transition-colors"
      >
        {isSubmitting ? 'Adding Shipment...' : 'Add Shipment'}
      </button>
    </form>
  );
}