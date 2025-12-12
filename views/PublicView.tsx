import React, { useEffect, useState } from 'react';
import { garageService } from '../services/garageService';
import { Job, JobStatus } from '../types';
import { TOTAL_BAYS } from '../constants';
import { Car, Clock, ChevronRight } from 'lucide-react';

const PublicView: React.FC = () => {
  const [bayData, setBayData] = useState<{bayId: number, active: Job | undefined, queueLength: number}[]>([]);

  useEffect(() => {
    // Poll for updates every 5 seconds to simulate real-time public board
    const fetch = () => {
      const data = Array.from({length: TOTAL_BAYS}, (_, i) => {
        const bayId = i + 1;
        return {
          bayId,
          active: garageService.getActiveJob(bayId),
          queueLength: garageService.getQueue(bayId).length
        };
      });
      setBayData(data);
    };
    
    fetch();
    const interval = setInterval(fetch, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="bg-slate-900 text-white py-12 px-6 text-center">
        <h1 className="text-3xl md:text-4xl font-bold mb-4">AutoFlow Service Status</h1>
        <p className="text-slate-400 max-w-2xl mx-auto">
          Check the real-time status of our service bays. If you have an appointment, find your bay assignment below.
        </p>
      </div>

      <div className="max-w-6xl mx-auto p-6 -mt-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {bayData.map(({bayId, active, queueLength}) => (
            <div key={bayId} className="bg-white rounded-xl shadow-lg border border-slate-100 overflow-hidden flex flex-col">
              <div className="bg-slate-50 p-4 border-b flex justify-between items-center">
                <h3 className="font-bold text-lg text-slate-800">Bay {bayId}</h3>
                <div className={`w-3 h-3 rounded-full ${active ? 'bg-red-500' : 'bg-emerald-500'}`} />
              </div>
              
              <div className="p-6 flex-1 flex flex-col items-center text-center justify-center space-y-4">
                {active ? (
                  <>
                    <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center text-blue-600 mb-2">
                      <Car size={32} />
                    </div>
                    <div>
                      <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold mb-1">Now Servicing</p>
                      <p className="text-xl font-bold text-slate-800">{active.carModel}</p>
                      <p className="text-sm text-slate-500 mt-1">
                        Est. Completion: {new Date(Date.now() + active.estimatedDurationHours * 3600000).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                      </p>
                    </div>
                  </>
                ) : (
                  <>
                     <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-600 mb-2">
                      <Clock size={32} />
                    </div>
                    <div>
                      <p className="text-xl font-bold text-emerald-600">Available</p>
                      <p className="text-sm text-slate-500 mt-1">Ready for next vehicle</p>
                    </div>
                  </>
                )}
              </div>

              <div className="bg-slate-50 p-4 border-t flex items-center justify-between text-sm">
                <span className="text-slate-600">In Queue:</span>
                <span className="font-bold text-slate-900 bg-white px-3 py-1 rounded border shadow-sm">
                  {queueLength} vehicles
                </span>
              </div>
            </div>
          ))}

            {/* Simulated Booking Call to Action */}
            <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl shadow-lg text-white p-8 flex flex-col justify-center items-center text-center">
                <h3 className="text-2xl font-bold mb-2">Need Service?</h3>
                <p className="text-blue-100 mb-6">Our mechanics are ready to help. Book your slot online today.</p>
                <button className="bg-white text-blue-700 px-6 py-3 rounded-full font-bold hover:bg-blue-50 transition-colors flex items-center gap-2">
                    Book Appointment <ChevronRight size={18} />
                </button>
            </div>
        </div>
      </div>
      
      <div className="text-center py-8 text-slate-400 text-sm">
        <p>&copy; 2024 AutoFlow Garage Management. Updates automatically.</p>
      </div>
    </div>
  );
};

export default PublicView;