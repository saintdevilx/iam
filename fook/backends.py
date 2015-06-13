from django.contrib.auth.models import User, check_password
from django.db.models import Q

class EmailAuthBackend(object):
	def authenticate(self, username=None, password=None):
		try:
			user = User.objects.get( Q(email= username) | Q(username= username) )#check_password(password , user.page_password) or
			if  check_password(password , user.password):
				return user
		except :				
			return None

	def get_user(self, user_id):
		try:
			return User.objects.get(pk=user_id)
		except:
			return None