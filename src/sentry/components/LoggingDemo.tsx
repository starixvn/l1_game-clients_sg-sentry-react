import React, { useState, useCallback, useEffect, useRef } from 'react';
import { SentryLogLevel } from '../core/sentry-types';
import { SentryLogProvider, useGameSentryLogger, useSentryLog } from './sentry-log-context';

// Demo game component that uses the logging system
const DemoGame: React.FC = () => {
    const [gameState, setGameState] = useState<'playing' | 'paused' | 'ended'>('playing');
    const [selectedPieceId, setSelectedPieceId] = useState<string | null>(null);
    const [pieces, setPieces] = useState([
        { id: 'player1', type: 'player' as const, position: { x: 1, y: 1 } },
        { id: 'enemy1', type: 'enemy' as const, position: { x: 3, y: 2 } },
        { id: 'item1', type: 'item' as const, position: { x: 2, y: 3 } },
        { id: 'obstacle1', type: 'obstacle' as const, position: { x: 4, y: 1 } },
    ]);
    const initializedRef = useRef(false);

    const { logInfo, logWarn, logDebug } = useGameSentryLogger('DemoGame');

    // Session Replay functionality
    const {
        startSessionReplay,
        stopSessionReplay,
        trackInteraction,
        trackLifecycle,
        isRecording
    } = useSentryLog();

    // Log game initialization and start Session Replay - only once
    useEffect(() => {
        if (!initializedRef.current) {
            logInfo('Demo game initialized', {
                gameState,
                piecesCount: pieces.length,
                timestamp: Date.now()
            });

            // Start Session Replay for the game session
            startSessionReplay('DemoGame Session', {
                gameState,
                piecesCount: pieces.length,
                sessionType: 'game_session'
            });

            // Track component lifecycle
            trackLifecycle('mount', {
                component: 'DemoGame',
                gameState,
                piecesCount: pieces.length
            });

            initializedRef.current = true;
        }

        // Cleanup on unmount
        return () => {
            trackLifecycle('unmount', {
                component: 'DemoGame',
                finalGameState: gameState
            });
            stopSessionReplay();
        };
    }, []); // Empty dependency array since we use refs

    // Handle piece movement
    const handlePieceMove = useCallback((pieceId: string, newPosition: { x: number; y: number }) => {
        logInfo('Piece movement request received', {
            pieceId,
            newPosition,
            action: 'piece_movement_request'
        });

        setPieces(prevPieces =>
            prevPieces.map(piece =>
                piece.id === pieceId
                    ? { ...piece, position: newPosition }
                    : piece
            )
        );

        logInfo('Piece movement completed', {
            pieceId,
            newPosition,
            action: 'piece_movement_completed'
        });
    }, []); // No dependencies since logging functions are stable

    // Handle piece interaction
    const handlePieceInteraction = useCallback((pieceId: string, action: string) => {
        logInfo('Piece interaction request received', {
            pieceId,
            action,
            action_type: 'piece_interaction_request'
        });

        // Track interaction in Session Replay
        trackInteraction('piece_interaction', {
            pieceId,
            action,
            timestamp: Date.now()
        });

        // Simulate some game logic
        if (action === 'attack') {
            logWarn('Attack action performed', {
                pieceId,
                action,
                target: selectedPieceId
            });
        } else if (action === 'collect') {
            logInfo('Item collected', {
                pieceId,
                action,
                itemType: 'powerup'
            });
        }

        logInfo('Piece interaction completed', {
            pieceId,
            action,
            action_type: 'piece_interaction_completed'
        });
    }, [selectedPieceId]); // Include selectedPieceId in dependencies

    // Handle game state changes
    const handleGameStateChange = useCallback((newState: 'playing' | 'paused' | 'ended') => {
        logInfo('Game state change request', {
            fromState: gameState,
            toState: newState,
            action: 'game_state_change_request'
        });

        setGameState(newState);

        // Track state change in Session Replay
        trackInteraction('game_state_change', {
            fromState: gameState,
            toState: newState,
            timestamp: Date.now()
        });

        logInfo('Game state change completed', {
            fromState: gameState,
            toState: newState,
            action: 'game_state_change_completed'
        });
    }, [gameState]);

    // Handle piece selection
    const handlePieceSelect = useCallback((pieceId: string) => {
        logDebug('Piece selection request', {
            pieceId,
            previousSelection: selectedPieceId,
            action: 'piece_selection_request'
        });

        setSelectedPieceId(pieceId);

        // Track selection in Session Replay
        trackInteraction('piece_selection', {
            pieceId,
            previousSelection: selectedPieceId,
            timestamp: Date.now()
        });

        logDebug('Piece selection completed', {
            pieceId,
            previousSelection: selectedPieceId,
            action: 'piece_selection_completed'
        });
    }, [selectedPieceId]);

    return (
        <div className="demo-game" style={{ padding: '20px', border: '1px solid #ccc' }}>
            <h3>Demo Game - Sentry Logging Example</h3>
            
            <div style={{ marginBottom: '20px' }}>
                <h4>Game State: {gameState}</h4>
                <div>
                    <button 
                        onClick={() => handleGameStateChange('playing')}
                        disabled={gameState === 'playing'}
                        style={{ marginRight: '10px' }}
                    >
                        Play
                    </button>
                    <button 
                        onClick={() => handleGameStateChange('paused')}
                        disabled={gameState === 'paused'}
                        style={{ marginRight: '10px' }}
                    >
                        Pause
                    </button>
                    <button 
                        onClick={() => handleGameStateChange('ended')}
                        disabled={gameState === 'ended'}
                    >
                        End Game
                    </button>
                </div>
            </div>

            <div style={{ marginBottom: '20px' }}>
                <h4>Game Pieces</h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '10px' }}>
                    {pieces.map(piece => (
                        <div 
                            key={piece.id}
                            onClick={() => handlePieceSelect(piece.id)}
                            style={{
                                padding: '10px',
                                border: selectedPieceId === piece.id ? '2px solid blue' : '1px solid #ccc',
                                backgroundColor: piece.type === 'player' ? '#e3f2fd' : 
                                               piece.type === 'enemy' ? '#ffebee' : 
                                               piece.type === 'item' ? '#f3e5f5' : '#fafafa',
                                cursor: 'pointer',
                                textAlign: 'center'
                            }}
                        >
                            <div>{piece.type}</div>
                            <div>ID: {piece.id}</div>
                            <div>Pos: ({piece.position.x}, {piece.position.y})</div>
                        </div>
                    ))}
                </div>
            </div>

            {selectedPieceId && (
                <div style={{ marginBottom: '20px' }}>
                    <h4>Selected Piece: {selectedPieceId}</h4>
                    <div>
                        <button 
                            onClick={() => handlePieceInteraction(selectedPieceId, 'attack')}
                            style={{ marginRight: '10px' }}
                        >
                            Attack
                        </button>
                        <button 
                            onClick={() => handlePieceInteraction(selectedPieceId, 'collect')}
                            style={{ marginRight: '10px' }}
                        >
                            Collect
                        </button>
                        <button 
                            onClick={() => {
                                const piece = pieces.find(p => p.id === selectedPieceId);
                                if (piece) {
                                    const newPosition = { 
                                        x: piece.position.x + 1, 
                                        y: piece.position.y 
                                    };
                                    handlePieceMove(selectedPieceId, newPosition);
                                }
                            }}
                        >
                            Move Right
                        </button>
                    </div>
                </div>
            )}

            <div style={{ marginBottom: '20px' }}>
                <h4>Session Replay Status</h4>
                <div>Recording: {isRecording ? 'Yes' : 'No'}</div>
                <button 
                    onClick={() => isRecording ? stopSessionReplay() : startSessionReplay('Manual Session', {})}
                    style={{ marginTop: '10px' }}
                >
                    {isRecording ? 'Stop Recording' : 'Start Recording'}
                </button>
            </div>

            <div>
                <h4>Log Level Controls</h4>
                <p>Use the SentryLogProvider controls above to change log levels and see how logging behavior changes.</p>
            </div>
        </div>
    );
};

// Main LoggingDemo component that provides the SentryLogProvider
export const LoggingDemo: React.FC = () => {
    return (
        <SentryLogProvider 
            enabled={true}
            sentryConfig={{
                dsn: "https://example.sentry.io/dsn",
                environment: "development",
                componentName: "LoggingDemo",
                debug: false,
                logLevel: SentryLogLevel.INFO
            }}
        >
            <div style={{ padding: '20px' }}>
                <h2>Sentry Logging Demo</h2>
                <p>This demo shows how the Sentry logging system works with React components.</p>
                
                <DemoGame />
            </div>
        </SentryLogProvider>
    );
}; 