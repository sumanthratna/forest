(function() {
  window.Data = (function() {
    var is_mobile_handler, loadProgress, load_models, load_shaders, progress, progressTween, that;

    function Data() {}

    that = Data;

    Data.data = {};

    Data.incLoad = 0;

    Data.is_mobile = false;

    Data.shader = null;

    Data.textures = {};

    Data.geo = {};

    progressTween = {
      p: 0
    };

    progress = 0;

    Data.loadData = function(url) {
      that.is_mobile = is_mobile_handler();
      return $.getJSON(url + "?" + window._version, function(data) {
        Data.data = data;
        return load_shaders();
      });
    };

    load_shaders = function() {
      var i, len, ref, shader_name;
      that.shader = new ShaderLoader();
      ref = that.data.shader;
      for (i = 0, len = ref.length; i < len; i++) {
        shader_name = ref[i];
        that.shader.add(shader_name + '-vs', 'mx/shaders/' + shader_name + '.vert' + '?' + window._version);
        that.shader.add(shader_name + '-fs', 'mx/shaders/' + shader_name + '.frag' + '?' + window._version);
      }
      that.shader.load();
      return that.shader.onLoaded(function() {
        return load_models();
      });
    };

    load_models = function() {
      var fn, geo, k, l, m, ref, ref1, results, t, texture;
      l = new THREE.LoadingManager(function() {
        return setTimeout(Dispatcher.event.onLoadData.dispatch, 2000);
      }, function(item, loaded, total) {
        return loadProgress(loaded / total);
      }, function() {
        return console.log('onError');
      });
      t = new THREE.TextureLoader(l);
      m = new THREE.JSONLoader(l);
      ref = that.data.texture;
      fn = function(_k) {
        return t.load(texture + '?' + window._version, function(t) {
          that.textures[_k] = t;
          that.textures[_k].wrapS = that.textures[_k].wrapT = THREE.RepeatWrapping;
          that.textures[_k].minFilter = THREE.LinearMipMapLinearFilter;
          return that.textures[_k].magFilter = THREE.LinearFilter;
        });
      };
      for (k in ref) {
        texture = ref[k];
        fn(k);
      }
      ref1 = that.data.geo;
      results = [];
      for (k in ref1) {
        geo = ref1[k];
        results.push((function(_k) {
          return m.load(geo + '?' + window._version, function(m) {
            return that.geo[_k] = m;
          });
        })(k));
      }
      return results;
    };

    loadProgress = function(p) {
      progress = p;
      return TweenMax.to(progressTween, 2, {
        p: progress,
        ease: Expo.easeInOut,
        onUpdate: function() {
          var v;
          v = Math.round(100 * progressTween.p);
          if (v < 10) {
            v = "00" + v;
          } else if (v < 100) {
            v = "0" + v;
          }
          return $("#loader .percentage").html(v);
        }
      });
    };

    is_mobile_handler = function() {
      if (navigator.userAgent.match(/(android|iphone|ipad|blackberry|symbian|symbianos|symbos|netfront|model-orange|javaplatform|iemobile|windows phone|samsung|htc|opera mobile|opera mobi|opera mini|presto|huawei|blazer|bolt|doris|fennec|gobrowser|iris|maemo browser|mib|cldc|minimo|semc-browser|skyfire|teashark|teleca|uzard|uzardweb|meego|nokia|bb10|playbook)/gi)) {
        if (((screen.width >= 480) && (screen.height >= 800)) || ((screen.width >= 800) && (screen.height >= 480)) || navigator.userAgent.match(/ipad/gi)) {
          return true;
        } else {
          return true;
        }
      } else {
        return false;
      }
    };

    return Data;

  })();

}).call(this);

(function() {
  var bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  window.Dispatcher = (function() {
    function Dispatcher() {
      this.addNewSignal = bind(this.addNewSignal, this);
    }

    Dispatcher.event = {
      disableSection: new signals.Signal(),
      href: new signals.Signal(),
      onLoadData: new signals.Signal(),
      resize: new signals.Signal(),
      hideLoader: new signals.Signal(),
      showLoader: new signals.Signal(),
      loadProgress: new signals.Signal(),
      navigateTo: new signals.Signal(),
      routeTo: new signals.Signal(),
      goVinyls1: new signals.Signal(),
      goGame: new signals.Signal(),
      goVinyls2: new signals.Signal(),
      goMachine: new signals.Signal(),
      goPlatine: new signals.Signal(),
      goFrisbeel: new signals.Signal(),
      goFour: new signals.Signal(),
      goTuto: new signals.Signal(),
      goBlur: new signals.Signal(),
      goView: new signals.Signal()
    };

    Dispatcher.prototype.addNewSignal = function(s) {
      return this.event[s] = new signals.Signal();
    };

    return Dispatcher;

  })();

}).call(this);

(function() {
  var bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  window.Scene = (function() {
    var FXAAEffect, SHADOW_MAP_HEIGHT, SHADOW_MAP_WIDTH, _$dom, light, that;

    that = null;

    _$dom = null;

    FXAAEffect = null;

    light = null;

    SHADOW_MAP_WIDTH = 2048;

    SHADOW_MAP_HEIGHT = 1024;


    /*
    	   ______                 __                  __
    	  / ____/___  ____  _____/ /________  _______/ /_____  _____
    	 / /   / __ \/ __ \/ ___/ __/ ___/ / / / ___/ __/ __ \/ ___/
    	/ /___/ /_/ / / / (__  ) /_/ /  / /_/ / /__/ /_/ /_/ / /
    	\____/\____/_/ /_/____/\__/_/   \__,_/\___/\__/\____/_/
     */

    function Scene(elem) {
      this.render = bind(this.render, this);
      this.setsize = bind(this.setsize, this);
      this.resize = bind(this.resize, this);
      this.init = bind(this.init, this);
      this.setPixelRatio = bind(this.setPixelRatio, this);
      that = this;
      _$dom = elem;
    }

    Scene.prototype.setPixelRatio = function(ratio) {
      return this.renderer.setPixelRatio(ratio);
    };

    Scene.prototype.init = function() {
      var aspect;
      this.quality = 1;
      this.renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true
      });
      this.renderer.setClearColor(0x020508);
      if (this.renderer.extensions.get('ANGLE_instanced_arrays') === false) {
        return false;
      }
      this.renderer.setSize(window.innerWidth, window.innerHeight);
      _$dom.appendChild(this.renderer.domElement);
      this.renderer.gammaInput = true;
      this.renderer.gammaOutput = true;
      this.renderer.shadowMap.enabled = true;
      this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
      aspect = window.innerWidth / window.innerHeight;
      this.camera = new THREE.PerspectiveCamera(80, window.innerWidth / window.innerHeight, 1, 10000);
      this.camera.position.z = 1400;
      this.camera.position.y = 800;
      this.scene = new THREE.Scene();
      this.scene.fog = new THREE.FogExp2(0x62a5c8, 0.0002);
      this.scene.add(this.camera);
      return true;
    };

    Scene.prototype.resize = function(w, h) {
      this.camera.aspect = w / h;
      this.camera.updateProjectionMatrix();
      return this.renderer.setSize(w, h);
    };

    Scene.prototype.setsize = function(w, h) {
      this.camera.aspect = w / h;
      this.camera.updateProjectionMatrix();
      return this.renderer.setViewport(0, 0, w, h);
    };

    Scene.prototype.render = function() {
      this.renderer.clear();
      return this.renderer.render(this.scene, this.camera);
    };

    return Scene;

  })();

}).call(this);

(function() {
  var bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  window.Section = (function() {

    /*
    	   ______                 __                  __
    	  / ____/___  ____  _____/ /________  _______/ /_____  _____
    	 / /   / __ \/ __ \/ ___/ __/ ___/ / / / ___/ __/ __ \/ ___/
    	/ /___/ /_/ / / / (__  ) /_/ /  / /_/ / /__/ /_/ /_/ / /
    	\____/\____/_/ /_/____/\__/_/   \__,_/\___/\__/\____/_/
     */
    function Section(name) {
      this.name = name;
      this.end = bind(this.end, this);
      this.start = bind(this.start, this);
      this.enabled = false;
      this.dom = null;
    }


    /*
    	    ____        __    ___         ______                 __  _
    	   / __ \__  __/ /_  / (_)____   / ____/_  ______  _____/ /_(_)___  ____
    	  / /_/ / / / / __ \/ / / ___/  / /_  / / / / __ \/ ___/ __/ / __ \/ __ \
    	 / ____/ /_/ / /_/ / / / /__   / __/ / /_/ / / / / /__/ /_/ / /_/ / / / /
    	/_/    \__,_/_.___/_/_/\___/  /_/    \__,_/_/ /_/\___/\__/_/\____/_/ /_/
     */

    Section.prototype.init = function() {};

    Section.prototype.start = function() {
      this.enabled = true;
      return TweenMax.set(this.dom, {
        autoAlpha: 1,
        display: "block"
      });
    };

    Section.prototype.end = function() {
      this.enabled = false;
      return TweenMax.set(this.dom, {
        autoAlpha: 0,
        display: "none"
      });
    };

    return Section;

  })();

}).call(this);

(function() {
  var bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  window.Section1 = (function(superClass) {
    var $dom, $dom_elements, animIn, height, resize, stage, that, width;

    extend(Section1, superClass);

    that = null;

    $dom = null;

    stage = null;

    width = window.innerWidth;

    height = window.innerHeight;

    $dom_elements = {};


    /*
    	   ______                 __                  __
    	  / ____/___  ____  _____/ /________  _______/ /_____  _____
    	 / /   / __ \/ __ \/ ___/ __/ ___/ / / / ___/ __/ __ \/ ___/
    	/ /___/ /_/ / / / (__  ) /_/ /  / /_/ / /__/ /_/ /_/ / /
    	\____/\____/_/ /_/____/\__/_/   \__,_/\___/\__/\____/_/
     */

    function Section1() {
      this.end = bind(this.end, this);
      this.start = bind(this.start, this);
      this.addEvents = bind(this.addEvents, this);
      this.init = bind(this.init, this);
      Section1.__super__.constructor.apply(this, arguments);
      that = this;
    }

    Section1.prototype.init = function() {
      Section1.__super__.init.apply(this, arguments);
      console.log(window._config);
      $dom = $("section.section1");
      this.dom = $dom[0];
      $dom_elements.stage = $dom.find(">.stage");
      TweenMax.set(this.dom, {
        display: "block"
      });
      stage = new Stage($dom_elements.stage);
      this.addEvents();
      return this.start();
    };


    /*
    	    ____        __    ___         ______                 __  _
    	   / __ \__  __/ /_  / (_)____   / ____/_  ______  _____/ /_(_)___  ____
    	  / /_/ / / / / __ \/ / / ___/  / /_  / / / / __ \/ ___/ __/ / __ \/ __ \
    	 / ____/ /_/ / /_/ / / / /__   / __/ / /_/ / / / / /__/ /_/ / /_/ / / / /
    	/_/    \__,_/_.___/_/_/\___/  /_/    \__,_/_/ /_/\___/\__/_/\____/_/ /_/
     */

    Section1.prototype.addEvents = function() {
      Dispatcher.event.resize.add(resize);
      return stage.addEvents();
    };

    Section1.prototype.start = function() {
      Section1.__super__.start.call(this);
      console.log("START");
      return animIn();
    };

    Section1.prototype.end = function() {
      return Section1.__super__.end.call(this);
    };


    /*
    	    ____       _             __          ______                 __  _
    	   / __ \_____(_)   ______ _/ /____     / ____/_  ______  _____/ /_(_)___  ____
    	  / /_/ / ___/ / | / / __ `/ __/ _ \   / /_  / / / / __ \/ ___/ __/ / __ \/ __ \
    	 / ____/ /  / /| |/ / /_/ / /_/  __/  / __/ / /_/ / / / / /__/ /_/ / /_/ / / / /
    	/_/   /_/  /_/ |___/\__,_/\__/\___/  /_/    \__,_/_/ /_/\___/\__/_/\____/_/ /_/
     */

    resize = function() {
      width = window.innerWidth;
      return height = window.innerHeight;
    };

    animIn = function() {
      $dom.addClass("visible");
      return stage.animIn();
    };

    return Section1;

  })(Section);

}).call(this);

(function() {
  var bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  window.Stage = (function() {
    var N, _$dom, _onMouseMove, addGrass, addGround, addParticule, addRocks, addSky, addTrees, angleCam, bgColor, clock, defaultCamera, getMapCanvas, height, init, initPostprocessing, letters, mFar, mNear, meshGrass, meshGround, meshParticules, meshRocks, meshSky, meshTrees, mouse, numSlowFrame, postprocessing, render, renderHandler, renderer, renderframe, resize, scene, screenSpacePosition, setOffetsSeedsRotation, setupScene, shadowCanvas, shadowCanvasObj, sunColor, sunPosition, target, that, width;

    that = null;

    _$dom = null;

    letters = [];

    defaultCamera = [];

    width = window.innerWidth;

    height = window.innerHeight;

    scene = renderer = null;

    N = 4;

    clock = new THREE.Clock();

    numSlowFrame = 0;

    renderframe = 0;

    mNear = 1000;

    mFar = 5000;

    mouse = {
      x: 0,
      y: 0
    };

    angleCam = {
      x: 0,
      y: 0
    };

    target = new THREE.Vector3();

    meshSky = null;

    meshTrees = null;

    meshRocks = null;

    meshGround = null;

    meshGrass = null;

    meshParticules = null;

    bgColor = 0x000511;

    sunColor = 0xffee00;

    postprocessing = {};

    screenSpacePosition = new THREE.Vector3();

    sunPosition = new THREE.Vector3(5000, 15000, 5000);

    shadowCanvasObj = {};


    /*
    	   ______                 __                  __
    	  / ____/___  ____  _____/ /________  _______/ /_____  _____
    	 / /   / __ \/ __ \/ ___/ __/ ___/ / / / ___/ __/ __ \/ ___/
    	/ /___/ /_/ / / / (__  ) /_/ /  / /_/ / /__/ /_/ /_/ / /
    	\____/\____/_/ /_/____/\__/_/   \__,_/\___/\__/\____/_/
     */

    function Stage(elem) {
      this.removeEvents = bind(this.removeEvents, this);
      this.addEvents = bind(this.addEvents, this);
      this.setDomElement = bind(this.setDomElement, this);
      that = this;
      that.meshes = [];
      that._profil = "high";
      this.setDomElement(elem);
      init();
    }


    /*
    	    ____        __    ___         ______                 __  _
    	   / __ \__  __/ /_  / (_)____   / ____/_  ______  _____/ /_(_)___  ____
    	  / /_/ / / / / __ \/ / / ___/  / /_  / / / / __ \/ ___/ __/ / __ \/ __ \
    	 / ____/ /_/ / /_/ / / / /__   / __/ / /_/ / / / / /__/ /_/ / /_/ / / / /
    	/_/    \__,_/_.___/_/_/\___/  /_/    \__,_/_/ /_/\___/\__/_/\____/_/ /_/
     */

    Stage.prototype.setDomElement = function(elem) {
      return _$dom = $(elem);
    };

    Stage.prototype.addEvents = function() {
      Dispatcher.event.resize.add(resize);
      return TweenMax.ticker.addEventListener('tick', render);
    };

    Stage.prototype.removeEvents = function() {
      return Dispatcher.event.resize.remove(resize);
    };

    Stage.prototype.animIn = function() {
      return null;
    };

    resize = function() {
      width = window.innerWidth;
      height = window.innerHeight;
      return scene.resize(width, height);
    };

    render = function() {
      if (renderframe % 2 === 0) {
        renderHandler();
        renderframe = 0;
      }
      return renderframe++;
    };

    renderHandler = function() {
      var TAPS_PER_PASS, axis, filterLen, pass, rad, speed, stepLen, sunsqH, sunsqW, targetDecal, time;
      time = performance.now() * 0.0005;
      meshTrees.material.uniforms.time.value = time * 2.0;
      meshGrass.material.uniforms.time.value = time * 2.0;
      meshParticules.material.uniforms.time.value = time * 2.0;
      speed = 0.08;
      targetDecal = 0.9;
      scene.camera.position.x = Math.cos(time * speed) * 2000 * 1;
      scene.camera.position.z = Math.sin(time * speed * 2) * 2000 * 1;
      scene.camera.position.y = -Math.abs(Math.cos(time * speed)) * 150 + 170 + 100 - 50;
      target.x = Math.cos((time + targetDecal) * speed) * 2000 * 1;
      target.z = Math.sin((time + targetDecal) * speed * 2) * 2000 * 1;
      angleCam.y += (mouse.y - angleCam.y) * .05;
      angleCam.x += (mouse.x - angleCam.x) * .05;
      target.y = -Math.abs(Math.cos((time + targetDecal) * speed)) * 150 + 170 + 98 - 50;
      sunPosition.x = (target.x - scene.camera.position.x) * .50 + scene.camera.position.x;
      sunPosition.z = (target.z - scene.camera.position.z) * .50 + scene.camera.position.z;
      sunPosition.y = target.y + 500;
      scene.camera.lookAt(target);
      axis = new THREE.Vector3(0.0, 1.0, 0);
      rad = angleCam.x;
      scene.camera.rotateOnAxis(axis, rad);
      axis = new THREE.Vector3(1.0, 0.0, 0);
      rad = angleCam.y;
      scene.camera.rotateOnAxis(axis, rad);
      if (window._config.postprocessing) {
        screenSpacePosition.copy(sunPosition).project(scene.camera);
        screenSpacePosition.x = (screenSpacePosition.x + 1) / 2;
        screenSpacePosition.y = (screenSpacePosition.y + 1) / 2;
        postprocessing.godrayGenUniforms["vSunPositionScreenSpace"].value.x = screenSpacePosition.x;
        postprocessing.godrayGenUniforms["vSunPositionScreenSpace"].value.y = screenSpacePosition.y;
        postprocessing.godraysFakeSunUniforms["vSunPositionScreenSpace"].value.x = screenSpacePosition.x;
        postprocessing.godraysFakeSunUniforms["vSunPositionScreenSpace"].value.y = screenSpacePosition.y;
        scene.renderer.clearTarget(postprocessing.rtTextureColors, true, true, false);
        sunsqH = 0.74 * height;
        sunsqW = 0.74 * height;
        screenSpacePosition.x *= width;
        screenSpacePosition.y *= height;
        scene.renderer.setScissor(screenSpacePosition.x - sunsqW / 2, screenSpacePosition.y - sunsqH / 2, sunsqW, sunsqH);
        scene.renderer.setScissorTest(true);
        postprocessing.godraysFakeSunUniforms["fAspect"].value = width / height;
        postprocessing.scene.overrideMaterial = postprocessing.materialGodraysFakeSun;
        scene.renderer.render(postprocessing.scene, postprocessing.camera, postprocessing.rtTextureColors);
        scene.renderer.setScissorTest(false);
        meshGround.material.uniforms.depthFactor.value = 0.0;
        meshTrees.material.uniforms.depthFactor.value = 0.0;
        meshGrass.material.uniforms.depthFactor.value = 0.0;
        meshRocks.material.uniforms.depthFactor.value = 0.0;
        meshSky.visible = true;
        meshParticules.visible = true;
        scene.renderer.render(scene.scene, scene.camera, postprocessing.rtTextureColors);
        meshSky.visible = false;
        meshParticules.visible = false;
        meshGround.material.uniforms.depthFactor.value = 1.0;
        meshTrees.material.uniforms.depthFactor.value = 1.0;
        meshGrass.material.uniforms.depthFactor.value = 1.0;
        meshRocks.material.uniforms.depthFactor.value = 1.0;
        scene.renderer.render(scene.scene, scene.camera, postprocessing.rtTextureDepth, true);
        filterLen = 1.0;
        TAPS_PER_PASS = 6.0;
        pass = 1.0;
        stepLen = filterLen * Math.pow(TAPS_PER_PASS, -pass);
        postprocessing.godrayGenUniforms["fStepSize"].value = stepLen;
        postprocessing.godrayGenUniforms["tInput"].value = postprocessing.rtTextureDepth;
        postprocessing.scene.overrideMaterial = postprocessing.materialGodraysGenerate;
        scene.renderer.render(postprocessing.scene, postprocessing.camera, postprocessing.rtTextureGodRays2);
        pass = 2.0;
        stepLen = filterLen * Math.pow(TAPS_PER_PASS, -pass);
        postprocessing.godrayGenUniforms["fStepSize"].value = stepLen;
        postprocessing.godrayGenUniforms["tInput"].value = postprocessing.rtTextureGodRays2;
        scene.renderer.render(postprocessing.scene, postprocessing.camera, postprocessing.rtTextureGodRays1);
        pass = 3.0;
        stepLen = filterLen * Math.pow(TAPS_PER_PASS, -pass);
        postprocessing.godrayGenUniforms["fStepSize"].value = stepLen;
        postprocessing.godrayGenUniforms["tInput"].value = postprocessing.rtTextureGodRays1;
        scene.renderer.render(postprocessing.scene, postprocessing.camera, postprocessing.rtTextureGodRays2);
        postprocessing.godrayCombineUniforms["tColors"].value = postprocessing.rtTextureColors;
        postprocessing.godrayCombineUniforms["tGodRays"].value = postprocessing.rtTextureGodRays2;
        postprocessing.scene.overrideMaterial = postprocessing.materialGodraysCombine;
        scene.renderer.render(postprocessing.scene, postprocessing.camera);
        return postprocessing.scene.overrideMaterial = null;
      } else {
        return scene.render();
      }
    };

    setupScene = function() {
      scene.setPixelRatio(window._config.resolution);
      if (window._config.postprocessing) {
        initPostprocessing();
      }
      shadowCanvasObj = shadowCanvas();
      addSky();
      addTrees();
      addRocks();
      addGrass();
      addGround();
      addParticule();
      setTimeout(resize, 100);
      return clock.start();
    };

    _onMouseMove = function(event) {
      mouse.x = -(event.pageX - width * .5) / (width * .5);
      mouse.y = -(event.pageY - height * .5) / (height * .5);
      return mouse.y = Math.max(-0.15, mouse.y);
    };

    init = function() {
      scene = new Scene(_$dom[0]);
      if (scene.init()) {
        that.camera = scene.camera;
        setupScene();
        return _$dom[0].addEventListener('mousemove', _onMouseMove, false);
      } else {
        return alert("Error WebGL");
      }
    };

    initPostprocessing = function() {
      var godraysCombineShader, godraysFakeSunShader, godraysGenShader, h, pars, w;
      postprocessing.scene = new THREE.Scene();
      postprocessing.camera = new THREE.OrthographicCamera(window.innerWidth / -2, window.innerWidth / 2, window.innerHeight / 2, window.innerHeight / -2, -10000, 10000);
      postprocessing.camera.position.z = 100;
      postprocessing.scene.add(postprocessing.camera);
      pars = {
        minFilter: THREE.LinearFilter,
        magFilter: THREE.LinearFilter,
        format: THREE.RGBFormat
      };
      postprocessing.rtTextureColors = new THREE.WebGLRenderTarget(window.innerWidth * window._config.resolution, window.innerHeight * window._config.resolution, pars);
      postprocessing.rtTextureDepth = new THREE.WebGLRenderTarget(window.innerWidth / 5 * window._config.resolution, window.innerHeight / 5 * window._config.resolution, pars);
      w = window.innerWidth / 4.0 * window._config.resolution;
      h = window.innerHeight / 4.0 * window._config.resolution;
      postprocessing.rtTextureGodRays1 = new THREE.WebGLRenderTarget(w, h, pars);
      postprocessing.rtTextureGodRays2 = new THREE.WebGLRenderTarget(w, h, pars);
      godraysGenShader = THREE.ShaderGodRays["godrays_generate"];
      postprocessing.godrayGenUniforms = THREE.UniformsUtils.clone(godraysGenShader.uniforms);
      postprocessing.materialGodraysGenerate = new THREE.ShaderMaterial({
        uniforms: postprocessing.godrayGenUniforms,
        vertexShader: godraysGenShader.vertexShader,
        fragmentShader: godraysGenShader.fragmentShader
      });
      godraysCombineShader = THREE.ShaderGodRays["godrays_combine"];
      postprocessing.godrayCombineUniforms = THREE.UniformsUtils.clone(godraysCombineShader.uniforms);
      postprocessing.materialGodraysCombine = new THREE.ShaderMaterial({
        uniforms: postprocessing.godrayCombineUniforms,
        vertexShader: godraysCombineShader.vertexShader,
        fragmentShader: godraysCombineShader.fragmentShader
      });
      godraysFakeSunShader = THREE.ShaderGodRays["godrays_fake_sun"];
      postprocessing.godraysFakeSunUniforms = THREE.UniformsUtils.clone(godraysFakeSunShader.uniforms);
      postprocessing.materialGodraysFakeSun = new THREE.ShaderMaterial({
        uniforms: postprocessing.godraysFakeSunUniforms,
        vertexShader: godraysFakeSunShader.vertexShader,
        fragmentShader: godraysFakeSunShader.fragmentShader
      });
      postprocessing.godraysFakeSunUniforms.bgColor.value.setHex(bgColor);
      postprocessing.godraysFakeSunUniforms.sunColor.value.setHex(sunColor);
      postprocessing.godrayCombineUniforms.fGodRayIntensity.value = 0.43575;
      postprocessing.quad = new THREE.Mesh(new THREE.PlaneBufferGeometry(window.innerWidth, window.innerHeight), postprocessing.materialGodraysGenerate);
      postprocessing.quad.position.z = -9900;
      postprocessing.quad.frustumCulled = false;
      return postprocessing.scene.add(postprocessing.quad);
    };

    addSky = function() {
      meshSky = new THREE.Mesh(new THREE.SphereBufferGeometry(11000 * .5, 32, 32), new THREE.MeshBasicMaterial({
        map: Data.textures.sky,
        side: THREE.BackSide
      }));
      return scene.scene.add(meshSky);
    };

    shadowCanvas = function() {
      var canvas, ctx;
      canvas = document.createElement('canvas');
      canvas.width = 2048;
      canvas.height = 2048;
      ctx = canvas.getContext("2d");
      return {
        canvas: canvas,
        ctx: ctx
      };
    };

    getMapCanvas = function(map) {
      var canvas, ctx;
      canvas = document.createElement('canvas');
      canvas.width = Data.textures[map].image.width;
      canvas.height = Data.textures[map].image.height;
      ctx = canvas.getContext("2d");
      ctx.drawImage(Data.textures[map].image, 0, 0);
      return {
        canvas: canvas,
        ctx: ctx
      };
    };

    setOffetsSeedsRotation = function(geometry, offsets, seeds, orientations) {
      var cHM, h, i, image, imageData, k, l, m, r, ref, ref1, s, vector, w, x, xx, y, z, zz;
      cHM = getMapCanvas("heightMap");
      w = cHM.canvas.width;
      h = cHM.canvas.height;
      z = w * h;
      image = cHM.ctx.getImageData(0, 0, w, h);
      imageData = image.data;
      vector = new THREE.Vector4();
      for (i = l = 0, ref = seeds.count; l < ref; i = l += 1) {
        x = Math.random();
        y = Math.random();
        z = Math.random();
        y = 0.0;
        vector.set(x, y, z, 0).normalize();
        zz = Math.round(x * h);
        xx = Math.round(z * w);
        k = (xx * w + zz) * 4;
        r = imageData[k + 1];
        s = 6000;
        seeds.setXYZ(i, Math.random(), Math.random(), Math.random());
        if (offsets) {
          offsets.setXYZ(i, (x - .5) * s, r * 1.2, (z - .5) * s);
        }
      }
      if (offsets) {
        geometry.addAttribute('offset', offsets);
      }
      geometry.addAttribute('seed', seeds);
      if (orientations) {
        for (i = m = 0, ref1 = orientations.count; m < ref1; i = m += 1) {
          vector.set(0, 1.0, 0, Math.random() * 2 - 1);
          vector.normalize();
          orientations.setXYZW(i, vector.x, vector.y, vector.z, vector.w);
        }
        return geometry.addAttribute('orientation', orientations);
      }
    };

    addParticule = function() {
      var bf, geometry, i, instances, l, material, offsets, ref, s, seeds, vector, x, y, z;
      instances = 50 * 100;
      geometry = new THREE.InstancedBufferGeometry();
      bf = new THREE.PlaneBufferGeometry(.2, .2, 1, 1);
      geometry.copy(bf);
      offsets = new THREE.InstancedBufferAttribute(new Float32Array(instances * 3), 3, 1);
      seeds = new THREE.InstancedBufferAttribute(new Float32Array(instances * 2), 2, 1);
      vector = new THREE.Vector4();
      for (i = l = 0, ref = offsets.count; l < ref; i = l += 1) {
        x = Math.random();
        y = Math.random();
        z = Math.random();
        y = 0.0;
        vector.set(x, y, z, 0).normalize();
        s = 6000;
        offsets.setXYZ(i, (x - .5) * s, 50.0 + Math.random() * 150, (z - .5) * s);
        seeds.setXY(i, Math.random(), Math.random());
      }
      geometry.addAttribute('offset', offsets);
      geometry.addAttribute('seed', seeds);
      material = new THREE.RawShaderMaterial({
        uniforms: {
          map: {
            type: "t",
            value: Data.textures.particle
          },
          ao: {
            type: "t",
            value: Data.textures.particle
          },
          time: {
            type: "f",
            value: 0.5
          },
          fogColor: {
            type: "c",
            value: scene.scene.fog.color
          },
          depthFactor: {
            type: "f",
            value: 0.0
          },
          mFar: {
            type: "f",
            value: mFar
          },
          mNear: {
            type: "f",
            value: mNear
          },
          fogDensity: {
            type: "f",
            value: scene.scene.fog.density
          }
        },
        vertexShader: Data.shader.get('point-vs'),
        fragmentShader: Data.shader.get('point-fs'),
        blending: THREE.AdditiveBlending,
        transparent: true,
        fog: true
      });
      meshParticules = new THREE.Mesh(geometry, material);
      scene.scene.add(meshParticules);
      return meshParticules.frustumCulled = false;
    };

    addGrass = function() {
      var _i, _j, _k, c1, coefCount, g, geometry, h, i, i1, i2, i3, image, imageData, instances, j, k, k2, l, m, material, n, o, offsets, orientations, p, particleCount, particleCount2, q, r, r_val, ref, ref1, ref2, ref3, ref4, ref5, rx, rz, s, seeds, vector, w, x, y, z;
      particleCount = window._config.grass;
      particleCount = Math.round(particleCount / 2) * 2;
      geometry = new THREE.InstancedBufferGeometry();
      geometry.copy(new THREE.GrassBufferGeometry(1, 1, 1, 5));
      c1 = getMapCanvas("splatMap");
      w = c1.canvas.width;
      h = c1.canvas.height;
      z = w * h;
      image = c1.ctx.getImageData(0, 0, w, h);
      imageData = image.data;
      k = 0;
      r_val = 55;
      particleCount2 = 0;
      for (i = l = 0, ref = h; l < ref; i = l += 1) {
        for (j = m = 0, ref1 = w; m < ref1; j = m += 1) {
          k = (i * w + j) * 4;
          r = imageData[k];
          if (r > r_val) {
            particleCount2++;
          }
        }
      }
      coefCount = Math.round(particleCount2 / particleCount);
      particleCount = 0;
      k2 = 0;
      for (i = n = 0, ref2 = h; n < ref2; i = n += 1) {
        for (j = o = 0, ref3 = w; o < ref3; j = o += 1) {
          k = (i * w + j) * 4;
          r = imageData[k];
          if (r > r_val) {
            k2++;
            if (k2 % coefCount === 0) {
              particleCount++;
            }
          }
        }
      }
      instances = particleCount;
      offsets = new THREE.InstancedBufferAttribute(new Float32Array(instances * 3), 3, 1);
      seeds = new THREE.InstancedBufferAttribute(new Float32Array(instances * 3), 3, 1);
      orientations = new THREE.InstancedBufferAttribute(new Float32Array(instances * 4), 4, 1);
      setOffetsSeedsRotation(geometry, null, seeds, null);
      k2 = 0;
      i2 = 0;
      i3 = 0;
      i1 = 0;
      particleCount = 0;
      for (i = p = 0, ref4 = h; p < ref4; i = p += 1) {
        for (j = q = 0, ref5 = w; q < ref5; j = q += 1) {
          k = (i * w + j) * 4;
          r = imageData[k];
          g = imageData[k + 1];
          if (r > r_val) {
            k2++;
            if (k2 % coefCount === 0) {
              vector = new THREE.Vector4();
              rx = (Math.random() - .5) * 200;
              rz = (Math.random() - .5) * 200;
              _j = Math.round(j + rx);
              _i = Math.round(i + rz);
              if (_j < 0) {
                j = 0;
              }
              if (_j > 1024) {
                j = 1024;
              }
              if (_i < 0) {
                i = 0;
              }
              if (_i > 1024) {
                i = 1024;
              }
              _k = (_i * w + _j) * 4;
              g = imageData[_k + 1];
              x = _j / w;
              y = 1.0;
              z = _i / h;
              vector.set(x, y, z, 0).normalize();
              s = 6000;
              offsets.setXYZ(i1, (x - .5) * s, g * 1.2, (z - .5) * s);
              i3 += 3;
              i2 += 2;
              i1 += 1;
            }
          }
        }
      }
      geometry.addAttribute('offset', offsets);
      material = new THREE.RawShaderMaterial({
        uniforms: {
          time: {
            type: "f",
            value: 0.5
          },
          map: {
            type: "t",
            value: Data.textures.grass4
          },
          fogColor: {
            type: "c",
            value: scene.scene.fog.color
          },
          depthFactor: {
            type: "f",
            value: 0.0
          },
          mFar: {
            type: "f",
            value: mFar
          },
          mNear: {
            type: "f",
            value: mNear
          },
          fogDensity: {
            type: "f",
            value: scene.scene.fog.density
          }
        },
        vertexShader: Data.shader.get('grass-vs'),
        fragmentShader: Data.shader.get('grass-fs'),
        depthTest: true,
        depthWrite: true,
        fog: true
      });
      meshGrass = new THREE.Mesh(geometry, material);
      meshGrass.frustumCulled = false;
      return scene.scene.add(meshGrass);
    };

    addRocks = function() {
      var bf, geometry, i, instances, l, material, offsets, orientations, ref, s, seeds, texture, x, y;
      instances = window._config.rock;
      geometry = new THREE.InstancedBufferGeometry();
      bf = new THREE.BufferGeometry();
      bf.fromGeometry(Data.geo.rock);
      geometry.copy(bf);
      offsets = new THREE.InstancedBufferAttribute(new Float32Array(instances * 3), 3, 1);
      seeds = new THREE.InstancedBufferAttribute(new Float32Array(instances * 3), 3, 1);
      orientations = new THREE.InstancedBufferAttribute(new Float32Array(instances * 4), 4, 1);
      setOffetsSeedsRotation(geometry, offsets, seeds, orientations);
      for (i = l = 0, ref = offsets.array.length; l < ref; i = l += 3) {
        x = offsets.array[i] / 6000 + .5;
        y = offsets.array[i + 2] / 6000 + .5;
        s = 0.7 + seeds.array[i] * 1.8;
        s *= 50 * .5;
        shadowCanvasObj.ctx.drawImage(Data.textures.s_r.image, x * 2048 - s / 2, y * 2048 - s / 2, s, s);
      }
      texture = Data.textures.rock;
      texture.anisotropy = scene.renderer.getMaxAnisotropy();
      material = new THREE.RawShaderMaterial({
        uniforms: {
          map: {
            type: "t",
            value: texture
          },
          ao: {
            type: "t",
            value: Data.textures.rock_ao
          },
          time: {
            type: "f",
            value: 0.5
          },
          fogColor: {
            type: "c",
            value: scene.scene.fog.color
          },
          depthFactor: {
            type: "f",
            value: 0.0
          },
          fogDensity: {
            type: "f",
            value: scene.scene.fog.density
          }
        },
        vertexShader: Data.shader.get('rock-vs'),
        fragmentShader: Data.shader.get('rock-fs'),
        fog: true
      });
      meshRocks = new THREE.Mesh(geometry, material);
      scene.scene.add(meshRocks);
      return meshRocks.frustumCulled = false;
    };

    addGround = function() {
      var material2;
      shadowCanvasObj.texture = new THREE.Texture(shadowCanvasObj.canvas);
      shadowCanvasObj.texture.needsUpdate = true;
      material2 = new THREE.ShaderMaterial({
        uniforms: {
          splatMap: {
            type: "t",
            value: Data.textures.splatMap
          },
          heightMap: {
            type: "t",
            value: Data.textures.heightMap
          },
          aoMap: {
            type: "t",
            value: shadowCanvasObj.texture
          },
          map: {
            type: "t",
            value: Data.textures.ground
          },
          map2: {
            type: "t",
            value: Data.textures.grass
          },
          map3: {
            type: "t",
            value: Data.textures.rock
          },
          fogColor: {
            type: "c",
            value: scene.scene.fog.color
          },
          depthFactor: {
            type: "f",
            value: 0.0
          },
          fogDensity: {
            type: "f",
            value: scene.scene.fog.density
          }
        },
        vertexShader: Data.shader.get('ground-vs'),
        fragmentShader: Data.shader.get('ground-fs'),
        depthTest: true,
        depthWrite: true,
        fog: true
      });
      meshGround = new THREE.Mesh(new THREE.PlaneBufferGeometry(1, 1, 100, 100), material2);
      meshGround.castShadow = false;
      meshGround.receiveShadow = true;
      meshGround.rotation.x = -Math.PI * 0.5;
      meshGround.position.y = 1;
      meshGround.scale.set(6000, 6000, 6000);
      return scene.scene.add(meshGround);
    };

    addTrees = function() {
      var bf, geometry, i, instances, l, material, numTrees, offsets, orientations, ref, s, seeds, texture, x, y;
      numTrees = window._config.tree;
      instances = numTrees;
      geometry = new THREE.InstancedBufferGeometry();
      bf = new THREE.BufferGeometry();
      bf.fromGeometry(Data.geo.tree);
      geometry.copy(bf);
      offsets = new THREE.InstancedBufferAttribute(new Float32Array(instances * 3), 3, 1);
      seeds = new THREE.InstancedBufferAttribute(new Float32Array(instances * 3), 3, 1);
      orientations = new THREE.InstancedBufferAttribute(new Float32Array(instances * 4), 4, 1);
      setOffetsSeedsRotation(geometry, offsets, seeds, orientations);
      for (i = l = 0, ref = offsets.array.length; l < ref; i = l += 3) {
        x = offsets.array[i] / 6000 + .5;
        y = offsets.array[i + 2] / 6000 + .5;
        s = 0.7 + seeds.array[i] * 1.8;
        s *= 40 * .5;
        shadowCanvasObj.ctx.drawImage(Data.textures.s_g.image, x * 2048 - s / 2, y * 2048 - s / 2, s, s);
      }
      texture = Data.textures.tree;
      texture.anisotropy = scene.renderer.getMaxAnisotropy();
      material = new THREE.RawShaderMaterial({
        uniforms: {
          map: {
            type: "t",
            value: texture
          },
          ao: {
            type: "t",
            value: Data.textures.tree_ao
          },
          time: {
            type: "f",
            value: 0.5
          },
          fogColor: {
            type: "c",
            value: scene.scene.fog.color
          },
          fogDensity: {
            type: "f",
            value: scene.scene.fog.density
          },
          depthFactor: {
            type: "f",
            value: 0.0
          }
        },
        vertexShader: Data.shader.get('tree-vs'),
        fragmentShader: Data.shader.get('tree-fs'),
        side: THREE.DoubleSide,
        fog: true
      });
      meshTrees = new THREE.Mesh(geometry, material);
      scene.scene.add(meshTrees);
      return meshTrees.frustumCulled = false;
    };

    return Stage;

  })();

}).call(this);

(function() {
  window.App = (function() {
    var loader, sections;

    loader = null;

    sections = {};

    function App() {
      var currentSection;
      TweenMax.defaultEase = Expo.easeInOut;
      TweenLite.defaultEase = Expo.easeInOut;
      loader = $("#loader");
      TweenMax.set(loader, {
        top: 0,
        y: window.innerHeight >> 1
      });
      currentSection = null;
      sections.section1 = new Section1();
      window.addEventListener("resize", function(event) {
        return Dispatcher.event.resize.dispatch();
      });
      Dispatcher.event.navigateTo.add(function(section) {
        if (section !== currentSection) {
          if (currentSection !== null) {
            sections[currentSection].removeEvents();
            sections[currentSection].end();
            sections[currentSection].removeEvents();
          }
          switch (section) {
            case "section1":
            case "section2":
              currentSection = section;
              sections[section].addEvents();
              return sections[section].start();
          }
        }
      });
      Dispatcher.event.onLoadData.add(function() {
        loader.find(".loader").addClass("loaded");
        return TweenMax.to(loader.find(".loader"), 0.5, {
          delay: 1,
          scale: 0,
          autoAlpha: 0,
          ease: Back.easeIn,
          onComplete: function() {
            loader.find(".loader").removeClass("loading");
            return sections.section1.init();
          }
        });
      });
      if (!Detector.webgl) {
        Detector.addGetWebGLMessage();
      } else {
        Data.loadData("data.json");
      }
    }

    return App;

  })();

}).call(this);
