"""
	#########################################
	#	Author: saintdevilx					#
	#	Fook.page.py						#
	#########################################
 	This module Contains methods after user login
"""
from fook import models as m
from  django.db.models import Q
from django.http import HttpResponseRedirect, HttpResponse
import json
from django.contrib.auth.decorators import login_required
from django.shortcuts import render_to_response,render
import fook.forms as form		# Import User Forms

@login_required
def create(request):
	data= {}
	if request.POST:
		page_form = form.PageModelForm(data=request.POST)
		if page_form.is_valid():
			page_form.save()
			data['success'] = True
		else:
			data['error'] = True
			data['message'] = "%s" % page_form.errors
		return HttpResponse(json.dumps(data), content_type='application/json')
	
	return render( request, 'pages/create_page.html',locals())