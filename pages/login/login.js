const App = getApp();

Page({

  /**
   * 页面的初始数据
   */
  data: {
		copyright:'',
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
		let _this = this;
		_this.setData({
			copyright: App.getWxapp().copyright
		});
  },

  /**
   * 授权登录
   */
  getUserInfo(e) {
    let _this = this;
    App.getUserInfo(e, () => {
      // 跳转回原页面
      _this.onNavigateBack();
    });
  },

  /**
   * 暂不登录
   */
  onNotLogin() {
    let _this = this;
    // 跳转回原页面
    _this.onNavigateBack();
  },

  /**
   * 授权成功 跳转回原页面
   */
  onNavigateBack() {
    wx.navigateBack();
  },

})