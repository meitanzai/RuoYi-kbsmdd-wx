const App = getApp();

Page({
	data: {
		//列表
		list: [
			{	
				"shop_id": "1",
				"status": {
					"value": 1,
					"text": "aa"
				},
				"logo": {
					"file_path": "文件路径"
				},
				"shop_name": "店铺名",
				"location": "22,32",
				"address": "xx省xx市xx县"

			}
		],
		food_mode:0,
		copyright:'',
	},

	onLoad: function () {
		let _this = this;
		// 获取列表
		_this.getShopList();
		_this.setData({ 
			food_mode: wx.getStorageSync('table'),
			copyright: App.getWxapp().copyright
		});
	},

	/**
   * 选择门店
   */
	shop: function (e) {
		let _this = this,
			index = e.currentTarget.dataset.index;
		wx.setStorageSync('shop', _this.data.list[index]);
		wx.navigateBack();//返回
	},
	/**
   * 门店歇业中
   */
	shopStop:function(e){
		let _this = this;
		let index = e.currentTarget.dataset.index;
		App.showError(_this.data.list[index].shop_name+' - 歇业中');
		return false;
	},
  /**
   * 获取分类列表
   */
	getShopList: function () {
		let _this = this,
			location = wx.getStorageSync('location') || '';
		App._get('shop/lists', { location}, function (result) {
			_this.setData({
				list: result.data.list
			});
		});
	},
});