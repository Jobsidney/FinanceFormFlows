'use client';

import React, { useState } from 'react';
import { FormTemplate } from '@/types';
import { Eye, Edit, Trash2, Users, Calendar, FileText } from 'lucide-react';

interface FormListProps {
  forms: FormTemplate[];
  onEdit: (form: FormTemplate) => void;
  onDelete: (formId: number) => void;
  onViewSubmissions: (formId: number) => void;
  isLoading?: boolean;
}

export default function FormList({ 
  forms, 
  onEdit, 
  onDelete, 
  onViewSubmissions, 
  isLoading = false 
}: FormListProps) {
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);

  const handleDelete = (formId: number) => {
    if (deleteConfirm === formId) {
      onDelete(formId);
      setDeleteConfirm(null);
    } else {
      setDeleteConfirm(formId);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/50 p-6 animate-pulse">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center flex-1">
                <div className="w-12 h-12 bg-gray-200 rounded-xl mr-4"></div>
                <div className="flex-1">
                  <div className="h-5 bg-gray-200 rounded w-1/3 mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
              <div className="w-16 h-6 bg-gray-200 rounded-full"></div>
            </div>
            <div className="flex space-x-3">
              <div className="h-8 bg-gray-200 rounded-lg w-20"></div>
              <div className="h-8 bg-gray-200 rounded-lg w-16"></div>
              <div className="h-8 bg-gray-200 rounded-lg w-20"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (forms.length === 0) {
    return (
      <div className="text-center py-20">
        <div className="w-24 h-24 bg-gradient-to-r from-gray-100 to-gray-200 rounded-3xl flex items-center justify-center mx-auto mb-6">
          <Users className="h-12 w-12 text-gray-400" />
        </div>
        <h3 className="text-2xl font-semibold text-gray-900 mb-3">No forms created yet</h3>
        <p className="text-gray-500 text-lg max-w-md mx-auto">
          Get started by creating your first form to begin collecting submissions.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {forms.map((form) => (
        <div key={form.id} className="group bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-200/50 hover:border-blue-300/50 hover:-translate-y-1 p-6">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                  <FileText className="h-6 w-6 text-white" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="text-xl font-semibold text-gray-900 group-hover:text-blue-600 transition-colors duration-200">
                      {form.name}
                    </h3>
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                      form.is_active 
                        ? 'bg-green-100 text-green-800 border border-green-200' 
                        : 'bg-gray-100 text-gray-800 border border-gray-200'
                    }`}>
                      {form.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  
                  {form.description && (
                    <p className="text-gray-600 mb-4 leading-relaxed">{form.description}</p>
                  )}
                  
                  <div className="flex items-center space-x-6 text-sm text-gray-500 mb-4">
                    <div className="flex items-center">
                      <Users className="h-4 w-4 mr-2 text-blue-500" />
                      <span className="font-medium">{form.submission_count}</span>
                      <span className="ml-1">submissions</span>
                    </div>
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-2 text-indigo-500" />
                      <span>Created {new Date(form.created_at).toLocaleDateString()}</span>
                    </div>
                    <div className="text-gray-400">
                      by {form.created_by_name}
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <span className="text-sm text-gray-500 bg-gray-50 px-3 py-1 rounded-lg">
                      {form.fields.length} field{form.fields.length !== 1 ? 's' : ''}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-3 ml-6">
              <button
                onClick={() => onViewSubmissions(form.id)}
                className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 text-sm font-semibold rounded-xl border border-blue-200 hover:from-blue-100 hover:to-indigo-100 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
              >
                <Eye className="h-4 w-4 mr-2" />
                View
              </button>
              
              <button
                onClick={() => onEdit(form)}
                className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-gray-50 to-gray-100 text-gray-700 text-sm font-semibold rounded-xl border border-gray-200 hover:from-gray-100 hover:to-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-all duration-200"
              >
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </button>
              
              <button
                onClick={() => handleDelete(form.id)}
                className={`inline-flex items-center px-4 py-2 text-sm font-semibold rounded-xl focus:outline-none focus:ring-2 transition-all duration-200 ${
                  deleteConfirm === form.id
                    ? 'bg-red-50 text-red-700 border border-red-200 hover:bg-red-100 focus:ring-red-500'
                    : 'bg-gray-50 text-gray-700 border border-gray-200 hover:bg-gray-100 focus:ring-gray-500'
                }`}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                {deleteConfirm === form.id ? 'Confirm' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}