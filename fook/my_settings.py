'''		
	In built django Modules
'''
from django.shortcuts import render_to_response,render
from django.http import HttpResponseRedirect, HttpResponse,Http404
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
import traceback,sys

def viewSettings(request):
	st = request.GET.get('st')
	if st is None:
		st ='general'	
	#if request.is_ajax():		
		#settings = m.Settings.objects.get(user_id = request.user.id)
	if st == "general":		
		settings = request.user
	settings =[]
	if request.is_ajax():
		data={}
		data['html']= render_to_string('ajax/main/my_settings.html',{'settings':settings,'st':st})	
		data['success'] =True
		return HttpResponse(json.dumps(data), content_type="application/json")
	#else:
	return render(request,'ajax/settings/my_settings.html',locals())


def privacySettings(request):
	data={}
	try:

		pass
	except:
		traceback.print_exc(file=sys.stdout)
	finally:
		if request.is_ajax():
			data['html']= get_template('ajax/main/my_settings.html').render(Context({'settings':settings,'st':st}))		
			
			return HttpResponse( json.dumps(data), content_type="application/json")