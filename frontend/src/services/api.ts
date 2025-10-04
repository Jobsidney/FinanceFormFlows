import api from '@/lib/api';
import { FormTemplate, FormSubmission, FormSubmissionData, CreateFormTemplateData } from '@/types';

export const formTemplatesApi = {
  getAll: async (): Promise<FormTemplate[]> => {
    const response = await api.get('/api/forms/');
    return response.results || response;
  },

  getById: async (id: number): Promise<FormTemplate> => {
    const response = await api.get(`/api/forms/${id}/`);
    return response;
  },

  create: async (data: CreateFormTemplateData): Promise<FormTemplate> => {
    const response = await api.post('/api/forms/', data);
    return response;
  },

  update: async (id: number, data: Partial<CreateFormTemplateData>): Promise<FormTemplate> => {
    const response = await api.patch(`/api/forms/${id}/`, data);
    return response;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/api/forms/${id}/`);
  },

  getPublic: async (id: number): Promise<FormTemplate> => {
    const response = await api.get(`/api/public/${id}/public_form/`);
    return response;
  },
};

export const formSubmissionsApi = {
  getAll: async (): Promise<FormSubmission[]> => {
    const response = await api.get('/api/submissions/');
    return response.results || response;
  },

  getByForm: async (formId: number): Promise<FormSubmission[]> => {
    const response = await api.get(`/api/submissions/by_form/?form_template=${formId}`);
    return response;
  },

  getById: async (id: number): Promise<FormSubmission> => {
    const response = await api.get(`/api/submissions/${id}/`);
    return response;
  },

  submit: async (data: FormSubmissionData): Promise<{ message: string; submission_id: number }> => {
    const formData = new FormData();
    formData.append('form_template', data.form_template.toString());
    formData.append('submitted_by', data.submitted_by);
    formData.append('form_data', JSON.stringify(data.form_data));
    
    data.files.forEach((file, index) => {
      formData.append('files', file);
    });

    const response = await api.post(`/api/public/${data.form_template}/submit/`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response;
  },

  markProcessed: async (id: number): Promise<void> => {
    await api.post(`/api/submissions/${id}/mark_processed/`);
  },
};

export const publicFormsApi = {
  getAll: async (): Promise<FormTemplate[]> => {
    const response = await api.get('/api/public/');
    return response.results || response;
  },

  getById: async (id: number): Promise<FormTemplate> => {
    const response = await api.get(`/api/public/${id}/`);
    return response;
  },

  submit: async (data: FormSubmissionData): Promise<{ message: string; submission_id: number }> => {
    const formData = new FormData();
    formData.append('form_template', data.form_template.toString());
    formData.append('submitted_by', data.submitted_by);
    formData.append('form_data', JSON.stringify(data.form_data));
    
    data.files.forEach((file, index) => {
      formData.append('files', file);
    });

    const response = await api.post(`/api/public/${data.form_template}/submit/`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response;
  },
};
