import React, { useState, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  UploadCloud,
  FileCheck,
  FileText,
  AlertCircle,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  Trash2,
  Eye,
  RefreshCw
} from 'lucide-react';
import { api } from '../api/client';
import { Resume } from '../types';

export const ResumeAnalyzerPage: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  // Fetch past resumes
  const { data: resumes, isLoading } = useQuery<Resume[]>({
    queryKey: ['resumes'],
    queryFn: () => api.getResumes(),
  });

  // Handle Drag events
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelected(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelected(e.target.files[0]);
    }
  };

  const handleFileSelected = (file: File) => {
    setUploadError(null);
    const ext = file.name.split('.').pop()?.toLowerCase();
    if (!['pdf', 'docx', 'doc'].includes(ext || '')) {
      setUploadError('Unsupported format. Please upload a PDF or DOCX resume.');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setUploadError('File size exceeds the 10MB limit.');
      return;
    }
    setSelectedFile(file);
  };

  // Upload and Parse
  const handleUploadAndAnalyze = async () => {
    if (!selectedFile) return;
    setIsUploading(true);
    setUploadError(null);
    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('title', selectedFile.name.replace(/\.[^/.]+$/, ''));

      const newResume = await api.uploadResume(formData);
      queryClient.invalidateQueries({ queryKey: ['resumes'] });

      // Trigger AI Analysis
      const analysis = await api.analyzeResume(newResume.id);
      navigate(`/resumes/${newResume.id}/report`);
    } catch (err: any) {
      setUploadError(err.message || 'Failed to upload and analyze document.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">AI Resume Analyzer</h1>
        <p className="text-xs text-slate-500 mt-1">
          Upload your resume for deep ATS scoring, rubric-based evaluation, and Google XYZ bullet rewrites.
        </p>
      </div>

      {/* Upload Zone */}
      <div className="bg-surface border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-card">
        {uploadError && (
          <div className="mb-5 p-3.5 bg-red-50 border border-red-200 rounded-xl flex items-center space-x-3 text-xs text-red-700">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{uploadError}</span>
          </div>
        )}

        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-xl p-8 sm:p-12 text-center cursor-pointer transition-all ${
            dragActive
              ? 'border-primary bg-indigo-50/50'
              : 'border-slate-300 hover:border-slate-400 bg-slate-50/50'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.docx,.doc"
            onChange={handleFileChange}
            className="hidden"
          />

          <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-200 text-primary flex items-center justify-center mx-auto mb-4">
            <UploadCloud className="w-6 h-6" />
          </div>

          <h3 className="text-sm font-bold text-slate-900">
            {selectedFile ? selectedFile.name : 'Click to upload or drag & drop your resume'}
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            Supports PDF or DOCX formats (up to 10MB). Text extraction preserves section structures.
          </p>

          {selectedFile && (
            <div className="mt-4 inline-flex items-center space-x-2 px-3 py-1 bg-white border border-slate-200 rounded-full text-xs font-semibold text-slate-700 shadow-sm">
              <CheckCircle2 className="w-3.5 h-3.5 text-success" />
              <span>{(selectedFile.size / 1024).toFixed(1)} KB ready for extraction</span>
            </div>
          )}
        </div>

        {selectedFile && (
          <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-100">
            <div className="text-xs text-slate-500 flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-primary" />
              <span>Scoring against 6 weighted placement dimensions (0-100 scale)</span>
            </div>
            <button
              onClick={handleUploadAndAnalyze}
              disabled={isUploading}
              className="w-full sm:w-auto px-6 py-2.5 bg-primary hover:bg-primary-hover text-white text-xs font-semibold rounded-lg shadow-sm transition-all flex items-center justify-center space-x-2 disabled:opacity-70"
            >
              {isUploading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Parsing & Scoring Document...</span>
                </>
              ) : (
                <>
                  <span>Extract & Generate AI Report</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        )}
      </div>

      {/* Previously Analyzed Resumes */}
      <div className="bg-surface border border-slate-200 rounded-2xl p-6 shadow-card">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-sm font-bold text-slate-900">Analyzed Resumes & Reports</h2>
            <p className="text-[11px] text-slate-500">Access and compare your previous analysis scores</p>
          </div>
          <Link
            to="/resumes/studio"
            className="text-xs font-semibold text-primary hover:underline flex items-center space-x-1"
          >
            <span>Open Resume Studio</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="space-y-3">
          {isLoading ? (
            <div className="h-20 bg-slate-100 rounded-xl animate-pulse"></div>
          ) : resumes && resumes.length > 0 ? (
            resumes.map((res) => (
              <div
                key={res.id}
                className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-slate-300 transition-colors"
              >
                <div className="flex items-center space-x-3 min-w-0">
                  <div className="w-9 h-9 rounded-lg bg-indigo-50 border border-indigo-200 text-primary flex items-center justify-center flex-shrink-0">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-sm font-semibold text-slate-900 truncate">{res.title}</h3>
                    <p className="text-[11px] text-slate-400">
                      Uploaded on {new Date(res.created_at).toLocaleDateString()} • {res.file_type?.toUpperCase() || 'PDF'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-4 self-end sm:self-auto">
                  <div className="text-right">
                    <div className="text-xs font-bold text-slate-900">
                      {res.latest_score !== null && res.latest_score !== undefined
                        ? `${res.latest_score}/100`
                        : 'Unscored'}
                    </div>
                    <div className="text-[10px] text-slate-400">ATS Score</div>
                  </div>

                  <Link
                    to={`/resumes/${res.id}/report`}
                    className="px-3 py-1.5 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-semibold rounded-lg shadow-subtle transition-all flex items-center space-x-1"
                  >
                    <Eye className="w-3.5 h-3.5 text-primary" />
                    <span>View Report</span>
                  </Link>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-slate-400 text-xs">
              No resumes uploaded yet. Upload a resume above to generate your first ATS analysis report.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
