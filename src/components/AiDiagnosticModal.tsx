import React, { useState } from 'react';
import { 
  Bot, 
  X, 
  AlertTriangle, 
  CheckCircle, 
  ShieldAlert, 
  Wrench, 
  Loader2,
  Sparkles,
  PhoneCall,
  HelpCircle,
  AlertOctagon,
  Info
} from 'lucide-react';
import { DiagnosticResult } from '../types';
import { saveDiagnosticToFirestore } from '../lib/firebase';

interface AiDiagnosticModalProps {
  isOpen: boolean;
  onClose: () => void;
  onBookService: (prefillNotes: string) => void;
}

export const AiDiagnosticModal: React.FC<AiDiagnosticModalProps> = ({
  isOpen,
  onClose,
  onBookService
}) => {
  const [applianceType, setApplianceType] = useState('Refrigerator');
  const [brand, setBrand] = useState('Samsung');
  const [modelNumber, setModelNumber] = useState('');
  const [errorCode, setErrorCode] = useState('');
  const [location, setLocation] = useState('');
  const [equipmentAge, setEquipmentAge] = useState('1 - 3 Years');
  
  // Specific symptom toggles
  const [isDead, setIsDead] = useState(false);
  const [compressorStatus, setCompressorStatus] = useState('Running Normally');
  const [unusualSmellNoise, setUnusualSmellNoise] = useState('None');
  const [waterIceIssues, setWaterIceIssues] = useState('None');
  const [recentPowerOutage, setRecentPowerOutage] = useState(false);
  const [attemptedRepairs, setAttemptedRepairs] = useState(false);
  const [problemDescription, setProblemDescription] = useState('');

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<DiagnosticResult | null>(null);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleRunDiagnostic = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!problemDescription && !errorCode && !isDead) {
      setErrorMsg('Please describe the problem, enter an error code, or indicate if the unit is dead.');
      return;
    }

    setErrorMsg('');
    setLoading(true);
    setResult(null);

    try {
      const res = await fetch('/api/diagnose', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          applianceType,
          brand,
          modelNumber,
          errorCode,
          location,
          equipmentAge,
          isDead,
          compressorStatus,
          unusualSmellNoise,
          waterIceIssues,
          recentPowerOutage,
          attemptedRepairs,
          problemDescription
        })
      });

      const data = await res.json();
      if (data.success && data.result) {
        setResult(data.result);
        // Save to Firestore
        saveDiagnosticToFirestore({
          equipmentType: `${brand} ${applianceType}`,
          modelNumber,
          errorCode,
          symptoms: problemDescription || compressorStatus || 'Cooling fault',
          diagnosis: data.result.diagnosisSummary || data.result.probableCause,
          urgency: data.result.urgencyLevel || 'Medium',
          recommendedAction: data.result.recommendedNextAction || data.result.recommendedAction
        }).catch(err => console.error("Firestore save diagnostic error:", err));
      } else {
        setErrorMsg(data.error || 'Failed to generate diagnostic analysis. Please try again.');
      }
    } catch (err) {
      setErrorMsg('Connection error. Please call +254 745 411 923 directly.');
    } finally {
      setLoading(false);
    }
  };

  const handleDispatchEngineer = () => {
    const prefill = `[Kenfoss Diagnostic Engineer Log]\nEquipment: ${brand} ${applianceType} (Model: ${modelNumber || 'N/A'})\nFault: ${result?.diagnosisSummary || result?.probableCause}\nTechnician Required: ${result?.technicianRequired ? 'YES' : 'NO'}\nRecommended Action: ${result?.recommendedNextAction || result?.recommendedAction}`;
    onClose();
    onBookService(prefill);
  };

  return (
    <div className="fixed inset-0 z-[100] bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 text-white rounded-2xl max-w-3xl w-full p-5 sm:p-7 space-y-5 relative shadow-2xl animate-in zoom-in-95 duration-200 my-auto max-h-[92vh] overflow-y-auto">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-full hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center space-x-3 border-b border-slate-800 pb-4">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#0057B8] to-[#00AEEF] flex items-center justify-center text-white shadow-lg shrink-0">
            <Bot className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-[11px] font-extrabold text-[#00AEEF] uppercase tracking-wider">Kenfoss AI Diagnostic Engineer</span>
              <span className="bg-emerald-500/20 text-emerald-400 text-[10px] font-extrabold px-2 py-0.5 rounded border border-emerald-500/40">
                SAFETY VIRTUAL ENGINE
              </span>
            </div>
            <h3 className="text-lg sm:text-xl font-black text-white">
              Instant Fault Diagnosis & Technical Troubleshooting
            </h3>
          </div>
        </div>

        {/* Diagnostic Form */}
        {!result && (
          <form onSubmit={handleRunDiagnostic} className="space-y-4">
            
            <div className="bg-slate-800/60 p-3 rounded-xl border border-slate-700/60 text-xs text-slate-300 flex items-start space-x-2">
              <Info className="w-4 h-4 text-[#00AEEF] shrink-0 mt-0.5" />
              <span>
                Our AI engineer diagnoses cooling, HVAC, and commercial refrigeration faults, recommends safe DIY troubleshooting, and identifies when an EPRA-certified Kenfoss technician is required.
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-300 mb-1">
                  Equipment Type <span className="text-red-400">*</span>
                </label>
                <select
                  value={applianceType}
                  onChange={(e) => setApplianceType(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 text-white text-xs rounded-lg p-2.5 outline-none focus:border-[#00AEEF]"
                >
                  <option value="Refrigerator">Refrigerator (Single/Double/Side-by-Side)</option>
                  <option value="Freezer">Freezer (Chest / Upright / Deep Freezer)</option>
                  <option value="Mini Refrigerator">Mini Refrigerator / Minibar / Wine Chiller</option>
                  <option value="Walk-in Cooler">Walk-in Cooler / Chill Vault</option>
                  <option value="Cold Room">Cold Room / Blast Freezer</option>
                  <option value="Display Chiller">Display Chiller / Supermarket Case</option>
                  <option value="Air Conditioner">Air Conditioner / HVAC / VRF System</option>
                  <option value="Dishwasher">Dishwasher (Domestic / Commercial)</option>
                  <option value="Washing Machine">Washing Machine</option>
                  <option value="Dryer">Clothes Dryer / Tumble Dryer</option>
                  <option value="Microwave">Microwave Oven (Domestic / Commercial)</option>
                  <option value="Oven">Electric / Gas Oven & Range</option>
                  <option value="Water Dispenser">Water Dispenser</option>
                  <option value="Ice Maker">Commercial Ice Maker</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-300 mb-1">
                  Brand / Manufacturer <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Samsung, LG, Ramtons, Bosch, Daikin"
                  value={brand}
                  onChange={(e) => setBrand(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 text-white text-xs rounded-lg p-2.5 outline-none focus:border-[#00AEEF]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-300 mb-1">
                  Model Number (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. RT28K, GS-31, FQ-89"
                  value={modelNumber}
                  onChange={(e) => setModelNumber(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 text-white text-xs rounded-lg p-2.5 outline-none focus:border-[#00AEEF] font-mono text-slate-200"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-300 mb-1">
                  Error Code Displayed
                </label>
                <input
                  type="text"
                  placeholder="e.g. E22, CH05, 5E, F4, Error 12"
                  value={errorCode}
                  onChange={(e) => setErrorCode(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 text-amber-300 font-mono font-bold text-xs rounded-lg p-2.5 outline-none focus:border-[#00AEEF]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-300 mb-1">
                  Customer Location
                </label>
                <input
                  type="text"
                  placeholder="e.g. Nairobi, Ruiru, Naivasha, Mombasa"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 text-white text-xs rounded-lg p-2.5 outline-none focus:border-[#00AEEF]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-300 mb-1">
                  Equipment Age
                </label>
                <select
                  value={equipmentAge}
                  onChange={(e) => setEquipmentAge(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 text-white text-xs rounded-lg p-2.5 outline-none focus:border-[#00AEEF]"
                >
                  <option value="Less than 1 Year">Less than 1 Year</option>
                  <option value="1 - 3 Years">1 - 3 Years</option>
                  <option value="3 - 5 Years">3 - 5 Years</option>
                  <option value="5+ Years">5+ Years</option>
                </select>
              </div>
            </div>

            {/* Quick Diagnostic Symptoms Selector */}
            <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800 space-y-3">
              <span className="text-xs font-bold text-[#00AEEF] uppercase tracking-wider block">
                Quick Symptom Checklist
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block text-slate-400 mb-1 text-[11px]">Compressor Sound / Behavior:</label>
                  <select
                    value={compressorStatus}
                    onChange={(e) => setCompressorStatus(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 text-white text-xs rounded-lg p-2 outline-none"
                  >
                    <option value="Running Normally">Running / Humming Normally</option>
                    <option value="Clicking Every 3-5 Min">Clicking Sound Every 3-5 Min (Start Relay / Overload)</option>
                    <option value="Dead Silent">Dead Silent (No Vibration / No Hum)</option>
                    <option value="Overheating Very Hot">Extremely Hot / Burning Touch</option>
                    <option value="Loud Knocking / Vibration">Loud Knocking or Metal Vibration</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 text-[11px]">Water Leakage or Ice Build-up:</label>
                  <select
                    value={waterIceIssues}
                    onChange={(e) => setWaterIceIssues(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 text-white text-xs rounded-lg p-2 outline-none"
                  >
                    <option value="None">None</option>
                    <option value="Water Leaking under unit">Water Leaking under cabinet / floor</option>
                    <option value="Heavy Ice in Freezer / Coils">Heavy Ice build-up on freezer walls or coils</option>
                    <option value="Food Freezing inside Fridge">Food freezing inside fresh food section</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                <label className="flex items-center space-x-2 text-[11px] text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isDead}
                    onChange={(e) => setIsDead(e.target.checked)}
                    className="rounded border-slate-700 bg-slate-800 text-[#00AEEF] focus:ring-0"
                  />
                  <span>Unit Completely Dead</span>
                </label>

                <label className="flex items-center space-x-2 text-[11px] text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={recentPowerOutage}
                    onChange={(e) => setRecentPowerOutage(e.target.checked)}
                    className="rounded border-slate-700 bg-slate-800 text-[#00AEEF] focus:ring-0"
                  />
                  <span>Recent Power Surge</span>
                </label>

                <label className="flex items-center space-x-2 text-[11px] text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={attemptedRepairs}
                    onChange={(e) => setAttemptedRepairs(e.target.checked)}
                    className="rounded border-slate-700 bg-slate-800 text-[#00AEEF] focus:ring-0"
                  />
                  <span>Prior Repair Attempt</span>
                </label>

                <div className="text-[11px] text-slate-400 self-center">
                  <span>Smell: </span>
                  <select
                    value={unusualSmellNoise}
                    onChange={(e) => setUnusualSmellNoise(e.target.value)}
                    className="bg-slate-800 text-white rounded px-1.5 py-0.5 text-[11px] border border-slate-700 outline-none"
                  >
                    <option value="None">None</option>
                    <option value="Burning Wire Smell">Burning Smell</option>
                    <option value="Bad Food Odor">Bad Odor</option>
                  </select>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-300 mb-1">
                Detailed Symptom Description
              </label>
              <textarea
                rows={2}
                placeholder="Describe when the issue began, temperature behavior, whether freezer freezes while fridge stays warm, alarms, etc."
                value={problemDescription}
                onChange={(e) => setProblemDescription(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 text-white text-xs rounded-lg p-2.5 outline-none focus:border-[#00AEEF]"
              />
            </div>

            {errorMsg && (
              <div className="p-3 bg-red-950/80 border border-red-800 text-red-200 text-xs rounded-lg flex items-center space-x-2">
                <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-[#0057B8] to-[#00AEEF] hover:from-[#00AEEF] hover:to-[#0057B8] text-white font-bold text-xs rounded-xl shadow-lg transition-all flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-50 uppercase tracking-wider"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                  <span>Kenfoss AI Engineer Analyzing Fault Matrix...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  <span>Diagnose Fault & Recommend Safe Solution</span>
                </>
              )}
            </button>
          </form>
        )}

        {/* Diagnostic Results View */}
        {result && (
          <div className="space-y-4 animate-in fade-in duration-300">
            
            {/* Header / Severity & Confidence */}
            <div className={`p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
              result.severity === 'Emergency Critical' || result.severity === 'High'
                ? 'bg-red-950/80 border-red-800 text-red-200'
                : 'bg-amber-950/80 border-amber-800 text-amber-200'
            }`}>
              <div className="flex items-center space-x-3">
                <ShieldAlert className="w-6 h-6 text-red-400 shrink-0" />
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-[10px] font-black uppercase tracking-wider opacity-80">ENGINEERING DIAGNOSIS</span>
                    <span className="bg-slate-900/80 text-white text-[10px] font-bold px-2 py-0.5 rounded border border-slate-700">
                      Confidence: {result.confidenceLevel || '80% (High)'}
                    </span>
                  </div>
                  <h4 className="text-base font-bold text-white mt-0.5">{result.appliance}</h4>
                </div>
              </div>

              <div className="flex items-center space-x-2 self-start sm:self-auto">
                <span className={`text-xs font-bold px-3 py-1 rounded-lg border ${
                  result.technicianRequired
                    ? 'bg-red-900/80 text-white border-red-700'
                    : 'bg-emerald-900/80 text-emerald-200 border-emerald-700'
                }`}>
                  {result.technicianRequired ? 'Technician Required: YES' : 'Technician Required: NO'}
                </span>
              </div>
            </div>

            {/* Diagnosis Summary & Root Cause */}
            <div className="bg-slate-800 p-4 rounded-xl border border-slate-700 space-y-3 text-xs">
              
              <div>
                <span className="text-[#00AEEF] font-bold text-[11px] uppercase tracking-wider block mb-1">
                  Diagnosis Summary
                </span>
                <p className="text-white font-semibold text-sm bg-slate-900/80 p-2.5 rounded-lg border border-slate-700">
                  {result.diagnosisSummary || result.probableCause}
                </p>
              </div>

              <div>
                <span className="text-slate-400 font-bold text-[11px] uppercase tracking-wider block mb-1">
                  Most Likely Root Cause
                </span>
                <p className="text-slate-200 font-normal leading-relaxed">
                  {result.probableCause}
                </p>
              </div>

              {/* Missing Information / Follow-up Questions */}
              {result.missingInfoQuestions && result.missingInfoQuestions.length > 0 && (
                <div className="bg-amber-950/40 border border-amber-800/60 p-3 rounded-lg space-y-1">
                  <div className="flex items-center space-x-1.5 text-amber-300 font-bold text-[11px]">
                    <HelpCircle className="w-3.5 h-3.5" />
                    <span>Follow-Up Clarifications Needed for Exact Diagnosis:</span>
                  </div>
                  <ul className="list-disc list-inside text-amber-200/90 text-[11px] space-y-0.5 pl-1">
                    {result.missingInfoQuestions.map((q, idx) => (
                      <li key={idx}>{q}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Safe Troubleshooting Steps */}
              {result.safeTroubleshootingSteps && result.safeTroubleshootingSteps.length > 0 && (
                <div className="pt-2 border-t border-slate-700">
                  <span className="text-emerald-400 font-bold text-[11px] uppercase tracking-wider block mb-2 flex items-center space-x-1">
                    <CheckCircle className="w-3.5 h-3.5" />
                    <span>Safe DIY Troubleshooting Steps (Customer Level)</span>
                  </span>
                  <div className="space-y-1.5">
                    {result.safeTroubleshootingSteps.map((step, idx) => (
                      <div key={idx} className="bg-slate-900/90 p-2 rounded-lg border border-slate-700/80 flex items-start space-x-2 text-slate-200 text-xs">
                        <span className="bg-emerald-500/20 text-emerald-400 font-bold text-[10px] w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                          {idx + 1}
                        </span>
                        <span>{step}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* When to Stop Troubleshooting Safety Gate */}
              {result.whenToStopTroubleshooting && (
                <div className="p-3 bg-red-950/70 border border-red-800/80 rounded-xl space-y-1">
                  <div className="flex items-center space-x-1.5 text-red-300 font-bold text-[11px] uppercase tracking-wider">
                    <AlertOctagon className="w-4 h-4 text-red-400 shrink-0" />
                    <span>When to Stop Troubleshooting Immediately:</span>
                  </div>
                  <p className="text-red-200 text-xs leading-relaxed font-medium">
                    {result.whenToStopTroubleshooting}
                  </p>
                </div>
              )}

              {/* Metrics Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-700 text-xs">
                <div>
                  <span className="text-slate-400 block mb-0.5 font-medium">Repair Complexity:</span>
                  <span className="text-white font-bold bg-slate-900 px-2.5 py-1 rounded border border-slate-700 inline-block">
                    {result.repairComplexity || (result.canSelfFix ? 'Minor DIY' : 'Moderate Field Repair')}
                  </span>
                </div>

                <div>
                  <span className="text-slate-400 block mb-0.5 font-medium">Technician Requirement Reason:</span>
                  <p className="text-slate-300 text-[11px] leading-snug">
                    {result.technicianRequiredReason || result.recommendedAction}
                  </p>
                </div>
              </div>

              {result.suggestedParts && result.suggestedParts.length > 0 && (
                <div className="pt-2 border-t border-slate-700">
                  <span className="text-slate-400 block mb-1 font-medium">Potential Spare Parts Required:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {result.suggestedParts.map((part, idx) => (
                      <span key={idx} className="bg-slate-900 text-slate-300 px-2.5 py-1 rounded-md text-[11px] font-medium border border-slate-700">
                        • {part}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Mandatory Safety Notice */}
            {result.safetyWarning && (
              <div className="p-3 bg-amber-950/60 border border-amber-800/80 text-amber-200 text-xs rounded-xl flex items-start space-x-2">
                <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <span><strong>Safety Protocol:</strong> {result.safetyWarning}</span>
              </div>
            )}

            {/* Mandatory Closing Statement Box */}
            <div className="p-3.5 bg-blue-950/60 border border-blue-800/80 text-blue-200 text-xs rounded-xl flex items-start space-x-2.5">
              <PhoneCall className="w-4 h-4 text-[#00AEEF] shrink-0 mt-0.5" />
              <p className="font-medium italic leading-relaxed text-slate-200">
                "{result.closingStatement || 'If the issue persists after these checks, we recommend booking a Kenfoss Refrigeration Limited technician for a professional diagnosis and repair.'}"
              </p>
            </div>

            {/* Action buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <button
                onClick={() => setResult(null)}
                className="py-3 px-4 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-xl border border-slate-700 transition-colors"
              >
                Diagnose Another Fault
              </button>

              <button
                onClick={handleDispatchEngineer}
                className="py-3 px-4 bg-[#FF7A00] hover:bg-[#e06c00] text-white text-xs font-bold rounded-xl shadow-lg transition-colors flex items-center justify-center space-x-2 cursor-pointer uppercase tracking-wider"
              >
                <Wrench className="w-4 h-4" />
                <span>Book Kenfoss Technician</span>
              </button>
            </div>

          </div>
        )}

      </div>
    </div>
  );
};

