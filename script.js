class Minesweeper {
    constructor() {
        this.boardSize = 5;
        this.mineCount = 1;
        this.board = [];
        this.gameBoard = document.getElementById('gameBoard');
        this.mineCountElement = document.getElementById('mineCount');
        this.scoreElement = document.getElementById('score');
        this.newGameBtn = document.getElementById('newGameBtn');
        this.videoModal = document.getElementById('videoModal');
        this.closeModal = document.getElementById('closeModal');
        this.youtubeVideo = document.getElementById('youtubeVideo');
        this.modalTitle = document.getElementById('modalTitle');
        
        this.gameStarted = false;
        this.gameOver = false;
        this.subscribers = 0;
        this.revealedCount = 0;
        this.minesFound = 0;
        
        this.mineTypes = [
            { color: 'red', videoId: 'dQw4w9WgXcQ', name: 'Red Mine' },
            { color: 'blue', videoId: 'dQw4w9WgXcQ', name: 'Blue Mine' },
            { color: 'green', videoId: 'dQw4w9WgXcQ', name: 'Green Mine' },
            { color: 'orange', videoId: 'dQw4w9WgXcQ', name: 'Orange Mine' },
            { color: 'yellow', videoId: 'dQw4w9WgXcQ', name: 'Yellow Mine' },
            { color: 'pink', videoId: 'dQw4w9WgXcQ', name: 'Pink Mine' },
            { color: 'cyan', videoId: 'dQw4w9WgXcQ', name: 'Cyan Mine' },
            { color: 'gray', videoId: 'dQw4w9WgXcQ', name: 'Gray Mine' },
            { color: 'coral', videoId: 'dQw4w9WgXcQ', name: 'Coral Mine' },
            { color: 'teal', videoId: 'dQw4w9WgXcQ', name: 'Teal Mine' },
            { color: 'brown', videoId: 'dQw4w9WgXcQ', name: 'Brown Mine' }
        ];
        
        this.init();
    }
    
    init() {
        this.createBoard();
        this.placeMines();
        this.renderBoard();
        this.updateMineCount();
        this.updateSubscribers();
        this.setupEventListeners();
    }
    
    createBoard() {
        this.board = [];
        for (let i = 0; i < this.boardSize; i++) {
            this.board[i] = [];
            for (let j = 0; j < this.boardSize; j++) {
                this.board[i][j] = {
                    isMine: false,
                    mineType: null,
                    isRevealed: false,
                    isFlagged: false,
                    row: i,
                    col: j
                };
            }
        }
    }
    
    placeMines() {
        let minesPlaced = 0;
        while (minesPlaced < this.mineCount) {
            const row = Math.floor(Math.random() * this.boardSize);
            const col = Math.floor(Math.random() * this.boardSize);
            
            if (!this.board[row][col].isMine) {
                this.board[row][col].isMine = true;

                this.board[row][col].mineType = this.mineTypes[minesPlaced];
                minesPlaced++;
            }
        }
    }
    
    renderBoard() {
        this.gameBoard.innerHTML = '';
        for (let i = 0; i < this.boardSize; i++) {
            for (let j = 0; j < this.boardSize; j++) {
                const cell = document.createElement('div');
                cell.className = 'cell';
                cell.dataset.row = i;
                cell.dataset.col = j;
                
                if (this.board[i][j].isRevealed) {
                    cell.classList.add('revealed');
                    if (this.board[i][j].isMine) {
                        cell.classList.add('mine');

                        if (this.board[i][j].mineType) {
                            cell.classList.add(`mine-${this.board[i][j].mineType.color}`);
                        }
                        cell.textContent = '💣';
                    } else {
                        cell.textContent = '💎';
                    }
                } else if (this.board[i][j].isFlagged) {
                    cell.classList.add('flagged');
                    cell.textContent = '🚩';
                }
                
                this.gameBoard.appendChild(cell);
            }
        }
    }
    
    renderSingleCell(row, col) {
        const cellElement = this.gameBoard.querySelector(`[data-row="${row}"][data-col="${col}"]`);
        if (!cellElement) return;
        
        const cell = this.board[row][col];
        
        // Remove existing classes
        cellElement.className = 'cell';
        
        if (cell.isRevealed) {
            cellElement.classList.add('revealed');
            if (cell.isMine) {
                cellElement.classList.add('mine');
                if (cell.mineType) {
                    cellElement.classList.add(`mine-${cell.mineType.color}`);
                }
                cellElement.textContent = '💣';
            } else {
                cellElement.textContent = '💎';
            }
        } else if (cell.isFlagged) {
            cellElement.classList.add('flagged');
            cellElement.textContent = '🚩';
        }
    }
    
    setupEventListeners() {
        this.gameBoard.addEventListener('click', (e) => {
            if (e.target.classList.contains('cell') && !this.gameOver) {
                const row = parseInt(e.target.dataset.row);
                const col = parseInt(e.target.dataset.col);
                this.handleCellClick(row, col);
            }
        });
        
        this.newGameBtn.addEventListener('click', () => {
            this.hideVideoModal();
            this.resetGame();
        });
        
        this.closeModal.addEventListener('click', () => {
            this.hideVideoModal();
        });
        
        window.addEventListener('click', (e) => {
            if (e.target === this.videoModal) {
                this.hideVideoModal();
            }
        });
    }
    
    handleCellClick(row, col) {
        if (!this.gameStarted) {
            this.gameStarted = true;
        }
        
        const cell = this.board[row][col];
        
        if (cell.isFlagged || cell.isRevealed) {
            return;
        }
        
        if (cell.isMine) {
            this.playMineSound();
            this.gameOver = true;
            this.revealAllMines();
            this.subscribers = 0;
            this.updateSubscribers();
            setTimeout(() => {
                this.showVideoModal(cell.mineType);
            }, 1000);
            return;
        }
        
        this.revealCell(row, col);
        this.renderSingleCell(row, col);
        
        if (this.revealedCount === this.boardSize * this.boardSize - this.mineCount) {
            this.gameOver = true;
            setTimeout(() => {
                this.showVideoModal({ color: 'win', videoId: 'dQw4w9WgXcQ', name: 'Congratulations!' });
            }, 500);
        }
    }
    
    revealCell(row, col) {
        const cell = this.board[row][col];
        
        if (cell.isRevealed || cell.isFlagged) {
            return;
        }
        
        cell.isRevealed = true;
        this.revealedCount++;
        
        this.subscribers += 1;
        this.updateSubscribers();
        
        this.playClickSound();
        
        if (cell.isMine) {
            this.minesFound++;
        }
    }
    
    revealAllMines() {
        for (let i = 0; i < this.boardSize; i++) {
            for (let j = 0; j < this.boardSize; j++) {
                if (this.board[i][j].isMine) {
                    this.board[i][j].isRevealed = true;
                }
            }
        }
        this.renderBoard();
    }
    
    playClickSound() {
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
            oscillator.frequency.exponentialRampToValueAtTime(400, audioContext.currentTime + 0.1);
            
            gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
            
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.1);
        } catch (e) {
            // Audio context not supported
        }
    }

    playMineSound() {
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            oscillator.type = 'triangle';
            oscillator.frequency.setValueAtTime(120, audioContext.currentTime);
            oscillator.frequency.exponentialRampToValueAtTime(40, audioContext.currentTime + 0.25);
            gainNode.gain.setValueAtTime(0.25, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.25);
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.25);
        } catch (e) {
            // Audio context not supported
        }
    }
    
    updateMineCount() {
        this.mineCountElement.textContent = this.mineCount;
        // Update the label based on count
        const mineLabel = document.getElementById('mineLabel');
        if (mineLabel) {
            mineLabel.textContent = this.mineCount === 1 ? 'ad' : 'ads';
        }
    }
    
    updateSubscribers() {
        this.scoreElement.textContent = this.subscribers;
    }
    
    showVideoModal(mineType) {
        if (mineType.color === 'win') {
            this.modalTitle.innerHTML = `<span style="color:rgb(0, 255, 128); font-size: 1.1em;">🎉 Congratulations! You’ve collected every subscriber!</span><span style="color: white; font-size: 1em;"> <br style="margin: 2px 0;"><i>However, you still need a <span style=\"color: #FFD700;\">good editor</span>!</i></span>`;
        } else {
            this.modalTitle.innerHTML = `<span style="color: ${this.getMineColor(mineType.color)}; font-size: 1.1em;">💥 ${mineType.color.charAt(0).toUpperCase() + mineType.color.slice(1)} Mine Found!</span><span style="color: white; font-size: 1em;"> You lost all your subscribers...<br style="margin: 2px 0;"><i>To get them back, you need to work with a <span style=\"color: #FFD700;\">good editor</span>!</i></span>`;
        }
        this.youtubeVideo.src = `https://www.youtube.com/embed/${mineType.videoId}?autoplay=1`;
        this.videoModal.style.display = 'block';
    }
    
    hideVideoModal() {
        this.videoModal.style.display = 'none';
        this.youtubeVideo.src = '';
    }
    
    resetGame() {
        this.gameOver = false;
        this.gameStarted = false;
        this.revealedCount = 0;
        this.minesFound = 0;
        this.subscribers = 0;
        this.gameBoard.style.animation = '';
        this.updateSubscribers();
        this.init();
    }
    
    setMineCount(count) {
        this.mineCount = count;
        this.updateMineCount();
        this.resetGame();
    }

    getMineColor(color) {
        const colorMap = {
            'red': '#ff4444',
            'blue': '#4444ff',
            'green': '#44ff44',
            'purple': '#ff44ff',
            'orange': '#ff8844',
            'yellow': '#ffff44',
            'pink': '#ff44aa',
            'cyan': '#44ffff',
            'brown': '#aa6644',
            'gray': '#888888',
            'teal': '#44aaaa',
        };
        return colorMap[color] || '#ff4444';
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const game = new Minesweeper();
    
    window.minesweeperGame = game;
});

const style = document.createElement('style');
style.textContent = `
    @keyframes fadeOut {
        from { opacity: 1; transform: scale(1); }
        to { opacity: 0; transform: scale(0.8); }
    }
`;
document.head.appendChild(style);
