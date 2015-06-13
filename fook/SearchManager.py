from fook.models import Videos, User, UserProfile
import essential as e


def searchVideo(request,q):
	try:		
		data={}		
		if q is not u"":
			found = Videos.objects.filter( title__icontains = q )[:10].values()
			user_ids = [ i['user_id'] for i in found ]
			users= User.objects.filter(id__in = user_ids).values('id','first_name','last_name')
			uploaders = { u['id']: u for u in users  }			
			results=[]
			for f in found:
				results.append({
					'video':f,
					'user':uploaders[ f['user_id']  ]
				})

			data['html'] = e.render_to_string( 'ajax/search/_videos_search.html', {"results":results})
	except:
		e.traceback.print_exc(file=e.sys.stdout)
	finally:
		if request.is_ajax():
			return e.HttpResponse( e.json.dumps(data), content_type="application/json" )
		return e.render( request,'ajax/search/videos_search.html', locals() )


def searchPeople(request,q)	:
	try:
		data ={}
		if q  is not u"":
			found = User.objects.filter(  )
	except:
		e.traceback.print_exc(file= sys.stdout)
	finally:
		if request.is_ajax():
			return e.HttpResponse( e.json.dumps(data), content_type="application/json" )