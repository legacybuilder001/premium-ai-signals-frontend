import React, { useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card.jsx';
import { BarChart3 } from 'lucide-react';

const SimpleTradingView = ({ selectedAsset, selectedTimeframe, signal }) => {
  const containerRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Clear existing content
    containerRef.current.innerHTML = '';

    // Create TradingView widget
    const script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js';
    script.async = true;

    const config = {
      autosize: true,
      symbol: `FX:${selectedAsset}`,
      interval: selectedTimeframe === '1m' ? '1' : '5',
      timezone: 'Etc/UTC',
      theme: 'dark',
      style: '1',
      locale: 'en',
      enable_publishing: false,
      backgroundColor: '#0F0F0F',
      gridColor: 'rgba(242, 242, 242, 0.06)',
      hide_top_toolbar: false,
      hide_legend: false,
      hide_side_toolbar: true,
      hide_volume: false,
      allow_symbol_change: true,
      save_image: false,
      calendar: false,
      support_host: 'https://www.tradingview.com'
    };

    script.innerHTML = JSON.stringify(config);
    containerRef.current.appendChild(script);

    return () => {
      if (containerRef.current) {
        containerRef.current.innerHTML = '';
      }
    };
  }, [selectedAsset, selectedTimeframe]);

  return (
    <Card className="bg-gray-900 border-gray-700">
      <CardHeader>
        <CardTitle className="flex items-center text-white">
          <BarChart3 className="w-5 h-5 mr-2" />
          Live Chart - {selectedAsset}
        </CardTitle>
        {signal && (
          <div className="text-sm text-gray-400">
            Signal: {signal.direction} | Confidence: {signal.confidence?.toFixed(1)}% | Tier: {signal.tier}
          </div>
        )}
      </CardHeader>
      <CardContent className="p-0">
        <div 
          ref={containerRef} 
          className="h-[500px] w-full"
          style={{ minHeight: '500px' }}
        />
      </CardContent>
    </Card>
  );
};

export default SimpleTradingView;

