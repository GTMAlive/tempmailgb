import React, { useState, useEffect } from 'react';
import { Mail, Copy, RefreshCw, Trash2, Clock, Check, Inbox, Shield, Zap, Download, ExternalLink, ChevronRight, HelpCircle, Lock, UserCheck, AlertCircle, CheckCircle } from 'lucide-react';
import axios from 'axios';

// Use environment variable or fallback to demo mode
const API_URL = import.meta.env.VITE_API_URL || null;
const DEMO_MODE = !API_URL; // If no API URL, use demo mode

function App() {
  const [showLanding, setShowLanding] = useState(true);
  const [currentEmail, setCurrentEmail] = useState('');
  const [inbox, setInbox] = useState([]);
  const [selectedEmail, setSelectedEmail] = useState(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [expiresAt, setExpiresAt] = useState(null);
  const [viewMode, setViewMode] = useState('html'); // 'html' or 'plain'

  // Auto-generate email on page load
  useEffect(() => {
    generateEmail();
  }, []);

  useEffect(() => {
    if (currentEmail) {
      fetchInbox();
      const interval = setInterval(fetchInbox, 5000); // Poll every 5 seconds
      return () => clearInterval(interval);
    }
  }, [currentEmail]);

  const generateEmail = async () => {
    setLoading(true);
    try {
      if (DEMO_MODE) {
        // Demo mode: Generate random email client-side
        const randomString = Math.random().toString(36).substring(2, 12);
        const email = `${randomString}@ainewmail.online`;
        setCurrentEmail(email);
        setExpiresAt(Date.now() + 3600000); // 1 hour
        setInbox([]);
        setSelectedEmail(null);
        setShowLanding(false);
      } else {
        const response = await axios.post(`${API_URL}/generate`);
        setCurrentEmail(response.data.email);
        setExpiresAt(Date.now() + response.data.expiresIn);
        setInbox([]);
        setSelectedEmail(null);
        setShowLanding(false);
      }
    } catch (error) {
      console.error('Error generating email:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchInbox = async () => {
    if (!currentEmail) return;
    try {
      if (DEMO_MODE) {
        // Demo mode: Inbox is managed client-side
        return;
      } else {
        const response = await axios.get(`${API_URL}/inbox/${currentEmail}`);
        const newEmails = response.data.emails;
        setInbox(newEmails);
        
        // If there's a selected email, update it with fresh data
        if (selectedEmail) {
          const updatedEmail = newEmails.find(email => email.id === selectedEmail.id);
          if (updatedEmail) {
            setSelectedEmail(updatedEmail);
          }
        }
      }
    } catch (error) {
      console.error('Error fetching inbox:', error);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(currentEmail);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const deleteEmail = async (emailId) => {
    try {
      if (!DEMO_MODE) {
        await axios.delete(`${API_URL}/delete/${emailId}`);
      }
      setInbox(inbox.filter(email => email.id !== emailId));
      if (selectedEmail?.id === emailId) {
        setSelectedEmail(null);
      }
    } catch (error) {
      console.error('Error deleting email:', error);
    }
  };

  const shareAsNoteMail = async (email) => {
    try {
      const response = await axios.post('http://localhost:5001/api/notemail/create', {
        email: {
          from: email.from,
          to: currentEmail,
          subject: email.subject,
          body: email.body,
          timestamp: email.timestamp,
          emailId: email.id,
          replyTo: currentEmail // Allow replies back to this temp email
        },
        options: {
          maxViews: 1,
          expiresIn: 86400000 // 24 hours
        }
      });

      // Create NoteMail link
      const noteId = response.data.noteId;
      const key = response.data.shareLink.split('#')[1];
      const noteMailLink = `http://localhost:5173/notemail/${noteId}#${key}`;

      // Copy link to clipboard
      navigator.clipboard.writeText(noteMailLink);
      alert('✅ NoteMail link copied to clipboard!\n\n🔗 Share this link - it will self-destruct after being read once.\n\n🔥 The recipient can reply back to your inbox!');
    } catch (error) {
      console.error('Error creating NoteMail:', error);
      alert('❌ Failed to create NoteMail. Please try again.');
    }
  };

  const markAsRead = async (email) => {
    if (!email.read) {
      try {
        if (!DEMO_MODE) {
          await axios.put(`${API_URL}/email/${currentEmail}/${email.id}/read`);
        } else {
          // Demo mode: Mark as read locally
          setInbox(prev => prev.map(e => 
            e.id === email.id ? { ...e, read: true } : e
          ));
        }
      } catch (error) {
        console.error('Error marking email as read:', error);
      }
    }
    setSelectedEmail(email);
  };

  const simulateEmail = async () => {
    if (!currentEmail) return;
    try {
      if (DEMO_MODE) {
        // Demo mode: Generate demo email client-side
        const demoEmails = [
          {
            id: Date.now().toString(),
            from: 'welcome@tempmail.com',
            subject: 'Welcome to TempMail! 🎉',
            body: 'Thank you for using TempMail! This is a demo email showing how our temporary email service works.\n\nYour temporary email address is active and ready to receive messages. Use it anywhere you need a disposable email address.\n\nFeatures:\n• Instant email generation\n• No registration required\n• Automatic expiration after 1 hour\n• Complete privacy protection\n\nEnjoy using TempMail!',
            html_body: '<div style="font-family: Arial, sans-serif; max-width: 600px; padding: 20px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 10px;"><div style="background: white; padding: 30px; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);"><h2 style="color: #667eea; margin-top: 0;">Welcome to TempMail! 🎉</h2><p style="color: #333; line-height: 1.6; margin-bottom: 20px;">Thank you for using TempMail! This is a demo email showing how our temporary email service works.</p><p style="color: #666; line-height: 1.6; margin-bottom: 20px;">Your temporary email address is active and ready to receive messages. Use it anywhere you need a disposable email address.</p><div style="background: #f7fafc; padding: 20px; border-radius: 6px; margin: 20px 0;"><h3 style="color: #667eea; margin-top: 0; font-size: 16px;">Features:</h3><ul style="color: #333; line-height: 1.8; margin: 0; padding-left: 20px;"><li>Instant email generation</li><li>No registration required</li><li>Automatic expiration after 1 hour</li><li>Complete privacy protection</li></ul></div><p style="color: #333; line-height: 1.6; margin-bottom: 0;">Enjoy using TempMail!</p></div></div>',
            timestamp: Date.now(),
            read: false
          },
          {
            id: (Date.now() + 1).toString(),
            from: 'verify@service.com',
            subject: 'Email Verification Code',
            body: 'Your verification code is: 742691\n\nThis code will expire in 10 minutes.\n\nIf you didn\'t request this code, please ignore this email.',
            html_body: '<div style="font-family: Arial, sans-serif; max-width: 600px; padding: 20px;"><div style="background: #fff; padding: 30px; border: 2px solid #e2e8f0; border-radius: 8px;"><h2 style="color: #2d3748; margin-top: 0;">Email Verification</h2><p style="color: #4a5568; line-height: 1.6; margin-bottom: 20px;">Your verification code is:</p><div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; font-size: 32px; font-weight: bold; letter-spacing: 8px; text-align: center; padding: 20px; border-radius: 8px; margin: 20px 0;">742691</div><p style="color: #718096; font-size: 14px; line-height: 1.6; margin-bottom: 20px;">This code will expire in <strong>10 minutes</strong>.</p><p style="color: #a0aec0; font-size: 12px; line-height: 1.6; margin-bottom: 0;">If you didn\'t request this code, please ignore this email.</p></div></div>',
            timestamp: Date.now(),
            read: false
          }
        ];
        
        const randomEmail = demoEmails[Math.floor(Math.random() * demoEmails.length)];
        setInbox(prev => [randomEmail, ...prev]);
      } else {
        await axios.post(`${API_URL}/simulate-receive`, {
          to: currentEmail,
          from: 'demo@example.com',
          subject: 'Welcome to TempMail!',
          body: 'This is a demo email to show how the temporary email system works. In production, this would receive real emails from external sources.'
        });
        fetchInbox();
      }
    } catch (error) {
      console.error('Error simulating email:', error);
    }
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;
    
    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-green-600 p-2.5 rounded-lg">
                <Mail className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">TempMail</h1>
                <p className="text-xs text-gray-500">Temporary Email Service</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              {DEMO_MODE && (
                <div className="hidden sm:flex items-center space-x-2 px-3 py-1.5 bg-yellow-100 border border-yellow-300 rounded-lg text-sm">
                  <AlertCircle className="w-4 h-4 text-yellow-600" />
                  <span className="font-medium text-yellow-700">Demo Mode</span>
                </div>
              )}
              <button
                onClick={() => window.location.href = '/notemail'}
                className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all shadow-sm"
              >
                <ExternalLink className="w-4 h-4" />
                <span className="hidden sm:inline">NoteMail</span>
              </button>
              <div className="hidden sm:flex items-center space-x-2 text-sm text-gray-600">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="font-medium">Service Active</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        
        {/* Email Generator - Always Show */}
        <div className="bg-white rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.08)] p-8 mb-8 border border-gray-200">
          {loading && !currentEmail ? (
            <div className="text-center py-12">
              <RefreshCw className="w-12 h-12 text-green-600 animate-spin mx-auto mb-4" />
              <p className="text-gray-600 font-medium">Generating your temporary email...</p>
            </div>
          ) : currentEmail ? (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">Your Temporary Email Address</label>
                <div className="relative">
                  <div className="flex items-center space-x-2 bg-gray-50 border-2 border-gray-300 p-4 rounded-lg focus-within:border-green-500 focus-within:ring-2 focus-within:ring-green-200 transition-all shadow-[inset_0_1px_3px_rgba(0,0,0,0.08)]">
                    <Mail className="w-5 h-5 text-gray-400 flex-shrink-0" />
                    <input
                      type="text"
                      value={currentEmail}
                      readOnly
                      className="flex-1 bg-transparent text-base font-mono outline-none text-gray-900 font-medium"
                    />
                    <button
                      onClick={copyToClipboard}
                      className="flex-shrink-0 p-2.5 bg-green-600 hover:bg-green-700 rounded-lg transition-all shadow-sm"
                      title="Copy to clipboard"
                    >
                      {copied ? (
                        <Check className="w-5 h-5 text-white" />
                      ) : (
                        <Copy className="w-5 h-5 text-white" />
                      )}
                    </button>
                  </div>
                  {copied && (
                    <div className="absolute -top-12 right-0 bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-semibold shadow-lg flex items-center space-x-2">
                      <Check className="w-4 h-4" />
                      <span>Copied!</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg shadow-[inset_0_1px_2px_rgba(0,0,0,0.04)]">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Clock className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-xs text-blue-600 font-medium">Expires In</p>
                      <p className="text-lg font-bold text-blue-900">1 Hour</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-green-50 border border-green-200 p-4 rounded-lg shadow-[inset_0_1px_2px_rgba(0,0,0,0.04)]">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <Inbox className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <p className="text-xs text-green-600 font-medium">Emails Received</p>
                      <p className="text-lg font-bold text-green-900">{inbox.length}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={simulateEmail}
                  className="flex-1 flex items-center justify-center space-x-2 bg-green-600 hover:bg-green-700 text-white py-3 px-6 rounded-lg font-semibold transition-all shadow-md hover:shadow-lg"
                >
                  <Download className="w-5 h-5" />
                  <span>Send Test Email</span>
                </button>
                
                <button
                  onClick={generateEmail}
                  className="flex items-center justify-center space-x-2 bg-white hover:bg-gray-50 border-2 border-gray-300 text-gray-700 py-3 px-6 rounded-lg font-semibold transition-all"
                >
                  <RefreshCw className="w-5 h-5" />
                  <span>New Email</span>
                </button>
              </div>
            </div>
          ) : null}
        </div>

        {/* Inbox */}
        {currentEmail && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Email List */}
            <div className="lg:col-span-1 bg-white rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.08)] overflow-hidden border border-gray-200">
              <div className="bg-gray-50 border-b border-gray-200 px-6 py-4 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Inbox className="w-5 h-5 text-green-600" />
                  <h3 className="font-bold text-lg text-gray-900">Inbox ({inbox.length})</h3>
                </div>
                <button
                  onClick={fetchInbox}
                  className="p-2 hover:bg-gray-200 rounded-lg transition-all"
                  title="Refresh"
                >
                  <RefreshCw className="w-5 h-5 text-gray-600" />
                </button>
              </div>

              <div className="divide-y divide-gray-100 max-h-96 overflow-y-auto">
                {inbox.length === 0 ? (
                  <div className="p-12 text-center">
                    <div className="inline-block p-4 bg-gray-100 rounded-full mb-4">
                      <Mail className="w-12 h-12 text-gray-400" />
                    </div>
                    <p className="text-gray-600 font-medium">No emails yet</p>
                    <p className="text-sm text-gray-500 mt-2">New emails will appear here</p>
                  </div>
                ) : (
                  inbox.map((email) => (
                    <div
                      key={email.id}
                      onClick={() => markAsRead(email)}
                      className={`p-4 cursor-pointer hover:bg-gray-50 transition-all ${
                        selectedEmail?.id === email.id ? 'bg-green-50 border-l-4 border-green-600' : ''
                      } ${!email.read ? 'bg-blue-50' : ''}`}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <p className={`text-sm font-semibold ${!email.read ? 'text-gray-900' : 'text-gray-700'}`}>
                          {email.from}
                        </p>
                        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">{formatTime(email.timestamp)}</span>
                      </div>
                      <p className={`text-sm ${!email.read ? 'font-bold text-gray-900' : 'text-gray-600'} truncate mb-2`}>
                        {email.subject}
                      </p>
                      {!email.read && (
                        <span className="inline-flex items-center text-xs bg-green-600 text-white px-3 py-1 rounded-full font-medium">
                          <span className="w-2 h-2 bg-white rounded-full mr-2 animate-pulse"></span>
                          New
                        </span>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Email Content */}
            <div className="lg:col-span-2 bg-white rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.08)] overflow-hidden border border-gray-200">
              {selectedEmail ? (
                <div className="h-full flex flex-col">
                  <div className="bg-gray-50 border-b border-gray-200 px-6 py-5">
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="text-2xl font-bold text-gray-900">{selectedEmail.subject}</h3>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => shareAsNoteMail(selectedEmail)}
                          className="p-2.5 bg-purple-50 hover:bg-purple-100 border border-purple-200 rounded-lg transition-all"
                          title="Share as NoteMail"
                        >
                          <ExternalLink className="w-5 h-5 text-purple-600" />
                        </button>
                        <button
                          onClick={() => deleteEmail(selectedEmail.id)}
                          className="p-2.5 bg-red-50 hover:bg-red-100 border border-red-200 rounded-lg transition-all"
                          title="Delete email"
                        >
                          <Trash2 className="w-5 h-5 text-red-600" />
                        </button>
                      </div>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-start space-x-3">
                        <span className="font-semibold text-gray-600 min-w-[60px]">From:</span>
                        <span className="text-gray-900 bg-white border border-gray-200 px-3 py-1.5 rounded-lg flex-1">{selectedEmail.from}</span>
                      </div>
                      <div className="flex items-start space-x-3">
                        <span className="font-semibold text-gray-600 min-w-[60px]">To:</span>
                        <span className="text-gray-900 bg-white border border-gray-200 px-3 py-1.5 rounded-lg font-mono text-xs flex-1">{currentEmail}</span>
                      </div>
                      <div className="flex items-start space-x-3">
                        <span className="font-semibold text-gray-600 min-w-[60px]">Date:</span>
                        <span className="text-gray-900 bg-white border border-gray-200 px-3 py-1.5 rounded-lg flex-1">{new Date(selectedEmail.timestamp).toLocaleString()}</span>
                      </div>
                    </div>
                    {/* View Mode Toggle */}
                    <div className="flex items-center justify-end space-x-2 px-6 py-2 bg-gray-50 border-t border-gray-200">
                      <span className="text-xs text-gray-500">View:</span>
                      <button
                        onClick={() => setViewMode('html')}
                        className={`px-3 py-1 text-xs rounded-md transition-all ${
                          viewMode === 'html' 
                            ? 'bg-blue-600 text-white font-medium' 
                            : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                        }`}
                      >
                        HTML
                      </button>
                      <button
                        onClick={() => setViewMode('plain')}
                        className={`px-3 py-1 text-xs rounded-md transition-all ${
                          viewMode === 'plain' 
                            ? 'bg-blue-600 text-white font-medium' 
                            : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                        }`}
                      >
                        Plain Text
                      </button>
                    </div>
                  </div>
                  <div className="flex-1 p-8 overflow-y-auto bg-white">
                    {viewMode === 'html' && selectedEmail.html_body ? (
                      <div 
                        className="email-content prose max-w-none"
                        dangerouslySetInnerHTML={{ __html: selectedEmail.html_body }}
                        style={{
                          fontFamily: 'Arial, sans-serif',
                          lineHeight: '1.6',
                          color: '#333'
                        }}
                      />
                    ) : (
                      <div className="prose max-w-none">
                        <p className="whitespace-pre-wrap text-gray-700 leading-relaxed text-base">{selectedEmail.body}</p>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="h-96 flex items-center justify-center">
                  <div className="text-center">
                    <div className="inline-block p-6 bg-gray-100 rounded-full mb-4">
                      <Mail className="w-16 h-16 text-gray-400" />
                    </div>
                    <p className="text-gray-700 font-medium text-lg">Select an email to view</p>
                    <p className="text-gray-500 text-sm mt-2">Click on any email from the inbox</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* How to Use Section */}
      <section className="mt-16 bg-white py-16 border-y border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">How to Use TempMail</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Get started with your temporary email in three simple steps
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
                <span className="text-2xl font-bold text-green-600">1</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Get Your Email</h3>
              <p className="text-gray-600">
                A temporary email address is automatically generated when you visit our site. Copy it with one click.
              </p>
            </div>
            
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
                <span className="text-2xl font-bold text-blue-600">2</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Use Anywhere</h3>
              <p className="text-gray-600">
                Use your temporary email for signups, verifications, or any service that requires an email address.
              </p>
            </div>
            
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-100 rounded-full mb-4">
                <span className="text-2xl font-bold text-purple-600">3</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Receive Instantly</h3>
              <p className="text-gray-600">
                All emails sent to your temporary address appear instantly in your inbox. No waiting required.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Why TempMail Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Why Use Temporary Email?</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Protect your privacy and keep your primary inbox clean
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                <Shield className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Privacy Protection</h3>
              <p className="text-gray-600 text-sm">
                Keep your real email address private and avoid unwanted tracking from websites and services.
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <AlertCircle className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Spam Prevention</h3>
              <p className="text-gray-600 text-sm">
                Avoid spam and promotional emails cluttering your primary inbox by using disposable addresses.
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center mb-4">
                <UserCheck className="w-6 h-6 text-yellow-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Account Testing</h3>
              <p className="text-gray-600 text-sm">
                Perfect for testing websites, apps, or services without using your personal email address.
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                <Lock className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Registration</h3>
              <p className="text-gray-600 text-sm">
                No signup, no passwords, no personal information required. Completely anonymous and free.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Frequently Asked Questions</h2>
            <p className="text-lg text-gray-600">
              Everything you need to know about temporary email services
            </p>
          </div>
          
          <div className="space-y-6">
            <div className="bg-gray-50 rounded-xl p-6 border border-gray-200 shadow-[inset_0_1px_2px_rgba(0,0,0,0.05)]">
              <div className="flex items-start space-x-3">
                <HelpCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">What is a temporary email address?</h3>
                  <p className="text-gray-600">
                    A temporary email address is a disposable email that you can use for a short period of time. It allows you to receive emails without revealing your real email address. Our service provides instant temporary emails that expire after 1 hour.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-gray-50 rounded-xl p-6 border border-gray-200 shadow-[inset_0_1px_2px_rgba(0,0,0,0.05)]">
              <div className="flex items-start space-x-3">
                <HelpCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">How long does the temporary email last?</h3>
                  <p className="text-gray-600">
                    Your temporary email address remains active for 1 hour from the time of generation. After this period, the email address and all received messages are automatically deleted to protect your privacy.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-gray-50 rounded-xl p-6 border border-gray-200 shadow-[inset_0_1px_2px_rgba(0,0,0,0.05)]">
              <div className="flex items-start space-x-3">
                <HelpCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Is it really free to use?</h3>
                  <p className="text-gray-600">
                    Yes, TempMail is completely free to use. There are no hidden charges, no subscription fees, and no registration required. You can generate as many temporary email addresses as you need.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-gray-50 rounded-xl p-6 border border-gray-200 shadow-[inset_0_1px_2px_rgba(0,0,0,0.05)]">
              <div className="flex items-start space-x-3">
                <HelpCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Can I send emails from my temporary address?</h3>
                  <p className="text-gray-600">
                    Currently, our service only supports receiving emails. Temporary email addresses are designed for one-way communication - receiving verification codes, confirmations, and other incoming messages.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-gray-50 rounded-xl p-6 border border-gray-200 shadow-[inset_0_1px_2px_rgba(0,0,0,0.05)]">
              <div className="flex items-start space-x-3">
                <HelpCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Is my data secure and private?</h3>
                  <p className="text-gray-600">
                    Yes, your privacy is our priority. We don't store any personal information, and all emails are automatically deleted after 1 hour. We don't track your activity or share any data with third parties.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-gray-50 rounded-xl p-6 border border-gray-200 shadow-[inset_0_1px_2px_rgba(0,0,0,0.05)]">
              <div className="flex items-start space-x-3">
                <HelpCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">What can I use temporary email for?</h3>
                  <p className="text-gray-600">
                    Temporary emails are perfect for: signing up for websites you don't fully trust, receiving verification codes, testing web applications, avoiding spam, protecting your primary email from data breaches, and accessing content that requires email registration.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-0 pb-12 border-t border-gray-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 pt-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            <div>
              <div className="flex items-center space-x-2 mb-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Shield className="w-5 h-5 text-green-600" />
                </div>
                <h4 className="font-bold text-gray-900">100% Secure</h4>
              </div>
              <p className="text-sm text-gray-600">Your data is never stored permanently. Complete privacy guaranteed.</p>
            </div>
            <div>
              <div className="flex items-center space-x-2 mb-3">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <Zap className="w-5 h-5 text-yellow-600" />
                </div>
                <h4 className="font-bold text-gray-900">Instant Setup</h4>
              </div>
              <p className="text-sm text-gray-600">No registration needed. Get your temporary email in seconds.</p>
            </div>
            <div>
              <div className="flex items-center space-x-2 mb-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Clock className="w-5 h-5 text-blue-600" />
                </div>
                <h4 className="font-bold text-gray-900">Auto-Delete</h4>
              </div>
              <p className="text-sm text-gray-600">All emails automatically expire after 1 hour for your privacy.</p>
            </div>
          </div>
          
          <div className="border-t border-gray-200 pt-8 text-center">
            <div className="flex items-center justify-center space-x-2 mb-3">
              <div className="bg-green-600 p-2 rounded-lg">
                <Mail className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">TempMail</h3>
            </div>
            <p className="text-gray-600 text-sm mb-2">© 2024 TempMail - All rights reserved</p>
            <p className="text-xs text-gray-500">Free disposable temporary email service</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
