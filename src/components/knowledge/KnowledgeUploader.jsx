import React, { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { KnowledgeService } from '../../services/knowledgeService';

export const KnowledgeUploader = ({ onSuccess }) => {
  const [file, setFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [step, setStep] = useState('idle');
  const [errorMsg, setErrorMsg] = useState('');

  const pollStatus = async (fileId) => {
    try {
      const check = async () => {
        const res = await KnowledgeService.checkTaskStatus(fileId);
        if (res.status === 'completed') {
          setStep('done');
          onSuccess();
        } else if (res.status === 'failed') {
          setStep('error');
          setErrorMsg(res.error || 'Document extraction failed.');
        } else {
          setTimeout(check, 2000);
        }
      };
      await check();
    } catch (err) {
      setStep('error');
      setErrorMsg(err.message || 'Error checking task status.');
    }
  };

  const handleUpload = async (acceptedFiles) => {
    const targetFile = acceptedFiles[0];
    if (!targetFile) return;

    setFile(targetFile);
    setStep('uploading');
    setUploadProgress(10);

    try {
      const fileData = await KnowledgeService.uploadFile(targetFile);
      setUploadProgress(50);
      setStep('extracting');
      // Extraction is triggered automatically by the backend's text-extraction worker.
      // Poll the knowledge base to check if indexed items have appeared.
      setUploadProgress(80);
      await pollStatus(fileData.id);
    } catch (err) {
      setStep('error');
      setErrorMsg(err.response?.data?.message || err.message || 'Upload failed.');
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: handleUpload,
    multiple: false,
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'image/*': ['.png', '.jpg', '.jpeg', '.webp'],
    },
  });

  return (
    <div className="w-full">
      {step === 'idle' && (
        <div
          {...getRootProps()}
          className={`relative z-10 flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-2xl cursor-pointer transition-all duration-300 ${
            isDragActive 
              ? 'border-[#6c48ff] bg-[#f4f7fe]' 
              : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
          }`}
        >
          <input {...getInputProps()} />
          <div className="p-3 rounded-full mb-3 bg-gray-50 text-gray-400">
            <svg className="h-6 w-6" stroke="currentColor" fill="none" viewBox="0 0 48 48">
              <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <p className="text-[13px] font-bold text-gray-900">
            {isDragActive ? 'Drop document here' : 'Drag & drop or click to upload business document'}
          </p>
          <p className="text-[11px] text-gray-500 font-medium mt-1">Supports PDF, DOCX, XLSX, PNG, JPG up to 32MB</p>
        </div>
      )}

      {step !== 'idle' && (
        <div className="flex flex-col items-center justify-center py-6">
          <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-4 text-white font-bold text-[16px] ${step === 'done' ? 'bg-emerald-500' : step === 'error' ? 'bg-red-500' : 'bg-[#6c48ff]'}`}>
            {step === 'done' ? (
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
            ) : step === 'error' ? (
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-6 h-6 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            )}
          </div>

          <div className="text-center w-full max-w-md">
            <h3 className="text-[14px] font-bold text-gray-900 mb-1">
              {step === 'uploading' && 'Uploading document...'}
              {step === 'extracting' && 'AI is classifying & indexing content...'}
              {step === 'done' && 'Knowledge added successfully!'}
              {step === 'error' && 'Ingestion Failed'}
            </h3>
            
            {(step === 'uploading' || step === 'extracting' || step === 'done') && (
              <div className="mt-4 mb-2">
                <div className="flex justify-between text-[11px] font-semibold text-gray-500 mb-2">
                  <span>Progress</span>
                  <span className="text-[#6c48ff]">{step === 'done' ? '100%' : `${uploadProgress}%`}</span>
                </div>
                <div className="w-full bg-[#f4f7fe] h-1.5 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-700 ease-out ${
                      step === 'done' ? 'bg-emerald-500' : 'bg-[#6c48ff]'
                    }`}
                    style={{ width: `${step === 'done' ? 100 : uploadProgress}%` }}
                  />
                </div>
              </div>
            )}

            {step === 'error' && (
              <div className="p-3 mt-3 bg-red-50 text-red-500 text-[12px] font-semibold rounded-xl">
                {errorMsg}
              </div>
            )}

            {(step === 'done' || step === 'error') && (
              <button
                onClick={() => setStep('idle')}
                className="mt-5 px-5 py-2 bg-white border border-gray-200 hover:bg-gray-50 text-gray-600 text-[12px] font-bold rounded-xl transition-all shadow-[0_2px_8px_rgba(0,0,0,0.02)]"
              >
                Upload Another File
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
