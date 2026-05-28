import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { samplesAPI } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis,
  ResponsiveContainer, Tooltip,
} from 'recharts';
import './SampleDetailPage.css';

const ChartTooltipStyle = {
  contentStyle: {
    background: '#111827',
    border: '1px solid #1a2540',
    borderRadius: 10,
    fontSize: '0.82rem',
    color: '#edf0fa',
    boxShadow: '0 4px 20px rgba(0,0,0,0.5)',
  },
};

const MetaRow = ({ label, value }) =>
  value ? (
    <div className="meta-row">
      <span className="meta-label">{label}</span>
      <span className="meta-value">{value}</span>
    </div>
  ) : null;

export default function SampleDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isResearcher } = useAuth();
  const [sample, setSample]               = useState(null);
  const [loading, setLoading]             = useState(true);
  const [error, setError]                 = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [deleting, setDeleting]           = useState(false);

  useEffect(() => {
    samplesAPI.getById(id)
      .then(res => setSample(res.data.data))
      .catch(() => setError('Sample not found or you do not have access.'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await samplesAPI.delete(id);
      navigate('/samples');
    } catch {
      setError('Failed to delete sample. Please try again.');
      setDeleting(false);
      setDeleteConfirm(false);
    }
  };

  if (loading) return <div className="loading-spinner" />;
  if (error)   return <div className="error-box" style={{ margin: '2rem 0' }}>{error}</div>;

  const radarData = sample.antibiotics.map(ab => ({
    antibiotic: ab.name,
    score: ab.result === 'R' ? 3 : ab.result === 'I' ? 2 : ab.result === 'S' ? 1 : 0,
  }));

  const resistantCount    = sample.antibiotics.filter(a => a.result === 'R').length;
  const intermediateCount = sample.antibiotics.filter(a => a.result === 'I').length;
  const susceptibleCount  = sample.antibiotics.filter(a => a.result === 'S').length;
  const mdrFlag = resistantCount >= 3;
  const collectedDate = new Date(sample.collectedAt).toLocaleDateString('en-IN', { dateStyle: 'long' });

  return (
    <div className="detail-page fade-up">
      {/* Top bar */}
      <div className="detail-topbar">
        <button className="btn btn-ghost btn-sm" onClick={() => navigate(-1)}>
          ← Back to Registry
        </button>
        {isResearcher && !deleteConfirm && (
          <button className="btn btn-danger btn-sm" onClick={() => setDeleteConfirm(true)}>
            🗑 Delete Sample
          </button>
        )}
      </div>

      {/* MDR banner */}
      {mdrFlag && (
        <div className="mdr-banner">
          ⚠️ <span><strong>MDR Suspect</strong> — Resistant to {resistantCount} or more antibiotic classes.</span>
        </div>
      )}

      {/* Delete confirmation */}
      {deleteConfirm && (
        <div className="delete-confirm-banner">
          <span>⚠️ Permanently delete this sample? This cannot be undone.</span>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button className="btn btn-danger btn-sm" onClick={handleDelete} disabled={deleting}>
              {deleting ? 'Deleting…' : 'Yes, Delete'}
            </button>
            <button className="btn btn-ghost btn-sm" onClick={() => setDeleteConfirm(false)}>
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="detail-header">
        <div className="detail-header-left">
          <code className="sample-id-large">{sample.sampleId}</code>
          <h1><em>{sample.pathogen}</em></h1>
          <div className="detail-badges">
            <span className={`badge badge-${sample.sampleType}`}>{sample.sampleType}</span>
            <span className="badge badge-neutral">Gram {sample.gramStain}</span>
            {mdrFlag && <span className="badge badge-R">MDR Suspect</span>}
          </div>
        </div>

        <div className="detail-meta">
          <MetaRow label="Collected"    value={collectedDate} />
          <MetaRow label="Submitted by" value={sample.submittedBy?.name} />
          <MetaRow label="Hospital"     value={sample.location.hospital} />
          <MetaRow label="Ward"         value={sample.location.ward} />
          <MetaRow label="Site"         value={sample.location.site} />
          <MetaRow label="City"         value={sample.location.city} />
          {sample.patientAge    && <MetaRow label="Patient Age" value={`${sample.patientAge} years`} />}
          {sample.patientGender && <MetaRow label="Gender"      value={sample.patientGender} />}
        </div>
      </div>

      {/* Detail grid */}
      <div className="detail-grid">
        {/* AST table */}
        <div className="card">
          <h3>Antibiotic Sensitivity Results</h3>
          <table className="data-table">
            <thead>
              <tr>
                <th>Antibiotic</th>
                <th>MIC (µg/mL)</th>
                <th>Result</th>
              </tr>
            </thead>
            <tbody>
              {sample.antibiotics.map((ab, i) => (
                <tr key={i}>
                  <td>{ab.name}</td>
                  <td style={{ fontFamily: 'var(--mono)', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                    {ab.mic ?? '—'}
                  </td>
                  <td><span className={`badge badge-${ab.result}`}>{ab.result}</span></td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="resistance-summary">
            <div className="rs-item">
              <span className="rs-count" style={{ color: 'var(--accent-red)' }}>{resistantCount}</span>
              <span className="rs-label" style={{ color: 'var(--accent-red)' }}>Resistant</span>
            </div>
            <div className="rs-item">
              <span className="rs-count" style={{ color: 'var(--accent-yellow)' }}>{intermediateCount}</span>
              <span className="rs-label" style={{ color: 'var(--accent-yellow)' }}>Intermediate</span>
            </div>
            <div className="rs-item">
              <span className="rs-count" style={{ color: 'var(--accent-green)' }}>{susceptibleCount}</span>
              <span className="rs-label" style={{ color: 'var(--accent-green)' }}>Susceptible</span>
            </div>
          </div>
        </div>

        {/* Radar chart */}
        <div className="card">
          <h3>Resistance Profile</h3>
          <ResponsiveContainer width="100%" height={265}>
            <RadarChart data={radarData} margin={{ top: 10, right: 20, bottom: 10, left: 20 }}>
              <PolarGrid stroke="#1a2540" />
              <PolarAngleAxis dataKey="antibiotic" tick={{ fill: '#7b8ab8', fontSize: 10 }} />
              <Radar dataKey="score" stroke="#f05471" fill="#f05471" fillOpacity={0.18} strokeWidth={1.5} />
              <Tooltip
                contentStyle={ChartTooltipStyle.contentStyle}
                formatter={(v) => [[null, 'Susceptible', 'Intermediate', 'Resistant'][v] ?? 'Unknown', 'Classification']}
              />
            </RadarChart>
          </ResponsiveContainer>
          <p className="chart-note">1 = S · 2 = I · 3 = R &nbsp;|&nbsp; Larger area = higher resistance</p>
        </div>
      </div>

      {/* Notes */}
      {sample.notes && (
        <div className="card notes-card">
          <h3>Lab Notes</h3>
          <p>{sample.notes}</p>
        </div>
      )}
    </div>
  );
}
