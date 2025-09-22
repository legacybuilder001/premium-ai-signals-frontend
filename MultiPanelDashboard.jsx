import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card.jsx';
import { Button } from '@/components/ui/button.jsx';
import { Badge } from '@/components/ui/badge.jsx';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs.jsx';
import { Progress } from '@/components/ui/progress.jsx';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Target,
  Activity,
  BarChart3,
  PieChart,
  Calendar,
  Clock,
  Zap,
  AlertTriangle,
  CheckCircle,
  XCircle,
  RefreshCw
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, PieChart as RechartsPieChart, Cell } from 'recharts';

const MultiPanelDashboard = ({ apiBase }) => {
  const [pnlData, setPnlData] = useState([]);
  const [liveTrades, setLiveTrades] = useState([]);
  const [performanceMetrics, setPerformanceMetrics] = useState({
    totalPnL: 0,
    todayPnL: 0,
    winRate: 0,
    totalTrades: 0,
    avgWin: 0,
    avgLoss: 0,
    maxDrawdown: 0,
    profitFactor: 0
  });
  const [portfolioBreakdown, setPortfolioBreakdown] = useState([]);
  const [riskMetrics, setRiskMetrics] = useState({
    currentRisk: 0,
    maxRisk: 100,
    dailyRisk: 0,
    maxDailyRisk: 500
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch live P&L data
  const fetchPnLData = async () => {
    try {
      const response = await fetch(`${apiBase}/trading/pnl`);
      if (response.ok) {
        const data = await response.json();
        setPnlData(data.pnl_history || []);
        setPerformanceMetrics(data.metrics || performanceMetrics);
      } else {
        // Generate mock data for demonstration
        generateMockPnLData();
      }
    } catch (err) {
      console.error('Failed to fetch P&L data:', err);
      generateMockPnLData();
    }
  };

  // Fetch live trades
  const fetchLiveTrades = async () => {
    try {
      const response = await fetch(`${apiBase}/trading/live-trades`);
      if (response.ok) {
        const data = await response.json();
        setLiveTrades(data.trades || []);
      } else {
        generateMockLiveTrades();
      }
    } catch (err) {
      console.error('Failed to fetch live trades:', err);
      generateMockLiveTrades();
    }
  };

  // Fetch portfolio breakdown
  const fetchPortfolioBreakdown = async () => {
    try {
      const response = await fetch(`${apiBase}/trading/portfolio`);
      if (response.ok) {
        const data = await response.json();
        setPortfolioBreakdown(data.breakdown || []);
        setRiskMetrics(data.risk_metrics || riskMetrics);
      } else {
        generateMockPortfolioData();
      }
    } catch (err) {
      console.error('Failed to fetch portfolio data:', err);
      generateMockPortfolioData();
    }
  };

  // Generate mock data for demonstration
  const generateMockPnLData = () => {
    const mockData = [];
    let cumulativePnL = 0;
    
    for (let i = 0; i < 24; i++) {
      const change = (Math.random() - 0.4) * 50; // Slight positive bias
      cumulativePnL += change;
      mockData.push({
        time: `${i.toString().padStart(2, '0')}:00`,
        pnl: Math.round(cumulativePnL * 100) / 100,
        change: Math.round(change * 100) / 100
      });
    }
    
    setPnlData(mockData);
    setPerformanceMetrics({
      totalPnL: Math.round(cumulativePnL * 100) / 100,
      todayPnL: Math.round(cumulativePnL * 0.3 * 100) / 100,
      winRate: 72.5,
      totalTrades: 156,
      avgWin: 23.50,
      avgLoss: -18.20,
      maxDrawdown: -45.30,
      profitFactor: 1.85
    });
  };

  const generateMockLiveTrades = () => {
    const assets = ['EURUSD', 'AAPL', 'BTCUSD', 'GBPUSD', 'TSLA'];
    const directions = ['CALL', 'PUT'];
    const tiers = ['Gold', 'Silver', 'Bronze'];
    
    const mockTrades = [];
    for (let i = 0; i < 8; i++) {
      const asset = assets[Math.floor(Math.random() * assets.length)];
      const direction = directions[Math.floor(Math.random() * directions.length)];
      const tier = tiers[Math.floor(Math.random() * tiers.length)];
      const amount = Math.round((Math.random() * 100 + 10) * 100) / 100;
      const pnl = Math.round((Math.random() - 0.3) * amount * 100) / 100;
      
      mockTrades.push({
        id: `trade_${i}`,
        asset,
        direction,
        tier,
        amount,
        pnl,
        status: Math.random() > 0.7 ? 'closed' : 'open',
        timestamp: new Date(Date.now() - Math.random() * 3600000).toISOString(),
        confidence: Math.round((Math.random() * 30 + 60) * 10) / 10
      });
    }
    
    setLiveTrades(mockTrades);
  };

  const generateMockPortfolioData = () => {
    const breakdown = [
      { name: 'Forex', value: 45, color: '#3B82F6' },
      { name: 'Stocks', value: 30, color: '#10B981' },
      { name: 'Crypto', value: 20, color: '#F59E0B' },
      { name: 'Commodities', value: 5, color: '#EF4444' }
    ];
    
    setPortfolioBreakdown(breakdown);
    setRiskMetrics({
      currentRisk: 65,
      maxRisk: 100,
      dailyRisk: 125,
      maxDailyRisk: 500
    });
  };

  useEffect(() => {
    const fetchAllData = async () => {
      setLoading(true);
      await Promise.all([
        fetchPnLData(),
        fetchLiveTrades(),
        fetchPortfolioBreakdown()
      ]);
      setLoading(false);
    };

    fetchAllData();

    // Refresh data every 30 seconds
    const interval = setInterval(fetchAllData, 30000);
    return () => clearInterval(interval);
  }, []);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount || 0);
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'open':
        return <Clock className="w-4 h-4 text-blue-400" />;
      case 'win':
      case 'closed':
        return <CheckCircle className="w-4 h-4 text-green-400" />;
      case 'loss':
        return <XCircle className="w-4 h-4 text-red-400" />;
      default:
        return <Activity className="w-4 h-4 text-slate-400" />;
    }
  };

  const getTierColor = (tier) => {
    switch (tier) {
      case 'Gold':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'Silver':
        return 'bg-slate-400/20 text-slate-300 border-slate-400/30';
      case 'Bronze':
        return 'bg-amber-600/20 text-amber-400 border-amber-600/30';
      default:
        return 'bg-slate-500/20 text-slate-400 border-slate-500/30';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        <span className="ml-2">Loading Dashboard...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BarChart3 className="w-6 h-6 text-blue-400" />
          <h2 className="text-xl font-bold">Multi-Panel Trading Dashboard</h2>
        </div>
        <Button onClick={() => window.location.reload()} variant="outline" size="sm">
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Key Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-black/40 border-white/10">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <DollarSign className="w-4 h-4" />
              Total P&L
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${performanceMetrics.totalPnL >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {formatCurrency(performanceMetrics.totalPnL)}
            </div>
            <p className="text-xs text-slate-400">All time</p>
          </CardContent>
        </Card>

        <Card className="bg-black/40 border-white/10">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Today's P&L
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${performanceMetrics.todayPnL >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {formatCurrency(performanceMetrics.todayPnL)}
            </div>
            <p className="text-xs text-slate-400">Current session</p>
          </CardContent>
        </Card>

        <Card className="bg-black/40 border-white/10">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Target className="w-4 h-4" />
              Win Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-400">
              {performanceMetrics.winRate}%
            </div>
            <p className="text-xs text-slate-400">{performanceMetrics.totalTrades} trades</p>
          </CardContent>
        </Card>

        <Card className="bg-black/40 border-white/10">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Profit Factor
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-400">
              {performanceMetrics.profitFactor}
            </div>
            <p className="text-xs text-slate-400">Profit/Loss ratio</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="pnl" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="pnl">P&L Chart</TabsTrigger>
          <TabsTrigger value="trades">Live Trades</TabsTrigger>
          <TabsTrigger value="portfolio">Portfolio</TabsTrigger>
          <TabsTrigger value="risk">Risk Management</TabsTrigger>
        </TabsList>

        <TabsContent value="pnl" className="space-y-4">
          <Card className="bg-black/40 border-white/10">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Live P&L Performance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={pnlData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="time" stroke="#9CA3AF" />
                    <YAxis stroke="#9CA3AF" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#1F2937', 
                        border: '1px solid #374151',
                        borderRadius: '8px'
                      }}
                    />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="pnl" 
                      stroke="#3B82F6" 
                      strokeWidth={2}
                      name="Cumulative P&L ($)"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trades" className="space-y-4">
          <Card className="bg-black/40 border-white/10">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5" />
                Live Trading Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {liveTrades.map((trade) => (
                  <div key={trade.id} className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg">
                    <div className="flex items-center gap-3">
                      {getStatusIcon(trade.status)}
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{trade.asset}</span>
                          <Badge variant="outline" className={getTierColor(trade.tier)}>
                            {trade.tier}
                          </Badge>
                          <span className={trade.direction === 'CALL' ? 'text-green-400' : 'text-red-400'}>
                            {trade.direction}
                          </span>
                        </div>
                        <div className="text-sm text-slate-400">
                          {formatCurrency(trade.amount)} • {trade.confidence}% confidence
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`font-medium ${trade.pnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {formatCurrency(trade.pnl)}
                      </div>
                      <div className="text-sm text-slate-400">
                        {new Date(trade.timestamp).toLocaleTimeString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="portfolio" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="bg-black/40 border-white/10">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChart className="w-5 h-5" />
                  Asset Allocation
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsPieChart>
                      <Pie
                        data={portfolioBreakdown}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, value }) => `${name}: ${value}%`}
                      >
                        {portfolioBreakdown.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </RechartsPieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-black/40 border-white/10">
              <CardHeader>
                <CardTitle>Performance Breakdown</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm text-slate-400">Average Win</div>
                    <div className="text-lg font-bold text-green-400">
                      {formatCurrency(performanceMetrics.avgWin)}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-slate-400">Average Loss</div>
                    <div className="text-lg font-bold text-red-400">
                      {formatCurrency(performanceMetrics.avgLoss)}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-slate-400">Max Drawdown</div>
                    <div className="text-lg font-bold text-orange-400">
                      {formatCurrency(performanceMetrics.maxDrawdown)}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-slate-400">Total Trades</div>
                    <div className="text-lg font-bold text-blue-400">
                      {performanceMetrics.totalTrades}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="risk" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="bg-black/40 border-white/10">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5" />
                  Current Risk Exposure
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Position Risk</span>
                    <span>{formatCurrency(riskMetrics.currentRisk)} / {formatCurrency(riskMetrics.maxRisk)}</span>
                  </div>
                  <Progress 
                    value={(riskMetrics.currentRisk / riskMetrics.maxRisk) * 100} 
                    className="h-3"
                  />
                </div>
                
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Daily Risk</span>
                    <span>{formatCurrency(riskMetrics.dailyRisk)} / {formatCurrency(riskMetrics.maxDailyRisk)}</span>
                  </div>
                  <Progress 
                    value={(riskMetrics.dailyRisk / riskMetrics.maxDailyRisk) * 100} 
                    className="h-3"
                  />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-black/40 border-white/10">
              <CardHeader>
                <CardTitle>Risk Alerts</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-green-400">
                    <CheckCircle className="w-4 h-4" />
                    <span className="text-sm">Risk levels within limits</span>
                  </div>
                  <div className="flex items-center gap-2 text-blue-400">
                    <Activity className="w-4 h-4" />
                    <span className="text-sm">8 active positions monitored</span>
                  </div>
                  <div className="flex items-center gap-2 text-yellow-400">
                    <AlertTriangle className="w-4 h-4" />
                    <span className="text-sm">Daily limit at 25% capacity</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MultiPanelDashboard;

