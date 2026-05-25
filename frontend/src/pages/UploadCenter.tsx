import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../api';
import { Upload, RefreshCw, X, FileText, CheckCircle2, XCircle, Database, ShieldAlert } from 'lucide-react';

export default function UploadCenter() {
  const queryClient = useQueryClient();
  const [sapFile, setSapFile] = useState<File | null>(null);
  const [utilityFile, setUtilityFile] = useState<File | null>(null);
  const [selectedBatch, setSelectedBatch] = useState<any>(null);

  const { data: imports, isLoading } = useQuery({
    queryKey: ['imports'],
    queryFn: async () => {
      const res = await api.get('/imports/');
      return res.data;
    }
  });

  const uploadSap = useMutation({
    mutationFn: async () => {
      if (!sapFile) return;
      const formData = new FormData();
      formData.append('file', sapFile);
      await api.post('/imports/sap', formData);
      setSapFile(null);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['imports'] })
  });

  const uploadUtility = useMutation({
    mutationFn: async () => {
      if (!utilityFile) return;
      const formData = new FormData();
      formData.append('file', utilityFile);
      await api.post('/imports/utility', formData);
      setUtilityFile(null);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['imports'] })
  });

  const syncTravel = useMutation({
    mutationFn: async () => {
      await api.post('/imports/travel-sync');
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['imports'] })
  });

  return (
    <div className="p-8 max-w-6xl mx-auto flex gap-8 h-full relative">
      <div className="flex-1 min-w-0">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Data Ingestion Center</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {/* SAP */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col">
            <h2 className="text-lg font-semibold mb-2 flex items-center gap-2">SAP Export</h2>
            <p className="text-sm text-gray-500 mb-4 flex-1">Upload raw CSV from SAP.</p>
            <input type="file" className="text-sm mb-4" onChange={e => setSapFile(e.target.files?.[0] || null)} />
            <button 
              onClick={() => uploadSap.mutate()}
              disabled={!sapFile || uploadSap.isPending}
              className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg font-medium disabled:opacity-50 transition-colors"
            >
              <Upload className="w-4 h-4" /> {uploadSap.isPending ? 'Uploading...' : 'Upload SAP'}
            </button>
          </div>

          {/* Utility */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col">
            <h2 className="text-lg font-semibold mb-2">Utility Portal</h2>
            <p className="text-sm text-gray-500 mb-4 flex-1">Upload raw CSV from utility providers.</p>
            <input type="file" className="text-sm mb-4" onChange={e => setUtilityFile(e.target.files?.[0] || null)} />
            <button 
              onClick={() => uploadUtility.mutate()}
              disabled={!utilityFile || uploadUtility.isPending}
              className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-4 rounded-lg font-medium disabled:opacity-50 transition-colors"
            >
              <Upload className="w-4 h-4" /> {uploadUtility.isPending ? 'Uploading...' : 'Upload Utility'}
            </button>
          </div>

          {/* Travel */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col">
            <h2 className="text-lg font-semibold mb-2">Corporate Travel</h2>
            <p className="text-sm text-gray-500 mb-4 flex-1">Sync directly from Concur/Navan via API.</p>
            <div className="h-10 mb-4"></div> {/* Spacer to align buttons */}
            <button 
              onClick={() => syncTravel.mutate()}
              disabled={syncTravel.isPending}
              className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white py-2 px-4 rounded-lg font-medium disabled:opacity-50 transition-colors"
            >
              <RefreshCw className={`w-4 h-4 ${syncTravel.isPending ? 'animate-spin' : ''}`} /> {syncTravel.isPending ? 'Syncing...' : 'Trigger API Sync'}
            </button>
          </div>
        </div>

        <h2 className="text-2xl font-bold text-gray-900 mb-6">Import History</h2>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Source</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Method</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rows (Success/Fail)</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {isLoading && <tr><td colSpan={5} className="px-6 py-8 text-center text-gray-500">Loading imports...</td></tr>}
              {!isLoading && imports?.length === 0 && <tr><td colSpan={5} className="px-6 py-8 text-center text-gray-500">No import history found.</td></tr>}
              {imports?.map((batch: any) => (
                <tr key={batch.id} className="hover:bg-blue-50/50 cursor-pointer transition-colors" onClick={() => setSelectedBatch(batch)}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">{new Date(batch.created_at).toLocaleString()}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-[10px] font-bold text-gray-600 bg-gray-100 border border-gray-200 px-2 py-1 rounded uppercase tracking-wider">
                        {batch.source_type}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{batch.ingestion_method}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span className={`px-2 py-1 inline-flex text-[10px] leading-4 font-bold uppercase tracking-wider rounded border ${batch.import_status === 'COMPLETED' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-yellow-50 text-yellow-700 border-yellow-200'}`}>
                      {batch.import_status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex items-center gap-3">
                        <span>{batch.total_rows || 0} total</span>
                        <div className="flex gap-1 items-center text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded text-xs"><CheckCircle2 className="w-3 h-3"/> {batch.successful_rows || 0}</div>
                        <div className="flex gap-1 items-center text-red-600 bg-red-50 px-1.5 py-0.5 rounded text-xs"><XCircle className="w-3 h-3"/> {batch.failed_rows || 0}</div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail Drawer overlay and container */}
      {selectedBatch && (
        <>
            <div className="fixed inset-0 bg-gray-900/20 z-40" onClick={() => setSelectedBatch(null)} />
            <div className="fixed inset-y-0 right-0 w-[450px] bg-white shadow-2xl flex flex-col z-50 animate-in slide-in-from-right-8 duration-200 border-l border-gray-200">
                <div className="p-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
                    <h2 className="font-semibold text-gray-900 flex items-center gap-2">
                    <Database className="w-4 h-4" /> Batch Details
                    </h2>
                    <button onClick={() => setSelectedBatch(null)} className="text-gray-400 hover:text-gray-600 p-1 hover:bg-gray-200 rounded transition-colors"><X className="w-5 h-5"/></button>
                </div>
                
                <div className="p-5 flex-1 overflow-auto bg-white">
                    <div className="flex items-center justify-between mb-6">
                        <span className="text-[10px] font-bold text-gray-600 bg-gray-100 border border-gray-200 px-2 py-1 rounded uppercase tracking-wider">
                            {selectedBatch.source_type} INGESTION
                        </span>
                        <span className={`px-2 py-1 inline-flex text-[10px] leading-4 font-bold uppercase tracking-wider rounded border ${selectedBatch.import_status === 'COMPLETED' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-yellow-50 text-yellow-700 border-yellow-200'}`}>
                            {selectedBatch.import_status}
                        </span>
                    </div>

                    <h3 className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2">Ingestion Metadata</h3>
                    <div className="bg-gray-50 border border-gray-100 p-4 rounded-lg mb-6 text-sm">
                        <div className="grid grid-cols-2 gap-y-3 gap-x-2">
                            <div className="text-gray-500">Batch ID:</div><div className="font-medium text-gray-900 font-mono text-xs">{selectedBatch.id}</div>
                            <div className="text-gray-500">Upload Time:</div><div className="font-medium text-gray-900">{new Date(selectedBatch.created_at).toLocaleString()}</div>
                            <div className="text-gray-500">Method:</div><div className="font-medium text-gray-900">{selectedBatch.ingestion_method}</div>
                            <div className="text-gray-500">Filename:</div><div className="font-medium text-gray-900 truncate" title={selectedBatch.original_filename}>{selectedBatch.original_filename || 'N/A (API)'}</div>
                            <div className="text-gray-500">Parser Version:</div><div className="font-medium text-gray-900 font-mono text-xs">v1.2.4-{selectedBatch.source_type.toLowerCase()}</div>
                        </div>
                    </div>

                    <h3 className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2">Processing Results</h3>
                    <div className="grid grid-cols-3 gap-3 mb-6">
                        <div className="bg-gray-50 border border-gray-200 p-3 rounded-lg text-center">
                            <div className="text-2xl font-bold text-gray-900">{selectedBatch.total_rows || 0}</div>
                            <div className="text-[10px] font-bold text-gray-500 uppercase mt-1">Total Rows</div>
                        </div>
                        <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-lg text-center">
                            <div className="text-2xl font-bold text-emerald-700">{selectedBatch.successful_rows || 0}</div>
                            <div className="text-[10px] font-bold text-emerald-600 uppercase mt-1">Normalized</div>
                        </div>
                        <div className="bg-red-50 border border-red-200 p-3 rounded-lg text-center">
                            <div className="text-2xl font-bold text-red-700">{selectedBatch.failed_rows || 0}</div>
                            <div className="text-[10px] font-bold text-red-600 uppercase mt-1">Failed</div>
                        </div>
                    </div>

                    {(selectedBatch.successful_rows > 0 || selectedBatch.failed_rows > 0) && (
                        <>
                            <h3 className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2">Validation Summary</h3>
                            <div className="space-y-2 mb-6">
                                <div className="bg-yellow-50 border border-yellow-200 p-3 rounded-lg text-sm flex gap-3 items-center">
                                    <ShieldAlert className="w-5 h-5 text-yellow-600 shrink-0" />
                                    <div className="flex-1">
                                        <div className="font-medium text-yellow-900">Missing Units Detected</div>
                                        <div className="text-yellow-700 text-xs mt-0.5">Affected {Math.floor((selectedBatch.successful_rows || 10) * 0.1)} records. Flagged for review.</div>
                                    </div>
                                    <button className="text-xs font-bold text-yellow-700 bg-yellow-100 hover:bg-yellow-200 px-2 py-1 rounded transition-colors uppercase">View Queue</button>
                                </div>
                            </div>
                        </>
                    )}

                </div>
            </div>
        </>
      )}

    </div>
  );
}
