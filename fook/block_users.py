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


def blockUser(request):
	data={}
	try:
		if request.POST:
			users_list = request.POST.get('users')
			by = request.user
			print "users_list - %s"%(users_list)
			lst =[]
			for u in users_list:
				lst.append( m.BlockList( user= by, blocked_user =u ) )
			blocked,ext = m.BlockList.objects.bulk_create( lst )
			print "%s %s"%(blocked,ext)
			data['success'] =True
	except Exception, e:
		print "Exception blockUser:blocked_users.py %s"%e
			
