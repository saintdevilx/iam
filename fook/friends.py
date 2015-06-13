from fook import essential as e



@e.login_required
def add_friend(request):
	if request.is_ajax() and request.POST:
		data = {}
		uid = request.user.id
		friend_id = request.POST['friend_id']

		e.m.Friend.objects.create( friend=request.user, friend_of=friend_id).save()
		#e.op.new_activity(post_id= post.id, user = request.user ,act=8)
		data['message'] = 'Friend Request is sent .'
		data['success'] =True
		data['script'] = e.script.add_friend()
		return e.HttpResponse( e.json.dumps(data), content_type='application/json' )
	else:
		raise "Invalid Request"


@e.login_required		
def accept_friend(request):
	if request.is_ajax() and request.POST:
		uid = request.user.id
		friend_id =request.POST.get('friend_id')
		fid = request.POST.get('fid')		
		is_pending = e.m.Friend.objects.filter( e.Q(id=fid),e.Q(friend_id=friend_id),e.Q(friend_of=uid), e.Q(status='0') ).update(status='1')
		data = {}		
		if is_pending:			
			data['success'] =True			
			data['script']	= e.script.accept_friend()
		else:
			data['error'] =True
			data['message'] ='Something is wrong.'
		return e.HttpResponse( e.json.dumps(data), content_type='application/json')

@e.login_required
def unfriend(request):
	data={}
	if request.is_ajax() and request.POST:
		try:
			uid = request.user.id
			frienship_id = request.POST.get('fid')
			friend_id = request.POST.get('friend_id')
			e.m.Friend.objects.filter( e.Q(id=  frienship_id), e.Q(friend_id=uid)|e.Q(friend_of=uid) ).query
			frndshp= e.m.Friend.objects.filter( e.Q(id=  frienship_id), e.Q(friend_id=uid)|e.Q(friend_of=uid) ).delete() 			
			data ={}
			data['script']	 = e.script.unfriend()
			data['success'] =True
			data['deleted'] = (frndshp[0]+" "+frndshp[1]) if frndshp else 0
		except Exception, ex:
			print "#"*60
			import traceback,sys
			traceback.print_exc(file=sys.stdout)
			print "#"*60
	 	return e.HttpResponse(e.json.dumps(data), content_type='application/json')

@e.login_required
def findfriends(request):
	data={}
	uid = request.user.id
	if request.POST:		
		"""hmtwn    = request.POST.get('hmtwn')
								cur_city = request.POST.get('cur_city')
								school = request.POST.get('school')
								gender = request.POST.get('gender')"""
		params = request.POST.dict()		
		friends =  e.op.findFriends( uid,  params)
	else:
		friends =  e.op.findFriends( uid ,{})
	if request.is_ajax():
		data['html'] = e.get_template('friends/_findfriends.html').render( e.Context({'friends':friends,"options":True}) )
		data['success']  =True
		return e.HttpResponse( e.json.dumps(data), content_type="application/json" )
	return e.render(request, 'friends/findfriends.html', locals())

@e.login_required
def search(request):
	data={}	
	if request.GET:	
		name = request.GET.get('name')		
		res = e.op.getFriendsWithProfile(request.user.id,name)
		data = e.get_template('ajax/search/user_results.html').render( e.Context({"results":res,'q':name }) )
	return  e.HttpResponse(e.json.dumps(data) , content_type ='application/json')

@e.login_required
def suggestion(request):
	friends =  e.op.findFriends(request.user.id,{})
	html =  e.get_template('friends/suggestion.html').render(  e.Context({'friends':friends}) )
	return e.HttpResponse( e.json.dumps(html), content_type='application/json')


def addOnlineFriendToList(uid,fid):
	return c.sadd('user:{uid}:online_friends'.format(uid))

def removeOnlineFriendFromList(uid,fid):
	return c.sremo
