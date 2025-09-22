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
