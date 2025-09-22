import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card.jsx';
import { Button } from '@/components/ui/button.jsx';
import { Input } from '@/components/ui/input.jsx';
import { Label } from '@/components/ui/label.jsx';
import { Switch } from '@/components/ui/switch.jsx';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select.jsx';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs.jsx';
import { Badge } from '@/components/ui/badge.jsx';
import { 
  Settings, 
  Send, 
  Shield, 
  Bell, 
  Database, 
  TrendingUp, 
  AlertTriangle,
  CheckCircle,
  XCircle,
  Key,
  Bot
} from 'lucide-react';

const SettingsPanel = ({ 
  isOpen, 
  onClose, 
  apiBase,
  // Telegram settings
  telegramToken,
  setTelegramToken,
  telegramChatId,
  setTelegramChatId,
  // Notification settings
  notificationSettings,
  setNotificationSettings,
  // Risk management settings
  riskSettings,
  setRiskSettings,
  // API settings
  apiSettings,
  setApiSettings
}) => {
  const [activeTab, setActiveTab] = useState('telegram');
  const [testResults, setTestResults] = useState({});
  const [loading, setLoading] = useState({});

  // Default settings
  const defaultNotificationSettings = {
    enableTelegram: true,
    enableBrowser: true,
    enableSound: false,
    goldSignalsOnly: false,
    minConfidence: 70,
    ...notificationSettings
  };

  const defaultRiskSettings = {
    maxDailyLoss: 5.0,
    maxConsecutiveLosses: 3,
    cooldownPeriod: 60,
    autoStopLoss: true,
    riskPerTrade: 2.0,
    ...riskSettings
  };

  const defaultApiSettings = {
    polygonEnabled: true,
    alphaVantageEnabled: true,
    newsEnabled: true,
    sentimentAnalysis: true,
    realTimeData: true,
    ...apiSettings
  };

  // Test Telegram connection
  const testTelegram = async () => {
    if (!telegramToken || !telegramChatId) {
      setTestResults(prev => ({ ...prev, telegram: { success: false, message: 'Token and Chat ID required' } }));
      return;
    }

    setLoading(prev => ({ ...prev, telegram: true }));
    try {
      const response = await fetch(`${apiBase}/telegram/test`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token: telegramToken,
          chat_id: telegramChatId
        })
      });

      const data = await response.json();
      setTestResults(prev => ({ 
        ...prev, 
        telegram: { 
          success: response.ok, 
          message: data.message || (response.ok ? 'Connection successful!' : 'Connection failed') 
        } 
      }));
    } catch (err) {
      setTestResults(prev => ({ 
        ...prev, 
        telegram: { success: false, message: `Error: ${err.message}` } 
      }));
    } finally {
      setLoading(prev => ({ ...prev, telegram: false }));
    }
  };

  // Test API connections
  const testApiConnection = async (apiType) => {
    setLoading(prev => ({ ...prev, [apiType]: true }));
    try {
      const response = await fetch(`${apiBase}/api/test/${apiType}`);
      const data = await response.json();
      setTestResults(prev => ({ 
        ...prev, 
        [apiType]: { 
          success: response.ok, 
          message: data.message || (response.ok ? 'API working' : 'API failed') 
        } 
      }));
    } catch (err) {
      setTestResults(prev => ({ 
        ...prev, 
        [apiType]: { success: false, message: `Error: ${err.message}` } 
      }));
    } finally {
      setLoading(prev => ({ ...prev, [apiType]: false }));
    }
  };

  // Save settings
  const saveSettings = async () => {
    try {
      const settings = {
        telegram: { token: telegramToken, chatId: telegramChatId },
        notifications: defaultNotificationSettings,
        risk: defaultRiskSettings,
        api: defaultApiSettings
      };

      const response = await fetch(`${apiBase}/settings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings)
      });

      if (response.ok) {
        setTestResults(prev => ({ 
          ...prev, 
          save: { success: true, message: 'Settings saved successfully!' } 
        }));
      } else {
        throw new Error('Failed to save settings');
      }
    } catch (err) {
      setTestResults(prev => ({ 
        ...prev, 
        save: { success: false, message: `Save failed: ${err.message}` } 
      }));
    }
  };

  const renderTestResult = (key) => {
    const result = testResults[key];
    if (!result) return null;

    return (
      <div className={`flex items-center mt-2 text-sm ${result.success ? 'text-green-400' : 'text-red-400'}`}>
        {result.success ? <CheckCircle className="w-4 h-4 mr-1" /> : <XCircle className="w-4 h-4 mr-1" />}
        {result.message}
      </div>
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-gray-900 border-gray-700">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center text-white">
              <Settings className="w-5 h-5 mr-2" />
              Premium AI Signals Settings
            </CardTitle>
            <Button variant="ghost" onClick={onClose} className="text-gray-400 hover:text-white">
              ×
            </Button>
          </div>
        </CardHeader>

        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-4 bg-gray-800">
              <TabsTrigger value="telegram" className="text-white">
                <Send className="w-4 h-4 mr-1" />
                Telegram
              </TabsTrigger>
              <TabsTrigger value="notifications" className="text-white">
                <Bell className="w-4 h-4 mr-1" />
                Notifications
              </TabsTrigger>
              <TabsTrigger value="risk" className="text-white">
                <Shield className="w-4 h-4 mr-1" />
                Risk Management
              </TabsTrigger>
              <TabsTrigger value="api" className="text-white">
                <Database className="w-4 h-4 mr-1" />
                API Settings
              </TabsTrigger>
            </TabsList>

            {/* Telegram Settings */}
            <TabsContent value="telegram" className="space-y-4">
              <Card className="bg-gray-800 border-gray-600">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <Bot className="w-5 h-5 mr-2" />
                    Telegram Bot Configuration
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="telegram-token" className="text-white">Bot Token</Label>
                    <Input
                      id="telegram-token"
                      type="password"
                      value={telegramToken}
                      onChange={(e) => setTelegramToken(e.target.value)}
                      placeholder="Enter your Telegram bot token"
                      className="bg-gray-700 border-gray-600 text-white"
                    />
                  </div>
                  <div>
                    <Label htmlFor="telegram-chat" className="text-white">Chat ID</Label>
                    <Input
                      id="telegram-chat"
                      value={telegramChatId}
                      onChange={(e) => setTelegramChatId(e.target.value)}
                      placeholder="Enter your Telegram chat ID"
                      className="bg-gray-700 border-gray-600 text-white"
                    />
                  </div>
                  <Button 
                    onClick={testTelegram} 
                    disabled={loading.telegram}
                    className="w-full bg-blue-600 hover:bg-blue-700"
                  >
                    {loading.telegram ? 'Testing...' : 'Test Connection'}
                  </Button>
                  {renderTestResult('telegram')}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Notification Settings */}
            <TabsContent value="notifications" className="space-y-4">
              <Card className="bg-gray-800 border-gray-600">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <Bell className="w-5 h-5 mr-2" />
                    Notification Preferences
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label className="text-white">Enable Telegram Notifications</Label>
                    <Switch
                      checked={defaultNotificationSettings.enableTelegram}
                      onCheckedChange={(checked) => 
                        setNotificationSettings(prev => ({ ...prev, enableTelegram: checked }))
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label className="text-white">Enable Browser Notifications</Label>
                    <Switch
                      checked={defaultNotificationSettings.enableBrowser}
                      onCheckedChange={(checked) => 
                        setNotificationSettings(prev => ({ ...prev, enableBrowser: checked }))
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label className="text-white">Enable Sound Alerts</Label>
                    <Switch
                      checked={defaultNotificationSettings.enableSound}
                      onCheckedChange={(checked) => 
                        setNotificationSettings(prev => ({ ...prev, enableSound: checked }))
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label className="text-white">Gold Signals Only</Label>
                    <Switch
                      checked={defaultNotificationSettings.goldSignalsOnly}
                      onCheckedChange={(checked) => 
                        setNotificationSettings(prev => ({ ...prev, goldSignalsOnly: checked }))
                      }
                    />
                  </div>
                  <div>
                    <Label className="text-white">Minimum Confidence (%)</Label>
                    <Input
                      type="number"
                      min="0"
                      max="100"
                      value={defaultNotificationSettings.minConfidence}
                      onChange={(e) => 
                        setNotificationSettings(prev => ({ ...prev, minConfidence: parseInt(e.target.value) }))
                      }
                      className="bg-gray-700 border-gray-600 text-white"
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Risk Management */}
            <TabsContent value="risk" className="space-y-4">
              <Card className="bg-gray-800 border-gray-600">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <Shield className="w-5 h-5 mr-2" />
                    Risk Management Settings
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label className="text-white">Max Daily Loss (%)</Label>
                    <Input
                      type="number"
                      min="0"
                      max="50"
                      step="0.1"
                      value={defaultRiskSettings.maxDailyLoss}
                      onChange={(e) => 
                        setRiskSettings(prev => ({ ...prev, maxDailyLoss: parseFloat(e.target.value) }))
                      }
                      className="bg-gray-700 border-gray-600 text-white"
                    />
                  </div>
                  <div>
                    <Label className="text-white">Max Consecutive Losses</Label>
                    <Input
                      type="number"
                      min="1"
                      max="10"
                      value={defaultRiskSettings.maxConsecutiveLosses}
                      onChange={(e) => 
                        setRiskSettings(prev => ({ ...prev, maxConsecutiveLosses: parseInt(e.target.value) }))
                      }
                      className="bg-gray-700 border-gray-600 text-white"
                    />
                  </div>
                  <div>
                    <Label className="text-white">Cooldown Period (minutes)</Label>
                    <Input
                      type="number"
                      min="5"
                      max="1440"
                      value={defaultRiskSettings.cooldownPeriod}
                      onChange={(e) => 
                        setRiskSettings(prev => ({ ...prev, cooldownPeriod: parseInt(e.target.value) }))
                      }
                      className="bg-gray-700 border-gray-600 text-white"
                    />
                  </div>
                  <div>
                    <Label className="text-white">Risk Per Trade (%)</Label>
                    <Input
                      type="number"
                      min="0.1"
                      max="10"
                      step="0.1"
                      value={defaultRiskSettings.riskPerTrade}
                      onChange={(e) => 
                        setRiskSettings(prev => ({ ...prev, riskPerTrade: parseFloat(e.target.value) }))
                      }
                      className="bg-gray-700 border-gray-600 text-white"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label className="text-white">Auto Stop Loss</Label>
                    <Switch
                      checked={defaultRiskSettings.autoStopLoss}
                      onCheckedChange={(checked) => 
                        setRiskSettings(prev => ({ ...prev, autoStopLoss: checked }))
                      }
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* API Settings */}
            <TabsContent value="api" className="space-y-4">
              <Card className="bg-gray-800 border-gray-600">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <Key className="w-5 h-5 mr-2" />
                    API Data Sources
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label className="text-white">Polygon.io</Label>
                        <div className="flex items-center space-x-2">
                          <Switch
                            checked={defaultApiSettings.polygonEnabled}
                            onCheckedChange={(checked) => 
                              setApiSettings(prev => ({ ...prev, polygonEnabled: checked }))
                            }
                          />
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => testApiConnection('polygon')}
                            disabled={loading.polygon}
                            className="text-xs"
                          >
                            Test
                          </Button>
                        </div>
                      </div>
                      {renderTestResult('polygon')}
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label className="text-white">Alpha Vantage</Label>
                        <div className="flex items-center space-x-2">
                          <Switch
                            checked={defaultApiSettings.alphaVantageEnabled}
                            onCheckedChange={(checked) => 
                              setApiSettings(prev => ({ ...prev, alphaVantageEnabled: checked }))
                            }
                          />
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => testApiConnection('alpha')}
                            disabled={loading.alpha}
                            className="text-xs"
                          >
                            Test
                          </Button>
                        </div>
                      </div>
                      {renderTestResult('alpha')}
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label className="text-white">News APIs</Label>
                        <Switch
                          checked={defaultApiSettings.newsEnabled}
                          onCheckedChange={(checked) => 
                            setApiSettings(prev => ({ ...prev, newsEnabled: checked }))
                          }
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label className="text-white">Sentiment Analysis</Label>
                        <Switch
                          checked={defaultApiSettings.sentimentAnalysis}
                          onCheckedChange={(checked) => 
                            setApiSettings(prev => ({ ...prev, sentimentAnalysis: checked }))
                          }
                        />
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-gray-600">
                    <div className="flex items-center justify-between">
                      <Label className="text-white">Real-time Data</Label>
                      <Switch
                        checked={defaultApiSettings.realTimeData}
                        onCheckedChange={(checked) => 
                          setApiSettings(prev => ({ ...prev, realTimeData: checked }))
                        }
                      />
                    </div>
                    <p className="text-sm text-gray-400 mt-1">
                      Enable real-time market data for enhanced signal accuracy
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Save Settings */}
          <div className="flex justify-between items-center pt-6 border-t border-gray-600">
            <div className="flex-1">
              {renderTestResult('save')}
            </div>
            <div className="flex space-x-2">
              <Button variant="outline" onClick={onClose} className="text-white border-gray-600">
                Cancel
              </Button>
              <Button onClick={saveSettings} className="bg-green-600 hover:bg-green-700">
                Save Settings
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SettingsPanel;

