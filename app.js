/**
 * tabBar页面路径列表 (用于链接跳转时判断)
 * tabBarLinks为常量, 无需修改
 */
const tabBarLinks = [
	'pages/index/index',
	'pages/order/index',
	'pages/user/index'
];

App({

	// uniacid: '10001', //商户识别号
	// api_root: 'http://www.test.com/index.php?s=/api/', // api地址
	uniacid: '1', //商户识别号
	api_root: 'http://h2630d7395.wicp.vip/wxapi/', // api地址


	/**
	 * 生命周期函数--监听小程序初始化
	 */
	onLaunch() {
		let App = this,
			recommender = 0, //推荐人ID
			scene = 0, //进入场景值
			qr_code = '', //获取二维码携带的参数
			opt = wx.getEnterOptionsSync(),
			extConfig = wx.getExtConfigSync ? wx.getExtConfigSync() : {};
		if (opt.query.scene != undefined) {
			qr_code = decodeURIComponent(opt.query.scene);
			qr_code = qr_code.split(",");
			if (qr_code[0] == 'user') {
				//参数:'user,user_id',为推广二维码
				recommender = qr_code[1]; //获取推荐人ID
			}
		}
		if (opt.query.recommender != undefined && opt.query.recommender > 10000) {
			//如果获取到转发携带的recommender参数，说明是通过转发链接推广
			recommender = opt.query.recommender; //获取推荐人ID
		}
		if (opt.scene > 1000) {
			scene = opt.scene; //获取用户进入的场景值
		}
		App.userReg(recommender, scene);
		App.upApp();
	},

	/**
	 * 新用户自动注册
	 */
	userReg(recommender, scene) {
		let App = this;
		// 执行微信登录
		wx.login({
			success(res) {
				// 发送用户信息
				App._post_form('user/reg', {
					code: res.code,
					recommender: recommender,
					scene: scene,
					wxapp_id: App.uniacid
				}, function(result) {
					wx.setStorageSync('user_id', result.data.user_id);
				}, function(result) {

				}, function() {

				})
			}
		});
	},

	/**
	 * 小程序新版本检测与升级
	 */
	upApp() {
		const updateManager = wx.getUpdateManager();
		updateManager.onCheckForUpdate(function(res) {
			// 请求完新版本信息的回调
			//console.log(res.hasUpdate);
		})
		updateManager.onUpdateReady(function() {
			wx.showModal({
				title: '更新提示',
				content: '新版本已经准备好，是否重启应用？',
				success: function(res) {
					if (res.confirm) {
						// 新的版本已经下载好，调用 applyUpdate 应用新版本并重启
						updateManager.applyUpdate();
					}
				}
			})
		})
		updateManager.onUpdateFailed(function() {
			// 新版本下载失败
		})
	},

	/**
	 * 获取小程序基础信息
	 */
	getWxappBase(callback) {
		let App = this;
		App._get('wxapp/base', {}, result => {
			// 记录小程序基础信息
			wx.setStorageSync('wxapp', result.data);
			callback && callback(result.data);
		}, false, false);
	},

	/**
	 * 执行用户登录
	 */
	doLogin() {
		// 保存当前页面
		let pages = getCurrentPages();
		if (pages.length) {
			let currentPage = pages[pages.length - 1];
			"pages/login/login" != currentPage.route &&
				wx.setStorageSync("currentPage", currentPage);
		}
		// 跳转授权页面
		wx.navigateTo({
			url: "/pages/login/login"
		});
	},

	/**
	 * 当前用户id
	 */
	getUserId() {
		return wx.getStorageSync('user_id') || 0;
	},

	/**
	 * 获取当前小程序配置
	 */
	getWxapp() {
		return wx.getStorageSync('wxapp')
	},

	/**
	 * 显示成功提示框
	 */
	showSuccess(msg, callback) {
		wx.showToast({
			title: msg,
			icon: 'success',
			success() {
				callback && (setTimeout(() => {
					callback();
				}, 1500));
			}
		});
	},

	/**
	 * 显示失败提示框
	 */
	showError(msg, callback) {
		wx.showModal({
			title: '友情提示',
			content: msg,
			showCancel: false,
			success(res) {
				callback && callback();
			}
		});
	},

	/**
	 * get请求
	 */
	_get(url, data, success, fail, complete, check_login) {
		let App = this;
		wx.showLoading({
			title: '正在加载中',
			mask: true
		});
		// 构造请求参数
		data = Object.assign({
			wxapp_id: App.uniacid,
			shop_id: wx.getStorageSync('shop')['shop_id'] || '',
			token: wx.getStorageSync('token')
		}, data);
		// 构造get请求
		let request = () => {
			data.wxapp_id = App.uniacid;
			data.shop_id = wx.getStorageSync('shop')['shop_id'] || '';
			data.token = wx.getStorageSync('token');
			wx.request({
				url: App.api_root + url,
				header: {
					'content-type': 'application/json'
				},
				data,
				success(res) {
					if (res.statusCode !== 200 || typeof res.data !== 'object') {
						console.log(res);
						App.showError('网络请求出错');
						return false;
					}
					if (res.data.code === -1) {
						// 登录态失效, 重新登录
						wx.hideLoading();
						App.doLogin();
					} else if (res.data.code === 0) {
						fail && fail(res);
						return false;
					} else {
						success && success(res.data);
					}
				},
				fail(res) {
					// console.log(res);
					App.showError(res.errMsg);
				},
				complete(res) {
					wx.hideLoading();
					complete && complete(res);
				},
			});
		};
		// 判断是否需要验证登录
		check_login ? App.doLogin(request) : request();
	},
	
	/**
	 * post提交
	 */
	_post_form(url, data, success, fail, complete) {
		wx.showLoading({
			title: '正在加载中',
			mask: true
		});
		let App = this;
		// 构造请求参数
		data = Object.assign({
			wxapp_id: App.uniacid,
			shop_id: wx.getStorageSync('shop')['shop_id'] || '',
			token: wx.getStorageSync('token')
		}, data);
		wx.request({
			url: App.api_root + url,
			header: {
				'content-type': 'application/x-www-form-urlencoded',
			},
			method: 'POST',
			data,
			success(res) {
				if (res.statusCode !== 200 || typeof res.data !== 'object') {
					App.showError('网络请求出错');
					return false;
				}

				if (res.data.code === -1) {
					// 登录态失效, 重新登录
					App.doLogin(() => {
						App._post_form(url, data, success, fail);
					});
					return false;
				} else if (res.data.code === 0) {
					fail && fail(res.data);
					return false;
				}
				success && success(res.data);
			},
			fail(res) {
				console.log(res);
				App.showError(res.errMsg);
			},
			complete(res) {
				wx.hideLoading();
				complete && complete(res);
			}
		});
	},

	/**
	 * 验证是否存在user_info
	 */
	validateUserInfo() {
		let user_info = wx.getStorageSync('user_info');
		return !!wx.getStorageSync('user_info');
	},

	/**
	 * 对象转URL
	 */
	urlEncode(data) {
		var _result = [];
		for (var key in data) {
			var value = data[key];
			if (value.constructor == Array) {
				value.forEach(_value => {
					_result.push(key + "=" + _value);
				});
			} else {
				_result.push(key + '=' + value);
			}
		}
		return _result.join('&');
	},

	/**
	 * 设置当前页面标题
	 */
	setTitle() {
		let App = this,
			wxapp;
		if (wxapp = App.getWxapp()) {
			console.log("wxapp:" + JSON.stringify(wxapp))
			wx.setNavigationBarTitle({
				title: wxapp.navbar.params.title
			});
		} else {
			App.getWxappBase(() => {
				App.setTitle();
			});
		}
	},

	/**
	 * 设置navbar标题、颜色
	 */
	setNavigationBar() {
		let App = this;
		// 获取小程序基础信息
		App.getWxappBase(wxapp => {
			// 设置navbar标题、颜色
			wx.setNavigationBarColor({
				frontColor: wxapp.navbar.style.titleTextColor == 'black' ? '#000000' : '#FFFFFF',
				backgroundColor: wxapp.navbar.style.titleBackgroundColor
			})
		});
	},

	/**
	 * 获取tabBar页面路径列表
	 */
	getTabBarLinks() {
		return tabBarLinks;
	},

	/**
	 * 验证登录
	 */
	checkIsLogin() {
		return wx.getStorageSync('token') != '' && wx.getStorageSync('user_id') != '';
	},

	/**
	 * 授权登录
	 */
	getUserInfo(e, callback) {
		let App = this;
		if (e.detail.errMsg !== 'getUserInfo:ok') {
			return false;
		}
		// 执行微信登录
		wx.login({
			success(res) {
				// 发送用户信息
				App._post_form('user/login', {
					code: res.code,
					user_info: e.detail.rawData,
					encrypted_data: e.detail.encryptedData,
					iv: e.detail.iv,
					signature: e.detail.signature
				}, result => {
					// 记录token user_id
					wx.setStorageSync('token', result.data.token);
					wx.setStorageSync('user_id', result.data.user_id);
					// 执行回调函数
					callback && callback();
				}, false, () => {});
			}
		});
	},
});
