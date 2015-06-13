from fook import essential as e

@e.login_required
def findtag(request):
	data={}
	try:
		if request.is_ajax():
			tag =  request.POST['tag']
			tags = e.op.get_tag_by_name(tag)

			html = e.get_template('ajax/tags/tags.html').render( e.Context({'tags':tags,'tag':tag}) )
			data['html']= html
	except Exception,ex:
		print "ex:%s"%ex
		data['error'] = 'Invalid Request'
		raise Exception('Invalid request')
	return e.HttpResponse( e.json.dumps(data))