
var Wall = {
  deleteAll: function(el, post, hash) {
    ajax.post('al_wall.php', {act: 'delete_all', post: post, hash: hash}, {onDone: function(text) {
      var p = domPN(domPN(el));
      p.oldt = val(p);
      val(p, text);
    }, showProgress: function() {
      hide(el);
      show(domNS(el) || domPN(el).appendChild(ce('div', {className: 'progress'})));
    }, hideProgress: function() {
      show(el);
      re(domNS(el));
    }});
  },
  restoreAll: function(el, post, hash) {
    var rnd = cur.wallRnd = Math.floor(Math.random() * 100000);
    ajax.post('al_wall.php', {act: 'restore_all', post: post, hash: hash, rnd: rnd}, {onDone: function(text) {
      var p = domPN(el);
      val(p, p.oldt);
    }, showProgress: function() {
      hide(el);
      show(domNS(el) || domPN(el).appendChild(ce('span', {className: 'progress_inline'})));
    }, hideProgress: function() {
      show(el);
      re(domNS(el));
    }});
  },
  block: function(el, post, hash, bl) {
    ajax.post('al_wall.php', {act: 'block', post: post, hash: hash, bl: bl}, {onDone: function(text) {
      if (bl) {
        domPN(el).insertBefore(ce('div', {innerHTML: text}), el);
        hide(el);
      } else {
        show(domNS(domPN(el)));
        re(domPN(el));
      }
    }, showProgress: function() {
      var prg = bl ? ce('div', {className: 'progress'}) : ce('span', {className: 'progress_inline'});
      hide(el);
      show(domNS(el) || domPN(el).appendChild(prg));
    }, hideProgress: function() {
      show(el);
      re(domNS(el));
    }});
  },
  blockEx: function(gid, mid) {
    showBox('al_groups.php', {act: 'bl_edit', name: 'id' + mid, gid: gid, auto: 1}, {stat: ['page.css', 'ui_controls.js', 'ui_controls.css'], dark: 1});
  },
  withMentions: !(browser.mozilla && browser.version.match(/^2\./) || browser.mobile),
  editPost: function(post, options, onFail, onDone) {
    if (cur.editingPost && ge('wpe_text')) {
      onFail && onFail();
      return elfocus('wpe_text');
    }
    cur.editingPost = [post];
    if (Wall.withMentions) {
      stManager.add(['ui_controls.css', 'ui_controls.js', 'mentions.js', 'walledit.js']);
    } else {
      stManager.add(['walledit.js']);
    }
    ajax.post('al_wall.php', extend({act: 'edit', post: post, mention: Wall.withMentions ? 1 : ''}, options), {onDone: function() {
      var args = Array.prototype.slice.call(arguments);
      args.unshift(post);
      WallEdit.editPost.apply(window, args);
      onDone && onDone();
    }, onFail: function() {
      cur.editingPost = false;
      onFail && onFail();
    }, progress: 'wpe_prg' + post});
  },

  cancelEdit: function(layerOnly) {
    if (cur.editingPost) {
      if (layerOnly === true && cur.editingPost[0].match(/^-?\d+_/)) return;
      if (window.WallEdit) {
        WallEdit.cancelEditPost();
      } else {
        cur.editingPost = false;
      }
    }
  },

  switchWall: function(ev) {
    var cnts = {all: 0, own: 0}, sw = ge('page_wall_switch');
    if (ge('page_wall_count_all')) cnts.all = intval(ge('page_wall_count_all').value);
    if (ge('page_wall_count_own')) cnts.own = intval(ge('page_wall_count_own').value);
    if (!cnts.own || cnts.own >= cnts.all) {
      return cancelEvent(ev);
    }
    cur.wallType = ge('page_wall_posts').className = (cur.wallType == 'own') ? 'all' : 'own';
    Wall.update();
    return cancelEvent(ev);
  },
  suggest: function(ev) {
    if (!cur.oid) return cancelEvent(ev);
    var cont = ge('page_suggest_post'), posts = domPN(ge('page_wall_posts')), vis = isVisible(cont);
    toggle(posts, vis);
    toggle(cont, !vis);
    val('page_wall_suggest', cur.options[vis ? 'wall_suggest_post' : 'wall_return_to_posts']);
    cur.suggestsView = !vis;
    if (vis) {
      Wall.update();
    } else {
      Wall.loadSuggests();
      Wall.suggestUpdate();
      if (cur.suggesting = (domPN(ge('submit_post_box')) == ge('page_suggest_post'))) {
        elfocus('post_field');
      }
    }
    return cancelEvent(ev);
  },
  suggestMore: function() {
    var cont = ge('page_suggestions'), pr = ge('page_suggest_prg');
    if (isVisible(pr)) return;
    ajax.post('al_wall.php', {
      act: 'get_suggests',
      owner_id: cur.oid,
      offset: cont.childNodes.length - geByClass('dld', cont).length - 1
    }, {
      onDone: function(rows, notAll) {
        removeClass(cont, 'page_sugg_loading');
        var el = ce('div', {innerHTML: rows}), fc = domFC(el);
        while (fc) {
          if (ge(fc.id) || !hasClass(fc, 'post')) {
            re(fc);
          } else {
            cont.appendChild(fc);
          }
          fc = domFC(el);
        }
        toggle('page_suggest_more', notAll);
      },
      showProgress: function() {
        show(pr);
        hide(domNS(pr));
      },
      hideProgress: function() {
        show(domNS(pr));
        hide(pr);
      }
    });
  },
  suggestUpdate: function(delta) {
    var c = ge('page_suggests_count'), v = intval(val(c));
    if (delta === -1 || delta === 1 && c) val(c, v += delta);
    val('page_wall_posts_count', v ? langNumeric(v, cur.options.wall_suggests_label) : cur.options.wall_no_suggests_label);
  },
  loadSuggests: function() {
    if (cur.suggLoading || !cur.oid) return;
    cur.suggLoading = true;
    var cont = ge('page_suggestions');
    ajax.post('al_wall.php', {act: 'get_suggests', owner_id: cur.oid}, {onDone: function(rows, notAll) {
      removeClass(cont, 'page_sugg_loading');
      val(cont, rows);
      if (cur.suggestsView) Wall.suggestUpdate();
      toggle('page_suggest_more', notAll);
    }});
  },
  showPostponed: function() {
    if (cur.postponedLoading || !cur.oid) return;
    var tmp = cur.postponedLoading = cur.oid;
    var pr = ge('wall_postponed_progress');
    ajax.post('al_wall.php', {act: 'get_postponed', owner_id: cur.oid}, {
      onDone: function (rows) {
        if (tmp !== cur.oid) return;
        delete(cur.postponedLoading);
        val(ge('wall_postponed'), rows);
      },
      showProgress: function() {
        show(pr);
        hide(domNS(pr));
      },
      hideProgress: function() {
        show(domNS(pr));
        hide(pr);
      }
    });
  },
  hidePostponed: function() {
    var lnk = ge('wall_postponed_link');
    if (lnk) {
      lnk.onclick = Wall.showPostponed;
      hide('wall_postponed_posts', 'wall_postponed_msg_hide');
      show('wall_postponed_msg_show');
    }
  },
  publishPostponedPost: function(post, hash, from) {
    showFastBox(getLang('publish_postponed_title'), getLang('publish_postponed_confirm'), getLang('publish_postponed_btn'), function() {
      curBox().hide();
      ajax.post('al_wall.php', {act: 'publish_postponed', post: post, from: from, hash: hash}, {
        onDone: function (html) {
          if (from == 'one') {
            var p = ge('fw_post');
            if (!p) return;
            hide('fwr_wrap', 'fw_one_replies_wrap');
            if (p.firstChild.nextSibling) {
              p.firstChild.nextSibling.innerHTML = html;
            } else {
              p.appendChild(ce('div', {id: 'post_del' + post, innerHTML: html, className: 'fw_deleted'}));
              hide(p.firstChild);
            }
          } else {
            val('wall_postponed', html);
            if (!html) {
              addClass('wall_postponed', 'wall_postponed_empty');
            }
          }
        },
        progress: 'wpe_prg' + post
      });
    }, getLang('global_cancel'));
  },
  postponedUpdate: function(delta) {
    var c = ge('wall_postponed_cnt'), v = intval(val(c));
    if (delta === -1 || delta === 1 && c) val(c, v += delta);

    if (v == 0) {
      hide('wall_postponed_link');
      addClass('wall_postponed', 'wall_postponed_empty');
    } else {
      show('wall_postponed_link');
      removeClass('wall_postponed', 'wall_postponed_empty');
    }
  },
  cmp: function(id1, id2) {
    var l1 = id1.length, l2 = id2.length;
    if (l1 < l2) {
      return -1;
    } else if (l1 > l2) {
      return 1;
    } else if (id1 < id2) {
      return -1;
    } else if (id1 > id2) {
      return 1;
    }
    return 0;
  },
  receive: function(rows, names) {
    var n = ce('div', {innerHTML: rows}), posts = ge('page_wall_posts'), revert = !!cur.options.revert;
    var current = (revert ? posts.firstChild : posts.lastChild), added = 0;
    for (el = (revert ? n.firstChild : n.lastChild); el; el = re(revert ? n.firstChild : n.lastChild)) {
      if (el.tagName.toLowerCase() == 'input') {
        var old = ge(el.id);
        if (old) {
          posts.replaceChild(el, old);
        }
        continue;
      }
      if (hasClass(el, 'post_fixed')) {
        continue;
      }
      while (current && current.tagName && current.tagName.toLowerCase() == 'div' && !hasClass(current, 'post_fixed') && Wall.cmp(current.id, el.id) < 0) {
        current = (revert ? current.nextSibling : current.previousSibling);
      }
      ++added;
      if (!current) {
        if (revert) {
          posts.appendChild(el);
        } else {
          posts.insertBefore(el, posts.firstChild);
        }
      } else if (!Wall.cmp(current.id, el.id)) {
        posts.replaceChild(el, current);
        current = el;
        --added;
      } else {
        if (revert) {
          posts.insertBefore(el, current);
        } else {
          posts.insertBefore(el, current.nextSibling);
        }
      }
      placeholderSetup(geByTag1('textarea', el), {fast: 1});
    }
    if (cur.wallType == 'full_own' || cur.wallType == 'full_all') {
      Pagination.recache(added);
      FullWall.updateSummary(cur.pgCount);
    }
    Wall.update();
    extend(cur.options.reply_names, names);
    Wall.updateMentionsIndex();
  },
  showMore: function(offset) {
    if (cur.viewAsBox) return cur.viewAsBox();
    if (cur.wallLayer) return;

    var type = cur.wallType;
    var pr = ge('wall_more_progress');
    var tmp = cur.wallLoading = cur.oid;
    ajax.post('al_wall.php', {act: 'get_wall', owner_id: cur.oid, offset: offset, type: type, fixed: cur.options.fixed_post_id || ''}, {
      onDone: function (rows, names) {
        if (tmp !== cur.oid) return;
        delete(cur.wallLoading);
        setTimeout(Wall.receive.pbind(rows, names), 0)
      },
      showProgress: function() {
        show(pr);
        hide(domNS(pr));
      },
      hideProgress: function() {
        show(domNS(pr));
        hide(pr);
      }
    });
  },
  checkTextLen: function(inp, warn, force) {
    if (cur.fixedWide) return;
    var val =  trim(Emoji.editableVal(inp).replace(/\n\n\n+/g, '\n\n'));
    //var val = trim(inp.value).replace(/\n\n\n+/g, '\n\n');
    if (inp.lastLen === val.length && !force) return;

    var realLen = inp.lastLen = val.length, maxLen = cur.options.max_post_len;
    var brCount = realLen - val.replace(/\n/g, '').length;

    warn = ge(warn);
    if (realLen > maxLen - 100 || brCount > 4) {
      show(warn);
      if (realLen > maxLen) {
        warn.innerHTML = getLang('global_recommended_exceeded', realLen - maxLen);
      } else if (brCount > 4) {
        warn.innerHTML = getLang('global_recommended_lines', brCount - 4);
      } else {
        warn.innerHTML = getLang('text_N_symbols_remain', maxLen - realLen);
      }
    } else {
      hide(warn);
    }
  },
  checkPostLen: function(field, warn, val, force) {
    var pf = ge(field);
    val = trim(val).replace(/\n\n\n+/g, '\n\n');
    if (!pf || pf.lastLen === val.length && !force) return;
    var realLen = pf.lastLen = val.length, maxLen = cur.options.max_post_len;
    var brCount = realLen - val.replace(/\n/g, '').length;
    var pw = ge(warn);
    if (realLen > maxLen - 100 || brCount > 4) {
      if (realLen > maxLen) {
        pw.innerHTML = getLang('global_recommended_exceeded', realLen - maxLen);
      } else if (brCount > 4) {
        pw.innerHTML = getLang('global_recommended_lines', brCount - 4);
      } else {
        pw.innerHTML = getLang('text_N_symbols_remain', maxLen - realLen);
      }
      show(pw);
    } else {
      hide(pw);
    }
  },
  postChanged: function(force) {
    if (!isVisible('submit_post')) Wall.showEditPost();
    if (vk.id && intval(cur.oid) == vk.id) {
      clearTimeout(cur.postAutosave);
      if (force === true) {
        Wall.saveDraft();
      } else {
        cur.postAutosave = setTimeout(Wall.saveDraft, (force === 10) ? 10 : 1000);
      }
    }
  },
  saveDraft: function() {
    if (cur.noDraftSave) {
      cur.noDraftSave = false;
      return;
    }
    if (cur.postSent || vk.id != intval(cur.oid)) return;

    var addmedia = cur.wallAddMedia || {},
        media = addmedia.chosenMedia || {},
        medias = cur.wallAddMedia ? addmedia.getMedias() : [],
        share = (addmedia.shareData || {})
        msg = val(ge('post_field')), attachI = 0,
        params = {
      act: 'save_draft',
      message: msg,
      hash: cur.options.post_hash
    };

    if (isArray(media) && media.length) {
      medias.push(clone(media));
    }

    if (medias.length) {
      var ret = false;
      each (medias, function (k, v) {
        if (!v) return;

        var type = this[0], attachVal = this[1];
        switch (type) {
          case 'poll':
            var poll = addmedia.pollData(true);
            if (!poll) {
              ret = true;
              return false;
            }
            attachVal = poll.media;
            delete poll.media;
            params = extend(params, poll);
          break;
          case 'share':
            if (share.failed || !share.url ||
                !share.title && (!share.images || !share.images.length) && !share.photo_url) {
              if (cur.shareLastParseSubmitted && vkNow() - cur.shareLastParseSubmitted < 2000) {
                ret = true;
                return false;
              } else {
                return;
              }
            }
            attachVal = (share.user_id && share.photo_id) ? share.user_id + '_' + share.photo_id : '';
            if (share.initialPattern && (trim(msg) == share.initialPattern)) {
              params.message = '';
            }
            params = extend(params, {
              url: share.url,
              title: replaceEntities(share.title),
              description: replaceEntities(share.description),
              extra: share.extra,
              extra_data: share.extraData,
              photo_url: replaceEntities(share.photo_url),
              open_graph_data: (share.openGraph || {}).data,
              open_graph_hash: (share.openGraph || {}).hash
            });
            break;
          case 'page':
            if (share.initialPattern && (trim(msg) == share.initialPattern)) {
              params.message = '';
            }
            break;
          case 'postpone':
            var ts = val('postpone_date' + addmedia.lnkId);
            params = extend(params, {postpone: ts});
            return;
        }
        if (this[3] && trim(msg) == this[3]) {
          params.message = '';
        }
        params['attach' + (attachI + 1) + '_type'] = type;
        params['attach' + (attachI + 1)] = attachVal;
        attachI++;
      });
      if (ret) {
        return;
      }
    }
    ajax.post('al_wall.php', Wall.fixPostParams(params), {onFail: function() {
      return true;
    }});
  },
  setDraft: function(data) {
    if (!data[0] && !data[1]) return;
    var field = ge('post_field');
    if (!field) return;

    var draftUncleaned = replaceEntities(data[0] || '');
    val(field, draftUncleaned);
    Wall.showEditPost(function() {
      setTimeout(function() {
        if (data[1] && cur.wallAddMedia) {
          for (var i in data[1]) {
            cur.noDraftSave = true;
            cur.wallAddMedia.chooseMedia.apply(cur.wallAddMedia, data[1][i]);
          }
        }
      }, 0);

    });
  },
  showEditPost: function(callback) {
    console.log('----->');
    if (cur.viewAsBox) {
      setTimeout(function() { ge('post_field').blur() }, 0);
      return cur.viewAsBox();
    }
    console.log(cur+' is null');
    if (cur.editing === 0) return;
    console.log(' setTimeout');
    setTimeout(function() {
      if (cur.withUpload) {
        if (!cur.uploadAdded) {
          cur.uploadAdded = true;
          if (!window.Upload) {
            stManager.add(['upload.js'], function() {
              WallUpload.init();
            });
          } else {
            WallUpload.init();
          }
        } else {
          WallUpload.show();
        }
      }
    }, 0);
    console.log('----Initialising Coposer:');
    Wall.initComposer(ge('post_field'), {
      lang: {
        introText: getLang('profile_mention_start_typing'),
        noResult: getLang('profile_mention_not_found')
      },
      checkLen: Wall.postChanged,
      onValueChange: Wall.onPostValChange
    }, callback);

    Wall.hideEditPostReply();
    show('submit_post');
    autosizeSetup('post_field', {minHeight: cur.fullPostHeight || (cur.fullPostView ? 50 : 32), onResize: function() {
      if (cur.wallType == 'full_own' || cur.wallType == 'full_all') {
        Pagination.pageTopUpdated();
      }
    }});
    cur.editing = 0;
  },

  initComposer: function (input, options, callback) {
    if (!data(input, 'composer')) {
      if (!cur.composerAdded) {
        stManager.add(['wide_dd.css', 'wide_dd.js'], function() {
          cur.composerAdded = true;
          composer = Composer.init(input, options);
          callback && callback();
          cur.destroy.push(Composer.destroy.bind(Composer).pbind(composer));
        });
      } else {
        composer = Composer.init(input, options);
        callback && callback();
        cur.destroy.push(Composer.destroy.bind(Composer).pbind(composer));
      }
    } else {
      callback && callback();
    }
  },
  deinitComposer: function (input) {
    var composer = data(input, 'composer');
    if (composer) {
      Composer.destroy(composer);
    }
    if (input.emojiId && window.Emoji) {
      Emoji.destroy(input.emojiId);
    }
  },
  hasComposerMedia: function (input) {
    var composer = input && data(input, 'composer');
    if (!composer || !composer.addMedia) {
      return false;
    }
    return composer.addMedia.attachCount() > 0;
  },

  onPostValChange: function() {
    if (cur.wallAddMedia) {
      cur.wallAddMedia.checkMessageURLs.apply(window, arguments);
    }
    if (cur.wallType == 'full_own' || cur.wallType == 'full_all') {
      Pagination.pageTopUpdated();
    }
  },
  hideEditPost: function(force) {
    cur.editing = false;
    var rf = ge('post_field'),
        addmedia = cur.wallAddMedia || {},
        empty = true;
    if (browser.opera_mobile || !rf || cur.fullPostView) return;
    each (addmedia.chosenMedias || [], function (k, v) {
      if (v) {
        empty = false;
        return false;
      }
    });
    if (!force && (val(rf) || addmedia.chosenMedia || !empty)) return;
    hide('submit_post');
    if (rf && !rf.value) {
      if (cur.postMention) {
        cur.postMention.options.minHeight = cur.emptyPostheight || 14;
      }
      setStyle(rf, {height: cur.emptyPostheight || 11});
    }
    cur.onWallSendCancel && cur.onWallSendCancel();
    window.WallUpload && WallUpload.hide();
    if (cur.wallAddMedia) {
      cur.wallAddMedia._hideAddMedia(true);
    }
  },
  clearInput: function(type) {
    show('page_add_media');

    if (type == 'fixed') {
      var rf = ge('post_fixed_field');
    } else {
      var rf = ge('post_field');
    }
    if (Wall.withMentions) {
      var mention = data(rf, 'mention');
      if (mention) {
        mention.rtaEl.innerHTML = '';
        hide(mention.cont);
        show(rf);
      }
    }
    rf.value = '';
    rf.blur();
    rf.phonblur();
    Wall.hideEditPost(true);
    if (cur.wallAddMedia) cur.wallAddMedia.unchooseMedia();
    checkbox('export_status', false);
    hide('post_warn');
  },
  fixPostParams: function (params) {
    var newParams = clone(params);
    newParams.Message = params.message;
    delete newParams.message;
    return newParams;
  },
  sendPost: function(inputType) {
    if (inputType == 'fixed') {
      var addmedia = {}, media = {}, medias = [], share = {}, msg = val(ge('post_fixed_field')), edited = [], added = {};
    } else {
      var addmedia = cur.wallAddMedia || {},
          media = addmedia.chosenMedia || {},
          medias = cur.wallAddMedia ? addmedia.getMedias() : [],
          share = (addmedia.shareData || {})
          msg = val(ge('post_field'));
    }
    var postponePost = false;

    var pType = cur.suggesting ? 'suggest' : cur.wallType, params = {
      act: 'post',
      message: msg,
      to_id: cur.postTo,
      type: pType,
      friends_only: isChecked('friends_only'),
      status_export: isChecked('status_export'),
      facebook_export: ge('facebook_export') ? (isChecked('facebook_export') ? 1 : 0) : '',
      official: isChecked('official'),
      signed: isChecked('signed'),
      hash: cur.options.post_hash,
      from: cur.from ? cur.from : '',
      fixed: cur.options.fixed_post_id || ''
    }, ownmsg = (cur.postTo == vk.id || params.official || cur.options.only_official), attachI = 0;
    if (inputType == 'fixed') {
      params['fixed'] = 1;
    }

    if (isArray(media) && media.length) {
      medias.push(clone(media));
    }

    if (medias.length) {
      var ret = false;
      each (medias, function (k, v) {
        if (!v) return;
        var type = this[0], attachVal = this[1];
        switch (type) {
          case 'poll':
            var poll = addmedia.pollData();
            if (!poll) {
              ret = true;
              return false;
            }
            attachVal = poll.media;
            delete poll.media;
            params = extend(params, poll);
            break;
          case 'share':
            if (share.failed || !share.url ||
                !share.title && (!share.images || !share.images.length) && !share.photo_url) {
              if (cur.shareLastParseSubmitted && vkNow() - cur.shareLastParseSubmitted < 2000) {
                ret = true;
                return false;
              } else {
                return;
              }
            }
            attachVal = (share.user_id && share.photo_id) ? share.user_id + '_' + share.photo_id : '';
            if (share.images && share.images.length) {
              addmedia.uploadShare(Wall.sendPost);
              ret = true;
              return false;
            }
            if (share.initialPattern && (trim(msg) == share.initialPattern)) {
              params.message = '';
            }
            params = extend(params, {
              url: share.url,
              title: replaceEntities(share.title),
              description: replaceEntities(share.description),
              extra: share.extra,
              extra_data: share.extraData,
              photo_url: replaceEntities(share.photo_url),
              open_graph_data: (share.openGraph || {}).data,
              open_graph_hash: (share.openGraph || {}).hash
            });
            break;
          case 'page':
            if (share.initialPattern && (trim(msg) == share.initialPattern)) {
              params.message = '';
            }
            break;
          case 'postpone':
            var ts = val('postpone_date' + addmedia.lnkId);
            params = extend(params, {postpone: ts});
            cur.postponedLastDate = ts;
            postponePost = true;
            return;
        }
        if (this[3] && trim(msg) == this[3]) {
          params.message = '';
        }
        params['attach' + (attachI + 1) + '_type'] = type;
        params['attach' + (attachI + 1)] = attachVal;
        attachI++;
      });
      if (ret) {
        return;
      }
    }
    if (!attachI && !msg) {
      elfocus('post_field');
      return;
    }

    var sendBtn = ge('send_post');
    if (sendBtn && buttonLocked(sendBtn)) {
      return;
    }

    if (cur.postAutosave) {
      clearTimeout(cur.postAutosave);
    }
    hide('submit_post_error');

    cur.postSent = true;
    setTimeout(function() {
      ajax.post('al_wall.php', Wall.fixPostParams(params), {
        onDone: function(rows, names) {
          Wall.clearInput(inputType);
          cur.postSent = false;
          if (postponePost) {
            if (pType == 'feed') {
              showDoneBox(rows, {out: 3000});
            }
            val(ge('wall_postponed'), rows);
            removeClass('wall_postponed', 'wall_postponed_empty');
            show('wall_postponed');
            return;
          }
          Wall.hidePostponed();
          if ((pType == 'full_own' || pType == 'full_all') && cur.pgStart) {
            var nloc = clone(nav.objLoc);
            delete(nloc.offset);
            if (vk.id != cur.oid) {
              delete(nloc.own);
            }
            return nav.go(nloc);
          }
          if (vk.id != cur.oid && pType == 'full_own') {
            var nloc = clone(nav.objLoc);
            delete(nloc.own);
            return nav.go(nloc);
          }
          if (pType == 'feed') {
            return cur.wallPostCb();
          }
          if (pType == 'suggest') {
            val('page_suggestions', rows);
            toggle('page_suggest_more', names);
            return Wall.suggestUpdate();
          } else if (cur.suggestsView) {
            Wall.suggest();
          }
          Wall.receive(rows, names);
          if (!ownmsg && cur.wallType == 'own') {
            Wall.switchWall();
          }

          if (cur.onWallSendPost) {
            cur.onWallSendPost();
          }
        },
        onFail: function(msg) {
          cur.postSent = false;
          if (!msg) {
            return true;
          }
          ge('submit_post_error').innerHTML = msg;
          if (!isVisible('submit_post_error')) {
            slideDown('submit_post_error', 100);
          }
          return true;
        },
        showProgress: function() {
          lockButton(sendBtn);
        },
        hideProgress: function() {
          unlockButton(sendBtn);
        }
      });
    }, 0);
  },

  _repliesLoaded: function(post, hl, replies, names, data) {
    var r = ge('replies' + post), openEl = r.nextSibling;
    var a = vkNow();
    if (hl) {
      var h = r.offsetHeight;
      r.innerHTML = replies;
      var scrollEl = (browser.msie6 ? pageNode : ((browser.chrome || browser.safari) ? bodyNode : htmlNode));
      scrollEl.scrollTop = intval(scrollEl.scrollTop) + (r.offsetHeight - h);
      setTimeout(Wall.highlightReply.pbind('post' + hl), 0);
    } else {
      r.innerHTML = replies;
    }
    debugLog('render in', vkNow() - a);
    if (openEl && openEl.className == 'replies_open') {
      re(openEl);
    }

    ajax._framenext();

    if (post == cur.wallLayer) {
      var reverse = wkcur.reverse;
      extend(wkcur, {
        offset: !reverse && data.offset || 0,
        loaded: data.num || geByClass('reply', r, 'div').length,
        count: data.count
      });
      extend(wkcur.options.reply_names, names);
      WkView.wallUpdateReplies();
      if (!reverse) {
        wkLayerWrap.scrollTop = wkLayerWrap.scrollHeight;
        WkView.wallUpdateRepliesOnScroll();
      }
    } else {
      extend(cur.options.reply_names, names);
      Wall.repliesSideSetup(post);
    }
    Wall.updateMentionsIndex();
    setTimeout(function() {
      var _a = window.audioPlayer, aid = currentAudioId();
      if (_a && aid && _a.showCurrentTrack) {
        _a.showCurrentTrack();
      }
    }, 10);
  },
  repliesSideSetup: function (post) {
    if (cur.wallLayer == post) {
      WkView.wallUpdateReplies();
      return;
    }
    if (browser.msie6 || browser.msie7) return;
    var postEl = ge('post' + post),
        r = ge('replies' + post),
        header = r && geByClass1('wr_header', r, 'a'),
        h = r && r.offsetHeight || 0,
        ch = window.innerHeight || document.documentElement.clientHeight || bodyNode.clientHeight,
        side = ge('replies_side' + post);

    if (cur.wallMyOpened[post] && header) {
      if (!side) {
        var sideWrap = se('<div class="replies_side_wrap"><div id="replies_side' + post + '" class="replies_side"><div class="replies_side_icon" id="replies_side_icon' + post + '"></div></div></div>')
        r.parentNode.insertBefore(sideWrap, r);
        side = sideWrap.firstChild;
        side.onclick = Wall.repliesSideClick.pbind(post);
        side.onmouseover = Wall.repliesSideOver.pbind(post);
        side.onmouseout = Wall.repliesSideOut.pbind(post);
      }
      setStyle(side, {height: r.clientHeight - 31});
      show(side);
    } else {
      hide(side);
    }
  },
  repliesSideClick: function (post) {
    var postEl = ge('post' + post),
        r = ge('replies' + post),
        header = r && geByClass1('wr_header', r, 'a'),
        st = scrollGetY(),
        pos = getXY(r)[1];

    if (st > pos) {
      scrollToY(pos - 100, 0);
    }
    hide('replies_side' + post);
    return Wall.showReplies(post, 3, false);
  },
  repliesSideOver: function (post) {
    var side = ge('replies_side' + post);

    addClass(side, 'replies_side_over');
    setStyle(side, {height: ge('replies' + post).clientHeight - 51});

    var icon = ge('replies_side_icon' + post),
        top = getXY(side)[1],
        h = side.clientHeight;

    var minOffset = 16,
        maxOffset = h - 23,
        minSt = top + minOffset - 16,
        maxSt = top + maxOffset - 16;


    cur.wallRepliesSideOver = [
      post,
      icon,
      false,
      minSt,
      maxSt,
      getXY(side)[0] + 18,
      maxOffset,
      false
    ];
    Wall.repliesSideUpdate();
  },
  repliesSideOut: function (post) {
    removeClass(ge('replies_side' + post), 'replies_side_over');
    if (cur.wallRepliesSideOver && cur.wallRepliesSideOver[0] == post) {
      delete cur.wallRepliesSideOver;
    }
  },

  repliesSideUpdate: function (st) {
    var postData = cur.wallRepliesSideOver;
    if (!postData) return;

    var curState = postData[7], newState;
    if (st === undefined) {
      st = scrollGetY();
    }
    if (st < postData[3]) {
      if (curState != 1) {
        setStyle(postData[1], {position: 'absolute', top: '16px', bottom: 'auto', left: '18px'})
        postData[7] = 1;
      }
    } else if (st < postData[4]) {
      if (curState != 2) {
        setStyle(postData[1], {position: 'fixed', top: '16px', bottom: 'auto', left: postData[5]})
        postData[7] = 2;
      }
    } else {
      if (curState != 3) {
        setStyle(postData[1], {position: 'absolute', bottom: '16px', top: 'auto', left: '18px'})
        postData[7] = 3;
      }
    }
  },
  highlightReply: function(el) {
    el = ge(el);
    if (!el) return;

    var hlfunc = animate.pbind(el, {backgroundColor: '#ECEFF3'}, 200, function() {
      setTimeout(function() {
        animate(el, {backgroundColor: '#FFF'}, 200);
      }, 1000);
    });

    if (cur.wallLayer) {
      var top = getXY(el, true)[1];
      if (top < 0 || top > lastWindowHeight - 200) {
        animate(wkLayerWrap, {scrollTop: wkLayerWrap.scrollTop + top - 50}, 300, hlfunc);
      } else {
        hlfunc();
      }
      return;
    }

    var xy = getXY(el), top = xy[1] - (bodyNode.scrollTop || htmlNode.scrollTop || 0);
    if (top < 0) {
      var cont = browser.msie6 ? pageNode : ((browser.chrome || browser.safari) ? bodyNode : htmlNode);
      animate(cont, {scrollTop: cont.scrollTop + top - 50}, 300, hlfunc);
    } else {
      hlfunc();
    }
  },
  showReply: function(post, reply) {
    if (cur.viewAsBox) return false;
    var p = ge('post' + reply);
    if (p) {
      Wall.highlightReply(p);
    } else {
      if (cur.wallLayer == post) {
        WkView.wallShowPreviousReplies(reply);
      } else {
        Wall.showReplies(post, false, reply);
      }
    }
    return false;
  },
  showReplies: function(post, count, hl, ev) {
    if (checkEvent(ev || window.event)) { return true; }
    if (cur.viewAsBox) return cur.viewAsBox();
    if (cur.fixedWide || cur.wallLayer == post && wkcur.reverse) {
      return;
    }
    hide('wrh_text' + post);
    cur.wallMyOpened[post] = (count != 3);
    var params = {
      act: 'get_replies',
      post: post,
      count: count
    }, opts = {
      onDone: Wall._repliesLoaded.pbind(post, hl),
      onFail: show.pbind('wrh_text' + post),
      progress: 'wrh_prg' + post,
      local: 1
    };
    if (!hl && (!count || count > 20)) {
      extend(params, {cont: 'replies' + post});
      extend(opts, {frame: 1});
      if (!browser.msie6 && !browser.msie7)  {
        cur.onFrameBlocksDone = /*vkLocal(*/function () {
          setTimeout(Wall.repliesSideSetup.pbind(post), browser.msie ? 100 : 10);
        }/*)*/
      }
    }
    ajax.post('al_wall.php', params, opts);

    if (!browser.msie && count > 0 && count < 10) {
      var cont = ge('replies' + post), el = cont && cont.lastChild, slice = [];
      while (slice.length < count && el) {
        if (el.tagName == 'DIV' && hasClass(el, 'reply')) {
          slice.push(el);
        }
        el = el.previousSibling;
      }
      if (slice.length == count) {
        var total = geByClass('reply', cont, 'div').length;
        val(cont, '<a class="wr_header wrh_all"></a>');
        Wall.updateRepliesHeader(post, cont.firstChild, count, total);
        while (slice.length) {
          cont.appendChild(slice.pop());
        }
        hide('wrh_text' + post);
        show('wrh_prg' + post);
      }
    }
    return false;
  },
  moreReplies: function(post, offset, count, opts) {
    if (!opts.append) {
      hide('wrh_text' + post);
    }
    var params = {act: 'get_replies', offset: offset, post: post, count: count};
    extend(params, {rev: opts.rev, from: opts.from});

    ajax.post('al_wall.php', params, {
      onDone: function(replies, names, data) {
        var r = ge('replies' + post);
        if (opts.clear) {
          // r.removeChild(r.firstChild); // remove header
          r.innerHTML = replies;
        } else if (opts.rev || opts.append) {
          r.appendChild(cf(replies))
        } else {
          r.removeChild(r.firstChild); // remove header
          r.innerHTML = replies + r.innerHTML;
        }
        extend((post == cur.wallLayer ? wkcur : cur).options.reply_names, names);
        if (opts.onDone) {
          opts.onDone(replies, names, data);
        }
        Wall.updateMentionsIndex();
      },
      onFail: !opts.append && show.pbind('wrh_text' + post),
      showProgress: opts.showProgress,
      hideProgress: opts.hideProgress,
      progress: opts.progress || 'wrh_prg' + post
    });
    return false;
  },
  emojiOpts: {},
  getReplyName: function (id) {
    return (((cur.wallLayer ? wkcur : cur).options || {}).reply_names || {})[id] || [];
  },
  showEmojiTT: function(post, obj, ev) {
    if (Wall.emojiOpts[post] === undefined) {
      return false;
    }
    return Emoji.ttClick(Wall.emojiOpts[post], obj, false, false, ev);
  },
  initReplyEditable: function(txt, cont, post) {
    if (txt.emojiInited) {
      return false;
    }
    txt.emojiInited = true;
    stManager.add(['emoji.js', 'notifier.css'], function() {
      var optId = Emoji.init(txt, {
        ttDiff: -42,
        rPointer: true,
        controlsCont: cont,
        shouldFocus: true,
        onSend: function() {
          Wall.sendReply(post);
          txt.blur();
        },
        ctrlSend: function() {
          return cur.wallTpl.reply_multiline;
        },
        //sharedTT: cur.sharedIm,
        checkEditable: function() {
          Wall.checkTextLen.pbind(txt, 'reply_warn'+post);
        },
        onStickerSend: function(stNum) {
          Wall.sendReply(post, false, stNum);
        }
      });
      Wall.emojiOpts[post] = optId;
      if (cur.afterEmojiInit && cur.afterEmojiInit[post]) {
        var sm = geByClass1('emoji_smile', Emoji.opts[optId].controlsCont);
        if (isVisible(sm)) {
          cur.afterEmojiInit[post]();
          delete cur.afterEmojiInit[post];
        }
      }
    });
  },
  showEditReply: function(post, ev) {
    if (cur.viewAsBox) {
      setTimeout(function() { ge('reply_field' + post).blur() }, 0);
      return cur.viewAsBox();
    }
    var rf = ge('reply_field' + post),
        postEl = cur.wallLayer ? ge('wl_reply_form_inner') : ge('post' + post),
        fakeBox = ge('reply_fakebox' + post),
        realBox = ge('reply_box' + post),
        replyLink;

    if (fakeBox) {
      var postHash = ge('post_hash' + post),
          canReplyAsGroup = intval(postHash && postHash.getAttribute('can_reply_as_group')) > 0;

      realBox = se(rs(cur.wallTpl.reply_form, {
        reply_as_group_class: canReplyAsGroup ? 'reply_as_group_active' : '',
        post_id: post
      }));
      fakeBox.parentNode.replaceChild(realBox, fakeBox);
      rf = ge('reply_field' + post);
      Wall.initReplyEditable(rf, realBox, post);
      //!browser.msie6 && placeholderSetup(rf, {pad: {margin: 0, padding: 0}});
    } else {
      Wall.initReplyEditable(rf, realBox, post);
    }
    if (cur.editing === post) {
      Emoji.editableFocus(rf, false, true);
      return cancelEvent(ev);
    }
    Wall.hideEditPostReply();
    addClass(postEl, 'reply_box_open');
    setStyle('replies_wrap' + post, {display: ''});

    cur.editing = post;
    if (window.Emoji) {
      setTimeout(Emoji.editableFocus.pbind(rf, false, true), 0);
    }

    if (!data(rf, 'composer') && (fakeBox || cur.fixedWide || cur.wallLayer)) {
      var mediaTypes = [];
      each ((cur.wallLayer == post ? wkcur : cur).options.rmedia_types || cur.options.media_types || [], function () {
        if (inArray(this[0], ['photo', 'video', 'audio', 'doc', 'link', 'page'])) {
          mediaTypes.push(this);
        }
      });
      var media;
      if (mediaTypes.length > 0 && post.match(/^-?\d+_(photo|video|topic)?\d+$/)) {
        media = {
          lnk: ge('reply_media_lnk' + post).firstChild,
          preview: ge('reply_media_preview' + post),
          types: mediaTypes,
          options: {limit: 2, disabledTypes: ['album'], toggleLnk: true}
        };
        if (post.match(/^-?\d+_topic/)) {
          extend(media.options, {
            disabledTypes: ['album', 'share', 'link', 'page'],
            limit: 10,
            editable: 1,
            sortable: 1,
            teWidth: 280,
            teHeight: 200
          });
        }
      } else {
        re('reply_media_lnk' + post);
      }
      Wall.initComposer(rf, {
        lang: {
          introText: getLang('profile_mention_start_typing'),
          noResult: getLang('profile_mention_not_found')
        },
        wddClass: 'reply_composer_dd',
        width: getSize(rf.parentNode)[0],
        media: media
      });
    }
    if (rf.emojiId !== undefined && cur.afterEmojiInit && cur.afterEmojiInit[post]) {
      cur.afterEmojiInit[post]();
      delete cur.afterEmojiInit[post];
    }

    if (cur.wallTpl && cur.wallTpl.reply_multiline_intro && !cur.fixedWide) {
      ajax.post('al_wall.php', {act: 'a_ctrl_submit_intro', hash: cur.wallTpl.poll_hash}, {
        onDone: function (perform) {
          if (perform && cur.editing === post) {
            Wall.replySubmitTooltip(post, 1);
          }
        },
        onFail: function () {
          return true;
        }
      })
    }
    return cancelEvent(ev);
  },
  hideEditReply: function(post) {
    cur.editing = false;

    var rf = ge('reply_field' + post),
        postEl = cur.wallLayer ? ge('wl_reply_form_inner') : ge('post' + post),
        replyName = cur.reply_to && Wall.getReplyName(cur.reply_to[0]),
        v = trim(window.Emoji ? Emoji.editableVal(rf) : ''),
        hasMedia = Wall.hasComposerMedia(rf),
        replyLink;

    if (!rf || hasMedia) return;
    if (replyName && isArray(replyName)) {
      if (!v || !replyName[1].indexOf(v)) {
        val(rf, '');
        v = '';
      }
    }
    if (browser.opera_mobile || browser.safari_mobile || v) return;
    removeClass(postEl, 'reply_box_open');
    if (replyLink = ge('reply_link' + post)) {
      hide('replies_wrap' + post);
    }
    rf.blur();
    if (cur.fixedWide) {
      hide('submit_reply' + post);
    }
    if (!rf.active && !cur.fixedWide) {
      setStyle(rf, {height: 14});
    }
    rf.phonblur && rf.phonblur();
    val('reply_to' + post, '');
    hide('reply_to_title' + post);
    cur.reply_to = false;

    var point = cur.replySubmitSettings;
    point && point.tt && point.tt.el && point.tt.destroy();
  },
  replyTo: function(post, toMsgId, toId, event) {
    var cur = window.cur.wallLayer == post ? wkcur : window.cur;
    Wall.showEditReply(post);
    val('reply_to' + post, toMsgId);
    var replyNameOld = cur.reply_to && Wall.getReplyName(cur.reply_to[0]);
    cur.reply_to = [toId, toMsgId];
    var replyName = Wall.getReplyName(toId);
    if (isArray(replyName) && window.Emoji) {
      val('reply_to_title' + post, replyName[0]);
      var rf = ge('reply_field' + post);
      var v = trim(Emoji.val(rf));
      v = v.replace(/&nbsp;/g, ' ');
      if (!v || replyNameOld && isArray(replyNameOld) && !winToUtf(replyNameOld[1]).indexOf(v)) {
        Emoji.val(rf, !checkEvent(event) ? replyName[1] : '');
        Emoji.focus(rf, true);
      }
    } else {
      val('reply_to_title' + post, replyName);
    }
    show('reply_to_title' + post);

    var replyAs = ge('reply_as_group' + post),
        replyParts = post.match(/^(-?\d+)_([a-z]+)?(\d+)$/),
        replyOid = replyParts[1],
        replyType = replyParts[2] || '',
        reply = ge('post' + replyOid + replyType + '_' + toMsgId),
        replyTo = reply && geByClass1('reply_to', reply, 'a');

    toggleClass(replyAs, 'on', (replyAs && isVisible(replyAs.parentNode) && replyOid < 0 && replyTo && replyTo.getAttribute('rid') === replyOid) ? true : false);
    (event || {}).cancelBubble = true;
    return false;
  },
  replySubmitTooltip: function (post, over, place) {
    var cur = window.cur.wallLayer == post ? wkcur : window.cur;
    var box = ge('reply_box' + post),
        hintPlace = box && geByClass1('button_blue', box, 'div'),
        point = cur.replySubmitSettings;

    if (place && hintPlace && isVisible(hintPlace)) {
      return
    }
    place = place || hintPlace;
    if (hasClass(place, 'flat_button') && buttonLocked(place)) {
      return;
    }


    if (!point) {
      point = cur.replySubmitSettings = ce('div', {className: 'reply_multiline_tt_point'});
    }
    if (!over) {
      if (point && point.tt && point.tt.hide) {
        point.tt.hide();
      }
      return;
    }

    if (point.parentNode == place && point.tt && point.tt.show) {
      point.tt.show();
      return;
    }

    point.tt && point.tt.el && point.tt.destroy();
    place.insertBefore(point, place.firstChild);
    var ctrlSubmit = cur.wallTpl.reply_multiline ? 1 : 0,
        hint = rs(cur.wallTpl.reply_multiline_hint, {
      enabled: ctrlSubmit ? 'on' : '',
      disabled: !ctrlSubmit ? 'on' : ''
    });

    showTooltip(point, {
      text: hint,
      className: 'reply_multiline_tt rich',
      slideX: -15,
      shift: [244, -31, -123],
      hasover: 1,
      toup: 1,
      showdt: 700,
      hidedt: 700,
      onCreate: function () {
        radioBtns.reply_submit = {
          els: Array.prototype.slice.apply(geByClass('radiobtn', ge('reply_submit_hint_opts'))),
          val: hint ? 1 : 0
        };
      }
    });
  },
  onReplySubmitChanged: function (value, from) {
    cur.wallTpl.reply_multiline = value;
    if (from) {
      var point = cur.replySubmitSettings;
      point && point.tt && point.tt.el && point.tt.destroy();
    } else {
      ajax.post('al_wall.php', {act: 'a_save_ctrl_submit', value: value, hash: cur.wallTpl.poll_hash})
      window.Notifier && Notifier.lcSend('wall_reply_multiline', {value: value});
    }
  },
  onReplySubmit: function (post, e) {
    var cur = window.cur.wallLayer == post ? wkcur : window.cur;
    var rf = ge('reply_field' + post);
    if (e.keyCode == KEY.RETURN || e.keyCode == 10) {
      var composer = data(rf, 'composer'),
          isListVisible = composer && composer.wdd && composer.wdd.listWrap && isVisible(composer.wdd.listWrap);

      if (cur.wallTpl.reply_multiline && (e.ctrlKey || browser.mac && e.metaKey) ||
          !cur.wallTpl.reply_multiline && !e.shiftKey && !(e.ctrlKey || browser.mac && e.metaKey) && !isListVisible ||
          cur.fixedWide) {
        Wall.sendReply(post);
        return cancelEvent(e);
      }
    }
    if (e.ctrlKey && e.keyCode == KEY.RETURN) {
      var v = val(rf),
          pos = Composer.getCursorPosition(rf);

      val(rf, v.substr(0, pos) + "\n" + v.substr(pos));
      elfocus(rf, pos + 1, pos + 1);

      rf.autosize.update();
      setTimeout(function () {
        rf.autosize.update();
      }, 0);
      return cancelEvent(e);
    }
  },
  sendReply: function(post, ev, stickerNum) {
    var cur = window.cur.wallLayer == post ? wkcur : window.cur;
    var rf = ge('reply_field' + post),
        composer = rf && data(rf, 'composer'),
        replyName = cur.reply_to && Wall.getReplyName(cur.reply_to[0]),
        state;

    if (stickerNum) {
      var params = {message: '', attach1_type: "sticker", attach1: stickerNum};
    } else {
      var params = composer ? Composer.getSendParams(composer, Wall.sendReply.pbind(post)) : {message: trim(Emoji.editableVal(rf))};
      if (params.delayed) {
        return;
      }

      if (!params.attach1_type) {
        if (!params.message ||
            isArray(replyName) && !replyName[1].indexOf(params.message)) {
          Emoji.editableFocus(ge('reply_field' + post), false, true);
          return;
        }
      }

      if (composer) {
        state = Composer.reset(composer);
      } else if (window.Emoji) {
        Emoji.val(rf, '');
      }
      if (rf.autosize) {
        rf.autosize.update();
      }
    }

    if (browser.mobile) {
      Wall.hideEditReply(post);
    } else {
      Emoji.editableFocus(rf, false, true);
    }

    cur.wallMyReplied[post] = 1;
    cur.wallMyOpened[post] = 1;
    var post_hash = ge('post_hash' + post) ? ge('post_hash' + post).value : cur.options.post_hash,
        fromGroupEl = ge('reply_as_group' + post),
        newEl = null;

    extend(params, {
      act: 'post',
      type: cur.wallType,
      reply_to: post,
      reply_to_msg: val('reply_to' + post),
      reply_to_user: cur.reply_to && cur.reply_to[0] || 0,
      start_id: val('start_reply' + post),
      from: window.cur.wallLayer == post && 'wkview' || '',
      hash: post_hash
    });

    if (cur.fixedWide || cur.reverse) {
      params.rev = 1;
    }
    if (fromGroupEl && isVisible(fromGroupEl.parentNode)) {
      params.from_group = isChecked(fromGroupEl); // else autodetect
    }

    ajax.post('al_wall.php', Wall.fixPostParams(params), {
      onDone: function(reply, replies, names, data) {
        cur.wallMyReplied[post] = 0;
        re('reply_link' + post);
        hide('reply_warn' + post);
        Wall._repliesLoaded(post, false, replies, names, data);
      },
      onFail: function () {
        newEl && re(newEl);
        if (composer) {
          state = Composer.restore(composer, state);
        } else {
          val(rf, params.message);
        }
        if (rf.autosize) rf.autosize.update();
      },
      showProgress: lockButton.pbind(ge('reply_button' + post)),
      hideProgress: unlockButton.pbind(ge('reply_button' + post))
    });

    if (params.from_group || !params.message) return;

    var repliesEl = ge('replies' + post),
        replyId = -(++cur.wallMyRepliesCnt);

    var message = Emoji.emojiToHTML(clean(params.message), true)
    newEl = se(rs(cur.wallTpl.reply_fast, {
      reply_id: '0_' + replyId,
      message: message.replace(/\n/g, '<br/>'),
      date: Wall.getNowRelTime(cur)
    }));

    if (repliesEl && !isVisible(repliesEl) || ge('reply_link' + post)) {
      re('reply_link' + post);
      show('replies_wrap' + post);
    } else {
      var openEl = repliesEl.nextSibling;
      if (openEl && openEl.className == 'replies_open') {
        Wall.openNewComments(post);
      }
      var headerEl = geByClass1('wr_header', repliesEl, 'a'),
          shown = geByClass('reply', repliesEl, 'div').length + 1,
          total = shown;
      if (headerEl) {
        total = intval(headerEl.getAttribute('offs').split('/')[1]) + 1;
      }
      if ((total > 5 || shown < total) && !cur.fixedWide) {
        if (!headerEl) {
          repliesEl.insertBefore(headerEl = ce('a', {className: 'wr_header'}), repliesEl.firstChild);
        }
        Wall.updateRepliesHeader(post, headerEl, shown, total);
      }
    }
    if (cur.fixedWide || cur.reverse) {
      repliesEl.insertBefore(newEl, repliesEl.firstChild);
    } else {
      repliesEl.appendChild(newEl);
    }

    if (window.cur.wallLayer == post) {
      WkView.wallUpdateReplies();
      if (!cur.reverse) {
        wkLayerWrap.scrollTop = wkLayerWrap.scrollHeight;
        WkView.wallUpdateRepliesOnScroll();
      }
    }
  },
  postTooltip: function(el, post, opts) {
    if (cur.viewAsBox) return;
    var reply = (opts || {}).reply;

    showTooltip(el, {
      url: 'al_wall.php',
      params: extend({act: 'post_tt', post: post}, opts || {}),
      slide: 15,
      shift: [(reply && !(reply % 2)) ? 329 : 64, 0, 0],
      ajaxdt: 100,
      showdt: 400,
      hidedt: 200,
      className: 'rich wall_tt'
    });
  },

  hideEditPostReply: function(e) {
    if (cur.fixedWide) {
      removeClass(ge('wall_fixed_comments'), 'wall_fixed_reply_to');
      hide('submit_reply'+cur.fixedPostRaw)
      return true;
    }
    if (cur.editing === false || isVisible(boxLayerBG) || isVisible(layerBG)) return;
    var el = (e && e.target) ? e.target : {};
    var id = el.id;
    if (cur.editing) {
      if (cur.editingHide) {
        cur.editingHide(cur.editing, el);
      } else if (!e || !hasClass(el, 'reply_link') && id != 'reply_field' + cur.editing && el.className != 'reply_to_link') {
        Wall.hideEditReply(cur.editing);
      }
    } else if (!(cur.wallAddMedia || {}).chosenMedia) {
      if (!e || id != 'post_field') {
        Wall.hideEditPost();
      }
    }
  },
  deletePost: function(post, hash, root, force) {
    (cur.wallLayer ? wkcur : cur).wallMyDeleted[post] = 1;
    var r = ge('post' + post);
    ajax.post('al_wall.php', {
      act: 'delete',
      post: post,
      hash: hash,
      root: root ? 1 : 0,
      confirm: force ? 1 : 0,
      from: 'wall'
    }, {
      onDone: function(msg, res, need_confirm) {
        if (need_confirm) {
          var box = showFastBox(msg, need_confirm, getLang('global_delete'), function() { box.hide(); wall.deletePost(post, hash, root, 1); }, getLang('box_cancel'));
          return;
        }
        var t = geByClass1('post_table', r) || geByClass1('reply_table', r) || geByClass1('feedback_row_t', r);
        revertLastInlineVideo(t);
        var pd = ge('post_del' + post);
        if (pd) {
          pd.innerHTML = msg;
          show(pd);
        } else {
          r.appendChild(ce('div', {id: 'post_del' + post, className: 'dld', innerHTML: msg}));
        }
        hide(t);
        if (domNS(t).className == 'post_publish') hide(domNS(t));
        if (hasClass(r, 'suggest')) {
          Wall.suggestUpdate(-1);
        } else if (hasClass(r, 'postponed')) {
          Wall.postponedUpdate(-1);
        } else if (cur.wallType == 'full_own' || cur.wallType == 'full_all') {
          Pagination.recache(-1);
          FullWall.updateSummary(cur.pgCount);
        } else if (cur.wallType == 'own' || cur.wallType == 'all') {
          if (hasClass(r, 'own')) ++cur.deletedCnts.own;
          if (hasClass(r, 'all')) ++cur.deletedCnts.all;
          Wall.update();
        }
      }
    });
    var btn = ge('delete_post' + post), myReply;
    if (btn && btn.tt && btn.tt.el) {
      btn.tt.destroy();
    }
  },
  markAsSpam: function(post, hash, el) {
    ajax.post('al_wall.php', {
      act: 'spam',
      post: post,
      hash: hash,
      from: el ? 'inline' : ''
    }, {
      onDone: function(msg, js) {
        if (el) {
          domPN(el).replaceChild(ce('div', {innerHTML: msg}), el);
        } else {
          var r = ge('post' + post), t = geByClass1('post_table', r) || geByClass1('reply_table', r) || geByClass1('feedback_row_t', r);
          revertLastInlineVideo(r);
          var pd = ge('post_del' + post);
          if (pd) {
            pd.innerHTML = msg;
            show(pd);
          } else {
            r.appendChild(ce('div', {id: 'post_del' + post, className: 'dld', innerHTML: msg}));
          }
          hide(t);
        }
        if (js) {
          eval(js);
        }
      }, showProgress: el ? function() {
        hide(el);
        show(domNS(el) || domPN(el).appendChild(ce('span', {className: 'progress_inline'})));
      } : false, hideProgress: el ? function() {
        show(el);
        re(domNS(el));
      } : false,
      stat: ['privacy.js', 'privacy.css']
    });
    var btn = ge('delete_post' + post);
    if (btn && btn.tt && btn.tt.el) {
      btn.tt.destroy();
    }
  },
  restorePost: function(post, hash, root) {
    (cur.wallLayer ? wkcur : cur).wallMyDeleted[post] = 0;
    ajax.post('al_wall.php', {
      act: 'restore',
      post: post,
      hash: hash,
      root: root ? 1 : 0
    }, {
      onDone: function(msg) {
        var pd = ge('post_del' + post);
        if (!pd) return;
        var r = ge('post' + post), t = geByClass1('post_table', r) || geByClass1('reply_table', r) || geByClass1('feedback_row_t', r);
        show(t);
        if (domNS(t).className == 'post_publish') show(domNS(t));
        hide(pd);
        if (hasClass(r, 'suggest')) {
          Wall.suggestUpdate(1);
        } else if (hasClass(r, 'postponed')) {
          Wall.postponedUpdate(1);
        } else if (cur.wallType == 'full_own' || cur.wallType == 'full_all') {
          Pagination.recache(1);
          FullWall.updateSummary(cur.pgCount);
        } else if (cur.wallType == 'own' || cur.wallType == 'all') {
          if (hasClass(r, 'own')) --cur.deletedCnts.own;
          if (hasClass(r, 'all')) --cur.deletedCnts.all;
          Wall.update();
        }
      }
    });
  },
  blockPostApp: function(aid, from, hash, obj) {
    ajax.post('al_wall.php', {act: 'block_post_app', aid: aid, from: from, hash: hash}, {
      onDone: function(text) {
        obj.parentNode.parentNode.innerHTML = text;
      },
      showProgress: lockButton.pbind(obj),
      hideProgress: unlockButton.pbind(obj)
    });
  },

  checkPostClick: function (el, event) {
    event = event || window.event;
    if (!el || !event) return true;
    var target = event.target || event.srcElement,
        i = 8,
        foundGood = false,
        classRE = /wall_post_text|published_comment|reply_link_wrap|post_media|event_share|public_share|group_share|feed_friends|feed_gifts|feed_videos|feed_explain_list|explain|feed_photos|feedback_row/;
    do {
      if (!target ||
          target == el ||
          target.onclick ||
          target.onmousedown ||
          inArray(target.tagName, ['A', 'IMG', 'TEXTAREA', 'EMBED', 'OBJECT']) ||
          inArray(target.className, ['play_new', 'page_video_inline_wrap']) ||
          (foundGood = target.className.match(classRE))
      ) {
        break;
      }
    } while (i-- && (target = target.parentNode));
    if (!foundGood) {
      return false;
    }
    var sel = trim((
      window.getSelection && window.getSelection() ||
      document.getSelection && document.getSelection() ||
      document.selection && document.selection.createRange().text || ''
    ).toString());
    if (sel) {
      return false;
    }
    return target || true;
  },
  postClick: function (post, event, opts) {
    var matches = (post || '').match(/^(-?\d+)_(wall)?(\d+)$/),
        el = ge('post' + post);
    if (opts && opts.skipCheck) {
      var clickEl = true;
    } else {
      var clickEl = Wall.checkPostClick(el, event);
    }
    if (!clickEl) return;

    if (clickEl !== true) {
      var moreLink = geByClass1('wall_post_more', clickEl, 'a');
      if (moreLink && isVisible(moreLink)) {
        moreLink.onclick();
        if (!matches) removeClass(el, 'wall_post_over');
        return;
      }
    }

    if (!matches) return;

    if (hasClass(el, 'suggest') || geByClass1('post_publish', el)) return;
    var url = 'wall' + matches[1] + '_' + matches[3];
    if (browser.mobile && event) {
      nav.go(url);
    } else if (checkEvent(event)) {
      window.open(url, '_blank');
    } else {
      Wall.hideEditPostReply();
      Wall.postFull('wall' + matches[1] + '_' + matches[3], false, opts);
    }
  },
  copyHistory: function(ev, el, post, offset) {
    ev = ev || window.event;
    var target = ev.target || ev.srcElement,
        i = 8,
        foundGood = false,
        classRE = /published_a_quote/;
    do {
      if (!target ||
          (foundGood = target.className.match(classRE)) ||
          target.onclick ||
          target.onmousedown ||
          inArray(target.tagName, ['A', 'IMG'])
      ) {
        break;
      }
    } while (i-- && (target = target.parentNode));
    if (!foundGood) return;
    var sel = trim((
      window.getSelection && window.getSelection() ||
      document.getSelection && document.getSelection() ||
      document.selection && document.selection.createRange().text || ''
    ).toString());
    if (sel) return;

    ajax.post('al_wall.php', {act: 'copy_history', post: post, offset: offset}, {onDone: function(rows) {
      if (!domPN(el)) return;

      hide(el);
      if (!rows) return;

      var after = hasClass(domPN(el), 'published_by_quote') ? domPN(el) : el;
      domPN(after).insertBefore(cf(rows), domNS(after));
      if (isAncestor(after, 'im_rows')) {
        IM.updateScroll(true);
      } else if (isAncestor(after, 'wl_post')) {
        WkView.wallUpdateReplies();
      }
    }});

    return cancelEvent(ev);
  },
  postFull: function (post, event, opts) {
    if (post.match(/^wall-?\d+_\d+$/) && !(opts || {}).nolist) {
      switch (cur.wallType) {
        case 'all':
        case 'full_all':
          post += '/all';
          break;

        // case 'feed':
        //   if (cur.section == 'news') {
        //     post += '/feed';
        //   }
        //   break;
      }
    }
    return showWiki({w: post}, false, event, opts);
  },
  checkReplyClick: function (el, event) {
    event = event || window.event;
    if (!el || !event) return false;
    var target = event.target || event.srcElement,
        i = 8,
        foundGood = false,
        classRE = /reply_dived/;
    do {
      if (!target ||
          target == el ||
          target.onclick ||
          target.onmousedown ||
          target.tagName == 'A' && target.className != '_reply_lnk' ||
          inArray(target.tagName, ['IMG', 'TEXTAREA', 'EMBED', 'OBJECT']) ||
          target.id == 'wpe_cont' ||
          (foundGood = hasClass(target, 'reply_table'))
      ) {
        break;
      }
    } while (i-- && (target = target.parentNode));
    if (!foundGood) {
      return true;
    }
    var sel = trim((
      window.getSelection && window.getSelection() ||
      document.getSelection && document.getSelection() ||
      document.selection && document.selection.createRange().text || ''
    ).toString());
    if (sel) {
      return true;
    }
    return false;
  },
  replyClick: function (post, reply, event, answering) {
    var oid_pid = post.split('_');
    var oid = intval(oid_pid[0]), pid_type = oid_pid[1].replace(/-?\d+$/, ''),
        el = ge('post' + oid + pid_type + '_' + reply);

    if (!cur.stickerClicked && Wall.checkReplyClick(el, event)) return;
    (event || {}).cancelBubble = true;

    var moreLink = geByClass1('wall_reply_more', el, 'a');
    if (moreLink && isVisible(moreLink)) {
      removeClass(el, 'reply_moreable');
      moreLink.onclick();
      return;
    }
    if (answering) {
      var productId = cur.stickerClicked || false,
          rf = ge('reply_field' + post);
      cur.stickerClicked = false;
      if (productId && (!rf || !rf.emojiInited)) {
        cur.afterEmojiInit = cur.afterEmojiInit || {};
        cur.afterEmojiInit[post] = function() {
          Emoji.clickSticker(productId, ge('reply_field' + post));
        };
      }
      Wall.replyTo(post, reply, answering, event);
      if (productId && rf && rf.emojiInited) {
        Emoji.clickSticker(productId, rf);
      }
    }
  },
  stickerClick: function(packId, obj, event) {
    (event || {}).cancelBubble = true;
    if (!window.Emoji) {
      stManager.add(['emoji.js', 'notifier.css'], function() {
        Wall.stickerClick(packId, obj);
      });
      return;
    }
    if (!obj) {
      Emoji.clickSticker(packId, false);
      return;
    }

    var en = Emoji.isStickerPackEnabled(packId, Wall.stickerClick.pbind(packId, obj));
    if (en === 0) {
      return;
    } else if (!en) {
      Emoji.clickSticker(packId, false);
    } else {
      var searchClass = cur.onepost ? 'fw_reply_info' : 'reply',
          el = obj.parentNode,
          i = 8;
      do {
        if (!el || hasClass(el, searchClass)) {
          break;
        }
      } while (i-- && (el = el.parentNode));
      if (cur.onepost && el && (el = geByClass1('reply_to_link', el)) && el.onmouseup) {
        cur.stickerClicked = packId;
        el.onmouseup();
      } else if (!cur.onepost && el && el.onclick) {
        cur.stickerClicked = packId;
        el.onclick();
      }
    }
  },

  postOver: function(post) {
    var el = ge('post' + post);
    if (!el || hasClass(el, 'one')) return;
    if (post.match(/^(-?\d+)_(wall)?(\d+)$/) || isVisible(geByClass1('wall_post_more', el, 'a'))) {
      addClass(el, 'wall_post_over');
    }
    if (!vk.id) return;

    Wall.showDeletePost(post);
  },
  postOut: function(post) {
    var el = ge('post' + post);
    if (!el || hasClass(el, 'one')) return;

    removeClass(el, 'wall_post_over');
    if (!vk.id) return;

    if (!el || hasClass(el, 'one')) return;
    Wall.hideDeletePost(post);
  },


  replyOver: function(post) {
    if (!vk.id) return;
    var postParts = post.split('_'),
        reply = postParts.join(postParts[0].match(/(-?\d+)(photo|video|topic)/) ? '_comment' : '_wall_reply'),
        lnk = ge('like_link' + reply),
        icon = ge('like_icon' + reply);

    if (!lnk) {
      Wall._animDelX(0.3, undefined, post, 'reply_delete');
      Wall._animDelX(0.3, undefined, post, 'reply_edit');
      return;
    }

    if (lnk.timeout) {
      clearTimeout(lnk.timeout);
      removeAttr(lnk, 'timeout');
    } else {
      fadeTo(lnk, 200, 1);
      Wall._animDelX(0.3, undefined, post, 'reply_delete');
      Wall._animDelX(0.3, undefined, post, 'reply_edit');
      if (hasClass(icon, 'no_likes')) {
        setStyle(icon, 'visibility', 'visible');
        animate(icon, {opacity: 0.4}, 200);
      }
    }
  },
  replyOut: function(post) {
    if (!vk.id) return;
    var postParts = post.split('_'),
        reply = postParts.join(postParts[0].match(/(-?\d+)(photo|video|topic)/) ?  '_comment' : '_wall_reply'),
        lnk = ge('like_link' + reply),
        icon = ge('like_icon' + reply);

    if (!lnk) {
      Wall._animDelX(0, undefined, post, 'reply_delete');
      Wall._animDelX(0, undefined, post, 'reply_edit');
      return;
    }

    lnk.timeout = setTimeout(function() {
      removeAttr(lnk, 'timeout');
      if (!hasClass(icon, 'no_like_hide')) fadeTo(lnk, 200, 0);
      Wall._animDelX(0, undefined, post, 'reply_delete');
      Wall._animDelX(0, undefined, post, 'reply_edit');
      if (hasClass(icon, 'no_likes') && !hasClass(icon, 'no_like_hide')) {
        animate(icon, {opacity: 0}, 200, function () {
          hasClass(icon, 'no_likes') && (icon.style.visibility = 'hidden');
        });
      }
    }, 1);
  },
  likeOver: function(post, opts) {
    var icon = ge('like_icon' + post),
        link = ge('like_link' + post),
        count = ge('like_count' + post);
    if (!icon) return;
    opts = opts || {};
    if (!hasClass(icon, 'my_like') && !hasClass(icon, 'fw_my_like')) {
      setTimeout(animate.pbind(icon, {opacity: 1}, 200, false), 1);
    } else {
      icon.style.visibility = 'visible';
      setStyle(icon, {opacity: 1});
    }
    if (cur.viewAsBox) return;
    var matches = post.match(/(-?\d+)(_?)(photo|video|note|topic|wall_reply|note_reply|photo_comment|video_comment|topic_comment|)(\d+)/)
        like_obj = (matches[3] || 'wall') + matches[1] + '_' + matches[4],
        linkW = link.clientWidth || link.offsetWidth,
        leftShift = opts.leftShift || (link.parentNode == icon.parentNode ? 0 : linkW),
        pointerShift = false,
        ttW = 230,
        x = getXY(icon.parentNode)[0], rem = vk.id ? 0 : 10;

    if (x - (link.parentNode == icon.parentNode ? 0 : linkW) - (opts.noLabels ? 50 : 0) + ttW + 5 > lastWindowWidth) {
      leftShift = ttW - (icon.parentNode.clientWidth || icon.parentNode.offsetWidth) + 4;
      pointerShift = ttW - (count.clientWidth || count.offsetWidth) - 14;
      if (opts.noLabels) {
        leftShift -= 5;
        pointerShift -= 1;
      }
    } else {
      leftShift = (link.parentNode == icon.parentNode ? 0 : linkW) + rem;
      pointerShift = linkW + 2 + rem;
      if (opts.noLabels) {
        leftShift += 50;
        pointerShift += 48;
      }
    }

    showTooltip(icon.parentNode, {
      url: 'like.php',
      params: {act: 'a_get_stats', 'object': like_obj},
      slide: 15,
      shift: [leftShift, opts.topShift || 5, 9],
      ajaxdt: 100,
      showdt: 400,
      hidedt: 200,
      tip: {
        over: function() {
          Wall.postOver(post);
          Wall.likeOver(post);
        },
        out: function() {
          Wall.likeOut(post);
          Wall.postOut(post);
        }
      },
      className: 'rich like_tt ' + (opts.cl || ''),
      onShowStart: function (tt) {
        if (!tt.container || pointerShift === false) return;
        var bp = geByClass1('bottom_pointer', tt.container, 'div');
        var tp = geByClass1('top_pointer', tt.container, 'div');
        setStyle(bp, {marginLeft: pointerShift});
        setStyle(tp, {marginLeft: pointerShift});
      }
    });
  },
  likeOut: function(post, opts) {
    var icon = ge('like_icon' + post);
    if (!icon) return;
    opts = opts || {};
    if (!hasClass(icon, 'my_like') && !hasClass(icon, 'fw_my_like')) {
      data(icon, 'likeoutTO', setTimeout(animate.pbind(icon, {opacity: opts.opacity || 0.4}, 200, false), 1));
    }
    if (opts.tthide) {
      triggerEvent(icon.parentNode, 'mouseout');
    }
  },
  postLikeOver: function(post, opts) {
    var icon = ge('like_icon' + post),
        link = ge('like_link' + post),
        count = ge('like_count' + post),
        hasShare = ge('share_icon' + post);

    if (!icon || cur.viewAsBox) return;
    opts = opts || {};
    var matches = post.match(/(-?\d+)(_?)(photo|video|note|topic|wall_reply|note_reply|photo_comment|video_comment|topic_comment|)(\d+)/)
        like_obj = (matches[3] || 'wall') + matches[1] + '_' + matches[4],
        linkW = link.clientWidth || link.offsetWidth,
        leftShift = opts.leftShift || (link.parentNode == icon.parentNode ? 0 : linkW),
        pointerShift = false,
        ttW = 230,
        x = getXY(icon.parentNode)[0];

    if (opts.leftShift !== undefined) {
      leftShift = opts.leftShift;
    } else {
      if (x + ttW + 20 > lastWindowWidth) {
        leftShift = ttW - (icon.parentNode.clientWidth || icon.parentNode.offsetWidth) + 7;
        pointerShift = ttW - (count.clientWidth || count.offsetWidth) - 14;
      } else {
        leftShift = (link.parentNode == icon.parentNode ? 0 : linkW);
        pointerShift = linkW + 8;
      }
    }

    showTooltip(icon.parentNode, {
      url: 'like.php',
      params: {act: 'a_get_stats', 'object': like_obj, 'has_share': hasShare ? 1 : ''},
      slide: 15,
      shift: [leftShift, opts.topShift || 7, 7],
      ajaxdt: 100,
      showdt: 400,
      hidedt: 200,
      tip: {
        over: function() {
          Wall.postOver(post);
          Wall.postLikeOver(post);
        },
        out: function() {
          Wall.postOut(post);
          Wall.postLikeOut(post);
        }
      },
      className: 'rich like_tt ' + (opts.cl || ''),
      onShowStart: function (tt) {
        if (!tt.container || pointerShift === false) return;
        var bp = geByClass1('bottom_pointer', tt.container, 'div');
        var tp = geByClass1('top_pointer', tt.container, 'div');
        setStyle(bp, {marginLeft: pointerShift});
        setStyle(tp, {marginLeft: pointerShift});
      }
    });
  },
  postLikeOut: function () {
  },
  postShareOver: function(post, opts) {
    var icon = ge('share_icon' + post),
        link = ge('share_link' + post),
        count = ge('share_count' + post);
    if (!icon || cur.viewAsBox) return;
    opts = opts || {};
    var matches = post.match(/(-?\d+)(_?)(photo|video|note|topic|wall_reply|note_reply|photo_comment|video_comment|topic_comment|)(\d+)/)
        like_obj = (matches[3] || 'wall') + matches[1] + '_' + matches[4],
        linkW = link.clientWidth || link.offsetWidth,
        leftShift = opts.leftShift || (link.parentNode == icon.parentNode ? 0 : linkW),
        pointerShift = false,
        ttW = 230,
        x = getXY(icon.parentNode)[0];

    if (opts.leftShift !== undefined) {
      leftShift = opts.leftShift;
    } else {
      if (x + ttW + 20 > lastWindowWidth) {
        leftShift = ttW - (icon.parentNode.clientWidth || icon.parentNode.offsetWidth) + 7;
        pointerShift = ttW - (count.clientWidth || count.offsetWidth) - 14;
      } else {
        leftShift = (link.parentNode == icon.parentNode ? 0 : linkW);
        pointerShift = linkW + 8;
      }
    }

    if (link.timeout) {
      clearTimeout(link.timeout);
      link.timeout = false;
    } else {
      addClass(icon.parentNode, 'post_share_over');
    }

    showTooltip(icon.parentNode, {
      url: 'like.php',
      params: {act: 'a_get_stats', 'object': like_obj, published: 1},
      slide: 15,
      shift: [leftShift, opts.topShift || 7, 7],
      ajaxdt: 100,
      showdt: 400,
      hidedt: 200,
      tip: {
        over: function() {
          Wall.postOver(post);
          Wall.postShareOver(post);
        },
        out: function() {
          Wall.postOut(post);
          Wall.postShareOut(post);
        }
      },
      className: 'rich like_tt ' + (opts.cl || ''),
      onShowStart: function (tt) {
        if (!tt.container || pointerShift === false) return;
        var bp = geByClass1('bottom_pointer', tt.container, 'div');
        var tp = geByClass1('top_pointer', tt.container, 'div');
        setStyle(bp, {marginLeft: pointerShift});
        setStyle(tp, {marginLeft: pointerShift});
      }
    });
  },
  postShareOut: function (post, event) {
    var icon = ge('share_icon' + post),
        link = ge('share_link' + post);

    if (!icon) return;

    if (!link.timeout) {
      link.timeout = setTimeout(function () {
        removeClass(icon.parentNode, 'post_share_over');
        link.timeout = false;
      }, 10);
    }
  },
  likeFullUpdate: function (like_obj, likeData) {
    // debugLog(like_obj, likeData);
    var matches = like_obj.match(/^(wall|photo|video|note|topic|wall_reply|note_reply|photo_comment|video_comment|topic_comment|)(-?\d+_)(\d+)/),
        post = matches ? (matches[2] + (matches[1] == 'wall' ? '' : matches[1]) + matches[3]) : like_obj;

    Wall.likeUpdate(post, likeData.like_my, likeData.like_num, likeData.like_title);
    Wall.likeShareUpdate(post, likeData.share_my, likeData.share_num, likeData.share_title);
  },
  likeUpdate: function(post, my, count, title) {
    // console.trace();
    // debugLog(post, my, count, title);
    count = intval(count);

    var m = post.match(/(-?\d+)(_?)(photo|video|note|topic|wall_reply|note_reply|photo_comment|video_comment|topic_comment|)(\d+)/),
        like_obj = (m[3] || 'wall') + m[1] + '_' + m[4];

    var countInput = ge('like_real_count_' + like_obj) || {}, rows = ge('like_table_' + like_obj);
    var titleNode = ge('like_title_' + like_obj), countNode = ge('like_count' + post);
    if (!countNode) {
      return;
    }
    var icon = ge('like_icon' + post);
    var tt = countNode.parentNode.tt || {}, opts = clone(tt.opts || {}), newleft = (my ? 0 : -36);

    if (title && titleNode) {
      val(titleNode, title);
    }
    if (tt) {
      tt.likeInvalidated = true;
    }
    countInput.value = count;
    animateCount(countNode, count);

    if (my) {
      addClass(icon, hasClass(icon, 'fw_like_icon') ? 'fw_my_like' : 'my_like');
    } else {
      removeClass(icon, hasClass(icon, 'fw_like_icon') ? 'fw_my_like' : 'my_like');
    }
    if (count) {
      var styleName = vk.rtl ? 'right' : 'left';
      if (tt.el && !isVisible(tt.container) && !title) {
        rows.style[styleName] = newleft + 'px';
        tooltips.show(tt.el, extend(opts, {showdt: 0}));
      } else if (rows) {
        var params = {};
        params[styleName] = newleft;
        animate(rows, params, 200);
      }
      removeClass(icon, 'no_likes');
    } else {
      if (tt.el) tt.hide();
      addClass(icon, 'no_likes');
    }
  },
  likeShareUpdate: function (post, my, count, title) {
    // console.trace();
    // debugLog(post, my, count, title);
    count = intval(count);

    var m = post.match(/(-?\d+)(_?)(photo|video|note|topic|wall_reply|note_reply|photo_comment|video_comment|topic_comment|)(\d+)/),
        like_obj = (m[3] || 'wall') + m[1] + '_' + m[4];

    var countInput = ge('like_real_countshares_' + like_obj) || {},
        rows = ge('like_tableshares_' + like_obj),
        titleNode = ge('like_titleshares_' + like_obj),
        countNode = ge('share_count' + post),
        icon = ge('share_icon' + post),
        classEl = icon && icon.parentNode,
        tt = (classEl || {}).tt || {},
        opts = clone(tt.opts || {}),
        shareCb = ge('like_share_' + like_obj),
        newleft = (my ? 0 : -36);

    if (!classEl) {
      return;
    }

    if (title && titleNode) {
      val(titleNode, title);
    }
    if (tt) {
      tt.likeInvalidated = true;
    }
    countInput.value = count;
    animateCount(countNode, count);
    toggleClass(classEl, 'my_share', my);
    checkbox(shareCb, my);

    if (count) {
      var styleName = vk.rtl ? 'right' : 'left';
      if (tt.el && !isVisible(tt.container) && !title) {
        rows.style[styleName] = newleft + 'px';
        tooltips.show(tt.el, extend(opts, {showdt: 0}));
      } else if (rows) {
        var params = {};
        params[styleName] = newleft;
        animate(rows, params, 200);
      }
      removeClass(classEl, 'no_shares');
    } else {
      if (tt.el) tt.hide();
      addClass(classEl, 'no_shares');
    }
  },
  like: function(post, hash) {
    if (!vk.id || cur.viewAsBox) return;

    var icon = ge('like_icon' + post),
        my = hasClass(icon, hasClass(icon, 'fw_like_icon') ? 'fw_my_like' : 'my_like'),
        matches = post.match(/(-?\d+)(_?)(photo|video|note|topic|wall_reply|note_reply|photo_comment|video_comment|topic_comment|)(\d+)/),
        like_obj = (matches[3] || 'wall') + matches[1] + '_' + matches[4],
        ref = cur.wallType ? (cur.wallType == 'feed' ? 'feed_' + cur.section : ('wall_' + (cur.onepost ? 'one' : (!(cur.wallType || '').indexOf('full_') ? 'full' : 'page')))) : cur.module;

    ajax.post('like.php', {act: 'a_do_' + (my ? 'un' : '') + 'like', 'object': like_obj, hash: hash, wall: 2, from: ref}, {
      onDone: Wall.likeFullUpdate.pbind(post)
    });
    var count = val(ge('like_real_count_wall' + post) || ge('like_count' + post));
    Wall.likeUpdate(post, !my, intval(count) + (my ? -1 : 1));
    if (cur.onWallLike) {
      cur.onWallLike();
    }
  },
  likeShare: function(post, hash) {
    if (!vk.id || cur.viewAsBox) return;
    var matches = post.match(/(-?\d+)(_?)(photo|video|note|topic|wall_reply|note_reply|photo_comment|video_comment|topic_comment|)(\d+)/),
        like_obj = (matches[3] || 'wall') + matches[1] + '_' + matches[4],
        el = ge('like_share_' + like_obj), was = isChecked(el),
        ref = cur.wallType ? (cur.wallType == 'feed' ? 'feed_' + cur.section : ('wall_' + (cur.onepost ? 'one' : (!(cur.wallType || '').indexOf('full_') ? 'full' : 'page')))) : cur.module;

    checkbox(el);
    ajax.post('like.php', {act: 'a_do_' + (was ? 'un' : '') + 'publish', object: like_obj, hash: hash, wall: 2, ref: ref}, {
      onDone: Wall.likeFullUpdate.pbind(post)
    });
    var count = val(ge('like_real_count_wall' + post) || ge('like_count' + post));
    var icon = ge('like_icon' + post), my = hasClass(icon, hasClass(icon, 'fw_like_icon') ? 'fw_my_like' : 'my_like');
    Wall.likeUpdate(post, true, intval(count) + (my ? 0 : 1));
  },
  likeShareCustom: function (post, params) {
    var matches = post.match(/(-?\d+)(_?)(photo|video|note|topic|wall_reply|note_reply|photo_comment|video_comment|topic_comment|)(\d+)/),
        like_obj = (matches[3] || 'wall') + matches[1] + '_' + matches[4];

    showBox('like.php', extend({act: 'publish_box', object: like_obj}, params));
  },
  likeShareCheckLen: function(inp, warn, maxLen) {
    inp = ge(inp);
    warn = ge(warn);
    maxLen = maxLen || 255;
    var v = trim(val(inp)).replace(/\n\n\n+/g, '\n\n');
    if (inp.lastLen === v.length) return;

    var realLen = inp.lastLen = v.length;
    var brCount = realLen - v.replace(/\n/g, '').length;


    if (realLen > maxLen - 50 || brCount > 4) {
      if (realLen > maxLen) {
        val(warn, getLang('text_exceeds_symbol_limit', realLen - maxLen));
      } else if (brCount > 4) {
        val(warn, getLang('global_recommended_lines', brCount - 4));
      } else {
        val(warn, getLang('text_N_symbols_remain', maxLen - realLen));
      }
      show(warn);
    } else {
      hide(warn);
    }
  },
  showLikesPage: function(like_obj, published, offset) {
    cur.likesBox.loadTabContent('like.php', {act: 'a_get_members', object: like_obj, published: published, offset: offset, wall: 1}, published);
  },
  clearLikesCache: function(like_obj, published) {
    var str = '^/like.php#' + ajx2q({act: 'a_get_members', object: like_obj, published: published, offset: 12345, wall: 1, tab: published, only_content: 1}).replace('12345', '\\d+') + '$',
        re = new RegExp(str, 'i');
    for (var i in ajaxCache) {
      if (re.test(i)) {
        delete(ajaxCache[i]);
      }
    }
  },
  albumCoverOver: function(obj, id, h) {
    clearTimeout((cur.wallAlbumTO || {})[id]);
    var title = geByClass1('wall_album_caption', obj),
        descY = getSize(geByClass1('wall_album_description', obj))[1];
    if (descY < 5) return;

    animate(title, {marginTop: Math.max(0, getSize(obj)[1] - 22 - (descY + 7))}, {duration: 200, transition: Fx.Transitions.easeOutCirc});
  },
  albumCoverOut: function(obj, id) {
    if (!cur.wallAlbumTO) cur.wallAlbumTO = {};
    cur.wallAlbumTO[id] = setTimeout(function() {
      animate(geByClass1('wall_album_caption', obj), {marginTop: getSize(obj)[1] - 22}, 200);
    }, 150);
  },
  showPhoto: function(to_id, ph, hash, el, ev) {
    return !showBox('al_photos.php', {act: 'photo_box', to_id: to_id, photo: ph, hash: hash}, {cache: 1}, el.href ? ev : false);
  },
  _animDelX: function(opacity, new_active, post, action) {
    if (post === undefined) {
      post = new_active;
      new_active = undefined;
    }
    var el = ge((action || 'delete_post') + post);
    if (!el) return;
    if (new_active !== undefined) {
      el.active = new_active;
    } else if (el.active) {
      return;
    }
    animate(el, {opacity: opacity}, 200);
  },
  domFC: function(el) {
    for (el = domFC(el); el && el.id.match(/page_wall_count_/);) {
      el = domNS(el);
    }
    return el;
  },
  domPS: function(el) {
    for (el = domPS(el); el && el.id.match(/page_wall_count_/);) {
      el = domPS(el);
    }
    return el;
  },
  scrollCheck: function (ev, st, noScrollToY) {
    var st = st == undefined ? scrollGetY() : st, top, ntop = 0, el, nel, bits, posts = [], ch = window.innerHeight || document.documentElement.clientHeight || bodyNode.clientHeight;
    if (window.scrollAnimation) {
      return false;
    }
    Wall.repliesSideUpdate(st);
    if (cur.wallPage && !cur.fixedWide) {
      var pageNarrowH = cur.wallPageNarrow.offsetHeight || cur.pageNarrowH,
          offsetTop = cur.wallPage.offsetTop,
          maxSt = pageNarrowH + offsetTop + 30;
          pageWide = st > maxSt,
          rowsCont = cur.suggesting ? ge('page_suggestions') : ge('page_wall_posts'),
          fsElement = document.fullscreenElement || document.mozFullScreenElement || document.webkitFullscreenElement || document.msFullscreenElement;

      if (cur.wallPageWide != pageWide && (!pageWide || rowsCont.offsetHeight > 3 * lastWindowHeight || isVisible('wall_more_link')) && !layers.visible && !fsElement) {
        var lastOffsetParent, lastOffsetTop, lastPost, lastPostY;
        each(rowsCont.childNodes, function () {
          if (!this.offsetParent || !this.offsetTop) return;
          if (lastOffsetParent != this.offsetParent) {
            lastOffsetTop = getXY(lastOffsetParent = this.offsetParent)[1];
          }
          if (lastOffsetTop + this.offsetTop > pageNarrowH + offsetTop) {
            lastPost = this;
            return false;
          }
        });
        if (lastPost) {
          lastPostY = getXY(lastPost)[1];
        }
        cur.wallPageWide = pageWide;
        if (pageWide) {
          cur.pageNarrowH = pageNarrowH;
        }
        if (!cur.fixedWide) {
          toggleClass(cur.wallPage, 'page_wide_no_narrow', pageWide);
        }
        var wallCont = ge('profile_wall') || ge('group_wall') || ge('public_wall');
        revertLastInlineVideo(wallCont);
        toggleClass(wallCont, 'wide_wall_module', pageWide);
        if (cur.wallEditComposer && cur.wallEditComposer.addMedia) {
          cur.wallEditComposer.addMedia.resized();
        }
        if (lastPost) {
          var diff = getXY(lastPost)[1] - lastPostY;
          if ((diff > 0) == cur.wallPageWide && !noScrollToY) {
            scrollToY(scrollGetY() + diff, 0);
          }
        }

        var mapWrap = ge('profile_map_cont'), map = cur.placesPhotoMap, mapOpts = cur.placesPhotoOpts;
        if (mapWrap && map) {
          setStyle(mapWrap, pageWide ? {width: 585, height: 270} : {width: 390, height: 200});
          map.invalidateSize();
        }
      }

      if (
        domPN(cur.topRow) != rowsCont ||
        ((cur.topRow || {}).id || '').match(/page_wall_count_/)
      ) {
        cur.topRow = Wall.domFC(rowsCont);
      }
      if (
        vk.id &&
        cur.topRow &&
        !cur.topRow.id.match(/page_wall_count_/) &&
        !((window.curNotifier || {}).idle_manager || {}).is_idle
      ) {
        for (el = Wall.domPS(cur.topRow); el && cur.topRow.offsetTop > st; el = Wall.domPS(el)) {
          cur.topRow = el;
        }
        for (el = cur.topRow; el; el = nel) {
          top = ntop ? ntop : el.offsetTop;
          if (top >= st + ch) break;

          nel = domNS(el);
          if (((nel || {}).id || '').match(/page_wall_count_/)) nel = null;

          ntop = nel ? nel.offsetTop : top + el.offsetHeight;
          if (ntop < st && nel) cur.topRow = nel;

          bits = el.bits || 0;
          if (bits >= 3) continue;

          if (bits |= ((top >= st && top < st + ch) ? 1 : 0) | ((ntop >= st && ntop < st + ch) ? 2 : 0)) {
            el.bits = bits;
            if (bits == 3) {
              posts.push(Wall.postsGetRaws(el));
            }
          }
        }
        Page.postsSeen(posts);
      }
    }
    if (cur.suggestsView) {
      el = ge('page_suggest_more');
    } else if (cur.fixedWide) {
      el = ge('wall_fixed_more_link');
    } else {
      if (!cur.wallAutoMore || cur.wallLoading || cur.viewAsBox) return;
      el = ge('wall_more_link');
    }
    if (!isVisible(el)) return;

    if (st + lastWindowHeight + 1000 > getXY(el)[1]) {
      el.onclick();
    }
  },
  postsGetRaws: function(el) {
    var m, res = {};
    if (!hasClass(el, 'own')) return res;
    if (m = el.id.match(/^post(-?\d+_\d+)$/)) {
      res[m[1]] = 1;
      if (m = (el.getAttribute('data-copy') || '').match(/^(-?\d+_\d+)$/)) {
        res[m[1]] = -1;
      }
    }
    return res;
  },
  pollVote: function(option, post, params, attachI) {
    if (cur.viewAsBox) return cur.viewAsBox();

    addClass(option, 'on');
    // var progress = option.nextSibling;
    var progress = geByClass1('progress', option);
    ajax.post('widget_poll.php', extend(params, {
      act: 'a_vote',
      no_widget: 1,
      inline: 1,
      sid: post,
      i: attachI
    }), {
      onDone: function(html, script) {
        val('post_poll' + post, html);
        if (script) {
          eval(script);
        }
      },
      showProgress: addClass.pbind(progress, 'progress_inline'),
      hideProgress: removeClass.pbind(progress, 'progress_inline')
    });
  },
  pollFull: function(v, post, e, opt) {
    stManager.add('wkpoll.js');
    return showWiki({w: 'poll' + post, opt_id: opt}, false, e, {queue: 1});
  },
  pollOver: function(el, post, opt) {
    var ttel = (el.cells[0].className == 'page_poll_row') ? domPS(el) : el;
    if (el != ttel && !el.mo) {
      el.mo = true;
      addEvent(el, 'mouseout', function(e) { triggerEvent(ttel, 'mouseout', e, true); });
    }
    showTooltip(ttel, {
      url: 'al_wall.php',
      params: {act: 'poll_opt_stats', post_raw: post, opt_id: opt},
      slide: 15,
      shift: [0, 0, 25],
      ajaxdt: 100,
      showdt: 400,
      hidedt: 200,
      className: 'rich poll_tt'
    });
  },
  foTT: function(el, text, opts) {
    if (opts && opts.oid) {
      if (opts.oid == vk.id) {
        text = getLang('wall_my_friends_only');
      } else {
        text = val('wpfo' + opts.pid);
      }
    }
    showTooltip(el, {
      text: text,
      shift: [15, 1, 1],
      black: 1
    });
  },
  update: function() {
    if (cur.wallLayer) {
      WkView.wallUpdateReplies();
      return;
    }
    if (cur.wallType != 'all' && cur.wallType != 'own') return;
    var sw = ge('page_wall_switch'), pnw = ge('page_no_wall'),
        cnts = {
      all: intval(val('page_wall_count_all')),
      own: intval(val('page_wall_count_own'))
    };
    if (cnts.all && pnw) {
      pnw.parentNode.removeChild(pnw);
    }
    if (!cnts.own || cnts.own >= cnts.all) {
      hide(sw);
    } else {
      show(sw);
      sw.innerHTML = cur.options[cur.wallType + '_link'];
    }
    var h = ge('page_wall_header'), cnt = cnts[cur.wallType];
    if (cur.oid < 0 && cur.options['fixed_post_id']) {
      cnt -= 1;
    }
    if (!cur.suggestsView) {
      val('page_wall_posts_count', cnt ? langNumeric(cnt, cur.options.wall_counts) : cur.options.wall_no);
    }
    h.style.cursor = cnt ? '' : 'default';
    h.onclick = function(event) { return cnt ? nav.go(this, event) : false; };
    ge('page_wall_header').href = '/wall' + cur.oid + ((cur.wallType == 'own') ? '?own=1' : '');
    var morelnk = ge('wall_more_link'), del = intval(cur.deletedCnts[cur.wallType]), count = geByClass(cur.wallType, ge('page_wall_posts')).length - del;
    var checkCount = count;
    if (cur.options['fixed_post_id']) {
      checkCount += 1;
    }
    if (checkCount >= cnts[cur.wallType] - del) {
      hide(morelnk);
    } else {
      show(morelnk);
      morelnk.onclick = Wall.showMore.pbind(count);
    }
  },
  getAbsDate: function(ts, cur) {
    cur = cur || window.cur;
    var date = new Date(ts || vkNow()),
        hours = date.getHours(),
        minutes = date.getMinutes(),
        ampm = '', numhours;
    if (cur.wallTpl.time_system) {
      ampm = cur.wallTpl.time_system[hours > 11 ? 1 : 0];
      hours = (hours % 12) || 12;
    }
    numhours = hours > 9 ? hours : ('0' + hours);
    minutes = minutes > 9 ? minutes : ('0' + minutes);
    return cur.wallTpl.date_format.replace('{am_pm}', ampm).replace('{hour}', hours).replace('{num_hour}', numhours).replace('{minute}', minutes);
  },
  getNowRelTime: function(cur) {
    cur = cur || window.cur;
    var ts = vkNow();
    return '<span class="rel_date rel_date_needs_update" time="' + intval(ts / 1000 - (cur.tsDiff || 0)) + '" abs_time="' + Wall.getAbsDate(ts, cur) + '">' + getLang('wall_just_now') + '</span>';
  },
  getNewPostHTML: function(ev, adminLevel, extendCb, cur) {
    cur = cur || window.cur;
    var acts = [],
        post_id = ev[2],
        oid = post_id.split('_')[0],
        reply_link = '',
        repls;

    if (ev[8] == 1) {
      reply_link += cur.wallTpl.reply_link;
    } else if (oid != vk.id) {
      reply_link += cur.wallTpl.own_reply_link;
    }
    var nameStr = ev[3].replace('mem_link', 'author').replace('memLink', 'author');
    if (ev[6].indexOf('id="wpfo') != -1) {
      nameStr += '<span class="page_fronly inl_bl" onmouseover="Wall.foTT(this, false, {oid: \'' + oid + '\', pid: \'' + ev[2] + '\'})"></span>';
    }

    if ((adminLevel > (ev[9] == oid ? 1 : 0) || oid == vk.id || ev[9] == vk.id)) {
      acts.push(cur.wallTpl.del);
    } else if (ev[2].split('_')[0] != ev[4]) {
      acts.push(cur.wallTpl.spam);
    }
    if (adminLevel > 1 && ev[9] == oid || oid == vk.id || ev[9] == vk.id) {
      acts.push(cur.wallTpl.edit);
    }

    repls = {
      oid: oid,
      name: nameStr,
      online: '',
      actions: acts.length ? rs(cur.wallTpl.post_actions, {actions: acts.join('')}) : '',
      replies: '',
      reply_link: reply_link,
      own_reply_link: cur.wallTpl.own_reply_link,
      reply_box: ev[8] == 1 ? cur.wallTpl.reply_box : '',
      photo: psr(ev[4]),
      link: ev[5],
      text: psr(ev[6]),
      date: Wall.getNowRelTime(cur),
      post_id: ev[2],
      poll_hash: cur.wallTpl.poll_hash,
      date_postfix: '',
      can_reply_as_group: (oid < 0 && adminLevel > 1) ? 1 : 0,
      post_url: '/wall' + post_id.replace('_wall_reply', '_')
    };
    extendCb && extend(repls, extendCb(repls, ev));
    return rs(rs(cur.wallTpl.post, repls), repls);
  },
  getNewReplyHTML: function (ev, adminLevel, extendCb, cur) {
    cur = cur || window.cur;
    var acts = [],
        can_reply = ge('reply_field' + ev[2]) || ge('reply_fakebox' + ev[2]) || ge('fwr_text'),
        className = '';
        attr = '', toLnk = ev[10] ? (' ' + ev[10]) : '';

    if (adminLevel > 0 || !ev[2].indexOf(vk.id + '_') || ev[4] == vk.id) {
      acts.push(cur.wallTpl.del_reply);
    } else if (ev[2].split('_')[0] != ev[4]) {
      acts.push(cur.wallTpl.spam_reply);
    }
    if ((adminLevel > 1) && (ev[4] == intval(ev[2])) || ev[4] == vk.id) {
      acts.push(cur.wallTpl.edit_reply);
    }
    if (ev[8].indexOf('class="wall_reply_more"') != -1) {
      className += 'reply_moreable';
    }
    if (can_reply) {
      if (cur.onepost) {
        acts.push(cur.wallTpl.answer_reply);
      } else {
        className += ' reply_replieable';
        if (vk.id != ev[4]) {
          toLnk += '<span class="sdivide">|</span><a class="_reply_lnk">' + getLang('wall_reply_post') + '</a>';
        }
      }
      if (!cur.options.reply_names[ev[4]]) {
        cur.options.reply_names[ev[4]] = [ev[11], ev[12]]; // name link, name greeting
      }
    }
    if (className) {
      attr = ' onclick="Wall.replyClick(\'%post_id%\', %reply_msg_id%, event, %reply_uid%)"';
    }
    if (cur.onepost) {
      acts.push('');
      acts.unshift('');
      acts = acts.join('<span class="divide">|</span>');
    } else {
      acts = rs(cur.wallTpl.post_actions, {actions: acts.join('')});
    }
    var repls = {
      name: ev[5].replace('mem_link', 'author'),
      photo: psr(ev[6]),
      online: '',
      link: ev[7],
      text: psr(ev[8]),
      media: '', // not returned by now
      classname: className,
      actions: acts,
      attr: attr,
      date: Wall.getNowRelTime(cur),
      to_link: toLnk,
      post_id: ev[2],
      reply_id: ev[3],
      like_id: ev[3].replace('_', '_wall_reply'),
      reply_msg_id: ev[3].split('_')[1],
      reply_uid: ev[4] || 'false'
    };
    extendCb && extend(repls, extendCb(repls));
    return rs(cur.wallTpl.reply, repls);
  },
  openNewComments: function (post_raw) {
    var repliesEl = cur.onepost ? ge('fw_replies_rows') : ge('replies' + post_raw),
        openEl = repliesEl.nextSibling,
        headerEl = geByClass1('wr_header', repliesEl, 'a'),
        newCnt = 0,
        shown = geByClass('reply', repliesEl, 'div').length,
        total = shown,
        newTotal = openEl.newCnt;
    each (clone(geByClass('new_reply', repliesEl, 'div')), function () {
      removeClass(this, 'new_reply');
      this.style.backgroundColor = '#FEFAE4';
      animate(this, {backgroundColor: '#FFF'}, 6000);
      newCnt++;
      if (newCnt == 100) return false;
    });
    if (headerEl) {
      total = newCnt + intval(headerEl.getAttribute('offs').split('/')[1]);
    }
    shown += - newTotal + newCnt;
    if (total > 3 || shown < total) {
      if (!headerEl) {
        repliesEl.insertBefore(headerEl = ce('a', {className: 'wr_header'}), repliesEl.firstChild);
      }
      Wall.updateRepliesHeader(post_raw, headerEl, shown, total);
    }
    cur.wallMyOpened[post_raw] = 1;
    if (openEl && openEl.className == 'replies_open') {
      if (newTotal > 100) {
        openEl.innerHTML = getLang('news_x_new_replies_more', Math.min(100, newTotal - newCnt));
        openEl.newCnt -= newCnt;
      } else {
        re(openEl);
      }
    }
    Wall.repliesSideSetup(post_raw);
  },
  langWordNumeric: function(num, words, arr) {
    if (isArray(words) && num < words.length) {
      return words[num];
    }
    return langNumeric(num, arr);
  },
  updateTimes: function (cont) {
    if (!(cur.lang || {}).wall_X_seconds_ago_words) {
      return;
    }
    var timeNow = intval(vkNow() / 1000), toClean = [];
    timeNow -= cur.tsDiff;
    each(geByClass('rel_date_needs_update', cont || ge('page_wall_posts'), 'span'), function(k, v) {
      if (!v) return;
      var timeRow = intval(v.getAttribute('time')), diff = timeNow - timeRow, timeText = v.getAttribute('abs_time');
      if (diff < 5) {
        timeText = getLang('wall_just_now');
      } else if (diff < 60) {
        timeText = Wall.langWordNumeric(diff, cur.lang.wall_X_seconds_ago_words, cur.lang.wall_X_seconds_ago);
      } else if (diff < 3600) {
        timeText = Wall.langWordNumeric(intval(diff / 60), cur.lang.wall_X_minutes_ago_words, cur.lang.wall_X_minutes_ago);
      } else if (diff < 4 * 3600) {
        timeText = Wall.langWordNumeric(intval(diff / 3600), cur.lang.wall_X_hours_ago_words, cur.lang.wall_X_hours_ago);
      } else {
        toClean.push(v);
      }
      v.innerHTML = timeText;
    });
    each (toClean, function () {
      removeClass(this, 'rel_date_needs_update');
    });
  },

  updateRepliesHeader: function(post_raw, headerEl, shown, total) {
    if (cur.onepost) return;
    var headerText, href = headerEl.href, matches, showCount = 3, cls = 0;

    if (!href && (matches = post_raw.match(/^(-?\d+)_(photo|video|note|topic|video|)(\d+)$/))) {
      var type = matches[2] || 'wall';
      href = '/' + type + matches[1] + '_' + matches[3];
      switch (type) {
        case 'topic':
          href += '?offset=last&scroll=1';
          break;
        case 'wall':
          href += '?offset=last&f=replies';
          break;
      }
      headerEl.href = href;
    }
    if (total > shown) {
      if (shown < 100) {
        if (total > 100) {
          headerText = getLang('wall_show_n_of_m_last', 100);
          headerText = headerText.replace('{count}', total);
        } else {
          headerText = getLang('wall_show_all_n_replies', total);
        }
        showCount = false;
      } else {
        headerText = getLang('wall_hide_replies');
      }
    } else {
      headerText = getLang('wall_hide_replies');
      cls = 1;
    }
    toggleClass(headerEl, 'wrh_all', cls);
    headerEl.innerHTML = '<div class="wrh_text" id="wrh_text' + post_raw + '">' + headerText + '</div><div class="progress wrh_prg" id="wrh_prg' + post_raw + '"></div>';
    headerEl.onclick = Wall.showReplies.pbind(post_raw, showCount, false);
    headerEl.setAttribute('offs', shown + '/' + total);
  },

  updatePoll: function(post_raw) {
    if (!vk.id) return;
    ajax.post('al_wall.php', {act: 'post_poll', post_raw: post_raw}, {
      onDone: function (html) {
        if (html) {
          var pollWrapEl = ge('post_poll' + post_raw), pollTable = geByTag1('table', pollWrapEl);
          if (pollTable) {
            for (var i = 0; i < pollTable.rows.length; ++i) {
              var t = pollTable.rows[i].tt;
              if (t && t.destroy) t.destroy();
            }
          }
          val(pollWrapEl, html);
        }
      }, onFail: function() { return true; }
    });
  },

  updatePollResults: function (post_raw, newPollDataTxt) {
    var pollWrapEl = ge('post_poll' + post_raw),
        pollTable = geByTag1('table', pollWrapEl),
        pollRaw = val('post_poll_raw' + post_raw);

    if (!pollWrapEl) return;

    var newPollData = eval('(' + newPollDataTxt + ')'),
        totalVotes = 0,
        maxVotes = 0,
        pollStats = '';

    each (newPollData, function () {
      totalVotes += this[1];
      if (this[1] > maxVotes) {
        maxVotes = this[1];
      }
    });

    if (pollTable && pollRaw) {
      each (newPollData, function(i) {
        pollStats += rs(cur.wallTpl.poll_stats, {
          option_text: this[0],
          css_percent: totalVotes ? Math.round(this[1] * 100 / maxVotes) : 0,
          count: langNumeric(this[1], '%s', true),
          percent: totalVotes ? Math.round(this[1] * 1000 / totalVotes) / 10 : 0,
          handlers: val('post_poll_open' + post_raw) ? (' onmouseover="Wall.pollOver(this, \'' + post_raw + '\', ' + i + ')"') : ''
        });
      });
      for (var i = 0; i < pollTable.rows.length; ++i) {
        var t = pollTable.rows[i].tt;
        if (t && t.destroy) t.destroy();
      }
      val(pollTable, pollStats);
    }
    var codeLink = geByClass1('page_poll_code', pollWrapEl, 'a'), totalEl = geByClass1('page_poll_total', pollWrapEl, 'span');
    val(totalEl, langNumeric(totalVotes, cur.lang.wall_X_people_voted || '%', true));
    if (codeLink) totalEl.insertBefore(codeLink, domFC(totalEl));
  },

  updated: function (layer, key, data) {
    var cur = layer ? wkcur : window.cur;
    if (!cur.wallAddQueue || cur.wallAddQueue.key != key) {
      return;
    }
    if (data.failed) {
      cur.wallAddQueue = false;
      return;
    }
    cur.wallAddQueue.ts = data.ts;
    if (!isArray(data.events) || !data.events.length) {
      return;
    }

    var len = data.events.length,
        startST = layer ? wkLayerWrap.scrollTop : scrollGetY(),
        curST = startST,
        fullWall = !(cur.wallType || '').indexOf('full'),
        onepost = cur.onepost,
        layerpost = layer ? true : false,
        fixed = layer;

    if (fullWall && (nav.objLoc.q || nav.objLoc.search || nav.objLoc.day)) return;

    each(data.events, function () {
      var ev = this.split('<!>'),
          ev_ver = ev[0],
          ev_type = ev[1],
          post_id = ev[2],
          updH = 0,
          updY = 0,
          el = layer && window.cur.wallLayer == post_id && ge('wl_post_body') ||
               !layer && onepost && ge('fw_post');

      if (!el || ev_type == 'del_reply') {
        el = ge('post' + post_id);
        if (!isAncestor(el, layer ? wkLayerWrap : pageNode)) {
          el = null;
        }
      }

      if (ev_ver != cur.options.qversion) {
        // location.reload();
        return;
      }
      switch (ev_type) {
        case 'new_post':
          if (el) break;
          if (fullWall && cur.pgStart > 0) {
            cur.pgOffset++;
            break;
          }
          if (cur.oid == vk.id && vk.id == ev[9]) {
            if (window.curNotifier && curNotifier.idle_manager.is_idle) {
              Wall.clearInput();
            }
          }

          var cont = ge('page_wall_posts'),
              lastPost = cont.lastChild,
              extendCb = fullWall ? FullWall.addTetaTet : false,
              flgs = intval(ev[ev.length - 1]),
              adminLevel = cur.options.is_admin !== undefined ? cur.options.is_admin : (cur.options.wall_oid < 0 ? ((flgs & 8) ? 2 : ((flgs & 2) ? 1 : 0)) : 0),
              newEl = se(Wall.getNewPostHTML(ev, adminLevel, extendCb, cur)),
              insBefore = cont.firstChild;

          if (ge('post' + post_id)) break;
          if (lastPost && lastPost != newEl) {
            re(lastPost);
          } else lastPost = false;
          if (!fullWall) {
            val('page_wall_count_all', intval(val('page_wall_count_all')) + 1);
            addClass(newEl, 'all');
            if (intval(ev[10])) {
              val('page_wall_count_own', intval(val('page_wall_count_own')) + 1);
              addClass(newEl, 'own');
            }
          } else if (!lastPost) {
            cur.pgOffset++;
          }
          while (insBefore && (insBefore.tagName == 'INPUT' || insBefore.nodeType != 1 || hasClass(insBefore, 'post_fixed'))) {
            insBefore = insBefore.nextSibling;
          }
          cont.insertBefore(newEl, insBefore);
          if (ge('post_poll_id' + post_id)) {
            Wall.updatePoll(post_id);
          }
          //!browser.msie6 && placeholderSetup(ge('reply_field' + post_id));
          updH = newEl.offsetHeight;
          updY = getXY(newEl, fixed)[1];
          setStyle(newEl, {backgroundColor: '#FEFAE4'});
          animate(newEl, {backgroundColor: '#FFF'}, 6000);
          Wall.updateMentionsIndex();
          break;

        case 'edit_post':
          var editEl = ge('wpt' + post_id);
          if (!isVisible(el) || !editEl) break;

          var wasExpanded = geByClass1('wall_post_more', editEl);
          if (wasExpanded) wasExpanded = isVisible(domNS(wasExpanded));

          updH = -editEl.offsetHeight;
          updY = getXY(editEl, fixed)[1];
          var text = psr(rs(ev[3], {
            poll_hash: cur.wallTpl.poll_hash
          }));
          val(editEl, text);
          if (wasExpanded) {
            wasExpanded = geByClass1('wall_post_more', editEl);
            if (wasExpanded) wasExpanded.onclick();
          }
          if (ge('post_poll_id' + post_id)) {
            Wall.updatePoll(post_id);
          }
          updH += editEl.offsetHeight;
          setStyle(editEl, {backgroundColor: '#FEFAE4'});
          animate(editEl, {backgroundColor: '#FFF'}, 6000);
          break;

        case 'edit_reply':
          var reply_id = ev[3],
              editEl = ge('wpt' + reply_id);
          if (!isVisible('post' + reply_id) || !editEl) break;

          var wasExpanded = geByClass1('wall_reply_more', editEl);
          if (wasExpanded) wasExpanded = isVisible(domNS(wasExpanded));

          updH = -editEl.offsetHeight;
          updY = getXY(editEl, fixed)[1];
          val(editEl, psr(ev[4]));
          if (wasExpanded) {
            wasExpanded = geByClass1('wall_reply_more', editEl);
            if (wasExpanded) wasExpanded.onclick();
          }
          updH += editEl.offsetHeight;
          setStyle(editEl, {backgroundColor: '#FEFAE4'});
          animate(editEl, {backgroundColor: '#FFF'}, 6000, setStyle.pbind(editEl, {color: ''}));
          break;

        case 'post_parsed_link':
          if (!el) break;
          var btnWrap = geByClass1('wall_postlink_preview_btn_disabled', el);
          if (!btnWrap) break;
          if (intval(ev[3])) {
            removeClass(btnWrap, 'wall_postlink_preview_btn_disabled');
          } else {
            re(btnWrap);
          }
          break;

        case 'del_post':
          if (!isVisible(el)) break;

          if (!cur.wallMyDeleted[post_id] && !onepost) {
            updH = -el.offsetHeight;
            updY = getXY(el, fixed)[1];
            revertLastInlineVideo(el);
            hide(el);
            if (!fullWall && !layerpost) {
              val('page_wall_count_all', intval(val('page_wall_count_all')) - 1);
              if (ev[3]) {
                val('page_wall_count_own', intval(val('page_wall_count_own')) - 1);
              }
            }
          }
          break;

        case 'res_post':
          if (!el || isVisible(el)) break;
          if (cur.wallRnd == ev[4]) show(el);

          if (fullWall) {
            cur.pgOffset++;
          } else {
            val('page_wall_count_all', intval(val('page_wall_count_all')) + 1);
            if (ev[3]) {
              val('page_wall_count_own', intval(val('page_wall_count_own')) + 1);
            }
          }
          break;

        case 'new_reply':
          if (!el || cur.wallMyReplied[post_id] ||
              ge('post' + ev[3]) ||
              (onepost && cur.pgOffset < cur.pgCount) ||
              (layerpost && (!cur.reverse ? cur.offset + cur.loaded < cur.count : cur.offset))
          ) break;

          var repliesEl = onepost ? ge('fw_replies_rows') : ge('replies' + post_id),
              repliesWrap = ge('replies_wrap' + post_id),
              extendCb = !onepost ? false : function (repls) {
                return (repls.acts ? {acts: '<span class="divide">|</span>' + repls.acts} : {})
              },
              flgs = intval(ev[ev.length - 1]),
              adminLevel = cur.options.is_admin !== undefined ? cur.options.is_admin : (cur.options.wall_oid < 0 ? ((flgs & 8) ? 2 : ((flgs & 2) ? 1 : 0)) : 0),
              newEl = se(Wall.getNewReplyHTML(ev, adminLevel, extendCb, cur)),
              highlight = false,
              startH = layerpost ? repliesEl.offsetHeight : el.offsetHeight;

          if (!isVisible(repliesEl) || !isVisible(repliesWrap) || isVisible('reply_link' + post_id)) {
            re('reply_link' + post_id);
            show(repliesWrap, repliesEl);
            highlight = true;
          } else {
            var openEl = repliesEl.nextSibling, newCnt = geByClass('new_reply', repliesEl, 'div').length + 1;
            if (!layerpost && !onepost && !cur.wallMyOpened[post_id]) {
              addClass(newEl, 'new_reply');
              if (!openEl || openEl.className != 'replies_open') {
                openEl = ce('div', {className: 'replies_open', onclick: Wall.openNewComments.pbind(post_id)});
                repliesEl.parentNode.insertBefore(openEl, repliesEl.nextSibling);
              }
              openEl.innerHTML = getLang('wall_x_new_replies_more', Math.min(100, newCnt));
              openEl.newCnt = newCnt;
            } else {
              if (openEl && openEl.className == 'replies_open') re(openEl);
              highlight = true;
              var headerEl = geByClass1('wr_header', repliesEl, 'a'),
                  shown = geByClass('reply', repliesEl, 'div').length + 1,
                  total = shown;
              if (headerEl) {
                total = intval(headerEl.getAttribute('offs').split('/')[1]) + 1;
              }
              if ((total > 5 || shown < total) && !cur.fixedWide) {
                if (!headerEl) {
                  repliesEl.insertBefore(headerEl = ce('a', {className: 'wr_header'}), repliesEl.firstChild);
                }
                Wall.updateRepliesHeader(post_id, headerEl, shown, total);
              }
            }
          }
          if ((layer ? cur.reverse : cur.fixedWide) && repliesEl.firstChild) {
            repliesEl.insertBefore(newEl, repliesEl.firstChild);
          } else {
            repliesEl.appendChild(newEl);
          }
          if (highlight) {
            setStyle(newEl, {backgroundColor: '#FEFAE4'});
            animate(newEl, {backgroundColor: '#FFF'}, 6000);
          }
          if (layerpost) {
            cur.count++;
            cur.loaded++;
            WkView.wallUpdateReplies();
            updH = repliesEl.offsetHeight - startH;
            updY = getXY(newEl, fixed)[1];
          } else if (onepost) {
            FullWall.repliesSummary(ev[13]);
            cur.pgOffset++;
            cur.pgCount++;
            Pagination.pageReady(false);
            FullWall.onePostOnScroll(false, false, true);
          } else {
            updH = el.offsetHeight - startH;
            updY = getXY(highlight ? newEl : openEl)[1];
            Wall.repliesSideSetup(post_id);
          }
          Wall.updateMentionsIndex();
          break;

        case 'del_reply':
          if (cur.wallMyDeleted[post_id] || !el) break;
          updH = -el.offsetHeight;
          updY = getXY(el, fixed)[1];
          // debugLog(ev, post_id, el);
          revertLastInlineVideo(el);
          if (cur.layerpost) {
            hide(el);
            cur.count--;
            cur.loaded--;
          } else if (cur.onepost) {
            hide(el);
            cur.pgOffset--;
            cur.pgCount--;
          } else {
            var post = el.parentNode.id.match(/replies(-?\d+_\d+)/);
            re(el);
            if (post) {
              Wall.repliesSideSetup(post[1]);
            }
          }
          break;

        case 'like_post':
        case 'like_reply':
          if (!el) break;
          var likePost = ev_type == 'like_reply' ? post_id.replace('_', '_wall_reply') : post_id,
              likeLayerPost = layer && post_id == window.cur.wallLayer,
              cntEl = likeLayerPost ? ge('wk_like_count') : ge('like_count' + likePost),
              iconEl = likeLayerPost ? ge('wk_like_icon') : ge('like_icon' + likePost),
              ttEl = iconEl && iconEl.parentNode,
              cnum = intval(val(cntEl)),
              num = intval(ev[3]);

          animateCount(cntEl, num);
          val('like_real_count_wall' + post_id, num);
          toggleClass(iconEl, 'no_likes', num <= 0);
          if (ttEl && ttEl.tt && !isVisible(ttEl.tt.container)) {
            ttEl.tt.destroy && ttEl.tt.destroy();
          }
          setStyle(iconEl, {opacity: '', visibility: ''});
          break;

        case 'vote_poll':
          if (!el) break;
          Wall.updatePollResults(post_id, ev[3]);
          break;


        case 'upd_ci':
          var info = ev[2],
              edit = ge('current_info'),
              el = edit || ge('page_current_info'),
              dataAudio = ' data-audio="' + ev[4] + '"';

          if (!el) {
            break;
          }
          switch (ev[3]) {
            case 'audio':
              var curCntEl = geByClass1('current_audio_cnt');
              if (curCntEl && curCntEl.tt) curCntEl.tt.hide();
              var attr = edit ? '' : (' onmouseover="showTooltip(this, {forcetoup: true, text: \'' + cur.options.ciAudioTip + '\', black: 1, shift: [13, 0, 0]})" onclick="Page.playCurrent(this, this.getAttribute(\'data-audio\'), \'' + cur.options.ciAudioHash + '\')"');
              info = '<a class="current_audio fl_l"' + attr + dataAudio + '><div class="label fl_l"></div>' + info + '</a>';
              var ci_cnt = intval(ev[5] || ''), ci_cnt_class = ci_cnt ? '' : ' hidden';
              info += '<div class="current_audio_cnt' + ci_cnt_class + ' fl_r" onmouseover="Page.audioListenersOver(this, cur.oid)" onclick="Page.showAudioListeners(cur.oid, event)"><div class="value fl_l">' + ci_cnt + '</div><div class="label fl_r"></div></div>';
              wall.updateOwnerStatus(info, el, ev, edit);
            break;

            case 'app':
              var shift = ev[6] ? '[11, 0, 0]' : '[13, 0, 0]', addCls = ev[6] ? ' current_app_icon' : '';
              var attr = edit ? (' onclick="cur.ciApp = ' + ev[4] + '"') : (' onmouseover="showTooltip(this, {forcetoup: true, text: \'' + cur.options.ciAppTip + '\', black: 1, shift: ' + shift + '})" href="' + ev[5] + '?ref=14" onclick="return showApp(event, ' + ev[4] + ', 1, 14, cur.oid)"');
              if (ev[6]) attr += ' style="background-image: url(\'' + ev[6] + '\')"';
              info = '<a class="current_app' + addCls + '"' + attr + '>' + info + '</a>';
              wall.updateOwnerStatus(info, el, ev, edit);
            break;

            default:
              stManager.add(['emoji.js'], function() {
                info = info ? ('<span class="current_text">' + Emoji.emojiToHTML(info, true) + '</span>') : info;
                wall.updateOwnerStatus(info, el, ev, edit);
              });
            break;
          }
        break;

        case 'upd_ci_cnt':
          var edit = ge('current_info'), cnt = intval(ev[2]), el = edit || ge('page_current_info'),
              cntEl = el && geByClass1('current_audio_cnt', el);
          if (cntEl) {
            if (cntEl.tt) {
              cntEl.tt.destroy();
            }
            toggleClass(cntEl, 'hidden', cnt == 0);
            var valEl = geByClass1('value', cntEl);
            if (valEl) {
              animateCount(valEl, cnt)
            }
          }
        break;
      }
      if (updH && (layer ? (updY < 0) : (curST > updY))) {
        curST += updH;
      }
    });
    var endST = scrollGetY();
    if (curST != startST && startST > 100/* && Math.abs(startST - endST) > 100*/) {
      if (layer) {
        wkLayerWrap.scrollTop = curST;
      } else {
        scrollToY(curST, 0);
      }
    }
    Wall.update();
  },

  updateOwnerStatus: function(info, el, ev, edit) {
    if (edit) {
      var cls = info ? 'my_current_info' : 'no_current_info';
      info = '<span class="' + cls + '">' + (info || getLang('change_current_info')) + '</span>';
      val(el.parentNode.nextSibling, info);
      if (!isVisible('currinfo_editor') && cur.oid > 0) {
        toggle('currinfo_audio', ev[3] != 'app');
        toggle('currinfo_app', ev[3] == 'app');
        addClass('currinfo_app', 'on');
      }
    }
    val(el, info);
    setStyle(el.firstChild, {backgroundColor: '#FEFAE4'});
    animate(el.firstChild, {backgroundColor: '#FFF'}, 6000, function () {
      setStyle(el.firstChild, {backgroundColor: ''});
    });
  },

  updateMentionsIndex: function (force) {
    clearTimeout(cur.wallUpdateMentionsIndexTO);
    if (!force) {
      cur.wallUpdateMentionsIndexTO = setTimeout(wall.updateMentionsIndex.pbind(true), 300);
      return;
    }

    var byHref = {},
        list = [],
        linkRe = new RegExp('^(https?://(vk\.com|' + location.host.replace(/\./, '\\.') + '))?\/?'),
        photoLinks = [];

    each (geByClass('author', bodyNode, 'a'), function () {
      var name = val(this), href = this.href.replace(linkRe, '');
      if (byHref[href] !== undefined) {
        return;
      }
      var // oidMatches = href.match(/^(id|club|event|public)(\d+)$/),
          oid = /*oidMatches ? (oidMatches[1] == 'id' ? oidMatches[2] : -oidMatches[2]) : */intval(this.getAttribute('data-from-id'));

      if (oid && oid != vk.id) {
        byHref[href] = list.length;
        list.push([oid, name, '@' + href, '/images/camera_c.gif']);
      }
    });

    photoLinks = photoLinks.concat(Array.prototype.slice.apply(geByClass('post_image', bodyNode, 'a')));
    photoLinks = photoLinks.concat(Array.prototype.slice.apply(geByClass('reply_image', bodyNode, 'a')));

    each (photoLinks, function () {
      var href = this.href.replace(linkRe, ''),
          listId = byHref[href];
      if (listId === undefined) {
        return;
      }

      var img = domFC(this);
      while (img && img.tagName != 'IMG') {
        img = domNS(img);
      }
      if (img) {
        list[listId][3] = img.getAttribute('src');
        delete byHref[href];
      }
    });
    cur.wallMentions = list;
  },

  initUpdates: function (key) {
    if (!key || !window.Notifier) {
      return;
    }
    var wasKey = cur.wallAddQueue,
        checkCb = function () {if (cur.wallAddQueue) Notifier.addKey(cur.wallAddQueue, Wall.updated.pbind(false));};

    cur.wallAddQueue = key;
    checkCb();
    if (!wasKey) {
      checkInt = setInterval(checkCb, 10000);
      cur.destroy.push(function () {clearInterval(checkInt)});
    }
  },

  initWallOptions: function (opts) {
    extend(cur, {
      wallType: opts.wall_type,
      wallTpl: opts.wall_tpl,
      wallMyDeleted: {},
      tsDiff: opts.wall_tpl && opts.wall_tpl.abs_timestamp ? Math.round((vkNow() / 1000 - opts.wall_tpl.abs_timestamp) / 900.0) * 900 : 0,
      wallMyOpened: {},
      wallMyReplied: {},
      wallMentions: [],
      wallMyRepliesCnt: 0
    });
    if (opts.wall_tpl && opts.wall_tpl.lang) {
      cur.lang = extend(cur.lang || {}, opts.wall_tpl.lang);
    }

    window.Notifier && Notifier.addRecvClbk('wall_reply_multiline', 'wall', function(data) {
      Wall.onReplySubmitChanged(data.value, 1);
    }, true);
  },

  init: function(opts) {
    Wall.initWallOptions(opts);

    extend(cur, {
      wallInited: true,
      postField: ge('post_field'),
      wallPage: ge('profile') || ge('group') || ge('public'),
      wallPageNarrow: ge('profile_narrow') || ge('group_narrow'),
      wallPageWide: false,
      wallUploadOpts: opts.upload || false,
      deletedCnts: {own: 0, all: 0}
    });

    cur.destroy.push(function(c) {
      cleanElems(c.postField);
    });
    var rem = removeEvent.pbind(document, 'click', Wall.hideEditPostReply);

    if (cur._back) {
      cur._back.hide.push(rem);
      cur._back.show.push(rem);
      cur._back.show.push(addEvent.pbind(document, 'click', Wall.hideEditPostReply));
    } else {
      cur.destroy.push(rem);
    }
    var ownCnt = ge('page_wall_count_own');
    if (cur.wallType == 'own' && !intval(ownCnt && ownCnt.value)) {
      cur.wallType = ge('page_wall_posts').className = 'all';
    }
    Wall.update();
    Wall.initUpdates(opts.add_queue_key);

    // Times update interval. For relative time correction
    if (opts.wall_tpl) {
      cur.timeUpdateInt = setInterval(function () {Wall.updateTimes(opts.wallCont);}, 10000);
      cur.destroy.push(function () {clearInterval(cur.timeUpdateInt);});
    }

    if (opts.draft) {
      Wall.setDraft(opts.draft);
    }

    var scrollNode = browser.msie6 ? pageNode : window;
    addEvent(scrollNode, 'scroll', Wall.scrollCheck);
    addEvent(window, 'resize', Wall.scrollCheck);
    cur.destroy.push(function () {
      removeEvent(scrollNode, 'scroll', Wall.scrollCheck);
      removeEvent(window, 'resize', Wall.scrollCheck);
    });
    cur.wallAutoMore = opts.automore;

    placeholderSetup(cur.postField, { pad: { paddingTop: 7, paddingBottom: 6, paddingLeft: 6 }});

    removeEvent(document, 'click', Wall.hideEditPostReply);
    addEvent(document, 'click', Wall.hideEditPostReply);

    if (opts.media_types) {
      cur.wallAddMedia = initAddMedia(ge('page_add_media').firstChild, 'media_preview', opts.media_types, extend({
        onAddMediaChange: function() {
          if (cur.module == 'profile' || cur.module == 'feed' || cur.module == 'wall') {
            Wall.postChanged(10);
          }
        }, onMediaChange: function() {
          if (cur.module == 'profile' || cur.module == 'feed' || cur.module == 'wall') {
            Wall.postChanged();
          }
        }, editable: 1, sortable: 1}, opts.media_opts || {})
      );
    }
    cur.withUpload = window.WallUpload && !(browser.msie111 || browser.safari_mobile) && (cur.wallType == 'all' || cur.wallType == 'own' || cur.wallType == 'feed') && Wall.withMentions && cur.wallUploadOpts;
    if (cur.withUpload && WallUpload.checkDragDrop()) {
      var clean = function () {
          removeEvent(document, 'dragover dragenter drop dragleave', cb);
        },
        cb = function (e) {
          if (dragtimer !== false) {
            clearTimeout(dragtimer);
            dragtimer = false;
          }
          if (cur.uploadInited) {
            clean();
            return cancelEvent(e);
          }
          switch (e.type) {
            case 'drop':
              started = false;
              delete cur.wallUploadFromDrag;
              hide('post_upload_dropbox');
              break;

            case 'dragleave':
              dragtimer = setTimeout(function () {
                started = false;
                delete cur.wallUploadFromDrag;
                hide('post_upload_dropbox');
              }, 100);
              break;

            case 'dragover':
            case 'dragenter':
              if (!started) {
                started = (e.target && (e.target.tagName == 'IMG' || e.target.tagName == 'A')) ? 1 : 2;
                if (started == 2) {
                  setTimeout(Wall.showEditPost, 0);
                }
              }
              if (started == 2) {
                cur.wallUploadFromDrag = 1;
              }
          }
          return cancelEvent(e);
        },
        started = false,
        dragtimer = false;
      addEvent(document, 'dragover dragenter drop dragleave', cb);
      cur.destroy.push(clean);
    }
    cur.nav.push(function(changed, old, n) {
      if (!changed[0] && changed.fixed != undefined) {
        Page.toggleFixedPost(cur.oid+'_'+cur.options['fixed_post_id']);
        nav.setLoc(n);
        return false;
      }
    });
    Wall.updateMentionsIndex();
  },
  switchOwner: function(obj, sw) {
    obj.innerHTML = '<div class="progress_inline"></div>';
    nav.change({owners_only: sw});
  },
  replyAsGroup: function(obj, imgSrc) {
    checkbox(obj);
    var el = obj.parentNode;
    while(el && !hasClass(el, 'reply_box')) {
      el = el.parentNode;
    }
    if (!el) return;
    var photoImg = geByClass1('reply_form_img', el);
    if (isChecked(obj)) {
      if (!obj.backImg) {
        obj.backImg = photoImg.src;
      }
      if (imgSrc && imgSrc != '%owner_photo%') {
        photoImg.src = imgSrc;
      }
    } else if (obj.backImg) {
      photoImg.src = obj.backImg;
    }
  },
  reportPost: function(obj, ev, postRaw) {
    stManager.add(['privacy.js', 'privacy.css'], function() {
      return Privacy.show(obj, ev, 'report_'+postRaw);
    });
  }
}

var wall = extend(Wall, {
  showDeletePost: function (post) {
    Wall._animDelX(0.3, undefined, post, 'post_delete');
    Wall._animDelX(0.3, undefined, post, 'post_edit');
  },
  hideDeletePost: function (post) {
    Wall._animDelX(0, undefined, post, 'post_delete');
    Wall._animDelX(0, undefined, post, 'post_edit');
  },
  activeDeletePost: function(post, tt, action) {
    Wall._animDelX(1, 1, post, action);
    if (tt) showTooltip(ge((action || 'delete_post') + post), {text: tt, showdt: 0, black: 1, shift: [14, 3, 3]});
  },
  deactiveDeletePost: Wall._animDelX.pbind(0.3, 0)
});



Composer = {
  init: function (el, options) {
    if (!(el = ge(el))) {
      return null;
    }

    var composer = data(el, 'composer');
    if (composer) {
      return composer;
    }
    composer = {
      input: el,
      inited: false,
      options: options
    };

    data(el, 'composer', composer);

    el.parentNode.insertBefore(
      composer.wddWrap = ce('div', {
        className: 'composer_wdd clear_fix ' + (options.wddClass || ''),
        id: el.id + '_composer_wdd',
        innerHTML: '<input type="hidden" id="' + el.id + '_composer_wdd_term"/>'
      }, {
        width: options.width || getSize(el)[0]
      }),
      el.nextSibling
    );

    composer.wddInput = composer.wddWrap.firstChild;
    composer.wdd = WideDropdown.initSelect(composer.wddWrap, extend({
      text: composer.wddInput,
      input: el,
      url: 'hints.php',
      params: {act: 'a_json_friends', from: 'composer'},
      noResult: options.lang.noResult || '',
      introText: options.lang.introText || '',
      onItemSelect: Composer.onItemSelect.bind(Composer).pbind(composer)
    }, options.wddOpts || {}));

    el.dd = composer.wddWrap.id;

    Composer.initEvents(composer);

    if (options.media) {
      composer.addMedia = initAddMedia(options.media.lnk, options.media.preview, options.media.types, options.media.options);
    }

    setStyle(composer.wddWrap, 'width', '');

    composer.inited = true;

    return composer;
  },
  initEvents: function (composer) {
    addEvent(composer.input, 'keyup keydown keypress', Composer.onKeyEvent.pbind(composer));
    addEvent(composer.input, 'click mousedown mouseup focus blur paste', Composer.onMouseEvent.pbind(composer));
  },
  destroy: function (composer) {
    WideDropdown.deinit(composer.wddWrap);
    cleanElems(composer.input, composer.wddWrap);
    re(composer.wddWrap);
    composer.inited = false;
    if (composer.addMedia) composer.addMedia.destroy();
    data(composer.input, 'composer', null);
  },

  onKeyEvent: function (composer, event) {
    var controlEvent = composer.wdd && inArray(event.keyCode, [KEY.UP, KEY.DOWN, KEY.RETURN]);
    if (event.type == 'keypress' || event.type == 'keydown') {
      if (event.keyCode == KEY.RETURN || event.keyCode == 10) {
        if (!composer.select || !composer.select.isVisible()) {
          if (event.ctrlKey && isFunction(composer.options.onSubmit)) {
            // composer.input.blur();
            // composer.options.onSubmit();
            return true;
          }
        } else {
          triggerEvent(document, event.type, event);
          return cancelEvent(event);
        }
      }
      if (event.keyCode == KEY.TAB) {
        var input = composer.input,
            value = window.Emoji ? Emoji.editableVal(input) : '',
            curPos = Composer.getCursorPosition(input);
            curValue = value.substr(0, curPos) + "\001" + value.substr(curPos),
            matches = curValue.match(/^[\s\S]*(@|\*)[\S]+\s*\([\s\S]*?\001[\s\S]*?\)\s*/);

        if (matches) {
          var pos = matches[0].length - 1;
          elfocus(composer.input, pos, pos);
          return cancelEvent(event);
        }
      }
      var cnt = 0;
      for(var i in composer.wdd.shown) {
        cnt += 1;
      }
      if (controlEvent && isVisible(composer.wdd.listWrap) && cnt) {
        if (event.type == (browser.opera ? 'keypress' : 'keydown')) {
          WideDropdown._textEvent(event);
        }
        return cancelEvent(event);
      }
    }

    if (event.type == 'keyup' && !controlEvent) {
      if (event.keyCode == 65 && event.ctrlKey) { // fix Ctrl+A
        return;
      }
      if (composer.wdd && inArray(event.keyCode, [KEY.SPACE, KEY.HOME, 190, 191, 78, 55, 49])) {
        Composer.hideSelectList(composer);
      }
      Composer.updateAutoComplete(composer, event);
    }
  },
  onMouseEvent: function (composer, event) {
    if (event.type == 'blur') {
      Composer.hideSelectList(composer);
      return;
    }
    if (event.type == 'focus' || event.type == 'click') {
      Composer.updateAutoComplete(composer, event);
    }
    if (event.type == 'paste') {
      setTimeout(Composer.updateAutoComplete.pbind(composer, event), 0);
    }
  },
  updateAutoComplete: function (composer, event) {
    var input = composer.input,
        value = window.Emoji ? Emoji.editableVal(input) : val(input);


        //curPos = Composer.getCursorPosition(input),
        //prefValue = value.substr(0, curPos),
    var prefValue = value;
    var pos = Math.max(prefValue.lastIndexOf('@'), prefValue.lastIndexOf('*')),
        term = pos > -1 ? prefValue.substr(pos + 1) : false;

    if (term && term.match(/&nbsp;|[,\.\(\)\?\!\s\n \u00A0]|\#/)) {
      term = false;
    }
    composer.curValue = value;
    composer.curTerm = term;
    composer.curPos = pos;
    val(composer.wddInput, term);
    Composer.toggleSelectList(composer);

    if (event.type == 'keyup' || event.type == 'paste') {
      if (composer.options.onValueChange) {
        composer.options.onValueChange(prefValue, event.type != 'keyup');
      }
      if (composer.addMedia) {
        composer.addMedia.checkMessageURLs(prefValue, event.type != 'keyup');
      }
      if (composer.options.checkLen) {
        composer.options.checkLen(value);
      }
    }
  },
  toggleSelectList: function (composer) {
    var term = composer.curTerm;
    if (term === false) {
      Composer.hideSelectList(composer);
    } else {
      Composer.showSelectList(composer, term);
    }
  },
  hideSelectList: function (composer) {
    composer.wddInput.focused = false;
    WideDropdown._hideList(composer.wdd);
  },
  showSelectList: function (composer, term) {
    composer.wddInput.focused = true;
    WideDropdown.items(composer.wdd.id, cur.wallMentions || []);
    WideDropdown._updateList(composer.wdd, false, term);
  },
  onItemSelect: function (composer, item) {
    if (!item) {
      return false;
    }

    var mention = item[2].replace('@', ''),
        alias = replaceEntities(item[1]),
        prefValue = composer.curValue.substr(0, composer.curPos),
        suffValue = composer.curValue.substr(composer.curPos),
        aliasStartPos, aliasEndPos;

    if (!mention) {
      if (itemId > 0) {
        mention = 'id' + itemId;
      } else {
        mention = 'club' + Math.abs(itemId);
      }
    }

    var noAlias = prefValue.match(/\#[\w_\.\u0400-\u04FF]+$/i) ? true : false;

    var isEmoji = (window.Emoji && composer.input.emojiId !== undefined);

    cur.selNum = (cur.selNum || 0) + 1;
    suffValue = suffValue.replace(/^(@|\*)[^\s]*(?:\s+\((?:(.*?)\))?\s*)?/, function (whole, asterisk, prevAlias) {
      var replacement = asterisk + mention + ' ';
      if (noAlias) {
        aliasStartPos = aliasEndPos = replacement.length;
      } else {
        replacement += '('+(isEmoji ? '<span id="tmp_sel_'+cur.selNum+'">' : '');
        aliasStartPos = replacement.length;
        replacement += alias.replace(/[\(\)\]\[]/g, '');
        aliasEndPos = replacement.length;
        replacement += (isEmoji ? '</span>' : '')+') ';
      }

      return replacement;
    });

    aliasStartPos += composer.curPos;
    aliasEndPos += composer.curPos;

    Composer.hideSelectList(composer);
    if (isEmoji) {
      Emoji.val(composer.input, prefValue + suffValue);
      Emoji.focus(composer.input);
      Emoji.editableFocus(composer.input, ge('tmp_sel_'+cur.selNum), false, true)
    } else {
      val(composer.input, prefValue + suffValue);
      elfocus(composer.input, aliasStartPos, aliasEndPos);
    }
    return false;
  },
  getCursorPosition: function (node) {
    if (node.selectionStart) {
      return node.selectionStart;
    } else if (!document.selection) {
      return 0;
    }

    var c = "\001",
        sel = document.selection.createRange(),
        txt = sel.text,
        dup = sel.duplicate(),
        len = 0;

    try {
      dup.moveToElementText(node);
    } catch(e) {
      return 0;
    }
    sel.text  = txt + c;
    len = (dup.text.indexOf(c));
    sel.moveStart('character',-1);
    sel.text  = '';
    if (browser.msie && len == -1) {
      return node.value.length;
    }
    return len;
  },
  getSendParams: function(composer, delayedCallback, silentCheck) {
    var addMedia = composer.addMedia || {},
        media = addMedia.chosenMedia || {},
        medias = (addMedia && addMedia.getMedias) ? addMedia.getMedias() : [],
        share = (addMedia.shareData || {}),
        limit = composer && composer.options.media && composer.options.media.options.limit || 0;


      var input = composer.input;
      var message = trim(window.Emoji ? Emoji.editableVal(input) : val(input));
      var params = {message: message};
      var attachI = 0;

    if (isArray(media) && media.length) {
      medias.push(clone(media));
    }

    setStyle(bodyNode, {cursor: 'default'});

    if (medias.length) {
      var delayed = false;
      each (medias, function (k, v) {
        if (!isArray(v) || !v.length) {
          return;
        }
        var type = this[0],
            attachVal = this[1];
        if (attachI >= limit && type != 'postpone') {
          return false;
        }

        switch (type) {
          case 'poll':
            var poll = addMedia.pollData(silentCheck);
            if (!poll) {
              params.delayed = true;
              return false;
            }
            if (intval(attachVal)) {
              params.poll_id = intval(attachVal);
            }
            attachVal = poll.media;
            delete poll.media;
            params = extend(params, poll);
            break;

          case 'share':
            if (share.failed || !share.url ||
                !share.title && (!share.images || !share.images.length) && !share.photo_url) {
              if (cur.shareLastParseSubmitted && vkNow() - cur.shareLastParseSubmitted < 2000) {
                params.delayed = true;
                return false;
              } else {
                return;
              }
            }
            attachVal = share.user_id + '_' + share.photo_id;
            if (share.images && share.images.length && !silentCheck) {
              addMedia.uploadShare(delayedCallback);
              params.delayed = true;
              return false;
            }
            if (share.initialPattern && (trim(message) == share.initialPattern)) {
              params.message = '';
            }
            extend(params, {
              url: share.url,
              title: replaceEntities(share.title),
              description: replaceEntities(share.description),
              extra: share.extra,
              extra_data: share.extraData,
              photo_url: replaceEntities(share.photo_url),
              open_graph_data: (share.openGraph || {}).data,
              open_graph_hash: (share.openGraph || {}).hash
            });
            break;
          case 'page':
            if (share.initialPattern && (trim(message) == share.initialPattern)) {
              params.message = '';
            }
            break;
          case 'postpone':
            params.postpone = cur.postponedLastDate = val('postpone_date' + addMedia.lnkId);
            return;
        }
        if (this[3] && trim(message) == this[3]) {
          params.message = '';
        }
        params['attach' + (attachI + 1) + '_type'] = type;
        params['attach' + (attachI + 1)] = attachVal;
        attachI++;
      });
    }
    if (!addMedia.multi && !params.postpone && addMedia.postponePreview) {
      params.postpone = cur.postponedLastDate = val('postpone_date' + addMedia.lnkId);
    }

    return params;
  },
  reset: function (composer) {
    var input = composer.input,
        value = val(input),
        media = composer.addMedia,
        state = {value: value};

    //val(input, '');
    if (window.Emoji) {
      Emoji.val(input, '');
    } else {
      input.innerHTML = '';
    }
    if (media) {
      state.urlsCancelled = clone(media.urlsCancelled);
      media.unchooseMedia();
      media.urlsCancelled = [];
    }

    return state;
  },
  restore: function (composer, prevState) {
    var input = composer.input,
        state = Composer.reset(composer);
    val(input, prevState.value || '');

    return state;
  }
}

if (!window._postsSendTimer) _postsSendTimer = setTimeout(Page.postsSend, 10000);

try{stManager.done('page.js');}catch(e){}
