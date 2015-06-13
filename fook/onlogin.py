"""
	#########################################
	#	Author: saintdevilx					#
	#	Fook.onlogin.py						#
	#########################################
 	This module Contains methods after user login
"""
from fook import models as m
from  django.db.models import Q
from django.http import HttpResponseRedirect, HttpResponse
import json


def incompleteProfile(uid):

	info = m.UserProfile.objects.values('user_id','profile_image','cur_city','hometown','education','phone','works').get(user_id = uid)

	incomplete = []
	if info['profile_image'] is None:
		incomplete.append('profile_image')
	if info['cur_city'] is None:
		incomplete.append('cur_city')
	if info['hometown'] is None:
		incomplete.append('hometown')
	if info['education'] is None:
		incomplete.append('education')
	if info['phone'] is None:
		incomplete.append('phone')
	if info['works'] is None:
		incomplete.append('works')

	return incomplete

def todaysEvents(uid):
	events ={}
	events['birthday'] = friendsBirthday(uid)
	events
	return None

def friendsBirthday(uid):
	query  = "SELECT user.id ,user.first_name, user.last_name,profile.profile_image "
	query += " FROM auth_user as user INNER JOIN fook_friend as friend ON ( (friend.friend_id =user.id OR friend.friend_of=user.id) AND  friend.status = 1) "
	query += " INNER JOIN fook_userprofile as profile ON( user.id = profile.user_id) WHERE user.id =%s and ( month(birthday) = month(birthday) AND day(birthday) = day(now()) ) " %uid
		
	return  m.User.objects.values().raw(query)

def ad():
	return None



def BootLoad(request):
	try:
		#uid= request.user.id
		#incomplete = incompleteProfile( uid)
		#frnds = friendsBirthday(uid)
		frnds ={}
		incomplete={}
		birthday = {}
		for i in frnds:
			birthday[i.id] = {'name':i.first_name+' '+i.last_name , 'image': i.profile_image}
		data = {'incomplete':incomplete, 'birthday':birthday }
		return HttpResponse( json.dumps(data), content_type='application/json' )
	except Exception ,ex:
		data={'error':True}
		print "ERROR:onlogin.py:58:%s"%ex
		raise Exception('boot Load Fail!')