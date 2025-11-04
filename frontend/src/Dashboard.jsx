import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Crown, LogOut, Star, Settings, BarChart3, TrendingUp, Package, User, Clock, Shield, Zap, CheckCircle } from 'lucide-react';

function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      {/* Header */}
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
              <button
                onClick={() => navigate('/')}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition-all text-sm"
              >
                Back to Home
              </button>
              <div className="flex items-center space-x-2 px-3 py-2 bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-lg">
                <img src={user.avatar} alt={user.name} className="w-6 h-6 rounded-full" />
                <span className="font-medium text-gray-900">{user.name}</span>
                <Crown className="w-4 h-4 text-purple-600" />
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Dashboard Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Dashboard Header Banner */}
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl px-8 py-8 text-white mb-8 shadow-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <img src={user.avatar} alt={user.name} className="w-20 h-20 rounded-full border-4 border-white/30" />
              <div>
                <h2 className="text-3xl font-bold">{user.name}</h2>
                <p className="text-purple-100 flex items-center space-x-2 mt-1">
                  <Crown className="w-5 h-5" />
                  <span className="text-lg">{user.plan} Member</span>
                </p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="px-6 py-3 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-lg transition-all flex items-center space-x-2 font-semibold"
            >
              <LogOut className="w-5 h-5" />
              <span>Logout</span>
            </button>
          </div>
        </div>

        {/* Dashboard Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
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
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 mb-8">
          <h3 className="text-2xl font-bold text-gray-900 mb-6">Premium Features</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Feature Cards */}
            <div className="bg-white border-2 border-gray-200 rounded-xl p-6 hover:border-purple-300 hover:shadow-md transition-all">
              <div className="flex items-start space-x-4">
                <div className="p-3 bg-purple-100 rounded-lg">
                  <Clock className="w-7 h-7 text-purple-600" />
                </div>
                <div className="flex-1">
                  <h4 className="font-bold text-gray-900 mb-2 text-lg">Extended Storage</h4>
                  <p className="text-sm text-gray-600 mb-3">Keep emails for 30 days instead of 1 hour</p>
                  <div className="flex items-center space-x-2">
                    <div className="flex-1 bg-gray-200 rounded-full h-2.5">
                      <div className="bg-gradient-to-r from-purple-600 to-pink-600 h-2.5 rounded-full" style={{width: '65%'}}></div>
                    </div>
                    <span className="text-sm font-semibold text-gray-700">65%</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white border-2 border-gray-200 rounded-xl p-6 hover:border-blue-300 hover:shadow-md transition-all">
              <div className="flex items-start space-x-4">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <Shield className="w-7 h-7 text-blue-600" />
                </div>
                <div className="flex-1">
                  <h4 className="font-bold text-gray-900 mb-2 text-lg">Custom Domains</h4>
                  <p className="text-sm text-gray-600 mb-3">Use your own domain for temporary emails</p>
                  <div className="space-y-1">
                    <p className="text-sm text-gray-500">• mail.yourdomain.com</p>
                    <p className="text-sm text-gray-500">• temp.company.io</p>
                    <p className="text-sm text-gray-500">• inbox.mybrand.net</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white border-2 border-gray-200 rounded-xl p-6 hover:border-green-300 hover:shadow-md transition-all">
              <div className="flex items-start space-x-4">
                <div className="p-3 bg-green-100 rounded-lg">
                  <Zap className="w-7 h-7 text-green-600" />
                </div>
                <div className="flex-1">
                  <h4 className="font-bold text-gray-900 mb-2 text-lg">API Access</h4>
                  <p className="text-sm text-gray-600 mb-3">Unlimited API requests with webhooks</p>
                  <div className="mt-2">
                    <code className="text-xs bg-gray-100 px-3 py-1.5 rounded font-mono text-gray-700 block">
                      {apiKey.substring(0, 20)}...
                    </code>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white border-2 border-gray-200 rounded-xl p-6 hover:border-pink-300 hover:shadow-md transition-all">
              <div className="flex items-start space-x-4">
                <div className="p-3 bg-pink-100 rounded-lg">
                  <Settings className="w-7 h-7 text-pink-600" />
                </div>
                <div className="flex-1">
                  <h4 className="font-bold text-gray-900 mb-2 text-lg">Advanced Features</h4>
                  <p className="text-sm text-gray-600 mb-3">Email forwarding, filters, and automation</p>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <span className="text-sm text-gray-600 font-medium">All features unlocked</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Account Info */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
          <h3 className="text-2xl font-bold text-gray-900 mb-6">Account Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-center space-x-4 p-5 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl border border-gray-200">
              <div className="p-3 bg-white rounded-lg shadow-sm">
                <User className="w-6 h-6 text-gray-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500 font-medium mb-1">Email Address</p>
                <p className="font-bold text-gray-900 text-lg">{user.email}</p>
              </div>
            </div>
            <div className="flex items-center space-x-4 p-5 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl border border-gray-200">
              <div className="p-3 bg-white rounded-lg shadow-sm">
                <Clock className="w-6 h-6 text-gray-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500 font-medium mb-1">Member Since</p>
                <p className="font-bold text-gray-900 text-lg">{user.joined}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="mt-16 pb-12 border-t border-gray-200 bg-white">
        <div className="max-w-7xl mx-auto px-6 pt-8">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-2 mb-3">
              <div className="bg-green-600 p-2 rounded-lg">
                <Mail className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">TempMail Premium</h3>
            </div>
            <p className="text-gray-600 text-sm mb-2">© 2024 TempMail - All rights reserved</p>
            <p className="text-xs text-gray-500">Premium temporary email service</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default Dashboard;
