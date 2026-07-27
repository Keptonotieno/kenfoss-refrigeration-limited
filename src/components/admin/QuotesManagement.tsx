import React, { useState } from 'react';
import { useAdmin } from '../../context/AdminContext';
import { QuoteRecord, QuoteStatus } from '../../types';
import { 
  FileSpreadsheet, 
  Search, 
  DollarSign, 
  Send, 
  X, 
  CheckCircle2, 
  Clock, 
  Building2, 
  Mail, 
  Phone, 
  FileText
} from 'lucide-react';

export const QuotesManagement: React.FC = () => {
  const { quotes, updateQuoteStatus } = useAdmin();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedQuote, setSelectedQuote] = useState<QuoteRecord | null>(null);

  // Response form state inside detail modal
  const [quoteAmountInput, setQuoteAmountInput] = useState<number>(0);
  const [responseNotesInput, setResponseNotesInput] = useState<string>('');

  const filteredQuotes = quotes.filter(q => {
    return (
      q.rfqRef.toLowerCase().includes(searchTerm.toLowerCase()) ||
      q.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      q.contactPerson.toLowerCase().includes(searchTerm.toLowerCase()) ||
      q.projectType.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const handleOpenDetail = (q: QuoteRecord) => {
    setSelectedQuote(q);
    setQuoteAmountInput(q.quoteAmount || 0);
    setResponseNotesInput(q.responseNotes || '');
  };

  const handleIssueQuote = () => {
    if (selectedQuote) {
      updateQuoteStatus(selectedQuote.id, 'Quote Issued', quoteAmountInput, responseNotesInput);
      setSelectedQuote(null);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6">
        <h1 className="text-xl font-black text-white flex items-center gap-2">
          <FileSpreadsheet className="w-6 h-6 text-purple-400" />
          Commercial RFQ & Quotation Management
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Review commercial refrigeration & HVAC tenders, perform heat load estimations, and issue formal BOQ proposals.
        </p>
      </div>

      {/* Search Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
        <div className="relative max-w-md">
          <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search RFQ #, company, project type..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-purple-500"
          />
        </div>
      </div>

      {/* QUOTES TABLE */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] font-extrabold tracking-wider border-b border-slate-800">
              <tr>
                <th className="p-4">RFQ Ref #</th>
                <th className="p-4">Company & Contact</th>
                <th className="p-4">Project Scope</th>
                <th className="p-4">Quoted Amount (KSh)</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {filteredQuotes.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-500 text-xs">
                    No quotation requests found.
                  </td>
                </tr>
              ) : (
                filteredQuotes.map((q) => (
                  <tr key={q.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="p-4">
                      <span className="font-mono font-bold text-purple-400 text-sm block">{q.rfqRef}</span>
                      <span className="text-[10px] text-slate-500">{new Date(q.createdAt).toLocaleDateString()}</span>
                    </td>

                    <td className="p-4 space-y-0.5">
                      <div className="font-bold text-white text-sm flex items-center gap-1">
                        <Building2 className="w-3.5 h-3.5 text-slate-400" />
                        {q.companyName}
                      </div>
                      <div className="text-[11px] text-slate-400">{q.contactPerson} ({q.phone})</div>
                    </td>

                    <td className="p-4 font-medium text-slate-200 max-w-[220px] truncate">
                      {q.projectType}
                    </td>

                    <td className="p-4">
                      {q.quoteAmount ? (
                        <span className="font-mono font-bold text-emerald-400 text-sm">
                          KSh {q.quoteAmount.toLocaleString()}
                        </span>
                      ) : (
                        <span className="text-slate-500 italic text-[11px]">Pending Pricing</span>
                      )}
                    </td>

                    <td className="p-4">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold inline-block ${
                        q.status === 'Received' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                        q.status === 'Under Review' ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30' :
                        q.status === 'Quote Issued' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' :
                        q.status === 'Approved' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                        'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                      }`}>
                        {q.status}
                      </span>
                    </td>

                    <td className="p-4 text-right">
                      <button
                        onClick={() => handleOpenDetail(q)}
                        className="px-3 py-1 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl text-xs cursor-pointer"
                      >
                        Review & Quote
                      </button>
                    </td>

                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* DETAIL & QUOTE ISSUANCE MODAL */}
      {selectedQuote && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 text-slate-100 rounded-3xl max-w-xl w-full p-6 space-y-6 shadow-2xl relative">
            <button
              onClick={() => setSelectedQuote(null)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <span className="font-mono text-xs font-bold text-purple-400">{selectedQuote.rfqRef}</span>
              <h2 className="text-xl font-black text-white">{selectedQuote.companyName}</h2>
              <p className="text-xs text-slate-400">Contact: {selectedQuote.contactPerson} | {selectedQuote.email} | {selectedQuote.phone}</p>
            </div>

            <div className="space-y-2">
              <h4 className="text-xs font-extrabold uppercase text-slate-400">Project Type & Technical Requirements</h4>
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs text-slate-300 leading-relaxed space-y-1">
                <div className="font-bold text-white">{selectedQuote.projectType}</div>
                <p>{selectedQuote.specs || 'No specific technical specifications provided.'}</p>
              </div>
            </div>

            {/* Quote Issuance Form */}
            <div className="space-y-4 pt-4 border-t border-slate-800">
              <h4 className="text-xs font-extrabold uppercase text-purple-400 flex items-center gap-1">
                <DollarSign className="w-4 h-4" /> Issue Official Quotation (KSh)
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[11px] font-extrabold uppercase text-slate-300">Quoted Total Amount (KSh)</label>
                  <input
                    type="number"
                    value={quoteAmountInput}
                    onChange={(e) => setQuoteAmountInput(Number(e.target.value))}
                    placeholder="e.g., 2850000"
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm font-bold text-emerald-400 focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-extrabold uppercase text-slate-300">Status</label>
                  <select
                    value={selectedQuote.status}
                    onChange={(e) => updateQuoteStatus(selectedQuote.id, e.target.value as QuoteStatus)}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-purple-500"
                  >
                    <option value="Received">Received</option>
                    <option value="Under Review">Under Review</option>
                    <option value="Quote Issued">Quote Issued</option>
                    <option value="Approved">Approved</option>
                    <option value="Rejected">Rejected</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-extrabold uppercase text-slate-300">Engineering Proposal Notes / BOQ Details</label>
                <textarea
                  rows={3}
                  value={responseNotesInput}
                  onChange={(e) => setResponseNotesInput(e.target.value)}
                  placeholder="e.g. Turnkey proposal includes Copeland Digital Scroll rack, 100mm PUF panels, installation labor, and 12-month EPRA warranty."
                  className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  onClick={() => setSelectedQuote(null)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 font-bold text-xs rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleIssueQuote}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs rounded-xl shadow-lg flex items-center space-x-1 cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Issue Quotation to Client</span>
                </button>
              </div>

            </div>

          </div>
        </div>
      )}

    </div>
  );
};
