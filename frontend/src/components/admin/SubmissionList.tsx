'use client';

import React, { useState } from 'react';
import { FormSubmission } from '@/types';
import { formatDate, formatFileSize } from '@/lib/utils';
import { Download, Eye, CheckCircle, Clock, User, Calendar } from 'lucide-react';

interface SubmissionListProps {
  submissions: FormSubmission[];
  onViewDetails: (submission: FormSubmission) => void;
  onMarkProcessed: (submissionId: number) => void;
  isLoading?: boolean;
}

export default function SubmissionList({ 
  submissions, 
  onViewDetails, 
  onMarkProcessed, 
  isLoading = false 
}: SubmissionListProps) {
  const [filter, setFilter] = useState<'all' | 'processed' | 'pending'>('all');

  const filteredSubmissions = submissions.filter(submission => {
    if (filter === 'processed') return submission.is_processed;
    if (filter === 'pending') return !submission.is_processed;
    return true;
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/50 p-6 animate-pulse">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center flex-1">
                <div className="w-12 h-12 bg-gray-200 rounded-xl mr-4"></div>
                <div className="flex-1">
                  <div className="h-5 bg-gray-200 rounded w-1/3 mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
              <div className="w-20 h-6 bg-gray-200 rounded-full"></div>
            </div>
            <div className="flex space-x-3">
              <div className="h-8 bg-gray-200 rounded-lg w-24"></div>
              <div className="h-8 bg-gray-200 rounded-lg w-20"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (submissions.length === 0) {
    return (
      <div className="text-center py-20">
        <div className="w-24 h-24 bg-gradient-to-r from-gray-100 to-gray-200 rounded-3xl flex items-center justify-center mx-auto mb-6">
          <User className="h-12 w-12 text-gray-400" />
        </div>
        <h3 className="text-2xl font-semibold text-gray-900 mb-3">No submissions yet</h3>
        <p className="text-gray-500 text-lg max-w-md mx-auto">
          Submissions will appear here when users fill out your forms.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filter Tabs */}
      <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-2 border border-gray-200/50 shadow-lg">
        <nav className="flex space-x-2">
          {[
            { key: 'all', label: 'All', count: submissions.length, color: 'gray' },
            { key: 'pending', label: 'Pending', count: submissions.filter(s => !s.is_processed).length, color: 'yellow' },
            { key: 'processed', label: 'Processed', count: submissions.filter(s => s.is_processed).length, color: 'green' },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key as any)}
              className={`flex-1 py-3 px-6 rounded-xl font-semibold text-sm flex items-center justify-center transition-all duration-200 ${
                filter === tab.key
                  ? `bg-gradient-to-r from-${tab.color}-500 to-${tab.color}-600 text-white shadow-lg transform scale-105`
                  : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
              }`}
            >
              {tab.label} ({tab.count})
            </button>
          ))}
        </nav>
      </div>

      {/* Submissions List */}
      <div className="space-y-6">
        {filteredSubmissions.map((submission) => (
          <div key={submission.id} className="group bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-200/50 hover:border-blue-300/50 hover:-translate-y-1 p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                    <User className="h-6 w-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-xl font-semibold text-gray-900 group-hover:text-purple-600 transition-colors duration-200">
                        {submission.form_template_name}
                      </h3>
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                        submission.is_processed 
                          ? 'bg-green-100 text-green-800 border border-green-200' 
                          : 'bg-yellow-100 text-yellow-800 border border-yellow-200'
                      }`}>
                        {submission.is_processed ? (
                          <>
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Processed
                          </>
                        ) : (
                          <>
                            <Clock className="h-3 w-3 mr-1" />
                            Pending
                          </>
                        )}
                      </span>
                    </div>
                    
                    <div className="flex items-center space-x-6 text-sm text-gray-500 mb-4">
                      <div className="flex items-center">
                        <User className="h-4 w-4 mr-2 text-purple-500" />
                        <span className="font-medium">{submission.submitted_by || 'Anonymous'}</span>
                      </div>
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-2 text-indigo-500" />
                        <span>{formatDate(submission.submitted_at)}</span>
                      </div>
                    </div>
                    
                    {/* Form Data Preview */}
                    <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-4 mb-4 border border-gray-200">
                      <div className="text-sm text-gray-600">
                        {(() => {
                          try {
                            // Parse form data if it's a string
                            const formData = typeof submission.form_data === 'string' 
                              ? JSON.parse(submission.form_data) 
                              : submission.form_data;
                            
                            const entries = Object.entries(formData);
                            const displayEntries = entries.slice(0, 3);
                            
                            return (
                              <>
                                {displayEntries.map(([key, value]) => (
                                  <div key={key} className="flex mb-1">
                                    <span className="font-medium w-24 truncate text-gray-700">
                                      {key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}:
                                    </span>
                                    <span className="ml-2 truncate">
                                      {typeof value === 'string' && value.length > 50 
                                        ? `${value.substring(0, 50)}...` 
                                        : String(value)
                                      }
                                    </span>
                                  </div>
                                ))}
                                {entries.length > 3 && (
                                  <div className="text-gray-400 text-xs mt-2 font-medium">
                                    +{entries.length - 3} more fields
                                  </div>
                                )}
                              </>
                            );
                          } catch (error) {
                            return (
                              <div className="text-gray-500 text-xs">
                                Unable to parse form data
                              </div>
                            );
                          }
                        })()}
                      </div>
                    </div>
                    
                    {/* Files */}
                    {submission.files.length > 0 && (
                      <div className="mb-4">
                        <div className="text-sm font-semibold text-gray-700 mb-2">Attachments:</div>
                        <div className="space-y-2">
                          {submission.files.map((file) => (
                            <div key={file.id} className="flex items-center text-sm text-gray-600 bg-white rounded-lg p-2 border border-gray-200">
                              <Download className="h-4 w-4 mr-2 text-blue-500" />
                              <span className="truncate font-medium">{file.original_filename}</span>
                              <span className="ml-2 text-gray-400 text-xs">({formatFileSize(file.file_size)})</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-3 ml-6">
                <button
                  onClick={() => onViewDetails(submission)}
                  className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 text-sm font-semibold rounded-xl border border-blue-200 hover:from-blue-100 hover:to-indigo-100 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
                >
                  <Eye className="h-4 w-4 mr-2" />
                  View Details
                </button>
                
                {!submission.is_processed && (
                  <button
                    onClick={() => onMarkProcessed(submission.id)}
                    className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white text-sm font-semibold rounded-xl hover:from-green-600 hover:to-emerald-600 focus:outline-none focus:ring-2 focus:ring-green-500 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Mark Processed
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}