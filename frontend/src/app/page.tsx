'use client';

import React, { useState, useEffect } from 'react';
import { FormTemplate } from '@/types';
import { publicFormsApi } from '@/services/api';
import FormList from '@/components/client/FormList';
import DynamicForm from '@/components/client/DynamicForm';
import { CheckCircle, ArrowLeft, Shield, Lock, Users, FileText, ArrowRight, Sparkles, Zap, Globe } from 'lucide-react';
import Link from 'next/link';

export default function HomePage() {
  const [forms, setForms] = useState<FormTemplate[]>([]);
  const [selectedForm, setSelectedForm] = useState<FormTemplate | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionSuccess, setSubmissionSuccess] = useState(false);

  useEffect(() => {
    loadForms();
  }, []);

  const loadForms = async () => {
    try {
      setIsLoading(true);
      const data = await publicFormsApi.getAll();
      setForms(data);
    } catch (error) {
      console.error('Error loading forms:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectForm = (form: FormTemplate) => {
    setSelectedForm(form);
    setSubmissionSuccess(false);
  };

  const handleSubmitForm = async (submissionData: any) => {
    if (!selectedForm) return;
    
    try {
      setIsSubmitting(true);
      await publicFormsApi.submit(submissionData);
      setSubmissionSuccess(true);
    } catch (error) {
      console.error('Error submitting form:', error);
      alert('There was an error submitting your form. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBackToList = () => {
    setSelectedForm(null);
    setSubmissionSuccess(false);
  };

  if (submissionSuccess) {
  return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md mx-auto text-center">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Form Submitted Successfully!</h1>
            <p className="text-gray-600 mb-6">
              Thank you for your submission. We have received your information and will process it shortly.
            </p>
            <div className="space-y-3">
              <button
                onClick={handleBackToList}
                className="w-full inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Forms
              </button>
              <button
                onClick={() => setSubmissionSuccess(false)}
                className="w-full inline-flex items-center justify-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Submit Another Form
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (selectedForm) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <button
            onClick={handleBackToList}
            className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 mb-6"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Forms
          </button>
          <DynamicForm
            formTemplate={selectedForm}
            onSubmit={handleSubmitForm}
            isLoading={isSubmitting}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur-md border-b border-gray-200/50 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center">
                <FileText className="h-6 w-6 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                FormFlow
              </span>
            </div>
            <Link
              href="/admin"
              className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-sm font-medium rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              <Users className="h-4 w-4 mr-2" />
              Login as Admin
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 via-indigo-600/5 to-purple-600/10"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <div className="inline-flex items-center px-4 py-2 bg-blue-100 text-blue-800 text-sm font-medium rounded-full mb-8 animate-pulse">
              <Sparkles className="h-4 w-4 mr-2" />
              Secure & Professional
            </div>
            
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-8">
              <span className="bg-gradient-to-r from-gray-900 via-blue-900 to-indigo-900 bg-clip-text text-transparent">
                Onboarding
              </span>
              <br />
              <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
                Forms
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-600 max-w-4xl mx-auto mb-12 leading-relaxed">
              Please select a form below to get started with your onboarding process. 
              All forms are <span className="font-semibold text-blue-600">secure</span> and your information will be processed <span className="font-semibold text-indigo-600">confidentially</span>.
            </p>

            {/* Security Badges */}
            <div className="flex flex-wrap justify-center items-center gap-8 mb-16">
              <div className="flex items-center space-x-2 bg-white/60 backdrop-blur-sm px-4 py-2 rounded-full border border-gray-200/50">
                <Shield className="h-5 w-5 text-green-600" />
                <span className="text-sm font-medium text-gray-700">SSL Encrypted</span>
              </div>
              <div className="flex items-center space-x-2 bg-white/60 backdrop-blur-sm px-4 py-2 rounded-full border border-gray-200/50">
                <Lock className="h-5 w-5 text-blue-600" />
                <span className="text-sm font-medium text-gray-700">GDPR Compliant</span>
              </div>
              <div className="flex items-center space-x-2 bg-white/60 backdrop-blur-sm px-4 py-2 rounded-full border border-gray-200/50">
                <Zap className="h-5 w-5 text-yellow-600" />
                <span className="text-sm font-medium text-gray-700">Fast Processing</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Forms Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Available Forms
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Choose from our comprehensive collection of onboarding forms designed for your specific needs.
          </p>
        </div>
        
        <FormList
          forms={forms}
          onSelectForm={handleSelectForm}
          isLoading={isLoading}
        />
      </div>

      {/* Features Section */}
      <div className="bg-white/50 backdrop-blur-sm border-t border-gray-200/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Why Choose Our Platform?
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Built with modern technology and security in mind.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center group">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-200">
                <Shield className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Bank-Level Security</h3>
              <p className="text-gray-600">Your data is protected with enterprise-grade encryption and security measures.</p>
            </div>
            
            <div className="text-center group">
              <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-200">
                <Zap className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Lightning Fast</h3>
              <p className="text-gray-600">Submit forms in seconds with our optimized, responsive interface.</p>
            </div>
            
            <div className="text-center group">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-200">
                <Globe className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Global Access</h3>
              <p className="text-gray-600">Access your forms from anywhere, on any device, at any time.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gradient-to-r from-gray-900 via-blue-900 to-indigo-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Brand */}
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-2xl flex items-center justify-center mr-4">
                  <FileText className="h-7 w-7 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">
                    FormFlow
                  </h3>
                  <p className="text-blue-200 text-sm font-medium">
                    Dynamic Form Platform
                  </p>
                </div>
              </div>
              <p className="text-gray-300 text-lg leading-relaxed mb-6 max-w-md">
                A professional, scalable platform for creating and managing dynamic onboarding forms. 
                Built for financial services with enterprise-grade security and flexibility.
              </p>
              <div className="flex space-x-4">
                <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center hover:bg-white/20 transition-colors cursor-pointer">
                  <Shield className="h-5 w-5 text-blue-300" />
                </div>
                <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center hover:bg-white/20 transition-colors cursor-pointer">
                  <Lock className="h-5 w-5 text-green-300" />
                </div>
                <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center hover:bg-white/20 transition-colors cursor-pointer">
                  <Zap className="h-5 w-5 text-yellow-300" />
                </div>
              </div>
            </div>

            {/* Features */}
            <div>
              <h4 className="text-lg font-semibold mb-4 text-white">Features</h4>
              <ul className="space-y-3">
                <li className="flex items-center text-gray-300 hover:text-white transition-colors">
                  <div className="w-2 h-2 bg-blue-400 rounded-full mr-3"></div>
                  Dynamic Form Builder
                </li>
                <li className="flex items-center text-gray-300 hover:text-white transition-colors">
                  <div className="w-2 h-2 bg-blue-400 rounded-full mr-3"></div>
                  File Upload Support
                </li>
                <li className="flex items-center text-gray-300 hover:text-white transition-colors">
                  <div className="w-2 h-2 bg-blue-400 rounded-full mr-3"></div>
                  Real-time Notifications
                </li>
                <li className="flex items-center text-gray-300 hover:text-white transition-colors">
                  <div className="w-2 h-2 bg-blue-400 rounded-full mr-3"></div>
                  Advanced Validation
                </li>
                <li className="flex items-center text-gray-300 hover:text-white transition-colors">
                  <div className="w-2 h-2 bg-blue-400 rounded-full mr-3"></div>
                  Responsive Design
                </li>
              </ul>
            </div>

            {/* Technology */}
            <div>
              <h4 className="text-lg font-semibold mb-4 text-white">Technology</h4>
              <ul className="space-y-3">
                <li className="flex items-center text-gray-300 hover:text-white transition-colors">
                  <div className="w-2 h-2 bg-indigo-400 rounded-full mr-3"></div>
                  Next.js 15
                </li>
                <li className="flex items-center text-gray-300 hover:text-white transition-colors">
                  <div className="w-2 h-2 bg-indigo-400 rounded-full mr-3"></div>
                  Django REST
                </li>
                <li className="flex items-center text-gray-300 hover:text-white transition-colors">
                  <div className="w-2 h-2 bg-indigo-400 rounded-full mr-3"></div>
                  Celery & Redis
                </li>
                <li className="flex items-center text-gray-300 hover:text-white transition-colors">
                  <div className="w-2 h-2 bg-indigo-400 rounded-full mr-3"></div>
                  TypeScript
                </li>
                <li className="flex items-center text-gray-300 hover:text-white transition-colors">
                  <div className="w-2 h-2 bg-indigo-400 rounded-full mr-3"></div>
                  Tailwind CSS
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="border-t border-gray-700 mt-12 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <div className="text-gray-400 text-sm mb-4 md:mb-0">
                © 2024 FormFlow Platform. Built for assessment purposes. All rights reserved.
              </div>
              <div className="flex items-center space-x-6 text-sm text-gray-400">
                <span className="flex items-center">
                  <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
                  System Online
                </span>
                <span>v1.0.0</span>
                <span>Assessment Project</span>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}