import React, { useState } from 'react';
import { Box, Typography, TextField, Button, Paper, CircularProgress, Alert } from '@mui/material';
import GavelIcon from '@mui/icons-material/Gavel';

interface FactCheckResponse {
  input_text: string;
  total_sentences: number;
  claims_found: number;
  reliability_score: number;
  summary: string;
}

const FactChecker: React.FC = () => {
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<FactCheckResponse | null>(null);

  const submit = async () => {
    setError(null);
    setResult(null);
    if (!text.trim()) {
      setError('Please enter text to analyze.');
      return;
    }

    setLoading(true);
    try {
      const resp = await fetch('/api/fact-check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text })
      });

      if (!resp.ok) {
        const errBody = await resp.json().catch(() => ({} as Record<string, unknown>));
        let errMsg = `Server returned ${resp.status}`;
        if (typeof errBody === 'object' && errBody !== null && 'error' in errBody) {
          const val = (errBody as Record<string, unknown>)['error'];
          errMsg = typeof val === 'string' ? val : String(val);
        }
        throw new Error(errMsg);
      }

      const data = (await resp.json()) as FactCheckResponse;
      setResult(data);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      setError(message || 'Unknown error');
    } finally {
      setLoading(false);
    }
  }

  return (
  <Box id="fact-checker-panel" className="panel-container" sx={{ height: 'auto', minHeight: '360px' }}>
      <div className="floating-element-top-right"></div>

      <Typography variant="h5" className="section-title" sx={{ display: 'flex', alignItems: 'center' }}>
        <GavelIcon sx={{ mr: 1, color: '#00ED64' }} /> Fact Checker
      </Typography>

      <Typography variant="body2" className="section-description" sx={{ mb: 2 }}>
        Paste text or claims below and press "Check Facts" to analyze reliability and get a summary.
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <TextField
        multiline
        minRows={6}
        fullWidth
        placeholder="Enter text to fact-check..."
        value={text}
        onChange={(e) => setText(e.target.value)}
        sx={{
          mb: 2,
          // make sure the input text is readable on dark backgrounds
          '& .MuiInputBase-input': {
            color: 'rgba(255,255,255,0.92)',
            WebkitTextFillColor: 'rgba(255,255,255,0.92)',
          },
          '& .MuiOutlinedInput-input': {
            color: 'rgba(255,255,255,0.92)'
          },
          '& .MuiFormLabel-root': {
            color: 'rgba(255,255,255,0.6)'
          },
          '& .MuiOutlinedInput-root': {
            backgroundColor: 'transparent',
            '& fieldset': {
              borderColor: 'rgba(0,123,255,0.35)'
            },
            '&:hover fieldset': {
              borderColor: 'rgba(0,123,255,0.6)'
            },
            '&.Mui-focused fieldset': {
              borderColor: '#00ED64'
            }
          }
        }}
      />

      <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
        <Button variant="contained" onClick={submit} disabled={loading}>
          {loading ? <CircularProgress size={18} color="inherit" /> : 'Check Facts'}
        </Button>
        <Button variant="outlined" onClick={() => { setText(''); setResult(null); setError(null); }}>
          Clear
        </Button>
      </Box>

      {result && (
        <Paper elevation={0} sx={{ p: 2, background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)' }}>
          <Typography variant="subtitle2" sx={{ color: 'rgba(255,255,255,0.7)', mb: 1 }}>Summary</Typography>
          <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', mb: 2 }}>{result.summary}</Typography>

          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}><b>Sentences:</b> {result.total_sentences}</Typography>
            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}><b>Claims Found:</b> {result.claims_found}</Typography>
            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}><b>Reliability:</b> {result.reliability_score}/100</Typography>
          </Box>
        </Paper>
      )}
    </Box>
  );
}

export default FactChecker;
