import React, { useState } from 'react';
import { useAdmin } from '../../context/AdminContext';
import { BookingRecord } from '../../types';
import { 
  Wrench, 
  CheckCircle2, 
  Clock, 
  Image as ImageIcon, 
  FileText, 
  Phone, 
  MapPin, 
  Upload, 
  X, 
  AlertCircle,
  Navigation,
  Compass,
  Crosshair
} from 'lucide-react';
import { getCountyCoords } from '../../data/countyCoordinates';

function getHaversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return Math.round(R * c * 10) / 10;
}

export const TechnicianPortalView: React.FC = () => {
  const { bookings, currentUser, updateTechnicianJobNotes, updateBookingStatus } = useAdmin();

  // Ruiru HQ Base Coordinates
  const HQ_LAT = -1.1461;
  const HQ_LNG = 36.9602;

  // Filter jobs for logged in technician, or show all if admin/manager reviewing
  const myJobs = bookings.filter(b => {
    if (currentUser?.role === 'Technician') {
      return b.assignedTechnicianId === currentUser.id || b.assignedTechnicianName?.includes(currentUser.name.split(' ')[0]);
    }
    return b.assignedTechnicianId !== undefined;
  });

  const [activeJob, setActiveJob] = useState<BookingRecord | null>(null);
  const [techNotes, setTechNotes] = useState('');
  const [beforeImgUrl, setBeforeImgUrl] = useState('');
  const [afterImgUrl, setAfterImgUrl] = useState('');

  const handleOpenJobReport = (job: BookingRecord) => {
    setActiveJob(job);
    setTechNotes(job.technicianNotes || '');
    setBeforeImgUrl(job.beforeImages?.[0] || '');
    setAfterImgUrl(job.afterImages?.[0] || '');
  };

  const handleSaveReport = (markCompleted: boolean = false) => {
    if (!activeJob) return;

    updateTechnicianJobNotes(
      activeJob.id,
      techNotes,
      beforeImgUrl ? [beforeImgUrl] : [],
      afterImgUrl ? [afterImgUrl] : []
    );

    if (markCompleted) {
      updateBookingStatus(activeJob.id, 'Completed');
    } else {
      updateBookingStatus(activeJob.id, 'In Progress');
    }

    setActiveJob(null);
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-2xl border border-emerald-500/30">
            <Wrench className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-black text-white">Technician Field Operations & Navigation Portal</h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Assigned jobs for <strong className="text-white">{currentUser?.name}</strong>. View customer location maps, turn-by-turn navigation, and log repair reports.
            </p>
          </div>
        </div>
      </div>

      {/* JOBS CARDS LIST */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {myJobs.length === 0 ? (
          <div className="col-span-2 p-12 text-center bg-slate-900 border border-slate-800 rounded-3xl space-y-2">
            <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
            <h3 className="text-sm font-bold text-white">No Assigned Field Jobs Pending</h3>
            <p className="text-xs text-slate-400">All assigned refrigeration service jobs are currently up to date.</p>
          </div>
        ) : (
          myJobs.map(job => {
            const countyCoords = getCountyCoords(job.county || job.location || 'Kiambu');
            const targetLat = job.latitude || countyCoords.lat;
            const targetLng = job.longitude || countyCoords.lng;
            const distanceKm = getHaversineDistance(HQ_LAT, HQ_LNG, targetLat, targetLng);
            
            const navUrl = `https://www.google.com/maps/dir/?api=1&destination=${targetLat},${targetLng}`;

            return (
              <div key={job.id} className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-lg flex flex-col justify-between">
                <div className="space-y-3">
                  
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="font-mono text-xs font-bold text-blue-400">{job.bookingRef}</span>
                      <h3 className="text-base font-black text-white">{job.serviceType}</h3>
                    </div>

                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase ${
                      job.status === 'Completed' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40' :
                      job.status === 'In Progress' ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40' :
                      'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                    }`}>
                      {job.status}
                    </span>
                  </div>

                  <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800 text-xs space-y-2">
                    <div className="flex items-center justify-between text-white font-bold">
                      <span>{job.fullName}</span>
                      <a href={`tel:${job.phone}`} className="text-blue-400 hover:underline flex items-center gap-1 font-bold">
                        <Phone className="w-3.5 h-3.5 text-blue-400" /> {job.phone}
                      </a>
                    </div>

                    <div className="space-y-1 text-slate-300">
                      <p className="font-bold text-cyan-300 flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-[#FF7A00]" /> 
                        {job.county ? `${job.county} County` : 'Location'}
                        {job.subCounty ? ` • ${job.subCounty} Sub-County` : ''}
                        {job.ward ? ` (${job.ward} Ward)` : ''}: {job.town || job.location}
                      </p>

                      {job.exactAddress && (
                        <p className="text-[11px] text-slate-400 pl-4">
                          <strong>Address:</strong> {job.exactAddress}
                        </p>
                      )}

                      {job.landmark && (
                        <p className="text-[11px] text-slate-400 pl-4">
                          <strong>Landmark:</strong> {job.landmark}
                        </p>
                      )}

                      <div className="flex items-center justify-between pt-1 border-t border-slate-800 text-[10px]">
                        <span className="text-slate-400 flex items-center gap-1">
                          <Compass className="w-3 h-3 text-emerald-400" />
                          Distance from Ruiru HQ: <strong className="text-emerald-400">{distanceKm} km</strong>
                        </span>

                        {job.gpsCaptured && (
                          <span className="text-emerald-400 font-bold flex items-center gap-1 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800">
                            <Crosshair className="w-3 h-3" /> Live GPS Pin Attached
                          </span>
                        )}
                      </div>
                    </div>

                    <p className="text-slate-300 italic pt-1 border-t border-slate-900">
                      "{job.notes || 'No customer notes'}"
                    </p>
                  </div>

                  {job.technicianNotes && (
                    <div className="p-3 bg-blue-950/20 border border-blue-900/40 rounded-2xl text-xs space-y-1">
                      <span className="text-[10px] font-bold text-blue-400">My Repair Log:</span>
                      <p className="text-slate-200">{job.technicianNotes}</p>
                    </div>
                  )}

                </div>

                <div className="pt-3 border-t border-slate-800 flex flex-wrap items-center justify-between gap-2">
                  <a
                    href={navUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs rounded-xl flex items-center gap-1.5 shadow transition-transform hover:scale-105"
                  >
                    <Navigation className="w-4 h-4 text-amber-300" />
                    <span>Navigate on Google Maps</span>
                  </a>

                  <button
                    onClick={() => handleOpenJobReport(job)}
                    className="px-3.5 py-2 bg-[#0057B8] hover:bg-blue-600 text-white font-bold text-xs rounded-xl flex items-center gap-1 cursor-pointer"
                  >
                    <Wrench className="w-3.5 h-3.5" />
                    <span>Update Repair Report</span>
                  </button>
                </div>

              </div>
            );
          })
        )}
      </div>

      {/* UPDATE JOB REPORT MODAL */}
      {activeJob && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 text-slate-100 rounded-3xl max-w-lg w-full p-6 space-y-5 shadow-2xl relative">
            <button
              onClick={() => setActiveJob(null)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <span className="font-mono text-xs text-blue-400">{activeJob.bookingRef}</span>
              <h3 className="text-lg font-black text-white">Technician Field Repair Form</h3>
              <p className="text-xs text-slate-400">{activeJob.serviceType} for {activeJob.fullName}</p>
            </div>

            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300">Repair & Diagnostic Notes</label>
                <textarea
                  rows={4}
                  value={techNotes}
                  onChange={(e) => setTechNotes(e.target.value)}
                  placeholder="e.g. Diagnosed faulty bitzer thermal overload relay. Replaced with genuine OEM part. Checked suction pressure at 4.2 bar."
                  className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-300">Before Image URL</label>
                  <input
                    type="url"
                    value={beforeImgUrl}
                    onChange={(e) => setBeforeImgUrl(e.target.value)}
                    placeholder="https://..."
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-300">After Image URL</label>
                  <input
                    type="url"
                    value={afterImgUrl}
                    onChange={(e) => setAfterImgUrl(e.target.value)}
                    placeholder="https://..."
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-end gap-2 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setActiveJob(null)}
                className="px-4 py-2 bg-slate-800 text-slate-300 font-bold text-xs rounded-xl cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={() => handleSaveReport(false)}
                className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs rounded-xl cursor-pointer"
              >
                Save Progress (In Progress)
              </button>

              <button
                type="button"
                onClick={() => handleSaveReport(true)}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl cursor-pointer"
              >
                Mark Job Completed
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
