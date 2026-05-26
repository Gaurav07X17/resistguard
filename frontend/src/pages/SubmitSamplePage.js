import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { samplesAPI, pathogensAPI } from '../utils/api';
import './SubmitSamplePage.css';

const RESULTS = ['S', 'I', 'R', 'Unknown'];
const defaultAntibiotic = () => ({ name: '', mic: '', result: 'Unknown' });

const SectionIcon = ({ children }) => (
  <span style={{ fontSize: '0.95rem', lineHeight: 1 }}>{children}</span>
);

export default function SubmitSamplePage() {
  const navigate = useNavigate();
  const [pathogens, setPathogens] = useState([]);
  const [loading, setLoading]     = useState(false);
  const [success, setSuccess]     = useState(false);
  const [error, setError]         = useState('');

  const [form, setForm] = useState({
    pathogen: '',
    gramStain: 'Unknown',
    sampleType: 'clinical',
    location: { hospital: '', ward: '', site: '', city: '' },
    antibiotics: [defaultAntibiotic()],
    patientAge: '',
    patientGender: '',
    notes: '',
    collectedAt: new Date().toISOString().slice(0, 10),
  });

  useEffect(() => {
    pathogensAPI.getAll()
      .then(res => setPathogens(res.data.data))
      .catch(() => {});
  }, []);

  const handlePathogenChange = (e) => {
    const selected = e.target.value;
    const found = pathogens.find(p => p.name === selected);
    if (found) {
      setForm(f => ({
        ...f,
        pathogen: selected,
        antibiotics: found.antibiotics.map(name => ({ name, mic: '', result: 'Unknown' })),
      }));
    } else {
      setForm(f => ({ ...f, pathogen: selected }));
    }
  };

  const handleField    = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }));
  const handleLocation = (e) => setForm(f => ({
    ...f,
    location: { ...f.location, [e.target.name]: e.target.value },
  }));
  const handleAbx = (i, field, value) => {
    setForm(f => {
      const abx = [...f.antibiotics];
      abx[i] = { ...abx[i], [field]: value };
      return { ...f, antibiotics: abx };
    });
  };
  const addAbx    = () => setForm(f => ({ ...f, antibiotics: [...f.antibiotics, defaultAntibiotic()] }));
  const removeAbx = (i) => setForm(f => ({ ...f, antibiotics: f.antibiotics.filter((_, idx) => idx !== i) }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!form.pathogen.trim()) return setError('Please enter a pathogen name.');
    if (form.antibiotics.some(a => !a.name.trim())) return setError('All antibiotic rows must have a name.');

    setLoading(true);
    try {
      const payload = {
        ...form,
        patientAge: form.patientAge ? parseInt(form.patientAge) : null,
        antibiotics: form.antibiotics.map(a => ({
          ...a,
          mic: a.mic !== '' ? parseFloat(a.mic) : null,
        })),
      };
      await samplesAPI.create(payload);
      setSuccess(true);
      setTimeout(() => navigate('/samples'), 1800);
    } catch (err) {
      setError(err.response?.data?.message || 'Submission failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (success) return (
    <div className="submit-success">
      <div className="success-icon">✓</div>
      <h2>Sample Submitted</h2>
      <p>Redirecting to the sample registry…</p>
    </div>
  );

  // Unique antibiotic names across all pathogens for datalist
  const allAbxNames = [...new Set(pathogens.flatMap(p => p.antibiotics))];

  return (
    <div className="submit-page">
      <div className="page-header">
        <h1>Submit Culture Plate</h1>
        <p>Log AST results from a new laboratory sample</p>
      </div>

      <form onSubmit={handleSubmit} className="submit-form">
        {error && <div className="error-box">{error}</div>}

        {/* Section 1 — Pathogen */}
        <div className="form-section">
          <div className="section-heading">
            <SectionIcon>🧫</SectionIcon>
            <h3>Pathogen Information</h3>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="pathogen">Pathogen Name *</label>
              <input
                id="pathogen"
                className="form-control"
                list="pathogen-list"
                name="pathogen"
                placeholder="e.g. E. coli, S. aureus"
                value={form.pathogen}
                onChange={handlePathogenChange}
                required
              />
              <datalist id="pathogen-list">
                {pathogens.map(p => <option key={p.name} value={p.name} />)}
              </datalist>
            </div>
            <div className="form-group">
              <label htmlFor="gramStain">Gram Stain</label>
              <select id="gramStain" className="form-control" name="gramStain" value={form.gramStain} onChange={handleField}>
                <option value="Unknown">Unknown</option>
                <option value="Positive">Gram Positive (+)</option>
                <option value="Negative">Gram Negative (−)</option>
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="sampleType">Sample Type *</label>
              <select id="sampleType" className="form-control" name="sampleType" value={form.sampleType} onChange={handleField}>
                <option value="clinical">Clinical</option>
                <option value="environmental">Environmental</option>
              </select>
            </div>
          </div>
        </div>

        {/* Section 2 — Location */}
        <div className="form-section">
          <div className="section-heading">
            <SectionIcon>📍</SectionIcon>
            <h3>Sample Origin</h3>
          </div>
          {form.sampleType === 'clinical' ? (
            <div className="form-row">
              <div className="form-group">
                <label>Hospital / Facility</label>
                <input className="form-control" name="hospital" placeholder="e.g. AIIMS Delhi" value={form.location.hospital} onChange={handleLocation} />
              </div>
              <div className="form-group">
                <label>Ward</label>
                <input className="form-control" name="ward" placeholder="e.g. ICU, NICU, Surgery" value={form.location.ward} onChange={handleLocation} />
              </div>
            </div>
          ) : (
            <div className="form-row">
              <div className="form-group">
                <label>Site Name</label>
                <input className="form-control" name="site" placeholder="e.g. Yamuna River, Hospital Drain" value={form.location.site} onChange={handleLocation} />
              </div>
              <div className="form-group">
                <label>City</label>
                <input className="form-control" name="city" placeholder="e.g. Delhi" value={form.location.city} onChange={handleLocation} />
              </div>
            </div>
          )}
        </div>

        {/* Section 3 — AST */}
        <div className="form-section">
          <div className="section-heading-row">
            <div className="section-heading">
              <SectionIcon>💊</SectionIcon>
              <h3>Antibiotic Sensitivity Results</h3>
            </div>
            <button type="button" className="btn btn-ghost btn-sm" onClick={addAbx}>
              + Add Row
            </button>
          </div>

          <div className="abx-table">
            <div className="abx-header">
              <span>Antibiotic</span>
              <span>MIC (µg/mL)</span>
              <span>Result</span>
              <span></span>
            </div>
            {form.antibiotics.map((ab, i) => (
              <div className="abx-row" key={i}>
                <input
                  className="form-control"
                  list="abx-list"
                  placeholder="Antibiotic name"
                  value={ab.name}
                  onChange={e => handleAbx(i, 'name', e.target.value)}
                />
                <input
                  className="form-control"
                  type="number"
                  placeholder="e.g. 8"
                  min="0"
                  step="0.01"
                  value={ab.mic}
                  onChange={e => handleAbx(i, 'mic', e.target.value)}
                />
                <select
                  className="form-control"
                  value={ab.result}
                  onChange={e => handleAbx(i, 'result', e.target.value)}
                >
                  {RESULTS.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
                <button
                  type="button"
                  className="btn btn-danger btn-icon"
                  onClick={() => removeAbx(i)}
                  disabled={form.antibiotics.length === 1}
                  title="Remove row"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>

          <datalist id="abx-list">
            {allAbxNames.map(a => <option key={a} value={a} />)}
          </datalist>
        </div>

        {/* Section 4 — Patient metadata */}
        <div className="form-section">
          <div className="section-heading">
            <SectionIcon>👤</SectionIcon>
            <h3>Patient / Source Metadata <span style={{ color: 'var(--text-dim)', fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>(optional)</span></h3>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Patient Age</label>
              <input
                className="form-control"
                type="number"
                name="patientAge"
                placeholder="Anonymised age"
                value={form.patientAge}
                onChange={handleField}
                min="0"
                max="150"
              />
            </div>
            <div className="form-group">
              <label>Patient Gender</label>
              <select className="form-control" name="patientGender" value={form.patientGender} onChange={handleField}>
                <option value="">Not specified</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div className="form-group">
              <label>Collection Date</label>
              <input
                className="form-control"
                type="date"
                name="collectedAt"
                value={form.collectedAt}
                onChange={handleField}
              />
            </div>
          </div>
          <div className="form-group" style={{ marginTop: '1rem' }}>
            <label>Lab Notes</label>
            <textarea
              className="form-control"
              name="notes"
              rows={3}
              placeholder="Additional observations, sample conditions, culture media, etc."
              value={form.notes}
              onChange={handleField}
            />
          </div>
        </div>

        <div className="form-actions">
          <button type="button" className="btn btn-ghost" onClick={() => navigate(-1)}>
            Cancel
          </button>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Submitting…' : '🛡️ Submit Sample'}
          </button>
        </div>
      </form>
    </div>
  );
}
