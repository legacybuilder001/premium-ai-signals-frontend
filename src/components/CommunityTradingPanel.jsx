import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card.jsx';
import { Button } from '@/components/ui/button.jsx';
import { Badge } from '@/components/ui/badge.jsx';
import { Input } from '@/components/ui/input.jsx';
import { Label } from '@/components/ui/label.jsx';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs.jsx';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog.jsx';
import { Switch } from '@/components/ui/switch.jsx';
import { Progress } from '@/components/ui/progress.jsx';
import {
  Users,
  Star,
  TrendingUp,
  TrendingDown,
  Copy,
  Eye,
  Award,
  Crown,
  Target,
  Activity,
  DollarSign,
  UserPlus,
  UserMinus,
  MessageSquare,
  Share2,
  Filter,
  Search,
  Trophy,
  Zap
} from 'lucide-react';

const CommunityTradingPanel = ({ apiBase }) => {
  const [topTraders, setTopTraders] = useState([]);
  const [followedTraders, setFollowedTraders] = useState([]);
  const [communitySignals, setCommunitySignals] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [myProfile, setMyProfile] = useState({
    username: 'TradingPro2024',
    rank: 156,
    followers: 23,
    following: 12,
    winRate: 68.5,
    totalPnL: 1250.75,
    monthlyPnL: 345.20,
    signalsShared: 89,
    reputation: 4.2
  });
  const [copyTradingSettings, setCopyTradingSettings] = useState({
    enabled: false,
    maxCopyAmount: 100,
    maxDailyRisk: 500,
    minConfidence: 70,
    allowedTiers: ['Gold', 'Silver']
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [filterTier, setFilterTier] = useState('all');
  const [loading, setLoading] = useState(true);

  // Fetch community data
  const fetchCommunityData = async () => {
    try {
      setLoading(true);
      
      // In a real implementation, these would be separate API calls
      const [tradersRes, signalsRes, leaderboardRes] = await Promise.all([
        fetch(`${apiBase}/community/top-traders`).catch(() => ({ ok: false })),
        fetch(`${apiBase}/community/signals`).catch(() => ({ ok: false })),
        fetch(`${apiBase}/community/leaderboard`).catch(() => ({ ok: false }))
      ]);

      // Generate mock data for demonstration
      generateMockCommunityData();
      
    } catch (err) {
      console.error('Failed to fetch community data:', err);
      generateMockCommunityData();
    } finally {
      setLoading(false);
    }
  };

  // Generate mock community data
  const generateMockCommunityData = () => {
    // Mock top traders
    const mockTraders = [
      {
        id: 1,
        username: 'SignalMaster',
        avatar: '👑',
        rank: 1,
        winRate: 87.5,
        monthlyPnL: 2450.80,
        followers: 1247,
        tier: 'Gold',
        reputation: 4.9,
        signalsToday: 12,
        isFollowed: false,
        copyEnabled: true,
        specialty: 'Forex & Crypto'
      },
      {
        id: 2,
        username: 'CryptoKing',
        avatar: '🚀',
        rank: 2,
        winRate: 82.3,
        monthlyPnL: 1890.45,
        followers: 892,
        tier: 'Gold',
        reputation: 4.7,
        signalsToday: 8,
        isFollowed: true,
        copyEnabled: true,
        specialty: 'Cryptocurrency'
      },
      {
        id: 3,
        username: 'ForexPro',
        avatar: '💎',
        rank: 3,
        winRate: 79.1,
        monthlyPnL: 1654.20,
        followers: 634,
        tier: 'Silver',
        reputation: 4.5,
        signalsToday: 15,
        isFollowed: false,
        copyEnabled: false,
        specialty: 'Forex Pairs'
      },
      {
        id: 4,
        username: 'StockWizard',
        avatar: '📈',
        rank: 4,
        winRate: 76.8,
        monthlyPnL: 1423.90,
        followers: 567,
        tier: 'Silver',
        reputation: 4.3,
        signalsToday: 6,
        isFollowed: true,
        copyEnabled: true,
        specialty: 'Stock Trading'
      }
    ];

    // Mock community signals
    const mockSignals = [
      {
        id: 1,
        trader: 'SignalMaster',
        asset: 'EURUSD',
        direction: 'CALL',
        confidence: 89.5,
        tier: 'Gold',
        timestamp: new Date(Date.now() - 300000).toISOString(),
        likes: 45,
        comments: 12,
        copies: 89,
        outcome: null,
        reasoning: 'Strong bullish momentum with RSI oversold bounce'
      },
      {
        id: 2,
        trader: 'CryptoKing',
        asset: 'BTCUSD',
        direction: 'PUT',
        confidence: 84.2,
        tier: 'Gold',
        timestamp: new Date(Date.now() - 600000).toISOString(),
        likes: 32,
        comments: 8,
        copies: 67,
        outcome: 'win',
        reasoning: 'Resistance rejection at key level, expecting pullback'
      },
      {
        id: 3,
        trader: 'ForexPro',
        asset: 'GBPUSD',
        direction: 'CALL',
        confidence: 76.3,
        tier: 'Silver',
        timestamp: new Date(Date.now() - 900000).toISOString(),
        likes: 28,
        comments: 5,
        copies: 43,
        outcome: 'win',
        reasoning: 'Brexit news catalyst with technical confluence'
      }
    ];

    // Mock leaderboard
    const mockLeaderboard = mockTraders.map((trader, index) => ({
      ...trader,
      position: index + 1,
      change: Math.floor(Math.random() * 10) - 5 // -5 to +5 position change
    }));

    setTopTraders(mockTraders);
    setCommunitySignals(mockSignals);
    setLeaderboard(mockLeaderboard);
    setFollowedTraders(mockTraders.filter(t => t.isFollowed));
  };

  // Follow/Unfollow trader
  const toggleFollowTrader = async (traderId) => {
    try {
      const trader = topTraders.find(t => t.id === traderId);
      const newFollowStatus = !trader.isFollowed;
      
      // Update local state
      setTopTraders(prev => prev.map(t => 
        t.id === traderId ? { ...t, isFollowed: newFollowStatus } : t
      ));
      
      if (newFollowStatus) {
        setFollowedTraders(prev => [...prev, { ...trader, isFollowed: true }]);
      } else {
        setFollowedTraders(prev => prev.filter(t => t.id !== traderId));
      }

      // In real implementation, make API call
      // await fetch(`${apiBase}/community/follow`, { method: 'POST', body: JSON.stringify({ traderId, follow: newFollowStatus }) });
      
    } catch (err) {
      console.error('Failed to toggle follow:', err);
    }
  };

  // Copy signal
  const copySignal = async (signalId) => {
    try {
      // In real implementation, make API call to copy the signal
      // await fetch(`${apiBase}/community/copy-signal`, { method: 'POST', body: JSON.stringify({ signalId }) });
      
      // Update local state
      setCommunitySignals(prev => prev.map(signal => 
        signal.id === signalId ? { ...signal, copies: signal.copies + 1 } : signal
      ));
      
      alert('Signal copied successfully!');
    } catch (err) {
      console.error('Failed to copy signal:', err);
    }
  };

  // Like signal
  const likeSignal = async (signalId) => {
    try {
      setCommunitySignals(prev => prev.map(signal => 
        signal.id === signalId ? { ...signal, likes: signal.likes + 1 } : signal
      ));
    } catch (err) {
      console.error('Failed to like signal:', err);
    }
  };

  useEffect(() => {
    fetchCommunityData();
    
    // Refresh data every 60 seconds
    const interval = setInterval(fetchCommunityData, 60000);
    return () => clearInterval(interval);
  }, []);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount || 0);
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

  const getRankIcon = (rank) => {
    if (rank === 1) return <Crown className="w-4 h-4 text-yellow-400" />;
    if (rank <= 3) return <Trophy className="w-4 h-4 text-slate-400" />;
    if (rank <= 10) return <Award className="w-4 h-4 text-amber-600" />;
    return <Target className="w-4 h-4 text-slate-500" />;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        <span className="ml-2">Loading Community...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Users className="w-6 h-6 text-blue-400" />
          <h2 className="text-xl font-bold">Community Copy Trading</h2>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="border-green-500/30 text-green-400">
            <Activity className="w-3 h-3 mr-1" />
            {communitySignals.length} Live Signals
          </Badge>
        </div>
      </div>

      <Tabs defaultValue="traders" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="traders">Top Traders</TabsTrigger>
          <TabsTrigger value="signals">Community Signals</TabsTrigger>
          <TabsTrigger value="following">Following</TabsTrigger>
          <TabsTrigger value="settings">Copy Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="traders" className="space-y-4">
          <div className="flex gap-4 mb-4">
            <div className="flex-1">
              <Input
                placeholder="Search traders..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-slate-700 border-slate-600"
              />
            </div>
            <Button variant="outline" size="sm">
              <Filter className="w-4 h-4 mr-2" />
              Filter
            </Button>
          </div>

          <div className="grid gap-4">
            {topTraders.map((trader) => (
              <Card key={trader.id} className="bg-black/40 border-white/10">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="text-2xl">{trader.avatar}</div>
                      <div>
                        <div className="flex items-center gap-2">
                          {getRankIcon(trader.rank)}
                          <span className="font-bold">#{trader.rank}</span>
                          <span className="font-medium">{trader.username}</span>
                          <Badge variant="outline" className={getTierColor(trader.tier)}>
                            {trader.tier}
                          </Badge>
                        </div>
                        <div className="text-sm text-slate-400">
                          {trader.specialty} • {trader.followers} followers
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="text-sm text-slate-400">Win Rate</div>
                        <div className="font-bold text-green-400">{trader.winRate}%</div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-slate-400">Monthly P&L</div>
                        <div className="font-bold text-blue-400">{formatCurrency(trader.monthlyPnL)}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-slate-400">Reputation</div>
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 text-yellow-400 fill-current" />
                          <span className="font-bold">{trader.reputation}</span>
                        </div>
                      </div>
                      
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant={trader.isFollowed ? "secondary" : "default"}
                          onClick={() => toggleFollowTrader(trader.id)}
                        >
                          {trader.isFollowed ? (
                            <>
                              <UserMinus className="w-4 h-4 mr-1" />
                              Unfollow
                            </>
                          ) : (
                            <>
                              <UserPlus className="w-4 h-4 mr-1" />
                              Follow
                            </>
                          )}
                        </Button>
                        
                        {trader.copyEnabled && (
                          <Button size="sm" variant="outline">
                            <Copy className="w-4 h-4 mr-1" />
                            Copy
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-3 pt-3 border-t border-slate-700">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-400">Signals today: {trader.signalsToday}</span>
                      <div className="flex items-center gap-4">
                        <span className="text-slate-400">Copy trading: </span>
                        <Badge variant={trader.copyEnabled ? "default" : "secondary"}>
                          {trader.copyEnabled ? 'Available' : 'Disabled'}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="signals" className="space-y-4">
          <div className="grid gap-4">
            {communitySignals.map((signal) => (
              <Card key={signal.id} className="bg-black/40 border-white/10">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-medium">{signal.trader}</span>
                        <Badge variant="outline" className={getTierColor(signal.tier)}>
                          {signal.tier}
                        </Badge>
                        <span className="text-sm text-slate-400">
                          {new Date(signal.timestamp).toLocaleTimeString()}
                        </span>
                        {signal.outcome && (
                          <Badge variant={signal.outcome === 'win' ? 'default' : 'destructive'}>
                            {signal.outcome === 'win' ? 'Won' : 'Lost'}
                          </Badge>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-4 mb-2">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-lg">{signal.asset}</span>
                          <span className={`font-medium ${signal.direction === 'CALL' ? 'text-green-400' : 'text-red-400'}`}>
                            {signal.direction}
                          </span>
                        </div>
                        <div className="text-sm">
                          <span className="text-slate-400">Confidence: </span>
                          <span className="font-medium text-blue-400">{signal.confidence}%</span>
                        </div>
                      </div>
                      
                      <p className="text-sm text-slate-300 mb-3">{signal.reasoning}</p>
                      
                      <div className="flex items-center gap-4">
                        <Button size="sm" variant="outline" onClick={() => likeSignal(signal.id)}>
                          <Star className="w-4 h-4 mr-1" />
                          {signal.likes}
                        </Button>
                        <Button size="sm" variant="outline">
                          <MessageSquare className="w-4 h-4 mr-1" />
                          {signal.comments}
                        </Button>
                        <Button size="sm" variant="outline">
                          <Share2 className="w-4 h-4 mr-1" />
                          Share
                        </Button>
                      </div>
                    </div>
                    
                    <div className="flex flex-col gap-2">
                      <Button size="sm" onClick={() => copySignal(signal.id)}>
                        <Copy className="w-4 h-4 mr-1" />
                        Copy ({signal.copies})
                      </Button>
                      <Button size="sm" variant="outline">
                        <Eye className="w-4 h-4 mr-1" />
                        Details
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="following" className="space-y-4">
          <div className="grid gap-4">
            {followedTraders.length === 0 ? (
              <Card className="bg-black/40 border-white/10">
                <CardContent className="p-8 text-center">
                  <Users className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">No Traders Followed</h3>
                  <p className="text-slate-400 mb-4">
                    Start following top traders to see their signals and copy their trades
                  </p>
                  <Button onClick={() => document.querySelector('[value="traders"]').click()}>
                    Browse Top Traders
                  </Button>
                </CardContent>
              </Card>
            ) : (
              followedTraders.map((trader) => (
                <Card key={trader.id} className="bg-black/40 border-white/10">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="text-xl">{trader.avatar}</div>
                        <div>
                          <div className="font-medium">{trader.username}</div>
                          <div className="text-sm text-slate-400">
                            Win Rate: {trader.winRate}% • Monthly: {formatCurrency(trader.monthlyPnL)}
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline">
                          <Eye className="w-4 h-4 mr-1" />
                          View Profile
                        </Button>
                        <Button 
                          size="sm" 
                          variant="secondary"
                          onClick={() => toggleFollowTrader(trader.id)}
                        >
                          <UserMinus className="w-4 h-4 mr-1" />
                          Unfollow
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <Card className="bg-black/40 border-white/10">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Copy className="w-5 h-5" />
                Copy Trading Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-base">Enable Copy Trading</Label>
                  <p className="text-sm text-slate-400">Automatically copy signals from followed traders</p>
                </div>
                <Switch
                  checked={copyTradingSettings.enabled}
                  onCheckedChange={(checked) => 
                    setCopyTradingSettings(prev => ({ ...prev, enabled: checked }))
                  }
                />
              </div>

              {copyTradingSettings.enabled && (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label>Max Copy Amount ($)</Label>
                      <Input
                        type="number"
                        value={copyTradingSettings.maxCopyAmount}
                        onChange={(e) => setCopyTradingSettings(prev => ({ 
                          ...prev, 
                          maxCopyAmount: parseFloat(e.target.value) 
                        }))}
                        className="bg-slate-700 border-slate-600"
                      />
                    </div>
                    <div>
                      <Label>Max Daily Risk ($)</Label>
                      <Input
                        type="number"
                        value={copyTradingSettings.maxDailyRisk}
                        onChange={(e) => setCopyTradingSettings(prev => ({ 
                          ...prev, 
                          maxDailyRisk: parseFloat(e.target.value) 
                        }))}
                        className="bg-slate-700 border-slate-600"
                      />
                    </div>
                    <div>
                      <Label>Min Confidence (%)</Label>
                      <Input
                        type="number"
                        value={copyTradingSettings.minConfidence}
                        onChange={(e) => setCopyTradingSettings(prev => ({ 
                          ...prev, 
                          minConfidence: parseFloat(e.target.value) 
                        }))}
                        className="bg-slate-700 border-slate-600"
                      />
                    </div>
                  </div>

                  <div>
                    <Label>Allowed Signal Tiers</Label>
                    <div className="flex gap-2 mt-2">
                      {['Gold', 'Silver', 'Bronze'].map((tier) => (
                        <Button
                          key={tier}
                          size="sm"
                          variant={copyTradingSettings.allowedTiers.includes(tier) ? "default" : "outline"}
                          onClick={() => {
                            setCopyTradingSettings(prev => ({
                              ...prev,
                              allowedTiers: prev.allowedTiers.includes(tier)
                                ? prev.allowedTiers.filter(t => t !== tier)
                                : [...prev.allowedTiers, tier]
                            }));
                          }}
                        >
                          {tier}
                        </Button>
                      ))}
                    </div>
                  </div>

                  <Button className="w-full">
                    Save Copy Trading Settings
                  </Button>
                </>
              )}
            </CardContent>
          </Card>

          <Card className="bg-black/40 border-white/10">
            <CardHeader>
              <CardTitle>My Trading Profile</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-400">#{myProfile.rank}</div>
                  <div className="text-sm text-slate-400">Rank</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-400">{myProfile.winRate}%</div>
                  <div className="text-sm text-slate-400">Win Rate</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-400">{myProfile.followers}</div>
                  <div className="text-sm text-slate-400">Followers</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-yellow-400">{myProfile.reputation}</div>
                  <div className="text-sm text-slate-400">Reputation</div>
                </div>
              </div>
              
              <div className="pt-4 border-t border-slate-700">
                <div className="flex justify-between items-center">
                  <span>Share my signals publicly</span>
                  <Switch defaultChecked />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CommunityTradingPanel;

