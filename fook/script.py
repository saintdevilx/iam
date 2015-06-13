vote_script ="""
		function ex(obj){
			data={'category':'post','event':'%s','category_id':%s,'count':'%s'}			
			obj.data('category_id',data['category_id']);
			obj.data('category',data['category']);
			obj.data('event',data['event']);
			obj.text(data['event']);
	};ex(obj);"""

follow_page_script = """
	(function(obj){
			obj.data('category_id','%s');
			obj.data('category','%s');
			obj.data('event','%s');
			obj.text('%s');
		} )(obj);
	"""

more_post_script ="""
		(function(obj){
			var html = %s;
			$('.posts-list').append( html);	
			var has_more = %s;			
			if( has_more)
				obj.data('page','%s')
			else
				obj.remove();
		})(obj);
	"""


friend_request_script ="""
	(function(obj){
			var html =%s;
			$('#friends-list').html( html );
		})(obj);
	"""

accept_frnd_script = """ 
		(function(obj){
			obj.remove();
		})(obj);
	"""	

add_friend_script = """
		(function(obj){
			obj.html('Request Sent');
		})(obj);
	"""

unfriend_script = """
		(function(obj){
			obj.parent().fadeOut().remove()
		})(obj);
	"""

image_gallery_script = """
	(function(obj){
		var html = %s;
		obj.append(html);
	})(obj);
	"""	
delete_album_script ="""
	(function(obj){
		obj.parentNode.parentNode.remove();
	})(obj);
	"""
render_html_script = image_gallery_script

def success_vote(data):	
	return (vote_script % ('unlike',data['id'],data['count']) )

def success_unvote(data):	
	return ( vote_script % ('like',data['id'],data['count']) )

def follow_page(data):
	return( follow_page_script % ( data['id'],data['category'],'unfollow',data['event']) )

def unfollow_page(data):
	return( follow_page_script % ( data['id'],data['category'],'follow',data['event']) )

def more_post(data):
	return more_post_script % (data['html'],data['has_more'], data['page'])

def friend_request(data):
	return friend_request_script % data['html']

def accept_friend():
	return accept_frnd_script

def add_friend():
	return add_friend_script

def unfriend()	:
	return unfriend_script

def image_gallery(data):
	return image_gallery_script %(data['html'])

def render_html(data):
	return render_html_script % data['html']

def delete_album():
	return delete_album_script