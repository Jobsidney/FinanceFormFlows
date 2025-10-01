export interface FormTemplate {
  id: number;
  name: string;
  description: string;
  is_active: boolean;
  created_by: number;
  created_by_name: string;
  created_at: string;
  updated_at: string;
  configuration: Record<string, any>;
  fields: FormField[];
  submission_count: number;
}

export interface FormField {
  id: number;
  field_name: string;
  field_type: 'text' | 'email' | 'number' | 'date' | 'datetime' | 'dropdown' | 'checkbox' | 'radio' | 'textarea' | 'file' | 'phone';
  label: string;
  placeholder: string;
  help_text: string;
  is_required: boolean;
  is_visible: boolean;
  order: number;
  configuration: Record<string, any>;
  conditional_logic: Record<string, any>;
  validation_rules: FormValidationRule[];
}

export interface FormValidationRule {
  id: number;
  rule_type: 'min_length' | 'max_length' | 'min_value' | 'max_value' | 'pattern' | 'custom';
  rule_value: string;
  error_message: string;
  is_active: boolean;
}

export interface FormSubmission {
  id: number;
  form_template: number;
  form_template_name: string;
  submitted_by: string;
  submitted_at: string;
  is_processed: boolean;
  processed_at: string | null;
  form_data: Record<string, any>;
  files: FormFile[];
}

export interface FormFile {
  id: number;
  field_name: string;
  file: string;
  original_filename: string;
  file_size: number;
  uploaded_at: string;
}

export interface NotificationLog {
  id: number;
  notification_type: string;
  status: 'pending' | 'sent' | 'failed' | 'retrying';
  sent_at: string | null;
  error_message: string;
  retry_count: number;
  created_at: string;
}

export interface CreateFormTemplateData {
  name: string;
  description: string;
  is_active: boolean;
  configuration: Record<string, any>;
  fields: CreateFormFieldData[];
}

export interface CreateFormFieldData {
  field_name: string;
  field_type: FormField['field_type'];
  label: string;
  placeholder: string;
  help_text: string;
  is_required: boolean;
  is_visible: boolean;
  order: number;
  configuration: Record<string, any>;
  conditional_logic: Record<string, any>;
}

export interface FormSubmissionData {
  form_template: number;
  submitted_by: string;
  form_data: Record<string, any>;
  files: File[];
}
