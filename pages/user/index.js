const App = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    isLogin: false,
    userInfo: {
      "mobile": 13333333333,
      "grade": {
        "name": "黄金会员"
      },
      "wallet": 13,
      "commission": 11,
      "score": 12
    },
    orderCount: {
      "tang": 1,
      "bao": 2,
      "wai": 3,
      "activity": 4,
      
    },
    copyright: ''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {
    let _this = this;
    _this.setData({
      isLogin: App.checkIsLogin(),
      copyright: App.getWxapp().copyright
    });
    if (_this.data.isLogin) {
      // 获取当前用户信息
      _this.getUserDetail();
    }
  },

  /**
   * 消息
   */
  me: function() {
    App.showError('暂未开通');
  },


  /**
   * 获取手机号
   */
  getPhoneNumber: function(e) {
    let _this = this;
    wx.login({
      success(res) {
        // 提交到后端
        App._post_form('user/getPhoneNumber', {
          code: res.code,
          iv: e.detail.iv,
          encryptedData: e.detail.encryptedData
        }, function(result) {
          _this.getUserDetail();
          App.showSuccess(result.msg);
        }, function(result){
          console.log(result)
          App.showError(result.msg)
        }, function() {});
      }
    })
  },

  /**
   * 拨打电话
   */
  callMe() {
    let _this = this,
      wxapp = App.getWxapp();
    if (wxapp.phone === '') {
      App.showError('商家没有留电话号码');
    } else {
      wx.makePhoneCall({
        phoneNumber: wxapp.phone
      })
    }
  },

  /**
   * 获取当前用户信息
   */
  getUserDetail() {
    let _this = this;
    App._get('user/index/detail', {}, result => {
      _this.setData(result.data);
    });
  },

  /**
   * 订单导航跳转
   */
  onTargetOrder(e) {
    let _this = this;
    wx.setStorageSync('order_type', e.currentTarget.dataset.type);
    if (!_this.onCheckLogin()) {
      return false;
    }
    // 转跳指定的页面
    wx.switchTab({
      url: '/pages/order/index'
    })
  },

  /**
   * 菜单列表导航跳转
   */
  onTargetMenus(e) {
    let _this = this;
    wx.navigateTo({
      url: '/pages/' + e.currentTarget.dataset.url
    })
  },

  /**
   * 跳转到登录页
   */
  onLogin() {
    wx.navigateTo({
      url: '../login/login',
    });
  },

  /**
   * 验证是否已登录
   */
  onCheckLogin() {
    let _this = this;
    if (!_this.data.isLogin) {
      App.showError('很抱歉，您还没有登录');
      return false;
    }
    return true;
  },


})