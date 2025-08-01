import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useSentryHelper, SentryLogLevel } from '../../hooks/useSentry';
import { SGSentryDevErrorBoundary } from '../../sentry/components/SGSentryDevErrorBoundary';

interface GameDemoProps {
    gameId?: string;
    sessionId?: string;
    onGameEnd?: () => void;
}

interface GameState {
    playerHealth: number;
    playerScore: number;
    gameLevel: number;
    enemiesDefeated: number;
    itemsCollected: number;
    gameStatus: 'idle' | 'playing' | 'paused' | 'gameOver' | 'victory';
    lastAction: string;
    timestamp: number;
}

export const GameDemo: React.FC<GameDemoProps> = ({
    gameId = 'demo-game-001',
    sessionId = `session-${Date.now()}`,
    onGameEnd
}) => {
    const [gameState, setGameState] = useState<GameState>({
        playerHealth: 100,
        playerScore: 0,
        gameLevel: 1,
        enemiesDefeated: 0,
        itemsCollected: 0,
        gameStatus: 'idle',
        lastAction: 'Game initialized',
        timestamp: Date.now()
    });

    const [logs, setLogs] = useState<string[]>([]);
    const [showLogs, setShowLogs] = useState(false);
    const gameIntervalRef = useRef<NodeJS.Timeout | null>(null);
    const initializedRef = useRef(false);

    // Configure Sentry logging based on configs.LOCAL_1.json pattern
    const { 
        logTrace, 
        logDebug, 
        logInfo, 
        logWarning, 
        logError, 
        logFatal,
        startWorkflow,
        completeWorkflow,
        trackPerformance
    } = useSentryHelper({
        componentName: 'GameDemo',
        logLevel: SentryLogLevel.INFO,
        enableWorkflowTracking: true,
        enablePerformanceTracking: true
    });

    // Add log to UI
    const addLog = (message: string, level: string = 'info') => {
        const timestamp = new Date().toLocaleTimeString();
        const logEntry = `[${timestamp}] [${level.toUpperCase()}] ${message}`;
        setLogs(prev => [...prev.slice(-49), logEntry]); // Keep last 50 logs
    };

    // Initialize game with comprehensive logging
    useEffect(() => {
        if (!initializedRef.current) {
            logTrace('GameDemo component initialization started', {
                gameId,
                sessionId,
                timestamp: Date.now()
            });

            logInfo('GameDemo component initialized', {
                gameId,
                sessionId,
                initialHealth: gameState.playerHealth,
                initialScore: gameState.playerScore,
                timestamp: Date.now()
            });

            addLog('Game demo initialized successfully', 'info');
            initializedRef.current = true;
        }
    }, [gameId, sessionId, logTrace, logInfo]);

    // Update game state with logging
    const updateGameState = useCallback((updates: Partial<GameState>, action: string) => {
        const oldState = { ...gameState };
        const newState = { ...gameState, ...updates, lastAction: action, timestamp: Date.now() };
        
        setGameState(newState);

        // Log state changes based on action type
        switch (action) {
            case 'player_damage':
                logWarning('Player took damage', {
                    gameId,
                    sessionId,
                    oldHealth: oldState.playerHealth,
                    newHealth: newState.playerHealth,
                    damage: oldState.playerHealth - newState.playerHealth,
                    action
                });
                addLog(`Player took damage! Health: ${oldState.playerHealth} → ${newState.playerHealth}`, 'warning');
                break;

            case 'player_heal':
                logInfo('Player healed', {
                    gameId,
                    sessionId,
                    oldHealth: oldState.playerHealth,
                    newHealth: newState.playerHealth,
                    healAmount: newState.playerHealth - oldState.playerHealth,
                    action
                });
                addLog(`Player healed! Health: ${oldState.playerHealth} → ${newState.playerHealth}`, 'info');
                break;

            case 'enemy_defeated':
                logInfo('Enemy defeated', {
                    gameId,
                    sessionId,
                    enemiesDefeated: newState.enemiesDefeated,
                    scoreGained: newState.playerScore - oldState.playerScore,
                    action
                });
                addLog(`Enemy defeated! Score: ${oldState.playerScore} → ${newState.playerScore}`, 'info');
                break;

            case 'item_collected':
                logDebug('Item collected', {
                    gameId,
                    sessionId,
                    itemsCollected: newState.itemsCollected,
                    action
                });
                addLog(`Item collected! Total: ${newState.itemsCollected}`, 'debug');
                break;

            case 'level_up':
                logInfo('Level up achieved', {
                    gameId,
                    sessionId,
                    oldLevel: oldState.gameLevel,
                    newLevel: newState.gameLevel,
                    action
                });
                addLog(`Level up! Level: ${oldState.gameLevel} → ${newState.gameLevel}`, 'info');
                break;

            case 'game_over':
                logError('Game over', {
                    gameId,
                    sessionId,
                    finalScore: newState.playerScore,
                    finalLevel: newState.gameLevel,
                    enemiesDefeated: newState.enemiesDefeated,
                    itemsCollected: newState.itemsCollected,
                    action
                });
                addLog('Game Over!', 'error');
                break;

            case 'victory':
                logInfo('Victory achieved', {
                    gameId,
                    sessionId,
                    finalScore: newState.playerScore,
                    finalLevel: newState.gameLevel,
                    enemiesDefeated: newState.enemiesDefeated,
                    itemsCollected: newState.itemsCollected,
                    action
                });
                addLog('Victory!', 'info');
                break;

            default:
                logDebug('Game state updated', {
                    gameId,
                    sessionId,
                    action,
                    oldState,
                    newState
                });
        }
    }, [gameState, gameId, sessionId, logTrace, logDebug, logInfo, logWarning, logError, logFatal]);

    // Game actions with comprehensive logging
    const startGame = useCallback(() => {
        const workflowId = startWorkflow('game_session_start', {
            gameId,
            sessionId,
            action: 'start_game'
        });

        logInfo('Game session started', {
            gameId,
            sessionId,
            workflowId,
            action: 'start_game'
        });

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
                        completeWorkflow(workflowId, 'failed', { reason: 'player_health_zero' });
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
                        completeWorkflow(workflowId, 'success', { finalLevel: newState.gameLevel });
                    }
                }

                return newState;
            });
        }, 2000);

        trackPerformance('game_loop_start', { gameId, sessionId });
    }, [gameId, sessionId, logInfo, startWorkflow, completeWorkflow, trackPerformance, updateGameState]);

    const pauseGame = useCallback(() => {
        logInfo('Game paused', {
            gameId,
            sessionId,
            currentScore: gameState.playerScore,
            currentLevel: gameState.gameLevel,
            action: 'pause_game'
        });

        updateGameState({ gameStatus: 'paused' }, 'game_paused');
        addLog('Game paused', 'info');

        if (gameIntervalRef.current) {
            clearInterval(gameIntervalRef.current);
            gameIntervalRef.current = null;
        }
    }, [gameId, sessionId, gameState.playerScore, gameState.gameLevel, logInfo, updateGameState]);

    const resumeGame = useCallback(() => {
        logInfo('Game resumed', {
            gameId,
            sessionId,
            currentScore: gameState.playerScore,
            currentLevel: gameState.gameLevel,
            action: 'resume_game'
        });

        updateGameState({ gameStatus: 'playing' }, 'game_resumed');
        addLog('Game resumed', 'info');

        // Restart game loop
        if (!gameIntervalRef.current) {
            startGame();
        }
    }, [gameId, sessionId, gameState.playerScore, gameState.gameLevel, logInfo, updateGameState, startGame]);

    const endGame = useCallback(() => {
        logInfo('Game ended manually', {
            gameId,
            sessionId,
            finalScore: gameState.playerScore,
            finalLevel: gameState.gameLevel,
            enemiesDefeated: gameState.enemiesDefeated,
            itemsCollected: gameState.itemsCollected,
            action: 'end_game'
        });

        updateGameState({ gameStatus: 'idle' }, 'game_ended_manually');
        addLog('Game ended manually', 'info');

        if (gameIntervalRef.current) {
            clearInterval(gameIntervalRef.current);
            gameIntervalRef.current = null;
        }

        if (onGameEnd) {
            onGameEnd();
        }
    }, [gameId, sessionId, gameState, logInfo, updateGameState, onGameEnd]);

    const simulateError = useCallback(() => {
        logError('Simulated game error', {
            gameId,
            sessionId,
            errorType: 'simulated_error',
            currentState: gameState,
            action: 'simulate_error'
        });

        addLog('Simulated error logged', 'error');
    }, [gameId, sessionId, gameState, logError]);

    const simulateFatalError = useCallback(() => {
        logFatal('Simulated fatal game error', {
            gameId,
            sessionId,
            errorType: 'simulated_fatal_error',
            currentState: gameState,
            action: 'simulate_fatal_error'
        });

        addLog('Simulated fatal error logged', 'fatal');
    }, [gameId, sessionId, gameState, logFatal]);

    const clearLogs = useCallback(() => {
        logDebug('Logs cleared manually', {
            gameId,
            sessionId,
            action: 'clear_logs'
        });

        setLogs([]);
        addLog('Logs cleared', 'debug');
    }, [gameId, sessionId, logDebug]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (gameIntervalRef.current) {
                clearInterval(gameIntervalRef.current);
            }
            
            logInfo('GameDemo component unmounting', {
                gameId,
                sessionId,
                finalState: gameState,
                action: 'component_unmount'
            });
        };
    }, [gameId, sessionId, gameState, logInfo]);

    return (
        <SGSentryDevErrorBoundary componentName="GameDemo">
            <div className="game-demo" style={{
                padding: '20px',
                backgroundColor: '#f8f9fa',
                borderRadius: '10px',
                border: '1px solid #dee2e6'
            }}>
                <h2 style={{ color: '#2c3e50', marginBottom: '20px' }}>🎮 Game Demo with Sentry Logging</h2>
                
                {/* Game Status Display */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                    gap: '15px',
                    marginBottom: '20px'
                }}>
                    <div style={{
                        padding: '10px',
                        backgroundColor: '#e3f2fd',
                        borderRadius: '5px',
                        textAlign: 'center'
                    }}>
                        <div style={{ fontWeight: 'bold', color: '#1976d2' }}>Health</div>
                        <div style={{ fontSize: '1.2em', color: gameState.playerHealth < 30 ? '#f44336' : '#4caf50' }}>
                            {gameState.playerHealth}
                        </div>
                    </div>
                    <div style={{
                        padding: '10px',
                        backgroundColor: '#e8f5e8',
                        borderRadius: '5px',
                        textAlign: 'center'
                    }}>
                        <div style={{ fontWeight: 'bold', color: '#388e3c' }}>Score</div>
                        <div style={{ fontSize: '1.2em' }}>{gameState.playerScore}</div>
                    </div>
                    <div style={{
                        padding: '10px',
                        backgroundColor: '#fff3e0',
                        borderRadius: '5px',
                        textAlign: 'center'
                    }}>
                        <div style={{ fontWeight: 'bold', color: '#f57c00' }}>Level</div>
                        <div style={{ fontSize: '1.2em' }}>{gameState.gameLevel}</div>
                    </div>
                    <div style={{
                        padding: '10px',
                        backgroundColor: '#fce4ec',
                        borderRadius: '5px',
                        textAlign: 'center'
                    }}>
                        <div style={{ fontWeight: 'bold', color: '#c2185b' }}>Status</div>
                        <div style={{ fontSize: '1.2em', textTransform: 'capitalize' }}>{gameState.gameStatus}</div>
                    </div>
                </div>

                {/* Game Statistics */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
                    gap: '10px',
                    marginBottom: '20px'
                }}>
                    <div style={{ textAlign: 'center' }}>
                        <div style={{ fontWeight: 'bold' }}>Enemies Defeated</div>
                        <div>{gameState.enemiesDefeated}</div>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                        <div style={{ fontWeight: 'bold' }}>Items Collected</div>
                        <div>{gameState.itemsCollected}</div>
                    </div>
                </div>

                {/* Game Controls */}
                <div style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: '10px',
                    marginBottom: '20px'
                }}>
                    {gameState.gameStatus === 'idle' && (
                        <button
                            onClick={startGame}
                            style={{
                                padding: '10px 20px',
                                backgroundColor: '#4caf50',
                                color: 'white',
                                border: 'none',
                                borderRadius: '5px',
                                cursor: 'pointer',
                                fontSize: '14px'
                            }}
                        >
                            Start Game
                        </button>
                    )}
                    
                    {gameState.gameStatus === 'playing' && (
                        <button
                            onClick={pauseGame}
                            style={{
                                padding: '10px 20px',
                                backgroundColor: '#ff9800',
                                color: 'white',
                                border: 'none',
                                borderRadius: '5px',
                                cursor: 'pointer',
                                fontSize: '14px'
                            }}
                        >
                            Pause Game
                        </button>
                    )}
                    
                    {gameState.gameStatus === 'paused' && (
                        <button
                            onClick={resumeGame}
                            style={{
                                padding: '10px 20px',
                                backgroundColor: '#2196f3',
                                color: 'white',
                                border: 'none',
                                borderRadius: '5px',
                                cursor: 'pointer',
                                fontSize: '14px'
                            }}
                        >
                            Resume Game
                        </button>
                    )}
                    
                    {(gameState.gameStatus === 'playing' || gameState.gameStatus === 'paused') && (
                        <button
                            onClick={endGame}
                            style={{
                                padding: '10px 20px',
                                backgroundColor: '#f44336',
                                color: 'white',
                                border: 'none',
                                borderRadius: '5px',
                                cursor: 'pointer',
                                fontSize: '14px'
                            }}
                        >
                            End Game
                        </button>
                    )}
                </div>

                {/* Sentry Testing Controls */}
                <div style={{ marginBottom: '20px' }}>
                    <h3 style={{ color: '#34495e', marginBottom: '10px' }}>🧪 Sentry Testing</h3>
                    <div style={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        gap: '8px'
                    }}>
                        <button
                            onClick={simulateError}
                            style={{
                                padding: '8px 16px',
                                backgroundColor: '#f44336',
                                color: 'white',
                                border: 'none',
                                borderRadius: '5px',
                                cursor: 'pointer',
                                fontSize: '12px'
                            }}
                        >
                            Simulate Error
                        </button>
                        <button
                            onClick={simulateFatalError}
                            style={{
                                padding: '8px 16px',
                                backgroundColor: '#9c27b0',
                                color: 'white',
                                border: 'none',
                                borderRadius: '5px',
                                cursor: 'pointer',
                                fontSize: '12px'
                            }}
                        >
                            Simulate Fatal
                        </button>
                        <button
                            onClick={() => setShowLogs(!showLogs)}
                            style={{
                                padding: '8px 16px',
                                backgroundColor: '#607d8b',
                                color: 'white',
                                border: 'none',
                                borderRadius: '5px',
                                cursor: 'pointer',
                                fontSize: '12px'
                            }}
                        >
                            {showLogs ? 'Hide Logs' : 'Show Logs'}
                        </button>
                        <button
                            onClick={clearLogs}
                            style={{
                                padding: '8px 16px',
                                backgroundColor: '#795548',
                                color: 'white',
                                border: 'none',
                                borderRadius: '5px',
                                cursor: 'pointer',
                                fontSize: '12px'
                            }}
                        >
                            Clear Logs
                        </button>
                    </div>
                </div>

                {/* Game Logs */}
                {showLogs && (
                    <div style={{
                        backgroundColor: '#2d3748',
                        color: '#e2e8f0',
                        padding: '15px',
                        borderRadius: '5px',
                        maxHeight: '300px',
                        overflowY: 'auto',
                        fontFamily: 'monospace',
                        fontSize: '12px'
                    }}>
                        <div style={{ marginBottom: '10px', fontWeight: 'bold' }}>Game Logs:</div>
                        {logs.length === 0 ? (
                            <div style={{ color: '#a0aec0' }}>No logs yet...</div>
                        ) : (
                            logs.map((log, index) => (
                                <div key={index} style={{ marginBottom: '2px' }}>{log}</div>
                            ))
                        )}
                    </div>
                )}

                {/* Last Action Display */}
                <div style={{
                    marginTop: '15px',
                    padding: '10px',
                    backgroundColor: '#f1f3f4',
                    borderRadius: '5px',
                    fontSize: '14px'
                }}>
                    <strong>Last Action:</strong> {gameState.lastAction}
                </div>
            </div>
        </SGSentryDevErrorBoundary>
    );
}; 