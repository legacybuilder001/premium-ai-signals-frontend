import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card.jsx';
import { Button } from '@/components/ui/button.jsx';
import { Input } from '@/components/ui/input.jsx';
import { Label } from '@/components/ui/label.jsx';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select.jsx';
import { Switch } from '@/components/ui/switch.jsx';
import { Badge } from '@/components/ui/badge.jsx';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs.jsx';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog.jsx';
import {
  Building2,
  Plus,
  Settings,
  TrendingUp,
  DollarSign,
  Shield,
  Activity,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Zap
} from 'lucide-react';

const BrokerPanel = ({ apiBase }) => {
  const [brokers, setBrokers] = useState({});
  const [activeBroker, setActiveBroker] = useState(null);
  const [autoTradingEnabled, setAutoTradingEnabled] = useState(false);
  const [showAddBroker, setShowAddBroker] = useState(false);
  const [tradingHistory, setTradingHistory] = useState([]);
  const [riskSettings, setRiskSettings] = useState({
    max_trade_amount: 100,
    max_daily_trades: 10,
    min_confidence: 75,
    allowed_tiers: ['Gold', 'Silver'],
    risk_per_trade: 2.0
  });

  // Add broker form state
  const [newBroker, setNewBroker] = useState({
    broker_name: '',
    api_key: '',
    api_secret: '',
    demo_mode: true
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch broker information
  const fetchBrokers = async () => {
    try {
      const response = await fetch(`${apiBase}/brokers`);
      if (response.ok) {
        const data = await response.json();
        setBrokers(data.accounts || {});
        setActiveBroker(data.active_broker);
        setAutoTradingEnabled(data.auto_trading_enabled);
      }
    } catch (err) {
      console.error('Failed to fetch brokers:', err);
      setError('Failed to load broker information');
    }
  };

  // Fetch trading history
  const fetchTradingHistory = async () => {
    try {
      const response = await fetch(`${apiBase}/trading/history`);
      if (response.ok) {
        const data = await response.json();
        setTradingHistory(data.trades || []);
      }
    } catch (err) {
      console.error('Failed to fetch trading history:', err);
    }
  };

  // Fetch risk settings
  const fetchRiskSettings = async () => {
    try {
      const response = await fetch(`${apiBase}/trading/risk-settings`);
      if (response.ok) {
        const data = await response.json();
        setRiskSettings(data.risk_settings || riskSettings);
      }
    } catch (err) {
      console.error('Failed to fetch risk settings:', err);
    }
  };

  // Add new broker
  const addBroker = async () => {
    if (!newBroker.broker_name || !newBroker.api_key || !newBroker.api_secret) {
      setError('Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${apiBase}/brokers/add`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newBroker)
      });

      if (response.ok) {
        setShowAddBroker(false);
        setNewBroker({ broker_name: '', api_key: '', api_secret: '', demo_mode: true });
        fetchBrokers();
        setError(null);
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to add broker');
      }
    } catch (err) {
      setError('Failed to add broker');
    } finally {
      setLoading(false);
    }
  };

  // Activate broker
  const activateBroker = async (brokerName) => {
    try {
      const response = await fetch(`${apiBase}/brokers/activate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ broker_name: brokerName })
      });

      if (response.ok) {
        setActiveBroker(brokerName);
        fetchBrokers();
      }
    } catch (err) {
      setError('Failed to activate broker');
    }
  };

  // Toggle auto trading
  const toggleAutoTrading = async () => {
    try {
      const response = await fetch(`${apiBase}/trading/auto`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enabled: !autoTradingEnabled })
      });

      if (response.ok) {
        setAutoTradingEnabled(!autoTradingEnabled);
      }
    } catch (err) {
      setError('Failed to toggle auto trading');
    }
  };

  // Update risk settings
  const updateRiskSettings = async () => {
    try {
      const response = await fetch(`${apiBase}/trading/risk-settings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(riskSettings)
      });

      if (response.ok) {
        setError(null);
      }
    } catch (err) {
      setError('Failed to update risk settings');
    }
  };

  useEffect(() => {
    fetchBrokers();
    fetchTradingHistory();
    fetchRiskSettings();
  }, []);

  const getBrokerStatusIcon = (broker) => {
    if (broker.connected) {
      return <CheckCircle className="w-4 h-4 text-green-500" />;
    } else {
      return <XCircle className="w-4 h-4 text-red-500" />;
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount || 0);
  };

  return (
    <div className="space-y-6">
      {error && (
        <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-4 text-red-200">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" />
            {error}
          </div>
        </div>
      )}

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="brokers">Brokers</TabsTrigger>
          <TabsTrigger value="trading">Trading</TabsTrigger>
          <TabsTrigger value="risk">Risk Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="bg-black/40 border-white/10">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Building2 className="w-4 h-4" />
                  Connected Brokers
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{Object.keys(brokers).length}</div>
                <p className="text-xs text-slate-400">
                  Active: {activeBroker || 'None'}
                </p>
              </CardContent>
            </Card>

            <Card className="bg-black/40 border-white/10">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" />
                  Auto Trading
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <Badge variant={autoTradingEnabled ? "default" : "secondary"}>
                    {autoTradingEnabled ? 'Enabled' : 'Disabled'}
                  </Badge>
                  <Switch
                    checked={autoTradingEnabled}
                    onCheckedChange={toggleAutoTrading}
                  />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-black/40 border-white/10">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Activity className="w-4 h-4" />
                  Recent Trades
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{tradingHistory.length}</div>
                <p className="text-xs text-slate-400">
                  Last 24 hours
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="brokers" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Broker Accounts</h3>
            <Dialog open={showAddBroker} onOpenChange={setShowAddBroker}>
              <DialogTrigger asChild>
                <Button size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Broker
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-slate-800 border-slate-700">
                <DialogHeader>
                  <DialogTitle>Add New Broker</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label>Broker</Label>
                    <Select value={newBroker.broker_name} onValueChange={(value) => 
                      setNewBroker(prev => ({ ...prev, broker_name: value }))
                    }>
                      <SelectTrigger className="bg-slate-700 border-slate-600">
                        <SelectValue placeholder="Select broker" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="alpaca">Alpaca Trading</SelectItem>
                        <SelectItem value="metatrader">MetaTrader</SelectItem>
                        <SelectItem value="iqoption">IQ Option</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>API Key</Label>
                    <Input
                      value={newBroker.api_key}
                      onChange={(e) => setNewBroker(prev => ({ ...prev, api_key: e.target.value }))}
                      className="bg-slate-700 border-slate-600"
                      placeholder="Enter API key"
                    />
                  </div>
                  <div>
                    <Label>API Secret</Label>
                    <Input
                      type="password"
                      value={newBroker.api_secret}
                      onChange={(e) => setNewBroker(prev => ({ ...prev, api_secret: e.target.value }))}
                      className="bg-slate-700 border-slate-600"
                      placeholder="Enter API secret"
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={newBroker.demo_mode}
                      onCheckedChange={(checked) => setNewBroker(prev => ({ ...prev, demo_mode: checked }))}
                    />
                    <Label>Demo Mode</Label>
                  </div>
                  <Button onClick={addBroker} disabled={loading} className="w-full">
                    {loading ? 'Adding...' : 'Add Broker'}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid gap-4">
            {Object.entries(brokers).map(([name, broker]) => (
              <Card key={name} className="bg-black/40 border-white/10">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {getBrokerStatusIcon(broker)}
                      <div>
                        <h4 className="font-medium capitalize">{name}</h4>
                        <p className="text-sm text-slate-400">
                          Balance: {formatCurrency(broker.balance)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {broker.demo_mode && (
                        <Badge variant="outline">Demo</Badge>
                      )}
                      {broker.active && (
                        <Badge variant="default">Active</Badge>
                      )}
                      <Button
                        size="sm"
                        variant={broker.active ? "secondary" : "default"}
                        onClick={() => activateBroker(name)}
                        disabled={broker.active}
                      >
                        {broker.active ? 'Active' : 'Activate'}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="trading" className="space-y-4">
          <Card className="bg-black/40 border-white/10">
            <CardHeader>
              <CardTitle>Trading History</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {tradingHistory.slice(0, 10).map((trade) => (
                  <div key={trade.id} className="flex items-center justify-between p-3 bg-slate-800/50 rounded">
                    <div className="flex items-center gap-3">
                      <Badge variant={trade.tier === 'Gold' ? 'default' : 'secondary'}>
                        {trade.tier}
                      </Badge>
                      <span className="font-medium">{trade.symbol}</span>
                      <span className={trade.direction === 'CALL' ? 'text-green-400' : 'text-red-400'}>
                        {trade.direction}
                      </span>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">{formatCurrency(trade.amount)}</div>
                      <div className="text-sm text-slate-400">{trade.confidence}%</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="risk" className="space-y-4">
          <Card className="bg-black/40 border-white/10">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Risk Management Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Max Trade Amount ($)</Label>
                  <Input
                    type="number"
                    value={riskSettings.max_trade_amount}
                    onChange={(e) => setRiskSettings(prev => ({ 
                      ...prev, 
                      max_trade_amount: parseFloat(e.target.value) 
                    }))}
                    className="bg-slate-700 border-slate-600"
                  />
                </div>
                <div>
                  <Label>Max Daily Trades</Label>
                  <Input
                    type="number"
                    value={riskSettings.max_daily_trades}
                    onChange={(e) => setRiskSettings(prev => ({ 
                      ...prev, 
                      max_daily_trades: parseInt(e.target.value) 
                    }))}
                    className="bg-slate-700 border-slate-600"
                  />
                </div>
                <div>
                  <Label>Min Confidence (%)</Label>
                  <Input
                    type="number"
                    value={riskSettings.min_confidence}
                    onChange={(e) => setRiskSettings(prev => ({ 
                      ...prev, 
                      min_confidence: parseFloat(e.target.value) 
                    }))}
                    className="bg-slate-700 border-slate-600"
                  />
                </div>
                <div>
                  <Label>Risk Per Trade (%)</Label>
                  <Input
                    type="number"
                    step="0.1"
                    value={riskSettings.risk_per_trade}
                    onChange={(e) => setRiskSettings(prev => ({ 
                      ...prev, 
                      risk_per_trade: parseFloat(e.target.value) 
                    }))}
                    className="bg-slate-700 border-slate-600"
                  />
                </div>
              </div>
              <Button onClick={updateRiskSettings} className="w-full">
                Update Risk Settings
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default BrokerPanel;

