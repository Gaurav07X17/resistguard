import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { samplesAPI } from '../utils/api';
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer, Tooltip } from 'recharts';
import './SampleDetailPage.css';

const RESULT_COLOR = { R: 'var(--accent-red)', S: 'var(--accent-green)', I: 'var(--accent-yellow)', Unknown: 'var(--text-dim)' };
const MIC_MAX = { R: 100, I: 50, S: 10, Unknown: 0 };

export default function SampleDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [sample, setSample] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    samplesAPI.getById(id)
      .then(res => setSample(res.data.data))
      .catch(() => setError('Sample not found.'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="loading-spinner" />;
  if (error)   return <div className="error-box" style={{ margin: '2rem' }}>{error}</div>;

  // Radar chart data — map each antibiotic result to a resistance score
  const radarData = sample.antibiotics.map(ab => ({
    antibiotic: ab.name,
    score: ab.result === 'R' ? 3 : ab.result === 'I' ? 2 : ab.result === 'S' ? 1 : 0,
  }));

  const resistantCount = sample.antibiotics.filter(a => a.result === 'R').length;
  const mdrFlag = resistantCount >= 3;

  return (
    <div className="detail-page">
      <button className="btn btn-ghost back-btn" onClick={() => navigate(-1)}>← Back</button>

      <div className="detail-header">
        <div>
          <code className="sample-id-large">{sample.sampleId}</code>
          <h1><em>{sample.pathogen}</em></h1>
          <div className="detail-badges">
            <span className={`badge badge-${sample.sampleType}`}>{sample.sampleType}</span>
            {mdrFlag && <span className="badge badge-R">⚠ MDR Suspect</span>}
            <span className="badge" style={{ background: 'rgba(123,138,184,0.1)', color: 'var(--text-muted)', border: '1px solid var(--border)' }}>
              Gram {sample.gramStain}
            </span>
          </div>
        </div>
        <div className="detail-meta">
          <div><span>Collected</span><strong>{new Date(sample.collectedAt).toLocaleDateString('en-IN', { dateStyle: 'long' })}</strong></div>
          <div><span>Submitted by</span><strong>{sample.submittedBy?.name || 'Unknown'}</strong></div>
          {sample.location.hospital && <div><span>Hospital</span><strong>{sample.location.hospital}</strong></div>}
          {sample.location.ward     && <div><span>Ward</span><strong>{sample.location.ward}</strong></div>}
          {sample.location.site     && <div><span>Site</span><strong>{sample.location.site}</strong></div>}
          {sample.location.city     && <div><span>City</span><strong>{sample.location.city}</strong></div>}
        </div>
      </div>

      <div className="detail-grid">
        {/* AST Results Table */}
        <div className="card">
          <h3>Antibiotic Sensitivity Results</h3>
          <table className="data-table">
            <thead>
              <tr><th>Antibiotic</th><th>MIC (µg/mL)</th><th>Result</th></tr>
            </thead>
            <tbody>
              {sample.antibiotics.map((ab, i) => (
                <tr key={i}>
                  <td>{ab.name}</td>
                  <td>{ab.mic ?? '—'}</td>
                  <td>
                    <span className={`badge badge-${ab.result}`}>{ab.result}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="resistance-summary">
            <div className="rs-item"><span style={{ color: 'var(--accent-red)' }}>R</span>{sample.antibiotics.filter(a=>a.result==='R').length}</div>
            <div className="rs-item"><span style={{ color: 'var(--accent-yellow)' }}>I</span>{sample.antibiotics.filter(a=>a.result==='I').length}</div>
            <div className="rs-item"><span style={{ color: 'var(--accent-green)' }}>S</span>{sample.antibiotics.filter(a=>a.result==='S').length}</div>
          </div>
        </div>

        {/* Radar chart */}
        <div className="card">
          <h3>Resistance Profile (Radar)</h3>
          <ResponsiveContainer width="100%" height={260}>
            <RadarChart data={radarData}>
              <PolarGrid stroke="var(--border)" />
              <PolarAngleAxis dataKey="antibiotic" tick={{ fill: '#7b8ab8', fontSize: 11 }} />
              <Radar dataKey="score" stroke="var(--accent-red)" fill="var(--accent-red)" fillOpacity={0.25} />
              <Tooltip
                contentStyle={{ background: '#131c33', border: '1px solid #1e2d4a', borderRadius: 8 }}
                formatter={(v) => [['Susceptible','Intermediate','Resistant'][v-1] || 'Unknown', 'Result']}
              />
            </RadarChart>
          </ResponsiveContainer>
          <p className="chart-note">Scores: 1=S · 2=I · 3=R. Higher area = more resistance.</p>
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
