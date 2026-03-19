// Translation Service Test Component
import { useState } from 'react';
import { translationService, translateText } from '@/lib/translation-service';
import useModal from '@/hooks/useModal';
import Modal from '@/components/ui/Modal';

interface TestResult {
  input: string;
  output: string;
  success: boolean;
  error?: string;
}

export default function TranslationTest() {
  const [inputText, setInputText] = useState('Hello, how are you today?');
  const [targetLanguage, setTargetLanguage] = useState('turkish');
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { modalState, openModal, closeModal, confirmModal } = useModal();

  const runTest = async () => {
    setIsLoading(true);
    const result: TestResult = {
      input: inputText,
      output: '',
      success: false
    };

    try {
      const translatedText = await translateText(inputText, 'english', targetLanguage);
      result.output = translatedText;
      result.success = true;
    } catch (error) {
      result.error = error instanceof Error ? error.message : 'Unknown error';
    }

    setTestResults(prev => [result, ...prev]);
    setIsLoading(false);
  };

  const runBatchTest = async () => {
    setIsLoading(true);
    const testTexts = [
      'Hello world!',
      'This is a test prompt.',
      'How to use AI effectively?',
      'Create a marketing strategy.'
    ];

    const results: TestResult[] = [];

    for (const text of testTexts) {
      const result: TestResult = {
        input: text,
        output: '',
        success: false
      };

      try {
        const translatedText = await translateText(text, 'english', targetLanguage);
        result.output = translatedText;
        result.success = true;
      } catch (error) {
        result.error = error instanceof Error ? error.message : 'Unknown error';
      }

      results.push(result);
    }

    setTestResults(prev => [...results, ...prev]);
    setIsLoading(false);
  };

  const clearCache = () => {
    translationService.clearCache();
    openModal({
      title: 'Cache Cleared',
      message: 'Translation cache cleared successfully.',
      type: 'info',
    });
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white">
      <Modal
        isOpen={modalState.isOpen}
        onClose={closeModal}
        title={modalState.title}
        message={modalState.message}
        type={modalState.type}
        confirmText={modalState.confirmText}
        cancelText={modalState.cancelText}
        onConfirm={confirmModal}
        showCloseButton={modalState.showCloseButton}
      />
      <h1 className="text-2xl font-bold mb-6">Translation Service Test</h1>
      
      {/* Test Controls */}
      <div className="bg-gray-50 rounded-lg p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">Test Controls</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Input Text
            </label>
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-md"
              rows={3}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Target Language
            </label>
            <select
              value={targetLanguage}
              onChange={(e) => setTargetLanguage(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-md"
            >
              <option value="turkish">Turkish</option>
              <option value="spanish">Spanish</option>
              <option value="french">French</option>
              <option value="german">German</option>
              <option value="russian">Russian</option>
              <option value="chinese">Chinese</option>
              <option value="portuguese">Portuguese</option>
              <option value="hindi">Hindi</option>
              <option value="japanese">Japanese</option>
            </select>
          </div>
        </div>
        
        <div className="flex gap-3">
          <button
            onClick={runTest}
            disabled={isLoading}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {isLoading ? 'Testing...' : 'Run Single Test'}
          </button>
          
          <button
            onClick={runBatchTest}
            disabled={isLoading}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
          >
            {isLoading ? 'Testing...' : 'Run Batch Test'}
          </button>
          
          <button
            onClick={clearCache}
            className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
          >
            Clear Cache
          </button>
        </div>
      </div>

      {/* Test Results */}
      <div>
        <h2 className="text-lg font-semibold mb-4">Test Results ({testResults.length})</h2>
        
        {testResults.length === 0 ? (
          <p className="text-gray-500">No tests run yet.</p>
        ) : (
          <div className="space-y-4">
            {testResults.map((result, index) => (
              <div
                key={index}
                className={`border rounded-lg p-4 ${
                  result.success ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">
                      Test #{testResults.length - index}
                    </p>
                    <p className="text-sm text-gray-600">
                      {result.success ? '✅ Success' : '❌ Failed'}
                    </p>
                  </div>
                  <div className="text-xs text-gray-500">
                    {new Date().toLocaleTimeString()}
                  </div>
                </div>
                
                <div className="mb-2">
                  <p className="text-sm font-medium text-gray-700">Input:</p>
                  <p className="text-sm text-gray-900 bg-white p-2 rounded border">
                    {result.input}
                  </p>
                </div>
                
                <div>
                  <p className="text-sm font-medium text-gray-700">Output:</p>
                  <p className="text-sm text-gray-900 bg-white p-2 rounded border">
                    {result.output}
                  </p>
                </div>
                
                {result.error && (
                  <div className="mt-2">
                    <p className="text-sm font-medium text-red-700">Error:</p>
                    <p className="text-sm text-red-600 bg-white p-2 rounded border">
                      {result.error}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}