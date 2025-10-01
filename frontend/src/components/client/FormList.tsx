'use client';

import React, { useState, useMemo } from 'react';
import { FormTemplate } from '@/types';
import { FileText, Calendar, Users, ArrowRight, Clock, Shield, Zap, Search, Filter } from 'lucide-react';

interface FormListProps {
  forms: FormTemplate[];
  onSelectForm: (form: FormTemplate) => void;
  isLoading?: boolean;
}

export default function FormList({ forms, onSelectForm, isLoading = false }: FormListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'submissions' | 'fields' | 'date'>('name');

  const filteredAndSortedForms = useMemo(() => {
    let filtered = forms.filter(form => 
      form.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      form.description?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'submissions':
          return b.submission_count - a.submission_count;
        case 'fields':
          return b.fields.length - a.fields.length;
        case 'date':
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        default:
          return 0;
      }
    });

    return filtered;
  }, [forms, searchTerm, sortBy]);
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="bg-white rounded-xl shadow-md border border-gray-200 animate-pulse">
            <div className="p-6 pb-4">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center flex-1">
                  <div className="w-10 h-10 bg-gray-200 rounded-lg mr-3"></div>
                  <div className="flex-1">
                    <div className="h-5 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </div>
                <div className="w-12 h-6 bg-gray-200 rounded-full"></div>
              </div>
            </div>
            <div className="px-6 pb-4">
              <div className="flex justify-between mb-3">
                <div className="h-4 bg-gray-200 rounded w-20"></div>
                <div className="h-4 bg-gray-200 rounded w-16"></div>
              </div>
              <div className="flex space-x-2">
                <div className="h-6 bg-gray-200 rounded w-16"></div>
                <div className="h-6 bg-gray-200 rounded w-12"></div>
                <div className="h-6 bg-gray-200 rounded w-20"></div>
              </div>
            </div>
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-100">
              <div className="flex justify-between items-center">
                <div className="h-3 bg-gray-200 rounded w-20"></div>
                <div className="h-4 bg-gray-200 rounded w-12"></div>
              </div>
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
          <FileText className="h-12 w-12 text-gray-400" />
        </div>
        <h3 className="text-2xl font-semibold text-gray-900 mb-3">No forms available</h3>
        <p className="text-gray-500 text-lg max-w-md mx-auto">
          There are currently no active forms to fill out. Please check back later or contact your administrator.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Search and Filter Controls - Show when there are many forms */}
      {forms.length > 6 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search forms..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 placeholder-gray-500"
              />
            </div>
            
            {/* Sort */}
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-gray-400" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
              >
                <option value="name">Sort by Name</option>
                <option value="submissions">Most Submissions</option>
                <option value="fields">Most Fields</option>
                <option value="date">Newest First</option>
              </select>
            </div>
          </div>
          
          {/* Results count */}
          {searchTerm && (
            <div className="mt-3 text-sm text-gray-600">
              Found {filteredAndSortedForms.length} form{filteredAndSortedForms.length !== 1 ? 's' : ''} matching "{searchTerm}"
            </div>
          )}
        </div>
      )}

      {/* Forms Grid - Responsive for many forms */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredAndSortedForms.map((form) => (
          <div
            key={form.id}
            onClick={() => onSelectForm(form)}
            className="group bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-200 cursor-pointer border border-gray-200 hover:border-blue-300 hover:-translate-y-1 relative overflow-hidden"
          >
            {/* Header */}
            <div className="p-6 pb-4">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center flex-1 min-w-0">
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-lg flex items-center justify-center mr-3 group-hover:scale-105 transition-transform duration-200">
                    <FileText className="h-5 w-5 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-semibold text-gray-900 mb-1 group-hover:text-blue-600 transition-colors duration-200 truncate">
                      {form.name}
                    </h3>
                    {form.description && (
                      <p className="text-gray-600 text-sm line-clamp-2 leading-relaxed">
                        {form.description}
                      </p>
                    )}
                  </div>
                </div>
                <div className="ml-2 flex-shrink-0">
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full mr-1.5"></div>
                    Active
                  </span>
                </div>
              </div>
            </div>
            
            {/* Stats */}
            <div className="px-6 pb-4">
              <div className="flex items-center justify-between text-sm text-gray-600 mb-3">
                <div className="flex items-center">
                  <Users className="h-4 w-4 mr-1.5 text-blue-500" />
                  <span className="font-medium">{form.submission_count}</span>
                  <span className="ml-1 text-gray-500">submissions</span>
                </div>
                <div className="flex items-center">
                  <FileText className="h-4 w-4 mr-1.5 text-indigo-500" />
                  <span className="font-medium">{form.fields.length}</span>
                  <span className="ml-1 text-gray-500">fields</span>
                </div>
              </div>
              
              {/* Features */}
              <div className="flex flex-wrap gap-1.5">
                <span className="inline-flex items-center px-2 py-1 bg-blue-50 text-blue-700 text-xs font-medium rounded-md">
                  <Shield className="h-3 w-3 mr-1" />
                  Secure
                </span>
                <span className="inline-flex items-center px-2 py-1 bg-green-50 text-green-700 text-xs font-medium rounded-md">
                  <Zap className="h-3 w-3 mr-1" />
                  Fast
                </span>
                <span className="inline-flex items-center px-2 py-1 bg-gray-50 text-gray-700 text-xs font-medium rounded-md">
                  <Clock className="h-3 w-3 mr-1" />
                  {new Date(form.created_at).toLocaleDateString()}
                </span>
              </div>
            </div>
            
            {/* CTA */}
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-100">
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500">
                  Click to start
                </span>
                <div className="flex items-center text-blue-600 group-hover:text-blue-700 font-medium text-sm">
                  <span>Start</span>
                  <ArrowRight className="h-3 w-3 ml-1 group-hover:translate-x-0.5 transition-transform duration-200" />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {/* Show count if many forms */}
      {forms.length > 12 && (
        <div className="text-center py-4">
          <p className="text-sm text-gray-500">
            {searchTerm ? (
              <>Showing {filteredAndSortedForms.length} of {forms.length} forms</>
            ) : (
              <>Showing {forms.length} forms • Scroll to see all available forms</>
            )}
          </p>
        </div>
      )}
      
      {/* No results message */}
      {searchTerm && filteredAndSortedForms.length === 0 && (
        <div className="text-center py-12">
          <Search className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No forms found</h3>
          <p className="text-gray-500">
            No forms match your search for "{searchTerm}". Try a different search term.
          </p>
        </div>
      )}
    </div>
  );
}
