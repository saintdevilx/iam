import os
os.environ.setdefault("DJANGO_SETTINGS_MODULE",'fook.settings')
import random
import string

import django
from fook.models import Pages, Posts,Post_Likes,Post_Attachments
from django.contrib.auth.models import User
import factory
from django.utils import timezone
import fook.dummy_data as dummy
import time


def random_page_info(name='names',length=15):
	return dummy.dummy[name][ random.randrange( len(dummy.dummy[name]) ) ]

def random_name(name='names'):
	timestamp= "%s"%time.time()+""
	pname = dummy.dummy[name][ random.randrange( len(dummy.dummy[name]) ) ]	
	return ('_').join( (pname,timestamp) )


def random_images(path='profile_images'):	
	image =dummy.dummy['images'][ random.randrange( len(dummy.dummy['images'])) ]
	return os.path.join(path, image)

class PageFactory(factory.DjangoModelFactory):
	class Meta:
		model = Pages
	page_name = factory.LazyAttribute( lambda t: random_name())
	page_type = factory.LazyAttribute( lambda t: random_page_info('page_type'))
	page_description  =  factory.LazyAttribute(lambda t:random_page_info('long_text'))
	page_profile = factory.LazyAttribute(lambda t:random_images()) 
	

class UserFactory(factory.DjangoModelFactory):
	class Meta:
		model = User
	username = factory.LazyAttribute( lambda t: random_name())
	password  =  'pbkdf2_sha256$20000$PWJ31qJEWi5o$r1vcQRTTH9CqMx3+8jiRqy8wspZjDCGixNj9Bh30dds='
	#Password is 'devil'
	#factory.LazyAttribute(lambda t:random_page_info())
	

class PostFactory(factory.DjangoModelFactory):
	class Meta:
		model = Posts
	id =None
	post_description = factory.LazyAttribute( lambda t: random_page_info('long_text') )
	page = factory.RelatedFactory(Pages)
	#user = factory.RelatedFactory(User)
	page_id = None
	user_id = None

	"""def _generate(cls, create ,attr):		
		post_save.disconnect( handler_create_page,Page)
		print "cls:%s \b,create:%s\n\n attr:%s"% (cls,create,attr)
		user = super(PostFactory)._generate(create,attr)"""


class AttachmentFactory( factory.DjangoModelFactory):
	class Meta:
		model = Post_Attachments
	post_attachment = factory.LazyAttribute( lambda t: random_images('post_attachments') )
	post_id = None


def add_post(page=None):
	try:
		print "page:%s " % page
		if page is None:
			pagecount = Pages.objects.count()		
			randpage =  random.randrange(1,pagecount)	
			print "%s" % randpage
			page = Pages.objects.filter(id= randpage)[0]
		
		if page :
			pf = PostFactory(page=page , page_id= page.id, user_id=page.user_id)		
			AttachmentFactory.create(post_id = pf.id)
		return True

	except Exception, e:
		print "Error add_post: %s" % e
		return None
	else:
		pass
	finally:
		pass


def add_User_and_Page():
	try:
		user = UserFactory.create()
		page =PageFactory.create(user = user)
		print "page:%s" % page
		for i in range(1,5):
			if page is None or add_post(page) is None:
				return None
	except Exception, e:
		print "!Error: %s" % e		

if __name__ == "__main__":
	django.setup()

	print "Everything is done. ready to march.\n==========================================================\n"
	for i in range(1,10):
		add_User_and_Page()
	#add_User_and_Page()
	#add_post()
	
