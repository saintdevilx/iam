from django import template
import datetime,traceback,sys,os,fook.settings as st
from easy_thumbnails.files import get_thumbnailer
register = template.Library()

@register.filter
def keylookup(d,key):
	try:	
		return d[key]
	except KeyError:
		return None

@register.filter
def mytimesince(dt):
	
	now = datetime.datetime.now()
	diff = now-dt.replace(tzinfo=None) 

	days = int(diff.days)
	secs=  int(diff.seconds)
	ms = int(diff.microseconds)

	if days>13:
		return dt.date()
	elif days>6:
		return 'last week'
	elif days> 0:
		return '%sd ago' % int(days)
	elif secs > 3600:
		return '%sh ago' % int(secs/3600)
	elif secs>60 :
		return '%sm ago' % int(secs/60)
	else:
		return "%ss ago" %int(secs)

@register.simple_tag
def my_thumbnail(src,*args,**opt):
		try:
			source = open(src.name)
			dir =""
			if "dir" in opt:
				dir=os.path.join( ".."+st.STATIC_URL,opt['dir'])
			file_name = os.path.join( dir, src.name[ src.name.rfind("/")+1: ] )
			thumbnailer = get_thumbnailer(source, relative_name= file_name)
			thumb_options = {'size': opt['size'].split("x"), 'crop': opt['crop']}
			thumbnail = thumbnailer.get_thumbnail(thumb_options)
			return '<img src="%s" width="%s" height="%s" alt="" />'%(thumbnail.url, thumbnail.width,thumbnail.height)
		except Exception, e:
			traceback.print_exc(file=sys.stdout)
			print 'The URL property is only accessible when using remote storage\n'
			return ""


@register.filter
def kilometer(num):
	_num= str(num)
	ln = len(num)
	count = _num/( 10**(ln-1) )
	if ln>3 and ln<6: count+="K"
	elif ln>6:count+="M"
	return count