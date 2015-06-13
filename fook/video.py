'''		
	In built django Modules
'''
from django.shortcuts import render_to_response,render,get_object_or_404
from django.http import HttpResponseRedirect, HttpResponse,Http404
from django.template import Template, Context,RequestContext
from django.contrib.auth import authenticate,logout,login,get_user
from django.contrib import messages
from django.contrib.auth.decorators import login_required
import json
from django.template.loader import get_template
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
import traceback,sys


@login_required
def addNewVideo(request):
	import mimetypes
	data = {}
	try:
		if request.FILES:
			_file = request.FILES['video']
			visible= request.POST.get('visible')
			_name = _file.name
			_type,enc = mimetypes.guess_type(_name) 
			extns =mimetypes.guess_extension(_type)

			_dir = 'videos/'
			uploaded =fook.util.UploadVideo(request, path='fook/media/'+_dir)	
			if uploaded is not None:				
				data['token'] = uploaded.out_file_name[0]
				info = myutil.video_info(data['token'])			
				thumb = info.get('thumb')
				size = info.get('size')				
				dur = info.get('dur')
				success = m.Videos.objects.create( user= request.user,title=_name, token = data['token'] , type =_type, encoding= enc, visibility =visible, thumbnail= thumb, duration = dur  ,resolution= size)
				if success is not None:
					data['success']  = True
					data['message'] = 'uploaded successfully '
					data['html'] = get_template('ajax/video/render_video.html').render(Context({'video':success}))
			else:
				raise Exception('Something went wrong can not upload this file !')
		else:
			data['error'] =True
			data['message'] = "File Not found!"
	except Exception,ex:
		traceback.print_exc(file=sys.stdout)
		data['error'] = True
		data['message'] = 'Internal Error'
		return HttpResponse( "Exception %s"%ex.message)
	finally:
		if request.is_ajax():
			return HttpResponse( json.dumps(data), content_type="application/json" )
		else:
			if data.has_key('token'):
				return HttpResponseRedirect('/video?token=%s'%data['token'])
			else:
				return render(request, 'videos.html')

@login_required
def MyVideos(request):
	return HttpResponse(json.dumps({}))



@login_required
def edit_video_info(request):
	if request.POST:
		vid = request.POST.get('vid')
		title = request.POST.get('title')
		video = get_object_or_404( m.Videos, id=vid)

		if video is not None:
			video.title =  title
			video.save()

		if request.is_ajax():
			data['success'] = True
			data['video'] =  {'vid':video.id,'title':video.title,'likes':video.likes,'comments':video.comments,'views':video.views,'token':video.token,'duration':video.duration,'thumb':video.thumb}
			return HttpResponse( json.dumps(data), content_type='application/json')			
	return HttpResponseRedirect('/video')


@login_required
def videos(request):
	uid =request.user.id
	videos = m.Videos.objects.filter(user__id = uid).order_by('-created')[:10].values()
	me=True
	if request.is_ajax():
		data={}
		data['html'] = get_template('ajax/main/videos.html').render(Context({'videos':videos,'uid':uid,'me':me}))
		return HttpResponse(json.dumps(data), content_type='application/json')
	return render(request,'myvideos.html', locals())


@login_required
def friend_videos(request,uid):
	videos = m.Videos.objects.filter(user__id = uid)[:10].values()
	if request.is_ajax():
		data={}
		data['html'] = get_template('ajax/main/videos.html').render(Context({'videos':videos,'uid':uid}))
		return HttpResponse(json.dumps(data), content_type='application/json')
	return render(request,'myvideos.html', locals())



"""

"""
def getVideo(request):
	try:
		import os,mimetypes,urllib
		token =  request.GET.get('token')
		file_path = os.path.join('fook/media',"videos/"+token)
		original_filename = 'video/mp4'
		fp = open(file_path, 'rb')
		response = HttpResponse(fp.read())
		fp.close()
		#type, encoding = mimetypes.guess_type(original_filename)
		encoding = None
		#type="video/mp4"
		type=None
		if type is None:
			type = 'application/octet-stream'
		response['Content-Type'] = type
		response['Content-Length'] = str(os.stat(file_path).st_size)
		if encoding is not None:
			response['Content-Encoding'] = encoding
		if u'WebKit' in request.META['HTTP_USER_AGENT'] :
			filename_header = 'filename=%s' % original_filename.encode('utf-8')
		elif u'MSIE' in request.META['HTTP_USER_AGENT'] :
			filename_header = ""
		else:
			filename_header = 'filename*=UTF-8\'\'%s' % urllib.quote(original_filename.encode('utf-8'))
	except Exception,ex:
		#print "Exception:%s"%ex
		traceback.print_exc(sys.stdout)
		#return HttpResponseRedirect('/home')

	return response

@login_required
def remove_video(request):
	try:
		if request.POST:
			vid = request.POST.get('vid')
			user = request.user.id

			if vid and user:
				vid = get_object_or_404( m.Videos, id=vid, user_id = user)
				success = vid.delete()			

			if request.is_ajax():								
				data ={'success':True,'messages':'Video removed '}								
				return HttpResponse( json.dumps(data), content_type="application/json")
	except:
		traceback.print_exc(sys.stdout)
	finally:
		if not request.is_ajax():
			return HttpResponseRedirect('/video')