"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Multiple_Post_Counts = function () {
	function Multiple_Post_Counts() {
		_classCallCheck(this, Multiple_Post_Counts);
	}

	_createClass(Multiple_Post_Counts, null, [{
		key: "init",
		value: function init() {
			if (typeof yootil == "undefined") {
				console.error("Multiple Post Counts: Yootil not installed");
				return;
			}

			this.ID = "pd_mulitple_post_counts";
			this.KEY = "pd_post_counts";

			this.SETTINGS = null;
			this.PLUGIN = null;

			this.KEY_DATA = new Map();

			this.setup();
			this.setup_data();

			this.api.init();

			$(this.ready.bind(this));
		}
	}, {
		key: "ready",
		value: function ready() {
			var location_check = yootil.location.search_results() || yootil.location.message_thread() || yootil.location.thread() || yootil.location.recent_posts();

			if (location_check) {
				Multiple_Post_Counts_Mini_Profile.init();
			}

			if ((yootil.location.posting() || yootil.location.thread()) && yootil.user.logged_in()) {
				Multiple_Post_Counts_Post.init();
			}
		}
	}, {
		key: "setup",
		value: function setup() {
			var plugin = pb.plugin.get(this.ID);

			if (plugin && plugin.settings) {
				this.PLUGIN = plugin;
				this.SETTINGS = plugin.settings;
			}
		}
	}, {
		key: "setup_data",
		value: function setup_data() {
			var user_data = proboards.plugin.keys.data[this.KEY];

			for (var key in user_data) {
				var id = parseInt(key, 10) || 0;

				if (id && !this.KEY_DATA.has(id)) {
					var value = !user_data[key] ? {} : user_data[key];

					this.KEY_DATA.set(id, new Multiple_Post_Counts_User_Data(id, value));
				}
			}
		}
	}]);

	return Multiple_Post_Counts;
}();

var Multiple_Post_Counts_User_Data = function () {
	function Multiple_Post_Counts_User_Data() {
		var user_id = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;
		var data = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

		_classCallCheck(this, Multiple_Post_Counts_User_Data);

		this._id = user_id;
		this._DATA = data;
	}

	_createClass(Multiple_Post_Counts_User_Data, [{
		key: "save",
		value: function save() {
			var callback = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;

			yootil.key.set(Multiple_Post_Counts.KEY, this._DATA, this._id, callback);
		}
	}, {
		key: "clear",
		value: function clear() {
			var key = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : "";

			this._DATA = {};
		}
	}, {
		key: "get_data",
		value: function get_data() {
			return this._DATA;
		}
	}, {
		key: "set_data",
		value: function set_data() {
			var data = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

			this._DATA = data;
		}
	}]);

	return Multiple_Post_Counts_User_Data;
}();

var Multiple_Post_Counts_Post = function () {
	function Multiple_Post_Counts_Post() {
		_classCallCheck(this, Multiple_Post_Counts_Post);
	}

	_createClass(Multiple_Post_Counts_Post, null, [{
		key: "init",
		value: function init() {
			var _this = this;

			this._count_added = 0;
			this._submitted = false;
			this._hook = yootil.location.posting_thread() ? "thread_new" : yootil.location.thread() ? "post_quick_reply" : "post_new";
			this._counts = Multiple_Post_Counts_Utils.get_post_counts_for_board(true);

			var $the_form = yootil.form.any_posting();

			if ($the_form.length) {
				$the_form.on("submit", function () {
					_this._submitted = true;
					_this.set_on();
				});
			}
		}
	}, {
		key: "set_on",
		value: function set_on() {
			if (!yootil.location.editing()) {
				var user_id = yootil.user.id();

				if (this._submitted) {
					if (this._count_added) {
						Multiple_Post_Counts.api.decrease(user_id).count(1, this._counts);
					}

					this._count_added = 1;

					Multiple_Post_Counts.api.cleanup(user_id);
					Multiple_Post_Counts.api.increase(user_id).count(1, this._counts);
					yootil.key.set_on(Multiple_Post_Counts.KEY, Multiple_Post_Counts.api.get(user_id).data(), user_id, this._hook);
					Multiple_Post_Counts.api.sync(yootil.user.id());
				}
			}
		}
	}]);

	return Multiple_Post_Counts_Post;
}();

var Multiple_Post_Counts_Utils = function () {
	function Multiple_Post_Counts_Utils() {
		_classCallCheck(this, Multiple_Post_Counts_Utils);
	}

	_createClass(Multiple_Post_Counts_Utils, null, [{
		key: "get_post_counts_for_board",
		value: function get_post_counts_for_board() {
			var map = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;

			var board_id = parseInt(yootil.page.board.id(), 10);
			var counts = map ? new Map() : [];

			if (board_id) {
				var pcs = Multiple_Post_Counts.SETTINGS.post_counts;

				for (var i = 0; i < pcs.length; ++i) {
					if ($.inArrayLoose(board_id, pcs[i].boards) > -1) {
						map ? counts.set(pcs[i].unique_id, 0) : counts.push(pcs[i]);
					}
				}
			}

			return counts;
		}
	}, {
		key: "get_post_counts",
		value: function get_post_counts() {
			return Multiple_Post_Counts.SETTINGS.post_counts;
		}
	}]);

	return Multiple_Post_Counts_Utils;
}();

Multiple_Post_Counts.api = function () {
	function _class() {
		_classCallCheck(this, _class);
	}

	_createClass(_class, null, [{
		key: "init",
		value: function init() {
			var data = yootil.user.logged_in() ? this.get(yootil.user.id()).data() : {};

			this._sync = new Multiple_Post_Counts_Sync(data, Multiple_Post_Counts_Sync_Handler);
		}
	}, {
		key: "data",
		value: function data() {
			var user_id = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;

			var id = parseInt(user_id, 10);

			if (id > 0) {
				if (!Multiple_Post_Counts.KEY_DATA.has(id)) {
					Multiple_Post_Counts.KEY_DATA.set(id, new Multiple_Post_Counts_User_Data(id, {}));
				}

				return Multiple_Post_Counts.KEY_DATA.get(id);
			}

			return null;
		}
	}, {
		key: "clear",
		value: function clear() {
			var user_id = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;

			var user_data = this.data(user_id);

			if (!user_data) {
				return null;
			}

			return {
				data: function data() {
					user_data.set_data({});
				}
			};
		}
	}, {
		key: "get",
		value: function get() {
			var user_id = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;

			var user_data = this.data(user_id);

			if (!user_data) {
				return null;
			}

			return {
				data: function data() {
					return user_data.get_data();
				}
			};
		}
	}, {
		key: "set",
		value: function set() {
			var user_id = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;

			var user_data = this.data(user_id);

			if (!user_data) {
				return null;
			}

			return {
				data: function data(_data) {
					user_data._DATA = _data;
				}
			};
		}
	}, {
		key: "cleanup",
		value: function cleanup() {
			var user_id = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;

			var user_data = this.get(user_id).data();

			if (!user_data) {
				return;
			}

			var valid = Multiple_Post_Counts_Utils.get_post_counts();
			var keys = {};

			for (var i = 0; i < valid.length; ++i) {
				keys[valid[i].unique_id] = valid[i].unique_id;
			}

			for (var key in user_data) {
				if (keys[key] == null) {
					delete user_data[key];
				}
			}

			this.set(user_id).data(user_data);
		}
	}, {
		key: "increase",
		value: function increase() {
			var user_id = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;

			var user_data = this.data(user_id);

			if (!user_data) {
				return null;
			}

			return {
				count: function count() {
					var amount = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;
					var counts = arguments[1];

					if (counts == null || counts.size == 0) {
						return;
					}

					var data = user_data.get_data() || {};

					var _iteratorNormalCompletion = true;
					var _didIteratorError = false;
					var _iteratorError = undefined;

					try {
						for (var _iterator = counts.entries()[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
							var entry = _step.value;

							var current = 0;

							if (data[entry[0]] != null) {
								current = parseInt(data[entry[0]], 10) || 0;
							} else {
								data[entry[0]] = 0;
							}

							data[entry[0]] = parseInt(current, 10) + amount;
						}
					} catch (err) {
						_didIteratorError = true;
						_iteratorError = err;
					} finally {
						try {
							if (!_iteratorNormalCompletion && _iterator.return) {
								_iterator.return();
							}
						} finally {
							if (_didIteratorError) {
								throw _iteratorError;
							}
						}
					}

					return user_data.set_data(data);
				}
			};
		}
	}, {
		key: "decrease",
		value: function decrease() {
			var user_id = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;

			var user_data = this.data(user_id);

			if (!user_data) {
				return null;
			}

			return {
				count: function count() {
					var amount = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;
					var counts = arguments[1];

					if (counts == null || counts.size == 0) {
						return;
					}

					var data = user_data.get_data() || {};

					var _iteratorNormalCompletion2 = true;
					var _didIteratorError2 = false;
					var _iteratorError2 = undefined;

					try {
						for (var _iterator2 = counts.entries()[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
							var entry = _step2.value;

							var current = 0;

							if (data[entry[0]] != null) {
								current = parseInt(data[entry[0]], 10) || 0;
							} else {
								data[entry[0]] = 0;
							}

							data[entry[0]] = current > 0 ? current - amount : 0;
						}
					} catch (err) {
						_didIteratorError2 = true;
						_iteratorError2 = err;
					} finally {
						try {
							if (!_iteratorNormalCompletion2 && _iterator2.return) {
								_iterator2.return();
							}
						} finally {
							if (_didIteratorError2) {
								throw _iteratorError2;
							}
						}
					}

					return user_data.set_data(data);
				}
			};
		}
	}, {
		key: "save",
		value: function save() {
			var user_id = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;
			var callback = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;

			var user_data = this.data(user_id);

			if (user_data) {
				user_data.save(callback);

				return true;
			}

			return false;
		}
	}, {
		key: "refresh_all_data",
		value: function refresh_all_data() {
			Multiple_Post_Counts.setup_data();
		}
	}, {
		key: "clear_all_data",
		value: function clear_all_data() {
			Multiple_Post_Counts.KEY_DATA.clear();
		}
	}, {
		key: "sync",
		value: function sync(user_id) {
			if (user_id != yootil.user.id()) {
				return;
			}

			var user_data = this.data(user_id);

			if (!user_data) {
				return null;
			}

			this._sync.update(user_data.get_data());
		}
	}]);

	return _class;
}();

var Multiple_Post_Counts_Sync = function () {
	function Multiple_Post_Counts_Sync() {
		var _this2 = this;

		var data = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
		var handler = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;

		_classCallCheck(this, Multiple_Post_Counts_Sync);

		if (!handler || typeof handler.change == "undefined") {
			return;
		}

		this._trigger_caller = false;
		this._handler = handler;
		this._key = "multiple_post_counts_data_sync_" + yootil.user.id();

		// Need to set the storage off the bat

		yootil.storage.set(this._key, data, true, true);

		// Delay adding event (IE issues yet again)

		setTimeout(function () {
			return $(window).on("storage", function (evt) {
				if (evt && evt.originalEvent && evt.originalEvent.key == _this2._key) {

					// IE fix

					if (_this2._trigger_caller) {
						_this2._trigger_caller = false;
						return;
					}

					var event = evt.originalEvent;
					var old_data = event.oldValue;
					var new_data = event.newValue;

					// If old == new, don't do anything

					if (old_data != new_data) {
						_this2._handler.change(JSON.parse(new_data), JSON.parse(old_data));
					}
				}
			});
		}, 100);
	}

	// For outside calls to trigger a manual update

	_createClass(Multiple_Post_Counts_Sync, [{
		key: "update",
		value: function update() {
			var data = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

			this._trigger_caller = true;
			yootil.storage.set(this._key, data, true, true);
		}
	}, {
		key: "key",
		get: function get() {
			return this._key;
		}
	}]);

	return Multiple_Post_Counts_Sync;
}();

;

var Multiple_Post_Counts_Sync_Handler = function () {
	function Multiple_Post_Counts_Sync_Handler() {
		_classCallCheck(this, Multiple_Post_Counts_Sync_Handler);
	}

	_createClass(Multiple_Post_Counts_Sync_Handler, null, [{
		key: "change",
		value: function change(new_data, old_data) {
			this._new_data = new_data;
			this._old_data = old_data;

			Multiple_Post_Counts.api.set(yootil.user.id()).data(this._new_data);

			$(this.ready.bind(this));
		}
	}, {
		key: "ready",
		value: function ready() {
			this.update_mini_profile();
		}
	}, {
		key: "update_mini_profile",
		value: function update_mini_profile() {
			var location_check = yootil.location.search_results() || yootil.location.message_thread() || yootil.location.thread() || yootil.location.recent_posts();

			if (location_check) {
				var user_id = yootil.user.id();
				var $mini_profiles = yootil.get.mini_profiles(user_id);

				if ($mini_profiles.length) {
					var $elems = $mini_profiles.find(".multiple-post-counts");

					if ($elems.length) {
						var counts = Multiple_Post_Counts_Utils.get_post_counts();
						var data = Multiple_Post_Counts.api.get(user_id).data();

						if (data != null) {
							for (var i = 0; i < counts.length; ++i) {
								var amount = 0;

								if (data[counts[i].unique_id] != null) {
									amount = yootil.html_encode(yootil.number_format(parseInt(data[counts[i].unique_id], 10) || 0));
								}

								$elems.find(".multiple-post-counts-count-" + counts[i].unique_id + " span").text(amount);
							}
						}
					}
				}
			}
		}
	}, {
		key: "old_data",
		get: function get() {
			return this._old_data;
		}
	}, {
		key: "new_data",
		get: function get() {
			return this._new_data;
		}
	}]);

	return Multiple_Post_Counts_Sync_Handler;
}();

;

var Multiple_Post_Counts_Mini_Profile = function () {
	function Multiple_Post_Counts_Mini_Profile() {
		_classCallCheck(this, Multiple_Post_Counts_Mini_Profile);
	}

	_createClass(Multiple_Post_Counts_Mini_Profile, null, [{
		key: "init",
		value: function init() {
			this.using_custom = false;
			this.add_to_mini_profiles();
			yootil.event.after_search(this.add_to_mini_profiles, this);
		}
	}, {
		key: "add_to_mini_profiles",
		value: function add_to_mini_profiles() {
			var _this3 = this;

			var $mini_profiles = yootil.get.mini_profiles();

			if (!$mini_profiles.length || $mini_profiles.find(".multiple-post-counts").length) {
				return;
			}

			$mini_profiles.each(function (index, item) {
				var $mini_profile = $(item);
				var $elem = $mini_profile.find(".multiple-post-counts");
				var $user_link = $mini_profile.find("a.user-link[href*='user/']");
				var $info = $mini_profile.find(".info");

				if (!$elem.length && !$info.length) {
					console.warn("Multiple Post Counts: No info element found.");
					return;
				}

				if ($user_link.length) {
					var user_id_match = $user_link.attr("href").match(/\/user\/(\d+)\/?/i);

					if (!user_id_match || !parseInt(user_id_match[1], 10)) {
						console.warn("Multiple Post Counts: No info element found.");
						return;
					}

					Multiple_Post_Counts.api.refresh_all_data();

					var user_id = parseInt(user_id_match[1], 10);
					var using_info = false;

					if ($elem.length) {
						_this3.using_custom = true;
					} else {
						using_info = true;
						$elem = $("<div class='multiple-post-counts'></div>");
					}

					var counts = Multiple_Post_Counts_Utils.get_post_counts();
					var html = "";
					var data = Multiple_Post_Counts.api.get(user_id).data();

					if (data != null) {
						for (var i = 0; i < counts.length; ++i) {
							var amount = 0;

							if (data[counts[i].unique_id] != null) {
								amount = yootil.html_encode(yootil.number_format(parseInt(data[counts[i].unique_id], 10) || 0));
							}

							html += "<span class='multiple-post-counts-count-" + counts[i].unique_id + "'>" + counts[i].name + ": <span>" + amount + "</span></span><br />";
						}
					}

					$elem.html(html);

					if (using_info) {
						$info.prepend($elem);
					}

					$elem.show();
				} else {
					console.warn("Multiple Post Counts: Could not find user link.");
				}
			});
		}
	}]);

	return Multiple_Post_Counts_Mini_Profile;
}();

;


Multiple_Post_Counts.init();