import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Crown, LogOut, Star, Settings, BarChart3, TrendingUp, Package, User, Clock, Shield, Zap, CheckCircle, Home, Inbox, Key, Webhook, CreditCard, HelpCircle, Bell, Search, Filter, Download, Archive, Trash2, Eye, FileText, Calendar, Activity } from 'lucide-react';

function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [activeSection, setActiveSection] = useState('overview');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  useEffect(() => {
    // Check if user is authenticated (from localStorage)
    const userData = localStorage.getItem('premiumUser');
    if (userData) {
      setUser(JSON.parse(userData));
    } else {
      // Redirect to home if not authenticated
      navigate('/');
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('premiumUser');
    setUser(null);
    navigate('/');
  };

  const sidebarItems = [
    { id: 'overview', label: 'Overview', icon: Home },
    { id: 'inbox', label: 'Inbox', icon: Inbox, badge: '12' },
    { id: 'emails', label: 'Email Addresses', icon: Mail },
    { id: 'api', label: 'API Keys', icon: Key },
    { id: 'webhooks', label: 'Webhooks', icon: Webhook },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'billing', label: 'Billing', icon: CreditCard },
    { id: 'settings', label: 'Settings', icon: Settings },
    { id: 'help', label: 'Help & Support', icon: HelpCircle },
  ];

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  const apiKey = 'sk_live_1234567890abcdef';

  // Render content based on active section
  const renderContent = () => {
    switch (activeSection) {
      case 'overview':
        return <OverviewSection user={user} apiKey={apiKey} />;
      case 'inbox':
        return <InboxSection />;
      case 'emails':
        return <EmailAddressesSection />;
      case 'api':
        return <APIKeysSection apiKey={apiKey} />;
      case 'webhooks':
        return <WebhooksSection />;
      case 'analytics':
        return <AnalyticsSection user={user} />;
      case 'billing':
        return <BillingSection user={user} />;
      case 'settings':
        return <SettingsSection user={user} />;
      case 'help':
        return <HelpSection />;
      default:
        return <OverviewSection user={user} apiKey={apiKey} />;
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className={`${sidebarCollapsed ? 'w-20' : 'w-64'} bg-white border-r border-gray-200 flex flex-col transition-all duration-300`}>
        {/* Logo */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="bg-gradient-to-br from-purple-600 to-pink-600 p-2 rounded-xl shadow-lg">
              <Mail className="w-6 h-6 text-white" />
            </div>
            {!sidebarCollapsed && (
              <div>
                <h1 className="text-xl font-bold text-gray-900">TempMail</h1>
                <p className="text-xs text-purple-600 font-semibold flex items-center space-x-1">
                  <Crown className="w-3 h-3" />
                  <span>Premium</span>
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {sidebarItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveSection(item.id)}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all ${
                  isActive
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-gray-500'}`} />
                {!sidebarCollapsed && (
                  <>
                    <span className="flex-1 text-left font-medium">{item.label}</span>
                    {item.badge && (
                      <span className={`px-2 py-0.5 text-xs font-bold rounded-full ${
                        isActive ? 'bg-white text-purple-600' : 'bg-purple-100 text-purple-600'
                      }`}>
                        {item.badge}
                      </span>
                    )}
                  </>
                )}
              </button>
            );
          })}
        </nav>

        {/* User Profile & Logout */}
        <div className="p-4 border-t border-gray-200">
          <div className={`flex items-center ${sidebarCollapsed ? 'justify-center' : 'space-x-3'} mb-3`}>
            <img src={user.avatar} alt={user.name} className="w-10 h-10 rounded-full border-2 border-purple-200" />
            {!sidebarCollapsed && (
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-900 truncate">{user.name}</p>
                <p className="text-xs text-gray-500 truncate">{user.email}</p>
              </div>
            )}
          </div>
          <button
            onClick={handleLogout}
            className={`w-full flex items-center ${sidebarCollapsed ? 'justify-center' : 'space-x-2'} px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg transition-all font-medium`}
          >
            <LogOut className="w-5 h-5" />
            {!sidebarCollapsed && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header */}
        <header className="bg-white border-b border-gray-200 px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h2 className="text-2xl font-bold text-gray-900">
                {sidebarItems.find(item => item.id === activeSection)?.label || 'Overview'}
              </h2>
            </div>
            <div className="flex items-center space-x-3">
              <button className="p-2 hover:bg-gray-100 rounded-lg transition-all">
                <Search className="w-5 h-5 text-gray-600" />
              </button>
              <button className="p-2 hover:bg-gray-100 rounded-lg transition-all relative">
                <Bell className="w-5 h-5 text-gray-600" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>
              <button
                onClick={() => navigate('/')}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-all font-medium"
              >
                Back to Home
              </button>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="px-8 py-6">
            {renderContent()}
          </div>
        </div>
      </main>
    </div>
  );
}

// Overview Section Component
const OverviewSection = ({ user, apiKey }) => (
  <div className="space-y-6">
    {/* Stats Grid */}
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 border border-blue-200 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <Mail className="w-10 h-10 text-blue-600" />
          <Star className="w-6 h-6 text-blue-600" />
        </div>
        <p className="text-4xl font-bold text-blue-900 mb-1">{user.emailsReceived}</p>
        <p className="text-sm text-blue-700 font-semibold">Emails Received</p>
      </div>

      <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6 border border-green-200 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <Package className="w-10 h-10 text-green-600" />
          <TrendingUp className="w-6 h-6 text-green-600" />
        </div>
        <p className="text-4xl font-bold text-green-900 mb-1">{user.emailsStored}</p>
        <p className="text-sm text-green-700 font-semibold">Emails Stored</p>
      </div>

      <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-6 border border-purple-200 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <BarChart3 className="w-10 h-10 text-purple-600" />
          <Crown className="w-6 h-6 text-purple-600" />
        </div>
        <p className="text-4xl font-bold text-purple-900 mb-1">{user.storage}</p>
        <p className="text-sm text-purple-700 font-semibold">Storage Used</p>
      </div>

      <div className="bg-gradient-to-br from-pink-50 to-pink-100 rounded-xl p-6 border border-pink-200 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <Shield className="w-10 h-10 text-pink-600" />
          <CheckCircle className="w-6 h-6 text-pink-600" />
        </div>
        <p className="text-4xl font-bold text-pink-900 mb-1">{user.customDomains}</p>
        <p className="text-sm text-pink-700 font-semibold">Custom Domains</p>
      </div>
    </div>

    {/* Premium Features */}
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <h3 className="text-xl font-bold text-gray-900 mb-4">Premium Features</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white border border-gray-200 rounded-lg p-5 hover:border-purple-300 hover:shadow-md transition-all">
          <div className="flex items-start space-x-4">
            <div className="p-3 bg-purple-100 rounded-lg">
              <Clock className="w-6 h-6 text-purple-600" />
            </div>
            <div className="flex-1">
              <h4 className="font-bold text-gray-900 mb-1">Extended Storage</h4>
              <p className="text-sm text-gray-600 mb-2">Keep emails for 30 days</p>
              <div className="flex items-center space-x-2">
                <div className="flex-1 bg-gray-200 rounded-full h-2">
                  <div className="bg-gradient-to-r from-purple-600 to-pink-600 h-2 rounded-full" style={{width: '65%'}}></div>
                </div>
                <span className="text-xs font-semibold text-gray-700">65%</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-5 hover:border-blue-300 hover:shadow-md transition-all">
          <div className="flex items-start space-x-4">
            <div className="p-3 bg-blue-100 rounded-lg">
              <Shield className="w-6 h-6 text-blue-600" />
            </div>
            <div className="flex-1">
              <h4 className="font-bold text-gray-900 mb-1">Custom Domains</h4>
              <p className="text-sm text-gray-600 mb-2">Your own domain emails</p>
              <p className="text-xs text-gray-500">• mail.yourdomain.com</p>
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-5 hover:border-green-300 hover:shadow-md transition-all">
          <div className="flex items-start space-x-4">
            <div className="p-3 bg-green-100 rounded-lg">
              <Zap className="w-6 h-6 text-green-600" />
            </div>
            <div className="flex-1">
              <h4 className="font-bold text-gray-900 mb-1">API Access</h4>
              <p className="text-sm text-gray-600 mb-2">Unlimited API requests</p>
              <code className="text-xs bg-gray-100 px-2 py-1 rounded font-mono text-gray-700">
                {apiKey.substring(0, 15)}...
              </code>
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-5 hover:border-pink-300 hover:shadow-md transition-all">
          <div className="flex items-start space-x-4">
            <div className="p-3 bg-pink-100 rounded-lg">
              <Settings className="w-6 h-6 text-pink-600" />
            </div>
            <div className="flex-1">
              <h4 className="font-bold text-gray-900 mb-1">Advanced Features</h4>
              <p className="text-sm text-gray-600 mb-2">Automation & filters</p>
              <div className="flex items-center space-x-1">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span className="text-xs text-gray-600">All unlocked</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
);

// Inbox Section Component
const InboxSection = () => (
  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
    <div className="flex items-center justify-between mb-6">
      <h3 className="text-lg font-bold text-gray-900">Your Inbox</h3>
      <div className="flex items-center space-x-2">
        <button className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium transition-all">
          <Filter className="w-4 h-4 inline mr-2" />
          Filter
        </button>
      </div>
    </div>
    <div className="text-center py-12">
      <Inbox className="w-16 h-16 text-gray-400 mx-auto mb-4" />
      <p className="text-gray-600 font-medium">No emails yet</p>
      <p className="text-sm text-gray-500 mt-1">Your received emails will appear here</p>
    </div>
  </div>
);

// Email Addresses Section
const EmailAddressesSection = () => (
  <div className="space-y-4">
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold text-gray-900">Your Email Addresses</h3>
        <button className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-lg font-semibold transition-all">
          + Create New
        </button>
      </div>
      <div className="space-y-3">
        {['demo@ainewmail.online', 'test123@ainewmail.online', 'inbox@ainewmail.online'].map((email, idx) => (
          <div key={idx} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200 hover:border-purple-300 transition-all">
            <div className="flex items-center space-x-3">
              <Mail className="w-5 h-5 text-purple-600" />
              <span className="font-mono text-sm text-gray-900">{email}</span>
            </div>
            <div className="flex items-center space-x-2">
              <button className="p-2 hover:bg-gray-200 rounded-lg transition-all">
                <Eye className="w-4 h-4 text-gray-600" />
              </button>
              <button className="p-2 hover:bg-gray-200 rounded-lg transition-all">
                <Archive className="w-4 h-4 text-gray-600" />
              </button>
              <button className="p-2 hover:bg-red-100 rounded-lg transition-all">
                <Trash2 className="w-4 h-4 text-red-600" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

// API Keys Section
const APIKeysSection = ({ apiKey }) => (
  <div className="space-y-4">
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-bold text-gray-900 mb-4">API Keys</h3>
      <div className="space-y-4">
        <div className="p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Production Key</span>
            <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full">Active</span>
          </div>
          <code className="block text-sm bg-white px-3 py-2 rounded font-mono text-gray-800 border border-gray-200">
            {apiKey}
          </code>
          <div className="flex items-center space-x-2 mt-3">
            <button className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded text-sm font-medium transition-all">
              Copy Key
            </button>
            <button className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded text-sm font-medium transition-all">
              Regenerate
            </button>
          </div>
        </div>
      </div>
    </div>
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
      <div className="flex items-start space-x-3">
        <Shield className="w-5 h-5 text-blue-600 mt-0.5" />
        <div>
          <p className="font-semibold text-blue-900">Keep your API key secure</p>
          <p className="text-sm text-blue-700 mt-1">Never share your API key publicly or commit it to version control.</p>
        </div>
      </div>
    </div>
  </div>
);

// Webhooks Section
const WebhooksSection = () => (
  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
    <div className="flex items-center justify-between mb-6">
      <h3 className="text-lg font-bold text-gray-900">Webhooks</h3>
      <button className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-lg font-semibold transition-all">
        + Add Webhook
      </button>
    </div>
    <div className="text-center py-12">
      <Webhook className="w-16 h-16 text-gray-400 mx-auto mb-4" />
      <p className="text-gray-600 font-medium">No webhooks configured</p>
      <p className="text-sm text-gray-500 mt-1">Add a webhook to receive real-time notifications</p>
    </div>
  </div>
);

// Analytics Section
const AnalyticsSection = ({ user }) => (
  <div className="space-y-6">
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-2">
          <Activity className="w-8 h-8 text-blue-600" />
          <span className="text-sm font-semibold text-green-600">+12%</span>
        </div>
        <p className="text-3xl font-bold text-gray-900">{user.emailsReceived}</p>
        <p className="text-sm text-gray-600">Total Emails</p>
      </div>
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-2">
          <TrendingUp className="w-8 h-8 text-green-600" />
          <span className="text-sm font-semibold text-green-600">+8%</span>
        </div>
        <p className="text-3xl font-bold text-gray-900">89</p>
        <p className="text-sm text-gray-600">This Month</p>
      </div>
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-2">
          <Calendar className="w-8 h-8 text-purple-600" />
          <span className="text-sm font-semibold text-blue-600">Active</span>
        </div>
        <p className="text-3xl font-bold text-gray-900">24</p>
        <p className="text-sm text-gray-600">This Week</p>
      </div>
    </div>
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-bold text-gray-900 mb-4">Email Activity</h3>
      <div className="h-64 flex items-center justify-center border border-gray-200 rounded-lg bg-gray-50">
        <p className="text-gray-500">Chart visualization coming soon...</p>
      </div>
    </div>
  </div>
);

// Billing Section
const BillingSection = ({ user }) => (
  <div className="space-y-6">
    <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl p-6 text-white shadow-lg">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-purple-100 mb-2 flex items-center space-x-2">
            <Crown className="w-5 h-5" />
            <span>Current Plan</span>
          </p>
          <p className="text-3xl font-bold">{user.plan}</p>
          <p className="text-purple-100 mt-2">$19.99/month</p>
        </div>
        <button className="px-6 py-3 bg-white text-purple-600 rounded-lg font-semibold hover:bg-purple-50 transition-all">
          Manage Plan
        </button>
      </div>
    </div>
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-bold text-gray-900 mb-4">Billing History</h3>
      <div className="space-y-3">
        {['Nov 2024', 'Oct 2024', 'Sep 2024'].map((month, idx) => (
          <div key={idx} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-3">
              <FileText className="w-5 h-5 text-gray-600" />
              <div>
                <p className="font-semibold text-gray-900">{month}</p>
                <p className="text-sm text-gray-500">Premium Subscription</p>
              </div>
            </div>
            <div className="text-right">
              <p className="font-bold text-gray-900">$19.99</p>
              <button className="text-xs text-purple-600 hover:text-purple-700 font-medium">
                <Download className="w-3 h-3 inline mr-1" />
                Download
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

// Settings Section
const SettingsSection = ({ user }) => (
  <div className="space-y-6">
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-bold text-gray-900 mb-4">Account Settings</h3>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
          <input
            type="email"
            value={user.email}
            disabled
            className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Display Name</label>
          <input
            type="text"
            defaultValue={user.name}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
          />
        </div>
        <button className="px-6 py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-lg font-semibold transition-all">
          Save Changes
        </button>
      </div>
    </div>
  </div>
);

// Help Section
const HelpSection = () => (
  <div className="space-y-6">
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-bold text-gray-900 mb-4">Help & Support</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <a href="#" className="p-5 border border-gray-200 rounded-lg hover:border-purple-300 hover:shadow-md transition-all">
          <FileText className="w-8 h-8 text-purple-600 mb-3" />
          <h4 className="font-bold text-gray-900 mb-1">Documentation</h4>
          <p className="text-sm text-gray-600">Learn how to use TempMail Premium</p>
        </a>
        <a href="#" className="p-5 border border-gray-200 rounded-lg hover:border-blue-300 hover:shadow-md transition-all">
          <Mail className="w-8 h-8 text-blue-600 mb-3" />
          <h4 className="font-bold text-gray-900 mb-1">Contact Support</h4>
          <p className="text-sm text-gray-600">Get help from our team</p>
        </a>
      </div>
    </div>
  </div>
);

export default Dashboard;
