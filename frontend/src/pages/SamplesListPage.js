import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { samplesAPI } from '../utils/api';
import './SamplesListPage.css';

const PAGE_SIZE = 15;

const getResistanceTag = (antibiotics) => {
  if (!antibiotics?.length) return null;
  const r = antibiotics.filter(a => a.result === 'R').length;
  const total = antibiotics.length;
  if (r === 0)     return <span className="badge badge-S">All S</span>;
  if (r === total)  return <span className="badge badge-R">All R</span>;
  return <span className="badge badge-I">{r}/{total} R</span>;
};

export default function SamplesListPage() {
  const [samples, setSamples]   = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState('');
  const [total, setTotal]       = useState(0);
  const [page, setPage]         = useState(1);
  const [filters, setFilters]   = useState({ pathogen: '', sampleType: '', hospital: '' });

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const fetchSamples = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await samplesAPI.getAll({ ...filters, page, limit: PAGE_SIZE });
      setSamples(res.data.data);
      setTotal(res.data.total);
    } catch {
      setError('Failed to load samples. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [filters, page]);

  useEffect(() => { fetchSamples(); }, [fetchSamples]);

  const handleFilter = (e) => {
    setFilters(f => ({ ...f, [e.target.name]: e.target.value }));
    setPage(1);
  };

  const clearFilters = () => {
    setFilters({ pathogen: '', sampleType: '', hospital: '' });
    setPage(1);
  };

  const hasActiveFilters = filters.pathogen || filters.sampleType || filters.hospital;

  return (
    <div className="samples-page">
      <div className="page-header">
        <h1>Sample Registry</h1>
        <p>{total} record{total !== 1 ? 's' : ''} in the database</p>
      </div>

      {/* Filters */}
      <div className="filters-bar card">
        <div className="form-group">
          <label>Pathogen</label>
          <input
            className="form-control"
            name="pathogen"
            placeholder="Search pathogen…"
            value={filters.pathogen}
            onChange={handleFilter}
          />
        </div>
        <div className="form-group">
          <label>Sample Type</label>
          <select className="form-control" name="sampleType" value={filters.sampleType} onChange={handleFilter}>
            <option value="">All types</option>
            <option value="clinical">Clinical</option>
            <option value="environmental">Environmental</option>
          </select>
        </div>
        <div className="form-group">
          <label>Hospital</label>
          <input
            className="form-control"
            name="hospital"
            placeholder="Search hospital…"
            value={filters.hospital}
            onChange={handleFilter}
          />
        </div>
        {hasActiveFilters && (
          <button className="btn btn-ghost btn-sm" onClick={clearFilters} style={{ marginBottom: '0.02rem' }}>
            Clear filters
          </button>
        )}
      </div>

      {error && <div className="error-box" style={{ marginBottom: '1rem' }}>{error}</div>}

      {loading ? (
        <div className="loading-spinner" />
      ) : samples.length === 0 ? (
        <div className="card empty-state">
          <div className="empty-state-icon">🧫</div>
          <p>
            {hasActiveFilters
              ? 'No samples match your current filters.'
              : <>No samples yet. <Link to="/submit">Submit your first sample →</Link></>
            }
          </p>
        </div>
      ) : (
        <>
          <div className="samples-table card">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Sample ID</th>
                  <th>Pathogen</th>
                  <th>Type</th>
                  <th>Location</th>
                  <th>Resistance</th>
                  <th>Date</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {samples.map(s => (
                  <tr key={s._id}>
                    <td><code className="sample-id">{s.sampleId}</code></td>
                    <td><em>{s.pathogen}</em></td>
                    <td>
                      <span className={`badge badge-${s.sampleType}`}>{s.sampleType}</span>
                    </td>
                    <td className="location-cell">
                      {s.sampleType === 'clinical'
                        ? [s.location.ward, s.location.hospital].filter(Boolean).join(' · ') || '—'
                        : [s.location.site, s.location.city].filter(Boolean).join(' · ') || '—'
                      }
                    </td>
                    <td>{getResistanceTag(s.antibiotics)}</td>
                    <td className="date-cell">
                      {new Date(s.collectedAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </td>
                    <td>
                      <Link to={`/samples/${s._id}`} className="btn btn-ghost btn-sm">
                        View →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="pagination">
              <button
                className="btn btn-ghost btn-sm"
                onClick={() => setPage(p => p - 1)}
                disabled={page === 1}
              >
                ← Prev
              </button>
              <span>Page {page} / {totalPages}</span>
              <button
                className="btn btn-ghost btn-sm"
                onClick={() => setPage(p => p + 1)}
                disabled={page >= totalPages}
              >
                Next →
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
