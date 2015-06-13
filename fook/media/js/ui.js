var content_menu ={
	active:null,
	init:function(){
		this.menu_el = $('#cnt_mnu a');
		this.trg =ge('main_content');		
		this.menu_el.bind('click', this.get_content );
		console.debug(' navigation_menu initialised ' );
	},
	set_content:function(a,b,c){
		content_menu.trg.innerHTM = b||"";
	},
	get_content:function(e){
		return true;
		if( content_menu.active!=null && content_menu.active == e.target  ) return false;		
		if( content_menu.active == null  )
			content_menu.active = e.target;						
		else
			removeClass(content_menu.active.parentNode,'nav_active');		
		content_menu.active = e.target;					
		content_menu.nav_link= e.target.getAttribute('href');		
		sa(e.target.parentNode,'class','nav_active');
		window._sendreq( null , null, content_menu.set_content , content_menu.nav_link, method='GET');		
		e.defaultPrevented =true;
		return false;
	},
	complete:function(){

	}
}
content_menu.init();


var khoji ={
	current:{},
	result:{},
	active:null,
	init:function(){
		this.el =  ge('search-bar');		
		this.pane = ge('search_pane');
		this.el.addEventListener('keyup', this.keyUpHandle);
		this.el.addEventListener('focus', this.focus);
		this.el.addEventListener('click', this.focus);
		this.pane.addEventListener('blur', this.blur);		
		this.trg = ge('result_wrap');	
		this.wrap = ge('result_wrap_outer');
		this.q = null;
		this.type = '';
	},
	keyUpHandle:function(e){		
		switch(e.keyCode){
			case KEY.UP:
			case KEY.DOWN:khoji.navigate(e.keyCode);break;
			case KEY.ESC: khoji.blur();break;
			case KEY.ENTER:if(khoji.active !=null)khoji.active.find('a').trigger('click') ;break;
			default: 
				if( khoji.q != khoji.el.value&& khoji.el.value.length >1){
					khoji.q = khoji.el.value;
					khoji.getList( khoji.el.value );
				}
				else{hide(khoji.trg);}
		}
	},
	video:function(){
		console.log(khoji.el.value);
		if(khoji.el.value.length>1) nav.open('/search?type=video&q='+khoji.el.value);
	},
	people:function(){
		if(khoji.el.value.length>1) nav.open('/search?type=people&q='+this.el.value);
	},
	music:function(){},
	focus:function(e){show(khoji.wrap); khoji.pane&&sa(khoji.pane,'class',"active");},
	blur:function(e){hide(khoji.wrap);khoji.pane&&removeClass(khoji.pane,"active");khoji.pane.blur();},
	navigate:function(key){		

		if( khoji.active ==null  )
		{			
			if(gebc( 'search-results',ge('result_wrap')).length>0){				
				khoji.active = $('#result_wrap .search-results #rslt_item:eq(0)');
				khoji.active.addClass('nav_active');
			}
			return true;
		}
		if( key == KEY.UP ){
			khoji.active.removeClass('nav_active');
			khoji.active = khoji.active.prev().size()>0 ? khoji.active.prev() : khoji.active ;
			khoji.active.addClass('nav_active');
		}
		else if(key ==  KEY.DOWN){
			khoji.active.removeClass('nav_active');
			khoji.active = khoji.active.next().size() >0 ? khoji.active.next() : khoji.active ;
			khoji.active.addClass('nav_active');
		}
	},
	set_content:function( result ){
		khoji.active=null;
		this.trg.innerHTML= result;
		show(this.wrap);
		show(this.trg);
	},
	getList:function(q){
		var val = q.trim();
		if(q)	window._sendreq({'q':q}, null, function(a,b,c){ khoji.set_content(b);} , '/search','GET' );					
	},
}

khoji.init();

var browser ={}

var ph_viewer =  function ph_viewer(id,opts){	
		this.obj = typeof(id) == 'string' ? $(id) : $(id);
		this.href = opts.href||"";
		this.title =opts.title || "";
		this.content = opts.content;
		this.data = this.obj.data();			
		this.images = [];			
		this.act_img = null;
		this.contentloaded = opts.contentloaded;
		this.nav = opts.nav;		
}


function viewPhoto(src,opts){
	var ph =new window.ph_viewer(this,{'title':'' });
	ph.show( );	
	var data ={'event':'im_vw',category:'image'};
	if(opts&&opts['type']) data['type'] = opts['type'];
	if(opts&&opts['user']) data['user'] =opts['user'];
	if(opts&&opts['al']) data['al'] = opts['al'];
	if(opts&&opts['post']) data['post'] = opts['post'];	
	window._sendreq(data, ph, ph.rn_vw );
	 /*data-category="gallery" data-event="im_vw" ;data-al="{{post.profile_image.id}}" data-title="xxxxx" 
	data-user="{{uid}}" data-type="109979992"*/

}



ph_viewer.prototype = {
	constructor:ph_viewer,
	
	rn_vw:function (obj,d,c){
		console.log('setting content...');
		obj.set_content(d);	
	},
	load: function(callback){		
		window._sendreq(this.data, this, this.rn_vw );
		this.contentloaded = callback;
	},
	set_title: function(title){
		$('#ph_wrap #_title span').text(this.title);
	},
	set_content:function(content,callback){				
		$('#ph_wrap #_content span').html( content);
		console.log('contentloaded ...');

		if(typeof this.contentloaded == 'function' || typeof this.contentloaded == 'string') {			
			eval(this.contentloaded);					
		}
	},	
	_photoviewer:function(i){
		console.log('_photoviewer ...');
		this.images = $('#ph_wrap #_content [id^=im_ls]');
		$('#ph_wrap #_content #im_ls'+i).removeClass('hidden');
		this.act_img = $('#ph_wrap #_content #im_ls'+i);

		//$('#ph_wrap #_content').append("<div class='nav_btn'><button class='prv-btn label ui-icon ui-icon-triangle-1-w padd_all' title='Previous'></button><button class='nxt-btn label ui-icon ui-icon-triangle-1-e padd_all' title='Next'></button></div>");

		//$('#ph_wrap #_content button.prv-btn').bind('click',this,this.prev );
		//$('#ph_wrap #_content button.nxt-btn').bind('click',this, this.next);		
	},
	prev:function(e){	
		var ob = e.data;
		var prev = ob.act_img.prev();
		if(prev.length > 0 ){
			ob.act_img.addClass('hidden');
			prev.removeClass('hidden');
			ob.act_img = ob.act_img.prev();
		}		
	},
	next:function(e){		
		var ob = e.data;
		var next =ob.act_img.next();
		if(next.length > 0)		{
			ob.act_img.addClass('hidden');
			next.removeClass('hidden');
			ob.act_img = ob.act_img.next();
		}
	},	
	show: function(callback){
		var ph_wrap = ce('div', {id:'ph_wrap'});
		var ct_p=  ce('div',{id:'cntr-panel',className:'cntr-white '});
		if(this.title)
			ct_p.appendChild( ce('div', {id:'_title'}).appendChild( ce( 'span', {className:'title',innerHTML: this.title} ) ) );
		var bar = ce('div',{className:'lbw'});
		sa(bar,'style','height:20px;')
		var clsebtn = ce('i',{id:'close_btn',className:'label',style:'cursor:pointer;z-index:100',innerHTML:'close'});
		bar.appendChild(clsebtn);
		ct_p.appendChild( clsebtn );
		cnt = ce('div',{id:'_content'});
		cnt.appendChild( ce('span') );
		ct_p.appendChild( cnt );
		ph_wrap.appendChild(ct_p);
		var full_scrn = ce('div',{className:'full-scrn',id:'_photoviewer'});
		ph_wrap.appendChild( full_scrn );
		document.body.appendChild(ph_wrap);
		$('#ph_wrap #cntr-panel').css({'position':'fixed','left':(wd/5),'top':(ht/10) });
		document.body.style.overflow='hidden';
		clsebtn.addEventListener('click', function(){
			document.body.style.overflow='auto';
			ph_wrap.remove();
		});
		full_scrn.addEventListener('click',function(e){
			console.log("----");
			ph_wrap.remove();
			e.preventDefault();
		});
		if(typeof callback == 'function')callback.call();
	},
	appendContent:function(html){
		$('#ph_wrap _content').append(html);
	}
};

window.ph_viewer = ph_viewer;


var showProfileUploader = function profile_uploader(){
}

showProfileUploader.prototype = {
	constructor:showProfileUploader,

	_init: function(obj,opts){		
		var ph =new ph_viewer(obj, opts);
		ph.show();
		ph.load();
	},
	show: function(obj,opts){
		this._init(obj,opts);
	}
}
window.prupl = showProfileUploader;

/************UI_helpers ***********/
function friend_selector(sl,h,w){

}

function image_uploader(obj,opt){
	this.on_success=opt.success;
	this.on_error =opt.error;
	this.form = opt.form;
	this.count =0;
	this.complete =0;		
	this.obj = obj;
	this.status = $(opt.status);
	this.files= this.obj.files;
	this.total = this.files.length;		
	this.upl_img = $(opt.img_thumb);
	this.progress = opt.progress;
	this.url = opt.url;
	this.video = opt.video || null;
	this.opt = opt;	
	this.data = opt.data;
}

	image_uploader.prototype={
	
	constructor:image_uploader,

	upload:function(file,index){
		var fd =  new FormData(  );
		var upl_trgt = this.upl_img;		
		if(this.video) fd.append('video', file);		
		else if(typeof(file) !='undefined'){	
			if(this.obj) fd.append( this.obj.name, file );
			else fd.append('file', file);
			fd.append('id',index);
		}
		if(this.form)$.each(this.form.elements,function(i,v){fd.append(v.name, v.value);});
		for(var i in this.data) fd.append( i, this.data[i] );
		var obj = this;		
		var sp = ce('span');
		sp.setAttribute('id','upl_sts'+index);
		sp.setAttribute('class','upl-sts border-all');
		upl_trgt.append(sp);
		_url = ( this.form && (this.form.action) ) ? this.form.action  : ( this.url ? this.url :'/upload_image/') ;

		$.ajax({
			url :_url,			
			type:'POST',
			data:fd,
			processData:false,
			contentType:false,
			beforeSend: function(xhr, settings){										
				if(!csrfSafeMethod(settings.type) && !this.crossDomain){						
					csrftoken = getCookie('fooktokencsrf');
					csrftoken = csrftoken.substr(csrftoken.indexOf("=")+1 );							
					xhr.setRequestHeader('X-CSRFToken',typeof(csrftoken)=='undefined'?'':csrftoken)
				}
			},
			xhr: function(){				
				try{
					var _xhr =  $.ajaxSettings.xhr();

					if( _xhr.upload)
						_xhr.upload.addEventListener('progress', function(e){
							e.callback = (typeof(obj.progress) =='undefined') ? obj.onprogress   : obj.progress ;
							e.params = $(sp);
							obj.UploadProgressHandler(e);
						});											
				}
				catch(e){
					console.log("error"+e);
				}
				return _xhr;
			},
			success:function(d){
				obj.complete = parseInt(obj.complete)+1;
				obj.count =parseInt(obj.count)-1;
				if( obj.complete< obj.total) obj.start();
				if(typeof sp != 'undefined') sp.remove();
				if(typeof(obj.on_success) =='undefined') {upl_trgt.append(d);}
				else obj.on_success(d,obj.opt);
			},
			error:function(d){
				if(obj.error) obj.error(d);
			}
		});

	},
	onprogress:function(v,per){
		v.html( parseInt(per)+"% uploaded" );
	 	if(per>=100) v.remove();	 				 	
	},
	UploadProgressHandler:function(e){
	 setTimeout( function(){
	 	if(e.lengthComputable) {
	 		var per  = (parseInt(e.loaded) / parseInt(e.total) ) *100;	 		
	 		if(typeof(e.callback) =='function') e.callback(e.params, per);
	 	}
	 }, 100)	;
	},
	start: function(){
		var index = parseInt(this.complete)+ parseInt(this.count);
		
		if(this.count<3 && this.complete< this.total && this.total >index ){
			this.upload(this.files[  index ], index);
			this.count = parseInt(this.count) +1;
			this.start();
		}
	},
};

window.uploader = image_uploader;

var prupldr=function prupldr(obj,opts){
	this.obj = typeof(obj) == 'string' ? $(obj) : obj ;
     this.opts = opts;     
     this._init();
}	
prupldr.prototype ={
	constructor:prupldr,
	_init: function(){
		this.opts.success = this.success;
		var prup = new window.uploader(this.obj, this.opts);
		prup.start();
	},
	success:function(d,opt){				

			if(opt && opt.target ){
				var ph= ge(opt.target);
				if(d.html && ph.innerHTML)ph.innerHTML = d.html ;		
			}
			ge('ph_wrap').remove();		
	},
	progress:function(v,per){

	}
}
window.prupldr = prupldr;

var DatePicker = function(o,name){
	var m = ce('select',{name:name+"_month"});
	var d = ce('select',{name:name+"_day"});
	var y = ce('select',{name:name+"_year"});		
	var month_list = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
	var date_list = [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,2,25,26,27,28,29,30,31];	
	cur_yr =  new Date().getFullYear();
	var yr_list = [];
	var c=0;
	for(var i= cur_yr-80;i<cur_yr-15; i++) yr_list[ c++] = i;
	
	var t=null;
	for(var i=0;i<month_list.length; i++)
		{var t= ce('option',{value:i+1, innerHTML:month_list[i]}); m.appendChild(t);}

	for(var i=0;i<date_list.length; i++)
		{var t= ce('option',{value:i+1, innerHTML:date_list[i]}); d.appendChild(t);}
	for(var i=0;i<yr_list.length; i++)
		{var t= ce('option',{value:yr_list[i], innerHTML:yr_list[i]}); y.appendChild(t);}

	var div = ce('div',{className:'block',id:name+'_datepicker'});
	div.appendChild(m);
	div.appendChild(d);
	div.appendChild(y);
	o.appendChild(div);
}

//Object.prototype.stringify =function(){return  JSON.stringify(this);}

window.DatePicker = DatePicker;

var PostTextBOX ={
	init:function(ob){
		if( PostTextBOX.inited && PostTextBOX.inited)return false;
		PostTextBOX.src= $(ob);	
		PostTextBOX.txtbox = $('#post-description');
		PostTextBOX.txt_bx_wrap = ge('txt_bx_wrap');
		PostTextBOX.placeholder = ge('pl_postBox');
		PostTextBOX.buttons = PostTextBOX.src.next().find('.post-button');
		PostTextBOX.attached = ge('attached');
		PostTextBOX.txtbox.bind('click', PostTextBOX.onclick);
		PostTextBOX.src.bind('focusin', PostTextBOX.focusin);
		PostTextBOX.src.parent().bind('focusout', PostTextBOX.focusout);		
		console.log('PostTextBOX initialise');
		PostTextBOX.file = ge('post_attachment');		
		PostTextBOX.file.addEventListener('change', PostTextBOX.select_file );						
		PostTextBOX.onclick();
		PostTextBOX.max_attach = 5;		
		PostTextBOX.inited =true;
	},
	focusin:function(e){
		if( PostTextBOX.buttons.css('display') == 'none')
			PostTextBOX.buttons.show();
	},
	focusout:function(e){
		if( PostTextBOX.txtbox.val().trim().length <1) PostTextBOX.placeholder.show();
		//PostTextBOX.buttons.hide();
	},
	onclick:function(e){
		if( PostTextBOX.txtbox.val().trim().length >0)
			PostTextBOX.placeholder.hide();		
	},
	keypress:function(e){
		onCtrlEnter(e, PostTextBOX.onCtrlEnter);
		return true;
	},
	keyup:function(e){
		
		if( PostTextBOX.txtbox.val().trim().length <1)
			PostTextBOX.placeholder.show();
		else if( PostTextBOX.txtbox.val().trim().length >0){
			console.log('TEXT:'+PostTextBOX.txtbox.val().length);
			PostTextBOX.placeholder.hide();		
		}
		var txt= PostTextBOX.txtbox.val();
		var mlist = ge('mention_list').value && JSON.parse();
		matches = txt.match(/\B@\w+/g);
		var lookup_key= null;
		if(mlist) for(var i in mlist)	if(!matches.contains(i)){ lookup_key =matches[i] ;break;}		
		if(lookup_key ==null) return;
		
		if(lookup_key && (isCharKey(e.keyCode) || e.keyCode ==KEY.DEL ||  e.keyCode ==KEY.SPACE) )
			PostTextBOX.mention(lookup_key);
		else
			hide(ge('mentionList'));
	},
	onCtrlEnter:function(e){
		var ht = parseInt(PostTextBOX.txtbox.css('height') ) || 50;
		if(ht<150) PostTextBOX.txtbox.css('height', ht+10);
	},
	keydown:function(e){
		if( PostTextBOX.txtbox.val().trim().length <1)
			PostTextBOX.placeholder.show();
		else if( PostTextBOX.txtbox.val().trim().length >0)
			PostTextBOX.placeholder.hide();		
	},
	onpaste:function(e){

	},
	attach:function(){
		if(!PostTextBOX.inited)
			PostTextBOX.init();		
		PostTextBOX.file.click();
	},
	select_file:function(){		
		var up_p = ge('unpublished_post');
		var up =  up_p &&up_p.value.trim() || "";
		data={};
		if(up.length>0)data={'unpublished':up};
		console.log(data);
		var opts = {'status':'#txt_bx_wrap','img_thumb':'#attachment-img-thmb', 
			'target':'','data':data,
			success:function(d){
				if(!up.length){
					var hi = ce('input');
					sa(hi,'type','hidden');sa(hi,'value',d.publish);
					sa(hi,'id','unpublished_post');sa(hi,'name','unfinished');
					ge('txt_bx_wrap').appendChild(hi);
				}
				PostTextBOX.attach_thumb(d.attachment,d.publish,'/media/'+d.file);
			},
			error:function(d){console.log(d);},
			url:'/post/attach'
		};
		var len = PostTextBOX.attached.length ? PostTextBOX.attached.length :0;
		if( parseInt(len)+1 <= parseInt(PostTextBOX.max_attach))
			(new window.uploader(this, opts) ).start();	
		else
			window.msgdialog( null,"Maximum Attachment", "Post Can have Maximum "+PostTextBOX.max_attach+" attachment only");
	},
	atch_remove:function(o, at,pid){

	},
	attach_thumb:function(at,pid,url){
		var th = ge('attachment-img-thmb');
		var wrp = ce('span',{id:('attachment_'+at+pid)});
		var thmb  = ce('span',{className:'inline-block'});
		var rmv_lnk = ce('a', {className:'thmb_rmv',href:'javascript:void(0);', innerHTML:'X'});
		sa(rmv_lnk,'data-id', (at+pid+'') );
		sa(rmv_lnk,'onclick', 'PostTextBox.atch_remove(this,'+at+','+pid+')' );
		thmb.appendChild( rmv_lnk );
		thmb.appendChild( ce('img',{src:url+""}) );
		wrp.appendChild( thmb );
		th.appendChild(wrp);
	},
	mention:function(name){
		if(!name) return;
		var ln =name.length;
		var val = name[ln-1].substr(1,name[ln-1].length);
		PostTextBOX.curr = name;
		var trgt = ge('mentionList');
		var success = function(a,b,c){
			if(b.html&&b.found) show(trgt).innerHTML=b.html;
			else hide(trgt);
		}
		window._sendreq( {'name': val}, null, success ,'/post/mention' );	
	},
	addMention:function(ob){
		hide(ge('mentionList')).innerHTML ="";
		var data = {'username':ga(ob,'data-username'), 'id':ga(ob,'data-id'), 'name': ga(ob,'data-name')};
		var mention_list = ge('mention_list');
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
		PostTextBOX.txtbox[0].value =PostTextBOX.txtbox[0].value.replace( PostTextBOX.curr,'@'+data['username']+" " );
		var mw = ge('mention_wrap') || ce('div',{id:'mention_wrap',className:'block lbw'});
		var newmen = ce('div', {className:'mention inline-block'}); sa(newmen,'data-men',data['id']+"");
		var newmen_label = ce('div',{className:'inline-block small_padd'});
		newmen_label.appendChild( ce('div',{innerHTML:"<b>"+data['username']+"</b>",className:'inline-block'}) );
		var newmen_close = ce('a',{href:'#',className:'inline-block  small_padd'}); 	
		newmen_close.appendChild( ce('b',{innerHTML:'x'}) );
		sa(newmen_close,'onclick',"PostTextBOX.removeMention('@"+data['username']+"')"); 
		newmen.appendChild( newmen_label );
		newmen.appendChild( newmen_close );
		mw.appendChild( newmen );
		PostTextBOX.txt_bx_wrap.appendChild( mw );

	},
	removeMention:function(u){
		var mlist= ge('mention_list');
		var mlist_map = JSON.parse(mlist.value);
		delete mlist_map[u];		
		mlist.value = JSON.stringify(mlist_map);		
		PostTextBOX.txtbox[0].value = PostTextBOX.txtbox[0].value.replace( u,"");
	},
	post:function(frm){						
		 var OnError = function(a,b){
		 	var len =frm.length;
		 	for(var i=0; i<len;i++) frm[i].removeAttribute('disabled');			
		}
		window.ajxfrm(frm, '#postlist .posts-list', PostBox.onDone,null,null,OnError);
	return false;
	}
}


function onCtrlEnter(ev, handler) {
  ev = ev || window.event;
  if (ev.keyCode == 10 || ev.keyCode == 13 && (ev.ctrlKey || ev.metaKey && browser.mac)) {
    handler();
   // cancelEvent(ev);
  }
}

