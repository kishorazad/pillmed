import React from 'react';
import HealthcareAssistant from '../components/ai/HealthcareAssistant';

const AIHealthcare = () => {
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">AI Healthcare Assistant</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Get trusted health information, medication guidance, and check drug interactions with our AI-powered healthcare assistant.
          </p>
        </div>
        
        <HealthcareAssistant />
        
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mt-8">
          <h2 className="text-xl font-semibold text-blue-800 mb-3">About Our AI Healthcare Assistant</h2>
          <div className="text-gray-700 space-y-3">
            <p>
              Our AI Healthcare Assistant is designed to provide general health information and guidance on common health topics.
              It can help you understand medications, explore potential drug interactions, and answer general health questions.
            </p>
            <p>
              <strong>Important Note:</strong> The information provided by this assistant is for educational purposes only and 
              is not a substitute for professional medical advice, diagnosis, or treatment. Always seek the advice of your 
              physician or other qualified health provider with any questions you may have regarding a medical condition.
            </p>
            <p>
              In case of a medical emergency, call your local emergency services immediately.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIHealthcare;