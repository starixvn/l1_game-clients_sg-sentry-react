// Game Board Demo - Browser Compatible Version
// This combines GameBoard, GamePiece, and GameIntegrationExample components

// Game Piece Component
const GamePiece = ({ pieceId, pieceType, position, onMove, onInteraction }) => {
  const [isSelected, setIsSelected] = React.useState(false);
  const [health, setHealth] = React.useState(pieceType === 'player' ? 100 : 50);
  const [isMoving, setIsMoving] = React.useState(false);

  // Log component initialization
  React.useEffect(() => {
    if (window.SGSentry) {
      window.SGSentry.logInfo(`GamePiece_${pieceId}`, 'GamePiece component initialized', {
        pieceId,
        pieceType,
        position,
        health,
        timestamp: Date.now()
      });
    }
  }, [pieceId, pieceType, position.x, position.y, health]);

  // Handle piece selection
  const handleSelect = React.useCallback(() => {
    setIsSelected(true);
    if (window.SGSentry) {
      window.SGSentry.logInfo(`GamePiece_${pieceId}`, 'GamePiece selected', {
        pieceId,
        pieceType,
        position,
        action: 'piece_selected'
      });
    }
  }, [pieceId, pieceType, position]);

  // Handle piece deselection
  const handleDeselect = React.useCallback(() => {
    setIsSelected(false);
    if (window.SGSentry) {
      window.SGSentry.logInfo(`GamePiece_${pieceId}`, 'GamePiece deselected', {
        pieceId,
        pieceType,
        position,
        action: 'piece_deselected'
      });
    }
  }, [pieceId, pieceType, position]);

  // Handle piece movement
  const handleMove = React.useCallback((direction) => {
    if (isMoving) return;

    setIsMoving(true);
    const newPosition = { ...position };

    switch (direction) {
      case 'up':
        newPosition.y -= 1;
        break;
      case 'down':
        newPosition.y += 1;
        break;
      case 'left':
        newPosition.x -= 1;
        break;
      case 'right':
        newPosition.x += 1;
        break;
    }

    if (window.SGSentry) {
      window.SGSentry.logInfo(`GamePiece_${pieceId}`, 'GamePiece movement initiated', {
        pieceId,
        pieceType,
        oldPosition: position,
        newPosition,
        direction,
        action: 'piece_movement_started'
      });
    }

    // Simulate movement delay
    setTimeout(() => {
      if (onMove) {
        onMove(newPosition);
      }
      setIsMoving(false);
      
      if (window.SGSentry) {
        window.SGSentry.logInfo(`GamePiece_${pieceId}`, 'GamePiece movement completed', {
          pieceId,
          pieceType,
          newPosition,
          direction,
          action: 'piece_movement_completed'
        });
      }
    }, 300);
  }, [isMoving, position, onMove, pieceId, pieceType]);

  // Handle piece interaction
  const handleInteraction = React.useCallback((action) => {
    if (window.SGSentry) {
      window.SGSentry.logInfo(`GamePiece_${pieceId}`, 'GamePiece interaction', {
        pieceId,
        pieceType,
        action,
        position,
        health
      });
    }

    if (onInteraction) {
      onInteraction(pieceId, action);
    }
  }, [pieceId, pieceType, position, health, onInteraction]);

  // Get piece color based on type
  const getPieceColor = () => {
    switch (pieceType) {
      case 'player':
        return isSelected ? '#4CAF50' : '#2E7D32';
      case 'enemy':
        return '#F44336';
      case 'item':
        return '#FF9800';
      case 'obstacle':
        return '#9E9E9E';
      default:
        return '#000000';
    }
  };

  // Get piece symbol
  const getPieceSymbol = () => {
    switch (pieceType) {
      case 'player':
        return '👤';
      case 'enemy':
        return '👹';
      case 'item':
        return '💎';
      case 'obstacle':
        return '🪨';
      default:
        return '❓';
    }
  };

  return React.createElement('div', {
    style: {
      position: 'absolute',
      left: `${position.x * 60}px`,
      top: `${position.y * 60}px`,
      width: '50px',
      height: '50px',
      backgroundColor: getPieceColor(),
      border: isSelected ? '3px solid #FFD700' : '2px solid #333',
      borderRadius: '8px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      cursor: 'pointer',
      fontSize: '24px',
      transition: 'all 0.3s ease',
      opacity: isMoving ? 0.7 : 1,
      transform: isMoving ? 'scale(1.1)' : 'scale(1)'
    },
    onClick: handleSelect,
    onDoubleClick: () => handleDeselect()
  }, [
    React.createElement('div', {
      key: 'symbol',
      style: { fontSize: '20px' }
    }, getPieceSymbol()),
    React.createElement('div', {
      key: 'health',
      style: {
        position: 'absolute',
        bottom: '-20px',
        left: '50%',
        transform: 'translateX(-50%)',
        fontSize: '10px',
        backgroundColor: 'rgba(0,0,0,0.7)',
        color: 'white',
        padding: '2px 4px',
        borderRadius: '2px'
      }
    }, `${health}HP`)
  ]);
};

// Game Piece Controls Component
const GamePieceControls = ({ pieceId, onMove, onInteraction }) => {
  return React.createElement('div', {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: '5px',
      padding: '10px',
      border: '1px solid #ddd',
      borderRadius: '4px',
      backgroundColor: '#f9f9f9'
    }
  }, [
    React.createElement('h4', { key: 'title' }, `Controls for ${pieceId}`),
    
    // Movement controls
    React.createElement('div', { key: 'movement', style: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '5px' } }, [
      React.createElement('button', {
        key: 'up',
        onClick: () => onMove('up'),
        style: { gridColumn: '2', padding: '5px' }
      }, '⬆️'),
      React.createElement('button', {
        key: 'left',
        onClick: () => onMove('left'),
        style: { gridColumn: '1', gridRow: '2', padding: '5px' }
      }, '⬅️'),
      React.createElement('button', {
        key: 'right',
        onClick: () => onMove('right'),
        style: { gridColumn: '3', gridRow: '2', padding: '5px' }
      }, '➡️'),
      React.createElement('button', {
        key: 'down',
        onClick: () => onMove('down'),
        style: { gridColumn: '2', gridRow: '3', padding: '5px' }
      }, '⬇️')
    ]),
    
    // Interaction controls
    React.createElement('div', { key: 'interactions', style: { display: 'flex', gap: '5px', marginTop: '10px' } }, [
      React.createElement('button', {
        key: 'attack',
        onClick: () => onInteraction('attack'),
        style: { padding: '5px 10px', backgroundColor: '#f44336', color: 'white', border: 'none', borderRadius: '3px' }
      }, 'Attack'),
      React.createElement('button', {
        key: 'heal',
        onClick: () => onInteraction('heal'),
        style: { padding: '5px 10px', backgroundColor: '#4CAF50', color: 'white', border: 'none', borderRadius: '3px' }
      }, 'Heal'),
      React.createElement('button', {
        key: 'collect',
        onClick: () => onInteraction('collect'),
        style: { padding: '5px 10px', backgroundColor: '#FF9800', color: 'white', border: 'none', borderRadius: '3px' }
      }, 'Collect')
    ])
  ]);
};

// Game Board Component
const GameBoard = ({ gameId, sessionId, onGameEnd }) => {
  const [isEnding, setIsEnding] = React.useState(false);
  const [endGameMessage, setEndGameMessage] = React.useState('');
  const [pieces, setPieces] = React.useState([
    { id: 'player1', type: 'player', position: { x: 2, y: 2 } },
    { id: 'enemy1', type: 'enemy', position: { x: 4, y: 3 } },
    { id: 'item1', type: 'item', position: { x: 1, y: 4 } },
    { id: 'obstacle1', type: 'obstacle', position: { x: 3, y: 1 } }
  ]);
  const [selectedPiece, setSelectedPiece] = React.useState(null);
  const [gameLogs, setGameLogs] = React.useState([]);
  const initializedRef = React.useRef(false);

  // Log game board initialization - only once
  React.useEffect(() => {
    if (!initializedRef.current) {
      if (window.SGSentry) {
        window.SGSentry.logInfo('GameBoard', 'GameBoard component initialized', {
          gameId,
          sessionId,
          timestamp: Date.now()
        });
      }
      initializedRef.current = true;
      addGameLog('Game board initialized');
    }
  }, [gameId, sessionId]);

  // Add log to game logs
  const addGameLog = (message) => {
    setGameLogs(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  // Handle piece movement
  const handlePieceMove = React.useCallback((pieceId, newPosition) => {
    setPieces(prev => prev.map(piece => 
      piece.id === pieceId ? { ...piece, position: newPosition } : piece
    ));
    addGameLog(`${pieceId} moved to (${newPosition.x}, ${newPosition.y})`);
  }, []);

  // Handle piece interaction
  const handlePieceInteraction = React.useCallback((pieceId, action) => {
    addGameLog(`${pieceId} performed ${action}`);
    
    if (window.SGSentry) {
      window.SGSentry.logInfo('GameBoard', 'Piece interaction', {
        pieceId,
        action,
        gameId,
        sessionId
      });
    }
  }, [gameId, sessionId]);

  // Handle end game action
  const handleEndGame = React.useCallback(async () => {
    setIsEnding(true);
    setEndGameMessage('Ending game and sending logs...');

    try {
      if (window.SGSentry) {
        window.SGSentry.logInfo('GameBoard', 'Game ending initiated by user', {
          gameId,
          sessionId,
          action: 'end_game_button_clicked'
        });
      }

      setEndGameMessage('Game ended successfully!');
      addGameLog('Game ended successfully');

      if (window.SGSentry) {
        window.SGSentry.logInfo('GameBoard', 'Game ended successfully', {
          gameId,
          sessionId,
          action: 'game_ended_successfully'
        });
      }

      // Call the onGameEnd callback if provided
      if (onGameEnd) {
        onGameEnd();
      }

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setEndGameMessage(`Failed to end game: ${errorMessage}`);

      if (window.SGSentry) {
        window.SGSentry.logError('GameBoard', 'Failed to end game', {
          gameId,
          sessionId,
          error: errorMessage,
          action: 'end_game_failed'
        });
      }
    } finally {
      setIsEnding(false);
    }
  }, [gameId, sessionId, onGameEnd]);

  // Handle clear logs
  const handleClearLogs = React.useCallback(() => {
    if (window.SGSentry) {
      window.SGSentry.logInfo('GameBoard', 'Clearing logs manually', {
        gameId,
        sessionId,
        action: 'clear_logs_button_clicked'
      });
    }

    setGameLogs([]);
    addGameLog('Logs cleared');
  }, [gameId, sessionId]);

  // Handle piece selection
  const handlePieceSelect = React.useCallback((pieceId) => {
    setSelectedPiece(pieceId);
    addGameLog(`${pieceId} selected`);
  }, []);

  return React.createElement('div', {
    style: {
      padding: '20px',
      border: '1px solid #ccc',
      borderRadius: '8px',
      backgroundColor: '#f9f9f9',
      margin: '10px'
    }
  }, [
    React.createElement('h2', { key: 'title' }, '🎮 Game Board Demo'),
    
    React.createElement('div', { key: 'info', style: { marginBottom: '15px' } }, [
      React.createElement('div', { key: 'gameId', style: { marginBottom: '5px' } }, [
        React.createElement('strong', { key: 'label' }, 'Game ID: '),
        gameId
      ]),
      React.createElement('div', { key: 'sessionId', style: { marginBottom: '5px' } }, [
        React.createElement('strong', { key: 'label' }, 'Session ID: '),
        sessionId
      ])
    ]),

    // Game board grid
    React.createElement('div', {
      key: 'game-grid',
      style: {
        position: 'relative',
        width: '360px',
        height: '360px',
        border: '2px solid #333',
        backgroundColor: '#e8f5e8',
        marginBottom: '20px',
        display: 'inline-block'
      }
    }, pieces.map(piece => 
      React.createElement(GamePiece, {
        key: piece.id,
        pieceId: piece.id,
        pieceType: piece.type,
        position: piece.position,
        onMove: (newPosition) => handlePieceMove(piece.id, newPosition),
        onInteraction: handlePieceInteraction
      })
    )),

    // Controls section
    React.createElement('div', {
      key: 'controls',
      style: {
        display: 'flex',
        gap: '20px',
        marginBottom: '20px',
        flexWrap: 'wrap'
      }
    }, [
      // Game controls
      React.createElement('div', {
        key: 'game-controls',
        style: { display: 'flex', gap: '10px', flexWrap: 'wrap' }
      }, [
        React.createElement('button', {
          key: 'end-game',
          onClick: handleEndGame,
          disabled: isEnding,
          style: {
            padding: '10px 20px',
            backgroundColor: '#f44336',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: isEnding ? 'not-allowed' : 'pointer',
            opacity: isEnding ? 0.6 : 1
          }
        }, isEnding ? 'Ending Game...' : 'End Game'),
        
        React.createElement('button', {
          key: 'clear-logs',
          onClick: handleClearLogs,
          style: {
            padding: '10px 20px',
            backgroundColor: '#ff9800',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }
        }, 'Clear Logs')
      ]),

      // Piece controls
      selectedPiece && React.createElement(GamePieceControls, {
        key: 'piece-controls',
        pieceId: selectedPiece,
        onMove: (direction) => {
          const piece = pieces.find(p => p.id === selectedPiece);
          if (piece) {
            const newPosition = { ...piece.position };
            switch (direction) {
              case 'up': newPosition.y = Math.max(0, newPosition.y - 1); break;
              case 'down': newPosition.y = Math.min(5, newPosition.y + 1); break;
              case 'left': newPosition.x = Math.max(0, newPosition.x - 1); break;
              case 'right': newPosition.x = Math.min(5, newPosition.x + 1); break;
            }
            handlePieceMove(selectedPiece, newPosition);
          }
        },
        onInteraction: (action) => handlePieceInteraction(selectedPiece, action)
      })
    ]),

    // End game message
    endGameMessage && React.createElement('div', {
      key: 'end-message',
      style: {
        padding: '10px',
        marginBottom: '15px',
        backgroundColor: '#e8f5e8',
        border: '1px solid #4caf50',
        borderRadius: '4px',
        color: '#2e7d32'
      }
    }, endGameMessage),

    // Game logs
    React.createElement('div', {
      key: 'game-logs',
      style: {
        border: '1px solid #ddd',
        padding: '10px',
        borderRadius: '4px',
        backgroundColor: '#fff',
        maxHeight: '200px',
        overflowY: 'auto'
      }
    }, [
      React.createElement('h3', { key: 'logs-title' }, 'Game Logs'),
      React.createElement('div', {
        key: 'logs-content',
        style: {
          fontFamily: 'monospace',
          fontSize: '12px',
          lineHeight: '1.4'
        }
      }, gameLogs.length === 0 ? 
        React.createElement('p', { 
          key: 'no-logs',
          style: { color: '#666', fontStyle: 'italic' }
        }, 'No game activity yet. Try moving pieces!') :
        gameLogs.map((log, index) => 
          React.createElement('div', {
            key: index,
            style: { marginBottom: '2px' }
          }, log)
        )
      )
    ])
  ]);
};

// Main Game Board Demo Component
const GameBoardDemo = ({ gameId = 'demo-game-board-001', sessionId = `session-${Date.now()}`, onGameEnd }) => {
  const [logs, setLogs] = React.useState([]);

  // Add log to UI
  const addLog = (message) => {
    setLogs(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  // Handle game end
  const handleGameEnd = () => {
    addLog('Game board demo ended');
    if (window.SGSentry) {
      window.SGSentry.logInfo('GameBoardDemo', 'Game board demo session ended', { 
        gameId,
        timestamp: Date.now() 
      });
    }
    if (onGameEnd) {
      onGameEnd();
    }
  };

  return React.createElement('div', {
    style: { 
      maxWidth: '1200px', 
      margin: '0 auto', 
      padding: '20px',
      fontFamily: 'Arial, sans-serif'
    }
  }, [
    React.createElement('h1', { key: 'title' }, '🎮 Game Board Demo'),
    React.createElement('p', { 
      key: 'description',
      style: { marginBottom: '20px', color: '#666' }
    }, 'This demo showcases a complete game board with interactive pieces, movement controls, and comprehensive Sentry logging integration.'),
    
    React.createElement(GameBoard, {
      key: 'game-board',
      gameId,
      sessionId,
      onGameEnd: handleGameEnd
    }),

    // Instructions
    React.createElement('div', {
      key: 'instructions',
      style: { 
        marginTop: '20px', 
        padding: '20px', 
        backgroundColor: '#e8f4fd', 
        borderRadius: '8px',
        border: '1px solid #b3d9ff'
      }
    }, [
      React.createElement('h3', { key: 'instructions-title' }, 'How to Use'),
      React.createElement('ul', { key: 'instructions-list' }, [
        React.createElement('li', { key: 'click' }, 'Click on any piece to select it'),
        React.createElement('li', { key: 'move' }, 'Use the arrow buttons to move the selected piece'),
        React.createElement('li', { key: 'interact' }, 'Use the action buttons (Attack, Heal, Collect) to interact'),
        React.createElement('li', { key: 'logs' }, 'Watch the game logs for real-time activity'),
        React.createElement('li', { key: 'sentry' }, 'Open browser console to see Sentry logging in action'),
        React.createElement('li', { key: 'end' }, 'Click "End Game" to finish the session and send logs to Sentry')
      ])
    ])
  ]);
};

// Export for use in other files
window.GameBoardDemo = GameBoardDemo; 