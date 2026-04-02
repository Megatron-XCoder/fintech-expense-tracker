import React, { useState, useRef } from 'react';
import { UploadCloud, File, X, CheckCircle, AlertCircle, FileSpreadsheet, ArrowRight } from 'lucide-react';
import api from '../lib/api-client';

const Upload = () => {
  const [dragActive, setDragActive] = useState(false);
  const [file, setFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState(null);
  const [error, setError] = useState('');
  const inputRef = useRef(null);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const validateAndSetFile = (selectedFile) => {
    setError('');
    setUploadResult(null);
    
    const extension = selectedFile.name.split('.').pop().toLowerCase();
    const isValidExtension = ['csv', 'xls', 'xlsx'].includes(extension);

    if (isValidExtension) {
      setFile(selectedFile);
    } else {
      setError('Please upload a valid CSV or Excel file.');
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setIsUploading(true);
    setError('');
    
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await api.post('/transactions/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setUploadResult(res.data);
      setFile(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Upload failed. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">Upload Statement</h1>
        <p className="text-sm text-slate-500 mt-1">Import your bank statement to track expenses</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Main upload area */}
        <div className="lg:col-span-2 space-y-4">
          {/* Drop zone */}
          <div
            className={`relative rounded-2xl border-2 border-dashed p-8 sm:p-12 text-center transition-all duration-300 cursor-pointer ${
              dragActive
                ? 'border-blue-500 bg-blue-500/[0.06]'
                : 'border-white/[0.08] hover:border-white/[0.15] bg-white/[0.02] hover:bg-white/[0.03]'
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={() => inputRef.current?.click()}
          >
            <input
              ref={inputRef}
              type="file"
              className="hidden"
              accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
              onChange={handleChange}
            />
            
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4 transition-colors ${
              dragActive ? 'bg-blue-500/15 text-blue-400' : 'bg-white/[0.05] text-slate-500'
            }`}>
              <UploadCloud className="w-7 h-7" />
            </div>
            
            <h3 className="text-lg font-semibold text-white mb-1.5">Drag & drop your file here</h3>
            <p className="text-sm text-slate-500 mb-4">or click to browse from your device</p>
            
            <div className="flex items-center justify-center gap-2 text-xs text-slate-600">
              <span className="px-2 py-1 rounded-md bg-white/[0.04] border border-white/[0.06]">CSV</span>
              <span className="px-2 py-1 rounded-md bg-white/[0.04] border border-white/[0.06]">XLS</span>
              <span className="px-2 py-1 rounded-md bg-white/[0.04] border border-white/[0.06]">XLSX</span>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="flex items-center gap-3 bg-red-500/[0.08] border border-red-500/20 text-red-400 p-4 rounded-xl text-sm">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* File selected */}
          {file && (
            <div className="rounded-2xl border border-blue-500/20 bg-blue-500/[0.04] p-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-500/15 flex items-center justify-center shrink-0">
                    <FileSpreadsheet className="w-5 h-5 text-blue-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">{file.name}</p>
                    <p className="text-xs text-slate-500">{(file.size / 1024).toFixed(1)} KB</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <button
                    onClick={handleUpload}
                    disabled={isUploading}
                    className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-lg shadow-blue-500/20 disabled:opacity-50"
                  >
                    {isUploading ? (
                      <>
                        <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        Upload
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => setFile(null)}
                    disabled={isUploading}
                    className="p-2.5 rounded-xl text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Upload success */}
          {uploadResult && (
            <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/[0.04] p-5 sm:p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/15 flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-emerald-400">Upload Successful</h3>
                  <p className="text-xs text-slate-500">{uploadResult.message}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-2 sm:gap-3">
                {[
                  { label: 'Parsed', value: uploadResult.data.totalParsed, color: 'text-white' },
                  { label: 'New', value: uploadResult.data.newAdded, color: 'text-emerald-400' },
                  { label: 'Skipped', value: uploadResult.data.duplicates, color: 'text-slate-400' },
                ].map((stat) => (
                  <div key={stat.label} className="rounded-xl bg-white/[0.03] border border-white/[0.06] p-3 sm:p-4 text-center">
                    <p className="text-[10px] sm:text-xs text-slate-500 font-medium uppercase tracking-wider mb-1">{stat.label}</p>
                    <p className={`text-lg sm:text-2xl font-bold ${stat.color}`}>{stat.value}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar info */}
        <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5 sm:p-6 h-fit">
          <h3 className="text-sm font-semibold text-white mb-1 flex items-center gap-2">
            <FileSpreadsheet className="w-4 h-4 text-blue-400" />
            Expected Format
          </h3>
          <p className="text-xs text-slate-600 mb-4">
            Your bank statement should contain these columns:
          </p>
          <ul className="space-y-2.5">
            {['Date', 'Details / Description', 'Ref No / Cheque No', 'Debit', 'Credit', 'Balance'].map((col) => (
              <li key={col} className="flex items-center gap-2.5 text-sm text-slate-400">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0" />
                {col}
              </li>
            ))}
          </ul>
          <div className="mt-5 pt-4 border-t border-white/[0.06]">
            <p className="text-[11px] text-slate-600 leading-relaxed">
              Currently optimized for SBI bank statement format. Multi-line descriptions and summary rows are handled automatically.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Upload;
