"use client";

import {
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

import { TaskOverviewMetrics } from "../../lib/taskAnalytics";
import styles from "./OverviewChart.module.css";

interface OverviewChartProps {
  metrics: TaskOverviewMetrics;
}

const CHART_COLORS = {
  active: "#2563eb",
  dueSoon: "#f59e0b",
  completed: "#16a34a",
} as const;

export default function OverviewChart({ metrics }: OverviewChartProps) {
  const chartData = [
    { name: "Active", value: metrics.active, key: "active" as const },
    { name: "Due Soon", value: metrics.dueSoon, key: "dueSoon" as const },
    { name: "Completed", value: metrics.completed, key: "completed" as const },
  ].filter((entry) => entry.value > 0);

  const total = metrics.active + metrics.dueSoon + metrics.completed;

  if (total === 0) {
    return (
      <div className={styles.emptyState} aria-live="polite">
        No tasks yet — add one to see your overview chart.
      </div>
    );
  }

  return (
    <div className={styles.chartWrapper}>
      <ResponsiveContainer width="100%" height={220}>
        <PieChart>
          <Pie
            data={chartData}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            innerRadius={52}
            outerRadius={78}
            paddingAngle={3}
            stroke="#fff"
            strokeWidth={2}
            startAngle={90}
            endAngle={-270}
          >
            {chartData.map((entry) => (
              <Cell key={entry.key} fill={CHART_COLORS[entry.key]} />
            ))}
          </Pie>
          <Tooltip
            formatter={(value, name) => [`${value ?? 0}`, `${name ?? ""}`]}
            contentStyle={{
              background: "var(--color-surface)",
              border: "1px solid var(--color-border)",
              borderRadius: "8px",
              color: "var(--color-text)",
            }}
          />
        </PieChart>
      </ResponsiveContainer>

      <div className={styles.legend}>
        {chartData.map((entry) => (
          <div key={entry.key} className={styles.legendItem}>
            <span
              className={styles.legendSwatch}
              style={{ backgroundColor: CHART_COLORS[entry.key] }}
            />
            <span>
              {entry.name}: {entry.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
