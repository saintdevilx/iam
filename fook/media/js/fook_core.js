var _ua;
function booter(){	if(bootload)for(i in bootload.essential)eval( bootload.essential[i] );	}
window.onload=(function(e){ _ua = navigator.userAgent.toLowerCase();})(Event);
if(!Array.contains)Array.prototype.contains =function(a){  for(var i=0;i<this.length;i++)    if(this[i] === a)return true;      return false;}
function ge(id,el){ if(el && el.getElementById) return el.getElementById(id); else return document.getElementById(id);}
function gebc(cl,el){ if(el &&  el.getElementsByClassName ) return el.getElementsByClassName(cl); else	return document.getElementsByClassName(cl);}
function gebt(t){return document.getElementsByTagName(t);}
function gebt(t,el){ if(el&&el.getElementsByTagName)return el.getElementsByTagName(t); else return document.getElementsByTagName(t);}
function ce(el){return document.createElement(el);}
function ce(el,attr){var elem =document.createElement(el);for( i in attr){elem[i] = attr[i];}return elem;}
function sa(el,at,v){	if( typeof at === 'object')	for(a in at){ el.setAttribute(a, at[a]);}	else if(typeof at == 'string' && v && el) el.setAttribute(at,v);		return el;}
function ga(el,a){ if(el && el.getAttribute) return el.getAttribute(a); return null; }
function cte(text){return document.createTextNode(text);}
function empty(){for(i in this) return false;	return true;	}
function hide(el){ if(el && el.style) el.style.display='none';return el;}
function show(el){ if(el && el.style) el.style.display='block';return el;}
function hasClass(el,cl){if(cl&&el&&el.className) return el.className.split(" ").contains(cl); return false; }
function toggleClass(el,cl){
	if(cl&&el){	
		if(hasClass(el,cl)) el.className = el.className.replace(cl," ");
		else{ el.className+=" "+cl ; 	return true;	}	
	}
	return false; 
}
function toggleDisplay(el){
	if(el&&el.style){
		if( el.style.display === 'none') el.style.display='block';
		else el.style.display='none';
	}
return el;
}
function addClass(el,cl){ if(cl&&el&&el.className) if(!hasClass(el,cl)){el.className+=" "+cl;return true;} return false;}
function contains(o,k){	if(typeof o === 'object'){		for(i in o) if( i == k ) return true;		return false;}	if( typeof o == 'Array'){		for(i in o) if( o[i] == k ) return true; return false;	} }
function insertBefore( cont,el){ if(cont && el && typeof el === 'object'){ 		if( typeof cont === "string") el.innerHTML = cont + innerHTML;		else if( typeof cont == "object" )	return;	} 	else return; }
function removeClass(el,cl){ if(el && el.getAttribute){var cls= el.getAttribute('class').replace(cl,"");el.setAttribute('class',cls);} return el; }
function style(){}
var ht = window.screen.availHeight;
var wd = window.screen.availWidth;
function timestampToTime(time){var str =""; time = new Date(time*1000); str+=time.getDate(); str+="/"+time.getMonth()+1; str+="/"+time.getFullYear(); str+=" at "+time.getHours(); str+=":"+time.getMinutes(); str+=":"+time.getSeconds(); return str;}

var nav = {
	open:function(url,param){		
		if(nav.current === url) return false;
		nav.current = url;
		nav.param = param;
		if(history) history.pushState('','',url) ;
		var method = (param && param['method'])||'GET';
		window._sendreq(param,null,this.onDone,url,method);
		nav.target
		return false;
	},
	onDone:function(a,b,c){		
		var main = ge( (nav.param && nav.param['target'])|| "" )||ge('main_content');
		if(!main) return;
		main.innerHTML = b.html;		
		if(b.css){
			var css = b.css;
			var css_="";
			for(var i=0;i<css.length;i++) js_+="<link href='/"+js[i]+"'>";
			main.append(css_);
		}
		if(b.js){
			var js = b.js;
			var js_="";
			for(var i=0;i<js.length;i++) js_+="<script src='/"+js[i]+"'>"+"</script>";
			main.append(js_);
		}
		document.body.scrollTop = 0;
	},
	qstr:function(param){

	}
};

//
// Events
var KEY = window.KEY = {  LEFT: 37,  UP: 38,  RIGHT: 39,  DOWN: 40,  DEL: 8,  TAB: 9,  RETURN: 13,  ENTER: 13,  ESC: 27,  PAGEUP: 33,  PAGEDOWN: 34,  SPACE: 32,};
function isChar(c){	var chars ="abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";	return chars.indexOf(c);}
function isDigit(c){	var digit ="0123456789";	return digit.indexOf(c)}
function isCharKey(key){	if( (key>=65 && key<=90 ) || (key >=97 && key<=122) )return true; return false;}
function isDigitKey(key){if(key>=47 && key<=57)	return true;	return false;}
function trim(str){return str.trim();}
function val(el){return el.value;}
function message_send(obj,name,id){	
	var html ="<div class='border-all'  id='msg_box'>\
		<div class='list-item label'><span class='msgrecpt'></span></div>\
		<div class='list-item padd_all'>\
			<textarea rows=1 cols=50 name='msg'></textarea>\
		</div>\
		<div class='btn' >Send</div>\
	</div>";	
	var ph = new ph_viewer(obj,{'title':''});
	ph.show();
	ph.set_content(html);
}


function csrfSafeMethod(method){return (/^GET|HEAD|OPTIONS|TRACE$/).test(method);}

function resizeDoc(){
	var in_ht = window.innerHeight, in_wd = window.innerWidth;	
	var  main_content= ge('main_content');	
	sa(main_content,'style','min-height:'+in_ht+'px;');
	var  main= gebc('drishya')[0];	
	var view = "";
	if(in_wd>1000) view="full";
	else if(in_wd>640) view ="medium";
	else if(in_wd<640) view ="small";
	sa(gebt('html')[0],'class',view );	
	if(main){
		if(in_wd>650)
			main.style.width = Math.min(document.body.offsetWidth ,in_wd )-2+'px' ;
		else
			main.style.width = 700+'px' ;
	}
}



function getCookie(name){
	var cookieValue=null;
	if( document.cookie && document.cookie!=''){
		var cookies = document.cookie.split(';');
		for( var i=0; i< cookies.length; i++){			
			var cookie= jQuery.trim(cookies[i]);
			if( cookie.substring(0,name.length+1) == (name+'=') ){
				cookieValue = decodeURIComponent( cookie.substring(name.lenght+1))
				break;
			}
		}
	}
	return cookieValue;
}


window._sendreq = 	function (map ,obj, callback,_url,method,error){		
		try{
			var loader = true;			
			$.ajax({
				beforeSend: function(xhr, settings){										
						showLoader(obj);
						if(!csrfSafeMethod(settings.type) && !this.crossDomain){						
							csrftoken = getCookie('fooktokencsrf');
							csrftoken = csrftoken.substr(csrftoken.indexOf("=")+1 );							
							xhr.setRequestHeader('X-CSRFToken',typeof(csrftoken)=='undefined'?'':csrftoken)
						}
				},			
				type:(method!=null) ? method :'POST',
				data:map,cache:false,
				dataType:'json',
				url: (_url!=null ? _url :'/ajax_apis'),
				success:function(a,c){	
					loader =false;
					if(callback != null && typeof(callback) =='function') callback(obj,a ,c);					
					if( a!=null && typeof(a)!='undefined' && typeof(a['success'])!='undefined'){					
						var execute = eval(a['script']);					
						a['script'];
					}
					else{ if(a!=null && typeof(a['message']) !='undefined')console.debug( a['message'] ) }
				},
				error:function(a,c){
					loader=false;
					if(error){error(a,c);}
					msgdialog(document.body,'Error',"Something unexpected happen. We are on it. We will fix it soon.","INFO");
				},
				complete:function(){loader=false;hideLoader(obj);}
			});
		}
		catch(e){console.debug(e);	}
	};

function showLoader(o){
	//if(!o) o = document.body;
	//if(o.appendChild)o.appendChild( ce('IMG',{src:'/media/loader.gif','id':'progress_loding_id',className:'loader'}) );
}

function hideLoader(o){
	var loader = ge('progress_loding_id');
	if(loader) loader.remove();
}

window.ajxfrm = function ajxfrm(frm, trgt,onDone){
	try{
		var frcntrl = $(frm).find('input,button,select,textarea');
		frcntrl.attr('disabled','disabled')
		
		var frdt = new FormData();	
		var dict ={}
		$.each(frm, function(i,v){	
			required = v.getAttribute('required');
			if( required && v.value.trim().length<1) return false
			if( typeof dict[v.name] !='undefined' )	{
				if( typeof dict[v.name] !='object'){
					d=[];
					d.push( dict[v.name] );
					d.push( v.value );
					dict[ v.name ] = d;
				}
				else				
					dict[v.name].push(v.value);				
			}
			else
				dict[v.name] = v.value;
		});								
		var onsuccess = function(o,a,c){
			frcntrl.removeAttr('disabled');
			frcntrl.find('textarea').val('');
			if(typeof(a.error) !='undefined' && a.error == true) window.msgdialog( $('#ph_wrpr') ,'Error',a.message);								
			else{ 
				var ph =ge('ph_wrap');
				if(ph)ph.remove();
				if( typeof(trgt) !='undefined')	var t = $(trgt).append(a.html);
			}
		}		
		var onError = function(o,a,c){			
			frcntrl.removeAttr('disabled');
		}
		window._sendreq(dict,null, onDone || onsuccess , frm.action, null,onError);		
	}
	catch(e){console.log(e);}

	return false;
}

PostBox = {
	init:function(){},
	onDone:function(a,b,c){
		$('.postbox').find('input,textarea,select,button').removeAttr('disabled');
		ge('post-description').value ='';
		var fc = $('#postlist .posts-list').children()[0];
		$(b.html).insertBefore( fc );		
	},	
}

function insertOnTop(wrap,html){

}

window.msgdialog = function( obj,title, msg,type, opts){
	var _type={'INFO':1,'CONFIRM':2,'WARNING':3,'ALERT':4};
	if(!type) type ='INFO';
	var outer = ce('div' ,{id:'msgbox_',className:'msg_dialog'})
	var title  =ce('span',{id:'title_',className:'hdlne list-item', innerHTML:title}) ;
	var body = ce('span', {id:'msgbody',className:'list-item small_padd',innerHTML:msg}); 
	outer.appendChild(title);
	outer.appendChild(body);
	document.body.appendChild( outer  ) ;
	
	BUTTON ={OK:ce('button',{innerHTML:'Ok'}),
		YES:ce('button',{innerHTML:'Yes'}),NO:ce('button',{innerHTML:'No'}),
		CANCEL:ce('button',{innerHTML:'Cancel'})};

	Dialog ={
		INFO:function () {outer.appendChild(BUTTON.OK);},
		CONFIRM:function(){	outer.appendChild(BUTTON.YES);	outer.appendChild(BUTTON.NO);	},
		WARNING:function(){outer.appendChild(BUTTON.OK);outer.appendChild(BUTTON.CANCEL);},
		ALERT:function(){outer.appendChild(BUTTON.OK);}
	}
	var ret, status=false;
	BUTTON.OK.addEventListener('click',function(){if(opts && opts.ok)opts.ok();outer.remove(); });
	BUTTON.YES.addEventListener('click',function(){if(opts && opts.yes)opts.yes();outer.remove(); });
	BUTTON.NO.addEventListener('click',function(){if(opts && opts.no)opts.no();outer.remove(); });
	BUTTON.CANCEL.addEventListener('click',function(){if(opts && opts.cancel)opts.cancel();outer.remove(); });
	switch(_type[type]){
		case 1: Dialog.INFO();break;
		case 2: Dialog.CONFIRM();break;
		case 3: Dialog.WARNING();break;
		case 4: Dialog.ALERT();break;
	}

	if( obj && obj.position){
		var pos = obj.position();
		if(pos){
			var top = pos.top();
			var ht = obj.height();
			top = top+ht;
			var left = pos.left;
			var padd = obj.css('padding');	
		}
	}
	else{top='40%';	left ='40%';}	
	var msgbox = ge('msgbox_').style = 'top'+top+" left"+left ;
	show( ge('msgbox_'));	
}	

function listenClickEvents(e){	
	try{
		var node = $(e.target.parentNode);
		var target = e.originalTarget;		
		var href =e.originalTarget.href||"";				
		if( href && href.indexOf('#') >=0 ) e.preventDefault();			

		if( target.tagName.toLowerCase() == "a" && ga('event') && !node.hasClass('act-link') && data!=null && !target.onclick  ){			
			if( node.attr('warn') ) if ( !confirm('Are You Sure want to delete?') ) return;
			window._sendreq(data, e.target );
			return false;
		}
		else
			return true;	
	}
	catch(e){}
}

function listenKeyPressEvents(e){
	try{			
		if(e.target&&e.target.tagName&&e.target.tagName.toLowerCase() === "input" && !ga(e.target,'data-placeholder') && ga(e.target,'data-label') )		
			attachPlaceHolder(e.target);
	}catch(ex){
		console.log(ex);
	}
}

function attachPlaceHolder(ob){	
	if( ob ){
		var attach=function(e){
			if(ob.value.trim().length<1) show(ge(ga(ob,'data-label')));
			ob.addEventListener('keyup', function(e){
				sa(ob,'data-placeholder','true');
				if(ob.value.trim().length>0) 
					hide(ge(ga(ob,'data-label')));
				else show(ge(ga(ob,'data-label')));
			});
			ob.addEventListener('blur', function(e){
				ob.removeEventListener('blur',ob);
				ob.removeEventListener('keyup',ob);
			});
		};
		ob.addEventListener('focus',attach);
		if(!ga('data-placeholder')) 
			attach();
	}
}

function listenScrollEvents(e){
	return false;
	var scr = window.scrollY;
	var el = [ ]	;
	for( i in el){
		var ht = typeof el[i].height === "function" ? el[i].height : el[i].height || 0;
		var lft = el[i].position().left;
		if(scr>ht)
			el[i].css({'position':'absolute','top':scr+'px','left':lft+'px'});
		else
			el[i].css({'position':'relative','top':'0','left':'0'});
	}
}

var on_key_reg_evts={};

document.addEventListener('click', listenClickEvents);
window.addEventListener('scroll', listenScrollEvents);
document.addEventListener('keypress', listenKeyPressEvents);
window.FriendCount=0;
window.pending =0;
window.informer = function informer(al){	
	var hndlr = {success:function(a,b,c){
		window.informer.wait=false;
		if( b!=null && parseInt(b.count)> FriendCount){
			window.pending = parseInt(b.count) -parseInt( FriendCount);			
			FriendCount = parseInt(b.count);							
			$('#frReqCnt').html(b.count);
			document.title =" Friend("+b.count+") ";
			$('#frReqCnt_wrap').fadeIn();
		}
		else if(parseInt(b.count)<1 || b==0){
			$('#frReqCnt_wrap').hide();
		}
	 return true;
	},
	error:function(e){
		return true;
	}
 };
 var dt = {'event':'alrts','category':'message','alrt':al};
 if(!window.informer.wait){
 	window.informer.wait = true;
 	window._sendreq(dt,null,hndlr.success)
 }
	//service();
}

function service(){setTimeout( function(){window.informer('req') ;},5000,false);}

function request_menu(o){
	var obj  = $(o);		
	$('#frnd_req_lst').toggleClass('hidden');
	if(!window.pending) return;
	if(FriendCount && FriendCount>0 && window.pending>0)
	{
		var d ={'event':'gt_al','category':'fr','alrt':'req'};
		window._sendreq(d, null, function(a,b,c){
			$('#frnd_req_lst').append(b.html);
			pending=0;
		});
		var requestLoaded = FriendCount ;
	}	
}
window.autocomplete=function autocomplete(opt,obj){
	var s,t,a;
	var hndl={
		init:function(){
			s = $(obj);
			t=$(ge(opt.target));
			a = $(ge(opt.atc));
			d = {'tag':obj.value};
			if(obj.value.length >1)
				hndl.send(d,obj, hndl.complete,'/tags/get');
		},
		send:function(d,o,c,u){
			window._sendreq(d, o,c,u);
		},
		complete:function(d,b,c){
			t.html(b.html);	
			util.pl();
			t.find('a').bind('click',function(){
				s.val( $(this).data('tg') );
				dt =$(this).data();
				for( i in dt ) {					
					t.parent().find('input[name="'+i+'"]').val(dt[i]);
				}
				t.html('');
			});
		}
	};
	hndl.init();
}
function comment(ob){
	var o=$(ob);
	var dt = o.prev();
	var tr= dt.parent().prev();
	var txt = dt.val();
	var p={};	
	if(txt.trim().length<3) return;
	p['cmt_txt']=txt;
	p['user'] =o.data('user');
	p['post'] =o.data('post');
	p['post_type'] = o.data('post_type');
   
	window._sendreq(p,tr,function(a,b,c){tr.append(b.html);dt.val("");},'/post/comment');	
	return false;
}

function lstcomment(pid,o,t,total){
	if(!o) return;
	var tr = $(o).parents('.feed-info').find('#cmnt_lst');
	tr.toggleClass('hidden')
	if ( o&& o.getAttribute('class') == 'loaded' )		return false;
	opts ={'post':pid,'type':t,length:total};	
	window._sendreq(opts ,tr , function(a,b,c){
		tr.append(b.html);
		tr.parent().removeClass('hidden');
		o.setAttribute('class','loaded');
		util.pl();
	}, '/post/viewcomments');
}

function moreComments(o,opts){		
	window._sendreq(opts ,null, function(a,b,c){
		o.parentNode.parentNode.parentNode.innerHTML = b.html;				
		util.pl();
	}, '/post/viewcomments');
}
/*Gallery */
gallery ={
	page: {'page':1},
	init:function(src,opts){		
		gallery.inited=true;
		gallery.data =  opts.data;		
		gallery.wrap = ge('pic_viewer');
	},
	listcomments:function(ob,id, type_id){
		gallery.wrap = ge('pic_viewer');		
		$(gallery.wrap).find('#cmt_ar').toggleClass('hidden');
		if($(ob).hasClass('loaded')) return false;
		var data = {'event':'ls_cmt','post':id,'post_type':type_id||'109979990','category':'gal'};
		window._sendreq( data, null, function(a,b,c){
			util.pl();
			$(gallery.wrap).find('#cmnt_lst').html(b.html);	
		}, '/gallery/viewcomments');
		$(ob).addClass('loaded');
		return false;
	},
	addcomment:function(){},
	like:function(){},
	unlike:function(){},
	next:function(){},
	prev:function(){},
	addcaption:function(){},
	editcaption:function(){},
	remove:function(ob,id,al){
		var success = function(a,b,c){
			ob.parentNode.remove();
		}		
		var ret = msgdialog(document.body,'Remove Video','You Are Removing Image.','CONFIRM',{yes: function(){_sendreq({'imid':id,'al':al},null,success,'/gallery/delete');} });
	},
	tag:function(){},
	paginate:function(src,uid,id){	
		var success = function(a,b,c){
			if(b && b.end)	src.parentNode.remove();
			var tr =ge('galry_imgs');			
			tr.innerHTML += b.html || "";
			gallery.page.page++;
		};
		window._sendreq('',null, success, '/'+uid+'/gallery/'+id+'?page='+gallery.page.page);
	}
}
/*End Gallery*/
Tag={
	init:function(){},
	addTag:function(){

	}
}
/**/
function addEvent(el,type, handle){	
	try{/*if( el && typeof(el) == 'object' && (el.length <1 || typeof(el.length)=='undefined' ) )el.addEventListener( type, handle);else*/
		for( var i=0;i< el.length; i++) el[i].addEventListener(type, handle);
    }catch(e){console.log(el);}
}
/**/
util={
	pl:function(){addEvent(gebt('input'),'keyup' ,function(e){ util._pl(this); }); 
				addEvent(gebt('textarea'),'keyup' ,function(e){ util._pl(this); });
	},
_pl:function(src){
	var wrap = $(src.parentNode); 
	var pl =  "#"+$(src).data('label') ;
	if( src.value.length>0) wrap.find( pl ).hide();	
	else wrap.find( pl ) .show();
	}
}
util.pl();
InfoEditor ={
	save:function(ob,t){
		InfoEditor.t = ge(t);
		InfoEditor.f = ob;
		return window.ajxfrm( ob,null,InfoEditor.onDone);
	},
	onDone:function(){
		var v = InfoEditor.f.parentNode.parentNode.getElementsByTagName('input')[0].value;
		InfoEditor.f.removeAttr('disabled');
		InfoEditor.f.find('textarea').val('');
		InfoEditor.t.innerHTML = v;
		InfoEditor.f.parentNode.style = 'display:none;';
	}
}

likers ={
	get:function(id, type){
		var data = {'post':id,'type':type};
		window._sendreq( data, null,likers.onDone,'/likers');
		return false;
	},
	onDone:function(a,b,c){
		var ph = new ph_viewer(this,{});
		ph.show();
		ph.set_content(b.html);
	},
	like:function(o){
		try{
			var count  = $(o.parentNode).next();
			var data = $(o).data();
			data['event'] ='like';
			var likePlus= function(a,b,c){ 
				var counter =parseInt(b.count) || 0 + (b.exist?0:1);
				for(d in b['dt']) $(o).data(d, b['dt'][d]);				
				if(count.find('#likecounts').length >0 )
					count.find('#likecounts').html( counter ); 
				else{					
					var lnk = ce('a',{href:'#'})
					var action = ("return likers.get( "+data['post']+", "+data['type_id']+")");
					lnk.setAttribute( 'onclick', action );
					var sp =ce('span',{id:'likecounts', innerHTML: counter });
					lnk.appendChild(sp);
					count.children().html(lnk);			
				}
				$(o).html('Unlike');
				o.setAttribute('onclick', "return likers.unlike(this)");
			}
			window._sendreq(data, $(o), likePlus);
		}catch(e){console.log(e);}
		return false;
	},
	unlike:function(o){
		try{
			var count  = $(o.parentNode).next().find('#likecounts') ;
			var data = $(o).data();			
			data['event'] ='unlike';
			var likeMinus= function(a,b,c){ 
				count.html( parseInt(b.count)-1); 
				$(o).html('Like');				
				o.setAttribute('onclick', "return likers.like(this)"); 
			}
			window._sendreq(data, $(o) , likeMinus);
		}catch(e){console.log(e);}
	}
}
/*
module:Friends
*/
var Friend = {
	init:function(){
		Friend.fl = ge('friends-list');
		Friends.fl.addEventListener('scroll',function(e){
			var ch = parseInt(e.target.activeElement.clientHeight);
			var ht = parseInt(e.target.activeElement.scrollHeight);
			var scrl = parseInt(e.target.activeElement.scrollTop);
			var scrld = parseInt( ((scrl+ch)/ht)*100) ;

			if(scrld > 70 && !Friend.engage && ht!=Friend.prevHt){
				Friend.engage =true;
				Friend.prevHt = ht;
				Friend.loadMore();
			}
		})
	},
	loadMore:function(){

	},
	filter:function(o){
		var inp =o;
		var url = ga(o,'data-url');
		var getList = function(s,e){	
			if(inp.value.trim().length>0 &&  (isCharKey(e.keyCode)  || e.keyCode ==KEY.DEL) )
				window._sendreq({name:inp.value}, null, s, "/"+(url?url:'findlocation')+'?type='+ga(inp,'data-type'));
			else ge('uiSelector_list').innerHTML ="";							
			uiSelector.showList();
		};
		uiSelector.init(o,{
			getList:getList, 
			onAdd:function(){},
			onRemove:function(){
				ge(ga(inp,'data-input')).value = "";
				show(ge(ga(inp,'data-wrap')));
				inp.value = "";
				ge(ga(inp,'data-choosen')).innerHTML ="";
			} 
		});
	},
	find:function(ob){
		var target = ge('find_friends_list');
		var onDone = function(a,b,c){
			var inp = ob.querySelectorAll("input,select,button");
			for(var i=0;i<inp.length;i++) inp[i].removeAttribute('disabled');
			target.innerHTML = b.html;
		}
		var onChoose = function(){
			_onChoose
		}
		ajxfrm(ob, target, onDone);
		return false;
	},
	toggleMenu:function(obj){
		var menu = gebc('friendOpt') || null;
		if(!menu) return;
		toggleDisplay(menu[0]);		
	},
	search:function(ob,tr){
		var val = ob.value;
		var trgt = ge(tr);
		var success = function(a,b,c){
			show(trgt).innerHTML=b;
		}
		window._sendreq( {'name': val}, null, success ,'/friends/search','GET' );	
		if(!Friend.inited)
			ob.addEventListener('blur',function(e){ 	hide(trgt);}, false);
		else
			Friend.inited =true;
	},
	unfriend:function(ob,id,uid){		
		var _unfriend= function(){
			var data = {'event':'unfrnd','category':'friend','fid':id};
			var success = function(a,b,c){
				var pr = ob.parentNode;
				ob.remove();
				pr.appendChild( ce('a',{href:'#',className:'hdlne',onClick:'return Friend.addFriend(this,'+uid+')',innerHTML:'Add to Friends'}) )
			};
			window._sendreq( data,$(ob), success);
		};
		var ret = msgdialog(document.body,'Unfriend','You Are Removing One of Your Friend from you Friend list.','CONFIRM',{yes:_unfriend});		
	},
	accept:function(ob,fid,frid){
		var data = {'event':'frnd_acpt','category':'friend','friend_id':frid,'fid':fid};
			var success = function(a,b,c){
				var pr = ob.parentNode;
				var btn =pr.getElementsByClassName('evt-btn')
				var ln = btn.length;
				for(var i=0;i<ln;i++) btn[ln-i-1].remove();
				pr.appendChild( ce('span',{className:'',innerHTML:'Now You are Friend'}) )
			};
			window._sendreq( data,$(ob), success);		
	},
	avoid:function(ob,id){
		var data = {'event':'unfrnd','category':'friend','fid':id};
		var success = function(a,b,c){
			var pr = ob.parentNode.parentNode;
			pr.remove();			
		};
		window._sendreq( data,$(ob), success);
	},
	addFriend:function(ob,id){
		var data = {'event':'addfriend','category':'friend','friend_id':id};
		var success = function(a,b,c){
			var pr = ob.parentNode;
			pr.innerHTML ="Request Sent"
			pr.parentNode.parentNode.remove();			
		};
		window._sendreq( data,$(ob), success);
	}
}
/*End Friends module*/
/*Onlogin*/
 onStart = {
 	birthday:function(bd){ 			 		 		
		var cdiv = ge('bootstrap'); 			
		var bddiv = ce('div',{id:'alerts'});
		var inner = bddiv.appendChild( ce('div',{className:'scroll-x'}) ). appendChild( ce('div',{className:'block'}) );
		inner.appendChild( ce('div',{className:'hdlne',innerHTML:'People Having their birthday today'}) );
		var view =inner.appendChild( ce('div',{className:'block'}) ); 			 		
		for(b in bd){
			view.appendChild( ce('div',{className:'block'}) ).appendChild( ce('img',{width:'50',height:'50',src:'/media/'+bd[b].image}) );
			view.appendChild( ce('div',{className:'block'}) ).appendChild( ce('div',{innerHTML:bd[b].name}) );
		}
		cdiv.appendChild(inner);
 	},
 	events:function(){

 	},
 	incomplete:function(inc){
		var cdiv = ge('bootstrap'); 			
		var bddiv = ce('div',{id:'alerts'});
		var inner = bddiv.appendChild( ce('div',{className:'scroll-x'}) ). appendChild( ce('div',{className:'block'}) );
		inner.appendChild( ce('div',{className:'hdlne',innerHTML:'Complete your Profile'}) );
		inner.appendChild( ce('div',{className:'block'}) ); 			 				
		var edtr = Profile.editor(inc);		
		cdiv.appendChild(inner.appendChild(edtr));
 	}, 	
 	boot:function(){
 		var success = function(a,b,c){
 			if( b.incomplete && !empty(b.incomplete) ) onStart.incomplete(b.incomplete);
 			if( b.birthday && !empty(b.birthday) ) 	onStart.birthday(b.birthday);
 		};
 		var data = {'event':'boot','category':''};
 		//window._sendreq( data, null,success);
 		onStart.suggestion();
 	} ,
 	suggestion:function(){
 		setTimeout(function(){
 			var tr = ge('left_pane_wrap');
 			if(!tr) return false;
 			var success= function(a,b,c){
 				var sug_wrap = ce('div',{id:'friendSuggestionRight',className:'block'});
 				var sugst = ce('div',{className:'hdlne _bckf8 small_padd',innerHTML:'Friend Suggestion'}); 				
 				var list = ce('div',{className:'friendSuggestionLeft'});
 				list.innerHTML = b;
 				sug_wrap.appendChild( sugst);
 				sug_wrap.appendChild(list);
 				tr.appendChild( sug_wrap ); 				
 			};
 			window._sendreq({},null,success,'/friends/suggestion','GET');
 		}, 100,false );
 	}
}
/*Endonlogin*/
Profile = {
	edit:{
		'profile_image':function(){
			var pr = ce('a',{className:'bck small_padd'});
			 sa( pr, {'data-event':'page','data-view':'prupldr','data-category':'profile','data-user':'',
			 	'onclick':"(new window.prupl()).show(this,{'title':'Upload Profile Picture'});",
			 	'data-category':'profile'});
			return pr;
		},
		'hometown':function(){},
		'cur_city':function(){},
		'phone':function(){},
		'education':function(){},
	},
	editor:function(f){
		var view = ce('div',{className:'padd_all block'});
		view.appendChild( ce('div',{className:'hdlne',innerHTML:'Update Profile '}) );
		var frm = ce('form', {action:'userprofile/edit',onsubmit:'return window.ajxfrm(this)'});
		frm.appendChild( ce('span',{id:'pl_phone',className:'placeholder small_padd',innerHTML:'Phone'}) )
		frm.appendChild( sa( ce('input',{autocomplete:'off',type:'text','name':'std_at'}), {'data-label':'pl_phone','onkeyup': "return window.autocomplete({'target':'tag_src_rsl','atc':'std_at'},this);",style:"width:200px;"} ) );
		frm.appendChild( ce('input',{type:'hidden','name':'std',id:'std_at'}) );
		frm.appendChild( ce('input',{type:'hidden','name':'tg'}) );
		frm.appendChild( ce('input',{type:'hidden','name':'ex'}) );
		frm.appendChild( ce('input',{type:'hidden','name':'fld','value':'ed'}) );
		frm.appendChild( ce('input',{type:'hidden','name':'edit'}) );		
		frm.appendChild( ce('button',{type:'submit',className:'inline-block',innerHTML:'Update' }) );
		frm.appendChild( ce('span',{id:'tag_src_rsl',className:'block tagrsl'}) );
		var frm_wrap = ce('span',{className:'block frm_wrap small_padd'});
		frm_wrap.appendChild(frm);
		view.appendChild(frm_wrap );
		return view;
	},
	loadProfile:function(id,own){
		try{
			if(own) Profile.own=true;
			else Profile.own=false;
			var render = function(a,b,c){ ge('glry-img').innerHTML+= b.html||""; };
			//setTimeout( function(){_sendreq({"event":"mtl_frnd","category":"friend","user":id},$('#profileVideoList') ); },100,false);
			setTimeout( function(){_sendreq({"event":"friends","category":"friend","user":id},$('#profileFriendList'));} ,100, false);
			setTimeout( function(){_sendreq({"event":"albums","category":"albums","user":id},null, render) },100 ,false);
			setTimeout( function(){_sendreq({"user":id},null,function(a,b,c){ge('profileVideoList').innerHTML=b.html;},"/userprofile/video_list","GET" )} ,100,false);
			setTimeout( function(){_sendreq({"user":id},null,function(a,b,c){ge('profileAlbumList').innerHTML=b.html;},"/userprofile/albums","GET" )} ,100,false);
		}catch(e){}
	},
	info:function(id){
		var data = {'event':'bs_inf','category':'pr','user':''+id};
		window._sendreq( data,null, 
				function(a,b,c){ ge('content_pane').innerHTML=b.html;},'/ajax_apis?user='+id 
			);
		return false;
	},
	more_info:function(obj,id){
		hide(obj);
		var data ={'event':'pr_inf_mr','category':'pr','user':''+id};
		window._sendreq(data,null,
			function(a,b,c){ 
				var pmv =ge('prfl_mnu_vw');
				pmv.innerHTML+=b.html;				
			Profile.enableEditing(pmv);
		});
	},
	photo:function(u){
		var onDone =function(a,b,c){ ge('content_pane').innerHTML=b.html;};
		window._sendreq({},null,onDone,'/photos?user='+u,'GET');
		return false;
	},
	enableEditing:function(pmv){
		if(!pmv) pmv = document.body;		
		var editableHmt = gebc('uiEditHometown',pmv);
		editableHmt[0]&&editableHmt[0].addEventListener('click',function(){
			if(!toggleClass(ge('hmtwn'),'hidden')){
				var hmVw = gebc('uiEditHometownView',pmv);
				if(!hmVw[0]){
					Profile.enableResidenceEdit(ge('hmtwn'),'hometown');
					addClass(ge('hmtwn'),'uiEditHometownView');
				}
			};
		});
		var editableCur = gebc('uiEditCurrentCity',pmv);
		editableCur[0]&&editableCur[0].addEventListener('click',function(){
			if(!toggleClass(ge('crcty'),'hidden')){
				var hmVw = gebc('uiEditCurrentCityView',pmv);
				if(!hmVw[0]){
					Profile.enableResidenceEdit(ge('crcty'),'cur_city');
					addClass(ge('crcty'),'uiEditCurrentCityView');
				}
			};
		});
		var editableEd = gebc('uiEditEducation',pmv);
		editableEd[0]&&editableEd[0].addEventListener('click',function(){
			var holder = ge('std_edt');
			if(!toggleClass(holder,'hidden')){
				var hmVw = gebc('uiEducationView',pmv);
				if(!hmVw[0]){
					Profile.enableEducationEdit(holder,'education');
					addClass(holder,'uiEducationView');
				}
			};
		});		
	},
	enableResidenceEdit:function(ob,type){
		var success = function(a,b,c){
			if(b.success && b.html)
				ob.innerHTML+= b.html;
				var list =gebc('uiSelector',ob );
				for(var i =0; i<list.length;i++)
					list[i].addEventListener('focus' ,function(){						
						var inp =this;
						var getList = function(s,e){							
							if(inp.value.trim().length>0 &&  (isCharKey(e.keyCode)  || e.keyCode ==KEY.DEL) )
								window._sendreq({name:inp.value}, null, s, '/findlocation?type='+ga(inp,'data-type'));
							else
								ge('uiSelector_list').innerHTML ="";							
						};
						uiSelector.init(this,{
							getList:getList, 
							onAdd:( ga(inp,'data-type')==="city"? function(){hide(ge('uiSelector_list'));show(ge('hmtwn_info_wrap'));}: function(){} ) ,
							onRemove:function(){
								ge(ga(inp,'data-input')).value = "";
								show(ge(ga(inp,'data-wrap')));
								inp.value = "";
								ge(ga(inp,'data-choosen')).innerHTML ="";
							} 
						});
						if( ga(inp,'data-type') === 'state' ) {
							uiSelector.onChoose = function(e,lbl,val){
								var ids = val.split(',');
								ge('state_id').value = ids[0];
								ge('country_input').value = ids[1];
								hide(uiSelector.input_wrap);
								uiSelector.removeList();
								uiSelector.choosen(lbl);
							};
						}
						else
							uiSelector.onChoose =null;						
					}) ;									
		};
		if(type) window._sendreq({},null,success,"/userprofile/editresidence?type="+type);
	},
	updateResidence:function(frm,opts){
		var onDone =function(a,b,c){			
			var hmt =ge('hmtwn');
			var crcty = ge('crcty');
			hmt &&addClass(hmt,'hidden');
			crcty &&addClass(crcty,'hidden');
			var hmt_vl = ge('hmtwn_vl');
			var cr_vl = ge('cr_vl');
			if(b&&b.city&&b.type==="hometown") hmt_vl.innerHTML = b.city;
			if(b&&b.city&&b.type==="cur_city") cr_vl.innerHTML = b.city;
			if(opts&&opts.onDone)
				opts.onDone(b);
		};
		if(isEmptyField(frm.hmtwn) ){
			if( ( isEmptyField(frm.city) && isEmptyField(frm.city_input)) ||( isEmptyField(frm.state)&&isEmptyField(frm.state_input) )|| isEmptyField(frm.country) )
				return false;			
		}
		window.ajxfrm(frm,null,onDone);
		return false;
	},
	enableEducationEdit:function(ob,type){		
		var success = function(a,b,c){
			if(b.success && b.html)				
				ob.innerHTML+= b.html;
				var list =gebc('uiSelector',ob );
				for(var i =0; i<list.length;i++)
					list[i].addEventListener('focus' ,function(){						
						var inp =this;
						var getList = function(s,e){							
							if(inp.value.trim().length>0 &&  (isCharKey(e.keyCode)  || e.keyCode ==KEY.DEL) ){
								if( ga(inp,'data-type') === "school") window._sendreq({name:inp.value}, null, s, '/findeducation?type='+ga(inp,'data-type'));								
								else window._sendreq({name:inp.value}, null, s, '/findlocation?type='+ga(inp,'data-type'));
							}	
							else
								ge('uiSelector_list').innerHTML ="";							
						};
						uiSelector.init(this,{
							getList:getList, 
							onAdd: function(){
								if( ga(inp,'data-type')==="school" ){
									ge('uiSelector_list').remove();
									show(ge('hmtwn_info_wrap'));
								}
								else if( ga(inp,'data-type')==="city" ){
									ge('uiSelector_list').remove();
									show(ge('hmtwn_info_wrap'));
								}
								else if( ga(inp,'data-type')==="state" ){
									ge('uiSelector_list').remove();
									show(ge('hmtwn_info_wrap'));
								}
							},
							onRemove:function(){
								ge(ga(inp,'data-input')).value = "";
								show( ge( ga(inp,'data-wrap') ) );
								inp.value = "";
								ge(ga(inp,'data-choosen')).innerHTML ="";
							} 
						});
						if( ga(inp,'data-type') === 'state' ) {
							uiSelector.onChoose = function(e,lbl,val){								
								var ids = val.split(',');
								ge('state_id').value = ids[0];
								ge('country_input').value = ids[1];
								hide(uiSelector.input_wrap);
								uiSelector.removeList();
								uiSelector.choosen(lbl);
							};
						}
						else if( ga(inp,'data-type') === 'city' ) {
							uiSelector.onChoose = function(e,lbl,val){
								var ids = val.split(',');
								ge('city_id').value = ids[0];
								//ge('country_input').value = ids[1] || 0;
								hide(uiSelector.input_wrap);
								uiSelector.removeList();
								uiSelector.choosen(lbl);
							};
						}						
						else
							uiSelector.onChoose =null;						
					}) ;									
		};
		if(type) window._sendreq({},null,success,"/userprofile/editeducation");
	},
	updateEducation:function(frm,opts){
		var onDone =function(a,b,c){
			var std =ge("std_edt");
			var upd_ed = ge('updateEducation');
			hide(upd_ed).remove();						
			addClass(std,'hidden');
			removeClass(std,'uiEducationView');
			if(b&&b.school) ge('std_vl').innerHTML = b.school;
			if(opts&&opts.onDone) opts.onDone(b);
		};
		if(isEmptyField(frm.school_name) ){
			if( ( isEmptyField(frm.city) && isEmptyField(frm.city_input)) ||( isEmptyField(frm.state)&&isEmptyField(frm.state_input) )|| isEmptyField(frm.country)
				)
				return false;			
		}		
		ajxfrm(frm,null,onDone);
		return false;
	},
	activity:function(user){window._sendreq({user:user,event:'my_act',category:'avtivity'},null,function(a,b,c){ ge('content_pane').innerHTML = b.html||"";},'/ajax_apis'); return false;},
	change_profile:function(ob){ (new window.prupl()).show(ob,{'title':'Upload Profile Picture'}); },
	birthday:function(){
		var bday_wrap = ge('birthday_edit_form');
		var bday_date = ge('birthday_edit');		
		var dp = ge('bday_datepicker') || null;
		if(!dp)DatePicker(bday_date,'bday');
		toggleDisplay(bday_wrap);
	}	
}

function isEmptyField(inp){
	if(inp && inp.value.trim().length>0)
		return false;
return true;
}

var uiSelector = {
	init:function(ob,opts){
		var src = ob;
		uiSelector.src = src;	
		uiSelector.input_wrap = ge(ga(src,'data-wrap'));		
		uiSelector.input = ge(ga(src,'data-input'));
		uiSelector.label = ge(ga(src,'data-label'));
		uiSelector.choosen_wrap = ge(ga(src,'data-choosen'));
		uiSelector.list_wrap = ge(ga(src,'data-list') ) || gebc( 'uiSelector_list',uiSelector.input_wrap )[0] ;
		if(!uiSelector.list_wrap){
			uiSelector.list_wrap = ce('div',{id:'uiSelector_list', className:'uiSelector_list _bckf8'}) ;
			uiSelector.input_wrap.appendChild(uiSelector.list_wrap );
		}
		uiSelector.src.addEventListener('keyup',uiSelector._getList);		
		uiSelector.src.addEventListener('blur', function(){ });
		uiSelector.onChoose = opts.onChoose || null;//function(){};
		uiSelector.onRemove = opts.onRemove || null;//function(){};		
		uiSelector.onAdd = opts.onAdd || function(){};		
		uiSelector.getList = opts.getList;
		console.log('attached to uiSelector');
	},
	_getList:function(e){		
		var success = function(a,b,c){
			if((b.found||b.success) && b.html){
				uiSelector.list_wrap.innerHTML= b.html;
				uiSelector.showList();
			}
		};
		if(uiSelector.getList)
			uiSelector.getList(success,e);
	},
	showList:function(){
		var list = gebc( 'uiSelectorItem',show(uiSelector.list_wrap) );	
		for(var i=0 ;i<list.length;i++){
				function select(l,e){ 
					var lbl = ga(l,'data-lbl');
					var val = ga(l,'data-val');
					if(uiSelector.onChoose) uiSelector.onChoose(e,lbl,val);
					else uiSelector._onChoose(e,lbl,val);
				}
				list[i].addEventListener('click',function(e){select(this, e);});				
		};		
		var list = gebc( 'uiSelectorItemAdd', show(uiSelector.list_wrap) )[0];
		list&&list.addEventListener('click',uiSelector.onAdd);
	},
	removeList:function(){
		uiSelector.list_wrap.remove();
	},
	_onChoose:function(e,label,val){
		hide(uiSelector.input_wrap);
		uiSelector.input.value =  val;
		uiSelector.removeList();
		uiSelector.choosen(label);	
	},
	choosen:function(label){
		var selected = ce('div',{className:'uiSelectorItemChoosen lbw'});
		selected.appendChild( ce('div',{innerHTML:label,className:'uiSelector uiItemLabel'}) );
		var clse_btn = ce('a',{href:'javascript:void(0);',innerHTML:'x',className:'uiSelector uiRemove'});
		clse_btn.addEventListener('click', uiSelector.onRemove||uiSelector._onRemove);
		selected.appendChild(clse_btn);
		show(uiSelector.choosen_wrap).appendChild( selected );
	},
	_onRemove:function(){
		uiSelector.input.value = "";
		show(uiSelector.input_wrap);
		uiSelector.src.value = "";
		uiSelector.choosen_wrap.innerHTML ="";		
	},
	_onAdd:function(){		
		hide(uiSelector.input_wrap);		
		uiSelector.choosen( uiSelector.src.value ||"" );
		uiSelector.removeList();
		if(uiSelector.onAdd)
			uiSelector.onAdd();
	}
}

Feeds ={
	loadMore:function(src,opt){
		var success = function(a,b,c){
			if(b && b.end&&src&&src.parentNode) src.parentNode.remove();
			var tr = gebc('posts-list',ge('main_content'))[0] ;
			if(!tr)return;
			if(opt&&opt.page === 0)
				tr.innerHTML=b.html? b.html :"";
			else
				tr.innerHTML+=b.html? b.html :"";
			Feeds.page++;
			Feeds.engage =false;
		};
		var params={};	
		
		params['type']=(opt &&opt.type) || Feeds.type || "";
		if(opt)	params['page']= opt.page ;	else params['page'] = Feeds.page;
		window._sendreq( params,null,success,'/more_feeds','GET');
	},
	init:function(ts){
		if(Feeds.inited) return;
		Feeds.page = 0;
		Feeds.prevHt =  parseInt(document.body.offsetHeight);
		Feeds.engage =false;
		Feeds.timestamp = ts;
		var scroll_feed = function(e){
			var ch = parseInt(e.target.activeElement.clientHeight);
			var ht = parseInt(e.target.activeElement.scrollHeight);
			var scrl = parseInt(e.target.activeElement.scrollTop);
			var scrld = parseInt( ((scrl+ch)/ht)*100) ;

			if(scrld > 70 && !Feeds.engage && ht!=Feeds.prevHt){
				Feeds.engage =true;
				Feeds.prevHt = ht;
				Feeds.loadMore();
			}
		}
		setTimeout(document.addEventListener('scroll',scroll_feed),100 ) ;
		setTimeout( Feeds.daemon(),100,false);
		Feeds.inited =true;
		Feeds.loadMore();
	},
	newFeeds:function(){
		var onDone = function(a,b,c){
			Feeds.timestamp = b.timestamp || 0;
			var fpl = gebc('posts',ge('postlist'))[0];
			insertBefore( b.html||"", fpl);
			Feeds.daemon();
		};
		//setTimeout(window._sendreq({},null, onDone,'/newFeeds?timestamp='+Feeds.timestamp,'GET') ,100);
	},
	remove:function(o,pid,_type){
		var onDone = function(a,b,c){
			if(a.success) $(o.parentNode.parentNode.parentNode).fadeOut(300, function(){ this.remove();});
		};		
		var onError= function(a,b,c){
			if(a.error) console.log(a.message);
		}
		_sendreq({post:pid,user: fook.user.id,type:_type},null,onDone,'/post/remove',null,onError);
	},
	daemon:function(){	setTimeout( function(){Feeds.newFeeds();}, 3000,false );	},
	edit:function(src,id){
		var wrap = ce('div',{className:'block'});
		wrap.appendChild( ce('div',{}) );
		wrap.appendChild( ce('textarea',{className:''}) )
		wrap.appendChild( ce('a',{innerHTML:'Save',className:'btn',href:'javascript:void(0)'}) );
		src.appendChild(wrap);
	},
	filter:function(ob,type){
		var active = gebc('active',ob.parentNode);
		for(var i=0;i<active.length;i++) removeClass(active[i],'active');
		addClass(ob,'active');
		Feeds.type= type;
		Feeds.loadMore(null,{page:0});
		return false;
	}
}
var Message ={
	init:function(src){
		if(Message.inited) return;
		Message.src= src;		
		var opts = {
			getList:function(success,e){
				console.log(uiSelector.list_wrap);
				var val = src.value || "";
				if(val.length>0) window._sendreq({name:val},null,success,'/messages/getrecievers');
			},
			onChoose:function(e,l,v){
				e.preventDefault();
				hide(uiSelector.input_wrap);
				uiSelector.input.value =  v;
				uiSelector.removeList();
				uiSelector.choosen(l);	
			}
		};
		uiSelector.init(src,opts);
		Message.inited =true;
	},
	listFriend:function(ob,id){
		var recvr = ge('reciever');
		var name = ob.value;
		Message.mention(name);
	},
	mention:function(name){
		if(!name) return;
		var ln =name.length;
		var val = name;//[ln-1].substr(1,name[ln-1].length);
		var trgt = ge('recvList_wrap') ||  ge('recvlst').appendChild(ce('div',{id:'recvList_wrap',style:'position:absolute;'}) )  ;
		var success = function(a,b,c){
			if(b.html&&b.found) show(trgt).innerHTML=b.html;
			else hide(trgt);
		}
		window._sendreq( {'name': val}, null, success ,'/messages/getrecievers' );	
	},
	addMention:function(ob){
		hide(ge('recvlst')).innerHTML ="";
		var data = {'username':ga(ob,'data-username'), 'id':ga(ob,'data-id'), 'name': ga(ob,'data-name')};
		var mention_list = ge('reciever');
		var mention_ids = mention_list.value || "";
		if(mention_ids.trim().length>0){
			var mids = JSON.parse( mention_ids );
			mids[ '@'+data['username'] ] = data['id'];
			mention_list.value =  JSON.stringify(mids) ;
		}else{
			var ob ={ };
			ob[ '@'+data['username'] ] = data['id'];
			mention_list.value = JSON.stringify(ob) ;
		}
		var mw = ge('mention_wrap') || ce('div',{id:'mention_wrap',className:'block lbw'});
		var newmen = ce('div', {className:'mention inline-block'}); sa(newmen,'data-men',data['id']+"");
		var newmen_label = ce('div',{className:'inline-block small_padd'});
		newmen_label.appendChild( ce('div',{innerHTML:"<b>"+data['username']+"</b>",className:'inline-block'}) );
		var newmen_close = ce('a',{href:'#',className:'inline-block  small_padd'}); 	
		newmen_close.appendChild( ce('b',{innerHTML:'x'}) );
		sa(newmen_close,'onclick',"PostTextBOX.removeMention("+data['id']+")"); 
		newmen.appendChild( newmen_label );
		newmen.appendChild( newmen_close );
		mw.appendChild( newmen );
		PostTextBOX.txt_bx_wrap.appendChild( mw );
	},
	send:function(msg){

	}
}

function syncTime(el,t){
		this.el =el;
		this.t =parseInt(t);
		this.sync();
};
syncTime.prototype = {
	constructor:syncTime,
	sync:function(){
		var t = this.t;
		var el =this.el;
		var self = this;
		setTimeout(function(){
			self.t=++t;
			if(t>=60) t =  parseInt(self.t/60);				
			el.innerHTML="<small>"+t+(self.t>60?"h":"m")+"</small>";
		self.infinite();
		},60*1000,false);		
	},
	infinite:function(){this.sync();}
};

function initPage(){
	var topBar_wrap = ce('div',{className:'topbar-wrapper'});
	var topbar =ce('div',{className:'topbar'});
	var search_pane = ce('div',{id:'search_pane', className:'inline-block'});	
	topbar.appendChild( ce('div',{innerHTML:'<a href="/home">Home</a>',className:'inline-block heading'}) ) ;
	topbar.appendChild( ce('div',{innerHTML:'<b>'+fook.user.name+'</b>',className:'inline-block' }) );
	topbar.appendChild(search_pane);
	topbar.appendChild( ce('div',{innerHTML:"<a href='/logout'>Logout</a>",className:'inline-block heading'}));
	topbar.appendChild( ce('div',{innerHTML:"<a href='#help'>Help</a>",className:'inline-block heading'}) );
	topbar.appendChild( ce('div',{innerHTML:"<a href='#about'>About</a>",className:'inline-block heading'}) );	
	topBar_wrap.appendChild(topbar);

	var search_input = ce('input',{type:'text',id:'search-bar',className:'ui-autocomplete-input'});
	search_pane.appendChild( search_input );
	search_pane.appendChild( ce('div',{id:'result_wrap'}));
	sa(search_input,'autocomplete','off');
	sa(search_input,'placeholder','Search People , Place, Page etc.');
	sa(search_input,'type','text');
	var viewport = ce('div',{className:'main'});
	var drishya = ce('div',{className:'drishya'});
	var left_pane = ce('div',{id:'left_pane'});
	var madhya = ce('div',{className:'madhya'});

	var pageHdr = ce('div',{className:'',id:'page-header'});
	var cntmenu = ce('div',{id:'center_div'});
	cntmenu.appendChild(headerMenu());
	madhya.appendChild( pageHdr );

	pageHdr.appendChild(cntmenu);
	setTimeout( function(){
		var md = gebc('madhya')[0];		
		var rp = ge('rightPane');
		if(!md || !rp) return;
		var lft =md.offsetLeft ;
		var wd = md.offsetWidth;
		rp.style.left = parseInt(lft)+parseInt(wd)+'px';
		rp.style.top = '50px';
	}, 100,false);

	var footer = ce('div',{id:'ftr',className:'footer_wrap border-all'});
	var rightPane = ce('div',{id:'rightPane'});
	rightPane.appendChild( ce('div',{id:"right_wrap",className:"border-all small_padd"}) );
	viewport.appendChild(drishya);
	drishya.appendChild(left_pane);
	drishya.appendChild(madhya);
	drishya.appendChild(rightPane);
	document.body.appendChild(topBar_wrap);
	document.body.appendChild(viewport);
}

function headerMenu(){
	var menu  =  ce('div',{id:'menu',className:'heading  border-all'}) ;
	var menuMap = [
		{'id':'nav_home',href:'/home',label:'News'},
		{'id':'nav_profile',href:'/profile',label:'Profile'},
		{'id':'nav_gallery',href:'/gallery',label:'Gallery'},
		{'id':'nav_friends',href:'/friends',label:'Friends'},		
		{'id':'nav_messages',href:'/messages',label:'Message'},		
		{'id':'nav_videos',href:'/videos',label:'Videos'},		
		{'id':'nav_music',href:'#music',label:'Music'},		
		{'id':'nav_page',href:'#/Pages',label:'Pages'},		
	];
	var i,len = menuMap.length;

	for(i=0;i<len;i++){
		var menu_item = ce('div',{className:'inline-block'});	
		var mn = ce('div',{className:'mn_bx'});
		mn.appendChild(ce('a',{href:menuMap[i].href,'id':menuMap[i].id,innerHTML:menuMap[i].label}) );
		menu_item.appendChild(mn);
		menu.appendChild( menu_item );
	}
	return menu;

}

var Settings = {
	view:function(src){
		
	},
	changePass:function(src){
		var onDone=function(a,b,c){};		
		if(src.new_pass.value === src.confirm_pass.value){
			window.ajxfrm(src,'',onDone);
		}
		else
			window.msgdialog('Invalid Password',"Passwords does not match.");
		return false;
	},
	changeUsername:function(src){
		if(src.username.value === ga(src.username,'data-username') )return false;
		var onDone = function(a,b,c){};		
		window.ajxfrm(src,'',onDone);
		return false;
	},
	blockUser:function(src){
		var onDone = function(a,b,c){};
		window.ajxfrm(src,'',onDone);
		return false;
	},
	unblock:function(src){
		var onDone = function(a,b,c){};
		window.ajxfrm(src,'',onDone);
		return false;
	}
};

var Player = {

	play:function (src){
		if(!src)return;
		var token = ga(src,'data-vid');			
		var wrap = ce('div',{className:'player-wrap lbw',id:'player-wrap'});
		var info = ce('div',{className:'info',id:"video_info"});
		var pl = ce('div',{className:'player',id:'player'});			
		wrap.appendChild(pl);
		info.appendChild(wrap);			
		wrap.appendChild( Player.createView() );
		var ph = new ph_viewer(this,{});
		ph.show();
		ph.set_content(info);

		$(pl).jPlayer({
			ready: function () {
				console.log('player is ready');					
				$(this).jPlayer("setMedia", {						
					m4v: "http://127.0.0.1/get?token="+token,
					flv: "http://127.0.0.1/get?token="+token,
				});			
			},
			timeupdate:function(e){},
			swfPath: "{{STATIC_URL}}js/jplayer",
			solution: "html,flash",
			supplied: "m4v",
			wmode: "window",
			useStateClassSkin: true,
			autoBlur: false,
			smoothPlayBar: true,
			keyEnabled: true,
			remainingDuration: true,
			toggleDuration: true,
			errorAlerts:true,
			cssSelector: { play: ".jp-play",pause: ".jp-pause",stop: ".jp-stop",seekBar: ".jp-seek-bar",playBar: ".jp-play-bar",}
		});			
		
	},
	createView:function(){
		function a(){
			var _player = [{
				tag:'div',class:'jp-video',attr:{id:'jp_container_1'},
				child:[{
					tag:'div',class:'jp-type-single',
					child:[
						{tag:'div',class:'jp-jplayer',attr:{id:'jquery_jplayer_1'},},
						{tag:'div',class:'jp-gui',
							child:[
								{tag:'div','class':'jp-video-play',
									child:[{tag:'button',class:'jp-video-play-icon',innerHTML:'play'}] },
								{tag:'div',class:'jp-interface',
									child:[{
										tag:'div',class:'jp-progress',
										child:[{tag:'div',class:'jp-seek-bar',child:[{tag:'div',class:'jp-play-bar'}]}]
									},
									{tag:'div',class:'jp-current-time'},{tag:'div',class:'jp-duration'},
									{tag:'div',class:'jp-details',child:[{tag:'jp-title'}]},
									{tag:'div',class:'jp-controls-holder',
										child:[
											{tag:'div',class:'jp-volume-controls',
												child:[
													{tag:'button',class:'jp-mute'},
													{tag:'button',class:'jp-volume-max'},
													{tag:'div',class:'jp-volume-bar',
														child:[{tag:'div',class:'jp-volume-bar-value'}]
													}
												]
											},											
										{tag:'div',class:'jp-controls',
											child:[												
												{tag:'button',class:'jp-play'},
												{tag:'button',class:'jp-stop'},
											]
										},{tag:'div',class:'jp-toggles',child:[{tag:'button',class:'jp-full-screen'}]}]
									}
									]
								},
								{tag:'div',class:'jp-no-solution',innerHTML:'<span>Update Required</span>To play the media you will need to either update your browser to a recent version or update your <a href="http://get.adobe.com/flashplayer/" target="_blank">Flash plugin</a>.'}
							]
						}
					]
				}]
			}];
			return b(_player);
		}
		function b(map,parent){
			var i=0,len=map.length,el;
			for(i=0;i<len;i++){
				var current = ce(map[i].tag);			
				map[i].class && sa(current,'class',map[i].class);				
				for(var j in map[i].attr) sa(current,j+"" , map[i].attr[j]);				
				if(map[i].innerHTML)
					current.innerHTML = map[i].innerHTML;
				if(map[i].child) b(map[i].child,current);
				if(!el)el=current;
				else if(!parent) parent =el;
				parent&&parent.appendChild( current );
			}
			return el;			
		}
		return a();
	}
};


var Video = {
	init:function(){

	},
	upload:function(ob){
		try{
			var success=function(a){
				var input =gebt('INPUT',ob),btn = gebt('BUTTON',ob);
				if(input.length) for(var i=0;i<input.length;i++){input[i].removeAttribute('disabled');}
				if(btn.length) for(var i=0;i<btn.length;i++) {input[i].removeAttribute('disabled');}
				var ph = (new ph_viewer(null,{'title':'Add Video Title'}));
				console.log(a.html);
				ph.show();
				ph.set_content(a.html);				
			};
			var error=function(a,b,c){ msgdialog(this,"Video upload Error"," Error While uploading Vedio.","ERROR"); }
			var opts = {'success':success,'error':error,
				"status":ge('vid_upl_status'),
				"progress":ge('vid_progress'),'form':ob,'video':true};
			var upld = (new uploader(ob.video, opts));
			upld.start();
		}catch(ex){console.log(ex); }
		return false;
	},
	info:function(){obj,opt},
	remove:function(vid,e){
		e.preventDefault();
		if(!vid)return;
		var onSuccess = function(a,b,c){			
			ge('video_'+vid).remove();
		};
		var onError = function(a,c){ console.log("Error Occred "+JOSN.stringify(a)+JSON.stringify(c));}		
		var ret = msgdialog(document.body,'Remove Video','You Are Removing Video.','CONFIRM',{yes: function(){_sendreq({'vid':vid},null,onSuccess,'/video/remove',null,onError);} });				
	},
	like:function(){},
	comment:function(){},
	watch:function(){},
	related:function(){},
	search:function(){},
	report:function(){},
	selectFile:function(){
		if(!Video.inited){
			ge('vid_file').addEventListener('change',function(){ 
				var form =ge('vid_upload_form');
				Video.upload( form ); 
			}); 
			Video.inited=true;
		}
		ge('vid_file').click();
	}
}



/**/
function rand(mi, ma) { return Math.random() * (ma - mi + 1) + mi; }
function irand(mi, ma) { return Math.floor(rand(mi, ma)); }
function isFunction(obj) {return Object.prototype.toString.call(obj) === '[object Function]'; }
function isArray(obj) { return Object.prototype.toString.call(obj) === '[object Array]'; }
function isObject(obj) { return Object.prototype.toString.call(obj) === '[object Object]'; }
function isEmpty(o) { if(Object.prototype.toString.call(o) !== '[object Object]') {return false;} for(var i in o){ if(o.hasOwnProperty(i)){return false;} } return true; }
function now() { return +new Date; }
function image() { return window.Image ? (new Image()) : ce('img'); } // IE8 workaround
function trim(text) { return (text || '').replace(/^\s+|\s+$/g, ''); }
function stripHTML(text) { return text ? text.replace(/<(?:.|\s)*?>/g, '') : ''; }
function escapeRE(s) { return s ? s.replace(/([.*+?^${}()|[\]\/\\])/g, '\\$1') : ''; }

function winToUtf(text) {
  return text.replace(/&#(\d\d+);/g, function(s, c) {
    c = intval(c);
    return (c >= 32) ? String.fromCharCode(c) : s;
  }).replace(/&quot;/gi, '"').replace(/&lt;/gi, '<').replace(/&gt;/gi, '>').replace(/&amp;/gi, '&');
}
function replaceEntities(str) {
  return se('<textarea>' + ((str || '').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')) + '</textarea>').value;
}
function clean(str) {
  return str ? str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;') : '';
}


/**/
var emo={
	visible:false,
	init:function(){	 
	 if(emo.inited) return ;
	 $('#emo_wrap a').on('click',function(e){	 	
	 	var txt = $(this).data('text');
	 	PostTextBOX.init();
	 	PostTextBOX.txtbox[0].value+=txt+" ";
	 	e.preventDefault();
	 })
	emo.inited=true;
	},	
	toggle:function(o){
		emo.init();
		if( !emo.visible) show(ge('emo_list'));
		else hide( ge('emo_list') );
		emo.visible =!emo.visible;
	}
}
/**/
