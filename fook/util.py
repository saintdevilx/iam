import subprocess as sp
import re,os.path, settings
import sys,traceback
from easy_thumbnails.files import get_thumbnailer
from fook import settings

__FILENAME__ = "util.py"
def raiseException(module,ex):
	traceback.print_exc(file=sys.stdout)
	print "Exception IN:%s module:%s Message:%s"%(__FILENAME__,module,ex.message)

def unique(item):
	res = []
	for i in item:
		if i in res:
			continue
		else:
			res.append(i)	
	return res


def join(data_list):
	res=[]
	for item in data_list:
		res.append( item[0] ) 
	return res

def is_empty(x):
	empty =True
	for v in x:
		empty=False
		break
	return empty


def extractColumn(dict,col):
	result =[]
	for x in dict:		
		result.append( x[col] )
	return result

def createMap(list):
	m={}
	for i in list:
		m[i[0]] = i[1]
	return m

"""
	@x 	 -- dictionary 1
	@k1  -- searching ey in dictionary 
	@k2 -- searching key in dictionary 2
	@nk  -- new key to be added
	@y -- dictionary 2
	@col 
"""

def addKey(x,y,k1,k2,nk,col):
	for i in x:
		for j in y:			
			if i[k1] == j[k2]:
				i.update({nk:j[col]})			
	return x


def createJSON( d):
	data={}
	for i in d:
		data[ i['id']] = {'title':i['page_name'],'image':i['page_profile'],'type':i['page_type'],'followers':i['follower']}
	return data

def createJSON2( d):
	data={}
	for i in d:
		data[ i['id']] = {'title':i['page_name'],'image':i['page_profile'],'type':i['page_type'],'followers':i['follower']}
	return data


def fuseIt(obj1,obj2):
	res = {}
	
	res['Page'] = createJSON2(obj1)

	data = {}
	
	for o in obj2:		
		data[ o['user__id']  ] = { 'username': o['user__first_name']+" "+o['user__last_name'], 'image': o['profile_image']	}
	res['User'] = data
	return res


def GetFriends(friends , uid):
	res = []
	for friend in friends:
		if int(friend['friend_id']) != int(uid) : 
			res.append(friend['friend_id'])
		else:
			res.append( friend['friend_of'])
	return res


def getMutualFriends(friend_list,uid , frnd):
	res = []
	for friend in friend_list:
		fid =int( friend['friend_id'] )
		foid =int( friend['friend_of'] )
		_uid = int( uid )
		_frnd = int (frnd)
		if  (fid !=uid and foid != _frnd ) or (fid!=_frnd and foid != _uid) :
			if (  fid!= _uid  and  fid != _frnd ):
				res.append( fid )
			else:
				res.append( foid )
	return res


def mutual_friends(frnd_lst,uid,frnd):
	frnds = getMutualFriends(frnd_lst,uid, frnd )		
	data = {}
	res=[]
	for fr in frnds:
		if fr in data:
			data[fr]  =  int(data[fr]) +1
		else:
			data[fr] = 1
		if data[fr]>1:
			res.append(fr)
	return res


class AjaxImageUpload:		
	""" Upoad File """
	files = None 
	upload_path = ""	
	url=[]
	def upload_handler(self,_file):
		import time,os
		try:
			now = time.time()
			ext = _file.name[-4:]
			save_as = "%s%s" %(str(now), ext)
			out_file_name = os.path.join(self.upload_path, save_as )
			out_file = open( out_file_name, 'wb+')
			out_file.write(_file.read())
			out_file.close()
			return [save_as,out_file]
		except Exception ,ex:
			raiseException("AjaxImageUpload upload_handler ",ex)
			return None

	def __init__(self, request, path=None):
		
		self.upload_path = path
		self.out_file_name =[]
		self.url=[]
		try:

			for k in request.FILES:
				 self.url.append( self.upload_handler( request.FILES[k] ) )
		except  Exception,e :
			raiseException("AjaxImageUpload  __init__",e)

	def __del__(self):
		self.out_file_name=[]




class UploadVideo:		
	""" Upoad Video File """
	files = None 
	upload_path = ""	
	out_file_name=[]
	def upload_handler(self,_file):
		import time,os,hashlib
		try:
			now = time.time()
			ext = _file.name[-4:]
			save_as = "%s%s" %(now, ext)
			token = hashlib.md5()
			token.update(save_as+"")
			_out_file_name = token.hexdigest()
			out_file_name = os.path.join(self.upload_path, _out_file_name )			
			out_file = open( out_file_name , 'wb+')
			out_file.write(_file.read())
			out_file.close()
			return _out_file_name
		except Exception ,e:
			raiseException("UploadVideo upload_handler",e)
			return None

	def __init__(self, request, path=None):		
		self.upload_path = path
		self.out_file_name =[]
		try:
			for k in request.FILES:
				 self.out_file_name.append( self.upload_handler( request.FILES[k] ) )
		except  Exception,e :
			raiseException("UploadVideo __init__",e)

	def __del__(self):
		self.out_file_name=[]


#class MyPaginator:
def paginate(page,num,query,offset=None):
	try:
		page =int(page)		
		num = int(num)
		
		if page and page>0:
			_from =  (page*num + 1) if offset is None else ( int(offset)+1 )
			_till  = (_from + num ) if offset is None else ( int(offset)+num )		
		else:
			raise Exception('1>')
	except Exception, e:
		""" If error  occur return default page index """
		_from = 0
		_till = num	
	if type(query) is str:
		query += " LIMIT %s,%s" %( _from, _till) 
	else:
		query= query[ _from : _till ]	

	return query


def createMap(a):
	map ={}
	for g in a:
		map[ g.id ] = g
	return map

def createProfileMap(u):
	map ={}
	for up in u:
		map[up['user_id'] ]= up
	return map

def createAttachmentMap(attach):
	map ={}
	for a in attach:
		if map.has_key( a['post_id'] ):
			map[ a['post_id'] ].append(a)
		else:
			map[ a['post_id'] ] = [a]
	return map	


def createFeedMap(feeds):
	try:
		profile_image ={}
		if feeds.has_key('gallery'):
			galMap = createMap(feeds['gallery'])
		if feeds.has_key('posts'):
			postMap = createMap(feeds['posts'])		
		if feeds.has_key('profiles'):
			profiles = createProfileMap(feeds['profiles'])
		if feeds.has_key('profile_image'):
			profile_image = createMap(feeds['profile_image'])			
		if feeds.has_key('attachment') :
			attachment =  createAttachmentMap( feeds['attachment'] )		
		if feeds.has_key('video') :
			video =  createMap( feeds['video'] )		

		for act in feeds['activity']:
			if act['post_type'] == 109979992 and profile_image.has_key(act['post_id']):
				act['profile_image'] = profile_image[ act['post_id'] ]
				act['author'] = profiles[ act['profile_image'].uid ]				
				act['is_like']	=  profile_image[ act['post_id'] ].is_liked				
				act['likes']	=  profile_image[ act['post_id'] ].likes				
			elif act['post_type'] == 109979990 and galMap.has_key( act['post_id'] ):
				act['gallery'] = galMap[ act['post_id'] ]
				act['author'] = profiles[ act['gallery'].uid ]
				act['is_like']	=  galMap[ act['post_id'] ].is_liked				
				act['likes']	=  galMap[ act['post_id'] ].likes				
			elif act['post_type'] == 109979988 and postMap.has_key( act['post_id'] ):
				act['posts'] = postMap[ act['post_id'] ]
				act['is_like']	=  postMap[ act['post_id'] ].is_liked				
				act['likes']	=  postMap[ act['post_id'] ].likes				
				if attachment.has_key( act['post_id'] ):
					act['attachments'] = attachment[ act['post_id'] ]
				act['author'] = profiles[ act['posts'].uid ]	
				act['target'] = profiles[ act['posts'].target_id ] if act['posts'].target_id in profiles else []							
			elif act['post_type'] == 109979993 and video.has_key(act['post_id']):
				act['video'] = video[ act['post_id'] ]
				act['author'] = profiles[ act['video'].uid ] if profiles.has_key(act['video'].uid ) else {}
				act['likes'] = video[ act['post_id'] ].likes
				act['is_like'] = video[ act['post_id'] ].is_liked

			act['actor']= profiles[ act['actor']['id'] ]			

		return feeds['activity']
	except Exception,e:
		traceback.print_exc(file=sys.stdout)
		raiseException("createFeedMap", e)


def timestamp(tme):
	import time,fook.settings as st
	if tme:
		return time.mktime(tme.timetuple())
	else:
		return None


def current_timestamp():
	""" generate Current UNIX timestamp"""
	from datetime import datetime
	import pytz
	import time,fook.settings as st
	tz= st.SERVER_TIMEZONE
	local = pytz.timezone(tz)
	now  = datetime.now()
	local_dt = local.localize(now , is_dst = None)
	utc_dt = local_dt.astimezone(pytz.utc)
	return utc_dt.strftime("%s")

def video_info(_file):
	res ={}
	try:
		if not os.path.isfile(_file):
			_file = os.path.join( os.path.join(settings.MEDIA_ROOT ,"videos"), _file )
			if not os.path.isfile(_file):
				raise Exception("No Video File '%s' found"%_file)

		result = sp.Popen(['avprobe', _file], stdout = sp.PIPE, stderr = sp.STDOUT)
		total_dur = 0
		for line in result.stdout.readlines():		
			if 'Duration:' in line:
				dur= re.search( r"Duration: (?P<HR>\d{2}?):(?P<MIN>\d{2}?):(?P<SEC>\d{2}?)",line, re.DOTALL )
				if dur :
					dur = dur.groupdict()
					total_dur = int(dur['HR'])*60*60 + int(dur['MIN'])*60 + int(dur['SEC'])
					res['dur']	= dur['HR']+":"+dur['MIN']+":"+dur['SEC']
			if 'Video:' in line:
				size = re.search(r"(?P<WD>\d{3}?)x(?P<HT>\d{3}?)",line,re.DOTALL)
				if size:
					size = size.groupdict()
					res['size'] = size['WD']+"x"+size['HT']
		
		if vid_thumbnail(_file, total_dur):
			res['thumb'] = 'videos/'+_file[ _file.rfind("/")+1: ]+'.jpg'

	except Exception,ex:
		traceback.print_exc(file=sys.stdout)
	return res


def twoDigit(n):
	if n<10:
		return '0'+str(n)
	else:
		return n


def vid_thumbnail(_file, dur):
	try:
		dur= dur/2
		dur_h = dur/3600 #hour
		dur_m = ((dur_h)%3600)/60 #min
		dur_s = dur_m%60

		dur_ = twoDigit(dur_h)+":"+twoDigit(dur_m)+":"+twoDigit(dur_s)

		result = sp.Popen(['avconv','-ss' ,dur_ ,'-i',_file,'-r','1','-vsync','1','-an','-y','-vframes','1','-timelimit','1',_file+'.jpg'],stdout = sp.PIPE, stderr = sp.STDOUT)	
		success =True
		for line in result.stdout.readlines():
			match = re.search(r"error*",line,re.DOTALL)			
			if match is not None:
				success=False
		return success
	except:
		traceback.print_exc(file=sys.stdout)
		return None


def getThumbnail(src,*args,**opt):
	try:
		source = open(src.name)
		dir=""
		if 'dir' in opt:
			dir = opt.get('dir')
		file_name = os.path.join( dir, src.name[ src.name.rfind("/")+1: ] )
		thumbnailer = get_thumbnailer(source, relative_name= file_name)
		thumb_options = {'size': opt['size'].split("x"), 'crop': opt['crop']}
		thumbnail = thumbnailer.get_thumbnail(thumb_options)
	except Exception, e:
		thumbnail =None
		traceback.print_exc(file=sys.stdout)
	finally:		
		return thumbnail


def generateAllAliases(src,*args,**opts):
    all_options = settings.THUMBNAIL_ALIASES[ 'default' if not opts.get('alias') else opts.get('alias')]
    thumb =[]
    if all_options:
        thumbnailer = get_thumbnailer(src)
        for options in all_options.values():
            thumb.append( thumbnailer.get_thumbnail(options))
    return thumb


""" """
def listPeopleHavingCommonFriend( frnds ,fflist):	
	result = {}
	for f in fflist:
		if f['friend_of'] not in frnds:
			if result.has_key(f['friend_of']):
				result[ f['friend_of'] ] +=	1
			else:
				result[ f['friend_of'] ] = 1
		elif f['friend_id'] not in frnds:
			if result.has_key(f['friend_id']):
				result[ f['friend_id'] ] += 1
			else:
				result[ f['friend_id'] ] =1

	return result


"""
from fook import util,db_operations as op
from fook.models import Friend,User
from django.db.models import Q,F
frnds = Friend.objects.filter( Q(friend_id=16)|Q(friend_of=16), status = 1 ).values("friend_id","friend_of")[:20]
flist = util.GetFriends(frnds,16)
fflist = op.getFriendsofFriends(flist)
lst = util.listPeopleHavingCommonFriend(flist,fflist)

"""