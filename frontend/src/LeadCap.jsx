import React, { useState, useEffect } from 'react';
import { Mail, Copy, RefreshCw, Trash2, Clock, Check, Inbox, ArrowLeft, Target } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

// API Configuration
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const DEMO_MODE = !import.meta.env.VITE_API_URL;

function LeadCap() {
  const navigate = useNavigate();
  const [currentEmail, setCurrentEmail] = useState('');
  const [inbox, setInbox] = useState([]);
  const [selectedEmail, setSelectedEmail] = useState(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [countdown, setCountdown] = useState(5);

  const generateEmail = async () => {
    setLoading(true);
    try {
      if (DEMO_MODE) {
        const randomStr = Math.random().toString(36).substring(2, 12);
        const demoEmail = `${randomStr}@leadcap.temp`;
        setCurrentEmail(demoEmail);
      } else {
        const response = await axios.post(`${API_URL}/api/generate`);
        setCurrentEmail(response.data.email);
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
        if (inbox.length === 0) {
          const demoEmails = [
            {
              id: '1',
              from: 'welcome@leadcap.com',
              subject: 'Welcome to LeadCap!',
              body: 'LeadCap - Capture leads with temporary emails efficiently!',
              timestamp: new Date().toISOString(),
              read: false
            }
          ];
          setInbox(demoEmails);
        }
      } else {
        const response = await axios.get(`${API_URL}/api/inbox/${currentEmail}`);
        setInbox(response.data.emails || []);
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
    setInbox(inbox.filter(e => e.id !== emailId));
    if (selectedEmail?.id === emailId) {
      setSelectedEmail(null);
    }
  };

  const markAsRead = (email) => {
    setSelectedEmail(email);
    const updatedInbox = inbox.map(e => 
      e.id === email.id ? { ...e, read: true } : e
    );
    setInbox(updatedInbox);
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

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          fetchInbox();
          return 5;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [currentEmail]);

  useEffect(() => {
    generateEmail();
  }, []);

  useEffect(() => {
    if (currentEmail) {
      fetchInbox();
    }
  }, [currentEmail]);

  const handleManualRefresh = () => {
    fetchInbox();
    setCountdown(5);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-emerald-50">
      <header className="bg-white/80 backdrop-blur-lg border-b border-gray-200/60 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3 sm:space-x-4">
              <button onClick={() => navigate('/')} className="p-2 hover:bg-gray-100 rounded-lg transition-all">
                <ArrowLeft className="w-5 h-5 sm:w-6 sm:h-6 text-gray-700" />
              </button>
              <div className="flex items-center space-x-2 sm:space-x-3">
                <div className="bg-gradient-to-br from-teal-600 to-emerald-600 p-1.5 sm:p-2 rounded-lg sm:rounded-xl shadow-sm">
                  <Target className="w-5 h-5 sm:w-7 sm:h-7 text-white" />
                </div>
                <div>
                  <h1 className="text-lg sm:text-2xl font-bold bg-gradient-to-r from-teal-600 to-emerald-600 bg-clip-text text-transparent">
                    LeadCap<sup className="text-xs sm:text-sm ml-0.5 text-teal-600">GB</sup>
                  </h1>
                  <p className="text-xs sm:text-sm text-gray-600">Lead Capture Email Service</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-[1400px] mx-auto px-3 sm:px-6 py-4 sm:py-8">
        <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-200/60 p-4 sm:p-8 mb-4 sm:mb-6">
          <div className="space-y-3 sm:space-y-5">
            <div>
              <h2 className="text-lg sm:text-2xl font-bold text-gray-900 mb-2 sm:mb-3">Your temporary email address</h2>
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-2.5 bg-gray-50/50 border border-gray-300 p-2 sm:p-2.5 rounded-xl focus-within:border-teal-600 focus-within:ring-2 sm:focus-within:ring-4 focus-within:ring-teal-100 transition-all">
                <div className="flex items-center space-x-2 flex-1 min-w-0">
                  <Target className="w-4 h-4 text-teal-400 flex-shrink-0" />
                  <input type="text" value={currentEmail} readOnly className="flex-1 bg-transparent text-sm sm:text-base font-mono font-semibold outline-none text-gray-900 selection:bg-teal-100 min-w-0" />
                </div>
                <button onClick={copyToClipboard} className="flex-shrink-0 px-3 py-2 sm:py-1.5 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white rounded-lg transition-all text-sm font-medium flex items-center justify-center space-x-2">
                  {copied ? <><Check className="w-4 h-4" /><span>Copied</span></> : <><Copy className="w-4 h-4" /><span>Copy</span></>}
                </button>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
              <div className="bg-gradient-to-br from-teal-50 to-emerald-100/50 border border-teal-200/60 p-3 sm:p-4 rounded-lg sm:rounded-xl">
                <div className="flex items-center space-x-2 sm:space-x-3">
                  <div className="p-1.5 sm:p-2 bg-white rounded-lg shadow-sm">
                    <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-teal-600" />
                  </div>
                  <div>
                    <p className="text-xs text-teal-600/80 font-medium">Expires in</p>
                    <p className="text-lg sm:text-xl font-semibold text-teal-900">1 Hour</p>
                  </div>
                </div>
              </div>
              <div className="bg-gradient-to-br from-emerald-50 to-emerald-100/50 border border-emerald-200/60 p-3 sm:p-4 rounded-lg sm:rounded-xl">
                <div className="flex items-center space-x-2 sm:space-x-3">
                  <div className="p-1.5 sm:p-2 bg-white rounded-lg shadow-sm">
                    <Inbox className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-xs text-emerald-600/80 font-medium">Emails received</p>
                    <p className="text-lg sm:text-xl font-semibold text-emerald-900">{inbox.length}</p>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-center sm:col-span-2 md:col-span-1">
                <button onClick={generateEmail} disabled={loading} className="w-full flex items-center justify-center space-x-2 bg-white hover:bg-gray-50 border border-gray-300 text-gray-700 py-2.5 sm:py-3 px-4 rounded-lg sm:rounded-xl font-medium transition-all text-sm disabled:opacity-50">
                  <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                  <span className="hidden sm:inline">Generate new email</span>
                  <span className="sm:hidden">New email</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          <div className="lg:col-span-1 bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-200/60 overflow-hidden">
            <div className="border-b border-gray-200/60 px-3 sm:px-5 py-3 sm:py-4 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <h3 className="font-semibold text-sm sm:text-base text-gray-900">Inbox</h3>
                <span className="px-1.5 sm:px-2 py-0.5 bg-teal-100 text-teal-700 text-xs font-medium rounded-full">{inbox.length}</span>
              </div>
              <div className="flex items-center space-x-2 sm:space-x-3">
                <div className="flex items-center space-x-1 px-1.5 sm:px-2.5 py-1 bg-teal-50 border border-teal-200 rounded-md sm:rounded-lg">
                  <span className="text-xs font-semibold text-teal-700">{countdown}s</span>
                </div>
                <button onClick={handleManualRefresh} className="p-1 sm:p-1.5 hover:bg-gray-100 rounded-md sm:rounded-lg transition-all">
                  <RefreshCw className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-600" />
                </button>
              </div>
            </div>
            <div className="divide-y divide-gray-100 max-h-[400px] sm:max-h-[500px] overflow-y-auto">
              {inbox.length === 0 ? (
                <div className="p-8 sm:p-12 text-center">
                  <div className="inline-flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 bg-teal-100 rounded-xl mb-3">
                    <Target className="w-6 h-6 sm:w-7 sm:h-7 text-teal-400" />
                  </div>
                  <p className="text-gray-900 font-medium text-sm">No emails yet</p>
                  <p className="text-xs text-gray-500 mt-1">New emails will appear here</p>
                </div>
              ) : (
                inbox.map((email) => (
                  <div key={email.id} onClick={() => markAsRead(email)} className={`p-3 sm:p-4 cursor-pointer hover:bg-gray-50 transition-all border-l-2 ${selectedEmail?.id === email.id ? 'bg-teal-50/50 border-teal-600' : 'border-transparent'}`}>
                    <div className="flex justify-between items-start mb-1.5 gap-2">
                      <p className={`text-xs sm:text-sm font-semibold truncate flex-1 ${!email.read ? 'text-gray-900' : 'text-gray-700'}`}>{email.from}</p>
                      <span className="text-xs text-gray-500 bg-gray-100 px-1.5 sm:px-2 py-0.5 rounded flex-shrink-0">{formatTime(email.timestamp)}</span>
                    </div>
                    <p className={`text-xs sm:text-sm ${!email.read ? 'font-bold text-gray-900' : 'text-gray-600'} truncate mb-1.5`}>{email.subject}</p>
                    {!email.read && (
                      <span className="inline-flex items-center text-xs bg-teal-600 text-white px-2 sm:px-3 py-0.5 sm:py-1 rounded-full font-medium">
                        <span className="w-1.5 h-1.5 bg-white rounded-full mr-1.5 animate-pulse"></span>New
                      </span>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="lg:col-span-2 bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-200/60 overflow-hidden">
            {selectedEmail ? (
              <div className="h-full flex flex-col">
                <div className="border-b border-gray-200/60 px-3 sm:px-6 py-3 sm:py-5">
                  <div className="flex justify-between items-start mb-3 gap-2">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-base sm:text-xl font-semibold text-gray-900 truncate mb-2">{selectedEmail.subject}</h3>
                      <p className="text-xs sm:text-sm text-gray-600">{formatTime(selectedEmail.timestamp)}</p>
                    </div>
                    <button onClick={() => deleteEmail(selectedEmail.id)} className="p-1.5 sm:p-2 hover:bg-red-50 rounded-lg transition-all">
                      <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-red-600" />
                    </button>
                  </div>
                  <div className="flex items-start">
                    <span className="text-xs font-medium text-gray-500 w-12 sm:w-16 flex-shrink-0">From</span>
                    <span className="text-xs sm:text-sm text-gray-900 flex-1 break-words">{selectedEmail.from || 'Unknown Sender'}</span>
                  </div>
                </div>
                <div className="flex-1 p-3 sm:p-8 overflow-y-auto bg-gray-50">
                  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 sm:p-6">
                    <p className="whitespace-pre-wrap text-gray-700 leading-relaxed text-sm sm:text-base break-words">{selectedEmail.body}</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="h-64 sm:h-96 flex items-center justify-center p-4">
                <div className="text-center">
                  <div className="inline-block p-4 sm:p-6 bg-teal-100 rounded-full mb-3">
                    <Target className="w-12 h-12 sm:w-16 sm:h-16 text-teal-400" />
                  </div>
                  <p className="text-gray-700 font-medium text-base sm:text-lg">Select an email to view</p>
                  <p className="text-gray-500 text-xs sm:text-sm mt-1">Click on any email from the inbox</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      <footer className="mt-12 pb-8 border-t border-gray-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 pt-6 text-center">
          <div className="flex items-center justify-center space-x-2 mb-2">
            <div className="bg-gradient-to-br from-teal-600 to-emerald-600 p-1.5 sm:p-2 rounded-lg">
              <Target className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-gray-900">LeadCap<sup className="text-xs ml-0.5 text-teal-600">GB</sup></h3>
          </div>
          <p className="text-gray-600 text-xs sm:text-sm">© 2024 LeadCap<sup className="text-[10px] text-teal-600">GB</sup> - Lead Capture Service</p>
        </div>
      </footer>
    </div>
  );
}

export default LeadCap;
