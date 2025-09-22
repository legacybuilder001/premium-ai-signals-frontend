import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button.jsx';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card.jsx';
import { Badge } from '@/components/ui/badge.jsx';
import { Progress } from '@/components/ui/progress.jsx';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select.jsx';
import { Input } from '@/components/ui/input.jsx';
import { Label } from '@/components/ui/label.jsx';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs.jsx';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog.jsx';
import { Switch } from '@/components/ui/switch.jsx';
import {
  TrendingUp,
  TrendingDown,
  Clock,
  Target,
  BarChart3,
  Settings,
  Send,
  Filter,
  Trophy,
  Medal,
  Award,
  AlertCircle,
  CheckCircle,
  XCircle,
  Timer,
  Activity,
  DollarSign,
  Zap,
  MessageCircle
} from 'lucide-react';
import './App.css';
import LiveChat from './components/LiveChat';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:8000';

const App = () => {
  // Core state
  const [signal, setSignal] = useState(null);
  const [signalsHistory, setSignalsHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [autoMode, setAutoMode] = useState(false);

  // Filters and settings
  const [selectedAsset, setSelectedAsset] = useState('EURUSD');
  const [selectedTimeframe, setSelectedTimeframe] = useState('1m');
  const [isOTC, setIsOTC] = useState(false);
  const [confidenceFilter, setConfidenceFilter] = useState('all');
  const [tierFilter, setTierFilter] = useState('all');
  const [outcomeFilter, setOutcomeFilter] = useState('all');

  // Telegram settings
  const [telegramToken, setTelegramToken] = useState('');
  const [telegramChatId, setTelegramChatId] = useState('');
  const [showTelegramSettings, setShowTelegramSettings] = useState(false);

  // Live Chat state
  const [showLiveChat, setShowLiveChat] = useState(false);
  const [chatMessages, setChatMessages] = useState([
    { id: 1, type: 'bot', message: 'Welcome to Premium AI Signals! How can I help you today?', timestamp: new Date() }
  ]);
  const [chatInput, setChatInput] = useState('');

  // Performance stats
  const [performanceStats, setPerformanceStats] = useState({
    total_trades: 0,
    win_rate: 0,
    total_pnl: 0,
    avg_confidence: 0,
    tier_breakdown: { Gold: 0, Silver: 0, Bronze: 0 }
  });

  // Countdown timer
  const [timeRemaining, setTimeRemaining] = useState(null);
  const [signalBreakdown, setSignalBreakdown] = useState(null);

  const ASSETS = ["EURUSD", "GBPUSD", "AUDUSD", "USDJPY", "EURGBP", "EURJPY", "GBPJPY", "AUDJPY", "USDCHF", "NZDUSD"];

  const getTierIcon = (tier) => {
    switch(tier) {
      case 'Gold': return <Trophy className="w-4 h-4 text-yellow-500" />;
      case 'Silver': return <Medal className="w-4 h-4 text-gray-400" />;
      case 'Bronze': return <Award className="w-4 h-4 text-amber-600" />;
      default: return <Target className="w-4 h-4" />;
    }
  };

  const getTierColor = (tier) => {
    switch(tier) {
      case 'Gold': return 'bg-yellow-500/20 text-yellow-700 border-yellow-500/30';
      case 'Silver': return 'bg-gray-400/20 text-gray-700 border-gray-400/30';
      case 'Bronze': return 'bg-amber-600/20 text-amber-700 border-amber-600/30';
      default: return 'bg-blue-500/20 text-blue-700 border-blue-500/30';
    }
  };

  const getOutcomeIcon = (outcome) => {
    switch(outcome) {
      case 'win': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'loss': return <XCircle className="w-4 h-4 text-red-500" />;
      default: return <Clock className="w-4 h-4 text-yellow-500" />;
    }
  };

  // Fetch signals history
  const fetchSignalsHistory = async () => {
    try {
      const params = new URLSearchParams();
      if (selectedAsset !== 'all') params.append('asset', selectedAsset);
      if (tierFilter !== 'all') params.append('tier', tierFilter);
      if (outcomeFilter !== 'all') params.append('outcome', outcomeFilter);
      params.append('limit', '50');

      const response = await fetch(`${API_BASE}/signals?${params}`);
      const data = await response.json();
      setSignalsHistory(data.signals || []);
    } catch (err) {
      console.error('Failed to fetch signals history:', err);
      // Mock data for demo
      setSignalsHistory([
        {
          id: 'demo-1',
          asset: 'EURUSD',
          direction: 'CALL',
          confidence: 85,
          tier: 'Gold',
          pattern: 'Bullish Engulfing',
          outcome: 'win',
          pnl: 2.5,
          timestamp: new Date(Date.now() - 3600000).toISOString()
        },
        {
          id: 'demo-2',
          asset: 'GBPUSD',
          direction: 'PUT',
          confidence: 72,
          tier: 'Silver',
          pattern: 'Bearish Doji',
          outcome: 'loss',
          pnl: -1.0,
          timestamp: new Date(Date.now() - 7200000).toISOString()
        }
      ]);
    }
  };

  // Fetch performance stats
  const fetchPerformanceStats = async () => {
    try {
      const response = await fetch(`${API_BASE}/performance/${selectedAsset}`);
      const data = await response.json();
      setPerformanceStats(data);
    } catch (err) {
      console.error('Failed to fetch performance stats:', err);
      // Mock data for demo
      setPerformanceStats({
        total_trades: 156,
        win_rate: 68.5,
        total_pnl: 24.7,
        avg_confidence: 76.2,
        tier_breakdown: { Gold: 45, Silver: 78, Bronze: 33 }
      });
    }
  };

  // Generate new signal
  const generateSignal = async () => {
    setLoading(true);
    setError(null);
    try {
      const asset = isOTC ? `${selectedAsset}-OTC` : selectedAsset;
      const response = await fetch(`${API_BASE}/signals/${asset}?otc=${isOTC}&timeframe=${selectedTimeframe}`);
      const data = await response.json();

      if (data.status === 'active') {
        setSignal(data);
        setSignalBreakdown({
          confidence: data.confidence,
          confluence_score: data.confluence_score,
          pattern: data.pattern,
          pattern_win_rate: data.pattern_win_rate,
          risk_pct: data.risk_pct,
          technical: data.technical
        });

        // Start countdown timer
        if (data.expiry_time) {
          const expiryTime = new Date(data.expiry_time);
          const updateTimer = () => {
            const now = new Date();
            const diff = expiryTime - now;
            if (diff > 0) {
              setTimeRemaining(Math.floor(diff / 1000));
            } else {
              setTimeRemaining(0);
            }
          };
          updateTimer();
          const interval = setInterval(updateTimer, 1000);
          setTimeout(() => clearInterval(interval), 300000);
        }

        // Send Telegram notification if configured
        if (telegramToken && telegramChatId) {
          sendTelegramNotification(data);
        }
      } else {
        setError(data.message || 'Signal generation failed');
      }
    } catch (err) {
      setError('Failed to connect to backend');
    } finally {
      setLoading(false);
    }
  };

  // Send Telegram notification
  const sendTelegramNotification = async (signalData) => {
    try {
      const message = `🚨 SIGNAL ALERT\nAsset: ${signalData.asset}\nDirection: ${signalData.direction}\nConfidence: ${signalData.confidence}%\nTier: ${signalData.tier}\nExpiry: ${signalData.expire}\nRisk: ${signalData.risk_pct}%`;

      await fetch(`https://api.telegram.org/bot${telegramToken}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: telegramChatId,
          text: message
        })
      });
    } catch (err) {
      console.error('Failed to send Telegram notification:', err);
    }
  };

  // Test Telegram connection
  const testTelegram = async () => {
    try {
      const response = await fetch(`${API_BASE}/telegram/test`);
      const data = await response.json();
      alert(data.message || 'Test notification sent!');
    } catch (err) {
      alert('Failed to send test notification');
    }
  };

  // Handle live chat
  const sendChatMessage = () => {
    if (!chatInput.trim()) return;
    
    const userMessage = {
      id: Date.now(),
      type: 'user',
      message: chatInput,
      timestamp: new Date()
    };
    
    setChatMessages(prev => [...prev, userMessage]);
    setChatInput('');
    
    // Simulate bot response
    setTimeout(() => {
      const botResponse = {
        id: Date.now() + 1,
        type: 'bot',
        message: 'Thank you for your message! Our AI assistant is analyzing your query. For immediate support, please check our FAQ section.',
        timestamp: new Date()
      };
      setChatMessages(prev => [...prev, botResponse]);
    }, 1000);
  };

  // Format time remaining
  const formatTimeRemaining = (seconds) => {
    if (!seconds) return '00:00';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Filter signals based on confidence
  const filteredSignals = signalsHistory.filter(signal => {
    if (confidenceFilter === 'all') return true;
    if (confidenceFilter === 'high') return signal.confidence >= 80;
    if (confidenceFilter === 'medium') return signal.confidence >= 60 && signal.confidence < 80;
    if (confidenceFilter === 'low') return signal.confidence < 60;
    return true;
  });

  useEffect(() => {
    fetchSignalsHistory();
    fetchPerformanceStats();
  }, [selectedAsset, tierFilter, outcomeFilter]);

  // TradingView Widget Effect
  useEffect(() => {
    const scriptId = 'tradingview-widget-script';
    if (document.getElementById(scriptId)) return;

    const script = document.createElement('script');
    script.id = scriptId;
    script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js';
    script.type = 'text/javascript';
    script.async = true;
    script.innerHTML = `
      {
        "autosize": true,
        "symbol": "BINANCE:${selectedAsset}USD",
        "interval": "1",
        "timezone": "exchange",
        "theme": "dark",
        "style": "1",
        "locale": "en",
        "enable_publishing": false,
        "hide_top_toolbar": true,
        "hide_legend": true,
        "save_image": false,
        "calendar": false,
        "hide_volume": true,
        "support_host": "https://www.tradingview.com"
      }`;
    const container = document.getElementById('tradingview_widget');
    if (container) {
      container.appendChild(script);
    }

    return () => {
      if (container && container.contains(script)) {
        container.removeChild(script);
      }
    };
  }, [selectedAsset]);

  useEffect(() => {
    let interval;
    if (autoMode) {
      interval = setInterval(() => {
        generateSignal();
      }, 60000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [autoMode, selectedAsset, selectedTimeframe, isOTC]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 text-white">
      {/* Header */}
      <header className="border-b border-white/10 bg-black/20 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                Premium AI Signals
              </h1>
              <p className="text-slate-400">Advanced Binary Options Trading Signals</p>
            </div>
            <div className="flex items-center gap-4">
              <Badge variant="outline" className="border-green-500/30 text-green-400">
                <Activity className="w-3 h-3 mr-1" />
                {error ? 'Demo' : 'Live'}
              </Badge>
              
              {/* Live Chat Button */}
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setShowLiveChat(true)}
              >
                <MessageCircle className="w-4 h-4 mr-2" />
                Live Chat
              </Button>
              <LiveChat />

              <Dialog open={showTelegramSettings} onOpenChange={setShowTelegramSettings}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Settings className="w-4 h-4 mr-2" />
                    Settings
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-slate-800 border-slate-700">
                  <DialogHeader>
                    <DialogTitle>Telegram Settings</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="telegram-token">Bot Token</Label>
                      <Input
                        id="telegram-token"
                        value={telegramToken}
                        onChange={(e) => setTelegramToken(e.target.value)}
                        placeholder="Enter your Telegram bot token"
                        className="bg-slate-700 border-slate-600"
                      />
                    </div>
                    <div>
                      <Label htmlFor="telegram-chat">Chat ID</Label>
                      <Input
                        id="telegram-chat"
                        value={telegramChatId}
                        onChange={(e) => setTelegramChatId(e.target.value)}
                        placeholder="Enter your chat ID"
                        className="bg-slate-700 border-slate-600"
                      />
                    </div>
                    <Button onClick={testTelegram} className="w-full">
                      <Send className="w-4 h-4 mr-2" />
                      Test Connection
                    </Button>
                    <div>
                      <Label htmlFor="signal-tier-filter">Filter Signals by Tier</Label>
                      <Select value={tierFilter} onValueChange={setTierFilter}>
                        <SelectTrigger id="signal-tier-filter" className="bg-slate-700 border-slate-600">
                          <SelectValue placeholder="Select Tier" />
                        </SelectTrigger>
                        <SelectContent className="bg-slate-800 border-slate-700">
                          <SelectItem value="all">All Tiers</SelectItem>
                          <SelectItem value="Gold">Gold</SelectItem>
                          <SelectItem value="Silver">Silver</SelectItem>
                          <SelectItem value="Bronze">Bronze</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>
      </header>

      {/* Live Chat Modal */}
      <Dialog open={showLiveChat} onOpenChange={setShowLiveChat}>
        <DialogContent className="bg-slate-800 border-slate-700 max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MessageCircle className="w-5 h-5" />
              Live Chat Support
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="h-64 overflow-y-auto space-y-2 p-2 bg-slate-900 rounded">
              {chatMessages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-xs p-2 rounded text-sm ${
                      msg.type === 'user'
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-700 text-slate-200'
                    }`}
                  >
                    {msg.message}
                  </div>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Type your message..."
                className="bg-slate-700 border-slate-600"
                onKeyPress={(e) => e.key === 'Enter' && sendChatMessage()}
              />
              <Button onClick={sendChatMessage}>
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Controls & Latest Signal */}
          <div className="space-y-6">
            {/* Trading Controls */}
            <Card className="bg-black/40 border-white/10 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-5 h-5" />
                  Trading Controls
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Asset</Label>
                    <Select value={selectedAsset} onValueChange={setSelectedAsset}>
                      <SelectTrigger className="bg-slate-700 border-slate-600">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-800 border-slate-700">
                        {ASSETS.map(asset => (
                          <SelectItem key={asset} value={asset}>{asset}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Timeframe</Label>
                    <Select value={selectedTimeframe} onValueChange={setSelectedTimeframe}>
                      <SelectTrigger className="bg-slate-700 border-slate-600">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-800 border-slate-700">
                        <SelectItem value="1m">1 Minute</SelectItem>
                        <SelectItem value="5m">5 Minutes</SelectItem>
                        <SelectItem value="15m">15 Minutes</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="otc-mode">OTC Mode</Label>
                  <Switch
                    id="otc-mode"
                    checked={isOTC}
                    onCheckedChange={setIsOTC}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="auto-mode">Auto Mode</Label>
                  <Switch
                    id="auto-mode"
                    checked={autoMode}
                    onCheckedChange={setAutoMode}
                  />
                </div>

                <Button
                  onClick={generateSignal}
                  disabled={loading || autoMode}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                >
                  {loading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Generating...
                    </div>
                  ) : (
                    <>
                      <Zap className="w-4 h-4 mr-2" />
                      Generate Signal
                    </>
                  )}
                </Button>

                {error && (
                  <div className="text-yellow-400 text-sm p-2 bg-yellow-400/10 rounded border border-yellow-400/20">
                    {error}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Latest Signal */}
            <Card className="bg-black/40 border-white/10 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="w-5 h-5" />
                  Latest Signal
                  {timeRemaining !== null && (
                    <Badge variant="outline" className="ml-auto">
                      <Timer className="w-3 h-3 mr-1" />
                      {formatTimeRemaining(timeRemaining)}
                    </Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <AnimatePresence>
                  {signal ? (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      className="space-y-4"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {signal.direction === 'CALL' ? (
                            <TrendingUp className="w-6 h-6 text-green-500" />
                          ) : (
                            <TrendingDown className="w-6 h-6 text-red-500" />
                          )}
                          <span className="text-xl font-bold">{signal.direction}</span>
                        </div>
                        <Badge className={getTierColor(signal.tier)}>
                          {getTierIcon(signal.tier)}
                          {signal.tier}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-slate-400">Asset:</span>
                          <div className="font-semibold">{signal.asset}</div>
                        </div>
                        <div>
                          <span className="text-slate-400">Price:</span>
                          <div className="font-semibold">{signal.price}</div>
                        </div>
                        <div>
                          <span className="text-slate-400">Confidence:</span>
                          <div className="font-semibold">{signal.confidence}%</div>
                        </div>
                        <div>
                          <span className="text-slate-400">Risk:</span>
                          <div className="font-semibold">{signal.risk_pct}%</div>
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between text-sm mb-2">
                          <span>Confidence Level</span>
                          <span>{signal.confidence}%</span>
                        </div>
                        <Progress value={signal.confidence} className="h-2" />
                      </div>

                      {signalBreakdown && (
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="outline" size="sm" className="w-full">
                              <BarChart3 className="w-4 h-4 mr-2" />
                              View Breakdown
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="bg-slate-800 border-slate-700">
                            <DialogHeader>
                              <DialogTitle>Signal Analysis Breakdown</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <Label>Base Confidence</Label>
                                  <div className="text-lg font-semibold">{signalBreakdown.confidence}%</div>
                                </div>
                                <div>
                                  <Label>Confluence Score</Label>
                                  <div className="text-lg font-semibold">{signalBreakdown.confluence_score}%</div>
                                </div>
                                <div>
                                  <Label>Pattern</Label>
                                  <div className="text-lg font-semibold">{signalBreakdown.pattern}</div>
                                </div>
                                <div>
                                  <Label>Pattern Win Rate</Label>
                                  <div className="text-lg font-semibold">{signalBreakdown.pattern_win_rate}%</div>
                                </div>
                              </div>
                              {signalBreakdown.technical && (
                                <div>
                                  <Label>Technical Indicators</Label>
                                  <div className="grid grid-cols-2 gap-2 mt-2 text-sm">
                                    <div>RSI: {signalBreakdown.technical.rsi}</div>
                                    <div>Stoch: {signalBreakdown.technical.stoch_k}</div>
                                    <div>ATR: {signalBreakdown.technical.atr}</div>
                                  </div>
                                </div>
                              )}
                            </div>
                          </DialogContent>
                        </Dialog>
                      )}

                      <Button
                        className="w-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700"
                        onClick={() => window.open('https://pocketoption.com/en/sign-in', '_blank')}
                      >
                        <DollarSign className="w-4 h-4 mr-2" />
                        Execute Trade
                      </Button>
                    </motion.div>
                  ) : (
                    <div className="text-center py-8 text-slate-400">
                      <Activity className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>No active signal</p>
                      <p className="text-sm">Generate a signal to get started</p>
                    </div>
                  )}
                </AnimatePresence>
              </CardContent>
            </Card>

            {/* Performance Stats */}
            <Card className="bg-black/40 border-white/10 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  Performance Stats
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-400">{performanceStats.win_rate}%</div>
                    <div className="text-sm text-slate-400">Win Rate</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">{performanceStats.total_trades}</div>
                    <div className="text-sm text-slate-400">Total Trades</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-400">{performanceStats.total_pnl}</div>
                    <div className="text-sm text-slate-400">Total P&L</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-400">{performanceStats.avg_confidence}%</div>
                    <div className="text-sm text-slate-400">Avg Confidence</div>
                  </div>
                </div>

                <div className="mt-4">
                  <Label className="text-sm">Tier Breakdown</Label>
                  <div className="flex gap-2 mt-2">
                    <Badge className="bg-yellow-500/20 text-yellow-400">
                      Gold: {performanceStats.tier_breakdown?.Gold || 0}
                    </Badge>
                    <Badge className="bg-gray-400/20 text-gray-400">
                      Silver: {performanceStats.tier_breakdown?.Silver || 0}
                    </Badge>
                    <Badge className="bg-amber-600/20 text-amber-400">
                      Bronze: {performanceStats.tier_breakdown?.Bronze || 0}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Middle Column - TradingView Chart */}
          <div className="lg:col-span-2">
            <Card className="bg-black/40 border-white/10 backdrop-blur-sm col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  Live Chart - {selectedAsset}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div id="tradingview_widget_container" className="h-[400px] w-full">
                  <div id="tradingview_widget" className="h-full w-full"></div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Bottom Section - History and Features */}
        <div className="mt-6">
          <Tabs defaultValue="history" className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-black/40 border-white/10 backdrop-blur-sm">
              <TabsTrigger value="history">Signals History</TabsTrigger>
              <TabsTrigger value="features">Enhanced Features</TabsTrigger>
            </TabsList>
            <TabsContent value="history">
              <Card className="bg-black/40 border-white/10 backdrop-blur-sm">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <Clock className="w-5 h-5" />
                      Signals History
                    </CardTitle>
                    <div className="flex items-center gap-4">
                      <Select value={confidenceFilter} onValueChange={setConfidenceFilter}>
                        <SelectTrigger className="w-32 bg-slate-700 border-slate-600">
                          <SelectValue placeholder="Confidence" />
                        </SelectTrigger>
                        <SelectContent className="bg-slate-800 border-slate-700">
                          <SelectItem value="all">All Confidence</SelectItem>
                          <SelectItem value="high">High (80%+)</SelectItem>
                          <SelectItem value="medium">Medium (60-80%)</SelectItem>
                          <SelectItem value="low">Low (&lt;60%)</SelectItem>
                        </SelectContent>
                      </Select>

                      <Select value={tierFilter} onValueChange={setTierFilter}>
                        <SelectTrigger className="w-32 bg-slate-700 border-slate-600">
                          <SelectValue placeholder="Tier" />
                        </SelectTrigger>
                        <SelectContent className="bg-slate-800 border-slate-700">
                          <SelectItem value="all">All Tiers</SelectItem>
                          <SelectItem value="Gold">Gold Only</SelectItem>
                          <SelectItem value="Silver">Silver Only</SelectItem>
                          <SelectItem value="Bronze">Bronze Only</SelectItem>
                        </SelectContent>
                      </Select>

                      <Select value={outcomeFilter} onValueChange={setOutcomeFilter}>
                        <SelectTrigger className="w-32 bg-slate-700 border-slate-600">
                          <SelectValue placeholder="Outcome" />
                        </SelectTrigger>
                        <SelectContent className="bg-slate-800 border-slate-700">
                          <SelectItem value="all">All Outcomes</SelectItem>
                          <SelectItem value="win">Wins Only</SelectItem>
                          <SelectItem value="loss">Losses Only</SelectItem>
                          <SelectItem value="pending">Pending Only</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {filteredSignals.length > 0 ? (
                      filteredSignals.map((signal, index) => (
                        <motion.div
                          key={signal.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg border border-slate-700/50"
                        >
                          <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2">
                              {signal.direction === 'CALL' ? (
                                <TrendingUp className="w-4 h-4 text-green-500" />
                              ) : (
                                <TrendingDown className="w-4 h-4 text-red-500" />
                              )}
                              <span className="font-semibold">{signal.asset}</span>
                            </div>

                            <Badge className={getTierColor(signal.tier)} variant="outline">
                              {getTierIcon(signal.tier)}
                              {signal.tier}
                            </Badge>

                            <div className="text-sm text-slate-400">
                              {signal.confidence}% • {signal.pattern}
                            </div>
                          </div>

                          <div className="flex items-center gap-4">
                            <div className="text-sm text-slate-400">
                              {new Date(signal.timestamp).toLocaleTimeString()}
                            </div>

                            <div className="flex items-center gap-1">
                              {getOutcomeIcon(signal.outcome)}
                              <span className="text-sm capitalize">{signal.outcome}</span>
                            </div>

                            {signal.pnl !== undefined && signal.pnl !== 0 && (
                              <div className={`text-sm font-semibold ${signal.pnl > 0 ? 'text-green-400' : 'text-red-400'}`}>
                                {signal.pnl > 0 ? '+' : ''}{signal.pnl}%
                              </div>
                            )}
                          </div>
                        </motion.div>
                      ))
                    ) : (
                      <div className="text-center py-8 text-slate-400">
                        <Clock className="w-12 h-12 mx-auto mb-4 opacity-50" />
                        <p>No signals found</p>
                        <p className="text-sm">Try adjusting your filters or generate some signals</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="features">
              <Card className="bg-black/40 border-white/10 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Trophy className="w-5 h-5" />
                    Enhanced Features
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-slate-800/50 p-4 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <Trophy className="w-5 h-5 text-yellow-500" />
                        <h3 className="font-semibold">Confidence Tiering</h3>
                      </div>
                      <p className="text-sm text-slate-400">Gold, Silver, Bronze signal classification based on confidence and confluence</p>
                    </div>

                    <div className="bg-slate-800/50 p-4 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <BarChart3 className="w-5 h-5 text-blue-500" />
                        <h3 className="font-semibold">ATR Risk Management</h3>
                      </div>
                      <p className="text-sm text-slate-400">Dynamic risk sizing based on Average True Range calculations</p>
                    </div>

                    <div className="bg-slate-800/50 p-4 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <Clock className="w-5 h-5 text-green-500" />
                        <h3 className="font-semibold">Adaptive Timing</h3>
                      </div>
                      <p className="text-sm text-slate-400">Smart cooldown and delay controls after losses</p>
                    </div>

                    <div className="bg-slate-800/50 p-4 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <Activity className="w-5 h-5 text-purple-500" />
                        <h3 className="font-semibold">Real-time Tracking</h3>
                      </div>
                      <p className="text-sm text-slate-400">Complete signal logging and outcome tracking system</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default App;

