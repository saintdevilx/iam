if(fook){
	(function(){
		function a(){
			var boxmap =[{ 
				tag:'div',attr:{id:'main_content'},					
				child:[{					
					tag:'div',class:'postbox',
					child:[{
						tag:'form',class:'',
						attr:{'action':'/add_post','enctype':'multipart/form-data','method':'POST','onsubmit':"return window.ajxfrm(this, '#postlist .posts-list', PostBox.onDone)"},
						child:[{
							tag:'div',attr:'',class:'post',
							child:[{
								tag:'div',attr:{id:'postUpdateBox'},class:'border-all',
								child:[{
									tag:'div',class:'',id:'',class:"list-item",
									attr:{onclick:"PostTextBOX.init(this)",id:'txt_bx_wrap'},
									child:[
										{tag:'div',class:"placeholder",attr:{id:'pl_postBox'},innerHTML:'Write to share'} ,
										{tag:'textarea',attr:{name:"post_description",id:'post-description',onkeypress:"PostTextBOX.keypress(event)",onkeyup:"PostTextBOX.keyup(event)" ,onkeydown:"PostTextBOX.keydown(event)",value:"",required:"true"}},
										{tag:'input',attr:{type:'hidden',name:'mention[]',value:'',id:'mention_list'}},
										{tag:'input',attr:{type:'hidden',name:'attached[]',value:'',id:'attached'}},
										{tag:'input' ,attr:{type:"hidden" ,name:"target_id",value:fook.user.id} },
										{tag:'div', attr:{id:'attachment-img-thmb', class:"border-top"}}
									]
								},
								{tag:'div',class:"list-item lbw",
									child:[{tag:'div',attr:{id:'mentionList'},class:'hidden'},
									{tag:'div',class:'post-button',
										child:[{
											tag:'div',class:"inline-block",
											child:[{ tag:'span',class:'icon-camera',attr:{style:'padding:3px 15px;cursor:pointer;',title:'Add Image',onclick:"PostTextBOX.attach();"} }]
										},
										{tag:'div',class:'inline-block',
											child:[{tag:'input',attr:{type:'submit',value:'Post'} }]
										},
										{tag:'input',class:'hidden',attr:{type:'file',id:'post_attachment',name:'attachment'} }
										]
									}]
								}]
							}]
						}]
					}] 
				},
				{
					tag:'div',attr:{id:'postlist',class:''},
					child:[{
						tag:'div',class:'posts-list'
					}]
				},{
					tag:'div',attr:{id:'paginate'},class:'block',
					child:[{
						tag:'button',attr:{'onclick':"Feeds.loadMore(this)",class:'border-all padd_all',innerHTML:'load more'}
					}]
				}]
			}];		
			ge('page-header').appendChild(b(boxmap));
		}
		
		function c(){
			var player = [{
				tag:'div',class:'jp-video',
				child:[{
					tag:'div',class:'j-typ-single',
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
									}]
								},
								{tag:'div',class:'jp-no-solution',innerHTML:'<span>Update Required</span>To play the media you will need to either update your browser to a recent version or update your <a href="http://get.adobe.com/flashplayer/" target="_blank">Flash plugin</a>.'}
							]
						}
					]
				}]
			}]
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
		a();		
	})();
}

