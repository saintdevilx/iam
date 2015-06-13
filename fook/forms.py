from django import forms
from django.contrib.auth.models import User
from fook import models as m

PAGE_TYPE_OPTIONS = (
	('artist','Artist'),
	('biz','Business'),
	('hotel', 'Hotel'),
	('adv', 'Adventure Club'),
	('shop', 'Shop or Store'),
	('other', 'Other'),
)

COUNTRY_OPTIONS = (
		('IN','India'),
		('AU','Austrailia'),
		('USA', 'United State'),
		('UK','United Kingdom')
	)

VERIFIED_OPTIONS =( ('y','YES'),('n', 'NO'),)
"""
class PageModelForm(forms.ModelForm):
	page_name = forms.ChoiceField()
	class Meta:
		model  = m.Pages
		fields = ['id','page_name']
"""

class ProfileImageModelForm(forms.ModelForm):
	class Meta:
		model = m.ProfileImage
		fields = ['image']

class GalleryModelForm(forms.ModelForm):
	class Meta:
		model = m.Gallery
		fields = ['image']

class UserSignupModelForm(forms.ModelForm):
	class Meta:
		model =  User
		fields = ['username','password','first_name','last_name','email']
		widgets = {'password':forms.PasswordInput()}

class UserProfileModelForm(forms.ModelForm):
	class Meta:
		model = m.UserProfile
		fields = ['birthday','gender']
		exclude =['education','cur_city','works']
		from django.forms.extras.widgets import SelectDateWidget
		from datetime import date
		years =[]
		[ years.append(i) for i in range( date.today().year-60 , date.today().year-14 )]
		widgets ={'birthday':SelectDateWidget( years =years )}

#SignupFormModel = forms.form_for_model(Pages)
class PageModelForm(forms.ModelForm):
	#page_type = forms.ChoiceField(choices=PAGE_TYPE_OPTIONS)	
	class Meta:
		model = m.Pages
		exclude = ('page_created','page_update','follower','user') 
		fields =('page_name','page_type','page_description','page_contact')
		widgets = { 'page_description': forms.Textarea( {'cols':30,'rows':10} )	} 
		error_messages = {
			'page_name' :{
				'required' : 'Page name is required'
			},
			'page_type' :{
				'required':'Select you Page category'
			},
			'page_description':{
				'required': ' Write something about your page that help people to know about your page.'
			},
			'page_contact':{
				#'required': ''
			},
			'page_verified':{
				'required': 'Verifiy, Page is official'
			}
		}

class SigninForm(forms.Form):
	username = forms.CharField(max_length=20, required=True)
	password = forms.CharField(widget=forms.PasswordInput(), required=True)


class AttachmentForm(forms.ModelForm):
	class Meta:
		model = m.PostAttachment
		fields = ('attachment',)

class UserModelForm(forms.ModelForm):
	class Meta:
		model = User
		fields = ('username','password','email','first_name','last_name')
		widgets = {'password':forms.PasswordInput()}
		error_messages = {
			'email' :{
				'required': ' Email required to verify your account and notification communication use.'
			},
			'username':{
				'required':'Choose a username'
			},
			'password':{
				'required':'Choose a password'
			},
			'last_name':{
				'required':'Last Name '
			},
			'first_name':{
				'required': 'First Name'
			}

		}


class SignupForm(forms.Form):
	page_name = forms.CharField()	
	page_type= forms.ChoiceField(choices = PAGE_TYPE_OPTIONS)	
	page_description = forms.CharField( )
	page_email = forms.EmailField()
	page_contact = forms.CharField( required=False)
	page_verified = forms.ChoiceField( choices = VERIFIED_OPTIONS)
	page_street = forms.CharField()
	page_city = forms.CharField()
	page_state_provinance = forms.CharField()	
	page_country = forms.CharField()


class PostModelForm(forms.ModelForm):
	class Meta:
		model = m.Posts
		fields = ('post_description','attachment','target_id')
		widgets = {'post_description':forms.Textarea({'cols':80,'rows':1}) }
		error_messages = {
			'post_description':{
				'required' : 'Post can\'t have blank text'
			}
		}		

"""class AttachmentModelForm(forms.ModelForm):
	class Meta:		
		#db_table = 'post_attachments'
		model = m.Post_Attachments
		fields = ('post_attachment',)		"""

class AlbumModelForm(forms.ModelForm):
	class Meta:
		model = m.Album
		fields = {'name','visibility'}

class UserProfileModelEditForm(forms.ModelForm):
	class Meta:
		model = m.UserProfile
		fields = {'gender','birthday','hometown','phone','education','works'}

class UserModelEditForm(forms.ModelForm):
	class Meta:
		model = User
		fields = {'first_name','last_name','id'}

