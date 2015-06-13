var Charcha = {
	init:function(uid,ts){
		Charcha.my_wrap = ge('charcha_wrap');
		sa(Charcha.my_wrap,'style','height:'+(window.screen.height-300)+'px;overflow-y:auto;');
		Charcha.online = {};
		Charcha.users = {};		
		Charcha.me = uid;	
		Charcha.count =0;
		Charcha.getFriendList(uid);			
		Charcha.service('start');			
	},
	service:function(cmd){
		if(cmd === "stop")clearTimeout( Charcha.reciever );
		else setTimeout(function(){Charcha.reciever();},2000, false);
	},
	reciever:function(){
		var success =function(a,b,c){						
			if(b.timestamp) Charcha.ts = b.timestamp;
			if(b.msg)for(var i=0;i<b.msg.length;i++) Charcha.recieved(b.msg[i].uid,b.msg[i]);	
			Charcha.service();		
		};
		window._sendreq({ts:(Charcha.ts)},null,success,'/messages/current?ts='+(Charcha.ts));
	},
	my_history:function(u){
		if(!u) return;
		var success=function(a,b,c){ Charcha.conversation(u,b); };
		window._sendreq({},null,success,'/messages/'+u,'GET')
	},
	send:function(ev,src,recv){
		ev = ev || window.event;		
		if (ev.keyCode == 13 ) {
			ev.preventDefault();			   
			var success = function(a,b,c){	};
			var msg = src.value || "";
			if(msg&&msg.length<1) return;
			console.log(Charcha.me);
			Charcha.my_message(recv,{'msg':msg});
			Charcha.users[recv].scrollIntoView();
			window._sendreq({'msg':msg,'recv':recv,'event':'msg_send'},null,success,'/send_message');
			src.value = "";
		}			  
	},		
	conversation:function(u,d){
		var len = d.msg.length;
		if(u&&len<1) Charcha.users[u].appendChild(ce('div',{className:'small_padd ',innerHTML:"<div class='_nohistory small_padd'>You have not started conversation.</div>",id:''}));
		for(var i=len-1;i>=0;i--)Charcha.my_message(u,d.msg[i]);			
	},
	recieved:function(user, data){		
		if(!Charcha.users[user])Charcha.users[user]= Charcha.nayiCharcha(user,data.msg); 						
		Charcha.timestamp = data.timestamp;
		Charcha.my_message(user, data);
	},
	toggleMsgBox:function(){						
		var lst = gebc('my_ilaaka');			
		for(l in lst)hide(lst[l]);
		var tr = arguments[0].target;
		var uid = ga(tr,'data-user')||null;
		if(!uid)return;
		var el = ge('my_ilaaka_'+uid);
		if(!el){			

			Charcha.nayiCharcha(uid,{});		
			var el =ge('gupsup'+uid);
			show(el);			
			var a =	gebc('chatToggle',el)[0] || null;
			if(a !=null)addClass(a,'_fl');
			return;
		}	
		toggleDisplay(el);
	},
	nayiCharcha :function(u,d){
		var top = parseInt(Charcha.count)*150;
		var wrap = gebc('user_wrap',ge('gupsup'+u) )[0]|| null;		
		if(wrap == null) return;
		var inner = ce('div',{id:'my_ilaaka_'+u,className:'border-all my_ilaaka'});
		var arrow = ce('div',{className:'pointer'});
		arrow.appendChild( ce('i',{className:'arrow-right'}));
		inner.appendChild( arrow );
		//inner.appendChild( ce('div',{className:'block'}) ).appendChild( ce('div',{className:'hdlne',innerHTML:d['user']['name']}) ); 
		var history = ce('div',{className:'block history '});				
		var msg = ce('div',{className:'messages block '});
		msg.appendChild(history);				
		var  msg_input = ce('textarea',{placeholder:'Your message',type:'text', name:'msg',className:'msg_box_input'});
		sa(msg_input,'onkeyup','Charcha.send(event,this,'+u+')');
		sa(msg_input,'resize','none;')
		msg.appendChild(ce('div',{className:'block border-all'})).appendChild( ce('div', {className:'msg_text block'})).appendChild( msg_input ) ;					
		inner.appendChild( ce('div',{className:'block'}) ).appendChild( msg );
		wrap.appendChild( inner );	
		wrap.appendChild( ce('div',{className:'clear'}));			
		Charcha.count++;			
		Charcha.users[u] = history;
		Charcha.my_history(u);
		return history;
	},
	my_message :function(u, d){
		if( Charcha.users[u] ){									
			var hisher = true;			
			if(parseInt(d.id) == parseInt(u)) hisher=false;
			var msg_block = ce('div',{className:'msg_text ',innerHTML:d.msg});
			var msg_info = ce('div',{className:'block'});			
			msg_info.appendChild( msg_block );
			var _time = ce('div',{className:'block',innerHTML:'<small>'+ ( ( d['time'])? timestampToTime(d['time']) : 'now')+'</small>',id:''});
			if(!d['time']) new syncTime(_time,0);
			msg_info.appendChild( _time  );
			//msg_info.appendChild('div',{className:'clear'});
			Charcha.users[u].appendChild( ce('div',{className:'msg_block '+(hisher?'lbw me':''), title:""+d.first_name+" "+d.last_name}) ).appendChild( ce('div',{className:'block'}) ).appendChild(msg_info);
		}
	},
	getFriendList:function(uid){
		var s = function(a,b,c){
			Charcha.ts = parseInt(b[0].timestamp);
			Charcha.createList(b);
		};
		window._sendreq({uid:uid},null,s,'/friendlist');
	},
	createList:function(list){
		var len = list.length;
		for(var i=1; i<len;i++){
			var user=list[i]['user'];
			var wrap = ce('span',{id:'gupsup'+user.id, className:'block'});
			var image = user.image&&user.image.trim().length>0? '/media/'+user.image+'.50x50_q85_crop.jpg': '/media/no_profile_pic.jpg.50x50_q85_crop.jpg' ;
			var user_img  = ce('a',{href:'javascript:void(0);',className:'chatToggle'});
			var img = user_img.appendChild(ce('img',{src:image,width:50,height:50,title:user.first_name+" "+user.last_name}));
			sa(img,'data-user',user.id);
			wrap.appendChild( ce('div',{className:'small_padd__ user_wrap'})).appendChild( user_img );												
			Charcha.my_wrap.appendChild(wrap);
			user_img.addEventListener('click',Charcha.toggleMsgBox  );
		}
	}
}	

