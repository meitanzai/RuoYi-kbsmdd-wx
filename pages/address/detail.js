let App = getApp();

Page({

  /**
   * 页面的初始数据
   */
  data: {
    disabled: false,
    nav_select: false, // 快捷导航
    detail: {
      "name": "收货人姓名",
      "phone": "手机号",
      "province":"xx省",
      "city": "xx市",
      "district":"xx区",
      "detail": "xx栋xx号"
    },
    error: '',
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    // 获取当前地址信息
    this.getAddressDetail(options.address_id);
  },

  /**
   * 获取所在地区
   */
  chooseLocation: function() {
    let _this = this,
      location = '',
      detail = _this.data.detail;
    wx.chooseLocation({
      success: function(res) {
        location = res.latitude + ',' + res.longitude;
        App._get('address/getLocation', {
          location
        }, function(result) {
          let wz = result.data.location;
          detail.location = location;
          detail.province = wz.province;
          detail.city = wz.city;
          detail.district = wz.district;
          _this.setData({
            detail: detail
          });
        });
      },
    })
  },

  /**
   * 获取当前地址信息
   */
  getAddressDetail: function(address_id) {
    let _this = this;
    App._get('address/detail', {
      address_id
    }, function(result) {
      _this.setData(result.data);
    });
  },

  /**
   * 表单提交
   */
  saveData: function(e) {
    let _this = this,
      values = e.detail.value;
    values.location = _this.data.detail.location;
    values.province = _this.data.detail.province;
    values.city = _this.data.detail.city;
    values.district = _this.data.detail.district;
    // 表单验证
    if (!_this.validation(values)) {
      App.showError(_this.data.error);
      return false;
    }

    // 按钮禁用
    _this.setData({
      disabled: true
    });

    // 提交到后端
    values.address_id = _this.data.detail.address_id;
    App._post_form('address/edit', values, function(result) {
      App.showSuccess(result.msg, function() {
        wx.navigateBack();
      });
    }, false, function() {
      // 解除禁用
      _this.setData({
        disabled: false
      });
    });
  },

  /**
   * 表单验证
   */
  validation: function(values) {
    if (values.name === '') {
      this.data.error = '收件人不能为空';
      return false;
    }
    if (values.phone.length < 1) {
      this.data.error = '手机号不能为空';
      return false;
    }
    if (values.phone.length !== 11) {
      this.data.error = '手机号长度有误';
      return false;
    }
    let reg = /^(((13[0-9]{1})|(15[0-9]{1})|(18[0-9]{1})|(17[0-9]{1}))+\d{8})$/;
    if (!reg.test(values.phone)) {
      this.data.error = '手机号不符合要求';
      return false;
    }
    if (!values.location) {
      this.data.error = '省市区不能空';
      return false;
    }
    if (values.detail === '') {
      this.data.error = '详细地址不能为空';
      return false;
    }
    return true;
  },

})