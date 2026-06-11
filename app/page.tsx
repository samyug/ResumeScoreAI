"use client";

import React, { useRef, useState, DragEvent } from "react";

const analysisSteps = [
  "Uploading Documents",
  "Extracting Content",
  "Base Resume Evaluation",
  "ATS Risk Scanning",
  "Recruiter Simulation",
  "Generating Tailored Job Insights"
];

export default function ResumeScorePage() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const jdFileInputRef = useRef<HTMLInputElement>(null);
  
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const [jdFile, setJdFile] = useState<File | null>(null);
  const [jdText, setJdText] = useState("");
  const [isDraggingJd, setIsDraggingJd] = useState(false);
  
  const [status, setStatus] = useState<"idle" | "analyzing" | "complete" | "error">("idle");
  const [currentStep, setCurrentStep] = useState(0);
  const [errorMsg, setErrorMsg] = useState("");
  
  const [results, setResults] = useState<any>(null);

  // Asset Generation States
  const [coverLetter, setCoverLetter] = useState<string | null>(null);
  const [isGeneratingCL, setIsGeneratingCL] = useState(false);
  const [clError, setClError] = useState("");

  const [interviewQuestions, setInterviewQuestions] = useState<any[] | null>(null);
  const [isGeneratingIQ, setIsGeneratingIQ] = useState(false);
  const [iqError, setIqError] = useState("");

  const [copiedCL, setCopiedCL] = useState(false);

  // Drag & Drop Handlers
  const handleDragOver = (e: DragEvent<HTMLDivElement>) => { e.preventDefault(); setIsDragging(true); };
  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => { e.preventDefault(); setIsDragging(false); };
  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault(); setIsDragging(false);
    if (e.dataTransfer.files?.[0]) validateAndSetFile(e.dataTransfer.files[0], setFile);
  };
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) validateAndSetFile(e.target.files[0], setFile);
  };

  const handleJdDragOver = (e: DragEvent<HTMLDivElement>) => { e.preventDefault(); setIsDraggingJd(true); };
  const handleJdDragLeave = (e: DragEvent<HTMLDivElement>) => { e.preventDefault(); setIsDraggingJd(false); };
  const handleJdDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault(); setIsDraggingJd(false);
    if (e.dataTransfer.files?.[0]) validateAndSetFile(e.dataTransfer.files[0], setJdFile, true);
  };
  const handleJdFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) validateAndSetFile(e.target.files[0], setJdFile, true);
  };

  const validateAndSetFile = (selectedFile: File, setter: React.Dispatch<React.SetStateAction<File | null>>, allowTxt = false) => {
    const valid = allowTxt 
      ? /\.pdf$|\.doc$|\.docx$|\.txt$/i.test(selectedFile.name) || selectedFile.type.includes("pdf") || selectedFile.type.includes("word") || selectedFile.type.includes("text")
      : /\.pdf$|\.doc$|\.docx$/i.test(selectedFile.name) || selectedFile.type.includes("pdf") || selectedFile.type.includes("word");
      
    if (!valid) {
      setErrorMsg(`Please upload a valid ${allowTxt ? 'PDF, DOCX, or TXT' : 'PDF or DOCX'} file.`);
      return;
    }
    setErrorMsg("");
    setter(selectedFile);
  };

  const startAnalysis = async () => {
    if (!file) return;

    setStatus("analyzing");
    setErrorMsg("");
    setCurrentStep(0);
    setCoverLetter(null);
    setInterviewQuestions(null);
    
    const stepInterval = setInterval(() => {
      setCurrentStep(prev => {
        if (prev >= analysisSteps.length - 2) {
          clearInterval(stepInterval);
          return prev;
        }
        return prev + 1;
      });
    }, 2000);

    try {
      const formData = new FormData();
      formData.append("resume", file);
      if (jdFile) formData.append("jobDescriptionFile", jdFile);
      if (jdText) formData.append("jobDescriptionText", jdText);
      
      const response = await fetch("/api/analyze", { method: "POST", body: formData });
      const data = await response.json();
      
      if (!response.ok) throw new Error(data.error || "Failed to analyze resume");
      
      setResults(data);
      setCurrentStep(analysisSteps.length - 1);
      setTimeout(() => { setStatus("complete"); }, 800);
      
    } catch (err: any) {
      setErrorMsg(err.message || "An unexpected error occurred.");
      setStatus("error");
    } finally {
      clearInterval(stepInterval);
    }
  };

  const generateCoverLetter = async () => {
    if (!file) return;
    setIsGeneratingCL(true);
    setClError("");
    setCoverLetter(null);

    try {
      const formData = new FormData();
      formData.append("resume", file);
      if (jdFile) formData.append("jobDescriptionFile", jdFile);
      if (jdText) formData.append("jobDescriptionText", jdText);

      const response = await fetch("/api/generate/cover-letter", { method: "POST", body: formData });
      const data = await response.json();

      if (!response.ok) throw new Error(data.error || "Failed to generate Cover Letter.");
      setCoverLetter(data.content);
    } catch (err: any) {
      setClError(err.message || "An unexpected error occurred.");
    } finally {
      setIsGeneratingCL(false);
    }
  };

  const generateInterviewQuestions = async () => {
    if (!file) return;
    setIsGeneratingIQ(true);
    setIqError("");
    setInterviewQuestions(null);

    try {
      const formData = new FormData();
      formData.append("resume", file);
      if (jdFile) formData.append("jobDescriptionFile", jdFile);
      if (jdText) formData.append("jobDescriptionText", jdText);

      const response = await fetch("/api/generate/interview-questions", { method: "POST", body: formData });
      const data = await response.json();

      if (!response.ok) throw new Error(data.error || "Failed to generate Interview Questions.");
      setInterviewQuestions(data.questions);
    } catch (err: any) {
      setIqError(err.message || "An unexpected error occurred.");
    } finally {
      setIsGeneratingIQ(false);
    }
  };

  const copyToClipboard = () => {
    if (!coverLetter) return;
    navigator.clipboard.writeText(coverLetter);
    setCopiedCL(true);
    setTimeout(() => setCopiedCL(false), 2000);
  };

  const reset = () => {
    setFile(null); setJdFile(null); setJdText(""); setStatus("idle"); setResults(null); setErrorMsg("");
    setCoverLetter(null); setInterviewQuestions(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
    if (jdFileInputRef.current) jdFileInputRef.current.value = "";
  };

  const renderSeverity = (severity: string) => {
    if (severity === 'high') return <span style={{ color: 'var(--warning)', fontWeight: 600 }}>High Risk</span>;
    if (severity === 'medium') return <span style={{ color: '#F59E0B', fontWeight: 600 }}>Medium Risk</span>;
    return <span style={{ color: 'var(--text-muted)' }}>Low Risk</span>;
  };

  return (
    <main className="page">
      <section className="hero">
        <div className="eyebrow fade-up"><span className="eyebrow-dot" aria-hidden="true"></span>ResumeScore AI</div>
        <h1 className="fade-up delay-1">Know Exactly How Strong Your Resume Is.</h1>
        <p className="hero-copy fade-up delay-2">
          Upload your resume and receive a professional AI-powered evaluation in seconds. Clear scoring, ATS insight, and practical revisions without the noise of a dashboard.
        </p>
      </section>

      <section className="upload-shell" aria-labelledby="upload-heading">
        <div className="upload-panel">
          <div className="upload-header">
            <div>
              <p className="section-label">Single-page experience</p>
              <h2 className="section-title" id="upload-heading">Upload once. Understand what to improve next.</h2>
              <p className="section-copy">Drop in a resume, optionally add a target job description, and let the AI review structure, keywords, and role alignment directly below.</p>
            </div>
            <div className="supported" aria-label="Supported files">
              <strong>Supported files</strong><span>PDF • DOCX</span>
            </div>
          </div>

          {errorMsg && status !== "analyzing" && (
            <div style={{ marginBottom: '1.5rem', padding: '1rem', backgroundColor: 'rgba(255, 59, 48, 0.1)', color: 'var(--warning)', borderRadius: '8px', border: '1px solid rgba(255,59,48,0.2)', fontWeight: 500 }}>
              {errorMsg}
            </div>
          )}

          {(status === "idle" || status === "error") && (
            <div className="form-stack">
              <div 
                className={`dropzone ${isDragging ? "is-dragover" : ""} ${file ? "is-filled" : ""}`} 
                tabIndex={0} role="button" 
                onClick={() => !file && fileInputRef.current?.click()}
                onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={handleDrop}
                style={file ? { borderStyle: 'solid', borderColor: 'var(--border)' } : {}}
              >
                <input className="hidden-input" type="file" accept=".pdf,.doc,.docx" ref={fileInputRef} onChange={handleFileChange} />
                {!file ? (
                  <div className="dropzone-inner">
                    <div className="upload-glyph" aria-hidden="true">
                      <svg width="34" height="34" viewBox="0 0 34 34" fill="none"><path d="M17 7v14m0-14 5 5m-5-5-5 5M8.5 22.5v1.5c0 1.38 1.12 2.5 2.5 2.5h12c1.38 0 2.5-1.12 2.5-2.5v-1.5" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    </div>
                    <div className="flow">
                      <h3 className="upload-headline">Drag and drop your resume.</h3>
                      <p className="upload-copy">Or browse from your device.</p>
                    </div>
                  </div>
                ) : (
                  <div className="dropzone-inner" style={{ padding: '2rem' }}>
                    <div className="flow">
                      <h3 className="upload-headline" style={{ color: 'var(--text-main)' }}>Resume Ready</h3>
                      <p className="upload-copy">{file.name}</p>
                    </div>
                    <button className="secondary-button" type="button" onClick={(e) => { e.stopPropagation(); setFile(null); }}>Remove Resume</button>
                  </div>
                )}
              </div>

              <div style={{ marginTop: '2.5rem', paddingTop: '2.5rem', borderTop: '1px solid var(--border)' }}>
                <div style={{ marginBottom: '1.25rem' }}>
                  <h3 className="section-title" style={{ fontSize: '1.25rem', marginBottom: '0.25rem' }}>Target Job (Optional)</h3>
                  <p className="section-copy" style={{ fontSize: '0.9rem' }}>Add a job description to unlock Keyword Gap Analysis and Tailoring Recommendations.</p>
                </div>
                
                <textarea 
                  value={jdText} onChange={(e) => setJdText(e.target.value)}
                  placeholder="Paste the job description text here..."
                  style={{ width: '100%', minHeight: '120px', padding: '1rem', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--surface-sunken)', color: 'var(--text-main)', fontFamily: 'inherit', fontSize: '0.95rem', resize: 'vertical', marginBottom: '1rem' }}
                />

                <div 
                  className={`dropzone ${isDraggingJd ? "is-dragover" : ""}`} 
                  tabIndex={0} role="button" 
                  onClick={() => !jdFile && jdFileInputRef.current?.click()}
                  onDragOver={handleJdDragOver} onDragLeave={handleJdDragLeave} onDrop={handleJdDrop}
                  style={{ minHeight: '120px', padding: '1.5rem', backgroundColor: 'var(--surface-sunken)', border: jdFile ? '1px solid var(--border)' : undefined }}
                >
                  <input className="hidden-input" type="file" accept=".pdf,.doc,.docx,.txt" ref={jdFileInputRef} onChange={handleJdFileChange} />
                  {!jdFile ? (
                    <div className="dropzone-inner"><h4 style={{ fontWeight: 500, margin: 0, color: 'var(--text-main)' }}>Or upload a JD file</h4></div>
                  ) : (
                    <div className="dropzone-inner">
                      <h4 style={{ fontWeight: 500, margin: 0, color: 'var(--text-main)' }}>JD File Attached</h4>
                      <p className="upload-copy" style={{ fontSize: '0.85rem', margin: 0 }}>{jdFile.name}</p>
                      <button className="secondary-button" type="button" onClick={(e) => { e.stopPropagation(); setJdFile(null); }} style={{ padding: '0.5rem 1rem', fontSize: '0.85rem', marginTop: '0.5rem' }}>Remove JD</button>
                    </div>
                  )}
                </div>
              </div>

              <div style={{ marginTop: '3rem', display: 'flex', justifyContent: 'center' }}>
                <button className="primary-button" type="button" disabled={!file} onClick={startAnalysis} style={!file ? { opacity: 0.5, cursor: 'not-allowed' } : { padding: '1rem 3rem', fontSize: '1.1rem' }}>
                  Analyze Resume
                </button>
              </div>
            </div>
          )}

          {(status === "analyzing" || status === "complete") && file && (
            <div className="file-summary is-visible">
              <div>
                <p className="file-name">{file.name}</p>
                <p className="file-meta">{jdText || jdFile ? "Two-Pass Analysis (Base + Tailoring)" : "Base Analysis"}</p>
              </div>
              <button className="secondary-button" type="button" onClick={reset}>Start Over</button>
            </div>
          )}

          {status === "analyzing" && (
            <section className="analysis is-visible" aria-label="AI analysis in progress">
              <div className="analysis-card">
                <div className="analysis-topline">
                  <div>
                    <h3 className="analysis-title">Executing Analysis Pipeline</h3>
                    <p className="analysis-subtitle">Rigorous ATS scanning and recruiter simulation in progress.</p>
                  </div>
                  <div className="progress-index">Step {Math.min(currentStep + 1, analysisSteps.length)} of {analysisSteps.length}</div>
                </div>
                <div className="progress-bar" aria-hidden="true">
                  <div className="progress-fill" style={{ width: `${((currentStep + 1) / analysisSteps.length) * 100}%` }}></div>
                </div>
                <div className="progress-list">
                  {analysisSteps.map((step, idx) => {
                    const isActive = idx === currentStep;
                    const isComplete = idx < currentStep;
                    return (
                      <div key={idx} className={`progress-row ${isActive ? "is-active" : ""} ${isComplete ? "is-complete" : ""}`}>
                        <span className="progress-dot" aria-hidden="true"></span>
                        <span>{step}</span>
                        <span className="progress-status">{isComplete ? "Complete" : isActive ? "In progress" : "Waiting"}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </section>
          )}

          {status === "complete" && results && (
            <section className="results is-visible" aria-labelledby="results-heading">
              <div className="results-grid" style={{ marginBottom: '2rem' }}>
                <article className="results-card" style={{ gridColumn: '1 / -1', borderColor: 'var(--text-main)' }}>
                  <div>
                    <p className="section-label">Recruiter Simulation</p>
                    <h3 className="section-title">The First Impression</h3>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginTop: '1.5rem' }}>
                    <div style={{ padding: '1.5rem', backgroundColor: 'var(--surface-sunken)', borderRadius: '8px' }}>
                      <p style={{ fontWeight: 600, color: 'var(--text-main)', marginBottom: '0.5rem' }}>First Impression</p>
                      <p style={{ fontSize: '0.95rem', lineHeight: '1.6' }}>{results.recruiterSimulation.firstImpression}</p>
                      
                      <div style={{ marginTop: '1.5rem' }}>
                        <p style={{ fontWeight: 600, color: 'var(--text-main)', marginBottom: '0.5rem' }}>Hiring Recommendation</p>
                        <p style={{ fontSize: '0.95rem', lineHeight: '1.6' }}>{results.recruiterSimulation.hiringRecommendation}</p>
                      </div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                      <div style={{ padding: '1rem', backgroundColor: 'var(--surface-sunken)', borderRadius: '8px', borderLeft: '4px solid #10B981' }}>
                        <p style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--text-muted)' }}>STRONGEST ASPECT</p>
                        <p style={{ fontSize: '0.95rem', marginTop: '0.25rem' }}>{results.recruiterSimulation.strongestAspect}</p>
                      </div>
                      <div style={{ padding: '1rem', backgroundColor: 'var(--surface-sunken)', borderRadius: '8px', borderLeft: '4px solid var(--warning)' }}>
                        <p style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--text-muted)' }}>BIGGEST CONCERN</p>
                        <p style={{ fontSize: '0.95rem', marginTop: '0.25rem' }}>{results.recruiterSimulation.biggestConcern}</p>
                      </div>
                      <div style={{ padding: '1rem', backgroundColor: 'var(--surface-sunken)', borderRadius: '8px', borderLeft: '4px solid var(--text-main)' }}>
                        <p style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--text-muted)' }}>INTERVIEW READINESS</p>
                        <p style={{ fontSize: '1.1rem', fontWeight: 600, marginTop: '0.25rem' }}>{results.recruiterSimulation.interviewReadiness}</p>
                      </div>
                    </div>
                  </div>
                </article>
              </div>

              <div className="results-grid" style={{ marginBottom: '2rem' }}>
                <article className="results-card">
                  <div>
                    <p className="section-label">General Quality</p>
                    <h3 className="section-title">Resume Score</h3>
                  </div>
                  <div className="score-wrap">
                    <div className="score-value">{results.resumeScore}</div>
                    <div className="score-meta">
                      <span className="score-caption">out of 100</span>
                      <span className="score-grade">{results.resumeScore >= 90 ? "Outstanding" : results.resumeScore >= 75 ? "Good" : "Needs Work"}</span>
                    </div>
                  </div>
                  {results.jobMatchScore !== undefined && (
                    <div className="meter" style={{ marginTop: '2rem', borderTop: '1px solid var(--border)', paddingTop: '1.5rem' }}>
                      <div className="meter-row">
                        <span>Job Match Score</span>
                        <strong>{results.jobMatchScore}</strong>
                      </div>
                      <div className="meter-track" aria-hidden="true"><div className="meter-fill" style={{ width: `${results.jobMatchScore}%` }}></div></div>
                    </div>
                  )}
                </article>

                <article className="results-card compact">
                  <div className="list-block">
                    <h4 className="list-title">Top 5 Highest-Impact Fixes</h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '1rem' }}>
                      {results.topFiveFixes.map((fix: any, i: number) => (
                        <div key={i} style={{ display: 'flex', gap: '1rem', alignItems: 'center', padding: '0.75rem', backgroundColor: 'var(--surface-sunken)', borderRadius: '6px' }}>
                          <span style={{ padding: '0.25rem 0.5rem', backgroundColor: 'var(--background)', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 600, color: fix.impact === 'high' ? 'var(--warning)' : 'var(--text-main)' }}>{fix.expectedScoreGain}</span>
                          <span style={{ fontSize: '0.9rem', lineHeight: '1.4' }}>{fix.action}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </article>
              </div>

              <div className="results-grid" style={{ marginBottom: '2rem' }}>
                <article className="results-card" style={{ gridColumn: '1 / -1' }}>
                  <div>
                    <p className="section-label">System Parsing</p>
                    <h3 className="section-title">ATS Risk Scanner</h3>
                  </div>
                  
                  <div className="meter" style={{ marginBottom: '2rem' }}>
                    <div className="meter-row">
                      <span>ATS Compatibility Score: {results.atsVerdict}</span>
                      <strong>{results.atsScore}</strong>
                    </div>
                    <div className="meter-track" aria-hidden="true"><div className="meter-fill" style={{ width: `${results.atsScore}%` }}></div></div>
                  </div>

                  <div className="list-block">
                    <h4 className="list-title">Detected ATS Risks</h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
                      {results.atsRisks.length > 0 ? results.atsRisks.map((risk: any, i: number) => (
                        <div key={i} style={{ padding: '1.25rem', backgroundColor: risk.severity === 'high' ? 'rgba(255,59,48,0.05)' : 'var(--surface-sunken)', border: `1px solid ${risk.severity === 'high' ? 'rgba(255,59,48,0.2)' : 'var(--border)'}`, borderRadius: '8px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                            <strong style={{ color: 'var(--text-main)' }}>{risk.issue}</strong>
                            {renderSeverity(risk.severity)}
                          </div>
                          <p style={{ fontSize: '0.9rem', marginBottom: '0.75rem', lineHeight: '1.5' }}>{risk.explanation}</p>
                          <div style={{ padding: '0.75rem', backgroundColor: 'var(--background)', borderRadius: '4px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                            <strong style={{ color: 'var(--text-main)' }}>Fix: </strong>{risk.suggestedFix}
                          </div>
                        </div>
                      )) : (
                        <div style={{ padding: '1rem', backgroundColor: 'rgba(16,185,129,0.1)', color: '#10B981', borderRadius: '8px', border: '1px solid rgba(16,185,129,0.2)' }}>
                          No ATS risks detected! Your resume is highly parsable.
                        </div>
                      )}
                    </div>
                  </div>
                </article>
              </div>

              {results.missingKeywords && (
                <div className="results-grid" style={{ marginBottom: '2rem' }}>
                  <article className="results-card compact" style={{ gridColumn: '1 / -1' }}>
                    <div className="list-block">
                      <h4 className="list-title">Keyword Gap Analysis</h4>
                      <p className="micro-note" style={{ marginBottom: '1rem' }}>High importance keywords found in the Job Description but missing from your resume.</p>
                      <div className="keyword-wrap">
                        {results.missingKeywords.length > 0 ? results.missingKeywords.map((kw: any, i: number) => (
                          <span key={i} className="keyword-chip" style={kw.importance === 'high' ? { backgroundColor: 'rgba(255,59,48,0.1)', color: 'var(--warning)', borderColor: 'rgba(255,59,48,0.2)' } : {}}>
                            {kw.keyword} {kw.importance === 'high' ? '(!)' : ''}
                          </span>
                        )) : <span className="micro-note">No critical missing keywords found!</span>}
                      </div>
                    </div>
                  </article>
                </div>
              )}

              {results.tailoredSummary && (
                <div className="results-grid" style={{ marginBottom: '2rem' }}>
                  <article className="results-card compact" style={{ gridColumn: '1 / -1', borderTop: '4px solid var(--text-main)' }}>
                    <div>
                      <p className="section-label">Job Match Alignments</p>
                      <h3 className="section-title">Resume Tailoring</h3>
                    </div>

                    <div className="list-block" style={{ marginTop: '1.5rem', padding: '1.5rem', backgroundColor: 'var(--surface-sunken)', borderRadius: '8px' }}>
                      <h4 className="list-title">Tailored Professional Summary</h4>
                      <p style={{ fontSize: '0.95rem', lineHeight: '1.6', marginTop: '0.5rem' }}>{results.tailoredSummary}</p>
                    </div>

                    <div className="list-block" style={{ marginTop: '2rem' }}>
                      <h4 className="list-title">High-Impact Bullet Rewrites</h4>
                      <div className="examples" style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.5rem', marginTop: '1rem' }}>
                        {results.tailoredBullets.map((rev: any, i: number) => (
                          <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                            <article className="example-card before" style={{ margin: 0 }}>
                              <p className="example-label">Original (From Resume)</p>
                              <p className="example-text">{rev.before}</p>
                            </article>
                            <article className="example-card after" style={{ margin: 0 }}>
                              <p className="example-label">Tailored (For Target Role)</p>
                              <p className="example-text">{rev.after}</p>
                            </article>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="list-block" style={{ marginTop: '2.5rem' }}>
                      <h4 className="list-title">Tailoring Recommendations</h4>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '1rem' }}>
                        {results.tailoringRecommendations.map((rec: any, i: number) => (
                          <div key={i} style={{ display: 'flex', gap: '1rem', alignItems: 'center', padding: '1rem', borderBottom: '1px solid var(--border)' }}>
                            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)', minWidth: '100px' }}>{rec.section.toUpperCase()}</span>
                            <span style={{ fontSize: '0.95rem', lineHeight: '1.5' }}>{rec.recommendation}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </article>
                </div>
              )}

              {/* ACTION CENTER FOR ASSET GENERATION */}
              <div className="results-grid" style={{ marginTop: '3rem' }}>
                <article className="results-card" style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '3rem' }}>
                  <h3 className="section-title" style={{ marginBottom: '0.5rem' }}>Take the Next Step</h3>
                  <p className="section-copy" style={{ marginBottom: '2rem' }}>Generate tailored assets based on your verified analysis profile.</p>
                  
                  <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                    <button 
                      className="primary-button" 
                      onClick={generateCoverLetter} 
                      disabled={isGeneratingCL || !!coverLetter}
                      style={{ opacity: (isGeneratingCL || coverLetter) ? 0.6 : 1 }}
                    >
                      {isGeneratingCL ? "Drafting Cover Letter..." : coverLetter ? "Cover Letter Drafted" : "Generate Cover Letter"}
                    </button>
                    
                    <button 
                      className="primary-button" 
                      onClick={generateInterviewQuestions} 
                      disabled={isGeneratingIQ || !!interviewQuestions}
                      style={{ opacity: (isGeneratingIQ || interviewQuestions) ? 0.6 : 1, backgroundColor: 'var(--text-main)', color: 'var(--background)' }}
                    >
                      {isGeneratingIQ ? "Simulating Interview..." : interviewQuestions ? "Questions Generated" : "Generate Interview Questions"}
                    </button>
                  </div>
                  
                  {clError && <p style={{ color: 'var(--warning)', marginTop: '1rem' }}>{clError}</p>}
                  {iqError && <p style={{ color: 'var(--warning)', marginTop: '1rem' }}>{iqError}</p>}
                </article>
              </div>

              {/* GENERATED ASSETS DISPLAY */}
              {coverLetter && (
                <div className="results-grid" style={{ marginTop: '2rem' }}>
                  <article className="results-card" style={{ gridColumn: '1 / -1' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid var(--border)', paddingBottom: '1rem' }}>
                      <h3 className="section-title" style={{ margin: 0 }}>Cover Letter Draft</h3>
                      <button className="secondary-button" onClick={copyToClipboard} style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}>
                        {copiedCL ? "Copied!" : "Copy to Clipboard"}
                      </button>
                    </div>
                    <div style={{ padding: '2rem', backgroundColor: '#fff', color: '#000', borderRadius: '4px', whiteSpace: 'pre-wrap', fontFamily: 'Georgia, serif', lineHeight: '1.8', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
                      {coverLetter}
                    </div>
                  </article>
                </div>
              )}

              {interviewQuestions && (
                <div className="results-grid" style={{ marginTop: '2rem' }}>
                  <article className="results-card" style={{ gridColumn: '1 / -1' }}>
                    <div style={{ marginBottom: '1.5rem', borderBottom: '1px solid var(--border)', paddingBottom: '1rem' }}>
                      <h3 className="section-title" style={{ margin: 0 }}>Interview Preparation</h3>
                      <p className="section-copy" style={{ marginTop: '0.5rem' }}>Targeted questions based strictly on your resume claims and target role requirements.</p>
                    </div>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                      {interviewQuestions.map((q: any, i: number) => (
                        <div key={i} style={{ padding: '1.5rem', backgroundColor: 'var(--surface-sunken)', borderRadius: '8px', borderLeft: `4px solid ${i % 2 === 0 ? 'var(--text-main)' : '#10B981'}` }}>
                          <span style={{ fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)' }}>{q.category}</span>
                          <p style={{ fontSize: '1.1rem', fontWeight: 500, color: 'var(--text-main)', marginTop: '0.5rem', marginBottom: '1rem', lineHeight: '1.4' }}>"{q.question}"</p>
                          <div style={{ padding: '1rem', backgroundColor: 'var(--background)', borderRadius: '4px' }}>
                            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: '1.5' }}>
                              <strong style={{ color: 'var(--text-main)' }}>Focus Context: </strong>{q.focusContext}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </article>
                </div>
              )}

            </section>
          )}
        </div>
      </section>
    </main>
  );
}
