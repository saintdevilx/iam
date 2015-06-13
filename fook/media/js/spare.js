$(document).ready(function(){	
/*
	function send_request(map ,obj){
		$.ajax({
			type:'POST',
			data:map,cache:false,
			dataType:'json',
			async:false,
			url:'/ajax_apis',
			success:function(a,c){				
				if( typeof(a)!='undefined' && typeof(a['success'])!='undefined'){					

					var execute = eval(a['script']);					
					a['script'];					
				}
				else{
					if(typeof(a['message']) !='undefined')
						window.msgdialog(obj,'Error Occured',a['message']);//alert(a['message']);
				}
			},
			error:function(a,c){
				a;
			}
		});
	}
/*
	$('#toggle-post-box').bind('click',function(){		
		if( $(this).data('visible') ==true){
			$('.postbox').fadeOut();
			$(this).data('visible',false);
			$(this).text('Add New Post(+)');
		}
		else{			
			$(this).text('close(X)');
			$('.postbox').fadeIn();
			$(this).data('visible',true);
		}
	})

	clck_a = function click_anchor(obj){
				$(obj).bind('click',function(e){
					e.stopPropagation();
					e.preventDefault();		
					var data = Object() ;// = Array()		
					
					$.each( $(this).data(), function(k,v){
						data[k] = v;
					})					
					send_request(data ,$(this));				
					
				});
		};		

	/*clck_a('.posts-list a#evt');
	//clck_a('.pagination a#evnt');
	clck_a('#addfriend');


	/*$.get('/ajax_apis',{'event':'suggestion','category':'pages'}, function(data){ 
		$('#page_suggestions').html(data);
	});* /
	
	var listui=''  ;
	$( "#search-bar-" ).bind('keyup',function(){			
			var q=$(this).val();
			if(q.length>1){
			$.ajax({
				url: "/search",
				dataType: "json",
				data: {
					q: q
				},
				success: function( data ) {					
					console.log(data);
					/*if( typeof(data['Error']) =='undefined' ){							
						listui = resultList(data);
						if( $('.search-results') )
							$('.search-results').remove();																							
					}					
					else{
						$('.search-results').remove()
						listui ='<div class="search-results"><ul><li><span class="heading">No Result Found for "'+q+'"</span></li></ul></div>';
					}* /					
					$('body').append(data);
					var selector = $('#search-bar');						
					var pos = selector.position();
					var obj = $('#search-bar');
					var height = selector.height()+5;
					var width = selector.width()-5;
					$('.search-results  ul').css({'width':width,'position':'absolute','padding':'5px',
						'border':'1px solid #cccccc','background-color':'#FFFFFF'})
					.addClass('ui-corner-all')
					.addClass('ui-default-state')
					.offset({'left':pos.left,'top':pos.top+height+2});		
				},
				error: function(e){
					console.log(e);
				}
				})
			}	
			else
			{
				$('.search-results').remove();
			}	
	});

	$('#search-bar').bind('focusout',function(){
			
			//if( $('.search-results') )
			//$('.search-results').hide();
		});	
	$('#search-bar').bind('focus',function(){
			//if( $('.search-results'))
			//	$('.search-results').show();
		});			
	*/
});