let App = getApp(),
  wxParse = require("../../wxParse/wxParse.js");
Page({

  /**
   * 页面的初始数据
   */
  data: {
    nav_select: false, // 快捷导航
		article_id:0,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    let _this = this;
		_this.setData({ article_id: options.article_id})

    if (options.recommender != undefined && options.recommender > 0) {
      App.autoLogin(options.recommender);
    }
    // 获取商品信息
    _this.getArticleDetail();
  },

  /**
   * 获取商品信息
   */
	getArticleDetail() {
    let _this = this;
		App._get('article/detail', {
			article_id: _this.data.article_id
    }, function(result) {
      // 初始化详情数据
      let data = _this.initGoodsDetailData(result.data);
      _this.setData(data);
    });
  },

  /**
   * 初始化详情数据
   */
  initGoodsDetailData(data) {
    let _this = this;
    // 富文本转码
		if (data.detail.article_content.length > 0) {
			wxParse.wxParse('content', 'html', data.detail.article_content, _this, 0);
    }
    return data;
  },

  /**
   * 返回顶部
   */
  goTop(t) {
    this.setData({
      scrollTop: 0
    });
  },

  /**
   * 显示/隐藏 返回顶部按钮
   */
  scroll(e) {
    this.setData({
      floorstatus: e.detail.scrollTop > 200
    })
  },

  /**
   * 分享当前页面
   */
  onShareAppMessage: function() {
    // 构建页面参数
    let _this = this;
    return {
			title: _this.data.detail.article_title,
      imageUrl: imageUrl,
			path: "/pages/article/detail?article_id=" + _this.data.detail.article_id + "&recommender=" + App.getUserId()
    };
  },

})