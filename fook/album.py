from fook import essential as e


@e.login_required
def create_album(request):
	data={}
	if request.POST:
		try:
			al_form = e.fook.forms.AlbumModelForm( data=request.POST)
			glry_imgs = request.POST.getlist('gry[]')
			img_count = len(glry_imgs)

			if al_form.is_valid() and img_count > 0:
				album =  al_form.save(commit = False)
				album.user =  request.user
				album.image_count = album.image_count + img_count
				album.save()
			
				lst =[]				
				for img in glry_imgs:
					lst.append( e.m.Gallery(image='temp/'+img,album =album) )
				e.m.Gallery.objects.bulk_create( lst  )
				html = e.get_template('ajax/new_album_box.html').render(e.Context({'album':album}))
				data['success']=True			
				data['html'] = e.json.dumps(html)
			else:
				data['error'] = True
				data['message'] = """Album Could not be created. 
				'Album name'  and atleast 1 image are required. """

		except Exception ,ex:
			data['error'] = True
			data['message'] = 'Internal Error %s' %ex
		return e.HttpResponse( e.json.dumps(data), content_type='application/json')	
	else:
		data['error'] = True
		data['message'] = 'Invalid request object %s' % request.POST
		return e.HttpResponse( e.json.dumps(data), content_type='application/json')	


@e.login_required
def delete_album(request):
	data ={}
	try:
		if request.is_ajax():
			
			if request.POST.has_key('al'):
				album = request.POST['al'] 
			else:
				raise Exception('Invalid Request Parameter "al" missing')
			if request.POST.has_key('user'):
				creator = request.POST['user']   
			else:
				raise Exception('Invalid Request Parameter "user" missing')
			user = request.user.id			

			if int(user) == int(creator):
				data['success'] = True
				data['script'] = e.script.delete_album( )
				e.m.Album.objects.filter(id=album,user=creator).delete()
			else:
				data['error'] = True
				data['message'] = 'You are not authorise to remove this content.'
			return e.HttpResponse( e.json.dumps(data), content_type='application/json')
	except Exception ,ex:
			data['error'] =True
			data['message'] = ex			
			return e.HttpResponse( e.json.dumps(data), content_type='application/json')

def album_add_photos(request):
	data= {}
	try:
		if request.is_ajax():
			glry_imgs = request.POST.getlist('gry[]')
			img_count = len(glry_imgs)

			al_id = request.POST['album']

			album = e.m.Album.objects.get( id = al_id)
			lst =[]				
			for img in glry_imgs:
				lst.append( e.m.Gallery(image='temp/'+img,album =album) )

			galry = e.m.Gallery.objects.bulk_create( lst  )

			e.m.Album.objects.filter(id= al_id).update(image_count= e.F('image_count')+img_count)

			html = e.get_template('ajax/album_photos_render.html').render(e.Context({'lst':lst,'gly':galry}))
			data['success']=True			
			data['html'] = html
			return e.HttpResponse( e.json.dumps(data), content_type='application/json')	
		else:
			raise Exception('invalid request!')
	except Exception, ex :
		print "%s" %ex
		data['error'] =True
		data['message']= ex
		return e.HttpResponse( e.json.dumps(data), content_type='application/json')

def album_add_photo_form(request):		
	data = {}
	if request.is_ajax() and request.POST:
		album = request.POST['album']
		html = e.get_template('ajax/album_add_photo.html').render( e.RequestContext(request,{'album':album}) )

		return e.HttpResponse(e.json.dumps(html), content_type='application/json')


@e.login_required
def viewcomments(request):
	data={}
	try:
		post = request.POST['post']
		ptype = request.POST['post_type']
		cmnts = e.op.getCommentsList(post, request.user.id, ptype)
		data['success'] = True
		data['html'] = e.get_template('ajax/post/commentslist.html').render( e.Context({'comments':cmnts}) )		
	except Exception ,ex:
		data['error'] = ex.message
	return e.HttpResponse( e.json.dumps(data) , content_type='application/json' )


@e.login_required
def add_comment(request):
	data={}
	try:
		post = request.POST['post']
		cmnt = request.POST['cmt_txt']
		user = request.POST['user']
		typ = request.POST['post_type']
		cmnt = e.m.PostComment.objects.create(post_id=post, msg= cmnt, user_id= user, post_type =typ);
		e.m.Gallery.objects.filter(id=post).update(comments =e.F('comments')+1)
		e.op.new_activity(post_id= post, user = request.user ,act=7, post_type=typ)
		profile =e.m.UserProfile.objects.filter(user__id=user).values('profile_image','first_name','last_name')
		data['success'] = True
		data['html'] = e.get_template('ajax/post/comment.html').render(e.Context({'comment':cmnt,'profile':profile}))
	except Exception,ex:
		data['error'] = ex.message
		print "Ex:%s" %ex
	return e.HttpResponse( e.json.dumps(data), content_type='application/json')


@e.login_required
def remove_image(request):
	data={}
	try:
		if request.POST:
			imid = request.POST.get('imid')
			al= request.POST.get('al')
			user = request.user.id

			if imid and user:
				album = e.m.Album.objects.filter( id=al,user_id= user).values()				
				if len(album): 
					img = e.get_object_or_404( e.m.Gallery, id=imid)					
					img.delete()
					album.update( image_count = e.F('image_count')-1 )	
				else:
					data ={'error':True,'messages':'Can not remove image'}
					return e.HttpResponse( e.json.dumps(data), content_type="application/json")
			if request.is_ajax():								
				data ={'success':True,'messages':'Image removed '}								
				return e.HttpResponse( e.json.dumps(data), content_type="application/json")
	except:
		e.traceback.print_exc(e.sys.stdout)
	finally:
		if not request.is_ajax():
			return e.HttpResponseRedirect('/gallery')