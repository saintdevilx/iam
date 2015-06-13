from essential import *

from stream_framework.feeds.aggregated_feed.notification_feed import RedisNotificationFeed

class MyNotificationFeed(RedisNotificationFeed):
    # : they key format determines where the data gets stored
    key_format = 'feed:notification:%(user_id)s'
    
    # : the aggregator controls how the activities get aggregated
    aggregator_class = MyAggregator


class MyAggregator(BaseAggregator):
    '''
    Aggregates based on the same verb and same time period
    '''
    def get_group(self, activity):
        '''
        Returns a group based on the day and verb
        '''
        verb = activity.verb.id
        date = activity.time.date()
        group = '%s-%s' % (verb, date)
        return group    

class MyNotification(object):
    '''
    Abstract the access to the notification feed
    '''
    def add_love(self, love):
        feed = MyNotificationFeed(user_id)
        activity = Activity(
            love.user_id, LoveVerb, love.id, love.influencer_id,
            time=love.created_at, extra_context=dict(entity_id=self.entity_id)
        ) 
        feed.add(activity)
                    