import React, { useEffect, useRef, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card.jsx';
import { Badge } from '@/components/ui/badge.jsx';
import { Button } from '@/components/ui/button.jsx';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select.jsx';
import { BarChart3, TrendingUp, TrendingDown, Target, Zap } from 'lucide-react';

const TradingViewChart = ({ 
  selectedAsset, 
  selectedTimeframe, 
  signal, 
  onSymbolChange,
  onTimeframeChange 
}) => {
  const containerRef = useRef(null);
  const widgetRef = useRef(null);
  const [isLoading, setIsLoading] = useState(true);
  const [chartReady, setChartReady] = useState(false);

  // Symbol mapping for TradingView
  const getSymbolMapping = (asset) => {
    const symbolMap = {
      'EURUSD': 'FX:EURUSD',
      'GBPUSD': 'FX:GBPUSD', 
      'USDJPY': 'FX:USDJPY',
      'AUDUSD': 'FX:AUDUSD',
      'USDCAD': 'FX:USDCAD',
      'USDCHF': 'FX:USDCHF',
      'NZDUSD': 'FX:NZDUSD',
      'EURGBP': 'FX:EURGBP',
      'EURJPY': 'FX:EURJPY',
      'GBPJPY': 'FX:GBPJPY',
      'BTCUSD': 'BINANCE:BTCUSDT',
      'ETHUSD': 'BINANCE:ETHUSDT',
      'XAUUSD': 'TVC:GOLD',
      'XAGUSD': 'TVC:SILVER',
      'CRUDE': 'TVC:USOIL',
      'SPX500': 'TVC:SPX',
      'NAS100': 'TVC:NDX',
      'US30': 'TVC:DJI'
    };
    return symbolMap[asset] || `FX:${asset}`;
  };

  // Timeframe mapping
  const getTimeframeMapping = (timeframe) => {
    const timeframeMap = {
      '1m': '1',
      '5m': '5', 
      '15m': '15',
      '30m': '30',
      '1h': '60',
      '4h': '240',
      '1d': 'D'
    };
    return timeframeMap[timeframe] || '1';
  };

  // Initialize TradingView widget
  useEffect(() => {
    if (!containerRef.current) return;

    setIsLoading(true);
    setChartReady(false);

    // Clear existing widget
    if (widgetRef.current) {
      containerRef.current.innerHTML = '';
      widgetRef.current = null;
    }

    // Create new widget container
    const widgetContainer = document.createElement('div');
    widgetContainer.className = 'tradingview-widget-container';
    widgetContainer.style.height = '100%';
    widgetContainer.style.width = '100%';

    const widgetDiv = document.createElement('div');
    widgetDiv.className = 'tradingview-widget-container__widget';
    widgetDiv.style.height = 'calc(100% - 32px)';
    widgetDiv.style.width = '100%';

    const copyrightDiv = document.createElement('div');
    copyrightDiv.className = 'tradingview-widget-copyright';
    copyrightDiv.innerHTML = `
      <a href="https://www.tradingview.com/symbols/${getSymbolMapping(selectedAsset).replace(':', '-')}/" 
         rel="noopener nofollow" target="_blank">
        <span class="blue-text">${selectedAsset} chart</span>
      </a>
      <span class="trademark"> by TradingView</span>
    `;

    widgetContainer.appendChild(widgetDiv);
    widgetContainer.appendChild(copyrightDiv);
    containerRef.current.appendChild(widgetContainer);

    // Create and configure script
    const script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js';
    script.async = true;

    const config = {
      autosize: true,
      symbol: getSymbolMapping(selectedAsset),
      interval: getTimeframeMapping(selectedTimeframe),
      timezone: 'Etc/UTC',
      theme: 'dark',
      style: '1',
      locale: 'en',
      enable_publishing: false,
      backgroundColor: '#0F0F0F',
      gridColor: 'rgba(242, 242, 242, 0.06)',
      hide_top_toolbar: false,
      hide_legend: false,
      hide_side_toolbar: false,
      hide_volume: false,
      allow_symbol_change: true,
      save_image: true,
      calendar: false,
      support_host: 'https://www.tradingview.com',
      // Enhanced features for pattern analysis
      studies: [
        'RSI@tv-basicstudies',
        'MACD@tv-basicstudies',
        'StochasticRSI@tv-basicstudies'
      ],
      // Drawing tools for pattern overlays
      drawings_access: {
        type: 'black',
        tools: [
          { name: 'LineToolTrendLine' },
          { name: 'LineToolHorzLine' },
          { name: 'LineToolVertLine' },
          { name: 'LineToolRectangle' },
          { name: 'LineToolCircle' },
          { name: 'LineToolArrow' }
        ]
      },
      // Custom styling
      overrides: {
        'paneProperties.background': '#0F0F0F',
        'paneProperties.vertGridProperties.color': 'rgba(242, 242, 242, 0.06)',
        'paneProperties.horzGridProperties.color': 'rgba(242, 242, 242, 0.06)',
        'symbolWatermarkProperties.transparency': 90,
        'scalesProperties.textColor': '#AAA',
        'mainSeriesProperties.candleStyle.upColor': '#00C851',
        'mainSeriesProperties.candleStyle.downColor': '#FF4444',
        'mainSeriesProperties.candleStyle.drawWick': true,
        'mainSeriesProperties.candleStyle.drawBorder': true,
        'mainSeriesProperties.candleStyle.borderColor': '#378658',
        'mainSeriesProperties.candleStyle.borderUpColor': '#00C851',
        'mainSeriesProperties.candleStyle.borderDownColor': '#FF4444',
        'mainSeriesProperties.candleStyle.wickUpColor': '#00C851',
        'mainSeriesProperties.candleStyle.wickDownColor': '#FF4444'
      }
    };

    script.innerHTML = JSON.stringify(config);
    widgetDiv.appendChild(script);

    // Set loading timeout
    const loadingTimeout = setTimeout(() => {
      setIsLoading(false);
      setChartReady(true);
    }, 3000);

    widgetRef.current = widgetContainer;

    return () => {
      clearTimeout(loadingTimeout);
      if (containerRef.current) {
        containerRef.current.innerHTML = '';
      }
    };
  }, [selectedAsset, selectedTimeframe]);

  // Add signal overlay when signal changes
  useEffect(() => {
    if (!signal || !chartReady) return;

    // This would integrate with TradingView's API to add overlays
    // For now, we'll show signal info in the UI
    console.log('Signal overlay:', signal);
  }, [signal, chartReady]);

  const timeframes = [
    { value: '1m', label: '1 Minute' },
    { value: '5m', label: '5 Minutes' },
    { value: '15m', label: '15 Minutes' },
    { value: '30m', label: '30 Minutes' },
    { value: '1h', label: '1 Hour' },
    { value: '4h', label: '4 Hours' },
    { value: '1d', label: '1 Day' }
  ];

  const assets = [
    { value: 'EURUSD', label: 'EUR/USD' },
    { value: 'GBPUSD', label: 'GBP/USD' },
    { value: 'USDJPY', label: 'USD/JPY' },
    { value: 'AUDUSD', label: 'AUD/USD' },
    { value: 'USDCAD', label: 'USD/CAD' },
    { value: 'USDCHF', label: 'USD/CHF' },
    { value: 'NZDUSD', label: 'NZD/USD' },
    { value: 'EURGBP', label: 'EUR/GBP' },
    { value: 'BTCUSD', label: 'BTC/USD' },
    { value: 'ETHUSD', label: 'ETH/USD' },
    { value: 'XAUUSD', label: 'Gold' },
    { value: 'XAGUSD', label: 'Silver' },
    { value: 'CRUDE', label: 'Crude Oil' },
    { value: 'SPX500', label: 'S&P 500' },
    { value: 'NAS100', label: 'NASDAQ' },
    { value: 'US30', label: 'Dow Jones' }
  ];

  return (
    <Card className="bg-gray-900 border-gray-700">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center text-white">
            <BarChart3 className="w-5 h-5 mr-2" />
            Live Chart - {selectedAsset}
          </CardTitle>
          
          {/* Chart Controls */}
          <div className="flex items-center space-x-2">
            <Select value={selectedAsset} onValueChange={onSymbolChange}>
              <SelectTrigger className="w-32 bg-gray-800 border-gray-600 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-600">
                {assets.map(asset => (
                  <SelectItem key={asset.value} value={asset.value} className="text-white hover:bg-gray-700">
                    {asset.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedTimeframe} onValueChange={onTimeframeChange}>
              <SelectTrigger className="w-28 bg-gray-800 border-gray-600 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-600">
                {timeframes.map(tf => (
                  <SelectItem key={tf.value} value={tf.value} className="text-white hover:bg-gray-700">
                    {tf.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Signal Overlay Info */}
        {signal && (
          <div className="mt-3 p-3 bg-gray-800 rounded-lg border border-gray-600">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Badge 
                  variant={signal.tier === 'Gold' ? 'default' : signal.tier === 'Silver' ? 'secondary' : 'outline'}
                  className={`
                    ${signal.tier === 'Gold' ? 'bg-yellow-500 text-black' : ''}
                    ${signal.tier === 'Silver' ? 'bg-gray-400 text-black' : ''}
                    ${signal.tier === 'Bronze' ? 'bg-amber-600 text-white' : ''}
                  `}
                >
                  {signal.tier}
                </Badge>
                
                <div className="flex items-center space-x-2">
                  {signal.direction === 'CALL' ? (
                    <TrendingUp className="w-4 h-4 text-green-500" />
                  ) : (
                    <TrendingDown className="w-4 h-4 text-red-500" />
                  )}
                  <span className={`font-semibold ${signal.direction === 'CALL' ? 'text-green-500' : 'text-red-500'}`}>
                    {signal.direction}
                  </span>
                </div>

                <div className="flex items-center space-x-1">
                  <Target className="w-4 h-4 text-blue-400" />
                  <span className="text-blue-400 font-medium">{signal.confidence.toFixed(1)}%</span>
                </div>
              </div>

              <div className="flex items-center space-x-2 text-sm text-gray-400">
                <span>Pattern: {signal.pattern}</span>
                <span>•</span>
                <span>Price: {signal.price.toFixed(5)}</span>
              </div>
            </div>

            {/* Pattern Analysis */}
            <div className="mt-2 text-xs text-gray-400">
              <div className="flex items-center space-x-4">
                <span>RSI: {signal.technical?.rsi?.toFixed(1) || 'N/A'}</span>
                <span>MACD: {signal.technical?.macd?.toFixed(4) || 'N/A'}</span>
                <span>Sentiment: {signal.sentiment?.label || 'Neutral'}</span>
                <span>Regime: {signal.regime || 'Unknown'}</span>
              </div>
            </div>
          </div>
        )}
      </CardHeader>

      <CardContent className="p-0">
        <div className="relative h-[500px] w-full">
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-900 bg-opacity-75 z-10">
              <div className="flex items-center space-x-2 text-white">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
                <span>Loading chart...</span>
              </div>
            </div>
          )}
          
          <div 
            ref={containerRef} 
            className="h-full w-full"
            style={{ minHeight: '500px' }}
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default TradingViewChart;

