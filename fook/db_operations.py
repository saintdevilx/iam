import fook.util as myutil
import fook.models as model
from django.db.models import Q,F,Count,query
import traceback,sys

def CreateJoin(dict,table):	
	query =[]
	if dict:
		query ="SELECT "
		if 'fields' in dict:
			query+= ','.join(dict['fields']) + ' '
		else:
			query +=' * '
		query+=' FROM '+table+' '	
		if 'join' in dict:
			l = len(dict['join'])
			for j in dict['join']:
				query+= '%s JOIN %s ON ' %(dict['type'],j['table'] )
				query+= ' (%s) '%j['condition']
				l = l-1
				#if l>0:
				#	query+=' , '
		if 'where' in dict :
			query+=' WHERE '
			query+= dict['where']		
		if 'order' in dict:
			query+=' ORDER BY (%s) ' %(','.join(dict['order']) )
		if 'asc' in dict:
			query+=' DESC'
		else:
			query+=' ASC'	
	return query

def FollowPages(model,user_id, list=True):
	qset = model.objects.filter(user_id=user_id)
	if list:
		return qset.values_list('page_id') 
	else:
		return qset.values('page_id')

"""
	Method- getPostLikes
	@uid - Current user id to get only likes 
	@post_id_list - Post ids to get their likes
"""
def getPostLikes(uid,  post_id_list=None):
	return model.Post_Likes.objects.filter(user_id = uid , 
		post_id__in = post_id_list ).values('post_id')	

# def getPostAttachments(post_id_list):
# 	return model.Post_Attachments.objects.filter( post_id__in = post_id_list ).values('post_id','post_attachment')


def getPostByPage(m,cond,limit=10):	
	return m.objects.filter(cond ).select_related('page').values( 'id','post_description',
		'created','page__page_name','page_id' )[:limit]

def getPosts(uid,follow_list,page,**kwrg):
	
	limit = 10	
	param =None

	if  uid and follow_list:
		param = Q(user_id = uid) | Q( page_id__in = follow_list)
	elif uid:
		param = Q(user_id =uid)
	if 'page_id' in kwrg:		
		param = Q(page_id = kwrg['page_id'])
	
	if 'limit' in kwrg:
		limit = kwrg['limit']
	if 'page' in kwrg:
		page = page * limit+1
		limit = page+limit
	if param is None:
		return None

	posts = model.Posts.objects.filter( param ).select_related('page').order_by('-created').values('page__page_name','voted','id','page_id',
		'post_description','attachment','created')[page:limit]

	post_ids = myutil.extractColumn(posts,'id')	
	like_list =  getPostLikes(uid,  post_id_list = post_ids)
	#attachment = getPostAttachments(post_ids)

	posts  = myutil.addKey(posts, like_list,'id','post_id','is_like','post_id')	
	#posts  = myutil.addKey(posts, attachment,'id','post_id','attachment','post_attachment')	

	result = posts#{'posts': posts,  'attachment': attachment}		
	return result


def getPageInfo(page_id):
	return model.Pages.objects.filter( id=page_id ).values('id', 'page_name', 'page_profile','page_description', 
		'follower','page_type')[0]


"""
	Method homeQuery 
	@uid  - Current user id 	
"""
def homeQuery( uid,limit=10 ,page=None):
	follow_list = FollowPages(model.Follows,uid)
	result={}			
	res = getPosts(uid, myutil.join(follow_list) ,limit=limit, page=page)	
	if res is not None:
		result['posts'] = res

	#result['page_list'] = model.Pages.objects.filter( user_id = uid ).values('id','page_name')		
	return result


def page_profile(uid,page_id,limit=10,page=None):	
	result={}
	result['posts'] = {}#getPosts(uid,None,page_id = page_id,limit=limit,page=page)
	result['page_info'] = getPageInfo(page_id)
	return result

"""
	Method - getFriendList
"""
def getFriendList(friends,limit=10):	
	res = model.UserProfile.objects.filter(user_id__in = friends)[:limit]
	return res

def getFriendsOfFriend(uid, limit=50):
	friends = model.Friend.objects.filter(  Q(Q(friend_of=uid) | Q(friend_id = uid)), Q(status = status)).values('friend_id','friend_of','id')[:limit]		
	flist = myutil.GetFriends( friends, uid)	
	return flist

def getFriendsofFriends(friends, limit=200):
	status = 1
	friends = model.Friend.objects.filter(  Q(Q(friend_of__in = friends) | Q(friend_id__in = friends)), Q(status = status)).values('friend_id','friend_of','id')[:limit]
	return friends

"""
	Methd - getFriends
	@uid - user id 
	@status - 1 if 'friend ' 0 if friend request pending
"""
def getFriends(uid, page=0,limit=10,status=0,offset=None):	
	try:
		friends = model.Friend.objects.filter(  Q(Q(friend_of=uid) | Q(friend_id = uid)), Q(status = status)).values('friend_id','friend_of','id')
		friends = myutil.paginate( page, limit, friends,offset= offset)
		flist = myutil.GetFriends( friends, uid)	
		friends_list = model.UserProfile.objects.filter(user_id__in = flist).prefetch_related('User').values('profile_image','user__first_name','user__last_name','user__id')	
	except:
		traceback.print_exc(file=sys.stdout)
	return friends_list

"""
	Method - getFriendRequests
	@uid - user id 
"""	

def getFriendRequests(uid,limit =10):
	query  = "SELECT auth_user.id , auth_user.first_name,auth_user.last_name, profile.profile_image,friend.id as fid "
	query += " FROM fook_friend as friend  INNER JOIN auth_user  ON( friend.friend_id = auth_user.id) "
	query += " INNER JOIN fook_userprofile as profile ON(profile.user_id = auth_user.id) "
	query += " WHERE friend.friend_of=%s AND friend.status = 0 ORDER BY friend.created DESC"%uid
	return model.Friend.objects.raw(query)
	
"""
	Method - getMutualFriends
	@uid - user looking for mutual friends
	@friend - User whose mutual friends to be find
"""
def getMutualFriends(uid,friend, limit=6):
	friends = model.Friend.objects.filter(  Q(Q(friend_of=uid) | Q(friend_id = uid)) | 
		Q(Q(friend_of=friend) | Q(friend_id = friend)), 
		Q(status = '1')).values('friend_id','friend_of')	
	mtl_frnd = myutil.mutual_friends(friends,uid,friend)	
	return mtl_frnd 

"""
	Method - getMutualFriendsWithProfile
	@uid - user 
	@friend - friend user id
"""
def getMutualFriendsWithProfile(uid, friend, limit=3):
	mtl = getMutualFriends( uid, friend)
	mtl_frnds =  model.UserProfile.objects.filter(
		user__in = mtl)
	return {'count':len(mtl),'frnds':mtl_frnds}

def isFriend(uid,friend):
	return model.Friend.objects.filter( Q( friend_id =uid , friend_of=friend)| Q( friend_of=uid, friend_id = friend ) ).values()

def isFriendOfFriend(uid,friend):
	return len( getMutualFriends(uid,friend,limit=1) )

def messages_list(uid, id,page=0,limit=10):
	query  = """
	SELECT auth_user.id, auth_user.first_name ,auth_user.last_name,
	fook_message.content, fook_message.created, fook_message.unread,fook_message.sender_id,fook_message.reciever_id
	FROM fook_message 
	INNER JOIN auth_user ON
	(fook_message.sender_id = auth_user.id)
	where ( fook_message.reciever_id = %s """ %uid
	if id is not None:
		query+=""" AND fook_message.sender_id = %s """ % id
		query+=""" ) or fook_message.reciever_id=%s AND fook_message.sender_id =%s """ % (id,uid)
	else:
		query +=""" )	 GROUP BY fook_message.sender_id """ 

	query +=" ORDER BY fook_message.created DESC"
	query =  myutil.paginate(page,limit, query)
	msg  = model.Message.objects.raw(query)[:10]
	return msg


def albums_list(uid, id, page,limit=10):
	try:
		if uid is not None:
			q_album = model.Gallery.objects.prefetch_related('album').filter( album__user_id= uid).order_by('-created').query			
			q_album.group_by =['album_id']
		if id is not None:
			q_album = model.Gallery.objects.prefetch_related('album').filter( album__user_id=uid , album__id = id  ).order_by('-created').query
				
		album = query.QuerySet( query =q_album, model= model.Gallery )
		qry = myutil.paginate( page ,limit, album )
		result = qry#model.Gallery.objects.raw(query)		
	except Exception ,e:
		print "Exception : %s " %e
		result = []

	return result


def get_image(uid,img,pl,type=None,post=None):
	data = {}

	if type is None and img is not None and uid is not None:
		query = "SELECT g.id ,al.name,al.id as alid,u.first_name,u.last_name,u.id as uid, "
		query +=" g.image as image,g.caption,g.created, al.image_count, g.likes "
		query +=" FROM fook_gallery as g INNER JOIN fook_album as al ON (g.album_id = al.id ) "
		query +=" INNER JOIN auth_user as u ON (u.id = al.user_id) "
		query +=" WHERE g.id =%s" % img

		data['liked'] = model.Post_Likes.objects.filter( Q(post_type = 109979990 ) , Q(user_id = int(uid) ), Q(post_id = img) ).values('id')
		image = model.Gallery.objects.raw(query)		
		if image is not None:
			data['image'] = image[0]
		return data
	elif type == "109979992":
		return get_profile_image(uid,img)
	elif type == "109979988" and post is not None:
		return get_attachment_image(uid,post,img)
	else:
		raise Exception('Invalid Request')

def get_profile_image(uid,id):
	data={}	
	try:		
		data['image'] = model.ProfileImage.objects.values('id','image','likes','comments').get(id= id)
		data['liked'] = model.Post_Likes.objects.filter( post_type=109979990, user_id = uid ,post_id= id )		
	except Exception,ex:
		print "Exception:get_profile_image db_operation.py: %s"%ex
		return {}
	return data

def get_attachment_image(uid,post,id):
	data={}
	attachment = model.PostAttachment.objects.values('attachment','post_id').get(id=id)
	data['image'] = {'image':attachment['attachment'],'post_id':attachment['post_id']}
	data['liked'] = model.Post_Likes.objects.filter(post_type =109979988,user_id =uid, post_id=id)
	print "get_attachment_image data:%s"%data['image']
	return data

"""
	@method- my_feeds
	@user - user object
	@page - 
"""
def my_feeds(user, own=None,page=0,limit=10):

	flist  = 	friends = model.Friend.objects.filter(  Q(Q(friend_of=user) | Q(friend_id = user)), 
		Q(status = 1)).values('friend_id','friend_of')		

	frnds = myutil.GetFriends( flist, user)

	"""if page > 0:
		page = page* limit
		limit = page+limit
	"""	
	activity = None
	if len(frnds) >0 :
		query = """
		SELECT act.id as act,act.post_type,act.act_id as act,
		poster.id as pid, profile.profile_image as poster_image,poster.first_name as pfname, poster.last_name as plname,
		user.id,user.first_name,user.last_name,post.post_description, post.id as post_id,
		post.created,post.attachment,post.likes,post.comment,post.target_id,like.id as is_like
		FROM fook_activity as act INNER JOIN fook_posts as post 
		ON( act.post_id = post.id)
		INNER JOIN auth_user as user
		ON( act.user_id = user.id)
		INNER  JOIN auth_user as poster ON (post.user_id = poster.id )
		INNER  JOIN fook_userprofile as profile ON (post.user_id = profile.user_id )
		LEFT OUTER JOIN `fook_post_likes` as `like` ON (act.post_id = like.post_id AND like.user_id = %s)	
		WHERE  (act.user_id =%s AND act.act_id =1)""" %( user , user )

		if own is None:
			query +=""" OR act.user_id IN (%s) """ % ( ','.join(str(x) for x in frnds) )
		#query+=" GROUP BY (act.post_id , act.act_id )"
		query+=""" ORDER BY act.created DESC	
		""" 
		query = myutil.paginate(page,limit,query)
		activity =  model.Activity.objects.raw( query )

	return activity


def getAllTypeOfPost(user, my=False,page=0,limit=10, ftype= None):
	frnds=[]
	if my ==False:
		flist  = 	friends = model.Friend.objects.filter(  Q(Q(friend_of=user) | Q(friend_id = user)), Q(status = 1)).values('friend_id','friend_of')		
		frnds = myutil.GetFriends( flist, user)

	query  ="SELECT count(act.act_id) as act_count, act.id , act.act_id, act.user_id as actor, act.post_id, act.post_type, act.created"	
	query +=" FROM fook_activity as act "
	query +=" WHERE " #(act.user_id =%s ) " %user
	frnds.append(user)
	#if len(frnds):
	query +=" act.user_id IN (%s ) "% ( ','.join(str(x) for x in frnds) ) 

	if ftype:
		if ftype=="comment":
			query += " AND act.act_id= 7"
		elif ftype == "status":
			query +=" AND act.act_id=1 "			
		elif ftype == "photo":
			query +=" AND  (act.act_id=7 OR act.act_id=11)"		
	query+=" GROUP BY act.post_id , act.act_id "
	query +=" ORDER BY act.created DESC"
	query = myutil.paginate(page,limit,query)

	activity_raw =  model.Activity.objects.raw( query )
	empty=True
	for a in activity_raw :
		empty =False
		break
	if empty:
		return None

	activity =[]
	feeds ={}
	users=[]
	postType={'post':[],'gallery':[],'profile_image':[],'video':[],'audio':[]}
	for act in activity_raw:		
		activity.append({ 'act_count':act.act_count,'act':act.id,'act_id':act.act_id,'actor':{'id':act.actor}, 'post_id':act.post_id ,'post_type':act.post_type,'created':act.created})
		if act.post_type == 109979990:
			postType['gallery'].append(act.post_id)
		elif act.post_type == 109979992:
			postType['profile_image'].append(act.post_id)
		elif act.post_type == 109979993:
			postType['video'].append(act.post_id)
		else:
			postType['post'].append(act.post_id)
		users.append(act.actor)
		#users.append(act.target)		
	
	feeds['activity'] =activity
	
	if len(postType['post']):			
		feeds['posts'] = getPostTypeFeed(postType['post'])
	if len(postType['gallery']):
		feeds['gallery'] = getGalleryTypeFeed(postType['gallery'])
	if len(postType['profile_image']):
		feeds['profile_image'] = getProfileTypeFeed(postType['profile_image'], user)
	if len(postType['video']):
		feeds['video'] = getVideoTypeFeed(postType['video'])

	
	if feeds.has_key('gallery'):
		for g in feeds['gallery']:
			users.append(g.uid)
	posts =[]
	if feeds.has_key('posts'):
		for p in feeds['posts']:
			users.append(p.uid)
			posts.append(p.id )

	if feeds.has_key('profile_image'):
		for g in feeds['profile_image']:
			users.append(g.uid)

	if feeds.has_key('video'):
		for v in feeds['video']:
			users.append(v.id)

	feeds['profiles'] = getUserProfile( myutil.unique(users) )
	if len(posts):
		feeds['attachment'] =getPostAttachment( myutil.unique(posts) )

	return myutil.createFeedMap( feeds)


def getUserProfile(uids):
	if len(uids):
		return model.UserProfile.objects.filter(user_id__in = uids).prefetch_related('user').values('user_id','profile_image','user__first_name','user__last_name')
	else:
		return {}

def getProfileTypeFeed(uids, usr):
	query  = "SELECT pi.id, pi.image, pi.likes, pi.comments, pi.user_id as uid, _like.id as is_liked "
	query += " FROM fook_profileimage as pi LEFT OUTER JOIN fook_post_likes as _like ON( pi.id =_like.post_id AND _like.post_type=109979992 and _like.user_id=%s) "%usr
	query += " WHERE pi.id IN(%s) "%( ','.join( str(x) for x in uids ) )
	return model.ProfileImage.objects.raw( query )

def getGalleryTypeFeed(uids):
	query  = " SELECT album.user_id as uid, post.id , post.image, post.album_id,album.name, post.comments, post.likes ,post.created, _like.id as is_liked "
	query += " FROM fook_gallery as post INNER JOIN fook_album as album ON(album.id = post.album_id)  LEFT OUTER JOIN fook_post_likes as _like ON( post.id =_like.post_id AND _like.post_type=109979990) "
	query += " WHERE post.id IN(%s)"% ( ','.join( str(x) for x in uids) )
	return model.Gallery.objects.raw( query )

def getPostTypeFeed(post):
	query  = " SELECT post.id ,post.user_id as uid, post.post_description, post.target_id, post.comments, post.likes ,post.created, _like.id as is_liked "
	query += " FROM fook_posts as post LEFT OUTER JOIN fook_post_likes as _like ON( post.id =_like.post_id AND _like.post_type=109979988) "
	query += " WHERE post.id IN(%s)"% ( ','.join( str(x) for x in post) )
	return model.Posts.objects.raw( query )

def getPostAttachment(post):	
	return model.PostAttachment.objects.filter( post__in = post ).values('id','attachment','post_id').order_by('-created')

def getVideoTypeFeed(vids):
	query  = "SELECT video.id,video.user_id as uid, video.title, video.duration, video.token, video.thumbnail, video.views, video.likes,video.comments,video.created ,_like.id as is_liked"
	query += " FROM fook_videos as video LEFT OUTER JOIN fook_post_likes as _like ON( video.id = _like.post_id AND _like.post_type =109979993 ) "
	query += " WHERE video.id IN(%s)"%( ','.join( str(x) for x in vids ))
	return model.Videos.objects.raw(query)

def my_activity(user, limit=10,page=0):	
	return getAllTypeOfPost(user, own=True,page=page,my=True)


"""
"""
def new_activity(user=None , act=None ,post_id=None, gallery_id=None,typ=None):
	return model.Activity.objects.create(user = user, act_id= act, post_id=post_id,post_type=typ)

def get_alrts_count(alrt,uid):	
	if alrt is not None and uid  is not None:
		if alrt == 'req':
			query = "SELECT count(fook_friend.id) as count,fook_friend.id  FROM fook_friend  WHERE fook_friend.friend_of = %s AND fook_friend.status = 0  ORDER BY fook_friend.created DESC" % uid			
			return model.Friend.objects.raw(query,False)
			#values('count').filter(  Q(friend_of=uid) , Q(status = 0 )).annotate(count=Count('id'))
		#else:
		#	return model.Message.objects.filter( Q(reciever_id)=uid , Q(unread = 'n' ) ).values(Count('id'))
	else:
		raise Exception('Invalid Parameter')


def get_alerts(alrt,uid):
	if alrt is not None and uid is not None:
		if alrt == 'req':
			return getFriendRequests(uid)


def basic_info(uid):
	#'user__id','user__first_name', 'user__last_name',
	return model.UserProfile.objects.get(user__id =uid)

def profile_info_more(uid):

	profile = model.UserProfile.objects.values('education','works', 
		'phone','hometown','user__email','user__id','cur_city').get(user__id =uid)
	param=[]
	tags=None

	if profile['education'] is not None:
		param.append(profile['education'])
	if profile['hometown'] :
		param.append(profile['hometown'] )
	if  profile['cur_city'] is not None:
		param.append(profile['cur_city'])

	if len(param)>0 :
		tags = model.Pages.objects.filter( id__in = param).values('id','page_name')
		t={0:None}

		for p in tags:
			t[ p['id'] ] = p['page_name']	
		if profile['education'] :
			profile['education' ] =  t.get(int(profile['education'])) 
		if profile['hometown']  :
			profile['hometown'] =   t.get(int(profile['hometown']))
		if profile['cur_city'] :
			profile['cur_city'] =  t.get(int(profile['cur_city']))
	return [profile, tags]

def get_tag_by_name(tag):
	if tag is not None:
		tags = model.Tags.objects.filter(Q(tag_name__icontains =tag) ).values('id','tag_name')[:10]
		return tags
	else:
		return {}

def getCommentsList(pid,uid, ptype= None, page=0,limit=25):
	if pid is not None:
		_c_type = ptype
		_comments = myutil.paginate( page,limit, model.PostComment.objects.filter( post_type=_c_type  , post_id=pid ).values() )
		user_ids = myutil.unique( [ c['user_id'] for c in _comments ] )		
		cmnt_ids = [ c['id'] for c in _comments ]

		_users =  model.UserProfile.objects.prefetch_related('user').filter( user_id__in = user_ids )
		_likes =  model.Post_Likes.objects.filter( post_type =_c_type, user_id = uid, post_id__in= cmnt_ids ).values('id')

		users = { u.user_id : u  for u in _users }
		likes = { l['id'] : l for l in _likes }

		comments=[]
		for c in _comments:
			comments.append({
				'comment':c,
				'user':users.get( c['user_id'] ),
				'is_liked':likes.get( c['id'] )
			})

		return comments

	else:
		raise Exception('Invalid Request')

def get_friend_head(uid):
	if uid is not None:
		query ="""
			SELECT user.first_name,user.last_name,user.id,profile.profile_image
			FROM auth_user as user 
			INNER JOIN fook_friends as friend ON ( user.friend = %s or  friend.friend_of = %s )
			INNER JOIN fook_userprofile as profile ON( friend.user_id = profile.user_id OR friend.friend_of = profile.user_id )
			ORDER BY friend.created DESC LIMIT 5;
		""" %(uid,uid)
		return model.User.objects.raw(query)
	else:
		raise Exception('Invalid Request')

def getLikers(pid,_type):
	if id and _type:
		query ="SELECT _like.id as _likeid,user.first_name, user.last_name,user.id,_like.created,profile.profile_image FROM fook_post_likes as _like INNER JOIN auth_user as user ON ( _like.user_id = user.id) INNER JOIN fook_userprofile as profile ON( user.id = profile.user_id) WHERE _like.post_id =%s and _like.post_type= %s" %(pid, _type)
		return model.Post_Likes.objects.raw( query )[:10]
	else:
		raise Exception('Error')

def findFriends(user, params):
	flist  = 	friends = model.Friend.objects.filter(  Q(friend_of=user) | Q(friend_id = user), status = 1).values('friend_id','friend_of')		
	frnds = myutil.GetFriends( flist, user)

	query  = "SELECT user.first_name, user.last_name, user.id, profile.profile_image as image , page.page_name as tag"
	query += " FROM auth_user as user INNER JOIN fook_userprofile as profile ON (user.id= profile.user_id) "
	query += " LEFT OUTER JOIN fook_pages as page ON ( profile.cur_city = page.id )"
	query += " WHERE "

	if len(params):
		if params.has_key('hmtwn') and len(params['hmtwn']):
			query += " profile.hometown = %s"%params['hmtwn'] +" and "
		if params.has_key('cur_city') and len(params['cur_city']):
			query += " profile.cur_city =%s"%params['cur_city']+" and "
		if params.has_key('school') and len(params['school']):
			query += " profile.education =%s"%params['school'] +" and "
		if params.has_key('gender') and len(params['gender']):
			query += " profile.gender='%s'"%params['gender']+" and "

	if len(frnds)>0:
		query+=" user.id NOT IN(%s) and " % ( ','.join(str(x) for x in frnds) )
	query +=" user.id != %s"%user 

	return model.Friend.objects.raw(query)


def findPeopleHavingMutualFriends(user):
	flist  = 	friends = model.Friend.objects.filter(  Q(friend_of=user) | Q(friend_id = user), status = 1).values('friend_id','friend_of')		
	frnds = myutil.GetFriends( flist, user)
	query ="SELECT user.first_name, user.last_name, user.id, profile.profile_image as image "	
	query +=" FROM fooK-friends as friend INNER JOIN auth_user as user ON(user.id = friend_of OR user.id = friend.friend_id) "
	query +=" GROUP BY user.id "


def getFriendsWithProfile(uid,name):
	try:
		query =" SELECT user.id, user.first_name,user.last_name,profile.profile_image as image  FROM auth_user as user "
		query+=" INNER JOIN fook_friend as friend ON( (friend.friend_id = %s AND friend.friend_of=user.id) OR (friend.friend_id = user.id AND friend.friend_of=%s) AND friend.status=1 ) "%(uid,uid,)
		query+=" INNER JOIN fook_userprofile as profile ON(profile.user_id= user.id) "
		query+=" WHERE user.first_name like '{name}%%' OR user.last_name like '{name}%%' ORDER BY created DESC "
		query = query.format(name=name)		
		#print "472:db_operation:getFriendsWithProfile:query: %s"%query
	except Exception,ex:
		print "Excpeption:db_operation:388:%s"%ex
	return model.User.objects.raw(query)	


def getLocation(name):
	try:
		query  =" SELECT page.page_name, page.id , state.state_name, country.country_name "
		query +=" FROM fook_pages as page INNER JOIN fook_country as country ON(page.page_country = country.id)  INNER JOIN fook_state as state ON(state.id  = page.page_state)"
		query +=" WHERE page.page_name like '{name}%%'".format(name=name)
		query =  myutil.paginate(0,5,query)
	except Exception, e:
		print "Exception :%s"%e
	return model.Pages.objects.raw(query)


def getEducation(name):
	try:
		query  =" SELECT page.page_name, page.id , state.state_name, country.country_name "
		query +=" FROM fook_pages as page LEFT OUTER JOIN fook_country as country ON(page.page_country = country.id)  LEFT OUTER JOIN fook_state as state ON(state.id  = page.page_state)"
		query +=" WHERE page.page_name like '{name}%%' and page.page_type ={page_type}".format(name=name, page_type=54331)
		query =  myutil.paginate(0,5,query)
		return model.Pages.objects.raw(query)
	except:
		traceback.print_exc(file=sys.stdout)
		return None

def getState(name):
	try:
		query =" SELECT state.id, state.state_name, country.id as cid, country.country_name  "
		query+=" FROM fook_state as state  INNER JOIN fook_country as country ON (state.country_id = country.id) "
		query+=" WHERE state.state_name like '{name}%%'".format(name=name)
		query =  myutil.paginate(0,5,query)
	except Exception,e:
		print "Exception:db_operation:492:getState:%s"%e
	return model.State.objects.raw(query)

def getNewMessage(uid,ts):
	try:
		if uid is not None and ts is not None:
			query  = " SELECT unix_timestamp(now()) as ts,msg.id,user.first_name,user.last_name,user.id as uid,msg.content,msg.created "
			query += " FROM fook_message as msg INNER JOIN auth_user as user ON( user.id = msg.sender_id) "
			query += " WHERE msg.reciever_id=%s AND msg.unread='n' AND unix_timestamp(msg.created)> %s ORDER BY created DESC"%(uid,ts)			
			return model.Message.objects.raw(query)			
	except Exception,ex:
		print "EXception:getNewMessage:db_operation.py:%s"%ex
		return None

def peopleHavingCommonFriends(uid):
	flist  = 	friends = model.Friend.objects.filter(  Q(friend_of=user) | Q(friend_id = user), status = 1).values('friend_id','friend_of')		
	frnds = myutil.GetFriends( flist, user)
	query ="SELECT user.id, user.first_name, user.last_name, "


def get_album_list(user=None,page=None,limit=4):
	try:
		if user:
			query = model.Gallery.objects.prefetch_related('album').filter(album__user_id = user).order_by('-created')
			query.group_by = ['album_id']
			query = myutil.paginate(page,limit,query)
			return query
		else:
			raise Exception		
	except Exception,ex:
		print "Exception: get_album_list db_operation.py "
		return None

def get_video_list(user=None,page=None,limit=5):
	try:
		if user:
			start = (page*limit) if page is not None else 0
			end = start+limit-1
			return model.Videos.objects.filter(user_id=user).values()[start:end]
	except Exception, e:
		traceback.print_exc(file=sys.stdout)
		
		return None


def get_online_friends(me,user,ts):		
	try:
		a= model.UserProfile.objects.filter( user_id = me ).update(last_activity = ts )
		flist  = model.Friend.objects.filter(  Q(friend_of=user) | Q(friend_id = user), status = 1).values('friend_id','friend_of')		
		frnds = myutil.GetFriends( flist, user)
		profile = model.UserProfile.objects.filter(user_id__in = [ x for x in frnds ] ).values('user_id','profile_image','last_activity')
		print "profile:%s\na:%s"%(profile,a)

	except Exception, e:
		raise
	finally:
		traceback.print_exc(file=sys.stdout)
		return None

def getFriendsProfileImage(friends):
	if friends:
		return model.UserProfile.objects.filter(user_id__in = friends).values()
	else:
		return None


def getNotification(uid,ts,**opts):
	""" Getting Notification data Map 
	{'actor- array of User objects',
	'post- array of different type of post object', 
	'other-e.g. created, unread, seen etc.'}
	"""	
	notification = []
	unseen = 0	
	try:
		from datetime import datetime
		import fook.verb_data as vb
		if uid is not None :
			if ts is not None:
				query ="SELECT * from fook_notification WHERE unseen ='1' and user_id =%s and unix_timestamp(created)> %s order by created desc"%(uid, ts)								
				notif = model.Notification.objects.raw(query)	
			else:				
				notif = myutil.paginate( opts['page'], opts['offset'], model.Notification.objects.filter( user_id =uid ).order_by("-created") )
			
			is_empty = True
			if ts is not None:				
				for i in notif:
					is_empty =False
					break
			else:				
				is_empty = True if len(notif)<1 else False

			if is_empty:
				return []			
				
			users_id = [ x.actor for x in notif ]
			
			user = model.UserProfile.objects.prefetch_related('user').filter(user_id__in = users_id)
			users ={}

			for u in user:
				users[ u.user_id ] = {'user': u.user, 'image':u.profile_image }

			post ={}
			posts={}
			posts_dict={}
			for x in notif:
				if post.has_key(x.post_type):
					post[ x.post_type ].append( x.post_id )
				else:
					post[ x.post_type ] = [  x.post_id ]

			for p in post:				
				posts[ p ] = model.POST_TYPE[ unicode(p) ].objects.filter( id__in = post[ p ] ).values()

			
			for p in posts:				
				for i in posts[p] :					
					posts_dict[ i['id'] ] = i

			for n in notif:
				
				if not posts_dict.has_key( n.post_id ):
					continue		

				if unicode(n.unseen)==unicode(1):
					unseen = unseen + 1

				notification.append({
					'actor': users[n.actor ],
					'post':posts_dict[ n.post_id] ,
					'row':n,
					'activity': vb.ACT_TYPE[ unicode(n.act_id) ],
					'post_type':vb.POST_TYPE[ unicode(n.post_type) ]
					})			
	except Exception,ex:
		traceback.print_exc(file= sys.stdout)		
	finally:
		return {
			'unseen':unseen,
			'notif':notification
		}


def notification_seen():
	"Seen Notification"
	try:		
		return model.Notification.objects.filter( unseen ='1').update( unseen ='0' ) 
	except:
		traceback.print_exc( file= sys.stdout)
		return None

def mark_notification_as_read(id):
	try:
		return model.Notification.objects.filter(id = id).update( unread ='0')
	except:
		traceback.print_exc( file =sys.stdout)
		return None


def getPost(id, post_type):
	try:
		res = {}
		if id is not None and post_type is not None:
			res['post'] = model.POST_TYPE[post_type].objects.filter(id=id).values()[0]			
			if res['post'] is None:
				return None
			if unicode(post_type) == unicode(109979988):
				res['attachments'] = model.PostAttachment.objects.filter(post_id=id)			
			#res['liked'] = model.Post_Likes.objects.filter(post_id=id, user_id = res['post']['user_id']).values()[0]
			res['profile'] = model.UserProfile.objects.filter( user_id = res['post']['user_id']).values('profile_image','user__first_name','user__last_name')[0]
			res['post_type'] = post_type
			return res
		else:
			return None

	except:
		traceback.print_exc( file =sys.stdout)
		res = None
	finally:
		return res