import React, { useState } from 'react';
import { Mail, Send, ArrowLeft, Plus, X, Users, CheckCircle, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

function BallonMail() {
  const navigate = useNavigate();
  const [recipients, setRecipients] = useState(['']);
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const addRecipient = () => {
    setRecipients([...recipients, '']);
  };

  const removeRecipient = (index) => {
    if (recipients.length > 1) {
      setRecipients(recipients.filter((_, i) => i !== index));
    }
  };

  const updateRecipient = (index, value) => {
    const newRecipients = [...recipients];
    newRecipients[index] = value;
    setRecipients(newRecipients);
  };

  const handleSendBulk = async (e) => {
    e.preventDefault();
    setError('');
    setSent(false);

    // Validate recipients
    const validRecipients = recipients.filter(email => email.trim() !== '');
    if (validRecipients.length === 0) {
      setError('Please add at least one recipient email address');
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const invalidEmails = validRecipients.filter(email => !emailRegex.test(email));
    if (invalidEmails.length > 0) {
      setError('Please enter valid email addresses');
      return;
    }

    if (!subject.trim()) {
      setError('Please enter a subject');
      return;
    }

    if (!message.trim()) {
      setError('Please enter a message');
      return;
    }

    setSending(true);

    // Simulate sending (replace with actual API call)
    setTimeout(() => {
      setSending(false);
      setSent(true);
      // Reset form after 3 seconds
      setTimeout(() => {
        setSent(false);
        setRecipients(['']);
        setSubject('');
        setMessage('');
      }, 3000);
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-lg border-b border-gray-200/60 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3 sm:space-x-4">
              <button
                onClick={() => navigate('/')}
                className="p-2 hover:bg-gray-100 rounded-lg transition-all"
                aria-label="Back to Home"
              >
                <ArrowLeft className="w-5 h-5 sm:w-6 sm:h-6 text-gray-700" />
              </button>
              <div className="flex items-center space-x-2 sm:space-x-3">
                <div className="bg-gradient-to-br from-purple-600 to-pink-600 p-1.5 sm:p-2 rounded-lg sm:rounded-xl shadow-sm">
                  <Mail className="w-5 h-5 sm:w-7 sm:h-7 text-white" />
                </div>
                <div>
                  <h1 className="text-lg sm:text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                    BallonMail<sup className="text-xs sm:text-sm ml-0.5 text-purple-600">GB</sup>
                  </h1>
                  <p className="text-xs sm:text-sm text-gray-600">Bulk Email Service</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-3 sm:px-6 py-6 sm:py-12">
        {/* Hero Section */}
        <div className="text-center mb-8 sm:mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-purple-100 to-pink-100 rounded-2xl mb-4 sm:mb-6">
            <Users className="w-8 h-8 sm:w-10 sm:h-10 text-purple-600" />
          </div>
          <h2 className="text-2xl sm:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">
            Send Bulk Emails Instantly
          </h2>
          <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto">
            Send emails to multiple recipients at once. Perfect for announcements, newsletters, and team communications.
          </p>
        </div>

        {/* Bulk Email Form */}
        <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-200/60 p-4 sm:p-8">
          <form onSubmit={handleSendBulk} className="space-y-4 sm:space-y-6">
            {/* Recipients Section */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="block text-sm sm:text-base font-semibold text-gray-900">
                  Recipients
                </label>
                <button
                  type="button"
                  onClick={addRecipient}
                  className="flex items-center space-x-1 text-xs sm:text-sm text-purple-600 hover:text-purple-700 font-medium transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add recipient</span>
                </button>
              </div>
              <div className="space-y-2 sm:space-y-3">
                {recipients.map((recipient, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <input
                      type="email"
                      value={recipient}
                      onChange={(e) => updateRecipient(index, e.target.value)}
                      placeholder={`recipient${index + 1}@example.com`}
                      className="flex-1 px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
                    />
                    {recipients.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeRecipient(index)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-all"
                        aria-label="Remove recipient"
                      >
                        <X className="w-4 h-4 sm:w-5 sm:h-5" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
              <p className="mt-2 text-xs sm:text-sm text-gray-500">
                {recipients.filter(r => r.trim()).length} recipient(s) added
              </p>
            </div>

            {/* Subject */}
            <div>
              <label className="block text-sm sm:text-base font-semibold text-gray-900 mb-3">
                Subject
              </label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Email subject"
                className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
              />
            </div>

            {/* Message */}
            <div>
              <label className="block text-sm sm:text-base font-semibold text-gray-900 mb-3">
                Message
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Write your message here..."
                rows={8}
                className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all resize-none"
              />
            </div>

            {/* Error Message */}
            {error && (
              <div className="flex items-center space-x-2 p-3 sm:p-4 bg-red-50 border border-red-200 rounded-lg">
                <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-red-600 flex-shrink-0" />
                <p className="text-xs sm:text-sm text-red-700">{error}</p>
              </div>
            )}

            {/* Success Message */}
            {sent && (
              <div className="flex items-center space-x-2 p-3 sm:p-4 bg-green-50 border border-green-200 rounded-lg">
                <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 flex-shrink-0" />
                <p className="text-xs sm:text-sm text-green-700">
                  Emails sent successfully to {recipients.filter(r => r.trim()).length} recipient(s)!
                </p>
              </div>
            )}

            {/* Send Button */}
            <button
              type="submit"
              disabled={sending || sent}
              className="w-full flex items-center justify-center space-x-2 px-4 sm:px-6 py-3 sm:py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white text-sm sm:text-base font-semibold rounded-lg transition-all shadow-lg shadow-purple-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className={`w-4 h-4 sm:w-5 sm:h-5 ${sending ? 'animate-pulse' : ''}`} />
              <span>{sending ? 'Sending...' : sent ? 'Sent!' : 'Send to All Recipients'}</span>
            </button>
          </form>
        </div>

        {/* Features Section */}
        <div className="mt-8 sm:mt-12 grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
          <div className="bg-white p-4 sm:p-6 rounded-xl border border-gray-200 text-center">
            <div className="inline-flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 bg-purple-100 rounded-lg mb-3">
              <Users className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600" />
            </div>
            <h3 className="font-semibold text-sm sm:text-base text-gray-900 mb-2">Multiple Recipients</h3>
            <p className="text-xs sm:text-sm text-gray-600">Send to unlimited recipients at once</p>
          </div>
          
          <div className="bg-white p-4 sm:p-6 rounded-xl border border-gray-200 text-center">
            <div className="inline-flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 bg-pink-100 rounded-lg mb-3">
              <Send className="w-5 h-5 sm:w-6 sm:h-6 text-pink-600" />
            </div>
            <h3 className="font-semibold text-sm sm:text-base text-gray-900 mb-2">Instant Delivery</h3>
            <p className="text-xs sm:text-sm text-gray-600">Emails delivered instantly</p>
          </div>
          
          <div className="bg-white p-4 sm:p-6 rounded-xl border border-gray-200 text-center">
            <div className="inline-flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 bg-green-100 rounded-lg mb-3">
              <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" />
            </div>
            <h3 className="font-semibold text-sm sm:text-base text-gray-900 mb-2">No Limits</h3>
            <p className="text-xs sm:text-sm text-gray-600">Send as many emails as you need</p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-12 pb-8 sm:pb-12 border-t border-gray-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 pt-6 sm:pt-8 text-center">
          <p className="text-gray-600 text-xs sm:text-sm">
            © 2024 BallonMail<sup className="text-[10px] sm:text-xs text-purple-600">GB</sup> - Bulk Email Service
          </p>
        </div>
      </footer>
    </div>
  );
}

export default BallonMail;
