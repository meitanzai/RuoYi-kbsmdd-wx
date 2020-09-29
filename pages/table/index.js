const App = getApp();

Page({

  /**
   * 页面的初始数据
   */
  data: {
    list: {},
    table_id:0,
		copyright:'',
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onShow(options) {
    let _this = this;
    _this.setData({ 
			table_id: wx.getStorageSync('table'),
			copyright: App.getWxapp().copyright
		})
    _this.getList();
  },
  

  /**
   * 获取餐桌/包间列表
   */
  getList() {
    let _this = this;
    App._get('table/lists', {}, result => {
      _this.setData({list:result.data.list.data});
    });
  },

  radioChange: function (e) {
    wx.setStorageSync('table', e.detail.value)
    wx.navigateBack();
  },
})