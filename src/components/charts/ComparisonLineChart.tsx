import React from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from 'recharts';
import { ComparisonChartPoint, CompanyInfo, TimeRange } from '../../types/finance';

interface ComparisonLineChartProps {
  data: ComparisonChartPoint[];
  companies: CompanyInfo[];
  range: TimeRange;
  height?: number;
}

export const ComparisonLineChart: React.FC<ComparisonLineChartProps> = ({
  data,
  companies,
  range,
  height = 360,
}) => {
  const isRelative = range !== '1d';

  const formatYAxis = (val: number) => {
    if (isRelative) {
      return `${val > 0 ? '+' : ''}${val.toFixed(1)}%`;
    }
    return `$${val}`;
  };

  const formatTooltipValue = (value: any, name: string) => {
    if (typeof value !== 'number') return [value, name];
    if (isRelative) {
      return [`${value > 0 ? '+' : ''}${value.toFixed(2)}%`, name];
    }
    return [`$${value.toFixed(2)}`, name];
  };

  if (!data || data.length === 0) {
    return (
      <div className="chart-empty-state">
        <p>No historical data available for this range.</p>
      </div>
    );
  }

  return (
    <div className="chart-wrapper" style={{ width: '100%', height }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 16, right: 24, left: 8, bottom: 8 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
          <XAxis dataKey="dateLabel" stroke="#525252" fontSize={12} tickLine={false} />
          <YAxis
            stroke="#525252"
            fontSize={12}
            tickLine={false}
            tickFormatter={formatYAxis}
            domain={isRelative ? ['auto', 'auto'] : ['auto', 'auto']}
          />
          <Tooltip
            formatter={formatTooltipValue}
            contentStyle={{
              backgroundColor: '#ffffff',
              border: '1px solid #dcdcdc',
              borderRadius: '6px',
              fontSize: '12px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
            }}
          />
          <Legend
            wrapperStyle={{ paddingTop: '12px', fontSize: '13px' }}
            formatter={(value) => {
              const comp = companies.find((c) => c.symbol === value);
              return comp ? `${comp.symbol} (${comp.name})` : value;
            }}
          />
          {companies.map((comp) => (
            <Line
              key={comp.symbol}
              type="monotone"
              dataKey={comp.symbol}
              stroke={comp.color}
              strokeWidth={comp.isPrimary ? 3 : 1.8}
              dot={data.length <= 14}
              activeDot={{ r: 6 }}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};
