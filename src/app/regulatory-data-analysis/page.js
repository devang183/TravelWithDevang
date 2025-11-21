'use client';

export default function AnalyticsPage() {
  // Replace this URL with your actual Looker Studio embed URL
  const lookerStudioUrl = "https://lookerstudio.google.com/embed/reporting/8b128ee0-805a-4f48-ba9d-e0a5ee5bc8f7/page/PkhZF";
  
  return (
    <div className="min-h-screen bg-white/10 backdrop-blur-sm rounded-lg p-4">
      <div className="max-w-7xl mx-auto">
        {/* <h1 className="text-3xl font-bold text-gray-900 justify-center text-center font-sans mb-6">Analytics Dashboard</h1> */}
        <h1 className="text-3xl font-bold text-gray-900 text-center font-['Times_New_Roman'] mb-6">Analytics Dashboard</h1>
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <iframe
            src={lookerStudioUrl}
            width="100%"
            height="800"
            style={{ border: 0 }}
            allowFullScreen
            sandbox="allow-storage-access-by-user-activation allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox"
            title="Looker Studio Dashboard"
          />
        </div>
        
        <div className="mt-4 text-sm text-gray-600">
          <p>📊 Powered by Looker Studio</p>
        </div>
      </div>
    </div>
  );
}
