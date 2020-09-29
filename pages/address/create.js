let App = getApp();

Page({

  /**
   * 页面的初始数据
   */
  data: {
    disabled: false,
    nav_select: false, // 快捷导航

    name: '',
    phone: '',
    location: '',
    province: '请选择省',
    city: '市',
    district: '区',
    detail: '',
    recommend: '',
    error: '',
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {

  },

  /**
   * 获取所在地区
   */
  chooseLocation: function() {
    let _this = this,
      location = '';
    wx.chooseLocation({
      success: function(res) {
        console.log(JSON.stringify(res))

        location = res.latitude + ',' + res.longitude
				App._get('address/getLocation', {
          location 
        }, function(result) {
					let wz = result.data.location;
          _this.setData({
            location: location,
						province: wz.province,
						city: wz.city,
            district: wz.district,
            recommend: result.data.recommend
          });
        });
      },
    })
  },

  /**
   * 表单提交
   */
  saveData: function(e) {
    let _this = this,
      values = e.detail.value;
    values.location = _this.data.location;
    values.province = _this.data.province;
    values.city = _this.data.city;
    values.district = _this.data.district;
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
    App._post_form('address/add', values, function(result) {
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
    if (!this.data.location) {
      this.data.error = '请选择所在地区';
      return false;
    }
    if (values.detail === '') {
      this.data.error = '详细地址不能为空';
      return false;
    }
    return true;
  },
})