if (!window.curNotifier) {
  curNotifier = {
    addQueues: {},
    recvClbks: {},
    recvData: {},
    onConnectionId: []
  };
}

var Notification = {
	debug:false,
	init:function(){
    Notification.ts =0;
    Notification.unseenCount = 0;
    Notification.wrap = ge('notification_wrap');
    Notification.target = ge('notification') ;
    Notification.count_wrap = ge('notification_count');
    Notification.open =false;
    Notification.target.addEventListener('mouseover',function(e){ e.preventDefault(); if(Notification.unseenCount) Notification.mark_seen();} );        
    Notification.target.addEventListener('scroll',Notification.loadMoreOnScroll);    
    Notification.fetch();
    Notification.page =0;
    Notification.target.scrollTop =0;
    Notification.finish =false;
    $(Notification.target).enscroll({
      showOnHover:true,
      verticalScrolling:true
    });
  },
  loadMoreOnScroll:function (e) {
      if(Notification.finish) return;
      var ch = parseInt(e.target.clientHeight);
      var ht = parseInt(e.target.scrollHeight);
      var scrl = parseInt(e.target.scrollTop);
      var scrld = parseInt( ((scrl+ch)/ht)*100) ;

      if(scrld <80 ) return;      
    var onDone = function(a,b,c){
      var ntfy = ge('notification');
      if(b.count){
        Notification.unseenCount += parseInt(b.unseen);
        if( Notification.unseenCount){
           show(Notification.count_wrap);
          Notification.count_wrap.innerHTML= Notification.unseenCount;
          show( Notification.count_wrap );
        }
      }
      if(b.html&&b.html.trim().length>0)ntfy.innerHTML+= b.html;      
      e.target.scrollTop = scrl;
      Notification.engage=false;
      if(b.end) Notification.finish=true;
    };
    if(Notification.engage) return;
    Notification.engage=true;
    var opts ={
        'offset':5,
        'more':1,
        'page': (++Notification.page)||0
      };
    _sendreq( opts, null,  onDone,'/notification','GET');
  },
  fetch:function(){
    var params = {};
    if(Notification.ts !=0)params['since']=Notification.ts ;

    _sendreq(params,null,function(a,b,c){
      var ntfy = ge('notification');
      if(b.count){
        Notification.unseenCount += parseInt(b.unseen);
        if( Notification.unseenCount){
           show(Notification.count_wrap);
          Notification.count_wrap.innerHTML= Notification.unseenCount;
          show( Notification.count_wrap );
        }
      }
      if(b.since) Notification.ts = parseInt(b.since);             
      if(!ntfy ){
        ntfy=ce('div',{'id':'notification',className:'border-all _bckf8 padd_all'});      
        document.body.appendChild(ntfy);
      }         
      if(b.html&&b.html.trim().length>0)ntfy.innerHTML= b.html+ntfy.innerHTML;
      //setTimeout(Notification.fetch, 5000, false);
    },'/notification','GET');
  },
  mark_read:function(o,id){
    var onDone = function(a,b,c){
      if(b.success){removeClass(o.parentNode,'unread'); 
      o.remove();}
    }
    _sendreq({id:id,'read':1},null,onDone,"/notification","GET");
  },
  mark_seen:function(){
    var onDone = function(a,b,c){
      Notification.unseenCount = 0; hide(Notification.notification_count);
    }
    _sendreq({seen:1}, null, onDone,"/notification","GET")
  },
  remove:function(){
    _sendreq();
  },
  filter:function(){},
  toggle:function(ob,e){
    if(Notification.open){      
      hide(Notification.wrap);    
    }
    else{
      show(Notification.wrap);
    }
    Notification.open = !Notification.open;
  }

}
Notification.init();




/*-*  AJAX  *-*/
var ajax = {
  	_init: function() {
	    var r = false;
	    try {
	      if (r = new XMLHttpRequest()) {
	        ajax._req = function() { return new XMLHttpRequest(); }
	        return;
	      }
	    } catch(e) {}
	    each(['Msxml2.XMLHTTP', 'Microsoft.XMLHTTP'], function() {
	      try {
	        var t = '' + this;
	        if (r = new ActiveXObject(t)) {
	          (function(n) {
	            ajax._req = function() { return new ActiveXObject(n); }
	          })(t);
	          return false;
	        }
	      } catch(e) {}
	    });
	    if (!ajax._req && !browser.search_bot) {
	      location.replace('/badbrowser.php');
	    }
  	},
  	_getreq: function() {
	    if (!ajax._req) ajax._init();
	    return ajax._req();
  	},
  	_frameover: function(js, params) {
    	var node = iframeTransport.parentNode;
	    node.innerHTML = '';
	    utilsNode.removeChild(node);
	    iframeTransport = false;
	    if (js || params) {
	      ajax.framegot(false, false, js, params);
	    }
	    ajax.framegot(false);
	    if (cur.onFrameBlocksDone) {
	      cur.onFrameBlocksDone();
	    }
	    ajax.tOver = new Date().getTime();
  	},
  	_receive: function(cont, html, js, bench, params) {
	    var c = cont && ge(cont);
	    if (c && html) {
	      if (!c.firstChild) {
	        val(c, html);
	      } else {
	        c.appendChild(cf(html));
	      }
	    }
	    if (js) {
	      var scr = '(function(){' + js + ';})()';
	      if (__debugMode) {
	        eval(scr);
	      } else try {
	        eval(scr);
	      } catch (e) {
	        topError(e, {dt: 15, type: 8, url: ajax._frameurl, js: js, answer: Array.prototype.slice.call(arguments).join('<!>')});
	      }
	      if (bench) {
	        ajax.tModule = cur.module;
	      }
	    }
	    if (params && 'leftads' in params) {
	      __adsSet(params.leftads, params.ads_section || '', params.ads_can_show, params.ads_showed);
	    }
	    ajax._framenext();
  	},
  	framedata: false,
  	_framenext: function() {
	    if (!(ajax.framedata || {}).length) return;
	    var d = ajax.framedata.shift();
	    if (d === true) {
	      ajax._framenext();
	    } else if (d === false) {
	      ajax.framedata = false;
	    } else {
	      iframeTO = lTimeout(ajax._receive.pbind(d[0], d[1], d[2], true, d[3]), 0);
	    }
  	},
	framegot: function(c, h, j, p) {
	    if (!ajax.framedata) return;
	    ajax.framedata.push((h === undefined && j === undefined && p === undefined) ? c : [c, h, j, p]);
	    if (ajax.framedata.length == 1) {
	      ajax._framenext();
	    }
	},
  	framepost: function(url, query, done) {	
	    clearTimeout(iframeTO);
	    if (window.iframeTransport) {
	      ajax._frameover();
	    }
	    window.iframeTransport = utilsNode.appendChild(ce('div', {innerHTML: '<iframe></iframe>'})).firstChild;
	    ajax._framedone = done;
	    ajax.framedata = [true];
	    url += '?' + ((typeof(query) != 'string') ? ajx2q(query) : query);
	    url += (url.charAt(url.length - 1) != '?' ? '&' : '') + '_rndVer=' + irand(0, 99999);
	    ajax._frameurl = iframeTransport.src = url;
  	},
  	plainpost: function(url, query, done, fail, urlonly) {
	    var r = ajax._getreq();
	    var q = (typeof(query) != 'string') ? ajx2q(query) : query;
	    r.onreadystatechange = function() {
	      if (r.readyState == 4) {
	        if (r.status >= 200 && r.status < 300) {
	          if (done) done(r.responseText, r);
	        } else { // e.g sleep
	          if (fail) fail(r.responseText, r);
	        }
	      }
	    }
	    try {
	      r.open('POST', url, true);
	    } catch(e) {
	      return false;
	    }
	    if (!urlonly) {
	      r.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
	      r.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
	    }
	    r.send(q);
	    return r;
  	},
  	post: function(url, query, options) {
	    if (url.substr(0, 1) != '/' && url.substr(0, 4) != 'http') url = '/' + url;
	    var o = extend({_captcha: false, _box: false}, options || {}), q = extend({al: o.frame ? -1 : 1}, query);
	    if (o.progress) {
	      if (!o.showProgress) {
	        o.showProgress = show.pbind(o.progress);
	      }
	      if (!o.hideProgress) {
	        o.hideProgress = hide.pbind(o.progress);
	      }
	    }
	    if (o.loader) {
	      o.showProgress = function() {
	        boxRefreshCoords(boxLoader);
	        show(boxLoader);
	        show(boxLayerWrap);
	      }
	      o.hideProgress = function() {
	        hide(boxLoader);
	        hide(boxLayerWrap);
	      }
	    }
	    return ajax._post(url, q, o);
  	},
  	preload: function(url, query, data) {
    	if (url.substr(0, 1) != '/') url = '/' + url;
    	ajaxCache[url + '#' + ajx2q(query)] = data;
  	},
  	_debugLog: function(text, _reqid) {
    	window.debuglogGot && debuglogGot(_reqid, text);
  	},
  	_parseRes: function(answer, _reqid) {
    	window._updateDebug = false;
    	for (var i = answer.length - 1; i >= 0; --i) {
      var ans = answer[i];
      if (ans.substr(0, 2) == '<!') {
        var from = ans.indexOf('>');
        var type = ans.substr(2, from - 2);
        ans = ans.substr(from + 1);
        switch (type) {
        case 'json' :
          answer[i] = parseJSON(ans);
          break;
        case 'int'  : answer[i] = intval(ans); break;
        case 'float': answer[i] = floatval(ans); break;
        case 'bool' : answer[i] = intval(ans) ? true : false; break;
        case 'null' : answer[i] = null; break;
        case 'pageview_candidate':
          answer.pop(); // <!pageview> must be last one or before <!debug>
          break;
        case 'debug':
          ajax._debugLog(ans, _reqid);
          answer.pop(); // <!debug> must be last one
        break;
        }
      }
    	}
  	},
  	_post: function(url, q, o) {
    if (!q.captcha_sid && o.showProgress) o.showProgress();
	var cacheKey = false;
    extend(q, __adsGetAjaxParams(q, o));
    if (o.cache) {
      var boldq = clone(q);
      delete boldq.al;
      delete boldq.al_ad;
      delete boldq.ads_section;
      delete boldq.ads_showed;
      delete boldq.captcha_sid;
      delete boldq.captcha_key;
      cacheKey = url + '#' + ajx2q(boldq);
    }
    var hideBoxes = function() {
      for (var i = 0, l = arguments.length; i < l; ++i) {
        var box = arguments[i];
        if (box && box.isVisible()) {
          box.setOptions({onHide: false, onDestroy: false});
          box.hide();
        }
      }
      return false;
    }
    var fail = function(text, r) {
      if (o.hideProgress) o.hideProgress();
      if (o._suggest) cleanElems(o._suggest);
      o._suggest = o._captcha = o._box = hideBoxes(o._captcha, o._box);

      if (text.indexOf('The page is temporarily unavailable') != -1 && __dev) {
        ajax._post(url, q, o);
        return false;
      }
      if (!o.onFail || o.onFail(text) !== true) {
        topError(text, {dt: 5, type: 3, status: r.status, url: url, query: q && ajx2q(q)});
      }
    }
    if (o.local) fail = vkLocal(fail);
    if (o.stat) {
      var statAct = false;
      stManager.add(o.stat, function() {
        if (statAct) {
          statAct();
        }
        o.stat = false;
      });
    }
    // Process response function
    var processResponse = function(code, answer) {
	    if (o.cache) {
	        var answ = ajaxCache[cacheKey];
	        if (answ && answ._loading) {
	          setTimeout(function() {
	            for (var i in answ._callbacks) {
	              answ._callbacks[i](code, answer);
	            }
	          }, 0);
	          delete ajaxCache[cacheKey];
	        }
	      }
	    if (o.stat) {
	        o.stat = false;
	        statAct = processResponse.pbind(code, answer);
	        return false;
	    }
	    if (o.cache && !o.forceGlobalCache) {
	       if (!code) { ajaxCache[cacheKey] = answer;}
	    }

      // Parse response
      if (o.hideProgress) o.hideProgress();
      if (code != 2) {
        if (o._captcha) {
          if (o._suggest) cleanElems(o._suggest);
          o._suggest = o._captcha = hideBoxes(o._captcha);
        }
        o._box = hideBoxes(o._box);
      }
      switch (code) {
      case 1: // email not confirmed
        if (ge('confirm_mail')) {
          showFastBox({
            width: 430,
            title: ge('confirm_mail_title').value,
            dark: 1,
            bodyStyle: 'padding: 20px;',
            onDestroy: o.onFail
          }, '<div class="confirm_mail">' + ge('confirm_mail').innerHTML + '</div>');
        } else {
          topMsg('<b>Error!</b> Email is not confirmed!');
        }
        break;
      case 2: // captcha
        var resend = function(sid, key) {
          var nq = extend(q, {captcha_sid: sid, captcha_key: key});
          var no = o.cache ? extend(o, {cache: -1}) : o;
          ajax._post(url, nq, no);
        }
        var addText = '';
        // if (vk.nophone == 1 && !vk.nomail) {
        //   addText = getLang('global_try_to_activate').replace('{link}', '<a class="phone_validation_link">').replace('{/link}', '</a>');
        //   addText = '<div class="phone_validation_suggest">' + addText + '</div>';
        // }
        o._captcha = showCaptchaBox(answer[0], intval(answer[1]), o._captcha, {
          onSubmit: resend,
          addText: addText,
          onDestroy: function() {
            if (o.onFail) o.onFail();
          }
        });
        o._suggest = geByClass1('phone_validation_link', o._captcha.bodyNode);
        if (o._suggest) {
          addEvent(o._suggest, 'click', function() {
            o._box = validateMobileBox({onDone: o._captcha.submit});
          });
        }
        break;
      case 11: // mobile validation needed
      case 12:
        var no = o.cache ? extend(o, {cache: -1}) : o;
        o._box = validateMobileBox({acceptCaptcha: (code == 11), onDone: function(sid, key) {
          vk.nophone = 0;
          if (sid) o._captcha = curBox();
          ajax._post(url, sid ? extend(q, {captcha_sid: sid, captcha_key: key}) : q, no);
        }, onFail: o.onFail, hash: answer[0]});
        break;
      case 14:
        var no = o.cache ? extend(o, {cache: -1}) : o;
        o._box = photoCaptchaBox({onDone: ajax._post.pbind(url, q, no), onFail: o.onFail});
        break;
      case 15:
        var no = o.cache ? extend(o, {cache: -1}) : o;
        o._box = validatePassBox({onDone: ajax._post.pbind(url, q, no), onFail: o.onFail, hash: answer[0]});
        break;
      case 3: // auth failed
        var no = o.cache ? extend(o, {cache: -1}) : o;
        window.onReLoginDone = ajax._post.pbind(url, q, no);
        window.onReLoginFailed = function(toRoot) {
          if (toRoot === -1) {
            location.href = location.href.replace(/^http:/, 'https:');
          } else if (toRoot) {
            nav.go('/');
          } else {
            window.onReLoginDone();
          }
        }

        utilsNode.appendChild(ce('iframe', {src: vk.loginscheme + '://login.vk.com/?' + ajx2q({role: 'al_frame', _origin: locProtocol + '//' + locHost, ip_h: (answer[0] || vk.ip_h)})}));
        break;
      case 4: // redirect
        if (intval(answer[1])) { // ajax layout redirect
          nav.go(answer[0], false, {nocur: (answer[1] === '2'), noback: (answer[1] === true) ? true : false, showProgress: o.showProgress, hideProgress: o.hideProgress});
        } else {
          hab.stop();
          location.href = answer[0];
        }
        break;
      case 5: // reload
        nav.reload({force: intval(answer[0]), from: 1, url: url, query: q && ajx2q(q)}); // force reload
        break;
      case 6: // mobile activation needed
        var no = o.cache ? extend(o, {cache: -1}) : o;
        o._box = activateMobileBox({onDone: ajax._post.pbind(url, q, no), onFail: o.onFail, hash: answer[0]});
        break;
      case 7: // message
        if (o.onFail) o.onFail();
        topMsg(answer[0], 10);
        break;
      case 8: // error
        if (o.onFail) {
          if (o.onFail(answer[0])) {
            return;
          }
        }
        topError(answer[0] + (answer[2] ? ' #'+answer[2] : ''), {dt: answer[1] ? 0 : 10, type: 4, url: url, query: q && ajx2q(q)});
        break;
      case 9: // votes payment
        if (o.fromBox || o.forceDone) {
          if (o.onDone) { // page, box or other
            o.onDone.apply(window, answer);
          }
          if (o.fromBox) {
            break;
          }
        }
        o._box = showFastBox({title: trim(answer[0]), dark: (answer[0].substr(0, 1) == ' ' ? 1 : 0)}, answer[1]);
        var no = extend(clone(o), {showProgress: o._box.showProgress, hideProgress: o._box.hideProgress});
        if (o.cache) {
          no.cache = -1;
        }
        o._box = requestBox(o._box, function(params) {
          if (isVisible(o._box.progress)) return;
          if (!params) {
            params = {_votes_ok: 1};
          }
          ajax._post(url, extend(q, params), no);
        }, o.onFail);
        o._box.evalBox(answer[2]);
        break;
      case 10: //zero zone
        o._box = showFastBox({
          title: answer[0] || getLang('global_charged_zone_title'),
          dark: 1,
          bodyStyle: 'padding: 20px;',
          onHide: o.onFail
        }, answer[1], getLang('global_charged_zone_continue'), function() {
          var nq = extend(q, {charged_confirm: answer[3]});
          ajax._post(url, nq, o);
        }, getLang('global_cancel'));
        break;
      case 13: // eval code
        eval('(function(){' + answer[0] + ';})()');
        break;
      default:
        if (code == -1 || code == -2) {
          var adsShowed  = answer.pop();
          var adsCanShow = answer.pop();
          var adsHtml    = answer.pop();
          __adsSet(adsHtml, null, adsCanShow, adsShowed);
        }
        if (o.onDone) { // page, box or other
          o.onDone.apply(window, answer);
        }
        break;
      }

      if (window._updateDebug) _updateDebug();
    }

    if (o.local) processResponse = vkLocal(processResponse);
    var done = function(text, data) { // data - for iframe transport post
      if (o.bench) {ajax.tDone = new Date().getTime();}
      text = text.replace(/^<!--/, '').replace(/-<>-(!?)>/g, '--$1>');
      if (!trim(text).length) {
        data = [8, getLang('global_unknown_error')];
        text = stVersions['nav'] + '<!><!>' + vk.lang + '<!>' + stVersions['lang'] + '<!>8<!>' + data[1];
      }
      var answer = text.split('<!>');

      var navVersion = intval(answer.shift());
      if (!navVersion) {return fail('<pre>' + text + '</pre>', {status: -1});      }

      // First strict check for index.php reloading, in vk.al == 1 mode.
      if (vk.version && vk.version != navVersion) {
	        if (navVersion && answer.length > 4) {
	          nav.reload({force: true, from: 2, url: url, query: q && ajx2q(q)});
	        } else {
	          if (nav.strLoc) {
	            location.replace(locBase);
	          } else {
	            topError('Server error.', {type: 100});
	          }
	        }
        return;
      }
      vk.version = false;

      // Common response fields
      var newStatic = answer.shift();
      var langId = intval(answer.shift());
      var langVer = intval(answer.shift());

      if (o.frame) answer = data;

      var code = intval(answer.shift());
      if (vk.lang != langId && o.canReload) { // Lang changed
        nav.reload({force: true, from: 3, url: url, query: q && ajx2q(q)});
        return;
      }

      // Wait for attached static files
      var waitResponseStatic = function() {
	        var st = ['common.css'];
	        if (browser.msie6) {
	          st.push('ie6.css');
	        } else if (browser.msie7) {
	          st.push('ie7.css');
	        }
	        if (newStatic) {
	          newStatic = newStatic.split(',');
	          for (var i = 0, l = newStatic.length; i < l; ++i) {
	            st.push(newStatic[i]);
	          }
	        }
	        if (stVersions['lang'] < langVer) {
	          stVersions['lang'] = langVer;
	          for (var i in StaticFiles) {
	            if (/^lang\d/i.test(i)) {
	              st.push(i);
	            }
	          }
	        }

	        if (!o.frame) {
	          try {
	            ajax._parseRes(answer, o._reqid);
	          } catch(e) {
	            topError('<b>JSON Error:</b> ' + e.message, {type: 5, answer: answer.join('<!>'), url: url, query: q && ajx2q(q)});
	          }
	        }
	        stManager.add(st, processResponse.pbind(code, answer));
        }

      // Static managing function
      if (navVersion <= stVersions['nav']) {
        return waitResponseStatic();
      }
      headNode.appendChild(ce('script', {
        type: 'text/javascript',
        src: '/js/loader_nav' + navVersion + '_' + vk.lang + '.js'
      }));
      setTimeout(function() {
        if (navVersion <= stVersions['nav']) {
          return waitResponseStatic();
        }
        setTimeout(arguments.callee, 100);
      }, 0);
    }

    if (o.local) done = vkLocal(done);
    if (o.cache > 0 || o.forceGlobalCache) {
      var answer = ajaxCache[cacheKey];
      if (answer && answer._loading) {
        answer._callbacks.push(processResponse);
        return;
      } else {
        if (answer && !o.forceGlobalCache) {
          processResponse(0, answer);
          if (o.cache === 3) delete ajaxCache[cacheKey];
          return;
        } else if (answer = globalAjaxCache[cacheKey]) {
          if (answer == -1 || isFunction(answer)) {
            globalAjaxCache[cacheKey] = o.onDone;
          } else {
            o.onDone.apply(window, answer);
          }
          if (o.hideProgress) o.hideProgress();
          return;
        }
      }
    }
    ajaxCache[cacheKey] = {_loading: 1, _callbacks: []};
    if (window.debuglogSent) {
      o._reqid = debuglogSent(url + (q ? ': ' + ajx2q(q).replace(/&/g, '&amp;') : ''));
      if (o.frame) {
        window._lfrid = o._reqid;
      }
    } else {
      o._reqid = 0;
    }
    return o.frame ? ajax.framepost(url, q, done) : ajax.plainpost(url, q, done, fail);
  },
  tGetParam: function() {
    if (!ajax.tStart || !ajax.tModule) return;
    var d = ajax.tDone - ajax.tStart;
    var p = ajax.tProcess - ajax.tDone;
    var r = ajax.tRender - ajax.tProcess;
    var o = ajax.tOver - ajax.tStart;
    var res = [d, p, r, o, ajax.tModule];
    for (var i in res) {
      if (res[i] < 0) return false;
      if (!res[i] && res[i] !== 0) return false;
    }
    ajax.tStart = false;
    return res.join(',');
  }
}