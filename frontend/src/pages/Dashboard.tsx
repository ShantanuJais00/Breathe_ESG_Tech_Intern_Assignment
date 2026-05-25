import { useQuery } from '@tanstack/react-query';
import api from '../api';
import { Activity, AlertTriangle, CheckCircle, Clock } from 'lucide-react';

export default function Dashboard() {
  const { data: records, isLoading } = useQuery({
    queryKey: ['records'],
    queryFn: async () => {
      const res = await api.get('/records/');
      return res.data;
    }
  });

  if (isLoading) return <div className="p-8">Loading...</div>;

  const total = records?.length || 0;
  const flagged = records?.filter((r: any) => r.review_status === 'FLAGGED').length || 0;
  const pending = records?.filter((r: any) => r.review_status === 'PENDING').length || 0;
  const approved = records?.filter((r: any) => r.review_status === 'APPROVED' || r.review_status === 'LOCKED').length || 0;

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Platform Overview</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total Records" value={total} icon={<Activity className="text-blue-500" />} />
        <StatCard title="Flagged Anomalies" value={flagged} icon={<AlertTriangle className="text-red-500" />} />
        <StatCard title="Pending Review" value={pending} icon={<Clock className="text-yellow-500" />} />
        <StatCard title="Approved & Locked" value={approved} icon={<CheckCircle className="text-emerald-500" />} />
      </div>
      
      <div className="mt-12 grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold mb-4">Recent Imports</h2>
          <div className="space-y-4">
            <div className="flex justify-between items-center text-sm border-b border-gray-100 pb-2">
              <span className="font-medium">SAP Import</span>
              <span className="text-emerald-600 font-medium">Completed</span>
              <span className="text-gray-500">245 rows</span>
            </div>
            <div className="flex justify-between items-center text-sm border-b border-gray-100 pb-2">
              <span className="font-medium">Utility Import</span>
              <span className="text-emerald-600 font-medium">Completed</span>
              <span className="text-gray-500">87 rows</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="font-medium">Travel Sync</span>
              <span className="text-emerald-600 font-medium">Completed</span>
              <span className="text-gray-500">32 rows</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold mb-4">Validation Summary</h2>
          <div className="space-y-4">
            <div className="flex justify-between items-center text-sm border-b border-gray-100 pb-2">
              <span className="text-gray-600">Missing Units</span>
              <span className="font-bold text-gray-900">4</span>
            </div>
            <div className="flex justify-between items-center text-sm border-b border-gray-100 pb-2">
              <span className="text-gray-600">Duplicate Records</span>
              <span className="font-bold text-gray-900">2</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-600">Unknown Facilities</span>
              <span className="font-bold text-gray-900">1</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold mb-4">Source Breakdown</h2>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1"><span>SAP</span><span className="font-medium">52%</span></div>
              <div className="w-full bg-gray-100 rounded-full h-2"><div className="bg-blue-600 h-2 rounded-full" style={{ width: '52%' }}></div></div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1"><span>Utility</span><span className="font-medium">31%</span></div>
              <div className="w-full bg-gray-100 rounded-full h-2"><div className="bg-indigo-500 h-2 rounded-full" style={{ width: '31%' }}></div></div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1"><span>Travel</span><span className="font-medium">17%</span></div>
              <div className="w-full bg-gray-100 rounded-full h-2"><div className="bg-emerald-500 h-2 rounded-full" style={{ width: '17%' }}></div></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon }: { title: string, value: number, icon: React.ReactNode }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex items-center gap-4">
      <div className="p-3 bg-gray-50 rounded-lg">
        {icon}
      </div>
      <div>
        <div className="text-sm font-medium text-gray-500">{title}</div>
        <div className="text-2xl font-bold text-gray-900">{value}</div>
      </div>
    </div>
  );
}
