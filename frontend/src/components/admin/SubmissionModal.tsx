'use client';

import React from 'react';
import { FormSubmission } from '@/types';
import { X, Calendar, User, FileText, CheckCircle, Clock } from 'lucide-react';

interface SubmissionModalProps {
  submission: FormSubmission | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function SubmissionModal({ submission, isOpen, onClose }: SubmissionModalProps) {
  if (!isOpen || !submission) return null;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const renderFormData = (data: any) => {
    // Debug: Log the data structure
    console.log('Form data type:', typeof data);
    console.log('Form data:', data);
    
    // Handle different data formats
    let formData = data;
    
    // If data is a string, try to parse it as JSON
    if (typeof data === 'string') {
      try {
        formData = JSON.parse(data);
        console.log('Parsed JSON:', formData);
      } catch (e) {
        console.log('Failed to parse JSON:', e);
        return <span className="text-gray-600">{data}</span>;
      }
    }
    
    // If it's not an object or is null, display as is
    if (typeof formData !== 'object' || formData === null) {
      return <span className="text-gray-600">{String(formData)}</span>;
    }

    // Count only top-level fields for display
    const topLevelFields = Object.keys(formData).length;
    console.log('Top level fields count:', topLevelFields);

    const formatFieldName = (key: string) => {
      return key
        .replace(/_/g, ' ')
        .replace(/\b\w/g, l => l.toUpperCase());
    };

    const formatFieldValue = (value: any) => {
      if (value === null || value === undefined) {
        return <span className="text-gray-400 italic">Not provided</span>;
      }
      if (typeof value === 'boolean') {
        return <span className={`font-medium ${value ? 'text-green-600' : 'text-red-600'}`}>
          {value ? 'Yes' : 'No'}
        </span>;
      }
      if (typeof value === 'number') {
        return <span className="font-mono text-gray-900">{value.toLocaleString()}</span>;
      }
      if (typeof value === 'object') {
        return (
          <div className="space-y-1">
            <div className="text-gray-900 text-xs font-mono bg-gray-100 p-2 rounded">
              {JSON.stringify(value, null, 2)}
            </div>
            <div className="text-xs text-gray-500">(Object with {Object.keys(value).length} properties)</div>
          </div>
        );
      }
      if (typeof value === 'string') {
        const stringValue = String(value);
        if (stringValue.length > 50) {
          return (
            <div className="space-y-1">
              <div className="text-gray-900 break-words">{stringValue}</div>
              <div className="text-xs text-gray-500">({stringValue.length} characters)</div>
            </div>
          );
        }
        return <span className="text-gray-900 break-words">{stringValue}</span>;
      }
      return <span className="text-gray-900 break-words">{String(value)}</span>;
    };

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {Object.entries(formData).map(([key, value]) => (
          <div key={key} className="bg-white border border-gray-200 rounded-lg p-3">
            <div className="font-medium text-gray-700 mb-1 text-sm">
              {formatFieldName(key)}
            </div>
            <div className="text-gray-900 text-sm">
              {formatFieldValue(value)}
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-gray-900/30 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-lg shadow-2xl max-w-5xl w-full max-h-[95vh] overflow-hidden border border-gray-200 animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <FileText className="h-6 w-6 text-blue-600" />
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                Submission #{submission.id}
              </h2>
              <p className="text-sm text-gray-500">
                Form: {submission.form_template_name || 'Unknown Form'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(95vh-140px)]">
          <div className="space-y-6">
            {/* Submission Info */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900 flex items-center">
                <User className="h-5 w-5 mr-2" />
                Submission Details
              </h3>
              
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Submitted By</span>
                    <p className="text-sm font-medium text-gray-900 mt-1">{submission.submitted_by}</p>
                  </div>
                  
                  <div>
                    <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</span>
                    <div className="flex items-center mt-1">
                      {submission.is_processed ? (
                        <>
                          <CheckCircle className="h-4 w-4 text-green-500 mr-1" />
                          <span className="text-sm text-green-600 font-semibold">Processed</span>
                        </>
                      ) : (
                        <>
                          <Clock className="h-4 w-4 text-yellow-500 mr-1" />
                          <span className="text-sm text-yellow-600 font-semibold">Pending</span>
                        </>
                      )}
                    </div>
                  </div>
                  
                  <div>
                    <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Submitted At</span>
                    <p className="text-sm text-gray-900 mt-1 flex items-center">
                      <Calendar className="h-3 w-3 mr-1 text-blue-500" />
                      {formatDate(submission.submitted_at)}
                    </p>
                  </div>
                </div>
                
                {submission.processed_at && (
                  <div className="mt-3 pt-3 border-t border-blue-200">
                    <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Processed At</span>
                    <p className="text-sm text-gray-900 mt-1 flex items-center">
                      <Calendar className="h-3 w-3 mr-1 text-green-500" />
                      {formatDate(submission.processed_at)}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Form Data */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900 flex items-center">
                <FileText className="h-5 w-5 mr-2" />
                Form Data
                {submission.form_data && (
                  <span className="ml-2 text-sm text-gray-500">
                    ({(() => {
                      try {
                        const data = typeof submission.form_data === 'string' 
                          ? JSON.parse(submission.form_data) 
                          : submission.form_data;
                        return Object.keys(data).length;
                      } catch {
                        return 0;
                      }
                    })()} fields)
                  </span>
                )}
              </h3>
              
              <div className="bg-gray-50 rounded-lg p-4">
                {submission.form_data && Object.keys(submission.form_data).length > 0 ? (
                  renderFormData(submission.form_data)
                ) : (
                  <div className="text-center py-8">
                    <FileText className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500 italic">No form data available</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Files Section */}
          {submission.files && submission.files.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900 flex items-center">
                <FileText className="h-5 w-5 mr-2" />
                Uploaded Files ({submission.files.length})
              </h3>
              {/* Debug: Log files data */}
              {console.log('Files data:', submission.files)}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {submission.files.map((file, index) => (
                  <div key={file.id || index} className="bg-gray-50 border border-gray-200 rounded-lg p-3 hover:bg-gray-100 transition-colors">
                    <div className="flex items-center space-x-2">
                      <FileText className="h-5 w-5 text-blue-500 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {file.original_filename || `File ${index + 1}`}
                        </p>
                        <div className="space-y-1">
                          <p className="text-xs text-gray-500">
                            {file.file_size ? `${(file.file_size / 1024).toFixed(1)} KB` : 'Size unknown'}
                          </p>
                          <p className="text-xs text-gray-400">
                            Field: {file.field_name}
                          </p>
                          <p className="text-xs text-gray-400">
                            Uploaded: {new Date(file.uploaded_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end space-x-3 p-6 border-t border-gray-200 bg-gray-50">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}