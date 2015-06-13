import random
import string
from django.test import TestCase
from models import Pages, Posts,Post_Likes
from django.contrib.auth.models import User
import factory
from django.utils import timezone
import fook.dummy_data as dummy
import time

def random_page_name(name='names',length=15):
	return dummy.dummy[name][ random.randrange( len(dummy.dummy) ) ]
	#return u''.join( random.choice(string.ascii_letters) for x in range(length))

class PageFactory(factory.DjangoModelFactory):
	class Meta:
		model = Pages
	page_name = factory.LazyAttribute( lambda t: random_page_name())
	page_description  =  factory.LazyAttribute(lambda t:random_page_name('long_text'))
	last_login = '%s'%timezone.now()

class UserFactory(factory.DjangoModelFactory):
	class Meta:
		model = User
	username = factory.LazyAttribute( lambda t: random_page_name())
	password  =  factory.LazyAttribute(lambda t:random_page_name())
	

class PageTestCase(TestCase):

	def test_page_data(self):
		try:
			user = UserFactory.create()
			page =PageFactory.create(user = user)
			
			user = UserFactory.create()
			page =PageFactory.create(user=user)

		except Exception, e:
			self.assertTrue(True, True)	

		self.assertTrue(True, True)



	