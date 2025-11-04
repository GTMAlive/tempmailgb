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
    
    // Auto-detect view mode based on email content
    if (email.html_body && email.html_body !== email.body.replace(/\n/g, '<br>')) {
      // Has real HTML content (not just converted plain text)
      setViewMode('html');
    } else {
      // Plain text email
      setViewMode('plain');
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      {/* Header - Shopify Style */}
      <header className="bg-white/80 backdrop-blur-lg border-b border-gray-200/60 sticky top-0 z-50">
        <div className="max-w-[1400px] mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-br from-green-600 to-green-700 p-2 rounded-xl shadow-sm">
                <Mail className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">TempMail</h1>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              {DEMO_MODE && (
                <div className="hidden sm:flex items-center space-x-2 px-3 py-1.5 bg-amber-50 border border-amber-200 rounded-lg text-sm">
                  <AlertCircle className="w-4 h-4 text-amber-600" />
                  <span className="font-medium text-amber-700">Demo Mode</span>
                </div>
              )}
              <a
                href="/notemail"
                className="flex items-center space-x-2 px-4 py-2 bg-gray-900 hover:bg-gray-800 text-white font-medium rounded-lg transition-all text-sm"
              >
                <ExternalLink className="w-4 h-4" />
                <span className="hidden sm:inline">NoteMail</span>
              </a>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-[1400px] mx-auto px-6 py-8">
        
        {/* Email Generator - Shopify Style */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200/60 p-8 mb-6">
          {loading && !currentEmail ? (
            <div className="text-center py-12">
              <RefreshCw className="w-12 h-12 text-green-600 animate-spin mx-auto mb-4" />
              <p className="text-gray-600 font-medium">Generating your temporary email...</p>
            </div>
          ) : currentEmail ? (
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Your temporary email address</label>
                <div className="relative">
                  <div className="flex items-center space-x-3 bg-gray-50/50 border border-gray-300 hover:border-gray-400 p-3.5 rounded-xl focus-within:border-green-600 focus-within:ring-4 focus-within:ring-green-100 transition-all group">
                    <Mail className="w-5 h-5 text-gray-400 flex-shrink-0" />
                    <input
                      type="text"
                      value={currentEmail}
                      readOnly
                      className="flex-1 bg-transparent text-sm font-mono outline-none text-gray-900 selection:bg-green-100"
                    />
                    <button
                      onClick={copyToClipboard}
                      className="flex-shrink-0 px-4 py-2 bg-gray-900 hover:bg-gray-800 text-white rounded-lg transition-all text-sm font-medium flex items-center space-x-2"
                      title="Copy to clipboard"
                    >
                      {copied ? (
                        <><Check className="w-4 h-4" /><span>Copied</span></>
                      ) : (
                        <><Copy className="w-4 h-4" /><span>Copy</span></>
                      )}
                    </button>
                  </div>
                  {copied && (
                    <div className="absolute -top-12 right-0 bg-gray-900 text-white px-3 py-2 rounded-lg text-xs font-medium shadow-lg flex items-center space-x-2 animate-in fade-in slide-in-from-top-2">
                      <Check className="w-3.5 h-3.5" />
                      <span>Copied to clipboard</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 border border-blue-200/60 p-4 rounded-xl">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-white rounded-lg shadow-sm">
                      <Clock className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-xs text-blue-600/80 font-medium">Expires in</p>
                      <p className="text-xl font-semibold text-blue-900">1 Hour</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gradient-to-br from-green-50 to-green-100/50 border border-green-200/60 p-4 rounded-xl">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-white rounded-lg shadow-sm">
                      <Inbox className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <p className="text-xs text-green-600/80 font-medium">Emails received</p>
                      <p className="text-xl font-semibold text-green-900">{inbox.length}</p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-center">
                  <button
                    onClick={generateEmail}
                    className="w-full flex items-center justify-center space-x-2 bg-white hover:bg-gray-50 border border-gray-300 text-gray-700 py-3 px-4 rounded-xl font-medium transition-all text-sm"
                  >
                    <RefreshCw className="w-4 h-4" />
                    <span>Generate new email</span>
                  </button>
                </div>
              </div>

            </div>
          ) : null}
        </div>

        {/* Inbox - Shopify Style */}
        {currentEmail && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Email List */}
            <div className="lg:col-span-1 bg-white rounded-2xl shadow-sm border border-gray-200/60 overflow-hidden">
              <div className="border-b border-gray-200/60 px-5 py-4 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <h3 className="font-semibold text-base text-gray-900">Inbox</h3>
                  <span className="px-2 py-0.5 bg-gray-100 text-gray-700 text-xs font-medium rounded-full">{inbox.length}</span>
                </div>
                <button
                  onClick={fetchInbox}
                  className="p-1.5 hover:bg-gray-100 rounded-lg transition-all"
                  title="Refresh inbox"
                >
                  <RefreshCw className="w-4 h-4 text-gray-600" />
                </button>
              </div>

              <div className="divide-y divide-gray-100 max-h-[500px] overflow-y-auto">
                {inbox.length === 0 ? (
                  <div className="p-12 text-center">
                    <div className="inline-flex items-center justify-center w-14 h-14 bg-gray-100 rounded-xl mb-3">
                      <Mail className="w-7 h-7 text-gray-400" />
                    </div>
                    <p className="text-gray-900 font-medium text-sm">No emails yet</p>
                    <p className="text-xs text-gray-500 mt-1">New emails will appear here</p>
                  </div>
                ) : (
                  inbox.map((email) => (
                    <div
                      key={email.id}
                      onClick={() => markAsRead(email)}
                      className={`p-4 cursor-pointer hover:bg-gray-50 transition-all border-l-2 ${
                        selectedEmail?.id === email.id ? 'bg-green-50/50 border-green-600' : 'border-transparent'
                      }`}
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

            {/* Email Content - Shopify Style */}
            <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-200/60 overflow-hidden">
              {selectedEmail ? (
                <div className="h-full flex flex-col">
                  <div className="border-b border-gray-200/60 px-6 py-5">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <h3 className="text-xl font-semibold text-gray-900">{selectedEmail.subject}</h3>
                          {!selectedEmail.read && (
                            <span className="inline-flex h-2 w-2 rounded-full bg-green-600"></span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600">{formatTime(selectedEmail.timestamp)}</p>
                      </div>
                      <div className="flex items-center space-x-1">
                        <button
                          onClick={() => shareAsNoteMail(selectedEmail)}
                          className="p-2 hover:bg-gray-100 rounded-lg transition-all"
                          title="Share as NoteMail"
                        >
                          <ExternalLink className="w-4 h-4 text-gray-600" />
                        </button>
                        <button
                          onClick={() => deleteEmail(selectedEmail.id)}
                          className="p-2 hover:bg-red-50 rounded-lg transition-all"
                          title="Delete email"
                        >
                          <Trash2 className="w-4 h-4 text-red-600" />
                        </button>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-start">
                        <span className="text-xs font-medium text-gray-500 w-16">From</span>
                        <span className="text-sm text-gray-900 flex-1">{selectedEmail.from || 'Unknown Sender'}</span>
                      </div>
                    </div>
                    {/* View Mode Toggle - Only show if both HTML and plain text exist */}
                    {selectedEmail.html_body && selectedEmail.html_body !== selectedEmail.body.replace(/\n/g, '<br>') && (
                      <div className="flex items-center space-x-1 mt-4">
                        <button
                          onClick={() => setViewMode('html')}
                          className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
                            viewMode === 'html' 
                              ? 'bg-gray-900 text-white' 
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          Rich HTML
                        </button>
                        <button
                          onClick={() => setViewMode('plain')}
                          className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
                            viewMode === 'plain' 
                              ? 'bg-gray-900 text-white' 
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          Plain Text
                        </button>
                      </div>
                    )}
                  </div>
                  <div className="flex-1 p-8 overflow-y-auto bg-gray-50">
                    {viewMode === 'html' && selectedEmail.html_body ? (
                      <div className="max-w-4xl mx-auto">
                        <div 
                          className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
                          style={{
                            minHeight: '200px'
                          }}
                        >
                          <div 
                            className="email-html-content"
                            dangerouslySetInnerHTML={{ __html: selectedEmail.html_body }}
                            style={{
                              fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
                              fontSize: '14px',
                              lineHeight: '1.6',
                              color: '#374151',
                              wordWrap: 'break-word',
                              overflowWrap: 'break-word'
                            }}
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="max-w-4xl mx-auto">
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                          <p className="whitespace-pre-wrap text-gray-700 leading-relaxed text-base" style={{ fontFamily: 'monospace' }}>
                            {selectedEmail.body}
                          </p>
                        </div>
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
