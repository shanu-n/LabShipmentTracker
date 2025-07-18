'use client';
import { useState } from 'react';

type Shipment = {
  id: string;
  tracking_number: string;
  carrier: string;
  status: string;
  sample_type: string | null;
  priority: string | null;
  expected_delivery_date: string | null;
  date_received: string | null;
};

type Props = {
  shipments: Shipment[];
  onMarkAsReceived: () => void;
};

export default function ShipmentsList({ shipments, onMarkAsReceived }: Props) {
  const [showReceived, setShowReceived] = useState(false);
  const [activePage, setActivePage] = useState(1);
  const [receivedPage, setReceivedPage] = useState(1);
  const itemsPerPage = 10;

  const activeShipments = shipments.filter((s) => !s.date_received);
  const receivedShipments = shipments.filter((s) => s.date_received);

  // Pagination calculations
  const paginateItems = (items: Shipment[], pageNumber: number) => {
    const startIndex = (pageNumber - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return items.slice(startIndex, endIndex);
  };

  const currentActiveShipments = paginateItems(activeShipments, activePage);
  const currentReceivedShipments = paginateItems(receivedShipments, receivedPage);

  const markAsReceived = async (id: string) => {
    await fetch(`/api/shipments/${id}`, {
      method: 'PATCH',
    });
    onMarkAsReceived();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Delivered':
        return 'bg-green-100 text-green-800';
      case 'Delayed':
        return 'bg-red-100 text-red-800';
      case 'Out for Delivery':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  const PaginationControls = ({ 
      total, 
      currentPage, 
      setPage 
    }: { 
      total: number; 
      currentPage: number; 
      setPage: (page: number) => void; 
    }) => {
      const totalPages = Math.ceil(total / itemsPerPage);
      const startIndex = (currentPage - 1) * itemsPerPage;
      const endIndex = Math.min(startIndex + itemsPerPage, total);
      const hasResults = total > 0;

      return (
        <div className="mt-4 flex items-center justify-between px-4">
          <div className="text-sm text-gray-700">
            Showing {total > 0 ? startIndex + 1 : 0}-{endIndex} of {total} results
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => setPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1 || !hasResults}
              className={`px-3 py-1 rounded border transition-colors
                ${currentPage === 1 || !hasResults
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                  : 'bg-blue-800 text-white hover:bg-blue-700'
                }`}
            >
              Previous
            </button>
            <button
              onClick={() => setPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages || !hasResults}
              className={`px-3 py-1 rounded border transition-colors
                ${currentPage === totalPages || !hasResults
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                  : 'bg-blue-800 text-white hover:bg-blue-700'
                }`}
            >
              Next
            </button>
          </div>
        </div>
      );
    };

  return (
    <div className="mt-10 max-w-7xl mx-auto p-4 bg-white rounded shadow">
      <h2 className="text-xl font-bold mb-4 text-gray-900">Current Shipments</h2>
      <table className="min-w-full table-auto border text-sm">
        <thead>
          <tr className="bg-gray-100 text-left text-gray-800">
            <th className="p-2 border">Tracking Number</th>
            <th className="p-2 border">Status</th>
            <th className="p-2 border">Carrier</th>
            <th className="p-2 border">Shipment Type</th>
            <th className="p-2 border">Priority</th>
            <th className="p-2 border">Expected Delivery</th>
            <th className="p-2 border">Date Received</th>
            <th className="p-2 border">Action</th>
          </tr>
        </thead>
        <tbody>
          {currentActiveShipments.map((s) => (
            <tr key={s.id} className="border-t text-gray-900">
              <td className="p-2 border">{s.tracking_number}</td>
              <td className="p-2 border">
                <span className={`px-2 py-1 rounded text-sm ${getStatusColor(s.status)}`}>
                  {s.status}
                </span>
              </td>
              <td className="p-2 border">{s.carrier}</td>
              <td className="p-2 border">{s.sample_type || '—'}</td>
              <td className="p-2 border">{s.priority || '—'}</td>
              <td className="p-2 border">
                {s.expected_delivery_date
                  ? new Date(s.expected_delivery_date).toLocaleString()
                  : '—'}
              </td>
              <td className="p-2 border">
                {s.date_received
                  ? new Date(s.date_received).toLocaleString()
                  : '—'}
              </td>
              <td className="p-2 border">
                {s.date_received ? (
                  <span className="text-green-600 font-semibold">✓ Received</span>
                ) : (
                  <button
                    onClick={() => markAsReceived(s.id)}
                    className="bg-gray-200 hover:bg-gray-300 text-sm px-3 py-1 rounded"
                  >
                    Mark as Received
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <PaginationControls 
        total={activeShipments.length} 
        currentPage={activePage} 
        setPage={setActivePage}
      />

      <button
        onClick={() => setShowReceived((prev) => !prev)}
        className="mt-4 mb-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-500"
      >
        {showReceived ? 'Hide Received Shipments' : 'Show Received Shipments'}
      </button>

      {showReceived && (
        <div className="mt-1 bg-gray-50 p-4 rounded shadow">
          <h3 className="text-md font-semibold mb-3 text-gray-800">Received Shipments</h3>
          <table className="min-w-full table-auto border text-sm">
            <thead>
              <tr className="bg-gray-200 text-left text-gray-800">
                <th className="p-2 border">Tracking Number</th>
                <th className="p-2 border">Carrier</th>
                <th className="p-2 border">Shipment Type</th>
                <th className="p-2 border">Date Received</th>
              </tr>
            </thead>
            <tbody>
              {currentReceivedShipments.map((s) => (
                <tr key={s.id} className="border-t text-gray-900">
                  <td className="p-2 border">{s.tracking_number}</td>
                  <td className="p-2 border">{s.carrier}</td>
                  <td className="p-2 border">{s.sample_type || '—'}</td>
                  <td className="p-2 border">{new Date(s.date_received!).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <PaginationControls 
            total={receivedShipments.length} 
            currentPage={receivedPage} 
            setPage={setReceivedPage}
          />
        </div>
      )}
    </div>
  );
}