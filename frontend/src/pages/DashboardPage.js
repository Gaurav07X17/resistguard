import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { statsAPI } from '../utils/api';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from 'recharts';
import './DashboardPage.css';

const COLORS = { R: '#f05471', S: '#00d4aa', I: '#f5c842', Unknown: '#3d4f72' };

const ChartTooltipStyle = {
  contentStyle: {
    background: '#111827',
    border: '1px solid #1a2540',
    borderRadius: 10,
    fontSize: '0.82rem',
    color: '#edf0fa',
    boxShadow: '0 4px 20px rgba(0,0,0,0.5)',
  },
  labelStyle: { color: '#7b8ab8', marginBottom: 2 },
  cursor: { fill: 'rgba(255,255,255,0.03)' },
};

const StatCard = ({ label, value, sub, icon, accentColor, glowColor }) => (
  <div
    className="stat-card fade-up"
    style={{
      '--card-accent': accentColor,
      '--card-glow': glowColor,
    }}
  >
    {icon && <div className="stat-icon">{icon}</div>}
    <span className="stat-value">{value ?? '—'}</span>
    <span className="stat-label">{label}</span>
    {sub && <span className="stat-sub">{sub}</span>}
  </div>
);

const CustomBarLabel = ({ x, y, width, value }) => (
  value > 0
    ? <text x={x + width / 2} y={y - 5} fill="#7b8ab8" textAnchor="middle" fontSize={10}>{value}</text>
    : null
);

export default function DashboardPage() {
  const { user, isResearcher } = useAuth();
  const [summary, setSummary]     = useState(null);
  const [resistance, setResistance] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const sumRes = await statsAPI.summary();
        setSummary(sumRes.data.data);
        if (isResearcher) {
          const resRes = await statsAPI.resistance();
          setResistance(resRes.data.data);
        }
      } catch {
        setError('Failed to load dashboard data. Please refresh.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [isResearcher]);

  if (loading) return <div className="loading-spinner" />;
  if (error)   return <div className="error-box" style={{ margin: '2rem 0' }}>{error}</div>;

  const barData = summary?.pathogenDistribution?.map(p => ({
    name: p._id,
    count: p.count,
  })) || [];

  const resistanceCounts = { R: 0, S: 0, I: 0 };
  resistance.forEach(item => {
    item.results.forEach(r => {
      if (r.result in resistanceCounts) resistanceCounts[r.result] += r.count;
    });
  });
  const pieData = Object.entries(resistanceCounts)
    .filter(([, v]) => v > 0)
    .map(([name, value]) => ({ name, value }));

  const dateStr = new Date().toLocaleDateString('en-IN', { dateStyle: 'long' });

  return (
    <div className="dashboard">
      <div className="page-header">
        <h1>Surveillance Dashboard</h1>
        <p>Welcome back, <strong style={{ color: 'var(--text-secondary)' }}>{user?.name}</strong> · {dateStr}</p>
      </div>

      {/* Stat cards */}
      <div className="stats-grid">
        <StatCard
          label="Total Samples"
          value={summary?.totalSamples}
          icon="🧫"
          accentColor="var(--accent-blue)"
          glowColor="rgba(76,201,240,0.07)"
        />
        <StatCard
          label="Clinical Samples"
          value={summary?.clinicalCount}
          icon="🏥"
          accentColor="var(--accent-blue)"
          glowColor="rgba(76,201,240,0.06)"
        />
        <StatCard
          label="Environmental"
          value={summary?.environmentalCount}
          icon="🌿"
          accentColor="var(--accent-green)"
          glowColor="rgba(0,212,170,0.07)"
        />
        <StatCard
          label="Resistant Results"
          value={summary?.totalResistantResults}
          sub="Total R classifications"
          icon="⚠️"
          accentColor="var(--accent-red)"
          glowColor="rgba(240,84,113,0.07)"
        />
      </div>

      {/* Charts — researcher only */}
      {isResearcher && (
        <div className="charts-grid">
          <div className="card chart-card">
            <h3>Samples by Pathogen</h3>
            {barData.length > 0 ? (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={barData} margin={{ top: 18, right: 8, left: -24, bottom: 0 }}>
                  <XAxis
                    dataKey="name"
                    tick={{ fill: '#7b8ab8', fontSize: 10 }}
                    axisLine={{ stroke: '#1a2540' }}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fill: '#7b8ab8', fontSize: 10 }}
                    axisLine={false}
                    tickLine={false}
                    allowDecimals={false}
                  />
                  <Tooltip {...ChartTooltipStyle} />
                  <Bar dataKey="count" fill="#4cc9f0" radius={[4, 4, 0, 0]} maxBarSize={40} label={<CustomBarLabel />} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="no-data">No pathogen data yet.</p>
            )}
          </div>

          <div className="card chart-card">
            <h3>Overall Susceptibility Distribution</h3>
            {pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie
                    data={pieData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="48%"
                    outerRadius={78}
                    innerRadius={36}
                    paddingAngle={3}
                    label={false}
                    labelLine={false}
                  >
                    {pieData.map((entry) => (
                      <Cell key={entry.name} fill={COLORS[entry.name] || '#3d4f72'} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={ChartTooltipStyle.contentStyle}
                    formatter={(v, name) => [v, `${name} results`]}
                  />
                  <Legend
                    iconType="circle"
                    iconSize={8}
                    formatter={(value, entry) => {
                      const total = pieData.reduce((s, d) => s + d.value, 0);
                      const pct = total ? ((entry.payload.value / total) * 100).toFixed(0) : 0;
                      return `${value} ${pct}%`;
                    }}
                    wrapperStyle={{ fontSize: '0.78rem', color: '#7b8ab8', paddingTop: '0.5rem' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="no-data">No susceptibility data yet. Submit samples to populate.</p>
            )}
          </div>
        </div>
      )}

      {/* Technician notice */}
      {!isResearcher && (
        <div className="card tech-notice">
          <h3>📋 Lab Technician Portal</h3>
          <p>
            Use <strong>Submit Sample</strong> in the sidebar to log culture plate results.
            Resistance analytics and charts are available to Researcher accounts.
          </p>
        </div>
      )}

      {/* Pathogen breakdown table */}
      {isResearcher && summary?.pathogenDistribution?.length > 0 && (
        <div className="card breakdown-card">
          <h3>Pathogen Breakdown</h3>
          <table className="data-table">
            <thead>
              <tr>
                <th>Pathogen</th>
                <th>Samples</th>
                <th>% of Total</th>
                <th>Distribution</th>
              </tr>
            </thead>
            <tbody>
              {summary.pathogenDistribution.map(p => {
                const pct = summary.totalSamples
                  ? ((p.count / summary.totalSamples) * 100).toFixed(1)
                  : 0;
                return (
                  <tr key={p._id}>
                    <td><em>{p._id}</em></td>
                    <td>{p.count}</td>
                    <td>{pct}%</td>
                    <td>
                      <div className="resistance-bar-wrap">
                        <div className="resistance-bar">
                          <div className="resistance-bar-fill" style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
