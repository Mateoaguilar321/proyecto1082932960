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

interface ProgressChartProps {
  data: Array<{
    date: string;
    time_seconds: number;
    session_type: 'entrenamiento' | 'competencia';
    temperature_c?: number;
    wind_ms?: number;
    surface?: string;
  }>;
  eventName: string;
}

// Custom dot para diferenciar entrenamientos vs competencias
const CustomDot = (props: any) => {
  const { cx, cy, payload } = props;
  const isCompetition = payload.session_type === 'competencia';
  const radius = isCompetition ? 6 : 4;
  const fill = isCompetition ? '#4f46e5' : '#9ca3af';

  return (
    <circle
      cx={cx}
      cy={cy}
      r={radius}
      fill={fill}
      stroke="white"
      strokeWidth={2}
    />
  );
};

// Custom tooltip que formatea tiempos
const CustomTooltip = (props: any) => {
  const { active, payload } = props;
  if (!active || !payload || !payload[0]) return null;

  const data = payload[0].payload;
  return (
    <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-200">
      <p className="text-sm font-semibold text-gray-900">
        {new Date(data.date).toLocaleDateString('es-ES')}
      </p>
      <p className="text-sm text-indigo-600 font-semibold">
        {formatTime(data.time_seconds)}
      </p>
      <p className="text-xs text-gray-500 capitalize">
        {data.session_type}
      </p>
      {data.temperature_c !== undefined && (
        <p className="text-xs text-gray-500">
          Temp: {data.temperature_c}°C
        </p>
      )}
      {data.wind_ms !== undefined && (
        <p className="text-xs text-gray-500">
          Viento: {data.wind_ms} m/s
        </p>
      )}
      {data.surface && (
        <p className="text-xs text-gray-500 capitalize">
          Superficie: {data.surface}
        </p>
      )}
    </div>
  );
};

export default function ProgressChart({ data, eventName }: ProgressChartProps) {
  if (data.length === 0) {
    return (
      <div className="w-full h-64 flex items-center justify-center bg-gray-50 rounded-lg border border-gray-200">
        <p className="text-gray-500 text-center">
          Necesitas al menos 2 sesiones en {eventName} para ver la gráfica de evolución.
          Registra más sesiones.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full h-80 bg-white rounded-lg border border-gray-200 p-4">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Evolución de tiempos — {eventName}
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
          {/* Eje Y INVERTIDO: tiempos menores (mejor rendimiento) van hacia arriba */}
          <YAxis
            reversed={true}
            domain={['auto', 'auto']}
            tickFormatter={(value) => formatTime(value)}
            tick={{ fontSize: 12 }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend
            wrapperStyle={{ fontSize: 12 }}
          />
          <Line
            type="monotone"
            dataKey="time_seconds"
            stroke="#10b981"
            strokeWidth={2}
            dot={<CustomDot />}
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
