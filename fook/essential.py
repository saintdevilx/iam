'''		
	In built django Modules
'''
from django.shortcuts import render_to_response,render,get_object_or_404
from django.http import HttpResponseRedirect, HttpResponse
from django.template import Template, Context,RequestContext
from django.contrib.auth import authenticate,logout,login,get_user
from django.contrib import messages
from django.db.models import Q,F
from django.core.paginator import Paginator, EmptyPage,PageNotAnInteger
from django.contrib.auth.decorators import login_required
import json
from django.core import serializers
from django.template.loader import get_template, render_to_string
from django.db.models import Q,F,Count
'''	
	In Built defined Modules
'''
import fook.settings as st
import fook.forms 		# Import User Forms
import fook.models as m		#Import User Models 
import fook.db_operations as op
import fook.script as script
import fook.apis_options as apis
import fook.util as myutil
import fook.album
import traceback,sys

def JSONResponse(request, data):
	if request.is_ajax():
		return HttpResponse( json.dumps(data), content_type="application/json" )			