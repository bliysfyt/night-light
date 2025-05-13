// pages/set/set.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    pir:false,
    ld:false,
    vibrate:false,
    als:false,
    eventChannel:''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    const that = this
    this.data.eventChannel = this.getOpenerEventChannel()
    this.data.eventChannel.on('sendDataToSetPage', function(setState) {
      console.log('Received data:', setState)
      that.setData({
        pir: setState.setState.pir,
        ld: setState.setState.ld,
        vibrate: setState.setState.vibrate,
        als: setState.setState.als
      })
      // 这里可以把接收到的数据保存到页面的 data 属性中，或者做其他处理
    })
  },
  switchPirChange({detail})
  {
    this.setData({
      pir:detail.value}
    )
    
  },
  switchLdChange({detail})
  {
    this.setData({
      ld:detail.value}
    )
    
  },
  switchVibrateChange({detail})
  {
    this.setData({
      vibrate:detail.value}
    )
    
  },
  switchAlsChange({detail})
  {
    this.setData({
      als:detail.value}
    )
    
  },

  buttonApply(e){
    const that = this
    this.data.eventChannel.emit('dataFromOpenedPage',{
      pir:that.data.pir,
      ld:that.data.ld,
      vibrate:that.data.vibrate,
      als:that.data.als})
      wx.navigateBack()
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage() {

  }
})