import React, { useState } from 'react';
import {
  FileText,
  UploadCloud,
  FileCheck,
  Sparkles,
  Scissors,
  Layers,
  Download,
  Eye,
  RefreshCw,
  Copy,
  Check
} from 'lucide-react';

export default function PdfTools() {
  const [uploadedFile, setUploadedFile] = useState(null);
  const [extractedText, setExtractedText] = useState('');
  const [summary, setSummary] = useState('');
  const [loadingSummary, setLoadingSummary] = useState(false);
  const [copiedText, setCopiedText] = useState(false);

  const sampleDocuments = [
    {
      name: 'Operating_Systems_Syllabus.pdf',
      size: '2.4 MB',
      pages: 12,
      sampleText: 'COURSE OVERVIEW:\nModule 1: Operating System Structures & System Calls.\nModule 2: Process Scheduling Algorithms (FCFS, SJF, Priority, Round Robin).\nModule 3: Deadlocks, Banker Algorithm & Resource Allocation Graphs.\nModule 4: Virtual Memory, Demand Paging, Page Replacement (FIFO, LRU, Optimal).'
    },
    {
      name: 'Calculus_Formula_Sheet.pdf',
      size: '1.1 MB',
      pages: 4,
      sampleText: 'CALCULUS FORMULAS:\n1. Integration by Parts: ∫ u dv = uv - ∫ v du\n2. Derivative of sin(x) = cos(x), cos(x) = -sin(x)\n3. Taylor Series Expansion: f(x) = ∑ [f^(n)(a) / n!] (x - a)^n\n4. Green Theorem in Plane: ∮ (P dx + Q dy) = ∬ (∂Q/∂x - ∂P/∂y) dA'
    }
  ];

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const mockDoc = {
        name: file.name,
        size: `${(file.size / (1024 * 1024)).toFixed(2)} MB`,
        pages: Math.floor(Math.random() * 15) + 3,
        sampleText: `DOCUMENT EXTRACTED TEXT FROM ${file.name}:\n\nAbstract: This document introduces key higher education study concepts, experimental evaluation parameters, and course assignments.\n\nSection 1: Academic Overview\nSection 2: Theoretical Formulations & Formulas\nSection 3: Conclusion & Next Steps.`
      };
      setUploadedFile(mockDoc);
      setExtractedText(mockDoc.sampleText);
      setSummary('');
    }
  };

  const handleSelectSample = (doc) => {
    setUploadedFile(doc);
    setExtractedText(doc.sampleText);
    setSummary('');
  };

  const handleSummarizeDoc = async () => {
    if (!extractedText || loadingSummary) return;

    setLoadingSummary(true);
    try {
      const res = await fetch('/api/ai/summarize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: extractedText,
          filename: uploadedFile?.name || 'Document'
        })
      });

      if (res.ok) {
        const data = await res.json();
        setSummary(data.summary);
      }
    } catch (e) {
      setSummary('Failed to summarize document.');
    } finally {
      setLoadingSummary(false);
    }
  };

  const handleCopyText = () => {
    navigator.clipboard.writeText(extractedText);
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 2000);
  };

  return (
    <div className="pdf-tools-page animate-fade-in">
      {/* Header Banner */}
      <div className="pdf-header glass-card">
        <div className="header-titles">
          <h2>PDF & Document Studio</h2>
          <p>View, extract text, merge/split documents, and generate instant AI summaries.</p>
        </div>
      </div>

      {/* Main Studio Workspace */}
      <div className="studio-grid">
        {/* Left Column: Upload & File Tools */}
        <div className="studio-col">
          {/* File Upload Box */}
          <div className="dropzone-card glass-card">
            <UploadCloud size={40} className="dropzone-icon" />
            <h3>Drag & Drop PDF or Document</h3>
            <p>Supports PDF, DOCX, XLSX, PPTX files up to 50MB</p>

            <label className="gradient-button upload-btn">
              <span>Browse File</span>
              <input type="file" accept=".pdf,.docx,.txt" onChange={handleFileUpload} hidden />
            </label>

            <div className="sample-docs-row">
              <span className="sample-label">Or try sample document:</span>
              {sampleDocuments.map((doc, idx) => (
                <button
                  key={idx}
                  className="sample-doc-chip glass-card"
                  onClick={() => handleSelectSample(doc)}
                >
                  <FileText size={14} />
                  <span>{doc.name.split('_')[0]}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Active File Metadata Card */}
          {uploadedFile && (
            <div className="file-meta-card glass-card animate-fade-in">
              <div className="meta-header">
                <FileCheck size={24} className="file-icon" />
                <div className="meta-details">
                  <h4>{uploadedFile.name}</h4>
                  <span>{uploadedFile.size} • {uploadedFile.pages} Pages</span>
                </div>
              </div>

              <div className="pdf-actions-grid">
                <button className="pdf-tool-btn glass-card" onClick={handleSummarizeDoc} disabled={loadingSummary}>
                  {loadingSummary ? <RefreshCw size={16} className="spin-icon" /> : <Sparkles size={16} className="sparkle" />}
                  <span>AI Summarize</span>
                </button>

                <button className="pdf-tool-btn glass-card" onClick={() => alert('PDF Splitter Utility triggered. Select page ranges.')}>
                  <Scissors size={16} />
                  <span>Split Pages</span>
                </button>

                <button className="pdf-tool-btn glass-card" onClick={() => alert('PDF Merger Utility triggered. Select additional files.')}>
                  <Layers size={16} />
                  <span>Merge PDFs</span>
                </button>

                <button className="pdf-tool-btn glass-card" onClick={() => alert('Downloading processed document...')}>
                  <Download size={16} />
                  <span>Download</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Text Extractor & AI Summary View */}
        <div className="studio-col">
          {/* Extracted Text Box */}
          <div className="extracted-card glass-card">
            <div className="col-header">
              <h3>Extracted Document Text</h3>
              {extractedText && (
                <button className="copy-btn" onClick={handleCopyText}>
                  {copiedText ? <Check size={14} className="done" /> : <Copy size={14} />}
                </button>
              )}
            </div>

            <textarea
              value={extractedText}
              onChange={e => setExtractedText(e.target.value)}
              placeholder="Uploaded document text will appear here..."
              className="text-textarea glass-card"
              rows={8}
            />
          </div>

          {/* AI Summary Card */}
          <div className="summary-card glass-card">
            <div className="col-header">
              <h3><Sparkles size={18} className="sparkle" /> AI Executive Summary</h3>
            </div>

            <div className="summary-body">
              {summary ? (
                <div className="summary-content">
                  {summary.split('\n').map((line, idx) => (
                    <p key={idx}>{line}</p>
                  ))}
                </div>
              ) : (
                <p className="summary-placeholder">
                  Select or upload a PDF document and click <strong>"AI Summarize"</strong> to generate key bullet points.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Embedded PDF Tools Styles */}
      <style>{`
        .pdf-tools-page {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .pdf-header {
          padding: 1.5rem;
        }

        .studio-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1.5rem;
        }

        .studio-col {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .dropzone-card {
          padding: 2.5rem 1.5rem;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.85rem;
          text-align: center;
          border: 2px dashed var(--card-border);
        }

        .dropzone-icon { color: var(--accent-primary); }

        .upload-btn { margin-top: 0.5rem; cursor: pointer; }

        .sample-docs-row {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin-top: 1rem;
          flex-wrap: wrap;
        }

        .sample-label { font-size: 0.78rem; color: var(--text-muted); }

        .sample-doc-chip {
          display: flex;
          align-items: center;
          gap: 0.35rem;
          padding: 0.35rem 0.75rem;
          font-size: 0.78rem;
          cursor: pointer;
        }

        .file-meta-card {
          padding: 1.25rem;
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
        }

        .meta-header {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .file-icon { color: var(--accent-cyan); }

        .meta-details h4 { font-size: 0.95rem; }
        .meta-details span { font-size: 0.78rem; color: var(--text-muted); }

        .pdf-actions-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 0.75rem;
        }

        .pdf-tool-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          padding: 0.7rem;
          font-size: 0.85rem;
          font-weight: 600;
          cursor: pointer;
        }

        .sparkle { color: #818cf8; }

        .extracted-card, .summary-card {
          padding: 1.25rem;
          display: flex;
          flex-direction: column;
          gap: 0.85rem;
        }

        .col-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .text-textarea {
          width: 100%;
          padding: 0.85rem;
          color: var(--text-primary);
          font-family: 'Inter', monospace;
          font-size: 0.85rem;
          line-height: 1.5;
          resize: vertical;
        }

        .summary-body {
          min-height: 180px;
          font-size: 0.88rem;
          line-height: 1.6;
        }

        .summary-placeholder { color: var(--text-muted); }

        .spin-icon { animation: spin 1s linear infinite; }

        @media (max-width: 1024px) {
          .studio-grid { grid-template-columns: 1fr; }
        }
      `}</style>
    </div>
  );
}
