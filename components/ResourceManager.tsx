import React, { useState } from 'react';

interface Resource {
  id: string;
  name: string;
  type: 'classroom' | 'equipment' | 'lab' | 'other';
  capacity: number;
  features: string[];
  availability: {
    day: string;
    timeSlots: { start: string; end: string }[];
  }[];
  status: 'available' | 'maintenance' | 'reserved';
  location: string;
  notes: string;
}

interface ResourceManagerProps {
  onResourceUpdate: (resources: Resource[]) => void;
  existingResources?: Resource[];
}

export function ResourceManager({ onResourceUpdate, existingResources = [] }: ResourceManagerProps) {
  const [resources, setResources] = useState<Resource[]>(existingResources);
  const [newResource, setNewResource] = useState<Partial<Resource>>({
    name: '',
    type: 'classroom',
    capacity: 0,
    features: [],
    availability: [],
    status: 'available',
    location: '',
    notes: ''
  });
  const [newFeature, setNewFeature] = useState('');

  const handleAddResource = () => {
    if (!newResource.name) return;

    const resource: Resource = {
      id: Date.now().toString(),
      name: newResource.name,
      type: newResource.type || 'classroom',
      capacity: newResource.capacity || 0,
      features: newResource.features || [],
      availability: newResource.availability || [],
      status: newResource.status || 'available',
      location: newResource.location || '',
      notes: newResource.notes || ''
    };

    const updatedResources = [...resources, resource];
    setResources(updatedResources);
    onResourceUpdate(updatedResources);

    // Reset form
    setNewResource({
      name: '',
      type: 'classroom',
      capacity: 0,
      features: [],
      availability: [],
      status: 'available',
      location: '',
      notes: ''
    });
  };

  const handleAddFeature = () => {
    if (!newFeature.trim()) return;
    setNewResource(prev => ({
      ...prev,
      features: [...(prev.features || []), newFeature.trim()]
    }));
    setNewFeature('');
  };

  const handleRemoveFeature = (feature: string) => {
    setNewResource(prev => ({
      ...prev,
      features: (prev.features || []).filter(f => f !== feature)
    }));
  };

  const handleDeleteResource = (id: string) => {
    const updatedResources = resources.filter(resource => resource.id !== id);
    setResources(updatedResources);
    onResourceUpdate(updatedResources);
  };

  return (
    <div className="bg-slate-800 p-6 rounded-xl shadow-2xl">
      <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-cyan-300 mb-6">
        Resource Management
      </h2>

      {/* Add New Resource Form */}
      <div className="bg-slate-700 p-4 rounded-lg mb-6">
        <h3 className="text-lg font-semibold text-sky-400 mb-4">Add New Resource</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-slate-300 mb-2">Resource Name</label>
            <input
              type="text"
              value={newResource.name}
              onChange={(e) => setNewResource(prev => ({ ...prev, name: e.target.value }))}
              className="w-full px-3 py-2 bg-slate-600 border border-slate-500 rounded-lg text-white"
              placeholder="e.g., Science Lab 1"
            />
          </div>

          <div>
            <label className="block text-slate-300 mb-2">Resource Type</label>
            <select
              value={newResource.type}
              onChange={(e) => setNewResource(prev => ({ ...prev, type: e.target.value as Resource['type'] }))}
              className="w-full px-3 py-2 bg-slate-600 border border-slate-500 rounded-lg text-white"
            >
              <option value="classroom">Classroom</option>
              <option value="lab">Laboratory</option>
              <option value="equipment">Equipment</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div>
            <label className="block text-slate-300 mb-2">Capacity</label>
            <input
              type="number"
              value={newResource.capacity || ''}
              onChange={(e) => setNewResource(prev => ({ ...prev, capacity: parseInt(e.target.value) || 0 }))}
              className="w-full px-3 py-2 bg-slate-600 border border-slate-500 rounded-lg text-white"
              min="0"
            />
          </div>

          <div>
            <label className="block text-slate-300 mb-2">Location</label>
            <input
              type="text"
              value={newResource.location}
              onChange={(e) => setNewResource(prev => ({ ...prev, location: e.target.value }))}
              className="w-full px-3 py-2 bg-slate-600 border border-slate-500 rounded-lg text-white"
              placeholder="e.g., Building A, Floor 2"
            />
          </div>

          <div>
            <label className="block text-slate-300 mb-2">Status</label>
            <select
              value={newResource.status}
              onChange={(e) => setNewResource(prev => ({ ...prev, status: e.target.value as Resource['status'] }))}
              className="w-full px-3 py-2 bg-slate-600 border border-slate-500 rounded-lg text-white"
            >
              <option value="available">Available</option>
              <option value="maintenance">Under Maintenance</option>
              <option value="reserved">Reserved</option>
            </select>
          </div>

          <div className="md:col-span-2">
            <label className="block text-slate-300 mb-2">Features</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={newFeature}
                onChange={(e) => setNewFeature(e.target.value)}
                className="flex-1 px-3 py-2 bg-slate-600 border border-slate-500 rounded-lg text-white"
                placeholder="Add a feature (e.g., Projector, Smart Board)"
                onKeyPress={(e) => e.key === 'Enter' && handleAddFeature()}
              />
              <button
                onClick={handleAddFeature}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
              >
                Add
              </button>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {newResource.features?.map((feature, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-slate-600 rounded-full text-sm flex items-center gap-2"
                >
                  {feature}
                  <button
                    onClick={() => handleRemoveFeature(feature)}
                    className="text-red-400 hover:text-red-300"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>

          <div className="md:col-span-2">
            <label className="block text-slate-300 mb-2">Notes</label>
            <textarea
              value={newResource.notes}
              onChange={(e) => setNewResource(prev => ({ ...prev, notes: e.target.value }))}
              className="w-full px-3 py-2 bg-slate-600 border border-slate-500 rounded-lg text-white"
              placeholder="Additional notes about the resource"
              rows={3}
            />
          </div>
        </div>

        <button
          onClick={handleAddResource}
          className="mt-4 px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors"
        >
          Add Resource
        </button>
      </div>

      {/* Resources List */}
      {resources.length > 0 && (
        <div className="bg-slate-700 p-4 rounded-lg">
          <h3 className="text-lg font-semibold text-sky-400 mb-4">Current Resources</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {resources.map((resource) => (
              <div key={resource.id} className="bg-slate-600 p-4 rounded-lg">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h4 className="text-lg font-medium text-slate-200">{resource.name}</h4>
                    <span className={`text-sm px-2 py-1 rounded ${
                      resource.status === 'available' ? 'bg-green-600' :
                      resource.status === 'maintenance' ? 'bg-yellow-600' :
                      'bg-red-600'
                    }`}>
                      {resource.status}
                    </span>
                  </div>
                  <button
                    onClick={() => handleDeleteResource(resource.id)}
                    className="text-red-400 hover:text-red-300"
                  >
                    ×
                  </button>
                </div>
                <div className="text-sm text-slate-300 space-y-1">
                  <p>Type: {resource.type}</p>
                  <p>Capacity: {resource.capacity}</p>
                  <p>Location: {resource.location}</p>
                  {resource.features.length > 0 && (
                    <div>
                      <p className="font-medium">Features:</p>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {resource.features.map((feature, index) => (
                          <span
                            key={index}
                            className="px-2 py-1 bg-slate-700 rounded-full text-xs"
                          >
                            {feature}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  {resource.notes && <p className="mt-2 italic">{resource.notes}</p>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
} 