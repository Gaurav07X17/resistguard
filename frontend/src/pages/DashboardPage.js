import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { statsAPI } from '../utils/api';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from 'recharts';
import './DashboardPage.css';

const COLORS = { R: '#ff4d6d', S: '#00d4aa', I: '#ffd166', Unknown: '#4a5578' };

const StatCard = ({ label, value, sub, accent }) => (
  <div className="stat-card" style={{ borderTopColor: accent }}>
    <span className="stat-value">{value}</span>
    <span className="stat-label">{label}</span>
    {sub && <span className="stat-sub">{sub}</span>}
  </div>
);

export default function DashboardPage() {
  const { user, isResearcher } = useAuth();
  const [summary, setSummary]   = useState(null);
  const [resistance, setResistance] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const sumRes = await statsAPI.summary();
        setSummary(sumRes.data.data);

        if (isResearcher) {
          const resRes = await statsAPI.resistance();
          setResistance(resRes.data.data);
        }
      } catch (err) {
        setError('Failed to load dashboard data.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [isResearcher]);

  if (loading) return <div className="loading-spinner" />;
  if (error)   return <div className="error-box">{error}</div>;

  // Build bar chart data: resistance rate per pathogen
  const barData = summary?.pathogenDistribution?.map(p => ({
    name: p._id,
    count: p.count,
  })) || [];

  // Build pie data from resistance stats
  const resistanceCounts = { R: 0, S: 0, I: 0 };
  resistance.forEach(item => {
    item.results.forEach(r => {
      if (r.result in resistanceCounts) resistanceCounts[r.result] += r.count;
    });
  });
  const pieData = Object.entries(resistanceCounts)
    .filter(([, v]) => v > 0)
    .map(([name, value]) => ({ name, value }));

  return (
    <div className="dashboard">
      <div className="page-header">
        <h1>Surveillance Dashboard</h1>
        <p>Welcome back, {user?.name} · {new Date().toLocaleDateString('en-IN', { dateStyle: 'long' })}</p>
      </div>

      {/* Summary stat cards */}
      <div className="stats-grid">
        <StatCard label="Total Samples"       value={summary?.totalSamples}           accent="var(--accent-blue)"   />
        <StatCard label="Clinical Samples"    value={summary?.clinicalCount}           accent="var(--accent-blue)"   />
        <StatCard label="Environmental"       value={summary?.environmentalCount}      accent="var(--accent-green)"  />
        <StatCard label="Resistant Results"   value={summary?.totalResistantResults}   accent="var(--accent-red)"    sub="Total R classifications" />
      </div>

      {/* Charts — only for researchers/admins */}
      {isResearcher && (
        <div className="charts-grid">
          {/* Pathogen distribution bar chart */}
          <div className="card chart-card">
            <h3>Samples by Pathogen</h3>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={barData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="name" tick={{ fill: '#7b8ab8', fontSize: 11 }} />
                <YAxis tick={{ fill: '#7b8ab8', fontSize: 11 }} />
                <Tooltip
                  contentStyle={{ background: '#131c33', border: '1px solid #1e2d4a', borderRadius: 8 }}
                  labelStyle={{ color: '#e8eaf6' }}
                />
                <Bar dataKey="count" fill="#4cc9f0" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* R/S/I pie chart */}
          <div className="card chart-card">
            <h3>Overall Susceptibility Distribution</h3>
            {pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false}>
                    {pieData.map((entry) => (
                      <Cell key={entry.name} fill={COLORS[entry.name] || '#4a5578'} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ background: '#131c33', border: '1px solid #1e2d4a', borderRadius: 8 }} />
                  <Legend wrapperStyle={{ fontSize: '0.8rem', color: '#7b8ab8' }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="no-data">No susceptibility data yet. Submit some samples first.</p>
            )}
          </div>
        </div>
      )}

      {/* Technician view */}
      {!isResearcher && (
        <div className="card tech-notice">
          <h3>📋 Lab Technician Portal</h3>
          <p>Use the <strong>Submit Sample</strong> menu to log new culture plate results. Analytics dashboards are available to Researchers.</p>
        </div>
      )}

      {/* Pathogen breakdown table */}
      {isResearcher && summary?.pathogenDistribution?.length > 0 && (
        <div className="card">
          <h3>Pathogen Breakdown</h3>
          <table className="data-table">
            <thead>
              <tr><th>Pathogen</th><th>Total Samples</th><th>% of Total</th></tr>
            </thead>
            <tbody>
              {summary.pathogenDistribution.map(p => (
                <tr key={p._id}>
                  <td><em>{p._id}</em></td>
                  <td>{p.count}</td>
                  <td>{summary.totalSamples ? ((p.count / summary.totalSamples) * 100).toFixed(1) + '%' : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
