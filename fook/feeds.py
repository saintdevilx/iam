"""	
    Author: saintdevilx					
	fook/feeds.py							
 	This module Contains methods for feeds 
"""
#from fook import models as m
from  django.db.models import Q
from django.http import HttpResponseRedirect, HttpResponse
import json
from stream_framework.activity import Activity
from stream_framework.feeds.redis import RedisFeed
from stream_framework.feed_managers.base import Manager,FanoutPriority
from django.contrib.auth.decorators import login_required
import time,pytz
from django.utils.timezone import make_naive
from stream_framework.verbs import register
from stream_framework.verbs.base import Verb
#from fook import db_operations as op    
    
class FeedVerb(Verb):
    id = 5
    infinitive = 'pin'
    past_tense = 'pinned'

register(FeedVerb)

def create_activity(feed):
    activity = Activity(
        feed.user_id,
        FeedVerb,
        feed.id,
        None,#feed.post_id,
        time= make_naive(feed.created, pytz.utc),
        extra_context=dict(item_id=feed.post_id, item_type=feed.post_type)
    )
    return activity


class ActivityFeed(RedisFeed):
    key_format = 'feed:normal:%(user_id)s'    

class UserActivityFeed(ActivityFeed):
    key_format = 'feed:user:%(user_id)s'

class FeedManager(Manager):
    feed_classes = dict(
        normal=ActivityFeed,
    )
    user_feed_class = UserActivityFeed

    def add_feed(self, feed):
        activity = create_activity(feed)
        # add user activity adds it to the user feed, and starts the fanout
        self.add_user_activity(feed.user_id, activity)

    def get_user_follower_ids(self, user_id):        
        from fook.models import Friend
        from fook.util import GetFriends
        friends = Friend.objects.filter(  Q(Q(friend_of=user_id) | Q(friend_id = user_id)), Q(status = 1)).values('friend_id','friend_of','id')
        ids = GetFriends( friends, user_id)        
        return {FanoutPriority.HIGH:ids}


@login_required
def feed(request):
    '''
    Items Feed by the people you follow
    '''
    manager = FeedManager()
    from django.shortcuts import render_to_response,render
    #context = RequestContext(request)
    feed = manager.get_feeds(request.user.id)['normal']
    activities = list(feed[:25])
    #context['activities'] = activities
    #response = render_to_response('core/feed.html', context)
    return render(request,'core/feed.html', locals())