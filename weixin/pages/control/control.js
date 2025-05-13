// pages/control/control.js

const app = getApp()
import mqtt from '../../utils/mqtt.min.js';//加载mqtt库

Page({

  /**
   * 页面的初始数据
   */
  data: {
    dialogShow:false,
    buttons:[{text: '取消'}, {text: '去绑定'}],
    // !1#1#1#1#100#100#100#2#on
    //红外、毫米波、震动、环境光、rgb、level、灯
    uid:"bc0898a42c47",
    topic_infor:"nightor002",
    topic_con:"nighcon002",
    device_status:true,//离线
    
    
    
    pir:false,
    ld:false,
    vibrate:false,
    als:true,
    r:100,
    g:100,
    b:100,
    level:2,
    ledState:"off",
    button_checked: false,
    voltage:100,
    battery_status:'未充电',
    

    client: null,//mqtt客户端，默认为空
    
  },
  stringToBoolean(str) {
    return str.toLowerCase() === 'true';
  },
  tapDialogButton(e) {
    const _btn = e.detail.item.text;
    if (_btn == '去绑定') {
      // 添加移除关注
      console.log('tt')
      wx.navigateTo({url: "/pages/set/set"})
    }
    this.setData({
      dialogShow: false,
    })
  },
  
  mqttConnect(){
    var that = this
    
    //MQTT连接的配置
    var options= {
      keepalive: 60, //60s ，表示心跳间隔
      clean: true, //cleanSession不保持持久会话
      protocolVersion: 4, //MQTT v3.1.1
      clientId:this.data.uid
    }
    //初始化mqtt连接
     this.data.client = mqtt.connect('wxs://bemfa.com:9504/wss',options)
     // 连接mqtt服务器
     this.data.client.on('connect', function () {
      console.log('连接服务器成功')
      //订阅主题
      that.data.client.subscribe(that.data.topic_infor, function (err) {
        if (err) {
            console.log(err)
        }
      })
    })

    //接收消息
    that.data.client.on('message', function (topic, message) {
      
      var  msg = message.toString()
      console.log('收到消息：'+msg)
      if(topic.toString() == that.data.topic_infor){
        if(msg.indexOf("#") != -1 ){
          var all_data_arr = msg.split("#"); 
          
          // !1#1#1#1#100#100#100#2#on
          //红外、毫米波、震动、环境光、rgb、level、灯
          if (all_data_arr[10]=='uncharged'){
            that.setData({ battery_status:'未充电'})
          }else if (all_data_arr[10]=='charging'){
            that.setData({ battery_status:'充电中'})
          }else if (all_data_arr[10]=='charge_complete'){
            that.setData({ battery_status:'充电完成'})
          }
          that.setData({ 
            pir:that.stringToBoolean(all_data_arr[0]),
            ld:that.stringToBoolean(all_data_arr[1]),
            vibrate:that.stringToBoolean(all_data_arr[2]),
            als:that.stringToBoolean(all_data_arr[3]),
            r:parseInt(all_data_arr[4], 10),
            g:parseInt(all_data_arr[5], 10),
            b:parseInt(all_data_arr[6], 10),
            level:parseInt(all_data_arr[7],10),
            ledState:all_data_arr[8],
            button_checked:that.stringToBoolean(all_data_arr[9]),
            voltage:parseInt(all_data_arr[11], 10)
          })
          
        }
        
        if (msg.includes('on')){
          that.setData({ledState:'on'})
        }
        if (msg.includes('off')){
          that.setData({ledState:'off'})
        }
        if (msg.includes('level')){
          that.setData({level:parseInt(msg.split(",")[1])})
        }
        if (msg.includes('duty')){
          that.setData({r:parseInt(msg.split(",")[1]),
                        g:parseInt(msg.split(",")[2]),
                        b:parseInt(msg.split(",")[3])})
        }
        if (msg.includes('button_checked')){
          that.setData({button_checked:that.stringToBoolean(msg.split(",")[1])})
        }
        if (msg.includes('ld')){
          that.setData({ld:that.stringToBoolean(msg.split(",")[1])})
        }
        if (msg.includes('pir')){
          that.setData({pir:that.stringToBoolean(msg.split(",")[1])})
        }
        if (msg.includes('alsstate')){
          that.setData({als:that.stringToBoolean(msg.split(",")[1])})
        }
        if (msg.includes('vibrate')){
          that.setData({vibrate:that.stringToBoolean(msg.split(",")[1])})
        }


      }

      
    })

    //断线重连
    this.data.client.on("reconnect", function () {
      console.log("重新连接服务器")
    });


  },


  getOnline(){
    var that = this
    //请求设备状态,检查设备是否在线
     //api 接口详细说明见巴法云接入文档
    wx.request({
      url: 'https://api.bemfa.com/mqtt/status/', //状态api接口，详见巴法云接入文档
      data: {
        uid: that.data.uid,
        topic: that.data.topic_con,
      },
      header: {
        'content-type': "application/x-www-form-urlencoded"
      },
      success (res) {
        if(res.data.status === "online"){
          that.setData({
            device_status:false
          })
        }else{
          that.setData({
            device_status:true
          })
        }
        console.log('设备状态:'+that.data.device_status)
      }
    })    
  },

  switchLedChange({ detail }){
     if(detail.value == true){//如果是打开操作
      this.data.client.publish(this.data.topic_con, 'button_checked,true')//mqtt推送on
     }else{
      this.data.client.publish(this.data.topic_con, 'button_checked,false')//mqtt推送off
     }
  },
  sliderLevelChange({detail})
  {
    console.log(`level,${detail.value}`)
    this.data.client.publish(this.data.topic_con, `level,${detail.value/30}`)
  },

  sliderRChange({detail})
  {
    console.log(`level,${detail.value}`)
    this.setData({r:detail.value})
    this.data.client.publish(this.data.topic_con, `duty,${detail.value},${this.data.g},${this.data.b}`)
  },
  
  sliderGChange({detail})
  {
    console.log(`level,${detail.value}`)
    this.setData({g:detail.value})
    this.data.client.publish(this.data.topic_con, `duty,${this.data.r},${detail.value},${this.data.b}`)
  },
  sliderBChange({detail})
  {
    console.log(`level,${detail.value}`)
    this.setData({b:detail.value})
    this.data.client.publish(this.data.topic_con, `duty,${this.data.r},${this.data.g},${detail.value}`)
  },

  sliderRChanging({detail})
  {
    this.setData({r:detail.value})
  },
  sliderGChanging({detail})
  {
    this.setData({g:detail.value})
  },
  sliderBChanging({detail})
  {
    this.setData({b:detail.value})
  },
  navigateToTimePage: function(){
    const that = this
    wx.navigateTo({
      url: '/pages/time/time',
      events: {
        // 定义可能需要的事件处理函数
        dataFromOpenedPage: function(data) {
          console.log(data); // 从打开的页面接收数据
          
          
        }
      },
      success: function(res) {
        // 使用 eventChannel 向被打开页面发送数据
        res.eventChannel.emit('sendDataToSetPage',
         { data:'dd'
          });
      }
    });
  },

  navigateToSetPage: function() {
    const that = this
    wx.navigateTo({
      url: '/pages/set/set',
      events: {
        // 定义可能需要的事件处理函数
        dataFromOpenedPage: function(data) {
          console.log(data); // 从打开的页面接收数据
          if (data.ld !=that.data.ld)
          {
            console.log(`ld,${data.ld}`)
            that.data.client.publish(that.data.topic_con, `ld,${data.ld}`)
          }
          if (data.pir !=that.data.pir )
          {
            console.log(`pir,${data.pir }`)
            that.data.client.publish(that.data.topic_con, `pir,${data.pir }`)
          }
          if (data.ld !=that.data.ld)
          {
            console.log(`vibrate,${data.vibrate}`)
            that.data.client.publish(that.data.topic_con, `vibrate,${data.vibrate}`)
          }
          if (data.als !=that.data.als)
          {
            console.log(`als,${data.als}`)
            that.data.client.publish(that.data.topic_con, `alsstate,${data.als}`)
          }
        }
      },
      success: function(res) {
        // 使用 eventChannel 向被打开页面发送数据
        res.eventChannel.emit('sendDataToSetPage',
         { setState:
                {pir:that.data.pir,
                ld:that.data.ld,
                vibrate:that.data.vibrate,
                als:that.data.als}
          });
      }
    });
  },
  // getOnOff(){
  //   //获取设备状态，检查设备是打开还是关闭
  //   //api 接口详细说明见巴法云接入文档
  //   var that = this
  //   wx.request({
  //     url: 'https://api.bemfa.com/api/device/v1/data/3/get/', //状态api接口，详见巴法云接入文档
  //     data: {
  //       uid: that.data.uid,
  //       topic: that.data.topic,
  //       num:1
  //     },
  //     header: {
  //       'content-type': "application/x-www-form-urlencoded"
  //     },
  //     success (res) {
  //       console.log(res)
  //       if("undefined" != typeof res.data.data){//判断是否获取到温湿度
  //         console.log(res.data.data[0].msg)
  //         if(res.data.data[0].msg == "on"){
  //           that.setData({
  //             switchLedChecked:true,
  //             ledOnOff:"打开",
              
  //           })
  //         }else{
  //           that.setData({
  //             switchLedChecked:false,
  //             ledOnOff:"关闭",
  //           })
  //         }
  //       }

  //     }
  //   })    
  // },


  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    //连接mqtt
    this.mqttConnect()
    //检查设备是否在线
    this.getOnline()
    //检查设备是打开还是关闭
    this.data.client.publish(this.data.topic_con, 'report')
    
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
  wx. reLaunch({ url: '/pages/control/control' })
  // //检查设备是否在线
  // this.getOnline()
  // //检查设备是打开还是关闭
  // this.data.client.publish(this.data.topic_con, 'report')
  wx.stopPullDownRefresh()
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