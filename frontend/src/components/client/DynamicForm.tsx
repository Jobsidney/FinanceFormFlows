'use client';

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { FormTemplate, FormField, FormSubmissionData } from '@/types';
import { Upload, CheckCircle, AlertCircle, FileText } from 'lucide-react';

interface DynamicFormProps {
  formTemplate: FormTemplate;
  onSubmit: (data: FormSubmissionData) => void;
  isLoading?: boolean;
}

export default function DynamicForm({ formTemplate, onSubmit, isLoading = false }: DynamicFormProps) {
  const [files, setFiles] = useState<File[]>([]);
  const [fileErrors, setFileErrors] = useState<Record<string, string>>({});

  // Create validation schema dynamically based on form fields
  const createValidationSchema = (fields: FormField[]) => {
    const schemaFields: Record<string, any> = {};
    
    fields.forEach(field => {
      if (!field.is_visible) return;
      
      let fieldSchema: any;
      
      switch (field.field_type) {
        case 'email':
          fieldSchema = z.string().email('Please enter a valid email address');
          break;
        case 'number':
          fieldSchema = z.coerce.number();
          break;
        case 'date':
          fieldSchema = z.string().min(1, 'Please select a date');
          break;
        case 'datetime':
          fieldSchema = z.string().min(1, 'Please select a date and time');
          break;
        case 'phone':
          fieldSchema = z.string().regex(/^[\+]?[1-9][\d]{0,15}$/, 'Please enter a valid phone number');
          break;
        case 'file':
          // File validation is handled separately
          fieldSchema = z.any().optional();
          break;
        default:
          fieldSchema = z.string();
      }
      
      if (field.is_required && field.field_type !== 'file') {
        fieldSchema = fieldSchema.min(1, `${field.label} is required`);
      } else if (!field.is_required) {
        fieldSchema = fieldSchema.optional();
      }
      
      schemaFields[field.field_name] = fieldSchema;
    });
    
    return z.object(schemaFields);
  };

  const validationSchema = createValidationSchema(formTemplate.fields);
  const { register, handleSubmit, formState: { errors }, watch, setValue } = useForm({
    resolver: zodResolver(validationSchema),
    defaultValues: {}
  });

  const watchedValues = watch();

  // Handle file uploads
  const handleFileChange = (fieldName: string, event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(event.target.files || []);
    const field = formTemplate.fields.find(f => f.field_name === fieldName);
    
    if (!field) return;
    
    // Validate file types
    const allowedTypes = field.configuration.acceptedTypes?.split(',').map(type => type.trim()) || [];
    const validFiles = selectedFiles.filter(file => {
      const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
      return allowedTypes.length === 0 || allowedTypes.includes(fileExtension);
    });
    
    if (validFiles.length !== selectedFiles.length) {
      setFileErrors(prev => ({
        ...prev,
        [fieldName]: `Only ${allowedTypes.join(', ')} files are allowed`
      }));
    } else {
      setFileErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[fieldName];
        return newErrors;
      });
    }
    
    setFiles(prev => ({
      ...prev,
      [fieldName]: validFiles
    }));
  };

  const onSubmitForm = (data: any) => {
    // Prepare file data
    const fileList: File[] = [];
    Object.values(files).forEach(fileArray => {
      if (Array.isArray(fileArray)) {
        fileList.push(...fileArray);
      }
    });
    
    const submissionData: FormSubmissionData = {
      form_template: formTemplate.id,
      submitted_by: data.submitted_by || 'Anonymous',
      form_data: data,
      files: fileList
    };
    
    onSubmit(submissionData);
  };

  const renderField = (field: FormField) => {
    if (!field.is_visible) return null;
    
    const fieldError = errors[field.field_name];
    const fileError = fileErrors[field.field_name];
    
    const baseInputClasses = "w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900 placeholder-gray-500";
    const errorClasses = fieldError || fileError ? "border-red-300" : "border-gray-300";
    
    switch (field.field_type) {
      case 'text':
      case 'email':
      case 'phone':
        return (
          <div key={field.id} className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {field.label}
              {field.is_required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <input
              {...register(field.field_name)}
              type={field.field_type === 'email' ? 'email' : field.field_type === 'phone' ? 'tel' : 'text'}
              placeholder={field.placeholder}
              className={`${baseInputClasses} ${errorClasses}`}
            />
            {field.help_text && (
              <p className="mt-1 text-sm text-gray-500">{field.help_text}</p>
            )}
            {fieldError && (
              <p className="mt-1 text-sm text-red-600">{fieldError.message}</p>
            )}
          </div>
        );
        
      case 'number':
        return (
          <div key={field.id} className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {field.label}
              {field.is_required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <input
              {...register(field.field_name)}
              type="number"
              placeholder={field.placeholder}
              className={`${baseInputClasses} ${errorClasses}`}
            />
            {field.help_text && (
              <p className="mt-1 text-sm text-gray-500">{field.help_text}</p>
            )}
            {fieldError && (
              <p className="mt-1 text-sm text-red-600">{fieldError.message}</p>
            )}
          </div>
        );
        
      case 'date':
        return (
          <div key={field.id} className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {field.label}
              {field.is_required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <input
              {...register(field.field_name)}
              type="date"
              className={`${baseInputClasses} ${errorClasses}`}
            />
            {field.help_text && (
              <p className="mt-1 text-sm text-gray-500">{field.help_text}</p>
            )}
            {fieldError && (
              <p className="mt-1 text-sm text-red-600">{fieldError.message}</p>
            )}
          </div>
        );
        
      case 'datetime':
        return (
          <div key={field.id} className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {field.label}
              {field.is_required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <input
              {...register(field.field_name)}
              type="datetime-local"
              className={`${baseInputClasses} ${errorClasses}`}
            />
            {field.help_text && (
              <p className="mt-1 text-sm text-gray-500">{field.help_text}</p>
            )}
            {fieldError && (
              <p className="mt-1 text-sm text-red-600">{fieldError.message}</p>
            )}
          </div>
        );
        
      case 'textarea':
        return (
          <div key={field.id} className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {field.label}
              {field.is_required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <textarea
              {...register(field.field_name)}
              rows={4}
              placeholder={field.placeholder}
              className={`${baseInputClasses} ${errorClasses}`}
            />
            {field.help_text && (
              <p className="mt-1 text-sm text-gray-500">{field.help_text}</p>
            )}
            {fieldError && (
              <p className="mt-1 text-sm text-red-600">{fieldError.message}</p>
            )}
          </div>
        );
        
      case 'dropdown':
        const options = field.configuration.options?.split('\n').filter(Boolean) || [];
        return (
          <div key={field.id} className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {field.label}
              {field.is_required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <select
              {...register(field.field_name)}
              className={`${baseInputClasses} ${errorClasses}`}
            >
              <option value="">Select an option</option>
              {options.map((option, index) => (
                <option key={index} value={option.trim()}>
                  {option.trim()}
                </option>
              ))}
            </select>
            {field.help_text && (
              <p className="mt-1 text-sm text-gray-500">{field.help_text}</p>
            )}
            {fieldError && (
              <p className="mt-1 text-sm text-red-600">{fieldError.message}</p>
            )}
          </div>
        );
        
      case 'radio':
        const radioOptions = field.configuration.options?.split('\n').filter(Boolean) || [];
        return (
          <div key={field.id} className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {field.label}
              {field.is_required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <div className="space-y-2">
              {radioOptions.map((option, index) => (
                <label key={index} className="flex items-center">
                  <input
                    {...register(field.field_name)}
                    type="radio"
                    value={option.trim()}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                  />
                  <span className="ml-2 text-sm text-gray-700">{option.trim()}</span>
                </label>
              ))}
            </div>
            {field.help_text && (
              <p className="mt-1 text-sm text-gray-500">{field.help_text}</p>
            )}
            {fieldError && (
              <p className="mt-1 text-sm text-red-600">{fieldError.message}</p>
            )}
          </div>
        );
        
      case 'checkbox':
        return (
          <div key={field.id} className="mb-4">
            <label className="flex items-center">
              <input
                {...register(field.field_name)}
                type="checkbox"
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <span className="ml-2 text-sm text-gray-700">
                {field.label}
                {field.is_required && <span className="text-red-500 ml-1">*</span>}
              </span>
            </label>
            {field.help_text && (
              <p className="mt-1 text-sm text-gray-500">{field.help_text}</p>
            )}
            {fieldError && (
              <p className="mt-1 text-sm text-red-600">{fieldError.message}</p>
            )}
          </div>
        );
        
      case 'file':
        return (
          <div key={field.id} className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {field.label}
              {field.is_required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md hover:border-gray-400 transition-colors">
              <div className="space-y-1 text-center">
                <Upload className="mx-auto h-12 w-12 text-gray-400" />
                <div className="flex text-sm text-gray-600">
                  <label className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500">
                    <span>Upload files</span>
                    <input
                      type="file"
                      multiple
                      accept={field.configuration.acceptedTypes}
                      onChange={(e) => handleFileChange(field.field_name, e)}
                      className="sr-only"
                    />
                  </label>
                  <p className="pl-1">or drag and drop</p>
                </div>
                <p className="text-xs text-gray-500">
                  {field.configuration.acceptedTypes || 'Any file type'}
                </p>
              </div>
            </div>
            {files[field.field_name] && files[field.field_name].length > 0 && (
              <div className="mt-2">
                <p className="text-sm text-gray-600">Selected files:</p>
                <ul className="mt-1 text-sm text-gray-500">
                  {files[field.field_name].map((file, index) => (
                    <li key={index}>{file.name}</li>
                  ))}
                </ul>
              </div>
            )}
            {field.help_text && (
              <p className="mt-1 text-sm text-gray-500">{field.help_text}</p>
            )}
            {fileError && (
              <p className="mt-1 text-sm text-red-600">{fileError}</p>
            )}
          </div>
        );
        
      default:
        return null;
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-xl border border-gray-200/50 p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <FileText className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 via-blue-900 to-indigo-900 bg-clip-text text-transparent mb-3">
            {formTemplate.name}
          </h1>
          {formTemplate.description && (
            <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
              {formTemplate.description}
            </p>
          )}
        </div>
        
        <form onSubmit={handleSubmit(onSubmitForm)} className="space-y-8">
          {/* Submitted by field */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-200">
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Your Contact Information
            </label>
            <input
              {...register('submitted_by')}
              type="text"
              placeholder="Enter your name or email"
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 placeholder-gray-500 transition-all duration-200"
            />
            <p className="text-xs text-gray-500 mt-2">
              This helps us identify your submission
            </p>
          </div>
          
          {/* Dynamic fields */}
          {formTemplate.fields
            .sort((a, b) => a.order - b.order)
            .map((field) => renderField(field))
          }
          
          {/* Submit button */}
          <div className="flex justify-center pt-6">
            <button
              type="submit"
              disabled={isLoading}
              className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-lg font-semibold rounded-xl hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mr-3"></div>
                  Submitting Form...
                </>
              ) : (
                <>
                  <CheckCircle className="h-6 w-6 mr-3" />
                  Submit Form
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}