import React, { useState, useEffect, useRef } from 'react';
import { jsPDF } from 'jspdf';
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
  Check,
  Presentation,
  Play,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Minimize2,
  MessageSquare,
  Code,
  BookOpen,
  X
} from 'lucide-react';

export default function PdfTools() {
  const [activeStudioTab, setActiveStudioTab] = useState('pdf'); // 'pdf' | 'ppt' | 'convert'
  
  // --- PDF STUDIO STATE ---
  const [uploadedFile, setUploadedFile] = useState(null);
  const [extractedText, setExtractedText] = useState('');
  const [summary, setSummary] = useState('');
  const [loadingSummary, setLoadingSummary] = useState(false);
  const [copiedText, setCopiedText] = useState(false);

  // --- PPT PRESENTATION STUDIO STATE ---
  const [pptTopic, setPptTopic] = useState('');
  const [numSlides, setNumSlides] = useState(5);
  const [pptTheme, setPptTheme] = useState('navy'); // 'navy' | 'dark' | 'amber' | 'cyber'
  const [isGeneratingPpt, setIsGeneratingPpt] = useState(false);
  const [presentationData, setPresentationData] = useState(null);
  const [currentSlideIdx, setCurrentSlideIdx] = useState(0);
  const [showSpeakerNotes, setShowSpeakerNotes] = useState(true);
  const [isFullscreenPpt, setIsFullscreenPpt] = useState(false);

  // --- CONVERSION STUDIO STATE ---
  const [activeConverterSubTab, setActiveConverterSubTab] = useState('img2pdf'); // 'img2pdf' | 'txt2pdf' | 'html2pdf' | 'textExport'
  const [imageFiles, setImageFiles] = useState([]);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [rawTextToConvert, setRawTextToConvert] = useState('');
  const [pdfDocumentTitle, setPdfDocumentTitle] = useState('My_Study_Notes');
  const [htmlCodeInput, setHtmlCodeInput] = useState('<h1 style="color: #1E3A5F;">Study Notes</h1>\n<p>Key formula: <b>E = mc<sup>2</sup></b></p>');

  const handleConvertTextToPdf = () => {
    if (!rawTextToConvert.trim()) return;
    const doc = new jsPDF();
    const splitText = doc.splitTextToSize(rawTextToConvert, 180);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(12);
    doc.text(splitText, 15, 20);
    doc.save(`${pdfDocumentTitle || 'Document'}.pdf`);
  };

  const handleExportAsTxt = () => {
    if (!rawTextToConvert.trim()) return;
    const blob = new Blob([rawTextToConvert], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${pdfDocumentTitle || 'Document'}.txt`;
    link.click();
  };

  const handleExportAsJson = () => {
    if (!rawTextToConvert.trim()) return;
    const jsonContent = JSON.stringify({ title: pdfDocumentTitle, text: rawTextToConvert, timestamp: new Date().toISOString() }, null, 2);
    const blob = new Blob([jsonContent], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${pdfDocumentTitle || 'Document'}.json`;
    link.click();
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    const validImages = files.filter(f => f.type.startsWith('image/'));
    setImageFiles(prev => [...prev, ...validImages]);
  };

  const handleGeneratePdfFromImages = async () => {
    if (imageFiles.length === 0 || isGeneratingPdf) return;
    setIsGeneratingPdf(true);
    
    try {
      const doc = new jsPDF();
      for (let i = 0; i < imageFiles.length; i++) {
        if (i > 0) doc.addPage();
        
        const file = imageFiles[i];
        const imgData = await new Promise((resolve) => {
          const reader = new FileReader();
          reader.onload = (e) => resolve(e.target.result);
          reader.readAsDataURL(file);
        });

        // Add image to fit A4 page
        const imgProps = doc.getImageProperties(imgData);
        const pdfWidth = doc.internal.pageSize.getWidth();
        const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
        
        doc.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight);
      }
      doc.save('Converted_Images.pdf');
    } catch (err) {
      alert('Error generating PDF.');
    } finally {
      setIsGeneratingPdf(false);
    }
  };
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
      // Removed mock file upload logic; this should be handled by a real backend endpoint or file reader
      setExtractedText("No document processed. Real file upload required.");
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

  // --- PPT GENERATOR HANDLER ---
  const handleGeneratePresentation = async (e) => {
    if (e) e.preventDefault();
    if (!pptTopic.trim() || isGeneratingPpt) return;

    setIsGeneratingPpt(true);
    try {
      const res = await fetch('/api/ai/presentation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: pptTopic,
          numSlides: Number(numSlides),
          style: pptTheme
        })
      });

      if (res.ok) {
        const data = await res.json();
        setPresentationData(data);
        setCurrentSlideIdx(0);
      } else {
        alert('Failed to generate presentation.');
      }
    } catch (err) {
      alert('Presentation generator error.');
    } finally {
      setIsGeneratingPpt(false);
    }
  };

  // Keyboard navigation for presentation slides
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!presentationData || !presentationData.slides) return;
      if (e.key === 'ArrowRight') {
        setCurrentSlideIdx(prev => Math.min(prev + 1, presentationData.slides.length - 1));
      } else if (e.key === 'ArrowLeft') {
        setCurrentSlideIdx(prev => Math.max(prev - 1, 0));
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [presentationData]);

  const handleDownloadDeck = () => {
    if (!presentationData || !presentationData.slides) return;
    let deckContent = `# PRESENTATION SLIDE DECK: ${presentationData.topic}\n\n`;
    presentationData.slides.forEach(s => {
      deckContent += `--- SLIDE ${s.slideNumber}: ${s.title} ---\n`;
      deckContent += `Subtitle: ${s.subtitle}\n\nKey Takeaways:\n`;
      s.bullets.forEach(b => { deckContent += `- ${b}\n`; });
      if (s.codeOrFormula) deckContent += `\nCode/Formula:\n${s.codeOrFormula}\n`;
      if (s.speakerNotes) deckContent += `\nSpeaker Notes:\n${s.speakerNotes}\n`;
      deckContent += `\n\n`;
    });

    const blob = new Blob([deckContent], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${presentationData.topic.replace(/[^a-zA-Z0-9]/g, '_')}_Presentation_Deck.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const activeSlide = presentationData?.slides?.[currentSlideIdx];

  return (
    <div className="pdf-tools-page animate-fade-in space-y-6">
      
      {/* Header Banner & Studio Navigation Tabs */}
      <div className="bg-white dark:bg-[#1A1C23] border border-black/10 dark:border-white/10 rounded-2xl p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-[#1E3A5F] dark:text-white font-['Outfit'] tracking-wide">
              Document & AI Presentation Studio
            </h2>
            <p className="text-xs text-black/60 dark:text-white/60">
              Extract text from documents, generate AI executive summaries, and build full multi-slide presentation decks.
            </p>
          </div>

          {/* Studio Tab Buttons */}
          <div className="flex items-center gap-2 bg-[#F3F0EC] dark:bg-[#232730] p-1.5 rounded-xl border border-black/5 dark:border-white/10">
            <button
              onClick={() => setActiveStudioTab('pdf')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${activeStudioTab === 'pdf' ? 'bg-[#1E3A5F] text-white shadow-md' : 'text-black/70 dark:text-white/70 hover:text-black dark:hover:text-white'}`}
            >
              <FileText size={15} />
              <span>PDF Studio</span>
            </button>

            <button
              onClick={() => setActiveStudioTab('ppt')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${activeStudioTab === 'ppt' ? 'bg-[#1E3A5F] text-white shadow-md' : 'text-black/70 dark:text-white/70 hover:text-black dark:hover:text-white'}`}
            >
              <Presentation size={15} className="text-amber-400" />
              <span>AI PPT Generator</span>
            </button>

            <button
              onClick={() => setActiveStudioTab('convert')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${activeStudioTab === 'convert' ? 'bg-[#1E3A5F] text-white shadow-md' : 'text-black/70 dark:text-white/70 hover:text-black dark:hover:text-white'}`}
            >
              <Layers size={15} className="text-emerald-400" />
              <span>Doc Convert</span>
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: PDF DOCUMENT STUDIO */}
      {/* ========================================================================= */}
      {activeStudioTab === 'pdf' && (
        <div className="grid lg:grid-cols-2 gap-6">
          
          {/* Left Column: Upload & File Selection */}
          <div className="space-y-6">
            <div className="bg-white dark:bg-[#1A1C23] border border-dashed border-[#1E3A5F]/30 dark:border-white/20 rounded-2xl p-8 text-center space-y-4 hover:border-[#1E3A5F] transition-colors">
              <div className="w-16 h-16 rounded-2xl bg-[#1E3A5F]/10 dark:bg-white/10 flex items-center justify-center text-[#1E3A5F] dark:text-amber-400 mx-auto">
                <UploadCloud size={32} />
              </div>
              <div>
                <h3 className="text-base font-bold text-[#1A1A2E] dark:text-white">Upload PDF or Syllabus Document</h3>
                <p className="text-xs text-black/60 dark:text-white/60 mt-1">Supports PDF, DOCX, XLSX, TXT up to 50MB</p>
              </div>

              <label className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#1E3A5F] hover:bg-[#152b46] text-white text-xs font-bold shadow-md cursor-pointer transition-all">
                <span>Browse File</span>
                <input type="file" accept=".pdf,.docx,.txt" onChange={handleFileUpload} hidden />
              </label>

              <div className="pt-2 flex items-center justify-center gap-2 flex-wrap">
                <span className="text-[11px] font-semibold text-black/50 dark:text-white/50">Or test sample document:</span>
                {sampleDocuments.map((doc, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSelectSample(doc)}
                    className="px-2.5 py-1 rounded-lg bg-black/5 dark:bg-white/5 hover:bg-black/10 text-[11px] font-semibold text-[#1E3A5F] dark:text-amber-300 flex items-center gap-1 border border-black/10 dark:border-white/10 transition-colors cursor-pointer"
                  >
                    <FileText size={12} />
                    <span>{doc.name.split('_')[0]}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Uploaded File Details */}
            {uploadedFile && (
              <div className="bg-white dark:bg-[#1A1C23] border border-black/10 dark:border-white/10 rounded-2xl p-5 shadow-sm space-y-4 animate-fade-in">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
                    <FileCheck size={22} />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-[#1A1A2E] dark:text-white">{uploadedFile.name}</h4>
                    <p className="text-xs text-black/50 dark:text-white/50">{uploadedFile.size} • {uploadedFile.pages} Pages</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-2 border-t border-black/5 dark:border-white/10">
                  <button
                    onClick={handleSummarizeDoc}
                    disabled={loadingSummary}
                    className="flex-1 py-2 px-3 rounded-xl bg-[#1E3A5F] hover:bg-[#152b46] text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm transition-colors cursor-pointer disabled:opacity-50"
                  >
                    {loadingSummary ? <RefreshCw size={14} className="animate-spin" /> : <Sparkles size={14} className="text-amber-300" />}
                    <span>{loadingSummary ? 'Summarizing...' : 'Generate AI Summary'}</span>
                  </button>
                  <button
                    onClick={handleCopyText}
                    className="py-2 px-3 rounded-xl border border-black/15 dark:border-white/15 text-xs font-semibold text-black/70 dark:text-white/80 hover:bg-black/5 flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    {copiedText ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
                    <span>{copiedText ? 'Copied' : 'Copy Text'}</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Extracted Text & Summary Viewer */}
          <div className="space-y-6">
            {/* Extracted Text */}
            <div className="bg-white dark:bg-[#1A1C23] border border-black/10 dark:border-white/10 rounded-2xl p-5 shadow-sm space-y-3">
              <h3 className="text-xs font-bold text-black/60 dark:text-white/60 uppercase tracking-wider flex items-center gap-1.5">
                <Eye size={14} /> Extracted Document Text
              </h3>
              <div className="bg-[#FAF8F5] dark:bg-[#232730] border border-black/5 dark:border-white/10 rounded-xl p-4 min-h-[160px] max-h-[260px] overflow-y-auto text-xs font-mono text-black/80 dark:text-white/80 whitespace-pre-wrap leading-relaxed">
                {extractedText || 'No document selected. Upload a file or choose a sample document to view extracted text.'}
              </div>
            </div>

            {/* AI Summary Output */}
            {summary && (
              <div className="bg-white dark:bg-[#1A1C23] border border-emerald-500/30 rounded-2xl p-5 shadow-md space-y-3 animate-fade-in">
                <div className="flex items-center gap-2 text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                  <Sparkles size={16} />
                  <span>AI Executive Document Summary</span>
                </div>
                <div className="text-xs text-black/80 dark:text-white/90 leading-relaxed space-y-2 whitespace-pre-wrap">
                  {summary}
                </div>
              </div>
            )}
          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: AI POWERPOINT / PRESENTATION STUDIO */}
      {/* ========================================================================= */}
      {activeStudioTab === 'ppt' && (
        <div className="space-y-6">
          
          {/* PPT Topic Generator Form */}
          <div className="bg-white dark:bg-[#1A1C23] border border-black/10 dark:border-white/10 rounded-2xl p-6 shadow-sm space-y-4">
            <div className="flex items-center gap-2 text-sm font-bold text-[#1E3A5F] dark:text-amber-400">
              <Presentation size={18} />
              <span>Create AI Slide Deck</span>
            </div>

            <form onSubmit={handleGeneratePresentation} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-black/70 dark:text-white/70">Presentation Topic or Chapter Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Operating System Deadlocks: Conditions & Banker's Algorithm"
                  value={pptTopic}
                  onChange={e => setPptTopic(e.target.value)}
                  className="w-full h-11 rounded-xl border border-black/15 dark:border-white/15 bg-[#FAF8F5] dark:bg-[#232730] px-4 text-xs text-black dark:text-white outline-none focus:border-[#1E3A5F]"
                />
              </div>

              {/* Suggestions Chips */}
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[11px] font-semibold text-black/50 dark:text-white/50">Quick prompts:</span>
                {[
                  'Operating System Deadlocks',
                  'Neural Networks & Backpropagation',
                  'Quantum Computing Principles',
                  'Database Normalization 1NF to 3NF',
                  'Dijkstra Shortest Path Algorithm'
                ].map((prompt, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setPptTopic(prompt)}
                    className="px-2.5 py-1 rounded-lg bg-[#1E3A5F]/5 dark:bg-white/5 hover:bg-[#1E3A5F]/10 text-[11px] font-semibold text-[#1E3A5F] dark:text-amber-300 border border-[#1E3A5F]/10 dark:border-white/10 cursor-pointer transition-colors"
                  >
                    + {prompt}
                  </button>
                ))}
              </div>

              {/* Options Row: Slide Count & Theme */}
              <div className="grid sm:grid-cols-2 gap-4 pt-2">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-black/70 dark:text-white/70">Number of Slides</label>
                  <select
                    value={numSlides}
                    onChange={e => setNumSlides(Number(e.target.value))}
                    className="w-full h-10 rounded-xl border border-black/15 dark:border-white/15 bg-white dark:bg-[#232730] px-3 text-xs text-black dark:text-white outline-none"
                  >
                    <option value="3">3 Slides (Quick Summary)</option>
                    <option value="5">5 Slides (Standard Class Presentation)</option>
                    <option value="8">8 Slides (In-Depth Seminar)</option>
                    <option value="10">10 Slides (Comprehensive Master Class)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-black/70 dark:text-white/70">Presentation Color Theme</label>
                  <select
                    value={pptTheme}
                    onChange={e => setPptTheme(e.target.value)}
                    className="w-full h-10 rounded-xl border border-black/15 dark:border-white/15 bg-white dark:bg-[#232730] px-3 text-xs text-black dark:text-white outline-none"
                  >
                    <option value="navy">Academic Navy & Gold</option>
                    <option value="dark">Minimal Dark Glass</option>
                    <option value="amber">Amber Warm Studio</option>
                    <option value="cyber">Cyber Indigo Modern</option>
                  </select>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isGeneratingPpt || !pptTopic.trim()}
                  className="w-full h-11 rounded-xl bg-[#1E3A5F] hover:bg-[#152b46] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md cursor-pointer transition-all disabled:opacity-50"
                >
                  {isGeneratingPpt ? (
                    <>
                      <RefreshCw size={16} className="animate-spin" />
                      <span>Generating Slide Deck...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles size={16} className="text-amber-400" />
                      <span>Generate AI Presentation Deck</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* INTERACTIVE PRESENTATION SLIDE VIEWER */}
          {presentationData && presentationData.slides && (
            <div className="bg-[#1A1C23] border border-white/10 rounded-2xl overflow-hidden shadow-2xl space-y-0 animate-fade-in">
              
              {/* Slide Deck Header & Controls Bar */}
              <div className="bg-[#111214] px-6 py-3 border-b border-white/10 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[#5865F2] flex items-center justify-center text-white font-bold text-xs">
                    PPT
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-white truncate max-w-xs sm:max-w-md">{presentationData.topic}</h3>
                    <p className="text-[10px] text-gray-400">Slide {currentSlideIdx + 1} of {presentationData.slides.length}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowSpeakerNotes(!showSpeakerNotes)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${showSpeakerNotes ? 'bg-white/15 text-amber-300' : 'bg-white/5 text-gray-400 hover:text-white'}`}
                    title="Toggle Speaker Notes"
                  >
                    <MessageSquare size={13} />
                    <span className="hidden sm:inline">Speaker Notes</span>
                  </button>

                  <button
                    onClick={handleDownloadDeck}
                    className="px-3 py-1.5 rounded-lg bg-[#5865F2] hover:bg-[#4752C4] text-white text-xs font-bold flex items-center gap-1.5 shadow-sm cursor-pointer transition-colors"
                  >
                    <Download size={13} />
                    <span>Export Deck</span>
                  </button>
                </div>
              </div>

              {/* SLIDE CANVAS DISPLAY */}
              {activeSlide && (
                <div className="p-8 sm:p-12 min-h-[380px] bg-gradient-to-br from-[#1E3A5F] via-[#152b46] to-[#0F172A] text-white flex flex-col justify-between relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

                  {/* Slide Top Badge & Title */}
                  <div className="space-y-3 z-10">
                    <div className="inline-flex items-center gap-1.5 bg-white/10 border border-white/20 px-3 py-1 rounded-full text-[11px] font-mono text-amber-300">
                      <span>SLIDE 0{activeSlide.slideNumber}</span>
                    </div>
                    <h2 className="text-2xl sm:text-3xl font-bold font-['Outfit'] tracking-wide text-white leading-tight">
                      {activeSlide.title}
                    </h2>
                    {activeSlide.subtitle && (
                      <p className="text-sm text-white/80 font-medium">
                        {activeSlide.subtitle}
                      </p>
                    )}
                  </div>

                  {/* Slide Bullet Points & Code Box */}
                  <div className="my-6 space-y-4 z-10">
                    <div className="space-y-2.5">
                      {activeSlide.bullets?.map((bullet, bIdx) => (
                        <div key={bIdx} className="flex items-start gap-3 text-xs sm:text-sm text-white/90 leading-relaxed">
                          <div className="w-2 h-2 rounded-full bg-amber-400 shrink-0 mt-1.5" />
                          <span>{bullet}</span>
                        </div>
                      ))}
                    </div>

                    {activeSlide.codeOrFormula && (
                      <div className="mt-4 bg-black/40 border border-white/15 rounded-xl p-3.5 font-mono text-xs text-amber-300 space-y-1">
                        <div className="flex items-center gap-1.5 text-[10px] text-white/50 uppercase tracking-wider mb-1">
                          <Code size={12} /> Key Formula / Code Callout
                        </div>
                        <div className="whitespace-pre-wrap">{activeSlide.codeOrFormula}</div>
                      </div>
                    )}
                  </div>

                  {/* Slide Footer */}
                  <div className="pt-4 border-t border-white/10 flex items-center justify-between text-xs text-white/60 z-10">
                    <span>StudySpace AI Presentation Studio</span>
                    <span>Use ← / → keyboard keys to navigate</span>
                  </div>
                </div>
              )}

              {/* SPEAKER NOTES DRAWER */}
              {showSpeakerNotes && activeSlide?.speakerNotes && (
                <div className="bg-[#111214] p-4 border-t border-white/10 flex items-start gap-3">
                  <MessageSquare size={16} className="text-amber-400 shrink-0 mt-0.5" />
                  <div className="text-xs text-gray-300 leading-relaxed">
                    <strong className="text-amber-300 block mb-0.5">Presenter Speaker Notes:</strong>
                    {activeSlide.speakerNotes}
                  </div>
                </div>
              )}

              {/* SLIDE NAVIGATION CONTROLS */}
              <div className="bg-[#232428] px-6 py-3 border-t border-white/10 flex items-center justify-between">
                <button
                  onClick={() => setCurrentSlideIdx(prev => Math.max(prev - 1, 0))}
                  disabled={currentSlideIdx === 0}
                  className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 disabled:opacity-30 text-xs font-bold text-white flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <ChevronLeft size={16} />
                  <span>Previous Slide</span>
                </button>

                {/* Thumbnails Indicator */}
                <div className="flex items-center gap-1.5">
                  {presentationData.slides.map((s, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentSlideIdx(idx)}
                      className={`w-7 h-7 rounded-lg text-xs font-bold transition-all cursor-pointer ${currentSlideIdx === idx ? 'bg-[#5865F2] text-white scale-110' : 'bg-white/5 text-gray-400 hover:bg-white/10'}`}
                    >
                      {idx + 1}
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => setCurrentSlideIdx(prev => Math.min(prev + 1, presentationData.slides.length - 1))}
                  disabled={currentSlideIdx === presentationData.slides.length - 1}
                  className="px-4 py-2 rounded-xl bg-[#5865F2] hover:bg-[#4752C4] disabled:opacity-30 text-xs font-bold text-white flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <span>Next Slide</span>
                  <ChevronRight size={16} />
                </button>
              </div>

            </div>
          )}

        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: DOCUMENT CONVERTER STUDIO */}
      {/* ========================================================================= */}
      {activeStudioTab === 'convert' && (
        <div className="bg-white dark:bg-[#1A1C23] border border-black/10 dark:border-white/10 rounded-2xl p-6 shadow-sm space-y-6">
          
          {/* CONVERTER SUB-TABS */}
          <div className="flex flex-wrap items-center gap-2 border-b border-black/10 dark:border-white/10 pb-4">
            <button
              onClick={() => setActiveConverterSubTab('img2pdf')}
              className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${activeConverterSubTab === 'img2pdf' ? 'bg-[#1E3A5F] text-white shadow-md' : 'bg-black/5 dark:bg-white/5 text-gray-400 hover:text-white'}`}
            >
              <FileImage size={15} />
              <span>Image to PDF</span>
            </button>

            <button
              onClick={() => setActiveConverterSubTab('txt2pdf')}
              className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${activeConverterSubTab === 'txt2pdf' ? 'bg-[#1E3A5F] text-white shadow-md' : 'bg-black/5 dark:bg-white/5 text-gray-400 hover:text-white'}`}
            >
              <FileText size={15} />
              <span>Text to PDF</span>
            </button>

            <button
              onClick={() => setActiveConverterSubTab('textExport')}
              className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${activeConverterSubTab === 'textExport' ? 'bg-[#1E3A5F] text-white shadow-md' : 'bg-black/5 dark:bg-white/5 text-gray-400 hover:text-white'}`}
            >
              <Download size={15} />
              <span>TXT / JSON Exporter</span>
            </button>
          </div>

          {/* 1. IMAGE TO PDF CONVERTER */}
          {activeConverterSubTab === 'img2pdf' && (
            <div className="space-y-6">
              <div className="flex items-center gap-2 text-sm font-bold text-[#1E3A5F] dark:text-emerald-400">
                <FileImage size={18} />
                <span>Image to PDF Converter</span>
              </div>
              
              <div className="border border-dashed border-[#1E3A5F]/30 dark:border-white/20 rounded-2xl p-8 text-center space-y-4 hover:border-[#1E3A5F] transition-colors">
                <div className="w-16 h-16 rounded-2xl bg-[#1E3A5F]/10 dark:bg-white/10 flex items-center justify-center text-[#1E3A5F] dark:text-emerald-400 mx-auto">
                  <UploadCloud size={32} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#1A1A2E] dark:text-white">Upload Images (JPG, PNG)</h3>
                  <p className="text-xs text-black/60 dark:text-white/60 mt-1">Select multiple images to combine into a single high-quality PDF.</p>
                </div>
                
                <label className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#1E3A5F] hover:bg-[#152b46] text-white text-xs font-bold shadow-md cursor-pointer transition-all">
                  <span>Select Images</span>
                  <input type="file" accept="image/*" multiple onChange={handleImageUpload} hidden />
                </label>
              </div>

              {imageFiles.length > 0 && (
                <div className="space-y-4">
                  <div className="flex flex-wrap gap-3">
                    {imageFiles.map((file, idx) => (
                      <div key={idx} className="relative w-20 h-20 rounded-xl overflow-hidden border border-black/10 dark:border-white/10 group">
                        <img src={URL.createObjectURL(file)} alt="upload" className="w-full h-full object-cover" />
                        <button onClick={() => setImageFiles(prev => prev.filter((_, i) => i !== idx))} className="absolute top-1 right-1 w-5 h-5 rounded-full bg-red-500 text-white flex items-center justify-center text-[10px] cursor-pointer shadow-md opacity-0 group-hover:opacity-100 transition-opacity">
                          <X size={12} />
                        </button>
                      </div>
                    ))}
                  </div>

                  <button
                    onClick={handleGeneratePdfFromImages}
                    disabled={isGeneratingPdf}
                    className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md cursor-pointer disabled:opacity-50"
                  >
                    {isGeneratingPdf ? <RefreshCw size={16} className="animate-spin" /> : <Download size={16} />}
                    <span>{isGeneratingPdf ? 'Generating PDF...' : 'Download as PDF'}</span>
                  </button>
                </div>
              )}
            </div>
          )}

          {/* 2. TEXT TO PDF CONVERTER */}
          {activeConverterSubTab === 'txt2pdf' && (
            <div className="space-y-6">
              <div className="flex items-center gap-2 text-sm font-bold text-[#1E3A5F] dark:text-emerald-400">
                <FileText size={18} />
                <span>Text & Notes to PDF Converter</span>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-400 mb-1">Document Title</label>
                  <input
                    type="text"
                    value={pdfDocumentTitle}
                    onChange={(e) => setPdfDocumentTitle(e.target.value)}
                    placeholder="e.g. Operating_Systems_Chapter_1"
                    className="w-full px-4 py-2.5 rounded-xl bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 text-xs font-medium text-black dark:text-white focus:outline-none focus:border-[#1E3A5F]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-400 mb-1">Text Content</label>
                  <textarea
                    rows={8}
                    value={rawTextToConvert}
                    onChange={(e) => setRawTextToConvert(e.target.value)}
                    placeholder="Paste lecture notes, study summaries, or research outlines here..."
                    className="w-full px-4 py-3 rounded-xl bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 text-xs font-mono text-black dark:text-white focus:outline-none focus:border-[#1E3A5F]"
                  />
                </div>

                <button
                  onClick={handleConvertTextToPdf}
                  disabled={!rawTextToConvert.trim()}
                  className="px-6 py-2.5 rounded-xl bg-[#1E3A5F] hover:bg-[#152b46] disabled:opacity-40 text-white font-bold text-xs flex items-center gap-2 shadow-md cursor-pointer transition-all"
                >
                  <Download size={16} />
                  <span>Convert & Download PDF</span>
                </button>
              </div>
            </div>
          )}

          {/* 3. TXT / JSON EXPORTER */}
          {activeConverterSubTab === 'textExport' && (
            <div className="space-y-6">
              <div className="flex items-center gap-2 text-sm font-bold text-[#1E3A5F] dark:text-emerald-400">
                <Layers size={18} />
                <span>Text / JSON Document Exporter</span>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-400 mb-1">File Name</label>
                  <input
                    type="text"
                    value={pdfDocumentTitle}
                    onChange={(e) => setPdfDocumentTitle(e.target.value)}
                    placeholder="e.g. Study_Export"
                    className="w-full px-4 py-2.5 rounded-xl bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 text-xs font-medium text-black dark:text-white focus:outline-none focus:border-[#1E3A5F]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-400 mb-1">Content to Export</label>
                  <textarea
                    rows={8}
                    value={rawTextToConvert}
                    onChange={(e) => setRawTextToConvert(e.target.value)}
                    placeholder="Type or paste content to export as .txt or .json format..."
                    className="w-full px-4 py-3 rounded-xl bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 text-xs font-mono text-black dark:text-white focus:outline-none focus:border-[#1E3A5F]"
                  />
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <button
                    onClick={handleExportAsTxt}
                    disabled={!rawTextToConvert.trim()}
                    className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white font-bold text-xs flex items-center gap-2 shadow-md cursor-pointer transition-all"
                  >
                    <Download size={16} />
                    <span>Export as .TXT</span>
                  </button>

                  <button
                    onClick={handleExportAsJson}
                    disabled={!rawTextToConvert.trim()}
                    className="px-6 py-2.5 rounded-xl bg-[#5865F2] hover:bg-[#4752C4] disabled:opacity-40 text-white font-bold text-xs flex items-center gap-2 shadow-md cursor-pointer transition-all"
                  >
                    <Download size={16} />
                    <span>Export as .JSON</span>
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>
      )}

    </div>
  );
}
