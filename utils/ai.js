// 游戏配置
const BOARD_SIZE = 15

// 方向数组：横、竖、左斜、右斜
const DIRECTIONS = [
  [1, 0],   // 横
  [0, 1],   // 竖
  [1, 1],   // 右斜
  [1, -1]   // 左斜
]

// 棋型评分
const SCORES = {
  FIVE: 100000,           // 五连
  FOUR: 10000,            // 活四
  BLOCKED_FOUR: 1000,     // 冲四
  THREE: 1000,            // 活三
  BLOCKED_THREE: 100,     // 眠三
  TWO: 100,               // 活二
  BLOCKED_TWO: 10,        // 眠二
  ONE: 10                 // 活一
}

class GomokuAI {
  constructor(level = 'medium') {
    this.level = level
    this.maxDepth = level === 'easy' ? 1 : level === 'medium' ? 2 : 3
  }

  // 获取最佳落子
  getBestMove(board, player) {
    const moves = this.getCandidateMoves(board)
    
    if (moves.length === 0) {
      return { x: 7, y: 7 }
    }

    // 简单级别：随机选择评分较高的位置
    if (this.level === 'easy') {
      moves.sort((a, b) => b.score - a.score)
      const topMoves = moves.slice(0, Math.min(5, moves.length))
      return topMoves[Math.floor(Math.random() * topMoves.length)]
    }

    // 中高级：使用 minimax + 剪枝
    let bestMove = moves[0]
    let bestScore = -Infinity

    for (const move of moves.slice(0, 10)) {
      board[move.y][move.x] = player
      const score = this.minimax(board, this.maxDepth, -Infinity, Infinity, false, player, this.getOpponent(player))
      board[move.y][move.x] = 0

      if (score > bestScore) {
        bestScore = score
        bestMove = move
      }
    }

    return bestMove
  }

  // 获取候选落子点
  getCandidateMoves(board) {
    const moves = []
    
    for (let y = 0; y < BOARD_SIZE; y++) {
      for (let x = 0; x < BOARD_SIZE; x++) {
        if (board[y][x] !== 0) continue
        
        // 只考虑已有棋子周围的位置
        if (!this.hasNeighbor(board, x, y, 2)) continue

        const score = this.evaluatePosition(board, x, y, 1) + 
                      this.evaluatePosition(board, x, y, 2)
        
        moves.push({ x, y, score })
      }
    }

    return moves.sort((a, b) => b.score - a.score)
  }

  // 检查周围是否有棋子
  hasNeighbor(board, x, y, range) {
    for (let dy = -range; dy <= range; dy++) {
      for (let dx = -range; dx <= range; dx++) {
        const ny = y + dy
        const nx = x + dx
        if (ny >= 0 && ny < BOARD_SIZE && nx >= 0 && nx < BOARD_SIZE) {
          if (board[ny][nx] !== 0) return true
        }
      }
    }
    return false
  }

  // 评估某个位置
  evaluatePosition(board, x, y, player) {
    let score = 0
    
    for (const [dx, dy] of DIRECTIONS) {
      score += this.evaluateDirection(board, x, y, dx, dy, player)
    }
    
    return score
  }

  // 评估某个方向
  evaluateDirection(board, x, y, dx, dy, player) {
    let count = 1
    let blocked = 0
    let empty = 0

    // 正向
    for (let i = 1; i < 5; i++) {
      const nx = x + dx * i
      const ny = y + dy * i
      if (nx < 0 || nx >= BOARD_SIZE || ny < 0 || ny >= BOARD_SIZE) {
        blocked++
        break
      }
      if (board[ny][nx] === player) {
        count++
      } else if (board[ny][nx] === 0) {
        empty++
        break
      } else {
        blocked++
        break
      }
    }

    // 反向
    for (let i = 1; i < 5; i++) {
      const nx = x - dx * i
      const ny = y - dy * i
      if (nx < 0 || nx >= BOARD_SIZE || ny < 0 || ny >= BOARD_SIZE) {
        blocked++
        break
      }
      if (board[ny][nx] === player) {
        count++
      } else if (board[ny][nx] === 0) {
        empty++
        break
      } else {
        blocked++
        break
      }
    }

    // 根据棋型评分
    if (count >= 5) return SCORES.FIVE
    if (count === 4) {
      return blocked === 0 ? SCORES.FOUR : SCORES.BLOCKED_FOUR
    }
    if (count === 3) {
      return blocked === 0 ? SCORES.THREE : SCORES.BLOCKED_THREE
    }
    if (count === 2) {
      return blocked === 0 ? SCORES.TWO : SCORES.BLOCKED_TWO
    }
    
    return SCORES.ONE
  }

  // Minimax算法
  minimax(board, depth, alpha, beta, isMaximizing, player, opponent) {
    // 检查游戏结束
    const winner = this.checkWinner(board)
    if (winner === player) return 10000
    if (winner === opponent) return -10000
    if (depth === 0) return this.evaluateBoard(board, player)

    const moves = this.getCandidateMoves(board).slice(0, 8)
    
    if (isMaximizing) {
      let maxScore = -Infinity
      for (const move of moves) {
        board[move.y][move.x] = player
        const score = this.minimax(board, depth - 1, alpha, beta, false, player, opponent)
        board[move.y][move.x] = 0
        maxScore = Math.max(maxScore, score)
        alpha = Math.max(alpha, score)
        if (beta <= alpha) break
      }
      return maxScore
    } else {
      let minScore = Infinity
      for (const move of moves) {
        board[move.y][move.x] = opponent
        const score = this.minimax(board, depth - 1, alpha, beta, true, player, opponent)
        board[move.y][move.x] = 0
        minScore = Math.min(minScore, score)
        beta = Math.min(beta, score)
        if (beta <= alpha) break
      }
      return minScore
    }
  }

  // 检查获胜者
  checkWinner(board) {
    for (let y = 0; y < BOARD_SIZE; y++) {
      for (let x = 0; x < BOARD_SIZE; x++) {
        const player = board[y][x]
        if (player === 0) continue

        for (const [dx, dy] of DIRECTIONS) {
          let count = 1
          for (let i = 1; i < 5; i++) {
            const nx = x + dx * i
            const ny = y + dy * i
            if (nx >= 0 && nx < BOARD_SIZE && ny >= 0 && ny < BOARD_SIZE && 
                board[ny][nx] === player) {
              count++
            } else {
              break
            }
          }
          if (count >= 5) return player
        }
      }
    }
    return null
  }

  // 评估整个棋盘
  evaluateBoard(board, player) {
    let score = 0
    for (let y = 0; y < BOARD_SIZE; y++) {
      for (let x = 0; x < BOARD_SIZE; x++) {
        if (board[y][x] === player) {
          score += this.evaluatePosition(board, x, y, player)
        } else if (board[y][x] !== 0) {
          score -= this.evaluatePosition(board, x, y, board[y][x])
        }
      }
    }
    return score
  }

  getOpponent(player) {
    return player === 1 ? 2 : 1
  }
}

module.exports = {
  GomokuAI,
  BOARD_SIZE,
  DIRECTIONS
}