var App = getApp();
Page({
	data: {
		category:[
		],
		goods:  {

		},  //所有产品列表
		activity:{},	//优惠活动列表
		classifySeleted: '',//左边选中项目
		classifySeletedTemp: 0,
		tableDetail: {},//桌位详情

		showCartDetail: false,
		classifyViewed: '#',//滚动项目编号

		order_total_num: 0, //购物车商品总数
		order_total_price: 0,//购物车商品总价
		min_price:0,	//起送价

		detail: {}, // 商品详情信息
		goods_price: 0, // 店内售价
		out_price: 0, // 外卖售价
		line_price: 0, // 划线价格
		stock_num: 0, // 库存数量
		goods_sku_id: 0, // 规格id
		cart_total_num: 0, // 购物车商品总数量
		goods_img: 0, // 商品图片
		specData: {
		}, // 多规格信息

		food_mode:0,//点餐模式
		shop:{},
		scrollDown: false,
	},
	// 记录规格的数组
	goods_spec_arr: [],
	onLoad: function (options) {

	},
  /**
   * 生命周期函数--监听页面显示
   */
	onShow() {
		let _this = this,
			food_mode = 0;
		
		if (parseInt(wx.getStorageSync('table')) > 10000){
			food_mode = 1;
		}else{
			food_mode = wx.getStorageSync('table');
		}
		
		_this.setData({ 
			shop: wx.getStorageSync('shop'),
			food_mode: food_mode
		});	

		_this.getList();	//获取商品和分类
		// _this.getActivity();	//获取优惠活动列表
		// //设置页面标题为门店名称
		// wx.setNavigationBarTitle({
		// 	title: wx.getStorageSync('shop')['shop_name']
		// });
		// _this.hideModal();	//隐藏多规格窗口
	},

	/**
   * 递增指定的商品数量
   */
	addCount(e) {
		let _this = this,
			index = e.currentTarget.dataset.index,
			category_id = e.currentTarget.dataset.category_id,
			goodsSkuId = e.currentTarget.dataset.skuId,
			goods = _this.data.goods[category_id][index];
		// 后端同步更新
		App._post_form('cart/add', {
			goods_id: goods.goods_id,
			goods_num: 1,
			goods_sku_id: goodsSkuId
		}, () => {
			_this.getList();
		});
	},

  /**
   * 递减指定的商品数量
   */
	minusCount(e) {
		let _this = this,
			index = e.currentTarget.dataset.index,
			category_id = e.currentTarget.dataset.category_id,
			goodsSkuId = e.currentTarget.dataset.skuId,
			goods = _this.data.goods[category_id][index];

		if (goods.total_num > 1) {
			// 后端同步更新
			App._post_form('cart/sub', {
				goods_id: goods.goods_id,
				goods_sku_id: goodsSkuId
			}, () => {
				_this.getList();
			});
		}

		if(goods.total_num==1){
			// 后端同步更新
			App._post_form('cart/delete', {
				goods_id: goods.goods_id,
				goods_sku_id: goodsSkuId
			}, function (result) {
				_this.getList();
			});
		}
	},

	/**
   * 递增 - 多规格
   */
	up(e) {
		let _this = this,
			spec_index = _this.data.spec_index,
			detail = _this.data.detail;
		// 后端同步更新
		detail.spec[0].sell_num++;
		_this.setData({ detail: detail});
		

		
		// App._post_form('cart/add', {
		// 	goods_id: detail.goods_id,
		// 	goods_num: 1,
		// 	goods_sku_id: detail.spec[spec_index].spec_sku_id,
		// 	goods_spec_arr: JSON.stringify(_this.goods_spec_arr)
		// }, () => {
		// 	detail.spec[spec_index].sell_num++;
		// 	_this.setData({ detail: detail});
		// 	_this.getList();
		// });
	},

  /**
   * 递减指定的商品数量
   */
	down() {
		let _this = this,
			spec_index = _this.data.spec_index,
			detail = _this.data.detail;
		if (detail.spec[0].sell_num == 1) {
			return;
		} else {
			detail.spec[0].sell_num--;
			_this.setData({ detail: detail });
		}
		

		// if (detail.spec[spec_index].sell_num > 1) {
		// 	// 后端同步更新
		// 	App._post_form('cart/sub', {
		// 		goods_id: detail.goods_id,
		// 		goods_sku_id: detail.spec[spec_index].spec_sku_id
		// 	}, () => {
		// 		detail.spec[spec_index].sell_num--;
		// 		_this.setData({ detail: detail });
		// 		_this.getList();
		// 	});
		// }
		// if (detail.spec[spec_index].sell_num == 1) {
		// 	// 后端同步更新
		// 	App._post_form('cart/delete', {
		// 		goods_id: detail.goods_id,
		// 		goods_sku_id: detail.spec[spec_index].spec_sku_id
		// 	}, function (result) {
		// 		detail.spec[spec_index].sell_num--;
		// 		_this.setData({ detail: detail });
		// 		_this.getList();
		// 	});
		// }
	},
	
	/**
   * 获取优惠活动列表
   */
	getActivity() {
		let _this = this;
		App._get('activity/lists', {}, function (result) {
			_this.setData({
				activity:result.data.list
			});
		});
	},

	//转到订单页面
	gotoCart: function () {
		wx.navigateTo({
			url: '../flow/checkout'
		})
	},
	
	//获取分类，和分类商品
	getList: function () {
		let _this = this,
		classifySeleted = '';
		App._get('goods/lists', {
			food_mode: _this.data.food_mode
		}, function (result) {
			if (result.data.category){
				classifySeleted = result.data.category[0].category_id;
			}
			_this.setData({
				classifySeleted: classifySeleted,
				category: result.data.category, 
				goods: result.data.goods,
				min_price: result.data.min_price,
				order_total_num: result.data.order_total_num,
				order_total_price: result.data.order_total_price,
			});
		});
	},

	onGoodsScroll: function (e) {
		var _this = this;
		console.log("top:" + e.detail.scrollTop)
		// if (e.detail.scrollTop > 20 && !_this.data.scrollDown) {
		// 	_this.setData({
		// 		scrollDown: true
		// 	});
		// } else if (e.detail.scrollTop <= 3 && _this.data.scrollDown) {
		// 	_this.setData({
		// 		scrollDown: false
		// 	});
		// }


		var scale = e.detail.scrollWidth / 550,
			scrollTop = e.detail.scrollTop / scale,
			h = 0,
			classifySeleted,
			classifySeletedTemp;
		_this.data.category.forEach(function (classify, i) {
			var _h = 70 + _this.data.goods[classify.category_id].length * (46 * 3 + 20 * 2);
			if (scrollTop >= h - 100 / scale) {
				classifySeleted = classify.category_id;
			}
			h += _h;
		});
		if (_this.data.classifySeletedTemp != classifySeleted) {
			console.log("调用setData")
			_this.setData({
				classifySeleted: classifySeleted,
				classifySeletedTemp :classifySeleted
			});

		}
		
	},
	
	//点击左侧分类
	tapClassify: function (e) {
		var _this = this;
		var id = e.target.dataset.id;
		_this.setData({
			classifyViewed: id,
			classifySeleted: id.replace(/id/, "")
		});
	},

	//点击我显示底部弹出框
	clickme: function (e) {
		let _this = this,
			index = e.currentTarget.dataset.index,
			category_id = e.currentTarget.dataset.category_id,
			goods = _this.data.goods[category_id][index],
			data = { detail: goods};
		// 初始化商品详情数据
		_this.setData(_this.initGoodsDetailData(data));
		_this.showModal();
	},

	/**
   * 初始化商品详情数据
   */
	initGoodsDetailData(data) {
		let _this = this;
		// 商品价格/划线价/库存
		data.goods_sku_id = data.detail.spec[0].spec_sku_id;
		data.goods_price = data.detail.spec[0].goods_price;
		data.line_price = data.detail.spec[0].line_price;
		data.stock_num = data.detail.spec[0].stock_num;
		data.spec_index = 0;
		data.goods_img = data.detail.thumbnail;
		data.specData = _this.initManySpecData(data.detail.specData);
		return data;
	},

	/**
	* 初始化商品多规格
	*/
	initManySpecData(data) {
		for (let i=0;i<data.spec_attr.length;i++) {
			for (let j=0;j<data.spec_attr[i].spec_items.length;j++) {
				if (j == 0) {
					data.spec_attr[i].spec_items[0].checked = true;
					// this.goods_spec_arr[i] = data.spec_attr[i].spec_items[0].item_id;
					var item = {
						"item_id": data.spec_attr[i].spec_items[0].item_id,
						"spec_value": data.spec_attr[i].spec_items[0].spec_value
					}
					this.goods_spec_arr[i] = item;
				}else{
					data.spec_attr[i].spec_items[j].checked = false;
				}
			}
		}
		return data;
	},

	/**
 * 点击切换不同规格
 */
	modelTap(e) {
		let attrIdx = e.currentTarget.dataset.attrIdx,
			itemIdx = e.currentTarget.dataset.itemIdx,
			specData = this.data.specData,
			spec_index = e.currentTarget.dataset.itemIdx;

		
		for (let i in specData.spec_attr) {
			for (let j in specData.spec_attr[i].spec_items) {
				if (attrIdx == i) {
					specData.spec_attr[i].spec_items[j].checked = false;
					if (itemIdx == j) {
						specData.spec_attr[i].spec_items[itemIdx].checked = true;
						// this.goods_spec_arr[i] = specData.spec_attr[i].spec_items[itemIdx].item_id;
						var item = {
							"item_id": specData.spec_attr[i].spec_items[itemIdx].item_id,
							"spec_value": specData.spec_attr[i].spec_items[itemIdx].spec_value
						}
						this.goods_spec_arr[i] = item;
					}
				}
			}
		}
		console.log("spec_attr:" + JSON.stringify(this.goods_spec_arr))
		console.log("specData:" + JSON.stringify(specData))
		console.log("spec_index:" + spec_index)
		this.setData({
			specData: specData,
			spec_index: spec_index
		});
		// 更新商品规格信息
		this.updateSpecGoods();
	},

  /**
   * 更新商品规格信息
   */
	updateSpecGoods() {
		let spec_sku_id
		for (let i = 0; i < this.goods_spec_arr.length; i++) {
			if (this.goods_spec_arr[i] != 0) {
				spec_sku_id = this.goods_spec_arr[i].item_id
				break;
			}
		}

		// 查找skuItem
		let spec_list = this.data.specData.spec_list,
			skuItem = spec_list.find((val) => {
				return val.spec_sku_id == spec_sku_id;
			});

		// 记录goods_sku_id
		// 更新商品价格、划线价、库存
		if (typeof skuItem === 'object') {
			this.setData({
				goods_sku_id: skuItem.spec_sku_id,
				goods_price: skuItem.goods_price,
				line_price: skuItem.line_price,
				stock_num: skuItem.stock_num,
			});
		}
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

	//隐藏对话框
	hideModal2: function () {
		let _this = this,
			spec_index = _this.data.spec_index,
			detail = _this.data.detail;

		App._post_form('cart/add', {
			goods_id: detail.goods_id,
			goods_num: detail.spec[0].sell_num,
			goods_sku_id: detail.spec[0].spec_sku_id,
			goods_spec_arr: JSON.stringify(_this.goods_spec_arr)
		}, () => {
			detail.spec[spec_index].sell_num++;
			_this.setData({ detail: detail});
			_this.getList();
		});


		


		this.getList();
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


});

