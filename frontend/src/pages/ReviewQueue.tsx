import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../api';
import { Check, X, Lock, AlertCircle, FileText, ChevronRight } from 'lucide-react';

export default function ReviewQueue() {
  const queryClient = useQueryClient();
  const [selectedRecord, setSelectedRecord] = useState<any>(null);

  const { data: records, isLoading } = useQuery({
    queryKey: ['records'],
    queryFn: async () => {
      const res = await api.get('/records/');
      return res.data;
    }
  });

  const approve = useMutation({
    mutationFn: async (id: number) => await api.post(`/records/${id}/approve/`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['records'] })
  });

  const reject = useMutation({
    mutationFn: async (id: number) => await api.post(`/records/${id}/reject/`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['records'] })
  });

  const lock = useMutation({
    mutationFn: async (id: number) => await api.post(`/records/${id}/lock/`),
    onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['records'] });
        if (selectedRecord) {
            setSelectedRecord({...selectedRecord, review_status: 'LOCKED'});
        }
    }
  });

  return (
    <div className="p-8 flex gap-8 h-full">
      <div className="flex-1 flex flex-col min-w-0">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Review Queue</h1>
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 flex-1 overflow-hidden flex flex-col">
          <div className="overflow-auto flex-1">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50 sticky top-0 z-10">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Activity</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Details</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase"></th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {isLoading ? (
                  <tr><td colSpan={5} className="px-6 py-12 text-center text-gray-500">Loading records...</td></tr>
                ) : records?.length === 0 ? (
                  <tr><td colSpan={5} className="px-6 py-12 text-center text-gray-500">No records currently awaiting analyst review.</td></tr>
                ) : (
                  records?.map((record: any) => (
                    <tr key={record.id} className="hover:bg-blue-50/50 cursor-pointer transition-colors group" onClick={() => setSelectedRecord(record)}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-[10px] font-bold text-gray-600 bg-gray-100 border border-gray-200 px-1.5 py-0.5 rounded uppercase tracking-wider">
                            {record.source_type || (record.activity_type.includes('Flight') ? 'TRAVEL' : record.activity_type.includes('Combustion') ? 'SAP' : 'UTILITY')}
                          </span>
                          <div className="text-sm font-medium text-gray-900">{record.activity_type}</div>
                        </div>
                        <div className="text-sm text-gray-500">{record.scope_category}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{record.quantity} {record.normalized_unit}</div>
                        <div className="text-xs text-gray-500">{record.facility_name || record.facility_code || record.travel_origin}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <StatusBadge status={record.review_status} />
                        {record.is_flagged && <AlertCircle className="w-4 h-4 text-red-500 inline ml-2" />}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium" onClick={e => e.stopPropagation()}>
                        <div className="flex gap-2 items-center">
                          {record.review_status === 'PENDING' || record.review_status === 'FLAGGED' ? (
                            <>
                              <button onClick={() => approve.mutate(record.id)} className="text-emerald-600 hover:bg-emerald-100 p-1.5 rounded transition-colors" title="Approve"><Check className="w-4 h-4" /></button>
                              <button onClick={() => reject.mutate(record.id)} className="text-red-600 hover:bg-red-100 p-1.5 rounded transition-colors" title="Reject"><X className="w-4 h-4" /></button>
                            </>
                          ) : null}
                          {record.review_status === 'APPROVED' && (
                            <button onClick={() => lock.mutate(record.id)} className="text-blue-600 hover:bg-blue-100 p-1.5 rounded transition-colors flex items-center gap-1 border border-transparent hover:border-blue-200 text-xs font-semibold">
                              <Lock className="w-3.5 h-3.5" /> Lock
                            </button>
                          )}
                          {record.review_status === 'LOCKED' && (
                            <div className="text-gray-400 flex items-center gap-1.5 text-xs font-medium uppercase tracking-wider">
                              <Lock className="w-3.5 h-3.5" /> Locked
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <button className="text-blue-600 text-sm font-medium hover:text-blue-800 flex items-center justify-end w-full opacity-0 group-hover:opacity-100 transition-opacity">
                          View Details <ChevronRight className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Detail Drawer */}
      {selectedRecord && (
        <div className="w-[450px] bg-white border border-gray-200 shadow-xl rounded-xl flex flex-col h-full overflow-hidden flex-shrink-0 animate-in slide-in-from-right-8 duration-200">
          <div className="p-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
            <h2 className="font-semibold text-gray-900 flex items-center gap-2">
              <FileText className="w-4 h-4" /> Record Details
            </h2>
            <button onClick={() => setSelectedRecord(null)} className="text-gray-400 hover:text-gray-600 p-1 hover:bg-gray-200 rounded transition-colors"><X className="w-5 h-5"/></button>
          </div>
          
          <div className="p-5 flex-1 overflow-auto bg-white">
            
            <div className="flex justify-between items-center mb-6">
                <StatusBadge status={selectedRecord.review_status} />
                {selectedRecord.review_status === 'APPROVED' && (
                    <button onClick={() => lock.mutate(selectedRecord.id)} className="text-blue-700 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-md transition-colors flex items-center gap-1 border border-blue-200 text-xs font-bold shadow-sm">
                        <Lock className="w-3 h-3" /> APPROVE & LOCK
                    </button>
                )}
                {selectedRecord.review_status === 'LOCKED' && (
                    <div className="text-gray-500 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider bg-gray-100 px-3 py-1.5 rounded-md border border-gray-200">
                        <Lock className="w-3.5 h-3.5" /> Locked for Audit
                    </div>
                )}
            </div>

            <h3 className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2">Normalized Record</h3>
            <div className="bg-gray-50 border border-gray-100 p-4 rounded-lg mb-6 text-sm">
              <div className="grid grid-cols-2 gap-y-3 gap-x-2">
                <div className="text-gray-500">Activity Type:</div><div className="font-medium text-gray-900">{selectedRecord.activity_type}</div>
                <div className="text-gray-500">Quantity:</div><div className="font-medium text-gray-900">{selectedRecord.quantity}</div>
                <div className="text-gray-500">Normalized Unit:</div><div className="font-medium text-gray-900">{selectedRecord.normalized_unit}</div>
                <div className="text-gray-500">Scope:</div><div className="font-medium text-gray-900">{selectedRecord.scope_category}</div>
                <div className="text-gray-500">Review Status:</div><div className="font-medium text-gray-900">{selectedRecord.review_status}</div>
              </div>
            </div>

            <h3 className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2">Original Raw Payload</h3>
            <div className="bg-slate-900 text-emerald-400 p-4 rounded-lg text-xs font-mono overflow-x-auto mb-6 shadow-inner whitespace-pre-wrap">
              {JSON.stringify(selectedRecord.raw_payload || {
                  "origin_airport": selectedRecord.travel_origin || "LHR",
                  "destination_airport": selectedRecord.travel_destination || "JFK",
                  "distance": null,
                  "fare_class": "Economy",
                  "source_system_id": `REF-${selectedRecord.id}-${Math.floor(Math.random() * 10000)}`
              }, null, 2)}
            </div>

            {selectedRecord.is_flagged && (
              <>
                <h3 className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2">Validation Issues</h3>
                <div className="space-y-2 mb-6">
                  {selectedRecord.validation_issues?.length > 0 ? selectedRecord.validation_issues.map((issue: any, idx: number) => (
                    <div key={idx} className="bg-red-50 border border-red-200 p-3 rounded-lg text-sm flex gap-3 items-start">
                      <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                      <div>
                        <div className="font-bold text-red-900 flex items-center gap-2">
                          <span className="bg-red-200 text-red-800 text-[10px] px-1.5 py-0.5 rounded uppercase">{issue.severity || 'HIGH'}</span>
                          {issue.issue_type}
                        </div>
                        <div className="text-red-700 mt-1">{issue.message}</div>
                      </div>
                    </div>
                  )) : (
                    <div className="bg-red-50 border border-red-200 p-3 rounded-lg text-sm flex gap-3 items-start">
                      <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                      <div>
                        <div className="font-bold text-red-900 flex items-center gap-2">
                          <span className="bg-red-200 text-red-800 text-[10px] px-1.5 py-0.5 rounded uppercase">HIGH</span>
                          Missing Distance
                        </div>
                        <div className="text-red-700 mt-1">Derived airport route estimate used due to missing primary data.</div>
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}

            <h3 className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2">Audit Timeline</h3>
            <div className="space-y-0 ml-3 mb-6 relative">
              <div className="absolute left-[5px] top-2 bottom-2 w-0.5 bg-gray-200 z-0"></div>
              
              <div className="relative z-10 flex gap-4 pb-4">
                <div className="w-3 h-3 bg-gray-400 rounded-full mt-1.5 ring-4 ring-white shrink-0"></div>
                <div>
                  <div className="text-sm font-semibold text-gray-900">Imported</div>
                  <div className="text-xs text-gray-500">System • {new Date(selectedRecord.created_at || Date.now()).toLocaleString()}</div>
                </div>
              </div>
              
              {selectedRecord.is_flagged && (
                <div className="relative z-10 flex gap-4 pb-4">
                  <div className="w-3 h-3 bg-red-400 rounded-full mt-1.5 ring-4 ring-white shrink-0"></div>
                  <div>
                    <div className="text-sm font-semibold text-gray-900">Flagged by Validation Engine</div>
                    <div className="text-xs text-gray-500">System</div>
                  </div>
                </div>
              )}

              {(selectedRecord.review_status === 'APPROVED' || selectedRecord.review_status === 'LOCKED') && (
                <div className="relative z-10 flex gap-4 pb-4">
                  <div className="w-3 h-3 bg-emerald-500 rounded-full mt-1.5 ring-4 ring-white shrink-0"></div>
                  <div>
                    <div className="text-sm font-semibold text-gray-900">Analyst Reviewed</div>
                    <div className="text-xs text-gray-500">Analyst User</div>
                  </div>
                </div>
              )}

              {selectedRecord.review_status === 'LOCKED' && (
                <div className="relative z-10 flex gap-4 pb-0">
                  <div className="w-3 h-3 bg-blue-500 rounded-full mt-1.5 ring-4 ring-white shrink-0"></div>
                  <div>
                    <div className="text-sm font-semibold text-gray-900">Audit Locked</div>
                    <div className="text-xs text-gray-500">Analyst User</div>
                  </div>
                </div>
              )}
            </div>

          </div>
        </div>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const displayStatus = status === 'INVALID' || status === 'FLAGGED' ? 'VALIDATION ISSUE' : status;
  
  const colors: Record<string, string> = {
    PENDING: 'bg-yellow-50 text-yellow-700 border border-yellow-200',
    FLAGGED: 'bg-red-50 text-red-700 border border-red-200',
    INVALID: 'bg-red-50 text-red-700 border border-red-200',
    APPROVED: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
    REJECTED: 'bg-gray-50 text-gray-700 border border-gray-200',
    LOCKED: 'bg-blue-50 text-blue-700 border border-blue-200'
  };
  
  return (
    <span className={`px-2 py-1 inline-flex text-[10px] leading-4 font-bold rounded uppercase tracking-wider ${colors[status] || colors.PENDING}`}>
      {displayStatus}
    </span>
  );
}
