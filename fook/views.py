'''		
	In built django Modules
'''
from django.shortcuts import render_to_response,render
from django.http import HttpResponseRedirect, HttpResponse,HttpResponseNotFound, Http404
from django.template import Template, Context,RequestContext
from django.contrib.auth import authenticate,logout,login,get_user
from django.contrib import messages
from django.contrib.auth.decorators import login_required
import json
from django.template.loader import get_template, render_to_string
from django.db.models import Q,F,Count
'''	
	In Built defined Modules
'''
import fook.forms 		# Import User Forms
import fook.models as m		#Import User Models 
import fook.db_operations as op
import fook.script as script
import fook.apis_options as apis
import fook.util as myutil
import fook.settings as settings
import time
import sys,traceback
from django.utils.html import strip_spaces_between_tags

# Index Home page
def index(request):	
	if request.user.is_authenticated():
		return HttpResponseRedirect('/home')
	else:
		form = fook.forms.SigninForm()	
		return render(request,'index.html' , locals())


#Signup Registration Page
def signup(request):
	if request.user.id is not None :
		messages.info(request," You're already logged in. ")		
		return HttpResponseRedirect('home')

	if request.method == 'POST':
		form = fook.forms.UserSignupModelForm( data = request.POST)
		profile_form = fook.forms.UserProfileModelForm( data = request.POST)
		if  form.is_valid() and profile_form.is_valid() :			
			user =  form.save(commit = False)			
			user.set_password(user.password)						
			user.save()

			birthday =  request.POST['birthday_year'] +"-"+request.POST['birthday_month'] +"-"+ request.POST['birthday_day']
			m.UserProfile.objects.create( user = user, gender = request.POST['gender'], birthday = birthday ,email = request.POST['email'], first_name = request.POST['first_name'],last_name=request.POST['last_name'])			
			messages.info(request," Signup Completed successfully! ")
			return HttpResponseRedirect('/signin')	
		else:
			print "form:%s\n\n user:%s\n\n" % (form.errors, profile_form.errors)

	else:		
		form = fook.forms.UserSignupModelForm()
		profile_form = fook.forms.UserProfileModelForm()
	return render_to_response( 'signup', locals())


# Thanks Page
@login_required
def thanks(request):
	return render_to_response('thanks')

def forgotPassword(request):
	if request.POST:
		pass
	elif request.user.id is None:
		return render(request, 'forgetpass.html')
	return HttpResponseRedirect('/home')


# Login Signin Page
def signin(request):		   
	if request.method == 'POST':		
		username = request.POST['username']
		password = request.POST['password']
		form = fook.forms.SigninForm(request.POST)
		if form.is_valid():			
			user = authenticate(username = username, password= password)			
			if user:
				login(request, user)												
				m.UserLoginHistory.objects.create(ip=request.META['REMOTE_ADDR'], browser = request.META['HTTP_USER_AGENT'], user_id= user.id)
				return HttpResponseRedirect('home')			
			else:
				messages.error(request,"Login Error Please check username and password ")				
		else:
			messages.error(request,"Seems like you have not filled form completely!")
	else:
		form = fook.forms.SigninForm()
		if request.is_ajax():
			return HttpResponse({"error":"Login Required",'auth':True}, content_type="application/json")
	
	return render(request,'signin',locals())

# Search Page View
@login_required
def search(request):
	data={}
	res2=None
	q = request.GET.get('q')
	_type = request.GET.get('type')
	offset = request.GET.get('offset')
	if q is not u"":
		if _type == u"video":
			from fook.SearchManager import searchVideo
			return searchVideo(request,q)
		if _type is None or _type == u"people":
			res=[]							
			res2 = m.UserProfile.objects.filter( Q(user__email= q)|Q(user__username = q) | Q(user__first_name__icontains = q)| Q(user__last_name__icontains = q) ).values(
				'user_id','user__first_name','user__last_name','profile_image','education','hometown','cur_city')[:10]								
			
			other_info_id =[]
			for r in res2:
				other_info_id.append( long(r['hometown'] or 0) )
				other_info_id.append( long(r['cur_city'] or 0) )
				other_info_id.append( long(r['education'] or 0) )

			other_info_id = myutil.unique( other_info_id )
			p_info = m.Pages.objects.filter( id__in = other_info_id ).values('page_name','id')
			other={}
			for p in p_info:
				other[ p['id'] ] = p

			results = []
			for r in res2:
				results.append({
					'user': r,
					'other' : { 'education': other.get( long( r['education'] or 0 )), 'hometown': other.get( long(r['hometown'] or 0)), 'city':other.get(long(r['cur_city'] or 0)) }
					})
			data = render_to_string('ajax/search/search_user_results.html',{"results":results,'q':q })
		else:
			raise Http404
		if request.is_ajax():
			return HttpResponse( json.dumps(data) ,content_type ='application/json')
	return  render( request,'search.html', locals()) #{'results':results,'q':q}

# Logout Views
@login_required
def logoutaccount(request):
	logout(request)
	#render_to_response('logout')
	return HttpResponseRedirect('/index')


"""
	Home page view 
	Display inital posts and attachment 
"""
@login_required
def home(request):	
	user_id = request.user.id
	if user_id is not None :
		post_form = fook.forms.PostModelForm( )		
		birthday = fook.onlogin.friendsBirthday(user_id)
		p = request.GET.get('page')
		page =int(p)  if p else 0
		ftype =  request.GET.get('type')
		return render(request,'home', locals() )
	else:
		return HttpResponseRedirect('index')

@login_required
def feeds(request):
	if request.is_ajax():
		data={}
		data['html']= get_template('ajax/main/feeds.html').render( Context({})).decode('utf-8').decode()
		data['success']=True
		data['script'] = "Feeds.init(%s);"%time.time()
		return HttpResponse( json.dumps(data), content_type='application/json' )
	else:
		return HttpResponseRedirect('/home')

@login_required
def more_feeds(request):
	data= {}
	try:
		p = request.GET.get('page')
		page =int(p)  if p else 0
		ftype =  request.GET.get('type')
		uid = 	request.user.id
		posts = op.getAllTypeOfPost(uid,page=page,limit=10,ftype=ftype)		
		if posts is None:
			data['erorr'] = 'no more Feeds'
			data['end']  = True	
		else:		
			data['html'] = render_to_string('ajax/posts.html',{'posts':posts,'uid':uid})
	except Exception,ex:
		print "More_feeds Views.py"
		traceback.print_exc( file=sys.stdout)
		data['error'] = 'Error Occured'
	if request.is_ajax():
		return HttpResponse( json.dumps(data,ensure_ascii=True), content_type='application/json' )		
	return HttpResponseRedirect('/home')	
'''
	Vote view -- 	
'''
#ob = {109979988:m.Posts,109979989:m.Album,109979990:m.Gallery,109979991:m.PostComment}
@login_required
def vote(request):
	data ={}
	if request.POST :	
		try:
			cat_id = request.POST['post']
			typ = request.POST['type_id']	
			ob = {109979988:m.Posts,109979989:m.Album,109979990:m.Gallery,109979991:m.PostComment,109979992:m.ProfileImage,109979993:m.Videos}
			liked = m.Post_Likes.objects.get_or_create( user_id=request.user.id ,post_id = cat_id,post_type= typ)
			data['dt']={}
			if liked[1]:
				ob[int(typ)].objects.filter( id = cat_id).update( likes= F('likes')+1)		
				act = op.new_activity(post_id= cat_id, user = request.user ,act=3,gallery_id=None, typ=typ)			
				data['dt']['act'] = act.id
			else:
				data['exist'] = True

			post = ob[int(typ)].objects.values('likes').get(id=cat_id)
			data['success'] = True
			data['dt']['count']= post['likes']
			data['dt']['likeid']=liked[0].id
		except Exception,e:
			traceback.print_exc(file=sys.stdout)
			
		if request.is_ajax():				
			return HttpResponse(json.dumps(data), content_type='application/json')		
	return HttpResponseRedirect('home')	

@login_required
def unvote(request):
	data={}
	if request.POST:				
		try:	
			user  = request.user.id
			ob = {109979988:m.Posts,109979989:m.Album,109979990:m.Gallery,109979991:m.PostComment,109979992:m.ProfileImage}
			post = request.POST['post']
			typ = request.POST['type_id']			
			act = request.POST['act']
			_like = request.POST['likeid']
			count = request.POST['count']
			if user and  post and typ and _like:
				if m.Post_Likes.objects.filter( id =_like ).exists():									
					m.Post_Likes.objects.filter( id =_like ).delete()				
					ob[int(typ)].objects.filter( id = post).update( likes= F('likes')-1)		
					#m.Posts.objects.filter(id= post, post_type=typ ).update(likes=F("likes")-1)
					if act=="":
						act =0
					m.Activity.objects.filter( Q(id = act) |  Q(post_id =post, post_type=typ, act_id=3, user_id =user)   ).delete()										
				else:
					data['exist'] = False
				
				data['success'] = True	
				data['count']	= count
				data['id'] =post
				data['script'] = script.success_unvote(data)										

			else:
				raise Exception("Invalid Request Post:%s type:%s act:%s like:%s"%(post, typ,act,_like) )
				
		except Exception, ex:			
			traceback.print_exc(file=sys.stdout)
			data['error'] = 'Invalid Request. %s' %ex

		if request.is_ajax():				
			return HttpResponse(json.dumps(data), content_type='application/json')
	return HttpResponseRedirect('home')	


@login_required
def follow(request):
	if request.POST :
		page_id = request.POST['category_id']			
		page = m.Follows.objects.filter(page_id=page_id, user_id=request.user.id)
		if not page :
			m.Pages.objects.filter(id=page_id).update( follower=F('follower')+1)
			follower = m.Follows.objects.create(page_id=page_id, user_id=request.user.id)
			data={}
			data['success'] = True
			data['event'] = 'Unfollow'
			data['category'] = request.POST['category']			
			data['id'] = page_id			
			follower.save()
			data['script']  = script.follow_page(data)
		else :			
			raise

		return HttpResponse( json.dumps(data), content_type='application/json' )

def page_profile(request, page_id):
	page = op.page_profile(request.user.id, page_id)
	posts = page['posts']
	page_info = page['page_info']
	return render(request,'page_profile.html',locals())

@login_required
def unfollow(request):
	if request.POST:
		page_id = request.POST['category_id']			
		follow = m.Follows.objects.filter(page_id=page_id)
		follow.delete()
		data={}
		data['success'] = True
		data['event'] = 'Follow'
		data['category'] = request.POST['category']
		data['id'] = page_id
		
		data['script']  = script.unfollow_page(data)
		return HttpResponse( json.dumps(data), content_type='application/json' )		


#@login_required
def follow_suggestion_widget(request):	
	if  request.is_ajax():
		uid = request.user.id
		followed =  m.Follows.objects.filter(user_id=uid).values_list('page_id',flat=True)		
		pages = m.Pages.objects.exclude( id__in = followed )[:5] 
		html = get_template('ajax/page_suggestions').render( Context({'pages':pages})) 
		return HttpResponse( json.dumps(html),content_type='application/json')	

def cover_change(request):
	if request.POST:
		page_id = request.POST['page']

		if 'cover_pic' in request.FILES and page_id is not None:						
			page =  m.Pages.objects.get( id= page_id)
			setattr(page,'page_profile', request.FILES['cover_pic'])			
			page.save()			
			messages.success(request,'Image updated successfully.')
		else:
			messages.error(request,'Image can not be updated, Please try again.')
	return HttpResponseRedirect('page/%s'%page_id )


def more_post(request):
	if request.is_ajax():
		if request.GET:
			page = request.GET['page']	
			more = request.GET['more']
		else:
			page = request.POST['page']	
			more = request.POST['more']			
		result = op.homeQuery(request.user.id, limit=more, page=page)['posts']
		html = get_template('ajax/posts.html').render( Context({'posts':result,'page':page})) 
		has_more =1
		if len(result) < more:
			has_more =0
		
		scr = script.more_post({'html':json.dumps(html), 'page':page,'has_more':has_more})		

		return HttpResponse( json.dumps({'script':scr,'success':True}), content_type='application/json')


"""
	User Profile View
	@userid   automatically get userid from 'request' object	
"""
@login_required
def profile(request):	
	try:
		user_info = request.user
		username = request.user.first_name+" "+request.user.last_name	
		uid = request.user.id
		profile = m.UserProfile.objects.get(user_id=uid).__dict__
		act = request.GET.get('act')

		me= True
		if request.is_ajax():
			data={}
			layout =False
			data['html'] =  get_template('ajax/main/profile.html').render( Context({'user_info':user_info,'username':username,
				'uid':uid,'profile':profile,'me':me}))
			data['script'] = "Profile.loadProfile(%s)"%uid
			data['success'] =True
			return HttpResponse( json.dumps(data), content_type='text/html' )
		else:		
			return render(request,'profile.html', locals())
	except:
		print "-"*50
		traceback.print_exc(file=sys.stdout)
		print "-"*50

@login_required
def view_profile(request,uid):
	try:
		layout = True		
		userid = request.user.id		
		
		if uid.isnumeric():
			_user = m.User.objects.values('id','first_name','last_name').get(id=uid)
			profile = m.UserProfile.objects.values('user_id','gender','profile_image','current_profile','birthday').get(user_id=uid)
		else:
			_user = m.User.objects.values('id','first_name','last_name').get(username=uid)
			profile = m.UserProfile.objects.values('user_id','gender','profile_image','current_profile','birthday').get(user__username=uid)			

		if profile is None:			
			if request.is_ajax():
				return None
			else:
				return HttpResponseRedirect('/home')
		else:
			print "Profile found"
			uid= profile['user_id']
				
		username = _user['first_name']+" "+_user['last_name']
		user_info = _user
		profile['user'] = _user

		from django.db.models import Q
		friend = m.Friend.objects.values('id','status').filter(  Q( friend_of=_user['id'] ,friend_id = userid  ) |  Q( friend_of=userid , friend_id = _user['id']  ) )
		me= False
		if uid == userid:
			me =True
		ln = len(friend)

		if ln and friend and int(friend[0]['status']) == 0:
			fstatus = 'Request Pending'	
			fid =  friend[0]['id']
		elif ln and friend and int(friend[0]['status']) == 1:
			fstatus = 'Friend'
			fid =  friend[0]['id']

		if request.is_ajax():
			data={}
			data['html'] =  get_template('ajax/main/profile.html').render( Context({'user_info':user_info,'username':username,
				'uid':uid,'profile':profile,'me':me}))
			data['script'] = "Profile.loadProfile(%s,false)"%uid
			data['success'] =True
			return HttpResponse( json.dumps(data), content_type='text/html' )		
			

	except  Exception, e:
		print "Error %s" % e		
		HttpResponseNotFound(  )
	return render(request,'profile.html', locals())

@login_required
def gallery(request,id=None):
	data={}
	try:		
		album =id
		uid= request.user.id	
		page = request.GET.get('page')
		if page is None:
			page=0

		gallery = op.albums_list(uid,id, 0,9)
		
		empty = True
		for i in gallery:
			empty = False
			break

		if id is not None  :		
			if empty == False  :
				author = gallery[0].album.user_id
				alid =gallery[0].album_id
				album_name = gallery[0].album.name
				count = gallery[0].album.image_count	
			else:
				end =True			
			template = 'albums.html'		
		else:
			template = 'gallery.html'
			count = gallery[0].album.image_count				
			author = gallery[0].album.user_id			

		me =True

		if request.is_ajax():	
			if not empty:
				data['html'] = render_to_string('ajax/main/'+template,{'gallery':gallery,'uid':uid,'me':me}) 
			else:
				data['end'] =True
				data['error'] ='No More Image'
				data['html'] = '<span>No album found</span>'
			return HttpResponse( json.dumps(data), content_type='application/json' )
		else:			
			return render(request, template,locals())			

	except Exception,e:
		print "*"*60
		traceback.print_exc(file=sys.stdout)
		print "*"*60



@login_required
def gallery_friend(request,uid,id=None):
	data={}
	try:		
		album =id	
		friend =True
		page = request.GET.get('page')
		if page is None:
			page=0	
		gallery = op.albums_list(uid,id,page)

		empty = True
		for i in gallery:
			empty = False
			break

		if id is not None  :		
			if empty == False:			
				album_name = gallery[0].album.name
				alid =gallery[0].album_id
				author =  gallery[0].album.user_id
				count = gallery[0].album.image_count
			else:
				end = True
			template = 'albums.html'		
		else:
			template = 'gallery.html'
		uid = request.user.id
	except Exception, e:
		print "Exception:views:360:%s"%e	

	if request.is_ajax():
		if empty == False:
			if page is not None:
				template ='_gallery.html'
			data['html'] = get_template('ajax/gallery/'+template).render( Context({'gallery':gallery,'uid':request.user.id,'page':page}) )
		else:
			data['end'] =True
			data['error'] ='No More Image'
			data['html'] = ''
		return HttpResponse( json.dumps(data), content_type='application/json' )

	return render(request, template,locals())	


@login_required
def albums(request, id):
	uid = request.user.id	




@login_required
def friends(request):
	uid =  request.user.id	
	me = True
	page = request.GET.get('page')
	offset =  request.GET.get('offset')
	limit =  request.GET.get('limit')
	print "-*-"*20
	print "page:%s"%page
	friends_list = op.getFriends( uid, status=1 , page=page, limit=limit,offset=offset)
	if request.is_ajax():
		data={}
		data['html'] = get_template('ajax/main/friends.html').render( Context({'uid':uid,'friends_list':friends_list,'me':me}))
		return 	HttpResponse(json.dumps(data), content_type='application/json')
	return render(request, 'friends.html',locals())


def viewfriends(request,uid):
	friends_list = op.getFriends(uid ,status=1)
	return render(request,'friends.html',locals())


def friend_request(request):
	uid = request.user.id
	reqst = op.getFriendRequests( uid  )
	friends_list = reqst[0]		
	req_map =myutil.friendRequestMap( reqst[0], reqst[1] )
	html = get_template('ajax/friend_request.html').render( Context({'requests':friends_list})) 		
	scr = script.friend_request( {'html':json.dumps(html)})
	return HttpResponse( json.dumps({'script':scr,'success':True}), content_type='application/json')


def friend_suggestion(request):
	return None

@login_required
def albums_list(request):
	if request.POST and request.is_ajax():
		uid = request.POST['user']
		print
		albums =m.Gallery.objects.filter( album__user_id = uid).values('id','image','caption')[:2]				
		html = get_template('ajax/image_gallery.html').render(Context({'albums':albums}))

		#scr = script.image_gallery({'html':json.dumps(html)})		
		return HttpResponse( json.dumps( {'html':html,'success':True} ) , content_type='application/json')


@login_required
def friends_list(request):
	if request.POST and request.is_ajax():
		uid =  request.POST['user']
		friends = op.getFriends(uid, status=1 , limit=3)
		html = get_template('ajax/friends_list.html').render( Context({ 'friends':friends} ) )
		scr = script.render_html({'html': json.dumps(html)})
		return HttpResponse( json.dumps( {'script':scr,'success':True} ), content_type='application/json')

@login_required
def mutual_friends_list(request):
	if request.POST and request.is_ajax():
		friend = request.POST['user']
		uid = request.user.id
		friends = op.getMutualFriendsWithProfile(uid, friend, limit=3)
		
		html = get_template('ajax/mutual_friends.html').render( Context({'frnds':friends})) 	
	
		scr = script.render_html( {'html':json.dumps(html)})
	return HttpResponse( json.dumps({'script':scr,'success':True}), content_type='application/json')


@login_required
def my_activity(request):
	data= {}
	try:
		p =request.GET.get('page')
		user = request.POST.get('user')		
		page = int(p) if p else 0
		if user:
			uid = user
			my=True
		else:
			uid = request.user.id
			my=True

		posts = op.getAllTypeOfPost(uid,my=my,page=page,limit=5)

		if posts is None:
			data['erorr'] = 'no more Feeds'
			data['end']  = True	
		data['html'] = get_template('ajax/posts.html').render( Context({'posts':posts,'uid':uid}))

	except Exception,ex:
		print "More_feeds:155: %s"%ex
		data['error'] = 'Error Occured'
	if request.is_ajax():
		return HttpResponse( json.dumps(data), content_type='application/json' )


@login_required
def render_view(request):
	if request.is_ajax():
		templates ={
			'al_crt':'create_album.html',			
			'ad_ph' :'add_photo.html',
			'prupldr':'profile_pic_uploader.html',					
		}
		html =  get_template('ajax/%s'% templates[ request.POST['view'] ]).render(RequestContext(request,{'user_id':request.user.id}))
		return HttpResponse(json.dumps(html) , content_type='application/json')


@login_required
def list_images(request):
	if request.is_ajax:
		album = request.POST['al']
		user = request.POST['user']
		pl = request.POST.get('pl')
		user =  request.user.id
		type = request.POST.get('type')
		post = request.POST.get('post')
		img = op.get_image(user, album,pl,type,post)
		html = get_template('ajax/image_viewer.html').render( Context({'type':type,'img':img['image'], 'liked':img['liked']}) )
		return HttpResponse( json.dumps(html), content_type='application/json' )


@login_required
def get_profile_image(request):
	pic = m.UserProfile.objects.filter( user_id = request.user.id).values('profile_image')[0]
	data={'html': get_template('ajax/userprofile/acnt_profile_pic.html').render( Context({'u':pic}) ) }
	data['success'] = True
	return HttpResponse( json.dumps(data), content_type='application/json')

  

@login_required
def ajax_apis(request)	:	
	if  request.is_ajax():	
		try:			
			if request.POST:
				event = request.POST['event']
				category= request.POST['category']			
			else:
				event = request.GET['event']
				category = request.GET['category']			
			options = {
				'event':{
					'like':vote,
					'unlike':unvote,
					'suggestion':follow_suggestion_widget,
					'follow':follow,
					'unfollow':unfollow,
					'more_post':more_post,
					'addfriend':fook.friends.add_friend,
					'frnd_rqst':friend_request,
					'frnd_acpt':fook.friends.accept_friend,
					'unfrnd': fook.friends.unfriend,
					'frnd_sgstn' : friend_suggestion,
					'albums': albums_list,
					'friends' :friends_list,
					'mtl_frnd':mutual_friends_list,
					'my_act':my_activity,
					'page':render_view,
					'im_vw':list_images,
					'al_dl':fook.album.delete_album,
					#'prupldr': change_profile_image,
					'alrts': alerts,
					'gt_al':get_alerts,
					'bs_inf':fook.userprofile.basic_info,
					'pr_inf_mr': fook.userprofile.more_info,
					'pr_edt' :fook.userprofile.edit_form,
					'al_ad_ph':fook.album.album_add_photo_form,
					'boot':fook.onlogin.BootLoad,
					'acnt_pic':get_profile_image					
				},
				'category':{
					'post':'post',
					'page':'page',		
					'friend' :'friend',
				}
			}				
			return options['event'][ event](request)
		except Exception,e :
			data ={'error':True,'ajax':True,'message':' Invalid Request!.%s'%e}	
			return HttpResponse(json.dumps(data),content_type='application/json')


@login_required
def upload_image(request):
	if request.FILES :
		try:
			_file = request.FILES
			_id = request.POST['id']
			if _file is not None:
				_dir = 'temp/'

				uploaded =fook.util.AjaxImageUpload(request, path='fook/media/'+_dir)	
				data={}
				
				if uploaded.url is not None:
					html = get_template('ajax/render_uploaded_image.html').render( Context({'dir':_dir,'uploaded':uploaded,'id':_id}) )	
				return HttpResponse(json.dumps(html), content_type='application/json')
			else:
				return HttpResponse('Inrnal Error', content_type='application/json')
		except Exception,e:
			traceback.print_exc(file=sys.stdout)
			return HttpResponse('Error Occrred! %s'%e, content_type='application/json')
	else:		
		print "FILES: %s" % request.FILES
		return HttpResponse('Error Occured')



@login_required
def alerts(request):
	if request.is_ajax():
		try:		
			alrt = request.POST['alrt']
			res = op.get_alrts_count( alrt, request.user.id)		
			
			if res and res[0].count <1:
				data= 0;
			else:
				data={}
				data['count'] =res[0].count
		except Exception, ex:
			print "Exception :%s"%ex
		return HttpResponse( json.dumps(data), content_type='application/json')
	else:
		raise Exception('Invalid Request ')



@login_required
def get_alerts(request):
	data ={}
	try:
		if request.is_ajax():
			alrt = request.POST['alrt']
			reqst = op.get_alerts( alrt, request.user.id)								
			html= get_template('ajax/friend_request.html').render( Context({'requests':reqst,'rbn':True}) )
			data= {}
			data['html'] = html
			return HttpResponse( json.dumps(data), content_type='application/json' )
		else:
			raise Exception('Invalid Request')
	except Exception, ex:
		print "Exception: %s"%ex
	return HttpResponse( json.dumps(data), content_type='application/json' )


@login_required
def get_head(request):
	if request.is_ajax():
		head =  request.POST['head']
		head = m.get_friend_head(head, request.user.id)
		return HttpResponse( json.dumps(head), content_type='application/json' )


@login_required
def getNotification(request):
	try:
		data={}
		ts = request.GET.get("since")
		seen = request.GET.get('seen')
		read = request.GET.get('read')

		_page = request.GET.get('page')
		_offset = request.GET.get('offset', '5')
		_more = request.GET.get('more')

		if seen is not None:
			op.notification_seen()
		elif read is not None:
			id = request.GET.get('id')
			if(op.mark_notification_as_read(id)):
				data['mark_read'] =True
		else:
			since = myutil.current_timestamp()			
			_notif = op.getNotification(request.user.id, ts, page=_page, offset=_offset, more=_more)
			unseen = _notif['unseen']
			notif = _notif['notif']

			if  _page and _offset and _more :
				if not notif:
					data['end'] =True
					
			data['html'] = render_to_string('ajax/notification/notification.html',{'notification':notif} )		
			data['count'] = len(notif)
			data['unseen'] = unseen
			data['since'] =int(since)
		data['success'] =True
	except Exception, e:
		traceback.print_exc( file= sys.stdout)	
	finally:
		if request.is_ajax():
			return HttpResponse( json.dumps(data), content_type='application/json')
		return render(request,'ajax/notification/notification.html',{'notification':notif} )		

@login_required
def viewPost(request):
	try:
		post_id   = request.POST.get('post_id')
		post_type = request.POST.get('post_type')
		post = op.getPost(post_id, post_type)
		return HttpResponse( json.dumps(post), content_type='application/json')
	except:
		traceback.print_exc( file =sys.stdout )
	finally:
		if request.is_ajax():
			return HttpResponse( json.dump(data), content_type='application/json' )

