import React, { useState } from 'react';
import { garageService } from '../services/garageService';
import { TOTAL_BAYS } from '../constants';
import { X } from 'lucide-react';

interface NewJobModalProps {
  isOpen: boolean;
  onClose: () => void;
  onJobAdded: () => void;
}

const NewJobModal: React.FC<NewJobModalProps> = ({ isOpen, onClose, onJobAdded }) => {
  const [formData, setFormData] = useState({
    ownerName: '',
    carModel: '',
    licensePlate: '',
    serviceDescription: '',
    estimatedDurationHours: 1,
    bayId: 1
  });

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    garageService.addJob({
      ...formData,
      bayId: Number(formData.bayId)
    });
    onJobAdded();
    onClose();
    // Reset form
    setFormData({
      ownerName: '',
      carModel: '',
      licensePlate: '',
      serviceDescription: '',
      estimatedDurationHours: 1,
      bayId: 1
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
        <div className="px-6 py-4 border-b flex justify-between items-center bg-slate-50">
          <h3 className="font-semibold text-lg text-slate-800">New Service Job</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X size={20} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Owner Name</label>
              <input
                required
                type="text"
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                value={formData.ownerName}
                onChange={e => setFormData({...formData, ownerName: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">License Plate</label>
              <input
                required
                type="text"
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                value={formData.licensePlate}
                onChange={e => setFormData({...formData, licensePlate: e.target.value})}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Car Model</label>
            <input
              required
              type="text"
              placeholder="e.g. 2020 Ford F-150"
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              value={formData.carModel}
              onChange={e => setFormData({...formData, carModel: e.target.value})}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Service Description</label>
            <textarea
              required
              rows={3}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              value={formData.serviceDescription}
              onChange={e => setFormData({...formData, serviceDescription: e.target.value})}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Assigned Bay</label>
              <select
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                value={formData.bayId}
                onChange={e => setFormData({...formData, bayId: Number(e.target.value)})}
              >
                {Array.from({ length: TOTAL_BAYS }).map((_, i) => (
                  <option key={i} value={i + 1}>Bay {i + 1}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Est. Duration (Hrs)</label>
              <input
                type="number"
                min="0.5"
                step="0.5"
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                value={formData.estimatedDurationHours}
                onChange={e => setFormData({...formData, estimatedDurationHours: Number(e.target.value)})}
              />
            </div>
          </div>

          <div className="pt-4 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
            >
              Add Job
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewJobModal;