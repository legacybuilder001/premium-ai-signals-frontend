import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card.jsx';
import { Button } from '@/components/ui/button.jsx';
import { Input } from '@/components/ui/input.jsx';
import { Badge } from '@/components/ui/badge.jsx';
import { MessageCircle, Send, Users, Bot, User, X, Minimize2, Maximize2 } from 'lucide-react';
import io from 'socket.io-client';

const EnhancedLiveChat = ({ apiBase = 'http://localhost:8000' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [username, setUsername] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [currentRoom, setCurrentRoom] = useState('general');
  const [isJoined, setIsJoined] = useState(false);
  
  const socketRef = useRef(null);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Auto-scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Initialize WebSocket connection
  useEffect(() => {
    if (isOpen && !socketRef.current) {
      socketRef.current = io(apiBase, {
        transports: ['websocket', 'polling'],
        timeout: 20000,
        forceNew: true
      });

      // Connection event handlers
      socketRef.current.on('connect', () => {
        console.log('Connected to chat server');
        setIsConnected(true);
      });

      socketRef.current.on('disconnect', () => {
        console.log('Disconnected from chat server');
        setIsConnected(false);
        setIsJoined(false);
      });

      socketRef.current.on('connection_response', (data) => {
        console.log('Connection response:', data);
        addSystemMessage(data.message);
      });

      // Chat event handlers
      socketRef.current.on('user_joined', (data) => {
        addSystemMessage(`${data.username} joined the chat`);
      });

      socketRef.current.on('user_left', (data) => {
        addSystemMessage(`User left the chat`);
      });

      socketRef.current.on('new_message', (data) => {
        setMessages(prev => [...prev, {
          id: data.id,
          username: data.username,
          message: data.message,
          timestamp: data.timestamp,
          type: data.type || 'user_message',
          isOwn: data.user_id === socketRef.current?.id
        }]);
      });

      socketRef.current.on('chat_history', (data) => {
        const historyMessages = data.messages.map(msg => ({
          id: msg.id,
          username: msg.username,
          message: msg.message,
          timestamp: msg.timestamp,
          type: msg.type || 'user_message',
          isOwn: msg.user_id === socketRef.current?.id
        }));
        setMessages(historyMessages);
      });

      socketRef.current.on('signal_update', (data) => {
        addSystemMessage(`New ${data.signal.tier} signal: ${data.signal.direction} ${data.signal.asset} (${data.signal.confidence.toFixed(1)}% confidence)`);
      });

      socketRef.current.on('error', (data) => {
        addSystemMessage(`Error: ${data.message}`, 'error');
      });
    }

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, [isOpen, apiBase]);

  const addSystemMessage = (message, type = 'system') => {
    setMessages(prev => [...prev, {
      id: Date.now().toString(),
      username: 'System',
      message,
      timestamp: new Date().toISOString(),
      type,
      isOwn: false
    }]);
  };

  const toggleChat = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      setIsMinimized(false);
    }
  };

  const toggleMinimize = () => {
    setIsMinimized(!isMinimized);
  };

  const joinChat = () => {
    if (!username.trim()) {
      alert('Please enter a username');
      return;
    }

    if (socketRef.current && isConnected) {
      socketRef.current.emit('join_chat', {
        room: currentRoom,
        username: username.trim()
      });
      setIsJoined(true);
    }
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!input.trim() || !isJoined || !socketRef.current) return;

    socketRef.current.emit('send_message', {
      room: currentRoom,
      message: input.trim()
    });

    setInput('');
    inputRef.current?.focus();
  };

  const requestSignalUpdate = () => {
    if (socketRef.current && isConnected) {
      socketRef.current.emit('request_signal_update', {
        asset: 'EURUSD',
        timeframe: '1m'
      });
    }
  };

  const formatTimestamp = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const getMessageTypeColor = (type) => {
    switch (type) {
      case 'ai_response':
        return 'bg-blue-600';
      case 'system':
        return 'bg-gray-600';
      case 'error':
        return 'bg-red-600';
      default:
        return 'bg-green-600';
    }
  };

  const getMessageIcon = (type, username) => {
    if (type === 'ai_response' || username === 'AI Support') {
      return <Bot className="w-4 h-4" />;
    } else if (type === 'system') {
      return <MessageCircle className="w-4 h-4" />;
    } else {
      return <User className="w-4 h-4" />;
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {/* Chat Toggle Button */}
      <Button
        onClick={toggleChat}
        className="bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-full shadow-lg"
        size="lg"
      >
        <MessageCircle className="w-6 h-6" />
        {!isOpen && messages.length > 0 && (
          <Badge className="absolute -top-2 -right-2 bg-red-500 text-white text-xs">
            {messages.length > 99 ? '99+' : messages.length}
          </Badge>
        )}
      </Button>

      {/* Chat Window */}
      {isOpen && (
        <Card className="w-96 h-[500px] mt-2 bg-gray-900 border-gray-700 shadow-2xl">
          {/* Header */}
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center text-white text-lg">
                <MessageCircle className="w-5 h-5 mr-2" />
                Live Chat
                {isConnected && (
                  <Badge className="ml-2 bg-green-500 text-xs">
                    Online
                  </Badge>
                )}
              </CardTitle>
              <div className="flex items-center space-x-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={toggleMinimize}
                  className="text-gray-400 hover:text-white p-1"
                >
                  {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={toggleChat}
                  className="text-gray-400 hover:text-white p-1"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardHeader>

          {!isMinimized && (
            <CardContent className="flex flex-col h-[420px] p-4">
              {/* Join Chat Form */}
              {!isJoined && (
                <div className="mb-4 p-3 bg-gray-800 rounded-lg">
                  <h4 className="text-white text-sm font-medium mb-2">Join the chat</h4>
                  <div className="flex space-x-2">
                    <Input
                      type="text"
                      placeholder="Enter your username"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="bg-gray-700 border-gray-600 text-white"
                      onKeyPress={(e) => e.key === 'Enter' && joinChat()}
                    />
                    <Button
                      onClick={joinChat}
                      disabled={!isConnected || !username.trim()}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      Join
                    </Button>
                  </div>
                </div>
              )}

              {/* Messages Area */}
              <div className="flex-1 overflow-y-auto mb-3 space-y-2">
                {messages.length === 0 && (
                  <div className="text-center text-gray-400 py-8">
                    <MessageCircle className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>Welcome to Live Chat!</p>
                    <p className="text-sm">Connect with other traders and get AI support.</p>
                  </div>
                )}

                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.isOwn ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[80%] p-2 rounded-lg ${
                        msg.isOwn
                          ? 'bg-blue-600 text-white'
                          : getMessageTypeColor(msg.type) + ' text-white'
                      }`}
                    >
                      <div className="flex items-center space-x-1 mb-1">
                        {getMessageIcon(msg.type, msg.username)}
                        <span className="text-xs font-medium">{msg.username}</span>
                        <span className="text-xs opacity-75">
                          {formatTimestamp(msg.timestamp)}
                        </span>
                      </div>
                      <p className="text-sm">{msg.message}</p>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              {/* Quick Actions */}
              {isJoined && (
                <div className="mb-2">
                  <Button
                    onClick={requestSignalUpdate}
                    variant="outline"
                    size="sm"
                    className="text-xs bg-gray-800 border-gray-600 text-gray-300 hover:bg-gray-700"
                  >
                    Request Signal Update
                  </Button>
                </div>
              )}

              {/* Message Input */}
              {isJoined && (
                <form onSubmit={handleSendMessage} className="flex space-x-2">
                  <Input
                    ref={inputRef}
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Type your message..."
                    className="flex-1 bg-gray-800 border-gray-600 text-white"
                    disabled={!isConnected}
                  />
                  <Button
                    type="submit"
                    disabled={!input.trim() || !isConnected}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </form>
              )}

              {/* Connection Status */}
              {!isConnected && (
                <div className="text-center text-red-400 text-sm py-2">
                  Connecting to chat server...
                </div>
              )}
            </CardContent>
          )}
        </Card>
      )}
    </div>
  );
};

export default EnhancedLiveChat;

