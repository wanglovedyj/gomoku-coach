const { GomokuAI, BOARD_SIZE } = require('../../utils/ai.js')

Page({
  data: {
    mode: 'pvp',          // pvp, pve-easy, pve-medium, pve-hard
    board: [],            // 0=空, 1=黑, 2=白
    stones: [],           // 已下棋子
    currentPlayer: 'black', // black, white
    gameOver: false,
    winner: null,
    ai: null
  },

  onLoad(options) {
    const mode = options.mode || 'pvp'
    const aiLevel = mode.replace('pve-', '')
    
    this.setData({
      mode,
      ai: mode.startsWith('pve') ? new GomokuAI(aiLevel) : null
    })
    
    this.initBoard()
  },

  // 初始化棋盘
  initBoard() {
    const board = Array(BOARD_SIZE).fill(null).map(() => Array(BOARD_SIZE).fill(0))
    this.setData({
      board,
      stones: [],
      currentPlayer: 'black',
      gameOver: false,
      winner: null
    })
  },

  // 点击格子
  onCellTap(e) {
    const { x, y } = e.currentTarget.dataset
    
    if (this.data.gameOver) return
    if (this.data.board[y][x] !== 0) return
    
    // PVE模式下，玩家必须是黑棋
    if (this.data.mode.startsWith('pve') && this.data.currentPlayer !== 'black') return

    this.placeStone(x, y)
  },

  // 落子
  placeStone(x, y) {
    const player = this.data.currentPlayer === 'black' ? 1 : 2
    const board = this.data.board
    board[y][x] = player

    const stones = this.data.stones
    stones.push({
      x: parseInt(x),
      y: parseInt(y),
      color: this.data.currentPlayer,
      isNew: true
    })

    // 移除之前的new标记
    if (stones.length > 1) {
      stones[stones.length - 2].isNew = false
    }

    this.setData({ board, stones })

    // 检查胜负
    if (this.checkWin(x, y, player)) {
      this.setData({
        gameOver: true,
        winner: this.data.currentPlayer
      })
      wx.showToast({
        title: (this.data.currentPlayer === 'black' ? '黑棋' : '白棋') + '获胜！',
        icon: 'none',
        duration: 2000
      })
      return
    }

    // 检查平局
    if (stones.length >= BOARD_SIZE * BOARD_SIZE) {
      this.setData({ gameOver: true })
      wx.showToast({
        title: '平局！',
        icon: 'none'
      })
      return
    }

    // 切换玩家
    this.switchPlayer()

    // AI回合
    if (this.data.mode.startsWith('pve') && this.data.currentPlayer === 'white') {
      setTimeout(() => this.aiMove(), 500)
    }
  },

  // AI落子
  aiMove() {
    if (this.data.gameOver) return

    const move = this.data.ai.getBestMove(this.data.board, 2)
    this.placeStone(move.x, move.y)
  },

  // 切换玩家
  switchPlayer() {
    this.setData({
      currentPlayer: this.data.currentPlayer === 'black' ? 'white' : 'black'
    })
  },

  // 检查胜负
  checkWin(x, y, player) {
    const directions = [
      [1, 0],   // 横
      [0, 1],   // 竖
      [1, 1],   // 右斜
      [1, -1]   // 左斜
    ]

    for (const [dx, dy] of directions) {
      let count = 1

      // 正向
      for (let i = 1; i < 5; i++) {
        const nx = parseInt(x) + dx * i
        const ny = parseInt(y) + dy * i
        if (nx >= 0 && nx < BOARD_SIZE && ny >= 0 && ny < BOARD_SIZE &&
            this.data.board[ny][nx] === player) {
          count++
        } else {
          break
        }
      }

      // 反向
      for (let i = 1; i < 5; i++) {
        const nx = parseInt(x) - dx * i
        const ny = parseInt(y) - dy * i
        if (nx >= 0 && nx < BOARD_SIZE && ny >= 0 && ny < BOARD_SIZE &&
            this.data.board[ny][nx] === player) {
          count++
        } else {
          break
        }
      }

      if (count >= 5) return true
    }

    return false
  },

  // 悔棋
  undoMove() {
    if (this.data.stones.length === 0 || this.data.gameOver) return

    // PVE模式下，需要悔两步（玩家和AI）
    const steps = this.data.mode.startsWith('pve') && this.data.stones.length >= 2 ? 2 : 1

    for (let i = 0; i < steps; i++) {
      if (this.data.stones.length === 0) break
      
      const lastStone = this.data.stones.pop()
      this.data.board[lastStone.y][lastStone.x] = 0
    }

    // 更新new标记
    if (this.data.stones.length > 0) {
      this.data.stones[this.data.stones.length - 1].isNew = true
    }

    this.setData({
      stones: this.data.stones,
      board: this.data.board,
      currentPlayer: 'black',
      gameOver: false,
      winner: null
    })
  },

  // 重新开始
  restartGame() {
    wx.showModal({
      title: '确认',
      content: '确定要重新开始吗？',
      success: (res) => {
        if (res.confirm) {
          this.initBoard()
        }
      }
    })
  },

  // 返回菜单
  backToMenu() {
    wx.navigateBack()
  }
})