let App = getApp();

Page({
  data: {
    list: [
      {
        "name": "名字",
        "phone": "手机号",
        "province": "省份",
        "city": "城市",
        "district": "县城",
        "detail":"详细地址",
        "address_id": "1",
      },
      {
        "name": "名字2",
        "phone": "手机号2",
        "province": "省份2",
        "city": "城市2",
        "district": "县城2",
        "detail":"详细地址2",
        "address_id": "2",
      }
    ],
    default_id: 1,
  },

  onLoad: function(options) {
    // 当前页面参数
    this.data.options = options;
  },

  onShow: function() {
    // 获取收货地址列表
    this.getAddressList();
  },

  /**
   * 获取收货地址列表
   */
  getAddressList: function() {
    let _this = this;
    App._get('address/lists', {}, function(result) {
      _this.setData(result.data);
    });
  },

  /**
   * 添加新地址
   */
  createAddress: function() {
    wx.navigateTo({
      url: './create'
    });
  },

  /**
   * 编辑地址
   */
  editAddress: function(e) {
    wx.navigateTo({
      url: "./detail?address_id=" + e.currentTarget.dataset.id
    });
  },

  /**
   * 移除收货地址
   */
  removeAddress: function(e) {
    let _this = this,
      address_id = e.currentTarget.dataset.id;
    wx.showModal({
      title: "提示",
      content: "您确定要移除当前收货地址吗?",
      success: function(o) {
        o.confirm && App._post_form('address/delete', {
          address_id
        }, function(result) {
          _this.getAddressList();
        });
      }
    });
  },

  /**
   * 设置为默认地址
   */
  setDefault: function(e) {
    let _this = this,
      address_id = e.detail.value;
    _this.setData({
      default_id: parseInt(address_id)
    });
    App._post_form('address/setDefault', {
      address_id
    }, function(result) {
      _this.data.options.from === 'flow' && wx.navigateBack();
    });
    return false;
  },

});