import React, { useState } from 'react';
import { 
  Sprout, 
  FlaskConical, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle, 
  CloudRain, 
  Thermometer, 
  Droplets, 
  Layers, 
  RotateCcw,
  Info,
  Calendar
} from 'lucide-react';
import { getCropAndFertilizerRecommendation } from '../../services/cropService';

const REGIONAL_PRESETS = [
  {
    name: "Alluvial Soil (Punjab/Haryana)",
    desc: "Canal irrigated, high nitrogen demand",
    params: { nitrogen: 105, phosphorus: 48, potassium: 52, temperature: 24.0, humidity: 82.0, ph: 6.8, rainfall: 210.0 }
  },
  {
    name: "Black Soil (Maharashtra/MP)",
    desc: "Clay rich, high moisture retention",
    params: { nitrogen: 85, phosphorus: 55, potassium: 70, temperature: 28.5, humidity: 62.0, ph: 7.6, rainfall: 88.0 }
  },
  {
    name: "Red Loamy Soil (South India)",
    desc: "Light texture, low natural N & P",
    params: { nitrogen: 45, phosphorus: 28, potassium: 35, temperature: 29.0, humidity: 68.0, ph: 6.2, rainfall: 115.0 }
  },
  {
    name: "Sandy Loam (Rajasthan/Gujarat)",
    desc: "Arid to semi-arid, low rainfall",
    params: { nitrogen: 35, phosphorus: 22, potassium: 30, temperature: 31.0, humidity: 45.0, ph: 7.8, rainfall: 45.0 }
  }
];

export default function CropRecommendationView() {
  const [params, setParams] = useState({
    nitrogen: 90,
    phosphorus: 42,
    potassium: 43,
    temperature: 24.5,
    humidity: 78.0,
    ph: 6.5,
    rainfall: 180.0
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);

  const handleInputChange = (field, value) => {
    setParams(prev => ({ ...prev, [field]: parseFloat(value) || 0 }));
  };

  const handleApplyPreset = (preset) => {
    setParams(preset.params);
    setError('');
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const data = await getCropAndFertilizerRecommendation(params);
      setResult(data);
    } catch (err) {
      setError(err.response?.data?.detail || err.message || 'Error generating recommendation.');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setParams({
      nitrogen: 90,
      phosphorus: 42,
      potassium: 43,
      temperature: 24.5,
      humidity: 78.0,
      ph: 6.5,
      rainfall: 180.0
    });
    setResult(null);
    setError('');
  };

  return (
    <div style={{ padding: '32px 0' }}>
      <div className="container">
        {/* Header */}
        <div className="text-center mb-5">
          <span className="slbl">Agronomic Soil Health &amp; Crop Planning</span>
          <h2 className="stitle">AI Crop &amp; <span>Fertilizer Advisor</span></h2>
          <div className="sline"></div>
          <p className="sdesc mx-auto" style={{ maxWidth: '600px' }}>
            Input your soil testing laboratory metrics (N-P-K &amp; pH) and regional climate conditions to receive an ICAR-calibrated crop suitability evaluation and custom fertilizer dosage plan.
          </p>
        </div>

        {/* Regional Presets Bar */}
        <div style={{ background: 'var(--cream)', border: '1px solid var(--border-color)', borderRadius: '16px', padding: '16px 20px', marginBottom: '30px' }}>
          <div className="d-flex align-items-center justify-content-between flex-wrap gap-2 mb-2">
            <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              <Layers size={15} style={{ verticalAlign: 'middle', marginRight: '6px' }} />
              Quick Regional Soil Presets:
            </span>
            <span style={{ fontSize: '0.78rem', color: 'var(--gray-muted)' }}>
              Click to autofill typical regional soil metrics
            </span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '10px' }}>
            {REGIONAL_PRESETS.map((preset, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleApplyPreset(preset)}
                style={{
                  background: 'var(--white)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '10px',
                  padding: '10px 14px',
                  textAlign: 'left',
                  cursor: 'pointer',
                  transition: '0.2s'
                }}
                onMouseOver={(e) => (e.currentTarget.style.borderColor = 'var(--secondary)')}
                onMouseOut={(e) => (e.currentTarget.style.borderColor = 'var(--border-color)')}
              >
                <strong style={{ display: 'block', fontSize: '0.84rem', color: 'var(--dark)' }}>{preset.name}</strong>
                <span style={{ fontSize: '0.72rem', color: 'var(--gray-muted)' }}>{preset.desc}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Main 2-Column Form & Results Layout */}
        <div className="row g-4">
          {/* Left Column: Soil & Climate Input Form */}
          <div className="col-lg-5">
            <div style={{ background: 'var(--white)', border: '1px solid var(--border-color)', borderRadius: '20px', padding: '30px', boxShadow: 'var(--shadow)' }}>
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h4 style={{ fontSize: '1.25rem', color: 'var(--dark)' }}>Soil &amp; Climate Metrics</h4>
                <button
                  type="button"
                  onClick={handleReset}
                  className="btn-outline-green"
                  style={{ padding: '4px 10px', fontSize: '0.75rem' }}
                >
                  <RotateCcw size={12} /> Reset
                </button>
              </div>

              <form onSubmit={handleSubmit}>
                {/* Nitrogen */}
                <div style={{ marginBottom: '16px' }}>
                  <div className="d-flex justify-content-between" style={{ fontSize: '0.8rem', fontWeight: 600, marginBottom: '4px' }}>
                    <span>Nitrogen (N in Soil)</span>
                    <strong style={{ color: 'var(--primary)' }}>{params.nitrogen} kg/ha</strong>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="350"
                    value={params.nitrogen}
                    onChange={(e) => handleInputChange('nitrogen', e.target.value)}
                    style={{ width: '100%', accentColor: 'var(--secondary)' }}
                  />
                  <div className="d-flex justify-content-between" style={{ fontSize: '0.7rem', color: 'var(--gray-muted)' }}>
                    <span>Low (&lt;280)</span>
                    <span>Medium</span>
                    <span>High (&gt;560)</span>
                  </div>
                </div>

                {/* Phosphorus */}
                <div style={{ marginBottom: '16px' }}>
                  <div className="d-flex justify-content-between" style={{ fontSize: '0.8rem', fontWeight: 600, marginBottom: '4px' }}>
                    <span>Phosphorus (P in Soil)</span>
                    <strong style={{ color: 'var(--primary)' }}>{params.phosphorus} kg/ha</strong>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="150"
                    value={params.phosphorus}
                    onChange={(e) => handleInputChange('phosphorus', e.target.value)}
                    style={{ width: '100%', accentColor: 'var(--secondary)' }}
                  />
                  <div className="d-flex justify-content-between" style={{ fontSize: '0.7rem', color: 'var(--gray-muted)' }}>
                    <span>Low (&lt;10)</span>
                    <span>Medium (10-25)</span>
                    <span>High (&gt;25)</span>
                  </div>
                </div>

                {/* Potassium */}
                <div style={{ marginBottom: '16px' }}>
                  <div className="d-flex justify-content-between" style={{ fontSize: '0.8rem', fontWeight: 600, marginBottom: '4px' }}>
                    <span>Potassium (K in Soil)</span>
                    <strong style={{ color: 'var(--primary)' }}>{params.potassium} kg/ha</strong>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="200"
                    value={params.potassium}
                    onChange={(e) => handleInputChange('potassium', e.target.value)}
                    style={{ width: '100%', accentColor: 'var(--secondary)' }}
                  />
                  <div className="d-flex justify-content-between" style={{ fontSize: '0.7rem', color: 'var(--gray-muted)' }}>
                    <span>Low (&lt;110)</span>
                    <span>Medium (110-280)</span>
                    <span>High (&gt;280)</span>
                  </div>
                </div>

                {/* Soil pH */}
                <div style={{ marginBottom: '18px' }}>
                  <div className="d-flex justify-content-between" style={{ fontSize: '0.8rem', fontWeight: 600, marginBottom: '4px' }}>
                    <span>Soil Reaction (pH Level)</span>
                    <strong style={{ color: params.ph < 6 ? '#b91c1c' : (params.ph > 7.5 ? '#b45309' : 'var(--secondary)') }}>
                      pH {params.ph} ({params.ph < 6 ? 'Acidic' : (params.ph > 7.5 ? 'Alkaline' : 'Neutral')})
                    </strong>
                  </div>
                  <input
                    type="range"
                    step="0.1"
                    min="4.0"
                    max="9.5"
                    value={params.ph}
                    onChange={(e) => handleInputChange('ph', e.target.value)}
                    style={{ width: '100%', accentColor: 'var(--secondary)' }}
                  />
                  <div className="d-flex justify-content-between" style={{ fontSize: '0.7rem', color: 'var(--gray-muted)' }}>
                    <span>4.0 (Acidic)</span>
                    <span>7.0 (Neutral)</span>
                    <span>9.5 (Alkaline)</span>
                  </div>
                </div>

                {/* Weather Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px', marginBottom: '22px' }}>
                  <div>
                    <label style={{ fontSize: '0.74rem', fontWeight: 700, color: 'var(--dark)', display: 'block', marginBottom: '4px' }}>
                      <Thermometer size={13} style={{ verticalAlign: 'middle' }} /> Temp (°C)
                    </label>
                    <input
                      type="number"
                      step="0.5"
                      value={params.temperature}
                      onChange={(e) => handleInputChange('temperature', e.target.value)}
                      style={{ width: '100%', padding: '8px', borderRadius: '8px', border: '1px solid var(--border-color)', fontSize: '0.85rem' }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.74rem', fontWeight: 700, color: 'var(--dark)', display: 'block', marginBottom: '4px' }}>
                      <Droplets size={13} style={{ verticalAlign: 'middle' }} /> Humidity (%)
                    </label>
                    <input
                      type="number"
                      value={params.humidity}
                      onChange={(e) => handleInputChange('humidity', e.target.value)}
                      style={{ width: '100%', padding: '8px', borderRadius: '8px', border: '1px solid var(--border-color)', fontSize: '0.85rem' }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.74rem', fontWeight: 700, color: 'var(--dark)', display: 'block', marginBottom: '4px' }}>
                      <CloudRain size={13} style={{ verticalAlign: 'middle' }} /> Rain (mm)
                    </label>
                    <input
                      type="number"
                      value={params.rainfall}
                      onChange={(e) => handleInputChange('rainfall', e.target.value)}
                      style={{ width: '100%', padding: '8px', borderRadius: '8px', border: '1px solid var(--border-color)', fontSize: '0.85rem' }}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="btn-green"
                  style={{ width: '100%', justifyContent: 'center' }}
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <i className="fas fa-spinner fa-spin"></i> Calculating Agronomic Fit...
                    </>
                  ) : (
                    <>
                      <Sparkles size={16} /> Evaluate Crop &amp; Fertilizer
                    </>
                  )}
                </button>
              </form>

              {error && (
                <div style={{ marginTop: '16px', padding: '12px', background: '#fee2e2', borderRadius: '10px', color: '#991b1b', fontSize: '0.84rem' }}>
                  <AlertCircle size={15} style={{ verticalAlign: 'middle', marginRight: '6px' }} />
                  {error}
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Recommendation & Fertilizer Prescription Card */}
          <div className="col-lg-7">
            {result ? (
              <div style={{ background: 'var(--white)', border: '1px solid var(--border-color)', borderRadius: '20px', padding: '32px', boxShadow: 'var(--shadow-lg)' }}>
                {/* Recommendation Banner */}
                <div style={{ background: 'linear-gradient(135deg, var(--primary), var(--secondary))', borderRadius: '16px', padding: '24px', color: 'var(--white)', marginBottom: '24px' }}>
                  <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--accent)', fontWeight: 700 }}>
                    ⭐ Primary Recommended Crop
                  </span>
                  <div className="d-flex justify-content-between align-items-center flex-wrap gap-2" style={{ marginTop: '4px' }}>
                    <div>
                      <h3 style={{ fontSize: '2rem', color: 'var(--white)', margin: 0 }}>
                        {result.primary_recommendation.crop}
                      </h3>
                      <span style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.85)' }}>
                        🇮🇳 <strong>{result.primary_recommendation.hindi_name}</strong> · {result.primary_recommendation.category}
                      </span>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <span style={{ fontSize: '2.2rem', fontFamily: 'Playfair Display', fontWeight: 900, color: 'var(--accent)', display: 'block', lineHeight: 1 }}>
                        {result.primary_recommendation.suitability_score}%
                      </span>
                      <small style={{ fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Suitability Fit</small>
                    </div>
                  </div>
                  <div style={{ marginTop: '14px', paddingTop: '12px', borderTop: '1px solid rgba(255,255,255,0.15)', fontSize: '0.85rem', color: 'rgba(255,255,255,0.9)' }}>
                    <strong>Soil &amp; Climate Envelope:</strong> {result.primary_recommendation.soil_suitability} · Best Season: {result.primary_recommendation.season}
                  </div>
                </div>

                {/* Alternative Crops Grid */}
                {result.alternative_crops && result.alternative_crops.length > 0 && (
                  <div style={{ marginBottom: '26px' }}>
                    <span style={{ fontSize: '0.78rem', color: 'var(--gray-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginBottom: '10px' }}>
                      Alternative Compatible Crops:
                    </span>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '10px' }}>
                      {result.alternative_crops.map((alt, idx) => (
                        <div key={idx} style={{ background: 'var(--cream)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '12px 14px' }}>
                          <div className="d-flex justify-content-between align-items-center">
                            <strong style={{ fontSize: '0.9rem', color: 'var(--dark)' }}>{alt.crop}</strong>
                            <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--secondary)' }}>{alt.suitability_score}%</span>
                          </div>
                          <span style={{ fontSize: '0.72rem', color: 'var(--gray-muted)', display: 'block', marginTop: '2px' }}>
                            {alt.hindi_name} · {alt.season}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Precision Fertilizer Guidance Box */}
                {result.fertilizer_guidance && (
                  <div>
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <h5 style={{ fontSize: '1.15rem', color: 'var(--dark)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <FlaskConical size={18} color="var(--secondary)" />
                        Custom N-P-K Fertilizer Prescription
                      </h5>
                    </div>

                    {/* Prescription Table / Cards */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '18px' }}>
                      {result.fertilizer_guidance.fertilizer_recommendations.map((f, idx) => (
                        <div key={idx} style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '14px 16px' }}>
                          <div className="d-flex justify-content-between align-items-center flex-wrap gap-1 mb-1">
                            <div>
                              <strong style={{ fontSize: '0.92rem', color: 'var(--dark)' }}>{f.nutrient}: {f.product}</strong>
                              <span style={{ fontSize: '0.74rem', marginLeft: '8px', color: '#64748b', background: '#e2e8f0', padding: '2px 8px', borderRadius: '10px' }}>
                                {f.status}
                              </span>
                            </div>
                            <span style={{ fontWeight: 700, color: 'var(--primary)', fontSize: '0.95rem' }}>
                              Dosage: {f.dosage}
                            </span>
                          </div>
                          <p style={{ fontSize: '0.8rem', color: '#64748b', margin: 0 }}>
                            📌 <em>Application Note:</em> {f.timing}
                          </p>
                        </div>
                      ))}
                    </div>

                    {/* pH Correction & Bio-fertilizer Callout */}
                    <div style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: '12px', padding: '14px 16px', marginBottom: '18px' }}>
                      <strong style={{ fontSize: '0.84rem', color: '#92400e', display: 'block', marginBottom: '4px' }}>
                        <Info size={14} style={{ verticalAlign: 'middle', marginRight: '4px' }} />
                        Soil pH Correction Advice:
                      </strong>
                      <p style={{ fontSize: '0.82rem', color: '#78350f', margin: 0, lineHeight: 1.5 }}>
                        {result.fertilizer_guidance.ph_correction}
                      </p>
                    </div>

                    {/* Bio-fertilizer list */}
                    <div style={{ background: 'var(--cream)', borderRadius: '12px', padding: '14px 16px', border: '1px solid var(--border-color)' }}>
                      <strong style={{ fontSize: '0.82rem', color: 'var(--primary)', display: 'block', marginBottom: '8px' }}>
                        🌿 Organic &amp; Bio-Fertilizer Supplements (ICAR Recommended):
                      </strong>
                      <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '0.8rem', color: 'var(--dark)', lineHeight: 1.6 }}>
                        {result.fertilizer_guidance.bio_fertilizers.map((bio, idx) => (
                          <li key={idx}>{bio}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div style={{ background: 'var(--white)', border: '2px dashed var(--border-color)', borderRadius: '20px', padding: '60px 30px', textAlign: 'center', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ width: '70px', height: '70px', borderRadius: '50%', background: 'var(--cream)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--secondary)', marginBottom: '16px' }}>
                  <Sprout size={32} />
                </div>
                <h4 style={{ fontSize: '1.25rem', color: 'var(--dark)', marginBottom: '8px' }}>Awaiting Soil Parameters</h4>
                <p style={{ fontSize: '0.88rem', color: 'var(--gray-muted)', maxWidth: '380px' }}>
                  Adjust soil N-P-K, pH, and rainfall metrics on the left, or select a regional preset to receive an instant crop evaluation and fertilizer prescription.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
