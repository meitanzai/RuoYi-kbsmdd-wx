let App = getApp();

Page({

  /**
   * 页面的初始数据
   */
  data: {
    nav_select: false, // 快捷导航
    address: null, // 默认收货地址
    exist_address: false, // 是否存在收货地址
    goods_list: [
      {
        goods_id: 1,
        thumbnail: "http://localhost:8081/res/cp.png",
        goods_name: "辣椒炒肉",
        goods_attr: "菠萝味",
        goods_price: 11,
        total_num: 2
      }
    ], // 商品信息
    flavor_list: [
      {'name': '无味'},
      {'name': '有味'},
      {'name': '重口味'},
    ], //口味
    flavor: '', //选中值
    table: {
      table_name: '请选择餐桌/包间'
    }, //桌位详情
    shop: {
      tang_mode: 1
    }, //门店详情
		tpl: [], //模板消息
    arrive_time: '现在', //到店时间
    people: 0, //就餐人数
    ware_price: 0.00, //餐具调料费
    food_mode: 1, //点餐模式 1店内，2打包，3外卖，大于10000，扫码。
    pay_mode: 0, //支付模式 0微信，1余额
    disabled: false,
    hasError: false,
    error: '',
    order_total_price: 111,//总价
    order_total_num: 5,//总数
    activity_price: 2,//优惠金额
    order_pay_price: 109,//实付款
    ware_price: 22,//餐具调料费
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {
    let _this = this;
    _this.setData({
      shop: wx.getStorageSync('shop')
    });
    // 获取当前订单信息
    _this.getOrderData();
    // _this.getFoodMode(); //获取点餐模式
		// _this.getTpl(); //获取模板消息配置
 
  },

  /**
   * 选择到店时间
   */
  bindTimeChange: function(e) {
    this.setData({
      arrive_time: e.detail.value
    })
  },

  /**
   * 口味选项
   */
  flavor: function(e) {
    let _this = this,
      index = e.currentTarget.dataset.index,
      flavor_list = _this.data.flavor_list,
      flavor = '';
    flavor_list[index].checked = !flavor_list[index].checked;
    for (let n = 0; n < flavor_list.length; n++) {
      if (flavor_list[n].checked) {
        if (flavor == '') {
          flavor = flavor_list[n].name;
        } else {
          flavor = flavor + ',' + flavor_list[n].name;
        }
      }
    }
    _this.setData({
      flavor: flavor,
      flavor_list: flavor_list
    });
  },

  /**
   * 选择就餐人数
   */
  slider: function(e) {
    let _this = this,
      ware_price = 0,
      people = e.detail.value,
      food_mode = wx.getStorageSync('table'),
      order_pay_price = _this.data.order_pay_price - _this.data.ware_price;
    if (food_mode > 10000 && people > 0) {
      ware_price = _this.mathcheng(people, _this.data.table.ware_price)
    }
    _this.setData({
      people: people,
      ware_price: ware_price,
      order_pay_price: _this.mathadd(order_pay_price, ware_price)
    });
  },

	/**
	* 获取订阅消息配置
	*/
	getTpl: function () {
		let _this = this;
			App._get('setting/tpl', {
				food_mode: wx.getStorageSync('table'),
				tang_mode: wx.getStorageSync('shop')['tang_mode']
			}, function (result) {
				_this.setData(result.data);
			});
	},

  /**
   * 获取点餐模式
   */
  getFoodMode: function() {
    let _this = this,
      ware_price = 0,
      food_mode = wx.getStorageSync('table');
    if (food_mode > 10000) {
      App._get('table/detail', {
        table_id: food_mode
      }, function(result) {
        ware_price = _this.mathcheng(_this.data.people, result.data.detail.ware_price);
        _this.setData({
          table: result.data.detail,
          ware_price: ware_price,
          order_pay_price: _this.mathadd(_this.data.order_pay_price, ware_price)
        });
      });
    }
    _this.setData({
      food_mode: food_mode
    });
  },

  /**
   * 加法
   */
  mathadd(arg1, arg2) {
    return (Number(arg1) + Number(arg2)).toFixed(2);
  },

  /**
   * 乘法
   */
  mathcheng(arg1, arg2) {
    return (Number(arg1) * Number(arg2)).toFixed(2);
  },

  /**
   * 选择餐桌/包间
   */
  selectTable: function() {
    wx.navigateTo({
      url: '/pages/table/index'
    });
  },

  /**
   * 设置支付模式
   */
  setPay(e) {
    let _this = this;
    let pay_mode = e.currentTarget.dataset.pay_mode;
    _this.setData({
      pay_mode: pay_mode
    });
  },

  /**
   * 获取当前订单信息
   */
  getOrderData: function() {
    let _this = this;
    // 获取订单信息回调方法
    let callback = function(result) {
      if (result.code !== 200) {
        App.showError(result.msg);
        return false;
      }
      // 显示错误信息
      if (result.data.has_error) {
        _this.data.hasError = true;
        _this.data.error = result.data.error_msg;
        App.showError(_this.data.error);
      }
      _this.setData(result.data);
    };

    // 购物车结算
    App._get('order/cart', {
      food_mode: wx.getStorageSync('table'),
      location: wx.getStorageSync('location')
    }, function(result) {
      callback(result);
    });
  },

  /**
   * 选择收货地址
   */
  selectAddress: function() {
    wx.navigateTo({
      url: '../address/' + (this.data.exist_address ? 'index?from=flow' : 'create')
    });
  },

  /**
   * 订单提交
   */
  submitOrder: function(e) {
    let _this = this,
      message = e.detail.value.message || '',
      flavor = _this.data.flavor;
    if (_this.data.disabled) {
      return false;
    }

    if (_this.data.hasError) {
      App.showError(_this.data.error);
      return false;
    }
    //如果是餐桌
    if (_this.data.food_mode == 1 || _this.data.food_mode > 10000) {
      //如果餐桌模式为选桌
      if (_this.data.shop.tang_mode == 1) {
        if (_this.data.people == 0) {
          App.showError('请选择就餐人数');
          return false;
        }
        // if (_this.data.food_mode == 1) {
        //   App.showError('请选择餐桌包间号');
        //   return false;
        // }
      }
    }
    //如果是打包自取
    if (_this.data.food_mode == 2) {
      if (_this.data.arrive_time == '') {
        App.showError('请选择到店时间');
        return false;
      }
    }
    if (_this.data.food_mode == 3 && !_this.data.intra_region) {
      App.showError('不在配送范围');
      return false;
    }
    // 订单创建成功后回调--微信支付
    let callback = function(result) {
      if (result.code === -10) {
        App.showError(result.msg, function() {
          // 跳转到未付款订单
          wx.setStorageSync('order_type', '0');
          wx.switchTab({
            url: '../order/index',
          });
        });
        return false;
      }
      if (_this.data.pay_mode == 1) {
        // 跳转到订单详情
        wx.redirectTo({
          url: '../order/detail?order_id=' + result.data.order_id,
        });
        return true;
      }
      // 发起微信支付
      wx.requestPayment({
        timeStamp: result.data.payment.timeStamp,
        nonceStr: result.data.payment.nonceStr,
        package: result.data.payment.package,
        signType: 'MD5',
        paySign: result.data.payment.paySign,
        success: function(res) {
          // 跳转到订单详情
          wx.redirectTo({
            url: '../order/detail?order_id=' + result.data.order_id,
          });
        },
        fail: function() {
          App.showError('订单未支付', function() {
            wx.setStorageSync('order_type', '0');
            wx.switchTab({
              url: '../order/index',
            });
          });
        },
      });
    };
    //开启订阅消息
    wx.requestSubscribeMessage({
			tmplIds: _this.data.tpl,
      complete(res) {
        // 按钮禁用, 防止二次提交
        _this.data.disabled = true;
        // 创建订单-购物车结算
        App._post_form('order/cart', {
          food_mode: _this.data.food_mode,
          pay_mode: _this.data.pay_mode,
          location: wx.getStorageSync('location'),
          people: _this.data.people,
          ware_price: _this.data.ware_price,
          arrive_time: _this.data.arrive_time,
          message: message,
          flavor: flavor
        }, function(result) {
          // success
          console.log('success');
          callback(result);
        }, function(result) {
          // fail
          console.log(result.msg);
          App.showError(result.msg, function(){
            wx.switchTab({
              url: '../index/index',
            });
          })
         

        }, function() {
          // complete
          console.log('complete');
          // 解除按钮禁用
          _this.data.disabled = false;
        });
      }
    });
  },

});