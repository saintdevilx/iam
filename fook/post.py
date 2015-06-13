import fook.essential as e
import sys,traceback

@e.login_required
def remove(request):
	data={}
	if request.is_ajax():
		post =  request.POST['post']
		user = request.POST['user']
		if user == request.user.id:
			e.m.Post.objects.filter(id= post,user_id = request.user.id).delete()
			data['success']=True
		else:
			data['error'] = 'Content Can not be removed.'
		return e.HttpResponse(e.json.dumps(data), content_type='application/json')
	else:
		data['error'] = 'Invalid Request'
		return e.HttpResponse( e.json.dumps(data), content_type='application/json')

@e.login_required
def edit(request):
	data ={}
	if request.is_ajax() and request.POST:
		post = request.POST['post']
		

'''
 Add post view
 @ post_form_data
 @ attachment_form_data
'''
@e.login_required
def add_post(request):
	data ={}
	try:
		if request.POST:
			pid = request.POST.get('unpublished')
			if pid is not None:				
				ins = e.m.Posts.objects.get(id= pid)
				post_form = e.fook.forms.PostModelForm( request.POST, instance = ins)				
			else:
				post_form =  e.fook.forms.PostModelForm( data=request.POST)
			print "-"*60
			print "Post_form:%s"%post_form
			if post_form.is_valid() :				
				post = post_form.save(commit=False)						
				post.user = request.user
				post.publish = 'y'
				post.save()				
				e.op.new_activity(post_id= post.id, user = request.user ,act=1, typ='109979988')
				html = e.render_to_string('ajax/posts.html',{'posts':[post] }) 
				data['html'] =html
				data['success'] =True
			else:
				data['validationErrors'] = post_form.errors
				raise Exception('Something Went Wrong.%s' %post_form.errors)		
	except Exception, ex:
		e.traceback.print_exc( file= e.sys.stdout)
		data['error'] = 'Error'

	return e.HttpResponse(e.json.dumps(data), content_type='application/json')


@e.login_required
def add_comment(request):
	data={}
	try:
		post = request.POST['post']
		cmnt = request.POST['cmt_txt']
		user = request.user.id
		typ = request.POST['post_type']
		#ob = {109979988:e.m.Posts,109979989:e.m.Album,109979990:e.m.Gallery,109979991:e.m.PostComment,
		#109979992:e.m.ProfileImage,109979993:e.m.Videos}
		ob = e.m.POST_TYPE
		cmnt = e.m.PostComment.objects.create(post_id=post, msg= cmnt, user_id= user, post_type=typ); 							 
		if ob.has_key(typ):
			ob[typ].objects.filter(id=post).update(comments =e.F('comments')+1)
		else:
			print "*"*60
			print "Comments not incremented...."
		e.op.new_activity(post_id= post, user = request.user ,act=7, typ=typ)
		profile =e.m.UserProfile.objects.prefetch_related('user').values('profile_image','user__first_name','user__last_name','user__id').get(user__id = user)
		data['success'] = True
		data['html'] = e.get_template('ajax/post/comment.html').render(e.Context({'comment':cmnt,'profile':profile}))
	except Exception,ex:
		e.traceback.print_exc( file=sys.stdout)
		print "Ex:%s" %ex
	return e.HttpResponse( e.json.dumps(data), content_type='application/json')


@e.login_required
def viewcomments(request):
	data={}
	try:
		post = request.POST.get('post')
		ptype = request.POST.get('type')
		uid = request.user.id
		page = int( request.POST.get('page',0) )
		total = int(request.POST.get('length',0) )
		has_more = total > ( page*10 +10)
		cmnts = e.op.getCommentsList(post, request.user.id,ptype,page,limit=10)
		data['success'] = True
		data['html'] = e.render_to_string('ajax/post/commentslist.html',{'comments':cmnts,'uid':uid, 
			'total':total,'has_more':has_more,'post':post,'page':page+1,'ptype':ptype}) 
	except Exception ,ex:
		data['error'] = ex.message
		traceback.print_exc(file= e.sys.stdout)
	return e.HttpResponse( e.json.dumps(data) , content_type='application/json' )


@e.login_required
def my_posts(request):
	data = {}
	try:
		user = request.user.id
		posts = e.m.Posts.objects.filter( user_id = user).order_by('-created')[:10]
	except Exception , ex:
		data['error'] = ex.message
		traceback.print_exc(file= e.sys.stdout)

	if request.is_ajax():
		data['html'] =  e.get_template('ajax/post/my_posts.html').render( e.Context({'posts':posts}) )
		return e.HttpResponse( e.json.dumps(data), content_type='application/json')
	else:
		return e.render_to_response('ajax/post/my_posts.html', locals() )


@e.login_required
def viewlikes(request):
	data ={}
	try:
		user = request.user.id
		post = request.POST['post']
		_type =  request.POST['type']
		likers = e.op.getLikers(post, _type)
	except Exception, ex:
		data['error'] = ex.message
	finally:
		if request.is_ajax():
			#print "likers: %s" %likers
			data['html'] = e.get_template('ajax/post/likers.html').render( e.Context({'likers':likers}) )
			return e.HttpResponse( e.json.dumps( data ), content_type='application/json' )
		else:
			data['html'] = e.get_template('ajax/post/likers.html').render( e.Context({'likers':data}) )
			return e.HttpResponse( e.json.dumps( data ), content_type='text/html' )


@e.login_required
def add_attachment(request):
	data= {}
	if request.FILES and request.POST :
		try:
			pid = request.POST.get('unpublished')
			post = None

			if pid is not None:
				post = e.m.Posts.objects.get( id =pid)
			else:
				post = e.m.Posts.objects.create()
				pid =  post.id							

			atc_form = e.fook.forms.AttachmentForm( request.POST ,request.FILES)

			if  atc_form.is_valid():				
				at = atc_form.save(commit=False)
				at.post = post
				at.save()
				thumb = e.myutil.generateAllAliases(at.attachment, alias='attachment')
				data['publish'] =  post.id
				data['file'] = thumb[1].url
				data['attachment'] = at.id
				data['success']	= True
			else:
				data['Error'] = "File not found %s "%( atc_form.errors)
			
		except Exception,ex:
				traceback.print_exc(file=sys.stdout)
				data['Error'] = "Internal Error"
		return e.HttpResponse( e.json.dumps(data), content_type='application/json')	


@e.login_required
def mention(request):
	data={}	
	if request.POST:	
		name = request.POST.get('name')		
		res = e.op.getFriendsWithProfile(request.user.id,name)
		data['html'] = e.get_template('ajax/post/mention_friend.html').render( e.Context({"results":res,'q':name }) )
		for r in res:
			data['found'] = True
			break
	return  e.HttpResponse(e.json.dumps(data) , content_type ='application/json')

@e.login_required
def removePost(request):
	try:	
		data={}
		if request.POST:
			user = request.user.id
			post_id =  request.POST.get('post')
			post_type = request.POST.get('type')
			
			post = e.m.POST_TYPE[post_type].objects.filter( id = post_id, user_id = user )		
			if post:			
				status = post.delete()
				print "delete Status%s"%status
				data['success'] =True
				data['deleted'] = True
			else:
				data['error'] = True
				data['message'] = "Content is either does not exist or you are not authorise to access."	
	except:
		e.traceback.print_exc(file= e.sys.stdout )
	finally:
		if request.is_ajax():	
			return e.JSONResponse( request, data )
		else:
			return e.HttpResponseRedirect('/feeds')

@e.login_required
def view_post(request):
	try:
		data={}
		pid = request.GET.get('post_id')
		ptype= request.GET.get('post_type')
		post = e.op.getPost(pid,ptype)
		
		if request.is_ajax():
			data['html'] = e.render_to_string('ajax/post/_view_post.html',{'post':post}) 
		data['success'] = True
	except:
		data['error'] =True
		traceback.print_exc(file=sys.stdout)
	finally:
		if request.is_ajax():
			return e.HttpResponse( e.json.dumps(data), content_type='application/json' )
		else:
			return e.render(request,'ajax/post/view_post.html',locals())
