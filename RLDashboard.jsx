import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card.jsx';
import { Button } from '@/components/ui/button.jsx';
import { Badge } from '@/components/ui/badge.jsx';
import { Progress } from '@/components/ui/progress.jsx';
import {
  Brain,
  TrendingUp,
  Target,
  Activity,
  BarChart3,
  Zap,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react';

const RLDashboard = ({ apiBase }) => {
  const [rlStats, setRlStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch RL statistics
  const fetchRLStats = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${apiBase}/rl/stats`);
      
      if (response.ok) {
        const data = await response.json();
        setRlStats(data);
        setError(null);
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to load RL statistics');
      }
    } catch (err) {
      console.error('Failed to fetch RL stats:', err);
      setError('Reinforcement learning not available');
    } finally {
      setLoading(false);
    }
  };

  // Update signal outcome for RL training
  const updateSignalOutcome = async (signalId, outcome, pnl) => {
    try {
      const response = await fetch(`${apiBase}/signals/${signalId}/outcome`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ outcome, pnl })
      });

      if (response.ok) {
        // Refresh RL stats after update
        fetchRLStats();
      }
    } catch (err) {
      console.error('Failed to update signal outcome:', err);
    }
  };

  useEffect(() => {
    fetchRLStats();
    // Refresh stats every 30 seconds
    const interval = setInterval(fetchRLStats, 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <Card className="bg-black/40 border-white/10">
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            <span className="ml-2">Loading RL Dashboard...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="bg-black/40 border-white/10">
        <CardContent className="p-6">
          <div className="flex items-center gap-2 text-yellow-400">
            <AlertCircle className="w-5 h-5" />
            <span>{error}</span>
          </div>
          <p className="text-sm text-slate-400 mt-2">
            Reinforcement learning features will be available once the system starts learning from signal outcomes.
          </p>
        </CardContent>
      </Card>
    );
  }

  const getRegimeColor = (regime) => {
    switch (regime) {
      case 'trending': return 'text-green-400';
      case 'ranging': return 'text-blue-400';
      case 'volatile': return 'text-red-400';
      case 'breakout': return 'text-purple-400';
      default: return 'text-slate-400';
    }
  };

  const getRegimeIcon = (regime) => {
    switch (regime) {
      case 'trending': return <TrendingUp className="w-4 h-4" />;
      case 'ranging': return <BarChart3 className="w-4 h-4" />;
      case 'volatile': return <Activity className="w-4 h-4" />;
      case 'breakout': return <Zap className="w-4 h-4" />;
      default: return <Target className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-4">
        <Brain className="w-6 h-6 text-blue-400" />
        <h2 className="text-xl font-bold">Reinforcement Learning Dashboard</h2>
        <Badge variant="outline" className="border-green-500/30 text-green-400">
          <CheckCircle className="w-3 h-3 mr-1" />
          Active
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-black/40 border-white/10">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Brain className="w-4 h-4" />
              Q-Table States
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{rlStats?.q_table_states || 0}</div>
            <p className="text-xs text-slate-400">
              Market states learned
            </p>
          </CardContent>
        </Card>

        <Card className="bg-black/40 border-white/10">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Target className="w-4 h-4" />
              Actions Learned
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{rlStats?.q_table_actions || 0}</div>
            <p className="text-xs text-slate-400">
              Signal actions optimized
            </p>
          </CardContent>
        </Card>

        <Card className="bg-black/40 border-white/10">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Win Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-400">
              {rlStats?.recent_performance?.win_rate || 0}%
            </div>
            <p className="text-xs text-slate-400">
              Last 7 days
            </p>
          </CardContent>
        </Card>

        <Card className="bg-black/40 border-white/10">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Activity className="w-4 h-4" />
              Total Signals
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{rlStats?.recent_performance?.total_signals || 0}</div>
            <p className="text-xs text-slate-400">
              Training samples
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="bg-black/40 border-white/10">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Market Regime Detection
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {getRegimeIcon(rlStats?.current_regime)}
                <span className="font-medium">Current Regime</span>
              </div>
              <Badge variant="outline" className={getRegimeColor(rlStats?.current_regime)}>
                {rlStats?.current_regime || 'Unknown'}
              </Badge>
            </div>
            
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Confidence</span>
                <span>{Math.round((rlStats?.regime_confidence || 0) * 100)}%</span>
              </div>
              <Progress 
                value={(rlStats?.regime_confidence || 0) * 100} 
                className="h-2"
              />
            </div>

            <div className="text-sm text-slate-400">
              <p>The RL system automatically detects market conditions to optimize signal generation:</p>
              <ul className="mt-2 space-y-1">
                <li>• <span className="text-green-400">Trending</span>: Strong directional movement</li>
                <li>• <span className="text-blue-400">Ranging</span>: Sideways price action</li>
                <li>• <span className="text-red-400">Volatile</span>: High price fluctuations</li>
                <li>• <span className="text-purple-400">Breakout</span>: Price breaking key levels</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-black/40 border-white/10">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="w-5 h-5" />
              Learning Performance
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-400">
                  {rlStats?.recent_performance?.avg_confidence || 0}%
                </div>
                <p className="text-xs text-slate-400">Avg Confidence</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-400">
                  {rlStats?.recent_performance?.total_signals || 0}
                </div>
                <p className="text-xs text-slate-400">Training Data</p>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="font-medium">How RL Improves Signals:</h4>
              <ul className="text-sm text-slate-400 space-y-1">
                <li>• Learns from each signal outcome (win/loss)</li>
                <li>• Adapts to different market conditions</li>
                <li>• Optimizes confidence levels automatically</li>
                <li>• Filters out low-probability signals</li>
                <li>• Improves accuracy over time</li>
              </ul>
            </div>

            <Button 
              onClick={fetchRLStats} 
              variant="outline" 
              size="sm" 
              className="w-full"
            >
              Refresh RL Stats
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-black/40 border-white/10">
        <CardHeader>
          <CardTitle>Training the RL System</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-slate-300">
              To improve signal accuracy, report the outcomes of your trades. The reinforcement learning system 
              will use this feedback to optimize future signal generation.
            </p>
            
            <div className="bg-slate-800/50 rounded-lg p-4">
              <h4 className="font-medium mb-2">How to Train the System:</h4>
              <ol className="text-sm text-slate-400 space-y-1">
                <li>1. Generate signals and execute trades</li>
                <li>2. After trade expiry, report the outcome (win/loss)</li>
                <li>3. Include the P&L amount for better learning</li>
                <li>4. The system automatically adjusts its strategy</li>
                <li>5. Signal accuracy improves with more training data</li>
              </ol>
            </div>

            <div className="flex items-center gap-2 text-green-400">
              <CheckCircle className="w-4 h-4" />
              <span className="text-sm">
                RL system is active and learning from signal outcomes
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default RLDashboard;

