let App = getApp(),
	wxParse = require("../../wxParse/wxParse.js");
Page({
	data: {
		// banner轮播组件属性
		indicatorDots: true, // 是否显示面板指示点	
		autoplay: true, // 是否自动切换
		interval: 3000, // 自动切换时间间隔
		duration: 800, // 滑动动画时长
		imgHeights: {}, // 图片的高度
		imgCurrent: {}, // 当前banne所在滑块指针

		// 页面元素
		cxcdfg: {},
		shop: {}, //当前门店
		shop_id: '',
		shop_mode: 10, //门店模式 10单门店，20多门店
		scene: 0, //二维码数据
		isCollection: 0, //收藏提醒
		isWechat: 0, //关注公众号提醒
		copyright: '', // 版权
		scrollTop: 0,
		items: []
	},

	onLoad: function (options) {
		

		let _this = this;
		let scene = decodeURIComponent(options.scene); //接收二维码参数
		wx.removeStorageSync('table'); //清除桌位信息
		//是否是扫码进入点餐
		if (scene != 'undefined') {
			scene = scene.split(",");
			_this.data.shop_id = scene[1] || '';
			let shop = {
				shop_id: _this.data.shop_id
			};
			wx.setStorageSync('shop', shop);
			//扫桌码
			if (scene[0] == 'table') {
				//餐桌码：'table,shop_id,table_id'
				wx.setStorageSync('table', scene[2]); //接收并存储桌号
			}
			//扫门店码
			if (scene[0] == 'shop') {
				//餐桌码：'shop,shop_id'
			}
		}
		App.setTitle(); // 设置页面标题
		App.setNavigationBar(); // 设置navbar标题、颜色
		_this.getIndexData(); // 获取首页数据

		 setTimeout(function() {
		   _this.setData({
		     isCollection: App.getWxapp().isCollection,
		     isWechat: App.getWxapp().isWechat,
			shop_mode: App.getWxapp().shopMode,
			copyright: App.getWxapp().copyright
		   });
		 }, 1000);
	},
	/**
	 * 生命周期函数--监听页面显示
	 */
	onShow() {
		let _this = this;
		_this.getWz(); //获取位置信息
		_this.hideModal(); //隐藏点餐选项
		_this.getShop();//获取门店详情
	},

	/**
	 * 多门店切换
	 */
	goShop: function () {
		// 转跳指定的页面
		wx.navigateTo({
			url: '/pages/shop/index'
		})
	},
	/**
	 * 获取当前位置坐标
	 */
	getWz: function () {
		let _this = this;
		wx.getLocation({
			type: 'wgs84',
			isHighAccuracy: true,
			success: function (res) {
				wx.setStorageSync('location', res.latitude + ',' + res.longitude);
			},
		});
	},

	/**
	 * 就餐方式选择
	 */
	food: function (e) {
		let _this = this;
		let tapIndex = e.currentTarget.dataset.id; //获取点餐方式
		//判断是否歇业
		if (_this.data.shop.status == 0) {
			App.showError('该门店歇业中');
			return false;
		}
		//判断是否开启该功能
		let food_mode_open = true;
		
		console.log("shop:" + JSON.stringify(_this.data.shop))
		for (let n = 0; n < _this.data.shop.foodMode.length; n++) {
			if (_this.data.shop.foodMode[n] == tapIndex) {
				food_mode_open = false;
				break;
			}
		}
		if (food_mode_open) {
			App.showError('该门店未开启此功能');
			return false;
		}
		//1餐桌，2打包自取，3外卖，大于10000为扫码桌号
		if (tapIndex == 3) {
			wx.navigateTo({
				url: "/pages/shop/food"
			});
		}
		if (tapIndex == 9) {
			//调起扫码
			wx.scanCode({
				success(res) {
					console.log(res)
				}
			})
			return true;
		}
		if (wx.getStorageSync('table') < 10000 || wx.getStorageSync('table') == '') {
			wx.setStorageSync('table', tapIndex); //接收并存储
		}
	},

	/**
	 * 关闭收藏提醒
	 */
	collection: function () {
		let _this = this;
		_this.setData({
			isCollection: !_this.data.isCollection
		})
	},

	/**
	 * 获取首页数据
	 */
	getShop: function () {
		let _this = this;
		App._get('shop/detail', {
			location: wx.getStorageSync('location')
		}, function (result) {
			wx.setStorageSync('shop', result.data); //接收并存储
			_this.setData({
				shop: result.data
			});
			
			console.log("shop:" + JSON.stringify(_this.data.shop));
		});
	},

	/**
	 * 获取首页数据
	 */
	getIndexData: function () {
		let _this = this;
		App._get('index/page', {}, function (result) {
			let data = result.data;
			// 富文本转码
			for (let n = 0; n < data.length; n++) {
				if (data[n].type == 'richText') {
					wxParse.wxParse('content', 'html', data[n].params.content, _this, 0);
				}
			}

			console.log("indexData:" + JSON.stringify(data))
			_this.setData({
				"items": data
			});
		});
	},

	/**
	 * 计算图片高度
	 */
	imagesHeight: function (e) {
		let imgId = e.target.dataset.id,
			itemKey = e.target.dataset.itemKey,
			ratio = e.detail.width / e.detail.height, // 宽高比
			viewHeight = 750 / ratio, //计算的高度值
			imgHeights = this.data.imgHeights;

		// 把每一张图片的对应的高度记录到数组里
		if (typeof imgHeights[itemKey] === 'undefined') {
			imgHeights[itemKey] = {};
		}
		imgHeights[itemKey][imgId] = viewHeight;
		// 第一种方式
		let imgCurrent = this.data.imgCurrent;
		if (typeof imgCurrent[itemKey] === 'undefined') {
			imgCurrent[itemKey] = Object.keys(this.data.items[itemKey].data)[0];
		}
		this.setData({
			imgHeights,
			imgCurrent
		});
	},

	bindChange: function (e) {
		let itemKey = e.target.dataset.itemKey,
			imgCurrent = this.data.imgCurrent;
		// imgCurrent[itemKey] = e.detail.current;
		imgCurrent[itemKey] = e.detail.currentItemId;
		this.setData({
			imgCurrent
		});
	},

	goTop: function (t) {
		this.setData({
			scrollTop: 0
		});
	},

	scroll: function (t) {
		this.setData({
			indexSearch: t.detail.scrollTop
		}), t.detail.scrollTop > 300 ? this.setData({
			floorstatus: !0
		}) : this.setData({
			floorstatus: !1
		});
	},

	//点击我显示底部弹出框
	clickme: function () {
		this.showModal();
	},

	//显示对话框
	showModal: function () {
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
		setTimeout(function () {
			animation.translateY(0).step()
			this.setData({
				animationData: animation.export()
			})
		}.bind(this), 200)
	},
	//隐藏对话框
	hideModal: function () {
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
		setTimeout(function () {
			animation.translateY(0).step()
			this.setData({
				animationData: animation.export(),
				showModalStatus: false
			})
		}.bind(this), 200)
	},

	/**
	 * 客服组件 - 拨打电话
	 */
	phone: function (e) {
		wx.makePhoneCall({
			phoneNumber: e.currentTarget.dataset.phone
		})
	},

	onShareAppMessage: function () {
		let wxapp = App.getWxapp();
		return {
			title: wxapp.navbar.params.share_title,
			imageUrl: wxapp.navbar.params.share_image,
			path: "/pages/index/index?recommender=" + App.getUserId()
		};
	}
});
