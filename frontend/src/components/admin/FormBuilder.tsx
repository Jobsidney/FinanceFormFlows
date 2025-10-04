'use client';

import React, { useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, Trash2, GripVertical, Eye, EyeOff } from 'lucide-react';
import { FormTemplate, CreateFormTemplateData, CreateFormFieldData } from '@/types';

const fieldTypeOptions = [
  { value: 'text', label: 'Text Input' },
  { value: 'email', label: 'Email' },
  { value: 'number', label: 'Number' },
  { value: 'date', label: 'Date' },
  { value: 'datetime', label: 'DateTime' },
  { value: 'dropdown', label: 'Dropdown' },
  { value: 'checkbox', label: 'Checkbox' },
  { value: 'radio', label: 'Radio Button' },
  { value: 'textarea', label: 'Text Area' },
  { value: 'file', label: 'File Upload' },
  { value: 'phone', label: 'Phone Number' },
];

const formSchema = z.object({
  name: z.string().min(1, 'Form name is required'),
  description: z.string().optional(),
  is_active: z.boolean().default(true),
  configuration: z.record(z.any()).default({}),
  fields: z.array(z.object({
    field_name: z.string().min(1, 'Field name is required'),
    field_type: z.enum(['text', 'email', 'number', 'date', 'datetime', 'dropdown', 'checkbox', 'radio', 'textarea', 'file', 'phone']),
    label: z.string().min(1, 'Label is required'),
    placeholder: z.string().optional(),
    help_text: z.string().optional(),
    is_required: z.boolean().default(false),
    is_visible: z.boolean().default(true),
    order: z.number().default(0),
    configuration: z.record(z.any()).default({}),
    conditional_logic: z.record(z.any()).default({}),
  })).min(1, 'At least one field is required'),
});

type FormData = z.infer<typeof formSchema>;

interface FormBuilderProps {
  onSubmit: (data: CreateFormTemplateData) => void;
  initialData?: FormTemplate;
  isLoading?: boolean;
}

export default function FormBuilder({ onSubmit, initialData, isLoading = false }: FormBuilderProps) {
  const { register, control, handleSubmit, watch, setValue, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData ? {
      name: initialData.name,
      description: initialData.description,
      is_active: initialData.is_active,
      configuration: initialData.configuration,
      fields: initialData.fields.map(field => ({
        field_name: field.field_name,
        field_type: field.field_type,
        label: field.label,
        placeholder: field.placeholder,
        help_text: field.help_text,
        is_required: field.is_required,
        is_visible: field.is_visible,
        order: field.order,
        configuration: field.configuration,
        conditional_logic: field.conditional_logic,
      }))
    } : {
      name: '',
      description: '',
      is_active: true,
      configuration: {},
      fields: [{
        field_name: 'field_1',
        field_type: 'text',
        label: 'Field 1',
        placeholder: '',
        help_text: '',
        is_required: false,
        is_visible: true,
        order: 0,
        configuration: {},
        conditional_logic: {},
      }]
    }
  });

  const { fields, append, remove, move } = useFieldArray({
    control,
    name: 'fields'
  });

  const watchedFields = watch('fields');

  const addField = () => {
    const newField: CreateFormFieldData = {
      field_name: `field_${fields.length + 1}`,
      field_type: 'text',
      label: `Field ${fields.length + 1}`,
      placeholder: '',
      help_text: '',
      is_required: false,
      is_visible: true,
      order: fields.length,
      configuration: {},
      conditional_logic: {},
    };
    append(newField);
  };

  const moveField = (fromIndex: number, toIndex: number) => {
    move(fromIndex, toIndex);
    // Update order values
    watchedFields.forEach((_, index) => {
      setValue(`fields.${index}.order`, index);
    });
  };

  const getFieldConfiguration = (fieldType: string) => {
    switch (fieldType) {
      case 'dropdown':
      case 'radio':
        return (
          <div className="mt-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Options (one per line)
            </label>
            <textarea
              {...register(`fields.${0}.configuration.options`)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900 placeholder-gray-500"
              rows={3}
              placeholder="Option 1&#10;Option 2&#10;Option 3"
            />
          </div>
        );
      case 'file':
        return (
          <div className="mt-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Allowed file types
            </label>
            <input
              {...register(`fields.${0}.configuration.acceptedTypes`)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900 placeholder-gray-500"
              placeholder=".pdf,.doc,.docx,.jpg,.png"
            />
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Form Basic Info */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Form Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Form Name *
            </label>
            <input
              {...register('name')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900 placeholder-gray-500"
              placeholder="e.g., KYC Form"
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
            )}
          </div>
          <div className="flex items-center">
            <input
              {...register('is_active')}
              type="checkbox"
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label className="ml-2 block text-sm text-gray-700">
              Active
            </label>
          </div>
        </div>
        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Description
          </label>
          <textarea
            {...register('description')}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900 placeholder-gray-500"
            rows={3}
            placeholder="Describe the purpose of this form..."
          />
        </div>
      </div>

      {/* Form Fields */}
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-gray-900">Form Fields</h3>
          <button
            type="button"
            onClick={addField}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Field
          </button>
        </div>

        <div className="space-y-4">
          {fields.map((field, index) => (
            <div key={field.id} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <GripVertical className="h-5 w-5 text-gray-400 cursor-move" />
                  <span className="text-sm font-medium text-gray-700">
                    Field {index + 1}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={() => setValue(`fields.${index}.is_visible`, !watchedFields[index]?.is_visible)}
                    className="p-1 text-gray-400 hover:text-gray-600"
                  >
                    {watchedFields[index]?.is_visible ? (
                      <Eye className="h-4 w-4" />
                    ) : (
                      <EyeOff className="h-4 w-4" />
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => remove(index)}
                    className="p-1 text-red-400 hover:text-red-600"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Field Name *
                  </label>
                  <input
                    {...register(`fields.${index}.field_name`)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900 placeholder-gray-500"
                    placeholder="e.g., first_name"
                  />
                  {errors.fields?.[index]?.field_name && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.fields[index]?.field_name?.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Field Type *
                  </label>
                  <select
                    {...register(`fields.${index}.field_type`)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900"
                  >
                    {fieldTypeOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Label *
                  </label>
                  <input
                    {...register(`fields.${index}.label`)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900 placeholder-gray-500"
                    placeholder="e.g., First Name"
                  />
                  {errors.fields?.[index]?.label && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.fields[index]?.label?.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Placeholder
                  </label>
                  <input
                    {...register(`fields.${index}.placeholder`)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900 placeholder-gray-500"
                    placeholder="e.g., Enter your first name"
                  />
                </div>
              </div>

              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Help Text
                </label>
                <input
                  {...register(`fields.${index}.help_text`)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900 placeholder-gray-500"
                  placeholder="Additional help text for users"
                />
              </div>

              <div className="mt-4 flex items-center space-x-4">
                <label className="flex items-center">
                  <input
                    {...register(`fields.${index}.is_required`)}
                    type="checkbox"
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="ml-2 text-sm text-gray-700">Required</span>
                </label>
              </div>

              {/* Field-specific configuration */}
              {getFieldConfiguration(watchedFields[index]?.field_type)}
            </div>
          ))}
        </div>
      </div>

      {/* Submit Button */}
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isLoading}
          className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Saving...' : (initialData ? 'Update Form' : 'Create Form')}
        </button>
      </div>
    </form>
  );
}