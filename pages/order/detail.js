let App = getApp();

Page({

  /**
   * 页面的初始数据
   */
  data: {
		nav_select: false, // 快捷导航
    order_id: null,
    order: {
      "order_id": "orderId",
      "order_no": "order_no",
      "table_id": 3,
      "address": {
        "name": "地址名",
        "phone": "1555555555",
        "province": "xx省",
        "city": "xx市",
        "district": "xx县",
        "detail": "xx单元222室"
      },
      "pay_status": {
        "value": 1,
        "text": "payStatusText"
      },
      "delivery_status": {
        "value": 2,
        "text": "delivery_statusText"
      },
      "deliver_mode": {
        "value": 0,
        "text": "deliver_modeTExt"
      },
      "deliver_name": "deliver_name",
      "deliver_mobile": "19999999999",
      "clerk": {
        "real_name": "真实姓名",
        "mobile": "1444444444"
      },
      "table": {
        "table_name": "11",
      },
      "row_no": "111row",
      "arrive_time": "到店时间",
      "order_status": {
        "text": "orderStatusText"
      },
      "goods": [
        {
          "thumbnail": "thumbnail",
          "goods_name": "goods_name",
          "goods_attr": "goods_attr",
          "goods_price": "goods_price",
          "total_num": "total_num"
        }
      ],
      "total_price": "111",
      "people": "4",
      "ware_price": "4",
      "express_price": "11",
      "pack_price": "3",
      "activity_price": "0.1",
      "pay_price": "99"



    },
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    this.data.order_id = options.order_id;
    this.getOrderDetail(options.order_id);
  },

  /**
   * 获取订单详情
   */
  getOrderDetail: function(order_id) {
    let _this = this;
    App._get('user/order/detail', {
      order_id
    }, function(result) {
      _this.setData(result.data);
    });
  },

  /**
   * 跳转到商品详情
   */
  goodsDetail: function(e) {
    let goods_id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: '../goods/index?goods_id=' + goods_id
    });
  },
	/**
   * 拨打电话
   */
	phone: function (e) {
		wx.makePhoneCall({
			phoneNumber: e.currentTarget.dataset.phone
		})
	},

});