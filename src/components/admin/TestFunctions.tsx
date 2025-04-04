import React, { useState } from 'react';
import {
  testHelloWorld,
  testHelloWorldCORS,
  testSendEmail,
  testGenerateReferralCode,
  testVerifyUserEmail
} from '../../services/testFunction';
import { useAuth } from '../../context/AuthContext';

const TestFunctions: React.FC = () => {
  const { currentUser } = useAuth();
  const [results, setResults] = useState<any>(null);
  const [loading, setLoading] = useState<string | null>(null);
  const [testEmail, setTestEmail] = useState<string>(currentUser?.email || '');

  const runTest = async (testName: string, testFn: () => Promise<any>) => {
    setLoading(testName);
    setResults(null);
    
    try {
      const result = await testFn();
      setResults({ testName, result });
    } catch (error) {
      setResults({ testName, error: JSON.stringify(error) });
    } finally {
      setLoading(null);
    }
  };

  if (!currentUser) {
    return <div className="p-4">Please login to test functions</div>;
  }

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">Test Firebase Cloud Functions</h1>
      
      <div className="mb-4">
        <label className="block mb-2">Email for testing:</label>
        <input
          type="email"
          value={testEmail}
          onChange={(e) => setTestEmail(e.target.value)}
          className="border p-2 rounded w-full max-w-md"
        />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <button
          onClick={() => runTest('helloWorld', testHelloWorld)}
          disabled={loading !== null}
          className="bg-blue-500 text-white p-2 rounded disabled:opacity-50"
        >
          {loading === 'helloWorld' ? 'Testing...' : 'Test Hello World'}
        </button>
        
        <button
          onClick={() => runTest('helloWorldCORS', testHelloWorldCORS)}
          disabled={loading !== null}
          className="bg-blue-300 text-white p-2 rounded disabled:opacity-50"
        >
          {loading === 'helloWorldCORS' ? 'Testing...' : 'Test CORS Configuration'}
        </button>
        
        <button
          onClick={() => runTest('sendEmail', () => testSendEmail(testEmail))}
          disabled={loading !== null || !testEmail}
          className="bg-green-500 text-white p-2 rounded disabled:opacity-50"
        >
          {loading === 'sendEmail' ? 'Testing...' : 'Test Send Email'}
        </button>
        
        <button
          onClick={() => runTest('generateReferralCode', testGenerateReferralCode)}
          disabled={loading !== null}
          className="bg-purple-500 text-white p-2 rounded disabled:opacity-50"
        >
          {loading === 'generateReferralCode' ? 'Testing...' : 'Test Generate Referral Code'}
        </button>
        
        <button
          onClick={() => runTest('verifyUserEmail', () => testVerifyUserEmail(testEmail))}
          disabled={loading !== null || !testEmail}
          className="bg-yellow-500 text-white p-2 rounded disabled:opacity-50"
        >
          {loading === 'verifyUserEmail' ? 'Testing...' : 'Test Verify User Email'}
        </button>
      </div>
      
      {results && (
        <div className="mt-6 p-4 bg-gray-100 rounded">
          <h2 className="text-lg font-semibold mb-2">Results: {results.testName}</h2>
          <pre className="bg-white p-2 rounded overflow-auto max-h-96">
            {JSON.stringify(results.result || results.error, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
};

export default TestFunctions; 