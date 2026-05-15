'use client';

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { formatTime } from '@/lib/timeUtils';

interface CompareChartData {
  date: string;
  athlete1_time: number;
  athlete2_time: number;
}

interface CompareChartProps {
  data: CompareChartData[];
  athlete1Name: string;
  athlete2Name: string;
  eventName: string;
}

const CustomTooltip = (props: any) => {
  const { active, payload } = props;
  if (!active || !payload) return null;

  return (
    <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-200">
      <p className="text-sm font-semibold text-gray-900">
        {new Date(payload[0].payload.date).toLocaleDateString('es-ES')}
      </p>
      {payload.map((entry: any, idx: number) => (
        <p key={idx} style={{ color: entry.color }} className="text-sm font-semibold">
          {entry.name}: {formatTime(entry.value)}
        </p>
      ))}
    </div>
  );
};

export default function CompareChart({
  data,
  athlete1Name,
  athlete2Name,
  eventName,
}: CompareChartProps) {
  if (data.length === 0) {
    return (
      <div className="w-full h-64 flex items-center justify-center bg-gray-50 rounded-lg border border-gray-200">
        <p className="text-gray-500 text-center">
          No hay datos para comparar en {eventName}
        </p>
      </div>
    );
  }

  return (
    <div className="w-full h-80 bg-white rounded-lg border border-gray-200 p-4">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Comparativa — {eventName}
      </h3>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="date"
            tickFormatter={(date) => new Date(date).toLocaleDateString('es-ES', {
              month: 'short',
              day: 'numeric',
            })}
            tick={{ fontSize: 12 }}
          />
          <YAxis
            reversed={true}
            domain={['auto', 'auto']}
            tickFormatter={(value) => formatTime(value)}
            tick={{ fontSize: 12 }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend wrapperStyle={{ fontSize: 12 }} />
          <Line
            type="monotone"
            dataKey="athlete1_time"
            stroke="#6366f1"
            strokeWidth={2}
            name={athlete1Name}
            isAnimationActive={false}
          />
          <Line
            type="monotone"
            dataKey="athlete2_time"
            stroke="#f59e0b"
            strokeWidth={2}
            name={athlete2Name}
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
