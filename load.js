(function() {
  (function() {
    var app, configs, elem, elems, fn, i, is_mobile_handler, j, len, len1, loadApp, loadLibs, loader, results, sectionIntro, startBt;
    window._version = "1.0.2";
    configs = {
      "tree": [70, 150, 500],
      "rock": [50, 300, 800],
      "grass": [2000, 10000, 30000],
      "resolution": [0.5, 0.7, 1],
      "postprocessing": [true, false]
    };
    window._config = {
      "tree": configs.tree[2],
      "rock": configs.rock[2],
      "grass": configs.grass[2],
      "resolution": configs.resolution[2],
      "postprocessing": configs.postprocessing[0]
    };
    app = null;
    is_mobile_handler = function() {
      if (navigator.userAgent.match(/(android|iphone|ipad|blackberry|symbian|symbianos|symbos|netfront|model-orange|javaplatform|iemobile|windows phone|samsung|htc|opera mobile|opera mobi|opera mini|presto|huawei|blazer|bolt|doris|fennec|gobrowser|iris|maemo browser|mib|cldc|minimo|semc-browser|skyfire|teashark|teleca|uzard|uzardweb|meego|nokia|bb10|playbook)/gi)) {
        return true;
      } else {
        return false;
      }
    };
    loadApp = function() {
      var script;
      script = document.createElement('script');
      script.onload = function() {
        return app = new App();
      };
      script.src = "app.desktop.js?" + window._version;
      return document.getElementsByTagName('head')[0].appendChild(script);
    };
    loadLibs = function() {
      var script;
      script = document.createElement('script');
      script.onload = function() {
        return loadApp();
      };
      script.src = "libs.js?" + window._version;
      return document.getElementsByTagName('head')[0].appendChild(script);
    };
    return loadLibs();
    elems = document.querySelectorAll("section.intro .switch.lowmediumhigh");
    fn = function(_elem) {
      return _elem.onclick = function(e) {
        var currentElement;
        currentElement = "rock";
        if (_elem.classList.contains("rock")) {
          currentElement = "rock";
        }
        if (_elem.classList.contains("tree")) {
          currentElement = "tree";
        }
        if (_elem.classList.contains("grass")) {
          currentElement = "grass";
        }
        if (_elem.classList.contains("resolution")) {
          currentElement = "resolution";
        }
        if (_elem.classList.contains("low")) {
          _elem.classList.remove("low");
          _elem.classList.add("medium");
          return window._config[currentElement] = configs[currentElement][1];
        } else if (_elem.classList.contains("medium")) {
          _elem.classList.remove("medium");
          _elem.classList.add("high");
          return window._config[currentElement] = configs[currentElement][2];
        } else if (_elem.classList.contains("high")) {
          _elem.classList.remove("high");
          _elem.classList.add("low");
          return window._config[currentElement] = configs[currentElement][0];
        }
      };
    };
    for (i = 0, len = elems.length; i < len; i++) {
      elem = elems[i];
      fn(elem);
    }
    return {tree: 500, rock: 800, grass: 30000, resolution: 1, postprocessing: true};
  })();

}).call(this);
