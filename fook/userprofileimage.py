'''		
	In built django Modules
'''
from django.shortcuts import render_to_response,render
from django.http import HttpResponseRedirect, HttpResponse,HttpResponseNotFound
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
import fook.settings as settings
import time
import sys,traceback
from django.utils.html import strip_spaces_between_tags
from easy_thumbnails.files import get_thumbnailer

@login_required
def change_profile_image(request):	
	try:
		if request.FILES:
			_file = request.FILES
			_id = request.POST.get('id')
			data={}
			if _file is not None:
				
				uploaded = None
				data = {}
				form = fook.forms.ProfileImageModelForm( request.POST,request.FILES )

				if form.is_valid():
					profile  = m.UserProfile.objects.get(user__id = request.POST['user'])					

					profile_image = form.save(commit=False)
					profile_image.user_id = request.user.id
					profile_image.save()
				
					profile.profile_image = profile_image.image				
					profile.current_profile = profile_image.id
					profile.save( )				
					
					thumbnail =  get_thumbnailer(profile_image.image).get_thumbnail({'size':(200,300),'crop':True})
					data['html'] = get_template('ajax/userprofile/render_profile_image.html').render( Context({'image': thumbnail,'id':profile_image.id,'uid':request.user.id}) )						
					data['src'] = thumbnail.url
					data['width'] = thumbnail.width
					data['height'] = thumbnail.height
				else:
					data['html'] =""
					data['error']=form.errors
					print "Invalid Form: %s"%form
					
				return HttpResponse( json.dumps(data), content_type='application/json')

			else:
					return HttpResponse('Internal Error ', content_type='application/json')
		else:
			raise Exception('No file to upload.')					
	except Exception,e :
			traceback.print_exc(file=sys.stdout)
			return HttpResponse('Error Occrred! %s'%e, content_type='application/json')	
