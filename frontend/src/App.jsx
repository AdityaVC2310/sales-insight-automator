import { useState, useRef, useCallback } from 'react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

function App() {
  const [file, setFile] = useState(null);
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('idle'); // idle | uploading | success | error
  const [message, setMessage] = useState('');
  const [report, setReport] = useState('');
  const [showReport, setShowReport] = useState(false);
  const [dragging, setDragging] = useState(false);
  const fileInputRef = useRef(null);

  const handleDragOver = useCallback((e) => { e.preventDefault(); setDragging(true); }, []);
  const handleDragLeave = useCallback((e) => { e.preventDefault(); setDragging(false); }, []);
  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setDragging(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) validateAndSetFile(droppedFile);
  }, []);

  const validateAndSetFile = (f) => {
    const ext = f.name.split('.').pop().toLowerCase();
    if (!['csv', 'xlsx', 'xls'].includes(ext)) {
      setStatus('error');
      setMessage('Please upload a .csv or .xlsx file.');
      return;
    }
    if (f.size > 10 * 1024 * 1024) {
      setStatus('error');
      setMessage('File too large. Maximum size is 10 MB.');
      return;
    }
    setFile(f);
    setStatus('idle');
    setMessage('');
    setReport('');
    setShowReport(false);
  };

  const removeFile = (e) => {
    e.stopPropagation();
    setFile(null);
    setStatus('idle');
    setMessage('');
    setReport('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file || !email) return;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setStatus('error');
      setMessage('Please enter a valid email address.');
      return;
    }
    setStatus('uploading');
    setMessage('');
    setReport('');
    setShowReport(false);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('email', email);
      const res = await fetch(`${API_URL}/api/upload`, { method: 'POST', body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Something went wrong. Please try again.');
      setStatus('success');
      setMessage(data.message || `Report sent to ${email}`);
      setReport(data.report || '');
    } catch (err) {
      setStatus('error');
      setMessage(err.message || 'Network error. Please check your connection.');
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const isDisabled = !file || !email || status === 'uploading';

  return (
    <div className="app">
      <header className="header">
        <div className="logo">
          <span className="logo-icon">🐇</span>
          <span className="logo-name">RabbitAI</span>
        </div>
      </header>

      <main className="main">
        <div className="page-title">
          <h1>Sales Report Generator</h1>
          <p>Upload your data file and we'll send an AI-generated report to your inbox.</p>
        </div>

        <form className="card" onSubmit={handleSubmit}>
          {/* Upload Zone */}
          <div className="section-label">1. Upload your file</div>
          <div
            className={`upload-zone ${dragging ? 'dragging' : ''} ${file ? 'has-file' : ''}`}
            onClick={() => !file && fileInputRef.current?.click()}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            id="upload-zone"
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,.xlsx,.xls"
              style={{ display: 'none' }}
              onChange={(e) => { if (e.target.files[0]) validateAndSetFile(e.target.files[0]); }}
              id="file-input"
            />
            {file ? (
              <div className="file-selected">
                <span className="file-icon">📄</span>
                <div className="file-meta">
                  <span className="file-name">{file.name}</span>
                  <span className="file-size">{formatFileSize(file.size)}</span>
                </div>
                <button
                  type="button"
                  className="file-remove"
                  onClick={removeFile}
                  title="Remove file"
                  id="remove-file-btn"
                >
                  ✕
                </button>
              </div>
            ) : (
              <div className="upload-prompt">
                <span className="upload-arrow">↑</span>
                <p className="upload-main">Drag & drop or <span className="upload-link">browse</span></p>
                <p className="upload-sub">.CSV or .XLSX · up to 10 MB</p>
              </div>
            )}
          </div>

          {/* Email */}
          <div className="section-label" style={{ marginTop: '28px' }}>2. Recipient email</div>
          <div className="input-wrapper">
            <span className="input-icon">✉</span>
            <input
              type="email"
              id="email-input"
              className="form-input"
              placeholder="you@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={status === 'uploading'}
            />
          </div>

          {/* Submit */}
          <button type="submit" className="submit-btn" disabled={isDisabled} id="submit-btn">
            {status === 'uploading' ? (
              <><div className="spinner" /> Analyzing & Sending…</>
            ) : (
              'Generate & Send Report'
            )}
          </button>

          {/* Status */}
          {status === 'uploading' && (
            <div className="status-banner loading">
              <span>⏳</span>
              <span>AI is analyzing your data — this takes 10–30 seconds…</span>
            </div>
          )}
          {status === 'success' && (
            <div className="status-banner success">
              <span>✅</span>
              <span>{message}</span>
            </div>
          )}
          {status === 'error' && (
            <div className="status-banner error">
              <span>⚠️</span>
              <span>{message}</span>
            </div>
          )}

          {/* Report Preview */}
          {report && status === 'success' && (
            <div className="report-preview">
              <button
                type="button"
                className="report-toggle"
                onClick={() => setShowReport(!showReport)}
                id="toggle-report-btn"
              >
                {showReport ? '▾ Hide Report' : '▸ Preview Report'}
              </button>
              {showReport && (
                <div className="report-content" dangerouslySetInnerHTML={{ __html: report }} />
              )}
            </div>
          )}
        </form>
      </main>

      <footer className="footer">
        Powered by RabbitAI · AI-Driven Sales Intelligence
      </footer>
    </div>
  );
}

export default App;
