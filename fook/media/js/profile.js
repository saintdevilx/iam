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
	loadProfile:function(id){
		try{
			var render = function(a,b,c){ ge('glry-img').innerHTML+= b.html||""; };
			//setTimeout( function(){_sendreq({"event":"mtl_frnd","category":"friend","user":id},$('#mtl_frnd') ); },100,false);
			//setTimeout( function(){_sendreq({"event":"friends","category":"friend","user":id},$('#frd'));} ,100, false);
			setTimeout( function(){_sendreq({"event":"albums","category":"albums","user":id},null, render) },100 ,false);
			//setTimeout( function(){_sendreq({"event":"my_act","category":"post","user":id},'_post-list', render)} ,100,false);
		}catch(e){}
	},
	info:function(id){
		var data = {'event':'bs_inf','category':'pr','user':''+id};
		window._sendreq( data,null, 
				function(a,b,c){ ge('prfl_mnu_vw').innerHTML=b.html;} 
			);
	},
	more_info:function(obj,id){
		hide(obj);
		var data ={'event':'pr_inf_mr','category':'pr','user':''+id};
		window._sendreq(data,null,
			function(a,b,c){ 
				var pmv =ge('prfl_mnu_vw');
				pmv.innerHTML+=b.html;				
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
					if(toggleClass(holder,'hidden')){
						var hmVw = gebc('uiEditCurrentCityView',pmv);
						if(!hmVw[0]){
							Profile.enableEducationEdit(holder);
							addClass(holder,'uiEducationView');
						}
					};
				});				

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
			hide(ge('updateResidence')).remove();
			var hmt =ge('hmtwn');
			var crcty = ge('crcty');
			hmt &&hide(hmt);
			crcty &&hide(crcty);
			if(opts&&opts.onDone)
				opts.onDone(b);
		};
		if(isEmptyField(frm.hmtwn) ){
			if(isEmptyField(frm.city)||isEmptyField(frm.state) || isEmptyField(frm.country))
				return false;			
		}
		window.ajxfrm(frm,onDone);
		return false;
	},
	enableEducationEdit:function(){

	}
}