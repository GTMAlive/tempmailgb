import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Copy, RefreshCw, Trash2, Clock, Check, Inbox, Shield, Zap, Download, ExternalLink, ChevronRight, HelpCircle, Lock, UserCheck, AlertCircle, CheckCircle, User, LogIn, LogOut, Crown, Star, Settings, BarChart3, TrendingUp, Package } from 'lucide-react';
import axios from 'axios';

// Use environment variable or fallback to demo mode
const API_URL = import.meta.env.VITE_API_URL || null;
const DEMO_MODE = !API_URL; // If no API URL, use demo mode

function App() {
  const navigate = useNavigate();
  const [showLanding, setShowLanding] = useState(true);
  const [currentEmail, setCurrentEmail] = useState('');
  const [inbox, setInbox] = useState([]);
  const [selectedEmail, setSelectedEmail] = useState(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [expiresAt, setExpiresAt] = useState(null);
  const [viewMode, setViewMode] = useState('html'); // 'html', 'plain', or 'raw'
  const [countdown, setCountdown] = useState(5); // Auto-refresh countdown
  const [devMode, setDevMode] = useState(false); // Developer mode toggle
  const [networkLogs, setNetworkLogs] = useState([]);
  const [performanceMetrics, setPerformanceMetrics] = useState({
    memoryUsage: 0,
    apiResponseTime: 0,
    lastFetchTime: 0,
    requestCount: 0
  });
  const [showApiDocs, setShowApiDocs] = useState(false);
  const [apiKey, setApiKey] = useState('sk_live_1234567890abcdef');
  const [webhookUrl, setWebhookUrl] = useState('');
  const [rateLimit, setRateLimit] = useState({
    limit: 100,
    remaining: 87,
    reset: Date.now() + 3600000
  });
  const [showCommandPalette, setShowCommandPalette] = useState(false);
  
  // Premium Mode & Authentication
  const [showAuth, setShowAuth] = useState(false);
  const [authMode, setAuthMode] = useState('login'); // 'login' or 'signup'
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);

  // Check if user is authenticated on page load
  useEffect(() => {
    const userData = localStorage.getItem('premiumUser');
    if (userData) {
      setUser(JSON.parse(userData));
      setIsAuthenticated(true);
    }
  }, []);

  // Auto-generate email on page load
  useEffect(() => {
    generateEmail();
  }, []);

  // Auto-refresh inbox with countdown timer
  useEffect(() => {
    if (currentEmail) {
      fetchInbox();
      setCountdown(5);
      
      // Countdown timer that ticks every second
      const countdownInterval = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            return 5; // Reset to 5
          }
          return prev - 1;
        });
      }, 1000);
      
      // Refresh inbox every 5 seconds
      const refreshInterval = setInterval(() => {
        fetchInbox();
      }, 5000);
      
      return () => {
        clearInterval(countdownInterval);
        clearInterval(refreshInterval);
      };
    }
  }, [currentEmail]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e) => {
      // Ctrl+N: New email
      if (e.ctrlKey && e.key === 'n') {
        e.preventDefault();
        generateEmail();
      }
      
      // Ctrl+R: Refresh inbox
      if (e.ctrlKey && e.key === 'r') {
        e.preventDefault();
        handleManualRefresh();
      }
      
      // Ctrl+C: Copy email address
      if (e.ctrlKey && e.key === 'c' && currentEmail && !window.getSelection().toString()) {
        e.preventDefault();
        copyToClipboard();
      }
      
      // Ctrl+D: Delete selected email
      if (e.ctrlKey && e.key === 'd' && selectedEmail) {
        e.preventDefault();
        deleteEmail(selectedEmail.id);
      }
      
      // Ctrl+/: Command palette
      if (e.ctrlKey && e.key === '/') {
        e.preventDefault();
        setShowCommandPalette(true);
      }
      
      // Escape: Clear selection or close command palette
      if (e.key === 'Escape') {
        if (showCommandPalette) {
          setShowCommandPalette(false);
        } else if (selectedEmail) {
          setSelectedEmail(null);
        }
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [currentEmail, selectedEmail, showCommandPalette]);

  // Network logging helper
  const logNetwork = (method, endpoint, status, duration) => {
    const log = {
      id: Date.now(),
      timestamp: new Date().toISOString(),
      method,
      endpoint,
      status,
      duration: `${duration}ms`,
      time: new Date().toLocaleTimeString()
    };
    setNetworkLogs(prev => [log, ...prev].slice(0, 50)); // Keep last 50 logs
    
    // Update performance metrics
    setPerformanceMetrics(prev => ({
      ...prev,
      apiResponseTime: duration,
      lastFetchTime: Date.now(),
      requestCount: prev.requestCount + 1,
      memoryUsage: performance.memory ? Math.round(performance.memory.usedJSHeapSize / 1048576) : 0
    }));
  };

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
        logNetwork('POST', '/generate', 200, 45);
      } else {
        const startTime = performance.now();
        const response = await axios.post(`${API_URL}/generate`);
        const duration = Math.round(performance.now() - startTime);
        logNetwork('POST', '/generate', response.status, duration);
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
        logNetwork('GET', `/inbox/${currentEmail}`, 200, 32);
        return;
      } else {
        const startTime = performance.now();
        const response = await axios.get(`${API_URL}/inbox/${currentEmail}`);
        const duration = Math.round(performance.now() - startTime);
        logNetwork('GET', `/inbox/${currentEmail}`, response.status, duration);
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
      logNetwork('GET', `/inbox/${currentEmail}`, 'ERROR', 0);
    }
  };

  // Manual refresh handler - resets countdown
  const handleManualRefresh = () => {
    setCountdown(5);
    fetchInbox();
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

  // Authentication handlers
  const handleLogin = (email, password) => {
    // Demo authentication - In production, call API
    const userData = {
      email: email,
      name: email.split('@')[0],
      plan: 'Premium',
      avatar: `https://ui-avatars.com/api/?name=${email}&background=10b981&color=fff`,
      joined: 'November 2024',
      emailsReceived: 247,
      emailsStored: 89,
      storage: '2.4 GB',
      customDomains: 3
    };
    
    // Save to localStorage
    localStorage.setItem('premiumUser', JSON.stringify(userData));
    
    setUser(userData);
    setIsAuthenticated(true);
    setShowAuth(false);
    
    // Navigate to dashboard
    navigate('/dashboard');
  };

  const handleSignup = (name, email, password) => {
    // Demo signup - In production, call API
    handleLogin(email, password);
  };

  const handleLogout = () => {
    localStorage.removeItem('premiumUser');
    setIsAuthenticated(false);
    setUser(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      {/* Header - Shopify Style */}
      <header className="bg-white/80 backdrop-blur-lg border-b border-gray-200/60 sticky top-0 z-50">
        <div className="px-6 py-4">
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
              <button
                onClick={() => setDevMode(!devMode)}
                className={`flex items-center space-x-2 px-4 py-2 font-medium rounded-lg transition-all text-sm ${
                  devMode 
                    ? 'bg-green-600 hover:bg-green-700 text-white' 
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                }`}
              >
                <Zap className="w-4 h-4" />
                <span className="hidden sm:inline">Dev Mode</span>
              </button>
              
              {!isAuthenticated ? (
                <button
                  onClick={() => { setShowAuth(true); setAuthMode('login'); }}
                  className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold rounded-lg transition-all text-sm shadow-lg shadow-purple-500/30"
                >
                  <Crown className="w-4 h-4" />
                  <span className="hidden sm:inline">Premium</span>
                </button>
              ) : (
                <div className="relative">
                  <button
                    onClick={() => navigate('/dashboard')}
                    className="flex items-center space-x-2 px-3 py-2 bg-gradient-to-r from-purple-50 to-pink-50 hover:from-purple-100 hover:to-pink-100 border border-purple-200 rounded-lg transition-all"
                  >
                    <img src={user.avatar} alt={user.name} className="w-6 h-6 rounded-full" />
                    <span className="hidden sm:inline font-medium text-gray-900">{user.name}</span>
                    <Crown className="w-4 h-4 text-purple-600" />
                  </button>
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

      {/* Developer Mode UI */}
      {devMode ? (
        <main className="min-h-screen bg-gray-900 text-green-400 font-mono">
          <div className="max-w-[1400px] mx-auto px-6 py-8">
            {/* Terminal Header */}
            <div className="bg-gray-800 rounded-t-lg border border-gray-700 p-4 mb-0">
              <div className="flex items-center space-x-2 mb-3">
                <div className="flex space-x-2">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                </div>
                <span className="text-gray-400 text-sm ml-4">tempmail-cli v1.0.0</span>
              </div>
              <div className="text-green-400 text-sm">
                <span className="text-blue-400">user@tempmail</span>
                <span className="text-white">:</span>
                <span className="text-purple-400">~</span>
                <span className="text-white">$ </span>
                <span>./tempmail --generate</span>
              </div>
            </div>

            {/* Terminal Content */}
            <div className="bg-black rounded-b-lg border border-t-0 border-gray-700 p-6 mb-6">
              {loading && !currentEmail ? (
                <div className="space-y-2">
                  <p className="text-yellow-400">[INFO] Generating temporary email address...</p>
                  <p className="text-green-400 animate-pulse">█</p>
                </div>
              ) : currentEmail ? (
                <div className="space-y-4">
                  <div>
                    <p className="text-blue-400">[SUCCESS] Email generated:</p>
                    <div className="mt-2 bg-gray-900 border border-gray-700 rounded p-3 flex items-center justify-between">
                      <code className="text-green-400 text-sm">{currentEmail}</code>
                      <button
                        onClick={copyToClipboard}
                        className="px-3 py-1 bg-green-600 hover:bg-green-700 text-black rounded text-xs font-bold transition-all"
                      >
                        {copied ? '✓ COPIED' : 'COPY'}
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-800">
                    <div className="bg-gray-900 border border-gray-700 rounded p-3">
                      <p className="text-gray-500 text-xs mb-1">EXPIRES_IN</p>
                      <p className="text-cyan-400 text-lg font-bold">3600s</p>
                    </div>
                    <div className="bg-gray-900 border border-gray-700 rounded p-3">
                      <p className="text-gray-500 text-xs mb-1">EMAILS_RECEIVED</p>
                      <p className="text-yellow-400 text-lg font-bold">{inbox.length}</p>
                    </div>
                    <div className="bg-gray-900 border border-gray-700 rounded p-3">
                      <p className="text-gray-500 text-xs mb-1">AUTO_REFRESH</p>
                      <p className="text-green-400 text-lg font-bold">{countdown}s</p>
                    </div>
                  </div>

                  <div className="pt-4 flex space-x-3">
                    <button
                      onClick={generateEmail}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm font-semibold transition-all"
                    >
                      $ ./tempmail --new
                    </button>
                    <button
                      onClick={handleManualRefresh}
                      className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-green-400 rounded text-sm font-semibold transition-all"
                    >
                      $ ./refresh
                    </button>
                  </div>
                </div>
              ) : null}
            </div>

            {/* Inbox Terminal */}
            {currentEmail && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Email List */}
                <div className="lg:col-span-1">
                  <div className="bg-gray-800 rounded-t-lg border border-gray-700 p-3">
                    <p className="text-green-400 text-sm font-bold">$ cat inbox.json</p>
                  </div>
                  <div className="bg-black rounded-b-lg border border-t-0 border-gray-700 p-4 max-h-[500px] overflow-y-auto">
                    {inbox.length === 0 ? (
                      <p className="text-gray-500 text-sm">{"{ \"emails\": [] }"}</p>
                    ) : (
                      <div className="space-y-2">
                        {inbox.map((email, index) => (
                          <div
                            key={email.id}
                            onClick={() => markAsRead(email)}
                            className={`p-3 rounded border cursor-pointer transition-all ${
                              selectedEmail?.id === email.id
                                ? 'bg-green-900/20 border-green-600'
                                : 'bg-gray-900 border-gray-700 hover:border-gray-600'
                            }`}
                          >
                            <div className="flex items-start justify-between mb-1">
                              <span className="text-xs text-cyan-400">#{index + 1}</span>
                              {!email.read && (
                                <span className="text-xs text-yellow-400 font-bold">NEW</span>
                              )}
                            </div>
                            <p className="text-sm text-green-400 font-semibold truncate mb-1">
                              {email.subject}
                            </p>
                            <p className="text-xs text-gray-500 truncate">{email.from}</p>
                            <p className="text-xs text-gray-600 mt-1">{formatTime(email.timestamp)}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Email Content */}
                <div className="lg:col-span-2">
                  {selectedEmail ? (
                    <div>
                      <div className="bg-gray-800 rounded-t-lg border border-gray-700 p-3">
                        <p className="text-green-400 text-sm font-bold">$ cat email_{selectedEmail.id}.json</p>
                      </div>
                      <div className="bg-black rounded-b-lg border border-t-0 border-gray-700 p-4">
                        <div className="space-y-3 mb-4 pb-4 border-b border-gray-800">
                          <div className="flex items-start">
                            <span className="text-gray-500 text-xs font-mono w-24">subject:</span>
                            <span className="text-yellow-400 text-sm flex-1">"{selectedEmail.subject}"</span>
                          </div>
                          <div className="flex items-start">
                            <span className="text-gray-500 text-xs font-mono w-24">from:</span>
                            <span className="text-cyan-400 text-sm flex-1">"{selectedEmail.from}"</span>
                          </div>
                          <div className="flex items-start">
                            <span className="text-gray-500 text-xs font-mono w-24">timestamp:</span>
                            <span className="text-purple-400 text-sm flex-1">{selectedEmail.timestamp}</span>
                          </div>
                          <div className="flex items-center space-x-2 pt-2">
                            <button
                              onClick={() => setViewMode('plain')}
                              className={`px-3 py-1 rounded text-xs font-semibold transition-all ${
                                viewMode === 'plain'
                                  ? 'bg-green-600 text-black'
                                  : 'bg-gray-700 text-gray-400 hover:bg-gray-600'
                              }`}
                            >
                              .txt
                            </button>
                            <button
                              onClick={() => setViewMode('html')}
                              className={`px-3 py-1 rounded text-xs font-semibold transition-all ${
                                viewMode === 'html'
                                  ? 'bg-green-600 text-black'
                                  : 'bg-gray-700 text-gray-400 hover:bg-gray-600'
                              }`}
                            >
                              .html
                            </button>
                            <button
                              onClick={() => setViewMode('raw')}
                              className={`px-3 py-1 rounded text-xs font-semibold transition-all ${
                                viewMode === 'raw'
                                  ? 'bg-green-600 text-black'
                                  : 'bg-gray-700 text-gray-400 hover:bg-gray-600'
                              }`}
                            >
                              .raw
                            </button>
                            <button
                              onClick={() => deleteEmail(selectedEmail.id)}
                              className="ml-auto px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-xs font-semibold transition-all"
                            >
                              DELETE
                            </button>
                          </div>
                        </div>
                        
                        <div className="bg-gray-900 rounded border border-gray-700 p-4 max-h-[400px] overflow-y-auto">
                          {viewMode === 'raw' ? (
                            // Raw email view with MIME headers
                            <div className="space-y-4">
                              {/* Action Buttons */}
                              <div className="flex items-center space-x-2 pb-3 border-b border-gray-800">
                                <button
                                  onClick={() => {
                                    const rawContent = `From: ${selectedEmail.from}
To: ${currentEmail}
Subject: ${selectedEmail.subject}
Date: ${new Date(selectedEmail.timestamp).toUTCString()}
Message-ID: <${selectedEmail.id}@ainewmail.online>
MIME-Version: 1.0
Content-Type: ${selectedEmail.html_body ? 'text/html' : 'text/plain'}; charset=UTF-8
Content-Transfer-Encoding: 8bit

${selectedEmail.html_body || selectedEmail.body}`;
                                    navigator.clipboard.writeText(rawContent);
                                  }}
                                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded font-semibold transition-all flex items-center space-x-1"
                                >
                                  <Copy className="w-3 h-3" />
                                  <span>COPY RAW</span>
                                </button>
                                <button
                                  onClick={() => {
                                    const rawContent = `From: ${selectedEmail.from}
To: ${currentEmail}
Subject: ${selectedEmail.subject}
Date: ${new Date(selectedEmail.timestamp).toUTCString()}
Message-ID: <${selectedEmail.id}@ainewmail.online>
MIME-Version: 1.0
Content-Type: ${selectedEmail.html_body ? 'text/html' : 'text/plain'}; charset=UTF-8
Content-Transfer-Encoding: 8bit

${selectedEmail.html_body || selectedEmail.body}`;
                                    const blob = new Blob([rawContent], { type: 'message/rfc822' });
                                    const url = window.URL.createObjectURL(blob);
                                    const a = document.createElement('a');
                                    a.href = url;
                                    a.download = `email-${selectedEmail.id}.eml`;
                                    a.click();
                                    window.URL.revokeObjectURL(url);
                                  }}
                                  className="px-3 py-1.5 bg-green-600 hover:bg-green-700 text-black text-xs rounded font-semibold transition-all flex items-center space-x-1"
                                >
                                  <Download className="w-3 h-3" />
                                  <span>DOWNLOAD .EML</span>
                                </button>
                              </div>

                              {/* MIME Headers Section */}
                              <div>
                                <h4 className="text-cyan-400 text-xs font-bold mb-2 flex items-center space-x-2">
                                  <span>📧 MIME HEADERS</span>
                                </h4>
                                <div className="bg-black border border-gray-800 rounded p-3 space-y-1">
                                  <div className="flex text-xs font-mono">
                                    <span className="text-purple-400 w-32">From:</span>
                                    <span className="text-green-400 flex-1">{selectedEmail.from}</span>
                                  </div>
                                  <div className="flex text-xs font-mono">
                                    <span className="text-purple-400 w-32">To:</span>
                                    <span className="text-green-400 flex-1">{currentEmail}</span>
                                  </div>
                                  <div className="flex text-xs font-mono">
                                    <span className="text-purple-400 w-32">Subject:</span>
                                    <span className="text-green-400 flex-1">{selectedEmail.subject}</span>
                                  </div>
                                  <div className="flex text-xs font-mono">
                                    <span className="text-purple-400 w-32">Date:</span>
                                    <span className="text-green-400 flex-1">{new Date(selectedEmail.timestamp).toUTCString()}</span>
                                  </div>
                                  <div className="flex text-xs font-mono">
                                    <span className="text-purple-400 w-32">Message-ID:</span>
                                    <span className="text-green-400 flex-1">&lt;{selectedEmail.id}@ainewmail.online&gt;</span>
                                  </div>
                                  <div className="flex text-xs font-mono">
                                    <span className="text-purple-400 w-32">MIME-Version:</span>
                                    <span className="text-green-400 flex-1">1.0</span>
                                  </div>
                                  <div className="flex text-xs font-mono">
                                    <span className="text-purple-400 w-32">Content-Type:</span>
                                    <span className="text-green-400 flex-1">{selectedEmail.html_body ? 'text/html' : 'text/plain'}; charset=UTF-8</span>
                                  </div>
                                  <div className="flex text-xs font-mono">
                                    <span className="text-purple-400 w-32">Content-Transfer:</span>
                                    <span className="text-green-400 flex-1">8bit</span>
                                  </div>
                                </div>
                              </div>

                              {/* SMTP Details */}
                              <div>
                                <h4 className="text-cyan-400 text-xs font-bold mb-2 flex items-center space-x-2">
                                  <span>🔧 SMTP DETAILS</span>
                                </h4>
                                <div className="bg-black border border-gray-800 rounded p-3 space-y-1">
                                  <div className="flex text-xs font-mono">
                                    <span className="text-purple-400 w-32">Return-Path:</span>
                                    <span className="text-yellow-400 flex-1">&lt;{selectedEmail.from}&gt;</span>
                                  </div>
                                  <div className="flex text-xs font-mono">
                                    <span className="text-purple-400 w-32">Received:</span>
                                    <span className="text-yellow-400 flex-1">by ainewmail.online</span>
                                  </div>
                                  <div className="flex text-xs font-mono">
                                    <span className="text-purple-400 w-32">X-Mailer:</span>
                                    <span className="text-yellow-400 flex-1">TempMail Service v1.0</span>
                                  </div>
                                  <div className="flex text-xs font-mono">
                                    <span className="text-purple-400 w-32">X-Priority:</span>
                                    <span className="text-yellow-400 flex-1">3 (Normal)</span>
                                  </div>
                                </div>
                              </div>

                              {/* Email Source */}
                              <div>
                                <h4 className="text-cyan-400 text-xs font-bold mb-2 flex items-center space-x-2">
                                  <span>📄 EMAIL SOURCE</span>
                                </h4>
                                <pre className="bg-black border border-gray-800 rounded p-3 text-green-400 text-xs font-mono overflow-x-auto whitespace-pre-wrap">
{`From: ${selectedEmail.from}
To: ${currentEmail}
Subject: ${selectedEmail.subject}
Date: ${new Date(selectedEmail.timestamp).toUTCString()}
Message-ID: <${selectedEmail.id}@ainewmail.online>
MIME-Version: 1.0
Content-Type: ${selectedEmail.html_body ? 'text/html' : 'text/plain'}; charset=UTF-8
Content-Transfer-Encoding: 8bit

${selectedEmail.html_body || selectedEmail.body}`}
                                </pre>
                              </div>
                            </div>
                          ) : viewMode === 'html' && selectedEmail.html_body ? (
                            <div dangerouslySetInnerHTML={{ __html: selectedEmail.html_body }} 
                                 className="text-gray-300 text-sm"
                                 style={{ fontFamily: 'system-ui' }} />
                          ) : (
                            <pre className="text-green-400 text-sm whitespace-pre-wrap font-mono">
                              {selectedEmail.body}
                            </pre>
                          )}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-black rounded-lg border border-gray-700 p-12 text-center">
                      <p className="text-gray-600 text-sm font-mono">// Select an email to view content</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Developer Tools Panel */}
            <div className="mt-6">
              <div className="bg-gray-800 rounded-t-lg border border-gray-700 p-3">
                <p className="text-green-400 text-sm font-bold">$ tail -f devtools.log</p>
              </div>
              <div className="bg-black rounded-b-lg border border-t-0 border-gray-700 p-4">
                {/* Performance Metrics */}
                <div className="mb-6">
                  <h3 className="text-cyan-400 text-sm font-bold mb-3">⚡ PERFORMANCE METRICS</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div className="bg-gray-900 border border-gray-700 rounded p-3">
                      <p className="text-gray-500 text-xs mb-1">MEMORY</p>
                      <p className="text-green-400 font-bold">{performanceMetrics.memoryUsage} MB</p>
                    </div>
                    <div className="bg-gray-900 border border-gray-700 rounded p-3">
                      <p className="text-gray-500 text-xs mb-1">API_RESPONSE</p>
                      <p className="text-yellow-400 font-bold">{performanceMetrics.apiResponseTime}ms</p>
                    </div>
                    <div className="bg-gray-900 border border-gray-700 rounded p-3">
                      <p className="text-gray-500 text-xs mb-1">REQUESTS</p>
                      <p className="text-cyan-400 font-bold">{performanceMetrics.requestCount}</p>
                    </div>
                    <div className="bg-gray-900 border border-gray-700 rounded p-3">
                      <p className="text-gray-500 text-xs mb-1">CONNECTION</p>
                      <p className="text-green-400 font-bold flex items-center">
                        <span className="inline-block w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></span>
                        ACTIVE
                      </p>
                    </div>
                  </div>
                </div>

                {/* Network Logs */}
                <div>
                  <h3 className="text-cyan-400 text-sm font-bold mb-3">📡 NETWORK LOGS</h3>
                  <div className="bg-gray-900 border border-gray-700 rounded p-3 max-h-[300px] overflow-y-auto">
                    {networkLogs.length === 0 ? (
                      <p className="text-gray-600 text-xs font-mono">// No network activity yet</p>
                    ) : (
                      <div className="space-y-1">
                        {networkLogs.map((log) => (
                          <div key={log.id} className="text-xs font-mono flex items-start space-x-2 py-1 border-b border-gray-800 last:border-0">
                            <span className="text-gray-500">[{log.time}]</span>
                            <span className={`font-bold ${
                              log.method === 'GET' ? 'text-blue-400' : 
                              log.method === 'POST' ? 'text-green-400' : 
                              log.method === 'DELETE' ? 'text-red-400' : 'text-yellow-400'
                            }`}>
                              {log.method}
                            </span>
                            <span className="text-purple-400 flex-1 truncate">{log.endpoint}</span>
                            <span className={`${
                              log.status === 200 ? 'text-green-400' :
                              log.status === 'ERROR' ? 'text-red-400' : 'text-yellow-400'
                            }`}>
                              {log.status}
                            </span>
                            <span className="text-cyan-400">{log.duration}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* WebSocket Status */}
                <div className="mt-4 bg-gray-900 border border-gray-700 rounded p-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="text-gray-500 text-xs">WebSocket:</span>
                      <span className="text-gray-400 text-xs font-mono">ws://tempmail.local:8080</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="inline-block w-2 h-2 bg-yellow-500 rounded-full"></span>
                      <span className="text-yellow-400 text-xs">POLLING</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* API Documentation Panel */}
            <div className="mt-6">
              <div className="bg-gray-800 rounded-t-lg border border-gray-700 p-3 flex items-center justify-between">
                <p className="text-green-400 text-sm font-bold">$ cat api-docs.md</p>
                <button
                  onClick={() => setShowApiDocs(!showApiDocs)}
                  className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded font-semibold transition-all"
                >
                  {showApiDocs ? 'HIDE' : 'SHOW'} API DOCS
                </button>
              </div>
              
              {showApiDocs && (
                <div className="bg-black rounded-b-lg border border-t-0 border-gray-700 p-6">
                  {/* Rate Limits */}
                  <div className="mb-6 pb-6 border-b border-gray-800">
                    <h3 className="text-yellow-400 text-sm font-bold mb-3">⚠️ RATE LIMITS</h3>
                    <div className="grid grid-cols-3 gap-3">
                      <div className="bg-gray-900 border border-gray-700 rounded p-3">
                        <p className="text-gray-500 text-xs mb-1">LIMIT</p>
                        <p className="text-cyan-400 font-bold text-lg">{rateLimit.limit}/hr</p>
                      </div>
                      <div className="bg-gray-900 border border-gray-700 rounded p-3">
                        <p className="text-gray-500 text-xs mb-1">REMAINING</p>
                        <p className="text-green-400 font-bold text-lg">{rateLimit.remaining}</p>
                      </div>
                      <div className="bg-gray-900 border border-gray-700 rounded p-3">
                        <p className="text-gray-500 text-xs mb-1">RESET_IN</p>
                        <p className="text-purple-400 font-bold text-lg">
                          {Math.round((rateLimit.reset - Date.now()) / 60000)}m
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* API Key Management */}
                  <div className="mb-6 pb-6 border-b border-gray-800">
                    <h3 className="text-cyan-400 text-sm font-bold mb-3">🔑 API KEY MANAGEMENT</h3>
                    <div className="bg-gray-900 border border-gray-700 rounded p-4">
                      <div className="flex items-center justify-between mb-3">
                        <label className="text-gray-400 text-xs">Your API Key:</label>
                        <button
                          onClick={() => {
                            const newKey = 'sk_live_' + Math.random().toString(36).substring(2, 18);
                            setApiKey(newKey);
                          }}
                          className="px-3 py-1 bg-green-600 hover:bg-green-700 text-black text-xs rounded font-semibold transition-all"
                        >
                          REGENERATE
                        </button>
                      </div>
                      <div className="flex items-center space-x-2">
                        <code className="flex-1 bg-black border border-gray-700 rounded px-3 py-2 text-green-400 text-sm font-mono">
                          {apiKey}
                        </code>
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(apiKey);
                          }}
                          className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded font-semibold transition-all"
                        >
                          COPY
                        </button>
                      </div>
                      <p className="text-gray-600 text-xs mt-2">⚠️ Keep your API key secure. Never share it publicly.</p>
                    </div>
                  </div>

                  {/* Webhook Configuration */}
                  <div className="mb-6 pb-6 border-b border-gray-800">
                    <h3 className="text-cyan-400 text-sm font-bold mb-3">🔗 WEBHOOK CONFIGURATION</h3>
                    <div className="bg-gray-900 border border-gray-700 rounded p-4">
                      <label className="text-gray-400 text-xs block mb-2">Webhook URL:</label>
                      <div className="flex items-center space-x-2">
                        <input
                          type="text"
                          value={webhookUrl}
                          onChange={(e) => setWebhookUrl(e.target.value)}
                          placeholder="https://your-domain.com/webhook"
                          className="flex-1 bg-black border border-gray-700 rounded px-3 py-2 text-green-400 text-sm font-mono outline-none focus:border-green-600"
                        />
                        <button
                          onClick={() => {
                            if (webhookUrl) {
                              alert('Webhook configured successfully!');
                            }
                          }}
                          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded font-semibold transition-all"
                        >
                          SAVE
                        </button>
                      </div>
                      <p className="text-gray-600 text-xs mt-2">📡 We'll POST new emails to this endpoint.</p>
                    </div>
                  </div>

                  {/* REST API Endpoints */}
                  <div className="mb-6">
                    <h3 className="text-cyan-400 text-sm font-bold mb-3">📚 REST API ENDPOINTS</h3>
                    <div className="space-y-3">
                      {/* Generate Email */}
                      <div className="bg-gray-900 border border-gray-700 rounded p-4">
                        <div className="flex items-center space-x-2 mb-2">
                          <span className="px-2 py-1 bg-green-700 text-white text-xs font-bold rounded">POST</span>
                          <code className="text-purple-400 text-sm">/api/generate</code>
                        </div>
                        <p className="text-gray-400 text-xs mb-3">Generate a new temporary email address</p>
                        <div className="bg-black border border-gray-700 rounded p-3">
                          <pre className="text-green-400 text-xs font-mono overflow-x-auto">
{`curl -X POST https://tempmail.example.com/api/generate \\
  -H "Authorization: Bearer ${apiKey}" \\
  -H "Content-Type: application/json"`}
                          </pre>
                        </div>
                      </div>

                      {/* Get Inbox */}
                      <div className="bg-gray-900 border border-gray-700 rounded p-4">
                        <div className="flex items-center space-x-2 mb-2">
                          <span className="px-2 py-1 bg-blue-700 text-white text-xs font-bold rounded">GET</span>
                          <code className="text-purple-400 text-sm">/api/inbox/:email</code>
                        </div>
                        <p className="text-gray-400 text-xs mb-3">Retrieve all emails for an address</p>
                        <div className="bg-black border border-gray-700 rounded p-3">
                          <pre className="text-green-400 text-xs font-mono overflow-x-auto">
{`curl -X GET https://tempmail.example.com/api/inbox/abc@domain.com \\
  -H "Authorization: Bearer ${apiKey}"`}
                          </pre>
                        </div>
                      </div>

                      {/* Delete Email */}
                      <div className="bg-gray-900 border border-gray-700 rounded p-4">
                        <div className="flex items-center space-x-2 mb-2">
                          <span className="px-2 py-1 bg-red-700 text-white text-xs font-bold rounded">DELETE</span>
                          <code className="text-purple-400 text-sm">/api/email/:id</code>
                        </div>
                        <p className="text-gray-400 text-xs mb-3">Delete a specific email</p>
                        <div className="bg-black border border-gray-700 rounded p-3">
                          <pre className="text-green-400 text-xs font-mono overflow-x-auto">
{`curl -X DELETE https://tempmail.example.com/api/email/123 \\
  -H "Authorization: Bearer ${apiKey}"`}
                          </pre>
                        </div>
                      </div>

                      {/* Mark as Read */}
                      <div className="bg-gray-900 border border-gray-700 rounded p-4">
                        <div className="flex items-center space-x-2 mb-2">
                          <span className="px-2 py-1 bg-yellow-700 text-white text-xs font-bold rounded">PATCH</span>
                          <code className="text-purple-400 text-sm">/api/email/:id/read</code>
                        </div>
                        <p className="text-gray-400 text-xs mb-3">Mark email as read</p>
                        <div className="bg-black border border-gray-700 rounded p-3">
                          <pre className="text-green-400 text-xs font-mono overflow-x-auto">
{`curl -X PATCH https://tempmail.example.com/api/email/123/read \\
  -H "Authorization: Bearer ${apiKey}"`}
                          </pre>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Response Examples */}
                  <div>
                    <h3 className="text-cyan-400 text-sm font-bold mb-3">📄 RESPONSE EXAMPLES</h3>
                    <div className="bg-gray-900 border border-gray-700 rounded p-4">
                      <p className="text-gray-400 text-xs mb-2">Success Response (200):</p>
                      <div className="bg-black border border-gray-700 rounded p-3">
                        <pre className="text-green-400 text-xs font-mono overflow-x-auto">
{`{
  "success": true,
  "data": {
    "email": "abc123@ainewmail.online",
    "expiresIn": 3600000,
    "createdAt": "${new Date().toISOString()}"
  }
}`}
                        </pre>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </main>
      ) : (
        // Regular UI Mode
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
                <h1 className="text-2xl font-bold text-gray-900 mb-3">Your temporary email address</h1>
                <div className="relative">
                  <div className="flex items-center space-x-2.5 bg-gray-50/50 border border-gray-300 hover:border-gray-400 p-2.5 rounded-xl focus-within:border-green-600 focus-within:ring-4 focus-within:ring-green-100 transition-all group">
                    <Mail className="w-4 h-4 text-gray-400 flex-shrink-0" />
                    <input
                      type="text"
                      value={currentEmail}
                      readOnly
                      className="flex-1 bg-transparent text-base font-mono font-semibold outline-none text-gray-900 selection:bg-green-100"
                    />
                    <button
                      onClick={copyToClipboard}
                      className="flex-shrink-0 px-3 py-1.5 bg-gray-900 hover:bg-gray-800 text-white rounded-lg transition-all text-sm font-medium flex items-center space-x-2"
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
                    disabled={loading}
                    className="w-full flex items-center justify-center space-x-2 bg-white hover:bg-gray-50 border border-gray-300 text-gray-700 py-3 px-4 rounded-xl font-medium transition-all text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
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
                <div className="flex items-center space-x-3">
                  {/* Auto-refresh countdown timer */}
                  <div className="flex items-center space-x-1.5 px-2.5 py-1 bg-green-50 border border-green-200 rounded-lg">
                    <div className="relative flex items-center justify-center w-4 h-4">
                      <svg className="absolute transform -rotate-90" width="16" height="16">
                        <circle
                          cx="8"
                          cy="8"
                          r="6"
                          fill="none"
                          stroke="#d1fae5"
                          strokeWidth="2"
                        />
                        <circle
                          cx="8"
                          cy="8"
                          r="6"
                          fill="none"
                          stroke="#16a34a"
                          strokeWidth="2"
                          strokeDasharray={`${(countdown / 5) * 37.7} 37.7`}
                          className="transition-all duration-1000 ease-linear"
                        />
                      </svg>
                    </div>
                    <span className="text-xs font-semibold text-green-700 tabular-nums">{countdown}s</span>
                  </div>
                  <button
                    onClick={handleManualRefresh}
                    className="p-1.5 hover:bg-gray-100 rounded-lg transition-all"
                    title="Refresh now"
                  >
                    <RefreshCw className="w-4 h-4 text-gray-600" />
                  </button>
                </div>
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
                      <div className="max-w-4xl">
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
                              overflowWrap: 'break-word',
                              textAlign: 'left'
                            }}
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="max-w-4xl">
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                          <p className="whitespace-pre-wrap text-gray-700 leading-relaxed text-base text-left" style={{ fontFamily: 'monospace' }}>
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
      )}

      {/* How to Use Section - Hidden in Dev Mode */}
      {!devMode && (
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
      )}

      {!devMode && (
      <>
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
      </>
      )}

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

      {/* Command Palette Modal */}
      {showCommandPalette && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-start justify-center pt-20"
             onClick={() => setShowCommandPalette(false)}>
          <div className={`${devMode ? 'bg-black border-gray-700' : 'bg-white'} rounded-xl shadow-2xl w-full max-w-2xl mx-4 border ${devMode ? 'border-gray-700' : 'border-gray-200'}`}
               onClick={(e) => e.stopPropagation()}>
            {/* Header */}
            <div className={`border-b ${devMode ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-gray-50'} px-6 py-4`}>
              <h3 className={`text-lg font-bold ${devMode ? 'text-green-400' : 'text-gray-900'} flex items-center space-x-2`}>
                <Zap className="w-5 h-5" />
                <span>Command Palette</span>
              </h3>
              <p className={`text-sm ${devMode ? 'text-gray-400' : 'text-gray-600'} mt-1`}>
                Keyboard shortcuts for faster navigation
              </p>
            </div>

            {/* Commands List */}
            <div className="p-6 space-y-3">
              <div className={`flex items-center justify-between p-4 rounded-lg ${devMode ? 'bg-gray-900 border border-gray-700 hover:border-green-600' : 'bg-gray-50 hover:bg-gray-100'} transition-all cursor-pointer`}
                   onClick={() => { generateEmail(); setShowCommandPalette(false); }}>
                <div className="flex items-center space-x-3">
                  <div className={`p-2 ${devMode ? 'bg-green-900/30' : 'bg-green-100'} rounded-lg`}>
                    <Mail className={`w-5 h-5 ${devMode ? 'text-green-400' : 'text-green-600'}`} />
                  </div>
                  <div>
                    <p className={`font-semibold ${devMode ? 'text-green-400' : 'text-gray-900'}`}>Generate New Email</p>
                    <p className={`text-xs ${devMode ? 'text-gray-500' : 'text-gray-600'}`}>Create a fresh temporary email address</p>
                  </div>
                </div>
                <kbd className={`px-3 py-1 ${devMode ? 'bg-black border-gray-600 text-green-400' : 'bg-white border-gray-300 text-gray-700'} border rounded text-sm font-mono`}>
                  Ctrl+N
                </kbd>
              </div>

              <div className={`flex items-center justify-between p-4 rounded-lg ${devMode ? 'bg-gray-900 border border-gray-700 hover:border-green-600' : 'bg-gray-50 hover:bg-gray-100'} transition-all cursor-pointer`}
                   onClick={() => { handleManualRefresh(); setShowCommandPalette(false); }}>
                <div className="flex items-center space-x-3">
                  <div className={`p-2 ${devMode ? 'bg-blue-900/30' : 'bg-blue-100'} rounded-lg`}>
                    <RefreshCw className={`w-5 h-5 ${devMode ? 'text-blue-400' : 'text-blue-600'}`} />
                  </div>
                  <div>
                    <p className={`font-semibold ${devMode ? 'text-cyan-400' : 'text-gray-900'}`}>Refresh Inbox</p>
                    <p className={`text-xs ${devMode ? 'text-gray-500' : 'text-gray-600'}`}>Fetch latest emails</p>
                  </div>
                </div>
                <kbd className={`px-3 py-1 ${devMode ? 'bg-black border-gray-600 text-cyan-400' : 'bg-white border-gray-300 text-gray-700'} border rounded text-sm font-mono`}>
                  Ctrl+R
                </kbd>
              </div>

              <div className={`flex items-center justify-between p-4 rounded-lg ${devMode ? 'bg-gray-900 border border-gray-700 hover:border-green-600' : 'bg-gray-50 hover:bg-gray-100'} transition-all cursor-pointer`}
                   onClick={() => { copyToClipboard(); setShowCommandPalette(false); }}>
                <div className="flex items-center space-x-3">
                  <div className={`p-2 ${devMode ? 'bg-purple-900/30' : 'bg-purple-100'} rounded-lg`}>
                    <Copy className={`w-5 h-5 ${devMode ? 'text-purple-400' : 'text-purple-600'}`} />
                  </div>
                  <div>
                    <p className={`font-semibold ${devMode ? 'text-purple-400' : 'text-gray-900'}`}>Copy Email Address</p>
                    <p className={`text-xs ${devMode ? 'text-gray-500' : 'text-gray-600'}`}>Copy to clipboard</p>
                  </div>
                </div>
                <kbd className={`px-3 py-1 ${devMode ? 'bg-black border-gray-600 text-purple-400' : 'bg-white border-gray-300 text-gray-700'} border rounded text-sm font-mono`}>
                  Ctrl+C
                </kbd>
              </div>

              {selectedEmail && (
                <div className={`flex items-center justify-between p-4 rounded-lg ${devMode ? 'bg-gray-900 border border-gray-700 hover:border-red-600' : 'bg-gray-50 hover:bg-gray-100'} transition-all cursor-pointer`}
                     onClick={() => { deleteEmail(selectedEmail.id); setShowCommandPalette(false); }}>
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 ${devMode ? 'bg-red-900/30' : 'bg-red-100'} rounded-lg`}>
                      <Trash2 className={`w-5 h-5 ${devMode ? 'text-red-400' : 'text-red-600'}`} />
                    </div>
                    <div>
                      <p className={`font-semibold ${devMode ? 'text-red-400' : 'text-gray-900'}`}>Delete Selected Email</p>
                      <p className={`text-xs ${devMode ? 'text-gray-500' : 'text-gray-600'}`}>Remove from inbox</p>
                    </div>
                  </div>
                  <kbd className={`px-3 py-1 ${devMode ? 'bg-black border-gray-600 text-red-400' : 'bg-white border-gray-300 text-gray-700'} border rounded text-sm font-mono`}>
                    Ctrl+D
                  </kbd>
                </div>
              )}

              <div className={`flex items-center justify-between p-4 rounded-lg ${devMode ? 'bg-gray-900 border border-gray-700 hover:border-green-600' : 'bg-gray-50 hover:bg-gray-100'} transition-all cursor-pointer`}
                   onClick={() => setShowCommandPalette(false)}>
                <div className="flex items-center space-x-3">
                  <div className={`p-2 ${devMode ? 'bg-gray-700' : 'bg-gray-200'} rounded-lg`}>
                    <span className={`text-lg font-bold ${devMode ? 'text-gray-400' : 'text-gray-600'}`}>⎋</span>
                  </div>
                  <div>
                    <p className={`font-semibold ${devMode ? 'text-gray-400' : 'text-gray-900'}`}>Clear Selection / Close</p>
                    <p className={`text-xs ${devMode ? 'text-gray-500' : 'text-gray-600'}`}>Deselect email or close palette</p>
                  </div>
                </div>
                <kbd className={`px-3 py-1 ${devMode ? 'bg-black border-gray-600 text-gray-400' : 'bg-white border-gray-300 text-gray-700'} border rounded text-sm font-mono`}>
                  Esc
                </kbd>
              </div>
            </div>

            {/* Footer */}
            <div className={`border-t ${devMode ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-gray-50'} px-6 py-4`}>
              <p className={`text-xs ${devMode ? 'text-gray-500' : 'text-gray-600'} text-center`}>
                Press <kbd className={`px-2 py-0.5 ${devMode ? 'bg-black border-gray-600 text-green-400' : 'bg-white border-gray-300 text-gray-700'} border rounded font-mono text-xs`}>Ctrl+/</kbd> to open this palette anytime
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Login/Signup Modal */}
      {showAuth && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
             onClick={() => setShowAuth(false)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md"
               onClick={(e) => e.stopPropagation()}>
            {/* Modal Header */}
            <div className="border-b border-gray-200 px-8 py-6">
              <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent flex items-center space-x-2">
                <Crown className="w-6 h-6 text-purple-600" />
                <span>{authMode === 'login' ? 'Welcome Back' : 'Join Premium'}</span>
              </h2>
              <p className="text-gray-600 mt-2 text-sm">
                {authMode === 'login' ? 'Sign in to access your premium account' : 'Create your premium account today'}
              </p>
            </div>

            {/* Modal Body */}
            <div className="p-8">
              <form onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.target);
                if (authMode === 'signup') {
                  handleSignup(formData.get('name'), formData.get('email'), formData.get('password'));
                } else {
                  handleLogin(formData.get('email'), formData.get('password'));
                }
              }} className="space-y-4">
                {authMode === 'signup' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                    <input
                      type="text"
                      name="name"
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
                      placeholder="John Doe"
                    />
                  </div>
                )}
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                  <input
                    type="email"
                    name="email"
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
                    placeholder="you@example.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                  <input
                    type="password"
                    name="password"
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
                    placeholder="••••••••"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold rounded-lg transition-all shadow-lg shadow-purple-500/30 flex items-center justify-center space-x-2"
                >
                  <span>{authMode === 'login' ? 'Sign In' : 'Create Account'}</span>
                  <ChevronRight className="w-5 h-5" />
                </button>
              </form>

              <div className="mt-6 text-center">
                <button
                  onClick={() => setAuthMode(authMode === 'login' ? 'signup' : 'login')}
                  className="text-sm text-gray-600 hover:text-gray-900"
                >
                  {authMode === 'login' ? "Don't have an account? " : 'Already have an account? '}
                  <span className="text-purple-600 font-semibold">
                    {authMode === 'login' ? 'Sign Up' : 'Sign In'}
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
