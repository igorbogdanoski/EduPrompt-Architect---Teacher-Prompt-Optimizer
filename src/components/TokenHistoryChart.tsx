import React, { useMemo } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
  Cell,
} from 'recharts';
import { PromptOptimizationResult, SavedPromptItem, SupportedLanguage } from '../types.ts';
import { estimateTokenCount, formatTokenCount } from '../utils/tokenEstimator.ts';
import { TEMPLATE_PRESETS } from '../constants/presets.ts';
import { Activity, Sparkles, TrendingUp } from 'lucide-react';

interface TokenHistoryChartProps {
  currentResult: PromptOptimizationResult | null;
  history: SavedPromptItem[];
  language: SupportedLanguage;
}

interface ChartDataPoint {
  id: string;
  name: string;
  fullName: string;
  jsonTokens: number;
  cotTokens: number;
  totalTokens: number;
  isCurrent: boolean;
  subject: string;
}

export const TokenHistoryChart: React.FC<TokenHistoryChartProps> = ({
  currentResult,
  history,
  language,
}) => {
  const isMk = language === 'mk';

  const chartData = useMemo(() => {
    const points: ChartDataPoint[] = [];

    // 1. If we have saved history, use up to 4 recent saved prompts
    if (history && history.length > 0) {
      history.slice(0, 4).forEach((item, index) => {
        const jTokens = estimateTokenCount(item.parsedJson ? JSON.stringify(item.parsedJson) : '');
        const cTokens = estimateTokenCount(item.chainOfThought);
        const total = jTokens + cTokens || estimateTokenCount(item.unifiedCodeBlock);

        const short = item.subject
          ? item.subject.length > 8
            ? `${item.subject.slice(0, 7)}…`
            : item.subject
          : `P${index + 1}`;

        points.push({
          id: item.id,
          name: short,
          fullName: item.title || `${item.subject}: ${item.taskType}`,
          jsonTokens: jTokens || Math.round(total * 0.35),
          cotTokens: cTokens || Math.round(total * 0.65),
          totalTokens: total,
          isCurrent: false,
          subject: item.subject || 'General',
        });
      });
    }

    // 2. If fewer than 2 past items, add realistic baseline presets so the chart provides immediate comparative context
    if (points.length < 3) {
      const presetsToUse = TEMPLATE_PRESETS.slice(0, 3 - points.length);
      presetsToUse.forEach((preset, i) => {
        // Representative realistic token counts for these established presets
        const mockJson = preset.id.includes('math') ? 95 : preset.id.includes('science') ? 115 : 125;
        const mockCot = preset.id.includes('math') ? 220 : preset.id.includes('science') ? 245 : 280;
        const label = isMk ? preset.titleMk : preset.title;
        const short = preset.state.subject.slice(0, 7) + (preset.state.subject.length > 7 ? '…' : '');

        points.push({
          id: `preset-${preset.id}`,
          name: short,
          fullName: label,
          jsonTokens: mockJson,
          cotTokens: mockCot,
          totalTokens: mockJson + mockCot,
          isCurrent: false,
          subject: preset.state.subject,
        });
      });
    }

    // 3. Add the CURRENT optimized prompt at the end
    if (currentResult) {
      const currentJson = estimateTokenCount(currentResult.jsonString);
      const currentCot = estimateTokenCount(currentResult.chainOfThought);
      const currentTotal = estimateTokenCount(currentResult.unifiedCodeBlock);

      const subjectName = currentResult.input.subject || (isMk ? 'Тековен' : 'Current');
      const shortSubject = subjectName.length > 8 ? `${subjectName.slice(0, 7)}…` : subjectName;

      points.push({
        id: 'current-prompt',
        name: isMk ? 'Тековен ★' : 'Current ★',
        fullName: `${subjectName} (${currentResult.input.gradeLevel || 'K-12'})`,
        jsonTokens: currentJson || Math.round(currentTotal * 0.35),
        cotTokens: currentCot || Math.round(currentTotal * 0.65),
        totalTokens: currentTotal,
        isCurrent: true,
        subject: subjectName,
      });
    }

    return points;
  }, [currentResult, history, isMk]);

  // If no current result and no data, render nothing
  if (!currentResult && chartData.length === 0) {
    return null;
  }

  const currentTotal = currentResult
    ? estimateTokenCount(currentResult.unifiedCodeBlock)
    : 0;

  const averageTotal = chartData.length > 0
    ? Math.round(chartData.reduce((acc, curr) => acc + curr.totalTokens, 0) / chartData.length)
    : 0;

  return (
    <div className="mt-4 pt-3 border-t border-slate-100 no-print">
      {/* Chart Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-2 px-1">
        <div className="flex items-center gap-1.5">
          <Activity className="w-3.5 h-3.5 text-indigo-600" />
          <h4 className="text-xs font-bold text-slate-800 tracking-tight">
            {isMk
              ? 'Потрошувачка на токени: Претходни промпти наспроти тековен'
              : 'Token Consumption: Past Prompts vs. Current'}
          </h4>
        </div>

        <div className="flex items-center gap-2 text-[11px] font-mono text-slate-500">
          {currentResult && (
            <span className="text-indigo-700 font-semibold bg-indigo-50 px-1.5 py-0.5 rounded border border-indigo-200/60">
              {isMk ? 'Тековен:' : 'Current:'} ~{formatTokenCount(currentTotal)} tok
            </span>
          )}
          <span className="text-slate-400">
            {isMk ? 'Просек:' : 'Avg:'} ~{formatTokenCount(averageTotal)} tok
          </span>
        </div>
      </div>

      {/* Chart Box */}
      <div className="h-44 w-full bg-slate-50/70 border border-slate-200/70 rounded-xl p-2 pt-3">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            margin={{ top: 8, right: 10, left: -18, bottom: 4 }}
            barSize={24}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
            <XAxis
              dataKey="name"
              stroke="#64748b"
              fontSize={10}
              tickLine={false}
              axisLine={{ stroke: '#cbd5e1' }}
            />
            <YAxis
              stroke="#64748b"
              fontSize={10}
              tickLine={false}
              axisLine={{ stroke: '#cbd5e1' }}
              tickFormatter={(val) => `${val}`}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload as ChartDataPoint;
                  return (
                    <div className="bg-slate-900 text-white text-xs rounded-lg p-2.5 shadow-xl border border-slate-800 min-w-[170px] space-y-1.5">
                      <div className="flex items-center justify-between border-b border-slate-800 pb-1">
                        <span className="font-semibold text-slate-200 truncate max-w-[130px]">
                          {data.fullName}
                        </span>
                        {data.isCurrent && (
                          <span className="text-[10px] font-bold text-amber-400 bg-amber-950/80 px-1 rounded">
                            ★ {isMk ? 'Тековен' : 'Current'}
                          </span>
                        )}
                      </div>
                      <div className="space-y-0.5 text-[11px] font-mono">
                        <div className="flex items-center justify-between text-indigo-300">
                          <span>JSON Schema:</span>
                          <span className="font-semibold">~{data.jsonTokens} tok</span>
                        </div>
                        <div className="flex items-center justify-between text-amber-300">
                          <span>Chain-of-thought:</span>
                          <span className="font-semibold">~{data.cotTokens} tok</span>
                        </div>
                        <div className="flex items-center justify-between text-white font-bold pt-1 border-t border-slate-800">
                          <span>{isMk ? 'Вкупно:' : 'Total:'}</span>
                          <span>~{data.totalTokens} tokens</span>
                        </div>
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Legend
              verticalAlign="top"
              align="right"
              iconSize={8}
              wrapperStyle={{ fontSize: '10px', paddingTop: '0px', paddingBottom: '6px' }}
              formatter={(value) => (
                <span className="text-slate-600 font-medium">
                  {value === 'jsonTokens' ? 'JSON Schema' : 'Chain-of-thought'}
                </span>
              )}
            />
            <Bar
              dataKey="jsonTokens"
              stackId="a"
              name="jsonTokens"
              fill="#6366f1"
              radius={[0, 0, 0, 0]}
            >
              {chartData.map((entry) => (
                <Cell
                  key={`cell-json-${entry.id}`}
                  fill={entry.isCurrent ? '#4f46e5' : '#818cf8'}
                />
              ))}
            </Bar>
            <Bar
              dataKey="cotTokens"
              stackId="a"
              name="cotTokens"
              fill="#f59e0b"
              radius={[4, 4, 0, 0]}
            >
              {chartData.map((entry) => (
                <Cell
                  key={`cell-cot-${entry.id}`}
                  fill={entry.isCurrent ? '#d97706' : '#fbbf24'}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
