// Game Demo Component for Browser
const GameDemo = ({ gameId = 'demo-game-001', sessionId = `session-${Date.now()}`, onGameEnd }) => {
  const [gameState, setGameState] = React.useState({
    playerHealth: 100,
    playerScore: 0,
    gameLevel: 1,
    enemiesDefeated: 0,
    itemsCollected: 0,
    gameStatus: 'idle',
    lastAction: 'Game initialized',
    timestamp: Date.now()
  });

  const [logs, setLogs] = React.useState([]);
  const [showLogs, setShowLogs] = React.useState(false);
  const gameIntervalRef = React.useRef(null);
  const initializedRef = React.useRef(false);

  // Add log to UI
  const addLog = (message, level = 'info') => {
    const timestamp = new Date().toLocaleTimeString();
    const logEntry = `[${timestamp}] [${level.toUpperCase()}] ${message}`;
    setLogs(prev => [...prev.slice(-49), logEntry]); // Keep last 50 logs
  };

  // Initialize game with comprehensive logging
  React.useEffect(() => {
    if (!initializedRef.current) {
      if (window.SGSentry) {
        window.SGSentry.logTrace('GameDemo component initialization started', {
          gameId,
          sessionId,
          timestamp: Date.now()
        });

        window.SGSentry.logInfo('GameDemo component initialized', {
          gameId,
          sessionId,
          initialHealth: gameState.playerHealth,
          initialScore: gameState.playerScore,
          timestamp: Date.now()
        });
      }

      addLog('Game demo initialized successfully', 'info');
      initializedRef.current = true;
    }
  }, [gameId, sessionId]);

  // Update game state with logging
  const updateGameState = React.useCallback((updates, action) => {
    const oldState = { ...gameState };
    const newState = { ...gameState, ...updates, lastAction: action, timestamp: Date.now() };
    
    setGameState(newState);

    // Log state changes based on action type
    switch (action) {
      case 'player_damage':
        if (window.SGSentry) {
          window.SGSentry.logWarning('Player took damage', {
            gameId,
            sessionId,
            oldHealth: oldState.playerHealth,
            newHealth: newState.playerHealth,
            damage: oldState.playerHealth - newState.playerHealth,
            action
          });
        }
        addLog(`Player took damage! Health: ${oldState.playerHealth} → ${newState.playerHealth}`, 'warning');
        break;

      case 'player_heal':
        if (window.SGSentry) {
          window.SGSentry.logInfo('Player healed', {
            gameId,
            sessionId,
            oldHealth: oldState.playerHealth,
            newHealth: newState.playerHealth,
            healAmount: newState.playerHealth - oldState.playerHealth,
            action
          });
        }
        addLog(`Player healed! Health: ${oldState.playerHealth} → ${newState.playerHealth}`, 'info');
        break;

      case 'enemy_defeated':
        if (window.SGSentry) {
          window.SGSentry.logInfo('Enemy defeated', {
            gameId,
            sessionId,
            enemiesDefeated: newState.enemiesDefeated,
            scoreGained: newState.playerScore - oldState.playerScore,
            action
          });
        }
        addLog(`Enemy defeated! Score: ${oldState.playerScore} → ${newState.playerScore}`, 'info');
        break;

      case 'item_collected':
        if (window.SGSentry) {
          window.SGSentry.logDebug('Item collected', {
            gameId,
            sessionId,
            itemsCollected: newState.itemsCollected,
            action
          });
        }
        addLog(`Item collected! Total: ${newState.itemsCollected}`, 'debug');
        break;

      case 'level_up':
        if (window.SGSentry) {
          window.SGSentry.logInfo('Level up achieved', {
            gameId,
            sessionId,
            oldLevel: oldState.gameLevel,
            newLevel: newState.gameLevel,
            action
          });
        }
        addLog(`Level up! Level: ${oldState.gameLevel} → ${newState.gameLevel}`, 'info');
        break;

      case 'game_over':
        if (window.SGSentry) {
          window.SGSentry.logError('Game over', {
            gameId,
            sessionId,
            finalScore: newState.playerScore,
            finalLevel: newState.gameLevel,
            enemiesDefeated: newState.enemiesDefeated,
            itemsCollected: newState.itemsCollected,
            action
          });
        }
        addLog('Game Over!', 'error');
        break;

      case 'victory':
        if (window.SGSentry) {
          window.SGSentry.logInfo('Victory achieved', {
            gameId,
            sessionId,
            finalScore: newState.playerScore,
            finalLevel: newState.gameLevel,
            enemiesDefeated: newState.enemiesDefeated,
            itemsCollected: newState.itemsCollected,
            action
          });
        }
        addLog('Victory!', 'info');
        break;

      default:
        if (window.SGSentry) {
          window.SGSentry.logDebug('Game state updated', {
            gameId,
            sessionId,
            action,
            oldState,
            newState
          });
        }
    }
  }, [gameState, gameId, sessionId]);

  // Game actions with comprehensive logging
  const startGame = React.useCallback(() => {
    let workflowId = null;
    if (window.SGSentry) {
      workflowId = window.SGSentry.startWorkflow('game_session_start', {
        gameId,
        sessionId,
        action: 'start_game'
      });

      window.SGSentry.logInfo('Game session started', {
        gameId,
        sessionId,
        workflowId,
        action: 'start_game'
      });
    }

    updateGameState({
      gameStatus: 'playing',
      playerHealth: 100,
      playerScore: 0,
      gameLevel: 1,
      enemiesDefeated: 0,
      itemsCollected: 0
    }, 'game_started');

    addLog('Game started!', 'info');

    // Start game loop
    gameIntervalRef.current = setInterval(() => {
      setGameState(currentState => {
        if (currentState.gameStatus !== 'playing') return currentState;

        // Simulate random game events
        const random = Math.random();
        let newState = { ...currentState };

        if (random < 0.1) {
          // Player takes damage
          newState.playerHealth = Math.max(0, newState.playerHealth - Math.floor(Math.random() * 20) + 5);
          updateGameState(newState, 'player_damage');
          
          if (newState.playerHealth <= 0) {
            newState.gameStatus = 'gameOver';
            updateGameState(newState, 'game_over');
            if (window.SGSentry && workflowId) {
              window.SGSentry.completeWorkflow(workflowId, 'failed', { reason: 'player_health_zero' });
            }
          }
        } else if (random < 0.2) {
          // Player heals
          newState.playerHealth = Math.min(100, newState.playerHealth + Math.floor(Math.random() * 15) + 5);
          updateGameState(newState, 'player_heal');
        } else if (random < 0.3) {
          // Enemy defeated
          newState.enemiesDefeated++;
          newState.playerScore += Math.floor(Math.random() * 50) + 10;
          updateGameState(newState, 'enemy_defeated');
        } else if (random < 0.4) {
          // Item collected
          newState.itemsCollected++;
          newState.playerScore += Math.floor(Math.random() * 20) + 5;
          updateGameState(newState, 'item_collected');
        } else if (random < 0.45 && newState.playerScore >= newState.gameLevel * 100) {
          // Level up
          newState.gameLevel++;
          updateGameState(newState, 'level_up');
          
          if (newState.gameLevel >= 5) {
            newState.gameStatus = 'victory';
            updateGameState(newState, 'victory');
            if (window.SGSentry && workflowId) {
              window.SGSentry.completeWorkflow(workflowId, 'success', { finalLevel: newState.gameLevel });
            }
          }
        }

        return newState;
      });
    }, 2000);

    if (window.SGSentry) {
      window.SGSentry.trackPerformance('game_loop_start', { gameId, sessionId });
    }
  }, [gameId, sessionId, updateGameState]);

  const pauseGame = React.useCallback(() => {
    if (window.SGSentry) {
      window.SGSentry.logInfo('Game paused', {
        gameId,
        sessionId,
        currentScore: gameState.playerScore,
        currentLevel: gameState.gameLevel,
        action: 'pause_game'
      });
    }

    updateGameState({ gameStatus: 'paused' }, 'game_paused');
    addLog('Game paused', 'info');

    if (gameIntervalRef.current) {
      clearInterval(gameIntervalRef.current);
      gameIntervalRef.current = null;
    }
  }, [gameId, sessionId, gameState.playerScore, gameState.gameLevel, updateGameState]);

  const resumeGame = React.useCallback(() => {
    if (window.SGSentry) {
      window.SGSentry.logInfo('Game resumed', {
        gameId,
        sessionId,
        currentScore: gameState.playerScore,
        currentLevel: gameState.gameLevel,
        action: 'resume_game'
      });
    }

    updateGameState({ gameStatus: 'playing' }, 'game_resumed');
    addLog('Game resumed', 'info');

    // Restart game loop
    if (!gameIntervalRef.current) {
      startGame();
    }
  }, [gameId, sessionId, gameState.playerScore, gameState.gameLevel, updateGameState, startGame]);

  const endGame = React.useCallback(() => {
    if (window.SGSentry) {
      window.SGSentry.logInfo('Game ended manually', {
        gameId,
        sessionId,
        finalScore: gameState.playerScore,
        finalLevel: gameState.gameLevel,
        enemiesDefeated: gameState.enemiesDefeated,
        itemsCollected: gameState.itemsCollected,
        action: 'end_game'
      });
    }

    updateGameState({ gameStatus: 'idle' }, 'game_ended_manually');
    addLog('Game ended manually', 'info');

    if (gameIntervalRef.current) {
      clearInterval(gameIntervalRef.current);
      gameIntervalRef.current = null;
    }

    if (onGameEnd) {
      onGameEnd();
    }
  }, [gameId, sessionId, gameState, updateGameState, onGameEnd]);

  const simulateError = React.useCallback(() => {
    if (window.SGSentry) {
      window.SGSentry.logError('Simulated game error', {
        gameId,
        sessionId,
        errorType: 'simulated_error',
        currentState: gameState,
        action: 'simulate_error'
      });
    }

    addLog('Simulated error logged', 'error');
  }, [gameId, sessionId, gameState]);

  const simulateFatalError = React.useCallback(() => {
    if (window.SGSentry) {
      window.SGSentry.logFatal('Simulated fatal game error', {
        gameId,
        sessionId,
        errorType: 'simulated_fatal_error',
        currentState: gameState,
        action: 'simulate_fatal_error'
      });
    }

    addLog('Simulated fatal error logged', 'fatal');
  }, [gameId, sessionId, gameState]);

  const clearLogs = React.useCallback(() => {
    if (window.SGSentry) {
      window.SGSentry.logDebug('Logs cleared manually', {
        gameId,
        sessionId,
        action: 'clear_logs'
      });
    }

    setLogs([]);
    addLog('Logs cleared', 'debug');
  }, [gameId, sessionId]);

  // Cleanup on unmount
  React.useEffect(() => {
    return () => {
      if (gameIntervalRef.current) {
        clearInterval(gameIntervalRef.current);
      }
      
      if (window.SGSentry) {
        window.SGSentry.logInfo('GameDemo component unmounting', {
          gameId,
          sessionId,
          finalState: gameState,
          action: 'component_unmount'
        });
      }
    };
  }, [gameId, sessionId, gameState]);

  return React.createElement('div', {
    className: 'game-demo',
    style: {
      padding: '20px',
      backgroundColor: '#f8f9fa',
      borderRadius: '10px',
      border: '1px solid #dee2e6'
    }
  }, [
    React.createElement('h2', {
      key: 'title',
      style: { color: '#2c3e50', marginBottom: '20px' }
    }, '🎮 Game Demo with Sentry Logging'),
    
    // Game Status Display
    React.createElement('div', {
      key: 'stats',
      style: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
        gap: '15px',
        marginBottom: '20px'
      }
    }, [
      React.createElement('div', {
        key: 'health',
        style: {
          padding: '10px',
          backgroundColor: '#e3f2fd',
          borderRadius: '5px',
          textAlign: 'center'
        }
      }, [
        React.createElement('div', {
          key: 'health-label',
          style: { fontWeight: 'bold', color: '#1976d2' }
        }, 'Health'),
        React.createElement('div', {
          key: 'health-value',
          style: { 
            fontSize: '1.2em', 
            color: gameState.playerHealth < 30 ? '#f44336' : '#4caf50' 
          }
        }, gameState.playerHealth)
      ]),
      React.createElement('div', {
        key: 'score',
        style: {
          padding: '10px',
          backgroundColor: '#e8f5e8',
          borderRadius: '5px',
          textAlign: 'center'
        }
      }, [
        React.createElement('div', {
          key: 'score-label',
          style: { fontWeight: 'bold', color: '#388e3c' }
        }, 'Score'),
        React.createElement('div', {
          key: 'score-value',
          style: { fontSize: '1.2em' }
        }, gameState.playerScore)
      ]),
      React.createElement('div', {
        key: 'level',
        style: {
          padding: '10px',
          backgroundColor: '#fff3e0',
          borderRadius: '5px',
          textAlign: 'center'
        }
      }, [
        React.createElement('div', {
          key: 'level-label',
          style: { fontWeight: 'bold', color: '#f57c00' }
        }, 'Level'),
        React.createElement('div', {
          key: 'level-value',
          style: { fontSize: '1.2em' }
        }, gameState.gameLevel)
      ]),
      React.createElement('div', {
        key: 'status',
        style: {
          padding: '10px',
          backgroundColor: '#fce4ec',
          borderRadius: '5px',
          textAlign: 'center'
        }
      }, [
        React.createElement('div', {
          key: 'status-label',
          style: { fontWeight: 'bold', color: '#c2185b' }
        }, 'Status'),
        React.createElement('div', {
          key: 'status-value',
          style: { fontSize: '1.2em', textTransform: 'capitalize' }
        }, gameState.gameStatus)
      ])
    ]),

    // Game Statistics
    React.createElement('div', {
      key: 'statistics',
      style: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
        gap: '10px',
        marginBottom: '20px'
      }
    }, [
      React.createElement('div', {
        key: 'enemies',
        style: { textAlign: 'center' }
      }, [
        React.createElement('div', {
          key: 'enemies-label',
          style: { fontWeight: 'bold' }
        }, 'Enemies Defeated'),
        React.createElement('div', {
          key: 'enemies-value'
        }, gameState.enemiesDefeated)
      ]),
      React.createElement('div', {
        key: 'items',
        style: { textAlign: 'center' }
      }, [
        React.createElement('div', {
          key: 'items-label',
          style: { fontWeight: 'bold' }
        }, 'Items Collected'),
        React.createElement('div', {
          key: 'items-value'
        }, gameState.itemsCollected)
      ])
    ]),

    // Game Controls
    React.createElement('div', {
      key: 'controls',
      style: {
        display: 'flex',
        flexWrap: 'wrap',
        gap: '10px',
        marginBottom: '20px'
      }
    }, [
      gameState.gameStatus === 'idle' && React.createElement('button', {
        key: 'start',
        onClick: startGame,
        style: {
          padding: '10px 20px',
          backgroundColor: '#4caf50',
          color: 'white',
          border: 'none',
          borderRadius: '5px',
          cursor: 'pointer',
          fontSize: '14px'
        }
      }, 'Start Game'),
      
      gameState.gameStatus === 'playing' && React.createElement('button', {
        key: 'pause',
        onClick: pauseGame,
        style: {
          padding: '10px 20px',
          backgroundColor: '#ff9800',
          color: 'white',
          border: 'none',
          borderRadius: '5px',
          cursor: 'pointer',
          fontSize: '14px'
        }
      }, 'Pause Game'),
      
      gameState.gameStatus === 'paused' && React.createElement('button', {
        key: 'resume',
        onClick: resumeGame,
        style: {
          padding: '10px 20px',
          backgroundColor: '#2196f3',
          color: 'white',
          border: 'none',
          borderRadius: '5px',
          cursor: 'pointer',
          fontSize: '14px'
        }
      }, 'Resume Game'),
      
      (gameState.gameStatus === 'playing' || gameState.gameStatus === 'paused') && React.createElement('button', {
        key: 'end',
        onClick: endGame,
        style: {
          padding: '10px 20px',
          backgroundColor: '#f44336',
          color: 'white',
          border: 'none',
          borderRadius: '5px',
          cursor: 'pointer',
          fontSize: '14px'
        }
      }, 'End Game')
    ].filter(Boolean)),

    // Sentry Testing Controls
    React.createElement('div', {
      key: 'sentry-testing',
      style: { marginBottom: '20px' }
    }, [
      React.createElement('h3', {
        key: 'testing-title',
        style: { color: '#34495e', marginBottom: '10px' }
      }, '🧪 Sentry Testing'),
      React.createElement('div', {
        key: 'testing-buttons',
        style: {
          display: 'flex',
          flexWrap: 'wrap',
          gap: '8px'
        }
      }, [
        React.createElement('button', {
          key: 'simulate-error',
          onClick: simulateError,
          style: {
            padding: '8px 16px',
            backgroundColor: '#f44336',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
            fontSize: '12px'
          }
        }, 'Simulate Error'),
        React.createElement('button', {
          key: 'simulate-fatal',
          onClick: simulateFatalError,
          style: {
            padding: '8px 16px',
            backgroundColor: '#9c27b0',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
            fontSize: '12px'
          }
        }, 'Simulate Fatal'),
        React.createElement('button', {
          key: 'toggle-logs',
          onClick: () => setShowLogs(!showLogs),
          style: {
            padding: '8px 16px',
            backgroundColor: '#607d8b',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
            fontSize: '12px'
          }
        }, showLogs ? 'Hide Logs' : 'Show Logs'),
        React.createElement('button', {
          key: 'clear-logs',
          onClick: clearLogs,
          style: {
            padding: '8px 16px',
            backgroundColor: '#795548',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
            fontSize: '12px'
          }
        }, 'Clear Logs')
      ])
    ]),

    // Game Logs
    showLogs && React.createElement('div', {
      key: 'logs',
      style: {
        backgroundColor: '#2d3748',
        color: '#e2e8f0',
        padding: '15px',
        borderRadius: '5px',
        maxHeight: '300px',
        overflowY: 'auto',
        fontFamily: 'monospace',
        fontSize: '12px'
      }
    }, [
      React.createElement('div', {
        key: 'logs-title',
        style: { marginBottom: '10px', fontWeight: 'bold' }
      }, 'Game Logs:'),
      logs.length === 0 ? 
        React.createElement('div', {
          key: 'no-logs',
          style: { color: '#a0aec0' }
        }, 'No logs yet...') :
        logs.map((log, index) => 
          React.createElement('div', {
            key: index,
            style: { marginBottom: '2px' }
          }, log)
        )
    ]),

    // Last Action Display
    React.createElement('div', {
      key: 'last-action',
      style: {
        marginTop: '15px',
        padding: '10px',
        backgroundColor: '#f1f3f4',
        borderRadius: '5px',
        fontSize: '14px'
      }
    }, [
      React.createElement('strong', { key: 'label' }, 'Last Action: '),
      React.createElement('span', { key: 'action' }, gameState.lastAction)
    ])
  ]);
}; 