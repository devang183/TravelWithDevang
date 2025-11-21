'use client';

import { Mail } from 'lucide-react';

export default function VerifyRequest() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-xl p-8">
        <div className="text-center">
          <Mail className="mx-auto h-16 w-16 text-blue-500 mb-4" />
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Check your email
          </h1>
          <p className="text-gray-600 mb-6">
            A sign in link has been sent to your email address.
          </p>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-blue-800">
              Click the link in the email to sign in to your account.
            </p>
          </div>
          <p className="text-sm text-gray-500">
            You can close this page once you have clicked the link.
          </p>
        </div>
      </div>
    </div>
  );
}
