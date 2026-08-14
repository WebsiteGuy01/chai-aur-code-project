import { useState, useEffect } from 'react';
import './App.css';

interface Outage {
  id: number;
  location: string;
  status: 'outage' | 'normal' | 'warning';
  timestamp: string;
}

function App() {
  const [outages, setOutages] = useState<Outage[]>([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({ location: '', status: 'outage' });
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  // Fetch outages on mount and poll every 5 seconds
  const fetchOutages = async () => {
    try {
      const response = await fetch('http://127.0.0.1:8000/status');
      const data = await response.json();
      setOutages(data.outages || []);
    } catch (error) {
      console.error('Failed to fetch outages:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOutages();
    const interval = setInterval(fetchOutages, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.location.trim()) return;

    setSubmitting(true);
    try {
      const response = await fetch('http://127.0.0.1:8000/report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (response.ok) {
        setSuccess(true);
        setFormData({ location: '', status: 'outage' });
        setTimeout(() => setSuccess(false), 3000);
        fetchOutages();
      }
    } catch (error) {
      console.error('Failed to submit report:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'outage': return '#ef4444';
      case 'warning': return '#f59e0b';
      case 'normal': return '#22c55e';
      default: return '#6b7280';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'outage': return 'Outage';
      case 'warning': return 'Warning';
      case 'normal': return 'Normal';
      default: return status;
    }
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="app">
      {/* Header */}
      <header className="header">
        <h1>⚡ PowerStatus PK</h1>
        <p>Real-time load-shedding transparency for Pakistan</p>
      </header>

      {/* Main Content */}
      <main className="main-content">
        {/* Report Form Section */}
        <section className="report-section">
          <h2>Report Current Status</h2>
          <form onSubmit={handleSubmit} className="report-form">
            <div className="form-group">
              <label htmlFor="location">Location</label>
              <input
                type="text"
                id="location"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="Enter your location (e.g., Lahore Sector 5)"
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="status">Power Status</label>
              <select
                id="status"
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as 'outage' | 'normal' | 'warning' })}
              >
                <option value="outage">Outage (No Power)</option>
                <option value="warning">Warning (Unstable)</option>
                <option value="normal">Normal (Power Available)</option>
              </select>
            </div>
            <button type="submit" disabled={submitting} className="submit-btn">
              {submitting ? 'Submitting...' : 'Submit Report'}
            </button>
            {success && <p className="success-message">✅ Report submitted successfully!</p>}
          </form>
        </section>

        {/* Outage Dashboard */}
        <section className="dashboard">
          <h2>Live Outage Dashboard</h2>
          {loading ? (
            <div className="loading">Loading real-time data...</div>
          ) : outages.length === 0 ? (
            <div className="no-data">No reports yet. Be the first to report!</div>
          ) : (
            <div className="outage-list">
              {outages.map((outage) => (
                <div key={outage.id} className="outage-card">
                  <div className="card-header">
                    <div className="status-indicator">
                      <div
                        className="status-dot"
                        style={{ backgroundColor: getStatusColor(outage.status) }}
                      />
                      <span className="status-text">{getStatusLabel(outage.status)}</span>
                    </div>
                    <span className="timestamp">{formatTime(outage.timestamp)}</span>
                  </div>
                  <div className="card-body">
                    <h3>{outage.location}</h3>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

export default App;
