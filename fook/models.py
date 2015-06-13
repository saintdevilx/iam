import sys

from django.db import models
from django.contrib.auth.models import User,make_password
from django.db.models import Q,F
from image_cropping import ImageRatioField,ImageCropField
from django.db.models.signals import post_save

from easy_thumbnails.signals import saved_file
from easy_thumbnails.signal_handlers import generate_aliases_global
import traceback,sys
from django.db.models.signals import pre_delete, post_delete
from django.dispatch import receiver
from easy_thumbnails.files import generate_all_aliases
from fook import util,feeds

class Follows(models.Model):
	user_id = models.IntegerField(default=0)
	page_id = models.IntegerField(default=0)
	created = models.DateTimeField(auto_now_add=True)


class UserProfile(models.Model):
	user = models.OneToOneField(User)
	first_name = models.CharField(max_length=50,default='')
	last_name = models.CharField(max_length=50,default='')
	email = models.EmailField(default=None)
	gender   = models.CharField(max_length=5, choices=[('','Select Gender'),('m','Male'),('f','Female')] )
	birthday = models.DateField( blank=True,null=True)
	cur_city = models.IntegerField(default=0,blank=True, null=True)
	profile_image = models.ImageField(max_length=500,null=True)
	current_profile = models.IntegerField(default=0)
	status= models.CharField(max_length = 500 ,null=True, blank=True)
	education = models.CharField(max_length=50, null=True,blank=True,default=0)
	phone = models.CharField(max_length=15, null=True,blank=True,default=0)
	hometown = models.CharField(max_length=45,blank=True,null=True,default=0)
	last_activity = models.CharField(default="",max_length=50)
	works = models.CharField(max_length=45,blank=True, null=True)


class ProfileImage(models.Model):
	"""
		Profile Image 
		@user - Whose Profile Image.
		@image -  Image path of profile image.
		@create - Uploaded time.
	"""
	user  = models.ForeignKey(User)
	image = models.ImageField(upload_to="profile_images/",null=False)
	likes = models.IntegerField(default=0)
	comments = models.IntegerField(default=0)
	created = models.DateTimeField(auto_now_add=True)

	def save(self, *args, **opts):		
		saved = super(ProfileImage,self).save(*args, **opts)		
		try:
			Activity.objects.create(user = self.user, act_id= 11, post_id=self.id, post_type=109979992)
		except:
			traceback.print_exc(file=sys.stdout)
		return saved 


@receiver(post_save, sender=ProfileImage)
def generateProfileImageThumbs( sender, **opts):
	try:
		if opts.get('created',True):
			util.generateAllAliases(opts['instance'].image)
	except:
		traceback.print_exc( file=sys.stdout)


class UserLoginHistory(models.Model):
	"""
		User Login History:
		@user - User whose login History.
		@ip   - IP Address user logged in from.
		@browser - Browser user using.
		@device	- Device user Using (Mobile- e.g. iPhone,Samsung etc., PC- Desktop)
		@login_time - Login Time at user logged in.
	"""
	user = models.ForeignKey(User)
	ip = models.CharField(max_length=13)
	browser = models.CharField(max_length=200)
	device = models.CharField(max_length=30)
	login_time = models.DateTimeField(auto_now_add=True)


class Album(models.Model):
	user = models.ForeignKey(User)
	#gallery = models.ForeignKey(Gallery)
	name = models.CharField(max_length=500,null=False)
	location = models.CharField(max_length=500,null=True)
	visibility = models.CharField(max_length=20)
	image_count = models.IntegerField(default=0)
	likes = models.IntegerField(default=0)
	comments = models.IntegerField(default=0)
	created = models.DateTimeField(auto_now_add=True)

def onAlbumDelete(sender,instance, *args, **opts):
	pid = instance.id
	_type = u"109979989"
	deleteRelated(pid,_type)
pre_delete.connect(onAlbumDelete, sender= Album)


class Gallery(models.Model):	
	album = models.ForeignKey(Album)

	image = models.ImageField(upload_to='gallery/',null=False)
	#visibliity = models.CharField(max_length=20,null=True, default='pub')
	caption = models.CharField(max_length=500, null=True)
	likes= models.IntegerField(default=0)
	comments =models.IntegerField(default=0)
	created = models.DateTimeField(auto_now_add=True)

def onGalleryDelete(sender,instance, *args, **opts):
	pid = instance.id
	_type = u"109979990"
	deleteRelated(pid,_type)
pre_delete.connect(onGalleryDelete, sender= Gallery)

@receiver(post_save, sender=Gallery)
def generateGalleryImageThumbs( sender, **opts):
	try:
		if opts.get('created',True):
			util.generateAllAliases(opts['instance'].image)
	except:
		traceback.print_exc( file=sys.stdout)



class Friend(models.Model):
	friend =  models.ForeignKey( User)
	friend_of = models.IntegerField( default=0 )
	status = models.CharField(max_length = 10,default=0)
	created = models.DateTimeField( auto_now_add =True)

class Message(models.Model):
	sender   = models.ForeignKey(User)
	content = models.CharField(max_length=10000)
	#sender_id   = models.IntegerField(default=0)
	reciever_id = models.IntegerField(default=0)
	unread = models.CharField(default='n', max_length=1)
	created = models.DateTimeField( auto_now_add= True )

class Pages(models.Model):
	user = models.OneToOneField(User)
	follower = models.ForeignKey(Follows)

	page_name = models.CharField(max_length=300)			# Page Name or Title
	follower = models.IntegerField(default=0)
	page_type = models.CharField(max_length = 50)			# Page Category 
	page_profile = models.ImageField(upload_to='profile_images/', null=False, blank=True)	# Page Profile photo	
	page_description = models.CharField(max_length=2000)	# Page description  what it is all about
	page_contact = models.CharField(max_length=15, null=False,blank=True)			# Page Contact no
	page_verified	= models.CharField(max_length=5)		# Page verified or not
	page_street	= models.CharField( max_length=100, null=False, blank=True)			# Page address street
	page_city	= models.IntegerField(default=0, null=False, blank=True)			# Page address city
	page_state = models.IntegerField(default=0, null=False, blank=True)	# Page address state 
	page_country	= models.IntegerField(default=0, null=False,blank=True)		# Page Country 
	created	= models.DateTimeField( auto_now_add= True)		# Page Created on
	#updated = models.DateTimeField( auto_now_add =  True)	# Page Last updated on


	def  __str__(self):
		return '%s , %s  %s' % (self.page_name, self.id, self.page_profile)

	#def __unicode__(self):
	#	return self.user.username

	def is_authenticated(self):
		return True



class Country(models.Model):
	country_code = models.CharField(max_length=5)		# Country Code e.g. India as IN, Austrailia as AU
	country_name = models.CharField(max_length=50)		# Full name of country
	#image = models.CharField(max_length=500)			#

class City(models.Model):
	city_code = models.CharField(max_length=5)			# City Code e.g. Nainital as NTL, Haldwani as HLD
	city_name = models.CharField(max_length=50)         #
	state_id  = models.IntegerField(default=0)			#
	#image = models.CharField(max_length=500)			#

class State(models.Model):
	state_code = models.CharField(max_length=5)			# State Code e.g. Uttarakhand as UK, 
	state_name = models.CharField(max_length=50)        #
	country_id = models.IntegerField(default=0)
	#image = models.CharField(max_length=500)			#



class Posts(models.Model):
	user = models.ForeignKey(User)
	target_id = models.IntegerField(default=0)    
	attachment = models.ImageField(upload_to='post_attachments/',max_length=10000, default='',blank=True)
	post_description = models.CharField(max_length=10000)	# Post Description or text Written
	likes = models.IntegerField(default=0)					# Post_Likes
	comments = models.IntegerField(default=0)				# No's of comments 
	reported = models.IntegerField(default=0)				# Reported about the content used in post
	post_type = models.IntegerField(default=0)				# PostType
	publish = models.CharField(max_length=1,default='n') # value can be  'y' or 'n'
	#recomended = models.IntegerField(default=0)			# Post Recomended by users in their networks
	viewed = models.IntegerField(default=0)					# Numbers of views for the post
	created = models.DateTimeField(auto_now_add=True)		#	

	def  __str__(self):
		return '%s  ' % (self.id)

def onPostDelete(sender,instance, *args, **opts):
	pid = instance.id
	_type = u"109979988"
	deleteRelated(pid,_type)
pre_delete.connect(onPostDelete, sender= Posts)


def deleteRelated(pid, _type):
	""" Delete Related Like, Posts, Notification, and Activity"""
	Post_Likes.objects.filter( post_id =  pid, post_type = _type).delete()
	PostComment.objects.filter( post_id = pid, post_type = _type).delete()
	Notification.objects.filter( post_id = pid, post_type= _type).delete()
	Activity.objects.filter( post_id=pid, post_type= _type).delete()

# -*- ACT_ID for notification table -*-#
POST_ACT_ID 		= 1
ADDED_PHOTO_ACT_ID 	= 2
LIKE_ACT_ID 		= 3
SHARED_ACT_ID 		= 4
COMMENT_ACT_ID 		= 7

class Post_Likes(models.Model):
	user_id = models.IntegerField(default=0)
	post_id = models.IntegerField(default=0)
	post_type = models.IntegerField( default=0)
	created = models.DateTimeField(auto_now_add=True)


	def __str__(self):
		return '%s'% self.user_id

	def save(self,*args,**opts):
		like = super(Post_Likes,self).save(*args,**opts)
		try:
			addNewNotification(self, LIKE_ACT_ID ,*args,**opts)
			#manager =  feeds.FeedManager()
			#manager.add_feed(self)
		except:
			traceback.print_exc(file=sys.stdout)
		return like

	def delete(self,*args,**opts):
		print "Delete Post_Likes Called"
		return super(Post_Likes,self).delete(*args, **opts)

class PostType(models.Model):
	desc = models.CharField( max_length=20)
	created = models.DateTimeField(auto_now_add=True)


class PostAttachment(models.Model):
	post=models.ForeignKey(Posts) 
	attachment = models.ImageField(upload_to='post_attachments/',blank=True)
	attachment_type = models.CharField(max_length=50)
	created = models.DateTimeField(auto_now_add = True)


class PostComment(models.Model)	:
	post = models.ForeignKey(Posts)#IntegerField(default=0)
	user = models.ForeignKey(User)#IntegerField(default=0)
	post_type = models.IntegerField( default=0)
	likes = models.IntegerField(default=0)
	msg = models.CharField( max_length=50000)	
	created = models.DateTimeField(auto_now_add=True)	
	#updated = models.DateTimeField(auto_now_add=True)
	def save(self,*args,**opts):
		comment = super(PostComment,self).save(*args,**opts)
		try:
			addNewNotification(self, COMMENT_ACT_ID ,*args,**opts)
			#manager =  feeds.FeedManager()
			#manager.add_feed(self)
		except:
			traceback.print_exc(file=sys.stdout)
		return comment

class ActivityType(models.Model):
	act_type = models.IntegerField(default=0)
	act_descr = models.CharField(max_length=500)


class Activity(models.Model):
	"""
		Activity - of users 
		@user -  id of user whose activity.
		@act_id - of ActivityType
		@post_id - of post (e.g. Post, Image, Video, etc.)
		@post_type -  id of PostType 		
	"""
	user =  models.ForeignKey(User)			#actor
	#target_id = models.IntegerField(User)		# target 
	act_id = models.IntegerField(default=0) #1: status , 2:gallery, 3:Like , 4:shared, 5:Friends,6:commented,7:tagged	
	post_id = models.IntegerField(default=0)
	post_type = models.IntegerField(default =0)
	gallery_id = models.IntegerField(default=0)	
	created = models.DateTimeField(auto_now_add=True)

	def save(self, *args, **opts):
		act = super(Activity,self).save(*args,**opts)
		try:
			manager =  feeds.FeedManager()
			manager.add_feed(self)
		except:
			traceback.print_exc(file=sys.stdout)
		return act

class Share(models.Model):
	post = models.ForeignKey(Posts)
	user_id = models.IntegerField(default=0)
	likes = models.IntegerField(default=0)
	comments =  models.IntegerField(default=0)
	share = models.IntegerField(default=0)
	created = models.DateTimeField( auto_now_add =True)


"""
		Videos - Model to Store Video 
	*	User can have Videos in Gallery and as well as a Post Attachment.
	*	Can set visibliity of its content to Public or Friend.
	*	Viewer can view Videos on different small or large available for particular Video
"""

class Videos(models.Model):
	user= models.ForeignKey(User)
	token = models.CharField(max_length=500)
	type = models.CharField(max_length=45)
	encoding = models.CharField(max_length=45)
	views	= models.IntegerField(default=0)
	likes = models.IntegerField(default=0)
	comments = models.IntegerField(default=0)
	share = models.IntegerField(default=0)
	title = models.CharField(max_length=200)
	visibility = models.IntegerField(default=0)
	album_id = models.IntegerField(default=0)
	thumbnail = models.CharField(max_length=200)
	duration= models.CharField(max_length=20)
	resolution =  models.CharField(max_length=50)
	created = models.DateTimeField( auto_now_add =True)

def onVideoDelete(sender,instance, *args, **opts):
	pid = instance.id
	_type = u"109979993"
	deleteRelated(pid,_type)
pre_delete.connect(onVideoDelete, sender= Videos)

class Mention(models.Model):
	"""
		Mention: Mention Friend ,people in Post,Image,Video,Music,Comment.
		@user_id - of User got mentioned.
		@post_id - of Got mentioned in post
		@post_type- of Post user got mentioned (e.g.-Image ,Music, Audio,Video etc.)
		@mention_by - User mentioned 		
	"""
	user_id = models.ForeignKey(User)
	post_id = models.IntegerField( default=0)
	post_type = models.IntegerField( default=0)
	mention_by = models.IntegerField( default=0 )
	visibliity = models.IntegerField( default=0)
	created = models.DateTimeField( auto_now_add=True)


class Settings(models.Model):
	"""
		User's Profile Settings.
		@user - User 
	"""
	user = models.ForeignKey(User)
	profile_info = models.CharField(max_length=1)
	profile_image = models.CharField(max_length=1)	


class BlockList(models.Model):
	"""
		Blocked User
	"""
	user = models.ForeignKey(User)
	blocked_user = models.IntegerField(default=0)
	created =  models.DateTimeField(auto_now_add=True)	


POST_TYPE = {
u'109979988':Posts,
u'109979989':Album,
u'109979990':Gallery,
u'109979991':PostComment,
u'109979992':ProfileImage,
u'109979993':Videos
}
class Notification(models.Model):
	user_id = models.IntegerField(default=0)#ForeignKey(User)
	actor = models.IntegerField(default=0) 
	act_id = models.IntegerField(default=0)
	post_id = models.IntegerField(default=0)
	post_type = models.IntegerField(default=0)
	unread = models.CharField(default=1, max_length=1)
	unseen = models.CharField(default=1 ,max_length=1)
	created = models.DateTimeField(auto_now_add = True)


""" Add New Notification """
def addNewNotification(obj ,act_id , *args,**opts):
	try:
		notify_to  = POST_TYPE[ unicode(obj.post_type) ].objects.filter( id =  obj.post_id ).values('user_id')[0]['user_id']

		noti = Notification.objects.create( user_id = notify_to , actor = obj.user_id, act_id = act_id,
			post_id = obj.post_id, post_type = obj.post_type)
		return noti
	except:			
		traceback.print_exc( file = sys.stdout)
		return None			

"""
Activity Type
"1","100087","Updated Status"
"2","100088","Added New Post"
"3","100093","Commented"
"4","100090","Added New Albums"
"5","100091","Liked"
"6","100092","Shared"
"7","100089","Added New Photos"
"8","100094","Friend Request"
"9","100094","Become Friends"
"10","100095","Tagged"
"11","100096","Changed Profile Image"
"""


"""
POST Type
"1","Post",
"2","Comment",
"3","Like",
"4","Album",
"5","Image",
"6","Video",
"7","Music"
"""