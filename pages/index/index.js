Page({
  startGame(e) {
    const mode = e.currentTarget.dataset.mode
    wx.navigateTo({
      url: `/pages/game/game?mode=${mode}`
    })
  }
})