from fook import essential as e
from django.contrib.auth.decorators import login_required

@e.login_required
def basic_info(request):
	user = request.GET.get('user')
	if not user:
		user =  request.user.id
	info = e.op.basic_info(user)			
	me=False
	if long(user) == long(request.user.id):
		me=True
	if request.is_ajax():
		html = e.get_template('ajax/profile_info.html').render(e.Context({'info':info,'user':request.user,'me':me}))
		data={'html':html}
		return e.HttpResponse(e.json.dumps(data), content_type='application/json')
	else:		
		return e.render(request,'ajax/userprofile/info.html',locals())


@e.login_required
def more_info(request):
	data={}
	try:
		if request.is_ajax():
			user = request.POST['user']
			info = e.op.profile_info_more(user)		
			html = e.get_template('ajax/profile_info_more.html').render(e.Context({'info':info[0],'user':request.user.id}))
			data['html']=html
		else:
			raise Exception('Invalid Request')
	except Exception, ex:
		data['error'] = ex.message
		print "[[%s]]"%ex
	return e.HttpResponse(e.json.dumps(data), content_type='application/json')


@e.login_required
def edit_form(request):
	if request.is_ajax():
		pr = e.m.UserProfile.objects.values('user__id','user__email','user__first_name', 'user__last_name',
			'gender','birthday','education','works', 
		'phone','hometown').get(user__id = request.user.id)

		pr_form = e.fook.forms.UserProfileModelEditForm( pr )	

		pr_user_form = e.fook.forms.UserModelEditForm({'first_name':pr['user__first_name'],
			'last_name':pr['user__last_name'],'email':pr['user__email']})			

		html =  e.get_template('ajax/user_profile_edit_form.html').render( e.Context({'pr_user_form':pr_user_form,
			'pr_form':pr_form,'user':pr['user__id']}) )				
		return e.HttpResponse(e.json.dumps(html), content_type='application/json')
	else:
		raise Exception('Invalid Request')

@e.login_required
def update(request):
	try:
		if request.POST:			
			profile = e.get_object_or_404(e.m.UserProfile, user_id= request.user.id)
			post = request.POST
			cat = request.GET.get('type')
			if cat == "basic":
				profile.first_name = post['first_name']
				profile.last_name = post['last_name']
				profile.gender = post['gender']

			elif cat == "birthday":
				profile.birthday =  post['bday_year']+'-'+post['bday_month']+'-'+post['bday_day']

			profile.save()			
			if request.is_ajax() :
				html = e.get_template('ajax/profile_info_more.html').render(e.Context({'info':profile}))
				data={'html':html}
				return e.HttpResponse( e.json.dumps(data), content_type='application/json')
			else:
				return e.HttpResponseRedirect('/profile')
		else:
			raise Exception('validation Errors'%(pr_form.errors, pr_user_form.errors))

	except Exception, ex:
		data={}
		e.traceback.print_exc(file=e.sys.stdout)
		return e.HttpResponse( e.json.dumps(data), content_type='application/json')

@e.login_required
def edit(request):
	data={}
	try:
		if request.is_ajax():		

			tgid  = request.POST['tgid']
			tag = request.POST['tg']
			ex = request.POST['ex']
			fld = request.POST['fld']
			edit =  request.POST['edit']
			if int(ex) == 0:
				ed = e.m.Tags.objects.create(tag_name= tag, tag_type=  fld )
				id= ed.id
			else:
				id = tgid

			edit_fld = {'education': 'education','city':'cur_city','hmt':'hometown'}
			if edit == 'edu':
				e.m.UserProfile.objects.filter(user__id= request.user.id).update( education=id )
			elif edit == 'city':
				e.m.UserProfile.objects.filter(user__id= request.user.id).update( cur_city=id )				
			elif edit == 'hmt':
				e.m.UserProfile.objects.filter(user__id= request.user.id).update( hometown=id )
			html = e.get_template('ajax/userprofile/ed_update.html').render(e.Context({'std':id}) )
			data['html']=html
	except Exception, ex:
		data['error']= ex.message
	return e.HttpResponse(e.json.dumps(data), content_type='application/json')	

@login_required
def updatePhone(request):
	data ={}
	if request.POST:
		phone = request.POST.get('phone')
		update  =e.UserProfile.objects.find(user_id = request.user.id ).update( phone =phone)
		data['success'] = True
		data['update'] = update
		if request.is_ajax():
			return e.HttpResponse( e.json.sumps(data), content_type='application/json' )

@login_required
def editResidence(request):
	data ={}
	try:
		if request.POST:
			hmtwn = request.POST.get('hmtwn')
			_type = request.POST.get('type')
			page = None
			city_page = None
			if hmtwn == "":
				city =  request.POST.get('city')
				state = request.POST.get('state')
				country = request.POST.get('country')
				_city =  e.m.City.objects.create(city_name =city, state_id= state ) 
				page = e.m.Pages.objects.create(page_name =city, page_city = _city.id, page_state = state,page_country =country, page_type = 54339 ) #page_type city =54339
				hmtwn = page.id 
				data['city'] = city
			elif hmtwn:
				city_page = e.m.Pages.objects.get(id= hmtwn)				
				data['city'] = city_page.page_name

			if hmtwn and _type == "hometown":
				e.m.UserProfile.objects.filter(user_id = request.user.id ).update( hometown = hmtwn )
				data['success']= True
				data['type'] ='hometown'
			elif hmtwn and _type == "cur_city":
				e.m.UserProfile.objects.filter(user_id = request.user.id ).update( cur_city = hmtwn )			
				data['success'] = True
				data['type'] ='cur_city'
			else:			
				data['error'] = True		

			if request.is_ajax():
				return e.HttpResponse( e.json.dumps(data) , content_type='application/json')
		else:
			_type = request.GET.get('type')
			data['html'] =  e.get_template('ajax/userprofile/ed_hometown.html').render( e.Context({'type':_type}) )
			data['success'] =True		
	except:
		data['exception'] = True		
		e.traceback.print_exc(file=e.sys.stdout)
	finally:		
		if  request.is_ajax():
			return e.HttpResponse( e.json.dumps(data) , content_type='application/json')


@login_required
def editEducation(request):
	data={}
	try:
		if request.POST:
			school = request.POST.get('school')		
			page_city=None
			page_school=None
			if school == "":
				school_name = request.POST.get('school_name')
				school_city = request.POST.get('city')
				city_name = request.POST.get('city_input')
				state = request.POST.get('state')			
				country = request.POST.get('country')
				if not school:
					if school_city:
						page_city = e.m.Pages.objects.get(id=school_city)
					elif city_name and state and country:
						_city =  e.m.City.objects.create(city_name =city_name, state_id= state ) 
						page_city = e.m.Pages.objects.create(page_name =city_name, page_city = _city.id, page_state = state,page_country =country, page_type = 54339 ) #page_type city =54339

					if len(school_name)>2  and page_city:
						page_school = e.m.Pages.objects.create(page_name =school_name, page_city = page_city.id, page_state = page_city.page_state,page_country =page_city.page_country, page_type = 54331 ) #page_type city =54339
						school	=page_school.id			
					else:
						data['error'] = 'school Name, page_city required  '
			if school:			
				page_school = e.m.Pages.objects.get(id=school)
			
			e.m.UserProfile.objects.filter(user_id = request.user.id).update(education= school)
			data['success'] = True			
			data['school'] = page_school.page_name
		else:
			data['html'] = e.get_template('ajax/userprofile/ed_education.html').render(e.Context({}))
			data['success'] = True		
	except:
		data['exception'] = True
		e.traceback.print_exc(file=e.sys.stdout)
	finally:
		if request.is_ajax():
			return e.HttpResponse( e.json.dumps(data), content_type ='application/json' )


@login_required
def findEducation(request):
	data={}
	try:
		if request.POST:
			name = request.POST.get('name')
			_type= request.GET.get('type')
			if _type == "school":
				education = e.op.getEducation(name)
				found = False
				for ed in education:
					found=True
					break
				data['success'] =True
				data['html'] = e.get_template('ajax/userprofile/educationlist.html').render( e.Context({'education':education,'found':found,'name':name}))
				return e.HttpResponse( e.json.dumps(data), content_type='application/json' )
	except:
		e.traceback.print_exc(file=e.sys.stdout)


@login_required
def findLocation(request):
	data ={}
	if request.POST:
		name= request.POST.get('name')
		_type=  request.GET.get('type')
		data['success'] = True		
		found =False
		if _type == "city":
			location = e.op.getLocation(name)			
			for l in location:
				found =True
				break
			data['html'] = e.get_template('ajax/userprofile/location_list.html').render( e.Context({'location':location,'found':found,'name':name}))
		elif _type == "state":
			state_list = e.op.getState(name)
			for l in state_list:
				found =True
				break
			data['html'] = e.get_template('ajax/userprofile/state_list.html').render( e.Context({'location':state_list, 'found':found}) )			
	return e.HttpResponse( e.json.dumps(data), content_type='application/json' )

@login_required
def checkUsername(request)	:
	if request.POST:
		username =  request.POST.get('username')

@login_required
def album_list(request):
	user = request.GET.get('user')
	page = request.GET.get('page')
	albums = e.op.get_album_list(user=user,page=page)
	empty=True
	for al in albums:
		empty=False
		break
	if request.is_ajax():
		data ={}
		data['success'] =True
		data['html'] = e.get_template('ajax/userprofile/album_list.html').render(e.Context({"albums":albums,"empty":empty}) )
		return e.HttpResponse( e.json.dumps(data), content_type="application/json")
	else:
		return e.render(request,'ajax/userprofile/album_list.html',locals())

@login_required
def video_list(request):
	usr = request.GET.get('user')
	page= request.GET.get('page')
	videos = e.op.get_video_list(user=usr,page=page)
	empty= e.myutil.is_empty(videos)
	if request.is_ajax():
		data={}
		data['success'] = True
		data['html'] = e.get_template('ajax/userprofile/videos_list.html').render( e.Context({"videos":videos,'empty':empty}) )
		return e.HttpResponse( e.json.dumps(data), content_type="application/json" )
	else:
		return e.render( request, 'myvideos.html', locals() )

@login_required
def list_profile_images(request):
	try:
		data ={}
		user = request.GET.get('user') or request.user.id
		_type = request.GET.get('type')
		images = e.m.ProfileImage.objects.filter(user_id = user)[:10]
		data['html'] = e.render_to_string('ajax/main/_profile_picture.html',{'images':images})
		data['success'] = True
	except:
		data['error'] = True
		data['message'] = "Images not found"
		e.traceback.print_exc(file=e.sys.stdout)
	finally:
		if request.is_ajax():
			return e.JSONResponse( request, data )
		return e.render( request, 'ajax/main/profile_picture.html',locals())
	