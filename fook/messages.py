from fook import essential as e
import time,datetime
import traceback,sys

@e.login_required
def send_message(request):
	data={}
	if request.POST:		
		try:
			recv = request.POST['recv']
			msg =  request.POST['msg']			
			me = request.user
			m = e.m.Message.objects.create( sender_id = me.id, reciever_id = recv, content = msg )					
			data['msg']=[{'uid':me.id,'first_name':me.first_name,'last_name':me.last_name,'unread':m.unread,'time':e.myutil.timestamp(m.created),'msg':msg}]
			data['timestamp'] = int(e.myutil.current_timestamp())-2							
		except Exception, ex:
			data['error'] = 'Error Occured'
			traceback.print_exc(file=sys.stdout)			
		finally:
			if request.is_ajax():				
				return e.HttpResponse( e.json.dumps(data), content_type='application/json')
			return e.HttpResponseRedirect( '/messages/%s' %recv)


@e.login_required
def viewmessages(request,id=None):
	uid=request.user.id	
	data={}
	msg=[]
	p_map = {}

	messages_list = e.op.messages_list(uid, id)
	users_list = [ m.sender_id for m in messages_list ]
	profile_map = e.op.getFriendsProfileImage(users_list)	
	
	if messages_list:	
		for p in profile_map:
			p_map[p['user_id'] ] = p['profile_image']

		conversations=[]	
		for m in messages_list:
			conversations.append({'image':p_map[m.sender_id],'msg':m})

		for m in messages_list:
			msg.append({'id':m.id,'first_name':m.first_name,'last_name':m.last_name,'unread':m.unread,'time':e.myutil.timestamp(m.created),'msg':m.content})
	data['timestamp'] = int(time.time())
	data['msg'] = msg
	if request.is_ajax():
		return e.HttpResponse( e.json.dumps(data), content_type='application/json' )
	return e.render(request, 'message.html', locals())		


def conversation(request,id=None):
	"""
		conversation with Friends and others
		@page - page_id for pagination
		@uid - user logged in Id
	"""
	try:
		uid= request.user.id
		messages_list = e.op.messages_list(uid, id)
		users_list = [ m.sender_id for m in messages_list ]
		profile_map = e.op.getFriendsProfileImage(users_list)
		p_map = {}
		for p in profile_map:
			p_map[p['user_id'] ] = p['profile_image']

		conversations=[]
		for m in messages_list:
			conversations.append({'image':p_map[m.sender_id],'msg':m})
		
		if request.is_ajax():
			data = {}
			data['html']= e.get_template('ajax/main/message.html').render(e.Context({'conversations':conversations}) )
			return e.HttpResponse( e.json.dumps(data), content_type='application/json' )
		else:
			return e.render(request, 'message.html',locals())
	except:
		traceback.print_exc(file =sys.stdout)
		return e.render(request, 'message.html',locals())
		


@e.login_required
def remove_msg(request):	
	return HttpResponseRedirect('')


@e.login_required
def new_messages(request):
	data ={}
	#e.m.Message.objects.filter()
	return HttpResponse( e.json.dump(data), content_type='application/json')


@e.login_required
def recieverList(request):
	data={}
	if request.POST:	
		name = request.POST.get('name')		
		res = e.op.getFriendsWithProfile(request.user.id,name)
		data['html'] = e.get_template('ajax/messages/reciever_list.html').render( e.Context({"results":res,'q':name }) )
		for r in res:
			data['found'] = True
			break
	return  e.HttpResponse(e.json.dumps(data) , content_type ='application/json')


@e.login_required
def getFriendList(request):
	data=[]
	if request.POST:
		res = e.op.getFriendsWithProfile(request.user.id,'')
		ts = int(time.time())
		data.append({'timestamp':ts})
		for r in res:
			data.append({'user':{'id':r.id,'first_name':r.first_name,'last_name':r.last_name,'image':r.image}})
		return e.HttpResponse( e.json.dumps(data), content_type='application/json')	


@e.login_required
def getNewUnreadMessage(request):
	data={}
	if request.POST:
		timestamp  =  int(request.POST.get('ts'))		
		msg = []
		messages_list=e.op.getNewMessage(request.user.id, timestamp)
		for m in messages_list:
			msg.append({'uid':m.uid,'first_name':m.first_name,'last_name':m.last_name,'unread':m.unread,'time':e.myutil.timestamp(m.created),'msg':m.content})
		data['msg']=msg		
		data['timestamp'] = int(e.myutil.current_timestamp())-2
		if request.is_ajax():
			return e.HttpResponse( e.json.dumps(data), content_type='application/json' )


@e.login_required
def online(request):
	data={}
	try:
		me = request.user.id
		usr =request.GET.get('user')
		ts = request.GET.get('ts')
		if ts is None:
			ts = int(time.time())
		e.op.get_online_friends(me,usr,str(ts)	)	
	except Exception, ex:
		traceback.print_exc(file=sys.stdout)		
	finally:
		return e.HttpResponse({"html":"---->"}, content_type="application/json")


		