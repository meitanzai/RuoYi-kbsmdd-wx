let App = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    tab:'',   //套餐选中项
    plan:[
      {
        "money": 2,
        "recharge_plan_id": 1,
        "gift_money": 0.1       

      }
    ],  //套餐列表
		setting:{
      "is_custom":1,
      "is_open":1
    },//充值配置
    money:'',//充值金额
    recharge_plan_id:0,//套餐ID
    userInfo: {
      wallet: 1
    }
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    let _this = this;
    _this.getUserDetail();
    _this.getPlan();
  },

  /**
   * 发起充值付款
   */
  recharge: function (e) {
    let _this = this;
    let money = e.detail.value.money;
    if (!money){
      App.showError('充值金额不可为空');
      return false;
		}
		if (money.indexOf(".")!=-1){
			App.showError('充值金额必须为整数');
			return false;
		}
    // 显示loading
    wx.showLoading({ title: '正在处理...', });
    App._post_form('user/wallent/recharge/pay', { 
      money: money,
      recharge_plan_id: _this.data.recharge_plan_id
     }, function (result) {
      if (result.code === -10) {
        App.showError(result.msg);
        return false;
      }
      // 发起微信支付
      wx.requestPayment({
        timeStamp: result.data.timeStamp,
        nonceStr: result.data.nonceStr,
        package:  result.data.package,
        signType: 'MD5',
        paySign: result.data.paySign,
        success: function (res) {
          _this.getUserDetail();
					App.showSuccess('充值成功');
        },
        fail: function () {
          App.showError('您取消了支付');
        },
      });
    });
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
     * 获取充值套餐
     */
  getPlan() {
    let _this = this;
    App._get('user/wallent/plan', {}, result => {
      _this.setData({
        "plan": result.data
      });
    });
  },
  setItem(e){
    let index = e.currentTarget.dataset.index; 
    let money = e.currentTarget.dataset.money; 
    let recharge_plan_id = e.currentTarget.dataset.recharge_plan_id;
    this.setData({ 
      tab: index,
      money: money,
      recharge_plan_id: recharge_plan_id
    });
  },
  check_input() {
    let index = '';
    let money = '';
    let recharge_plan_id = 0;
    this.setData({
      tab: index,
      money: money,
      recharge_plan_id: recharge_plan_id
    });
  },
})