import React, { useState, useRef, useEffect } from 'react';
import { 
  Camera, 
  Upload, 
  RotateCcw, 
  AlertTriangle, 
  CheckCircle2, 
  Volume2, 
  VolumeX, 
  Leaf, 
  Beaker, 
  ShieldCheck, 
  Info, 
  Sparkles,
  FileCheck
} from 'lucide-react';
import { detectCropDisease } from '../../services/diseaseService';

const SAMPLE_LEAVES = [
  {
    name: "Tomato Septoria / Blight",
    path: "/samples/tomato_early_blight.jpg",
    desc: "Tomato leaf with chlorotic spots and necrotized margins"
  },
  {
    name: "Potato Early Blight",
    path: "/samples/potato_early_blight.jpg",
    desc: "Potato leaf showing concentric ring lesions (target board pattern)"
  },
  {
    name: "Healthy Plant Leaf",
    path: "/samples/healthy_leaf.jpg",
    desc: "Vibrant green pathogen-free foliage"
  }
];

export default function DiseaseDetectionView() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);
  const [activeTreatmentTab, setActiveTreatmentTab] = useState('organic');
  const [isSpeaking, setIsSpeaking] = useState(false);

  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);

  // Stop speaking on unmount
  useEffect(() => {
    return () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const handleFileValidation = (file) => {
    setError('');
    if (!file) return false;

    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
    if (!validTypes.includes(file.type)) {
      setError('Unsupported file type. Please upload a JPEG, PNG, or WEBP image.');
      return false;
    }

    if (file.size > 10 * 1024 * 1024) {
      setError(`File size exceeds 10MB limit (${(file.size / (1024 * 1024)).toFixed(1)}MB). Please choose a smaller photo.`);
      return false;
    }

    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    setResult(null);
    return true;
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFileValidation(e.target.files[0]);
    }
  };

  const handleSampleClick = async (sample) => {
    try {
      setError('');
      setLoading(true);
      setProgress(25);
      const res = await fetch(sample.path);
      const blob = await res.blob();
      const file = new File([blob], sample.path.split('/').pop(), { type: 'image/jpeg' });
      setSelectedFile(file);
      setPreviewUrl(sample.path);
      setProgress(50);
      await executeScan(file);
    } catch (err) {
      setError('Error loading sample image: ' + err.message);
      setLoading(false);
    }
  };

  const executeScan = async (fileToScan = selectedFile) => {
    if (!fileToScan) {
      setError('Please select or capture a plant leaf image first.');
      return;
    }

    setLoading(true);
    setError('');
    setProgress(30);

    const progressInterval = setInterval(() => {
      setProgress((prev) => (prev < 90 ? prev + 15 : prev));
    }, 150);

    try {
      const data = await detectCropDisease(fileToScan);
      clearInterval(progressInterval);
      setProgress(100);
      setResult(data);
    } catch (err) {
      clearInterval(progressInterval);
      setError(err.response?.data?.detail || err.message || 'Error processing leaf image with AI service.');
    } finally {
      setLoading(false);
    }
  };

  const handleVoiceReadout = () => {
    if (!('speechSynthesis' in window) || !result) return;

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    const textToSpeak = `
      Diagnosed condition: ${result.name_en}.
      Affected crop: ${result.crop}.
      Confidence score: ${result.confidence_percentage} percent.
      Severity: ${result.severity}.
      Organic treatment recommendation: ${result.treatments?.organic?.[0] || 'Apply neem oil spray.'}.
      Chemical remedy: ${result.treatments?.chemical?.[0] || 'Consult local agronomist.'}.
    `;

    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    utterance.rate = 0.95;
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
    setIsSpeaking(true);
  };

  const handleReset = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setResult(null);
    setError('');
    setProgress(0);
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  };

  return (
    <div style={{ padding: '32px 0' }}>
      <div className="container">
        {/* Header */}
        <div className="text-center mb-5">
          <span className="slbl">Clinical Plant Pathology AI</span>
          <h2 className="stitle">AI Crop <span>Disease Scanner</span></h2>
          <div className="sline"></div>
          <p className="sdesc mx-auto" style={{ maxWidth: '580px' }}>
            Powered by a trained EfficientNetB0 neural model. Upload or capture a leaf photo to receive an instant diagnostic triage, confidence rating, and ICAR-verified remedial prescription.
          </p>
        </div>

        {/* Quick Test Samples */}
        <div style={{ background: 'var(--cream)', border: '1px solid var(--border-color)', borderRadius: '16px', padding: '16px 20px', marginBottom: '32px' }}>
          <div className="d-flex align-items-center justify-content-between flex-wrap gap-2 mb-2">
            <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              <Sparkles size={15} style={{ verticalAlign: 'middle', marginRight: '6px' }} />
              Quick One-Click Test Samples:
            </span>
            <span style={{ fontSize: '0.78rem', color: 'var(--gray-muted)' }}>
              Click any sample below to run real inference
            </span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px' }}>
            {SAMPLE_LEAVES.map((sample, idx) => (
              <button
                key={idx}
                onClick={() => handleSampleClick(sample)}
                style={{
                  background: 'var(--white)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '10px',
                  padding: '10px 14px',
                  textAlign: 'left',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  transition: '0.2s',
                  cursor: 'pointer'
                }}
                onMouseOver={(e) => (e.currentTarget.style.borderColor = 'var(--secondary)')}
                onMouseOut={(e) => (e.currentTarget.style.borderColor = 'var(--border-color)')}
              >
                <img src={sample.path} alt={sample.name} style={{ width: '42px', height: '42px', borderRadius: '8px', objectFit: 'cover' }} />
                <div>
                  <strong style={{ display: 'block', fontSize: '0.85rem', color: 'var(--dark)' }}>{sample.name}</strong>
                  <span style={{ fontSize: '0.72rem', color: 'var(--gray-muted)' }}>{sample.desc.substring(0, 34)}...</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Upload & Results Section */}
        <div className="row g-4">
          {/* Left Column: Upload / Camera Box */}
          <div className="col-lg-5">
            <div style={{ background: 'var(--white)', border: '1px solid var(--border-color)', borderRadius: '20px', padding: '28px', boxShadow: 'var(--shadow)' }}>
              <h4 style={{ fontSize: '1.25rem', marginBottom: '8px', color: 'var(--dark)' }}>Leaf Image Capture</h4>
              <p style={{ fontSize: '0.84rem', color: 'var(--gray-muted)', marginBottom: '20px' }}>
                Ensure good daylight, clear focus on lesions, and plain background.
              </p>

              {/* Upload Dropzone */}
              <div
                style={{
                  border: '2px dashed var(--secondary)',
                  borderRadius: '16px',
                  padding: '24px',
                  textAlign: 'center',
                  background: 'var(--cream)',
                  minHeight: '260px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  position: 'relative',
                  overflow: 'hidden'
                }}
                onClick={() => !previewUrl && fileInputRef.current?.click()}
              >
                {previewUrl ? (
                  <div style={{ position: 'relative', width: '100%', height: '100%' }}>
                    <img
                      src={previewUrl}
                      alt="Uploaded Leaf"
                      style={{ maxHeight: '240px', maxWidth: '100%', borderRadius: '10px', objectFit: 'cover', margin: '0 auto' }}
                    />
                    <div style={{ marginTop: '12px', display: 'flex', gap: '8px', justifyContent: 'center' }}>
                      <button
                        className="btn-outline-green"
                        style={{ padding: '6px 14px', fontSize: '0.8rem' }}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleReset();
                        }}
                      >
                        <RotateCcw size={14} /> Retake / Clear
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'rgba(79, 138, 82, 0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--secondary)', marginBottom: '14px' }}>
                      <Upload size={28} />
                    </div>
                    <strong style={{ fontSize: '1rem', color: 'var(--dark)', marginBottom: '4px', display: 'block' }}>
                      Click to Browse or Drag &amp; Drop
                    </strong>
                    <span style={{ fontSize: '0.78rem', color: 'var(--gray-muted)' }}>
                      Supports JPEG, PNG, WEBP (Max 10MB)
                    </span>
                  </>
                )}
              </div>

              {/* Hidden file inputs */}
              <input
                type="file"
                ref={fileInputRef}
                style={{ display: 'none' }}
                accept="image/jpeg,image/png,image/webp"
                onChange={handleFileChange}
              />
              <input
                type="file"
                ref={cameraInputRef}
                style={{ display: 'none' }}
                accept="image/*"
                capture="environment"
                onChange={handleFileChange}
              />

              {/* Action Buttons */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '16px' }}>
                <button
                  className="btn-outline-green"
                  style={{ justifyContent: 'center' }}
                  onClick={() => cameraInputRef.current?.click()}
                >
                  <Camera size={16} /> Open Camera
                </button>
                <button
                  className="btn-green"
                  style={{ justifyContent: 'center' }}
                  onClick={() => executeScan()}
                  disabled={!selectedFile || loading}
                >
                  {loading ? (
                    <>
                      <i className="fas fa-spinner fa-spin"></i> Scanning...
                    </>
                  ) : (
                    <>
                      <Sparkles size={16} /> Run Diagnosis
                    </>
                  )}
                </button>
              </div>

              {/* Progress bar */}
              {loading && (
                <div style={{ marginTop: '16px' }}>
                  <div style={{ height: '6px', background: 'var(--cream2)', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{ width: `${progress}%`, height: '100%', background: 'linear-gradient(90deg, var(--secondary), var(--accent))', transition: 'width 0.2s' }}></div>
                  </div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--secondary)', fontWeight: 600, display: 'block', marginTop: '4px', textAlign: 'center' }}>
                    Preprocessing tensor &amp; calculating neural weights... {progress}%
                  </span>
                </div>
              )}

              {/* Error Message */}
              {error && (
                <div style={{ marginTop: '16px', padding: '12px', background: '#fee2e2', border: '1px solid #fca5a5', borderRadius: '10px', color: '#991b1b', fontSize: '0.85rem' }}>
                  <AlertTriangle size={16} style={{ verticalAlign: 'middle', marginRight: '6px' }} />
                  {error}
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Diagnostic Prescription Report */}
          <div className="col-lg-7">
            {result ? (
              <div style={{ background: 'var(--white)', border: '1px solid var(--border-color)', borderRadius: '20px', padding: '32px', boxShadow: 'var(--shadow-lg)' }}>
                {/* Header with status badge & TTS */}
                <div className="d-flex justify-content-between align-items-start flex-wrap gap-2 mb-3">
                  <div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--secondary)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px' }}>
                      Diagnostic Result · {result.crop}
                    </span>
                    <h3 style={{ fontSize: '1.8rem', color: 'var(--dark)', marginTop: '2px', marginBottom: '6px' }}>
                      {result.name_en}
                    </h3>
                    {(result.name_hi || result.name_mr) && (
                      <div style={{ fontSize: '0.88rem', color: 'var(--gray-muted)', display: 'flex', gap: '14px', flexWrap: 'wrap' }}>
                        {result.name_hi && <span>🇮🇳 <strong>हिंदी:</strong> {result.name_hi}</span>}
                        {result.name_mr && <span>🌾 <strong>मराठी:</strong> {result.name_mr}</span>}
                      </div>
                    )}
                  </div>

                  <div className="d-flex align-items-center gap-2">
                    <button
                      onClick={handleVoiceReadout}
                      title={isSpeaking ? 'Stop voice readout' : 'Listen in audio'}
                      style={{
                        background: isSpeaking ? '#fee2e2' : 'var(--cream)',
                        color: isSpeaking ? '#991b1b' : 'var(--primary)',
                        border: '1px solid var(--border-color)',
                        borderRadius: '50%',
                        width: '42px',
                        height: '42px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer'
                      }}
                    >
                      {isSpeaking ? <VolumeX size={18} /> : <Volume2 size={18} />}
                    </button>
                    <span
                      style={{
                        background: result.is_healthy ? '#dcfce7' : (result.severity_code === 'moderate' ? '#fef3c7' : '#fee2e2'),
                        color: result.is_healthy ? '#166534' : (result.severity_code === 'moderate' ? '#92400e' : '#991b1b'),
                        padding: '6px 14px',
                        borderRadius: '20px',
                        fontSize: '0.78rem',
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        border: '1px solid currentColor'
                      }}
                    >
                      {result.severity}
                    </span>
                  </div>
                </div>

                {/* Accuracy & Pathogen Badges */}
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '22px' }}>
                  <div style={{ background: 'var(--cream)', padding: '8px 14px', borderRadius: '10px', border: '1px solid var(--border-color)', fontSize: '0.82rem' }}>
                    <span style={{ color: 'var(--gray-muted)' }}>Confidence: </span>
                    <strong style={{ color: 'var(--primary)' }}>{result.confidence_percentage}%</strong>
                  </div>
                  <div style={{ background: 'var(--cream)', padding: '8px 14px', borderRadius: '10px', border: '1px solid var(--border-color)', fontSize: '0.82rem' }}>
                    <span style={{ color: 'var(--gray-muted)' }}>Pathogen: </span>
                    <strong style={{ color: 'var(--dark)' }}>{result.pathogen}</strong>
                  </div>
                  <div style={{ background: 'var(--cream)', padding: '8px 14px', borderRadius: '10px', border: '1px solid var(--border-color)', fontSize: '0.82rem' }}>
                    <span style={{ color: 'var(--gray-muted)' }}>Architecture: </span>
                    <strong style={{ color: 'var(--dark)' }}>EfficientNetB0 TFLite</strong>
                  </div>
                </div>

                {/* Top 3 Predictions Bar */}
                {result.top_predictions && result.top_predictions.length > 1 && (
                  <div style={{ background: '#f8fafc', padding: '14px 18px', borderRadius: '12px', border: '1px solid #e2e8f0', marginBottom: '22px' }}>
                    <span style={{ fontSize: '0.76rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', display: 'block', marginBottom: '8px' }}>
                      Diagnostic Transparency (Top 3 Model Logits):
                    </span>
                    {result.top_predictions.map((p, idx) => (
                      <div key={idx} style={{ marginBottom: '6px' }}>
                        <div className="d-flex justify-content-between" style={{ fontSize: '0.8rem', marginBottom: '2px' }}>
                          <span>{p.class_name}</span>
                          <strong>{p.confidence}%</strong>
                        </div>
                        <div style={{ height: '4px', background: '#e2e8f0', borderRadius: '2px', overflow: 'hidden' }}>
                          <div style={{ width: `${p.confidence}%`, height: '100%', background: idx === 0 ? 'var(--secondary)' : '#94a3b8' }}></div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Spread Factors Alert */}
                <div style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: '12px', padding: '14px 18px', marginBottom: '24px' }}>
                  <div style={{ fontSize: '0.85rem', color: '#92400e', lineHeight: 1.6 }}>
                    <strong><Info size={15} style={{ verticalAlign: 'middle', marginRight: '5px' }} /> Epidemiological Spread Factors:</strong> {result.spread_factors}
                  </div>
                </div>

                {/* Treatment Tabs */}
                <div style={{ borderBottom: '1px solid var(--border-color)', display: 'flex', gap: '8px', marginBottom: '18px' }}>
                  {[
                    { id: 'organic', label: 'Organic Bio-Remedies', icon: Leaf },
                    { id: 'chemical', label: 'Chemical Fungicides', icon: Beaker },
                    { id: 'cultural', label: 'Field Hygiene & Cultural', icon: ShieldCheck }
                  ].map((tab) => {
                    const Icon = tab.icon;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTreatmentTab(tab.id)}
                        style={{
                          padding: '10px 16px',
                          borderBottom: activeTreatmentTab === tab.id ? '3px solid var(--secondary)' : '3px solid transparent',
                          color: activeTreatmentTab === tab.id ? 'var(--secondary)' : 'var(--gray-muted)',
                          fontWeight: 700,
                          fontSize: '0.85rem',
                          background: 'none',
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px'
                        }}
                      >
                        <Icon size={15} />
                        {tab.label}
                      </button>
                    );
                  })}
                </div>

                {/* Treatment Tab Content */}
                <div style={{ background: 'var(--cream)', borderRadius: '14px', padding: '20px', border: '1px solid var(--border-color)' }}>
                  <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                    {result.treatments?.[activeTreatmentTab]?.map((item, idx) => (
                      <li key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', marginBottom: '12px', fontSize: '0.88rem', lineHeight: 1.6, color: 'var(--dark)' }}>
                        <span style={{ color: 'var(--secondary)', marginTop: '3px' }}><CheckCircle2 size={16} /></span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ) : (
              <div style={{ background: 'var(--white)', border: '2px dashed var(--border-color)', borderRadius: '20px', padding: '60px 30px', textAlign: 'center', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ width: '70px', height: '70px', borderRadius: '50%', background: 'var(--cream)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--secondary)', marginBottom: '16px' }}>
                  <Leaf size={32} />
                </div>
                <h4 style={{ fontSize: '1.25rem', color: 'var(--dark)', marginBottom: '8px' }}>No Diagnosis Yet</h4>
                <p style={{ fontSize: '0.88rem', color: 'var(--gray-muted)', maxWidth: '380px' }}>
                  Upload a crop leaf photo on the left or select a sample image above to generate an instant pathology diagnosis and cure plan.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
