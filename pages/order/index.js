let App = getApp();

Page({

  /**
   * 页面的初始数据
   */
  data: {
    dataType: '0',
    list: [
      {
        "table_id": 1,
        "order_no": "订单号",
        "create_time": "创建时间",
        "order_id": "order_id",
        "pay_price": 111,
        "order_status": {
          "value": 1,
          "text": "orderStatusText"
        },
        "pay_status": {
          "value": 1,
          "text": "payStatusText"
        },
        "receipt_status": {
          "value": 1,
          "text": "recepitStatusText"
        },
        "delivery_status": {
          "value": 2,
          "text": "deliveryStatus"
        },
        "goods": [
          {
            "thumbnail": "http://localhost:8081/res/cp.png",
          },
          {
            "thumbnail": "http://localhost:8081/res/cp.png",
          },
          {
            "thumbnail": "http://localhost:8081/res/cp.png",
          },
          {
            "thumbnail": "http://localhost:8081/res/cp.png",
          },
          {
            "thumbnail": "http://localhost:8081/res/cp.png",
          }

        ],

      }
    ],
    isLogin: true,
		copyright:''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function() {
    
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {
    let _this = this,
			dataType = wx.getStorageSync('order_type') || '0';
    _this.setData({
      isLogin: App.checkIsLogin(),
			copyright: App.getWxapp().copyright,
			dataType: dataType
    });
    if (_this.data.isLogin) {
      // 获取订单列表
			_this.getOrderList(dataType);
    }
  },

  /**
   * 获取订单列表
   */
  getOrderList: function(tableId) {
    let _this = this;
    App._get('user/order/lists', {
      tableId
    }, function(result) {
      _this.setData(result.data);
      result.data.list.length && wx.pageScrollTo({
        scrollTop: 0
      });
    });
  },

	/**
 * 切换标签
 */
	bindHeaderTap: function (e) {
		this.setData({
			dataType: e.target.dataset.type
		});
		wx.setStorageSync('order_type', e.target.dataset.type)
		// 获取订单列表
		this.getOrderList(e.target.dataset.type);
	},

  /**
   * 取消订单
   */
  cancelOrder: function(e) {
    let _this = this;
    let order_id = e.currentTarget.dataset.id;
    wx.showModal({
      title: "提示",
      content: "确认取消订单？",
      success: function(o) {
        if (o.confirm) {
          App._post_form('user.order/cancel', {
            order_id
          }, function(result) {
            _this.getOrderList(_this.data.dataType);
          });
        }
      }
    });
  },

  /**
   * 确认收货
   */
  receipt: function(e) {
    let _this = this;
    let order_id = e.currentTarget.dataset.id;
    wx.showModal({
      title: "提示",
      content: "确认用餐完毕？",
      success: function(o) {
        if (o.confirm) {
          App._post_form('user.order/receipt', {
            order_id
          }, function(result) {
            _this.getOrderList(_this.data.dataType);
          });
        }
      }
    });
  },

  /**
   * 发起付款
   */
  payOrder: function(e) {
    let _this = this;
    let order_id = _this.data.order_id;
    let pay_mode = e.currentTarget.dataset.pay_mode;
    _this.hideModal();
    // 显示loading
    wx.showLoading({
      title: '正在处理...',
    });
    App._post_form('user/order/pay', {
      order_id: order_id,
      pay_mode: pay_mode
    }, function(result) {
      if (result.code === -10) {
        App.showError(result.msg);
        return false;
      }
      // 发起微信支付
      if (pay_mode == 0) {
        wx.requestPayment({
          timeStamp: result.data.timeStamp,
          nonceStr: result.data.nonceStr,
          package: result.data.package,
          signType: 'MD5',
          paySign: result.data.paySign,
          success: function(res) {
            // 跳转到已付款订单
            wx.navigateTo({
              url: '/pages/order/detail?order_id=' + order_id
            });
          },
          fail: function() {
            App.showError('订单未支付');
          },
        });
      }
      // 发起余额支付
      if (pay_mode == 1) {
        // 跳转到已付款订单
        wx.navigateTo({
          url: '/pages/order/detail?order_id=' + order_id
        });
      }
    });
  },

  /**
   * 跳转订单详情页
   */
  detail: function(e) {
    let order_id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: '/pages/order/detail?order_id=' + order_id
    });
  },

  onPullDownRefresh: function() {
    wx.stopPullDownRefresh();
  },

  //点击我显示底部弹出框
  clickme: function(e) {
    this.data.order_id = e.currentTarget.dataset.id;
    this.showModal();
  },

  //显示对话框
  showModal: function() {
    // 显示遮罩层
    var animation = wx.createAnimation({
      duration: 200,
      timingFunction: "linear",
      delay: 0
    })
    this.animation = animation
    animation.translateY(300).step()
    this.setData({
      animationData: animation.export(),
      showModalStatus: true
    })
    setTimeout(function() {
      animation.translateY(0).step()
      this.setData({
        animationData: animation.export()
      })
    }.bind(this), 200)
  },
  //隐藏对话框
  hideModal: function() {
    // 隐藏遮罩层
    var animation = wx.createAnimation({
      duration: 200,
      timingFunction: "linear",
      delay: 0
    })
    this.animation = animation
    animation.translateY(300).step()
    this.setData({
      animationData: animation.export(),
    })
    setTimeout(function() {
      animation.translateY(0).step()
      this.setData({
        animationData: animation.export(),
        showModalStatus: false
      })
    }.bind(this), 200)
  },
  /**
   * 跳转到登录页
   */
  onLogin() {
    wx.navigateTo({
      url: '../login/login',
    });
  },
});