'use client';

import { useState, useEffect } from 'react';
import {
    logInfo,
    logWarning,
    logError,
    startWorkflow,
    completeWorkflow,
    trackPerformance
} from 'sg-sentry';
import { getComponentConfig } from '@/configs/app-settings';

interface GamePiece {
    id: string;
    x: number;
    y: number;
    type: 'player' | 'enemy' | 'collectible';
    color: string;
    isActive: boolean;
}

export function GameBoard() {
    const componentName = 'GameBoard';
    const componentConfig = getComponentConfig(componentName);

    const [gamePieces, setGamePieces] = useState<GamePiece[]>([]);
    const [score, setScore] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const [gameTime, setGameTime] = useState(0);
    const [currentWorkflowId, setCurrentWorkflowId] = useState<string>('');

    const BOARD_SIZE = 10;
    const CELL_SIZE = 40;

    useEffect(() => {
        if (isPlaying) {
            const interval = setInterval(() => {
                setGameTime(prev => prev + 1);
            }, 1000);
            return () => clearInterval(interval);
        }
    }, [isPlaying]);

    const initializeGame = () => {
        if (componentConfig.enableWorkflowTracking) {
            const workflowId = `game-session-${Date.now()}`;
            setCurrentWorkflowId(workflowId);
            startWorkflow(workflowId, 'Game Session', componentName, {
                timestamp: Date.now(),
                boardSize: BOARD_SIZE
            });
        }

        const pieces: GamePiece[] = [
            // Player
            {
                id: 'player',
                x: Math.floor(BOARD_SIZE / 2),
                y: Math.floor(BOARD_SIZE / 2),
                type: 'player',
                color: 'bg-blue-500',
                isActive: true
            },
            // Enemies
            ...Array.from({ length: 3 }, (_, i) => ({
                id: `enemy-${i}`,
                x: Math.floor(Math.random() * BOARD_SIZE),
                y: Math.floor(Math.random() * BOARD_SIZE),
                type: 'enemy' as const,
                color: 'bg-red-500',
                isActive: true
            })),
            // Collectibles
            ...Array.from({ length: 5 }, (_, i) => ({
                id: `collectible-${i}`,
                x: Math.floor(Math.random() * BOARD_SIZE),
                y: Math.floor(Math.random() * BOARD_SIZE),
                type: 'collectible' as const,
                color: 'bg-yellow-500',
                isActive: true
            }))
        ];

        setGamePieces(pieces);
        setScore(0);
        setGameTime(0);
        setIsPlaying(true);

        logInfo(componentName, 'Game initialized', {
            boardSize: BOARD_SIZE,
            pieceCount: pieces.length,
            timestamp: Date.now()
        });
    };

    const movePlayer = (dx: number, dy: number) => {
        if (!isPlaying) return;

        setGamePieces(prev => {
            const newPieces = [...prev];
            const player = newPieces.find(p => p.id === 'player');

            if (player) {
                const newX = Math.max(0, Math.min(BOARD_SIZE - 1, player.x + dx));
                const newY = Math.max(0, Math.min(BOARD_SIZE - 1, player.y + dy));

                // Check for collisions
                const collision = newPieces.find(p =>
                    p.id !== 'player' && p.isActive && p.x === newX && p.y === newY
                );

                if (collision) {
                    if (collision.type === 'enemy') {
                        // Game over
                        handleGameOver();
                        return prev;
                    } else if (collision.type === 'collectible') {
                        // Collect item
                        collision.isActive = false;
                        setScore(s => s + 10);

                        logInfo(componentName, 'Collectible collected', {
                            collectibleId: collision.id,
                            newScore: score + 10,
                            timestamp: Date.now()
                        });
                    }
                }

                player.x = newX;
                player.y = newY;

                logInfo(componentName, 'Player moved', {
                    newPosition: { x: newX, y: newY },
                    timestamp: Date.now()
                });
            }

            return newPieces;
        });
    };

    const handleGameOver = () => {
        setIsPlaying(false);

        if (componentConfig.enableWorkflowTracking && currentWorkflowId) {
            completeWorkflow(currentWorkflowId, componentName, true, {
                finalScore: score,
                gameTime,
                timestamp: Date.now()
            });
        }

        logInfo(componentName, 'Game over', {
            finalScore: score,
            gameTime,
            timestamp: Date.now()
        });
    };

    const handleKeyPress = (event: KeyboardEvent) => {
        if (!isPlaying) return;

        if (componentConfig.enablePerformanceTracking) {
            trackPerformance(componentName, 'key-handler', () => {
                switch (event.key) {
                    case 'ArrowUp':
                        movePlayer(0, -1);
                        break;
                    case 'ArrowDown':
                        movePlayer(0, 1);
                        break;
                    case 'ArrowLeft':
                        movePlayer(-1, 0);
                        break;
                    case 'ArrowRight':
                        movePlayer(1, 0);
                        break;
                }
            });
        } else {
            switch (event.key) {
                case 'ArrowUp':
                    movePlayer(0, -1);
                    break;
                case 'ArrowDown':
                    movePlayer(0, 1);
                    break;
                case 'ArrowLeft':
                    movePlayer(-1, 0);
                    break;
                case 'ArrowRight':
                    movePlayer(1, 0);
                    break;
            }
        }
    };

    useEffect(() => {
        document.addEventListener('keydown', handleKeyPress);
        return () => document.removeEventListener('keydown', handleKeyPress);
    }, [isPlaying]);

    const renderCell = (x: number, y: number) => {
        const piece = gamePieces.find(p => p.x === x && p.y === y && p.isActive);

        if (piece) {
            return (
                <div
                    key={`${x}-${y}`}
                    className={`w-10 h-10 ${piece.color} rounded-full flex items-center justify-center text-white font-bold text-sm border-2 border-white shadow-lg`}
                >
                    {piece.type === 'player' ? '👤' : piece.type === 'enemy' ? '👹' : '⭐'}
                </div>
            );
        }

        return (
            <div
                key={`${x}-${y}`}
                className="w-10 h-10 bg-gray-200 border border-gray-300 rounded"
            />
        );
    };

    const activeCollectibles = gamePieces.filter(p => p.type === 'collectible' && p.isActive).length;
    const activeEnemies = gamePieces.filter(p => p.type === 'enemy' && p.isActive).length;

    return (
        <div className="space-y-6">
            <div className="border-b border-gray-200 pb-4">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Game Board</h2>
                <p className="text-gray-600">
                    Interactive game board demonstrating SG-Sentry workflow and performance tracking.
                </p>
                <div className="mt-4 flex items-center space-x-4 text-sm text-gray-500">
                    <span>Log Level: <span className="font-medium">{componentConfig.logLevel}</span></span>
                    <span>Workflow: <span className="font-medium">{componentConfig.enableWorkflowTracking ? 'Enabled' : 'Disabled'}</span></span>
                    <span>Performance: <span className="font-medium">{componentConfig.enablePerformanceTracking ? 'Enabled' : 'Disabled'}</span></span>
                </div>
            </div>

            {/* Game Controls */}
            <div className="flex items-center justify-between">
                <div className="flex space-x-4">
                    {!isPlaying ? (
                        <button
                            onClick={initializeGame}
                            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                        >
                            Start Game
                        </button>
                    ) : (
                        <button
                            onClick={handleGameOver}
                            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                        >
                            End Game
                        </button>
                    )}
                </div>

                {/* Game Stats */}
                <div className="flex space-x-6 text-sm">
                    <div className="text-center">
                        <div className="font-bold text-gray-900">{score}</div>
                        <div className="text-gray-500">Score</div>
                    </div>
                    <div className="text-center">
                        <div className="font-bold text-gray-900">{gameTime}s</div>
                        <div className="text-gray-500">Time</div>
                    </div>
                    <div className="text-center">
                        <div className="font-bold text-gray-900">{activeCollectibles}</div>
                        <div className="text-gray-500">Collectibles</div>
                    </div>
                    <div className="text-center">
                        <div className="font-bold text-gray-900">{activeEnemies}</div>
                        <div className="text-gray-500">Enemies</div>
                    </div>
                </div>
            </div>

            {/* Game Board */}
            <div className="flex justify-center">
                <div className="bg-white border-2 border-gray-300 rounded-lg p-4 shadow-lg">
                    <div
                        className="grid gap-1"
                        style={{
                            gridTemplateColumns: `repeat(${BOARD_SIZE}, ${CELL_SIZE}px)`,
                            gridTemplateRows: `repeat(${BOARD_SIZE}, ${CELL_SIZE}px)`
                        }}
                    >
                        {Array.from({ length: BOARD_SIZE * BOARD_SIZE }, (_, i) => {
                            const x = i % BOARD_SIZE;
                            const y = Math.floor(i / BOARD_SIZE);
                            return renderCell(x, y);
                        })}
                    </div>
                </div>
            </div>

            {/* Instructions */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="text-sm font-medium text-blue-800 mb-2">How to Play</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-700">
                    <div>
                        <p><strong>👤 Player (Blue):</strong> Use arrow keys to move</p>
                        <p><strong>⭐ Collectibles (Yellow):</strong> Collect for points</p>
                    </div>
                    <div>
                        <p><strong>👹 Enemies (Red):</strong> Avoid or game over</p>
                        <p><strong>Goal:</strong> Collect all items while avoiding enemies</p>
                    </div>
                </div>
            </div>

            {/* Component Configuration Info */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="text-sm font-medium text-blue-800 mb-2">Component Configuration</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div>
                        <span className="text-blue-600 font-medium">Component:</span>
                        <span className="ml-2 text-blue-800">{componentName}</span>
                    </div>
                    <div>
                        <span className="text-blue-600 font-medium">Log Level:</span>
                        <span className="ml-2 text-blue-800">{componentConfig.logLevel}</span>
                    </div>
                    <div>
                        <span className="text-blue-600 font-medium">Workflow Tracking:</span>
                        <span className="ml-2 text-blue-800">{componentConfig.enableWorkflowTracking ? '✅' : '❌'}</span>
                    </div>
                    <div>
                        <span className="text-blue-600 font-medium">Performance Tracking:</span>
                        <span className="ml-2 text-blue-800">{componentConfig.enablePerformanceTracking ? '✅' : '❌'}</span>
                    </div>
                </div>
            </div>
        </div>
    );
} 