import { useState, useEffect } from 'react';
import './App.css';

interface Outage {
  id: number;
  location: string;
  status: 'outage' | 'normal' | 'warning';
  timestamp: string;
}

interface Stats {
  total: number;
  outage: number;
  warning: number;
  normal: number;
}

function App() {
  const [outages, setOutages] = useState<Outage[]>([]);
  const [stats, setStats] = useState<Stats>({ total: 0, outage: 0, warning: 0, normal: 0 });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());
  const [formData, setFormData] = useState({ location: '', status: 'outage' });
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [apiUrl] = useState(import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000');

  // Fetch outages on mount and poll every 5 seconds
  const fetchOutages = async () => {
    try {
      const response = await fetch(`${apiUrl}/status`);
      const data = await response.json();
      const reports = data.outages || [];
      setOutages(reports);
      
      // Calculate stats
      const outageCount = reports.filter((r: Outage) => r.status === 'outage').length;
      const warningCount = reports.filter((r: Outage) => r.status === 'warning').length;
      const normalCount = reports.filter((r: Outage) => r.status === 'normal').length;
      setStats({
        total: reports.length,
        outage: outageCount,
        warning: warningCount,
        normal: normalCount
      });
      
      setLastRefresh(new Date());
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
      const response = await fetch(`${apiUrl}/report`, {
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
      case 'outage': return theme === 'dark' ? '#ef4444' : '#dc2626';
      case 'warning': return theme === 'dark' ? '#f59e0b' : '#d97706';
      case 'normal': return theme === 'dark' ? '#22c55e' : '#16a34a';
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

  const getBadgeColor = (status: string) => {
    switch (status) {
      case 'outage': return theme === 'dark' 
        ? 'linear-gradient(135deg, #ef4444 0%, #b91c1c 100%)'
        : 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)';
      case 'warning': return theme === 'dark' 
        ? 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)'
        : 'linear-gradient(135deg, #d97706 0%, #b45309 100%)';
      case 'normal': return theme === 'dark' 
        ? 'linear-gradient(135deg, #22c55e 0%, #15803d 100%)'
        : 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)';
      default: return '#6b7280';
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

  const filteredOutages = outages.filter(outage => 
    outage.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const StatCard = ({ title, count, gradient }: { title: string; count: number; gradient: string }) => (
    <div 
      className="stat-card"
      style={{ background: gradient }}
    >
      <div className="stat-value">{count}</div>
      <div className="stat-label">{title}</div>
    </div>
  );

  return (
    <div className={`app ${theme}`}>
      {/* Header */}
      <header className="header">
        <div className="header-content">
          <div className="header-title">
            <span className="lightning">⚡</span>
            <h1>PowerStatus PK</h1>
          </div>
          <p>Real-time load-shedding transparency for Pakistan</p>
        </div>
        <div className="header-actions">
          <div className="refresh-indicator">
            <span className="refresh-dot" />
            <span className="refresh-text">Auto-refresh enabled</span>
          </div>
          <button 
            className="theme-toggle"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
          >
            {theme === 'dark' ? '☀️' : '🌙'}
          </button>
        </div>
      </header>

      {/* Stats Dashboard */}
      <section className="stats-section">
        <div className="stats-grid">
          <StatCard 
            title="Total Reports" 
            count={stats.total} 
            gradient="linear-gradient(135deg, #667eea 0%, #764ba2 100%)" 
          />
          <StatCard 
            title="Outages" 
            count={stats.outage} 
            gradient="linear-gradient(135deg, #ef4444 0%, #b91c1c 100%)" 
          />
          <StatCard 
            title="Warnings" 
            count={stats.warning} 
            gradient="linear-gradient(135deg, #f59e0b 0%, #d97706 100%)" 
          />
          <StatCard 
            title="Normal" 
            count={stats.normal} 
            gradient="linear-gradient(135deg, #22c55e 0%, #15803d 100%)" 
          />
        </div>
      </section>

      {/* Main Content */}
      <main className="main-content">
        {/* Report Form Section */}
        <section className="report-section">
          <div className="section-header">
            <h2>Report Current Status</h2>
          </div>
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
              {submitting ? (
                <span className="spinner">⏳</span>
              ) : null}
              {submitting ? 'Submitting...' : 'Submit Report'}
            </button>
            {success && <p className="success-message">✅ Report submitted successfully!</p>}
          </form>
        </section>

        {/* Outage Dashboard */}
        <section className="dashboard">
          <div className="dashboard-header">
            <h2>Live Outage Dashboard</h2>
            <div className="search-container">
              <input
                type="text"
                placeholder="Search locations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
              <span className="search-icon">🔍</span>
            </div>
          </div>
          
          {loading ? (
            <div className="loading">
              <span className="spinner">⚡</span>
              <p>Loading real-time data...</p>
            </div>
          ) : filteredOutages.length === 0 ? (
            <div className="no-data">
              {outages.length === 0 ? (
                <>
                  <span className="empty-icon">📡</span>
                  <p>No reports yet. Be the first to report!</p>
                </>
              ) : (
                <>
                  <span className="empty-icon">🔍</span>
                  <p>No results found for "{searchTerm}"</p>
                </>
              )}
            </div>
          ) : (
            <div className="outage-list">
              {filteredOutages.map((outage, index) => (
                <div 
                  key={outage.id} 
                  className="outage-card"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="card-header">
                    <div className="status-badge" style={{ background: getBadgeColor(outage.status) }}>
                      <div className="status-dot" />
                      <span className="status-text">{getStatusLabel(outage.status)}</span>
                    </div>
                    <span className="timestamp">{formatTime(outage.timestamp)}</span>
                  </div>
                  <div className="card-body">
                    <h3>{outage.location}</h3>
                  </div>
                  <div className="card-footer">
                    <span className="card-id">ID: #{outage.id}</span>
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
