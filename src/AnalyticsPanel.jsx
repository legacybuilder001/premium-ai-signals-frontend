import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card.jsx';
import { Button } from '@/components/ui/button.jsx';
import { Badge } from '@/components/ui/badge.jsx';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs.jsx';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select.jsx';
import { Slider } from '@/components/ui/slider.jsx';
import { Label } from '@/components/ui/label.jsx';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  RotateCcw,
  Eye,
  TrendingUp,
  TrendingDown,
  Target,
  Activity,
  BarChart3,
  Map,
  Clock,
  Calendar,
  Zap,
  AlertTriangle,
  CheckCircle,
  XCircle,
  PlayCircle,
  StopCircle
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ScatterChart, Scatter, Cell } from 'recharts';

const AnalyticsPanel = ({ apiBase }) => {
  const [selectedReplay, setSelectedReplay] = useState(null);
  const [replayData, setReplayData] = useState([]);
  const [heatmapData, setHeatmapData] = useState([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [selectedTimeframe, setSelectedTimeframe] = useState('1h');
  const [selectedAsset, setSelectedAsset] = useState('EURUSD');
  const [heatmapType, setHeatmapType] = useState('accuracy');
  const [loading, setLoading] = useState(true);

  // Mock replay sessions
  const replaySessions = [
    {
      id: 1,
      title: 'EURUSD Gold Signal - 89% Confidence Win',
      asset: 'EURUSD',
      date: '2024-09-22',
      time: '14:30',
      outcome: 'win',
      confidence: 89.5,
      pnl: 45.20,
      duration: '5m',
      tier: 'Gold',
      pattern: 'Bullish Engulfing'
    },
    {
      id: 2,
      title: 'BTCUSD Silver Signal - Resistance Rejection',
      asset: 'BTCUSD',
      date: '2024-09-22',
      time: '13:15',
      outcome: 'loss',
      confidence: 76.3,
      pnl: -25.00,
      duration: '1m',
      tier: 'Silver',
      pattern: 'Resistance Test'
    },
    {
      id: 3,
      title: 'AAPL Stock Signal - Earnings Play',
      asset: 'AAPL',
      date: '2024-09-22',
      time: '12:00',
      outcome: 'win',
      confidence: 82.1,
      pnl: 67.50,
      duration: '5m',
      tier: 'Gold',
      pattern: 'Earnings Gap'
    }
  ];

  // Generate mock replay data
  const generateReplayData = (sessionId) => {
    const steps = [];
    const basePrice = 1.0850;
    
    for (let i = 0; i <= 60; i++) {
      const price = basePrice + (Math.sin(i * 0.1) * 0.002) + (Math.random() - 0.5) * 0.0005;
      const rsi = 50 + Math.sin(i * 0.15) * 20 + (Math.random() - 0.5) * 10;
      const volume = 1000 + Math.random() * 500;
      
      steps.push({
        step: i,
        time: `14:${30 + Math.floor(i / 12)}:${(i % 12) * 5}`,
        price: Math.round(price * 100000) / 100000,
        rsi: Math.round(rsi * 10) / 10,
        volume: Math.round(volume),
        macd: Math.sin(i * 0.08) * 0.001,
        signal_confidence: i < 30 ? 65 + i : 95 - (i - 30) * 0.5,
        annotations: getStepAnnotations(i),
        indicators: {
          support: basePrice - 0.001,
          resistance: basePrice + 0.0015,
          ma20: price - 0.0003,
          ma50: price - 0.0008
        }
      });
    }
    
    return steps;
  };

  const getStepAnnotations = (step) => {
    const annotations = [];
    
    if (step === 15) {
      annotations.push({
        type: 'pattern',
        text: 'Bullish engulfing pattern forming',
        color: 'green'
      });
    }
    
    if (step === 25) {
      annotations.push({
        type: 'signal',
        text: 'Signal generated: CALL at 89.5% confidence',
        color: 'blue'
      });
    }
    
    if (step === 35) {
      annotations.push({
        type: 'confirmation',
        text: 'Price breaks resistance - signal confirmed',
        color: 'green'
      });
    }
    
    if (step === 50) {
      annotations.push({
        type: 'outcome',
        text: 'Signal expires ITM - WIN (+$45.20)',
        color: 'green'
      });
    }
    
    return annotations;
  };

  // Generate heatmap data
  const generateHeatmapData = () => {
    const assets = ['EURUSD', 'GBPUSD', 'AUDUSD', 'USDJPY', 'BTCUSD', 'ETHUSD', 'AAPL', 'TSLA'];
    const hours = Array.from({ length: 24 }, (_, i) => i);
    const data = [];
    
    assets.forEach((asset, assetIndex) => {
      hours.forEach((hour) => {
        let value;
        if (heatmapType === 'accuracy') {
          // Higher accuracy during market hours
          value = hour >= 8 && hour <= 16 ? 70 + Math.random() * 25 : 50 + Math.random() * 30;
        } else if (heatmapType === 'volume') {
          // Higher volume during market hours
          value = hour >= 8 && hour <= 16 ? 80 + Math.random() * 20 : 20 + Math.random() * 40;
        } else {
          // Volatility varies by asset and time
          value = 30 + Math.random() * 70;
        }
        
        data.push({
          asset,
          hour,
          value: Math.round(value * 10) / 10,
          x: hour,
          y: assetIndex,
          color: getHeatmapColor(value)
        });
      });
    });
    
    return data;
  };

  const getHeatmapColor = (value) => {
    if (value >= 80) return '#10B981'; // Green
    if (value >= 60) return '#F59E0B'; // Yellow
    if (value >= 40) return '#EF4444'; // Red
    return '#6B7280'; // Gray
  };

  // Playback controls
  const playReplay = () => {
    if (!selectedReplay) return;
    
    setIsPlaying(true);
    const interval = setInterval(() => {
      setCurrentStep(prev => {
        if (prev >= replayData.length - 1) {
          setIsPlaying(false);
          clearInterval(interval);
          return prev;
        }
        return prev + 1;
      });
    }, 1000 / playbackSpeed);
  };

  const pauseReplay = () => {
    setIsPlaying(false);
  };

  const resetReplay = () => {
    setCurrentStep(0);
    setIsPlaying(false);
  };

  const skipToStep = (step) => {
    setCurrentStep(Math.max(0, Math.min(step, replayData.length - 1)));
  };

  useEffect(() => {
    // Generate initial data
    setHeatmapData(generateHeatmapData());
    setLoading(false);
  }, [heatmapType]);

  useEffect(() => {
    if (selectedReplay) {
      setReplayData(generateReplayData(selectedReplay.id));
      setCurrentStep(0);
      setIsPlaying(false);
    }
  }, [selectedReplay]);

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

  const currentStepData = replayData[currentStep];

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        <span className="ml-2">Loading Analytics...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <BarChart3 className="w-6 h-6 text-blue-400" />
        <h2 className="text-xl font-bold">Advanced Analytics & Replays</h2>
      </div>

      <Tabs defaultValue="replays" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="replays">Annotated Replays</TabsTrigger>
          <TabsTrigger value="heatmaps">Heatmap Analysis</TabsTrigger>
        </TabsList>

        <TabsContent value="replays" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Replay Selection */}
            <Card className="bg-black/40 border-white/10">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PlayCircle className="w-5 h-5" />
                  Replay Sessions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {replaySessions.map((session) => (
                  <div
                    key={session.id}
                    className={`p-3 rounded-lg cursor-pointer transition-colors ${
                      selectedReplay?.id === session.id
                        ? 'bg-blue-500/20 border border-blue-500/30'
                        : 'bg-slate-800/50 hover:bg-slate-700/50'
                    }`}
                    onClick={() => setSelectedReplay(session)}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <Badge variant="outline" className={getTierColor(session.tier)}>
                        {session.tier}
                      </Badge>
                      <div className="flex items-center gap-1">
                        {session.outcome === 'win' ? (
                          <CheckCircle className="w-4 h-4 text-green-400" />
                        ) : (
                          <XCircle className="w-4 h-4 text-red-400" />
                        )}
                        <span className={`text-sm font-medium ${
                          session.outcome === 'win' ? 'text-green-400' : 'text-red-400'
                        }`}>
                          {formatCurrency(session.pnl)}
                        </span>
                      </div>
                    </div>
                    <div className="text-sm font-medium mb-1">{session.asset}</div>
                    <div className="text-xs text-slate-400">
                      {session.date} {session.time} • {session.confidence}% • {session.pattern}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Replay Player */}
            <div className="lg:col-span-2 space-y-4">
              {selectedReplay ? (
                <>
                  <Card className="bg-black/40 border-white/10">
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        <span>{selectedReplay.title}</span>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className={getTierColor(selectedReplay.tier)}>
                            {selectedReplay.tier}
                          </Badge>
                          <Badge variant={selectedReplay.outcome === 'win' ? 'default' : 'destructive'}>
                            {selectedReplay.outcome === 'win' ? 'WIN' : 'LOSS'}
                          </Badge>
                        </div>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {/* Price Chart */}
                      <div className="h-64 mb-4">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={replayData.slice(0, currentStep + 1)}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                            <XAxis dataKey="time" stroke="#9CA3AF" />
                            <YAxis stroke="#9CA3AF" domain={['dataMin - 0.001', 'dataMax + 0.001']} />
                            <Tooltip 
                              contentStyle={{ 
                                backgroundColor: '#1F2937', 
                                border: '1px solid #374151',
                                borderRadius: '8px'
                              }}
                            />
                            <Line 
                              type="monotone" 
                              dataKey="price" 
                              stroke="#3B82F6" 
                              strokeWidth={2}
                              dot={false}
                            />
                            {currentStepData?.indicators && (
                              <>
                                <Line 
                                  type="monotone" 
                                  dataKey="indicators.support" 
                                  stroke="#EF4444" 
                                  strokeDasharray="5 5"
                                  dot={false}
                                />
                                <Line 
                                  type="monotone" 
                                  dataKey="indicators.resistance" 
                                  stroke="#10B981" 
                                  strokeDasharray="5 5"
                                  dot={false}
                                />
                              </>
                            )}
                          </LineChart>
                        </ResponsiveContainer>
                      </div>

                      {/* Playback Controls */}
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                          <Button size="sm" onClick={resetReplay}>
                            <RotateCcw className="w-4 h-4" />
                          </Button>
                          <Button size="sm" onClick={() => skipToStep(currentStep - 10)}>
                            <SkipBack className="w-4 h-4" />
                          </Button>
                          <Button size="sm" onClick={isPlaying ? pauseReplay : playReplay}>
                            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                          </Button>
                          <Button size="sm" onClick={() => skipToStep(currentStep + 10)}>
                            <SkipForward className="w-4 h-4" />
                          </Button>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <Label className="text-sm">Speed:</Label>
                          <Select value={playbackSpeed.toString()} onValueChange={(v) => setPlaybackSpeed(parseFloat(v))}>
                            <SelectTrigger className="w-20 bg-slate-700 border-slate-600">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="0.5">0.5x</SelectItem>
                              <SelectItem value="1">1x</SelectItem>
                              <SelectItem value="2">2x</SelectItem>
                              <SelectItem value="4">4x</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      {/* Progress Slider */}
                      <div className="mb-4">
                        <Slider
                          value={[currentStep]}
                          onValueChange={([value]) => skipToStep(value)}
                          max={replayData.length - 1}
                          step={1}
                          className="w-full"
                        />
                        <div className="flex justify-between text-xs text-slate-400 mt-1">
                          <span>Step {currentStep + 1} of {replayData.length}</span>
                          <span>{currentStepData?.time}</span>
                        </div>
                      </div>

                      {/* Current Step Info */}
                      {currentStepData && (
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                          <div className="text-center">
                            <div className="text-sm text-slate-400">Price</div>
                            <div className="font-bold">{currentStepData.price}</div>
                          </div>
                          <div className="text-center">
                            <div className="text-sm text-slate-400">RSI</div>
                            <div className="font-bold">{currentStepData.rsi}</div>
                          </div>
                          <div className="text-center">
                            <div className="text-sm text-slate-400">Confidence</div>
                            <div className="font-bold text-blue-400">{Math.round(currentStepData.signal_confidence)}%</div>
                          </div>
                          <div className="text-center">
                            <div className="text-sm text-slate-400">Volume</div>
                            <div className="font-bold">{currentStepData.volume}</div>
                          </div>
                        </div>
                      )}

                      {/* Annotations */}
                      {currentStepData?.annotations && currentStepData.annotations.length > 0 && (
                        <div className="space-y-2">
                          <h4 className="font-medium">Step Annotations:</h4>
                          {currentStepData.annotations.map((annotation, index) => (
                            <div
                              key={index}
                              className={`p-2 rounded text-sm border ${
                                annotation.color === 'green' 
                                  ? 'bg-green-500/10 border-green-500/30 text-green-400'
                                  : annotation.color === 'blue'
                                  ? 'bg-blue-500/10 border-blue-500/30 text-blue-400'
                                  : 'bg-slate-500/10 border-slate-500/30 text-slate-300'
                              }`}
                            >
                              <div className="flex items-center gap-2">
                                {annotation.type === 'signal' && <Zap className="w-4 h-4" />}
                                {annotation.type === 'pattern' && <Target className="w-4 h-4" />}
                                {annotation.type === 'confirmation' && <CheckCircle className="w-4 h-4" />}
                                {annotation.type === 'outcome' && <TrendingUp className="w-4 h-4" />}
                                <span>{annotation.text}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </>
              ) : (
                <Card className="bg-black/40 border-white/10">
                  <CardContent className="p-8 text-center">
                    <PlayCircle className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">Select a Replay Session</h3>
                    <p className="text-slate-400">
                      Choose a trading session from the left to view the annotated replay
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="heatmaps" className="space-y-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <div>
                <Label>Heatmap Type</Label>
                <Select value={heatmapType} onValueChange={setHeatmapType}>
                  <SelectTrigger className="w-40 bg-slate-700 border-slate-600">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="accuracy">Signal Accuracy</SelectItem>
                    <SelectItem value="volume">Trading Volume</SelectItem>
                    <SelectItem value="volatility">Market Volatility</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Timeframe</Label>
                <Select value={selectedTimeframe} onValueChange={setSelectedTimeframe}>
                  <SelectTrigger className="w-32 bg-slate-700 border-slate-600">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1h">1 Hour</SelectItem>
                    <SelectItem value="4h">4 Hours</SelectItem>
                    <SelectItem value="1d">1 Day</SelectItem>
                    <SelectItem value="1w">1 Week</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <Card className="bg-black/40 border-white/10">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Map className="w-5 h-5" />
                {heatmapType === 'accuracy' ? 'Signal Accuracy' : 
                 heatmapType === 'volume' ? 'Trading Volume' : 'Market Volatility'} Heatmap
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-96">
                <ResponsiveContainer width="100%" height="100%">
                  <ScatterChart data={heatmapData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis 
                      type="number" 
                      dataKey="x" 
                      domain={[0, 23]}
                      tickFormatter={(value) => `${value}:00`}
                      stroke="#9CA3AF"
                    />
                    <YAxis 
                      type="number" 
                      dataKey="y" 
                      domain={[0, 7]}
                      tickFormatter={(value) => {
                        const assets = ['EURUSD', 'GBPUSD', 'AUDUSD', 'USDJPY', 'BTCUSD', 'ETHUSD', 'AAPL', 'TSLA'];
                        return assets[value] || '';
                      }}
                      stroke="#9CA3AF"
                    />
                    <Tooltip 
                      formatter={(value, name, props) => [
                        `${Math.round(value)}${heatmapType === 'accuracy' ? '%' : ''}`,
                        heatmapType === 'accuracy' ? 'Accuracy' : 
                        heatmapType === 'volume' ? 'Volume' : 'Volatility'
                      ]}
                      labelFormatter={(label, payload) => {
                        if (payload && payload[0]) {
                          const assets = ['EURUSD', 'GBPUSD', 'AUDUSD', 'USDJPY', 'BTCUSD', 'ETHUSD', 'AAPL', 'TSLA'];
                          return `${assets[payload[0].payload.y]} at ${payload[0].payload.x}:00`;
                        }
                        return '';
                      }}
                      contentStyle={{ 
                        backgroundColor: '#1F2937', 
                        border: '1px solid #374151',
                        borderRadius: '8px'
                      }}
                    />
                    <Scatter dataKey="value">
                      {heatmapData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Scatter>
                  </ScatterChart>
                </ResponsiveContainer>
              </div>
              
              <div className="mt-4 flex items-center justify-center gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-red-500 rounded"></div>
                  <span className="text-sm">Low</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-yellow-500 rounded"></div>
                  <span className="text-sm">Medium</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-green-500 rounded"></div>
                  <span className="text-sm">High</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="bg-black/40 border-white/10">
              <CardHeader>
                <CardTitle className="text-sm">Peak Performance Hours</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">08:00 - 12:00</span>
                    <span className="text-green-400 font-medium">85%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">13:00 - 17:00</span>
                    <span className="text-green-400 font-medium">82%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">18:00 - 22:00</span>
                    <span className="text-yellow-400 font-medium">68%</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-black/40 border-white/10">
              <CardHeader>
                <CardTitle className="text-sm">Best Performing Assets</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">EURUSD</span>
                    <span className="text-green-400 font-medium">89%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">AAPL</span>
                    <span className="text-green-400 font-medium">84%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">BTCUSD</span>
                    <span className="text-yellow-400 font-medium">76%</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-black/40 border-white/10">
              <CardHeader>
                <CardTitle className="text-sm">Market Insights</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-green-400">
                    <CheckCircle className="w-4 h-4" />
                    <span>High accuracy during London session</span>
                  </div>
                  <div className="flex items-center gap-2 text-yellow-400">
                    <AlertTriangle className="w-4 h-4" />
                    <span>Reduced performance after 20:00</span>
                  </div>
                  <div className="flex items-center gap-2 text-blue-400">
                    <Activity className="w-4 h-4" />
                    <span>Crypto signals peak at 14:00-16:00</span>
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

export default AnalyticsPanel;

