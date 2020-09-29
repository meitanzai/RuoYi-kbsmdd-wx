const App = getApp();
Page({

	/**
	 * 页面的初始数据
	 */
	data: {
		people:1,//约定人数
		disabled:false
	},

	/**
	 * 生命周期函数--监听页面加载
	 */
	onLoad: function (options) {

	},

	/**
	 * 生命周期函数--监听页面显示
	 */
	onShow: function () {

	},
	/**
	 * 约定人数
	 */
	people:function(e){
		let _this = this;
		_this.data.people = e.detail.value;
	},

	/** */
	formSubmit:function(e){
		let _this = this,
		sort = e.detail.value;
		if (sort.linkman==''){
			App.showError('联系人姓名不可为空');
			return false;
		}
		let myreg = /^[1][3,4,5,7,8,9][0-9]{9}$/;
		if (!myreg.test(sort.phone)) {
			App.showError('手机号码不正确');
			return false;
		}
		sort.people = _this.data.people;
		sort.mode = 10;//预约排号
		// 按钮禁用
		_this.setData({
			disabled: true
		});

		// 提交到后端
		App._post_form('pact/add', values, function (result) {
			App.showSuccess(result.msg, function () {
				wx.navigateBack();
			});
		}, false, function () {
			// 解除禁用
			_this.setData({
				disabled: false
			});
		});
	},
})