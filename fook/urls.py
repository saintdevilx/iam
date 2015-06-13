from django.conf.urls import include, url
from django.contrib import admin
from fook.views import index
import fook.views 
from django.conf import settings

urlpatterns = [
    # Examples:    
    #url(r'^blog/', include('blog.urls')),
    url(r'^$',fook.views.index),    
    url(r'^newsfeed',fook.feeds.feed),
    url(r'^video/add',fook.video.addNewVideo),
    url(r'^video/edit',fook.video.edit_video_info),
    url(r'^video/remove',fook.video.remove_video),
    url(r'^(?P<uid>\d{1,20})/videos',fook.video.friend_videos),        
    url(r'^videos',fook.video.videos),        
    url(r'^get',fook.video.getVideo),            
    url(r'^friendlist',fook.messages.getFriendList),                
    url(r'^index',fook.views.index),    
    url(r'^thanks',fook.views.thanks),    
    url(r'^signup',fook.views.signup),    
    url(r'^signin',fook.views.signin),    
    url(r'^login', 'django.contrib.auth.views.login'),    
    url(r'^logout',fook.views.logoutaccount),    
    url(r'^home',fook.views.home),    
    url(r'^feeds',fook.views.feeds),        
    url(r'^add_post',fook.post.add_post),    
    url(r'^post/attach',fook.post.add_attachment),        
    url(r'^vote',fook.views.vote),    
    url(r'^unvote',fook.views.unvote),    
    url(r'^search',fook.views.search),
    url(r'^ajax_apis',fook.views.ajax_apis),    
    url(r'^myposts', fook.post.my_posts) ,                             
    url(r'^post/mention', fook.post.mention) ,                                 
    url(r'^page/(?P<page_id>\d{1,20})$',fook.views.page_profile),
    url(r'^viewprofile/(?P<uid>\d{1,20})$',fook.views.view_profile),
    url(r'^change_cover',fook.views.cover_change),    
    url(r'^profile',fook.views.profile),            
    url(r'^userprofile/editresidence',fook.userprofile.editResidence),                
    url(r'^userprofile/editeducation',fook.userprofile.editEducation),                    
    url(r'^findlocation',fook.userprofile.findLocation),
    url(r'^findeducation',fook.userprofile.findEducation),                    
    url(r'^likers',fook.post.viewlikes),
    url(r'^more_feeds',fook.views.more_feeds),
    url(r'^page/create',fook.page.create),                    
    url(r'^forgetpassword',fook.views.forgotPassword),                    
    
    url(r'^gallery/viewcomments',fook.album.viewcomments),      
    url(r'^gallery/delete',fook.album.remove_image),    
    url(r'^gallery/(?P<id>\d{1,20})',fook.views.gallery),    
    url(r'^gallery',fook.views.gallery),  
    url(r'^friends$',fook.views.friends),        
    url(r'^friends/find',fook.friends.findfriends),            
    url(r'^friends/suggestion',fook.friends.suggestion),            
    url(r'^friends/search',fook.friends.search),                

    url(r'^messages/current',fook.messages.getNewUnreadMessage),        
    url(r'^messages/online',fook.messages.online),        
    url(r'^messages/getrecievers',fook.messages.recieverList),    
    url(r'^messages/(?P<id>\d{1,20})$',fook.messages.viewmessages),    
    url(r'^messages',fook.messages.conversation ),   
    
    url(r'^notification',fook.views.getNotification ),   
    url(r'^settings',fook.my_settings.viewSettings),    
    url(r'^settings/privacy',fook.my_settings.privacySettings),   
    url(r'^user/block',fook.block_users.blockUser),    

    url(r'^upload_image/',fook.views.upload_image),        
    url(r'^album/create',fook.album.create_album),  
    url(r'^album/delete',fook.album.delete_album),  
    url(r'^send_message', fook.messages.send_message) ,         
    url(r'^send_message', fook.messages.remove_msg) ,             
    url(r'^userprofile/update', fook.userprofile.update) ,             
    url(r'^album/addphoto', fook.album.album_add_photos) ,             
    url(r'^tags/get', fook.tags.findtag) ,                 
    url(r'^userprofile/changeimage', fook.userprofileimage.change_profile_image) ,                 
    url(r'^userprofile/edit', fook.userprofile.edit) ,    
    url(r'^userprofile/info', fook.userprofile.basic_info) ,    
    url(r'^userprofile/albums', fook.userprofile.album_list) ,        
    url(r'^userprofile/video', fook.userprofile.video_list) ,        
    url(r'^post/comment', fook.post.add_comment) ,                             
    url(r'^post/viewcomments', fook.post.viewcomments) ,   
    url(r'^post/view', fook.post.view_post),                             
    url(r'^post/remove', fook.post.removePost) ,   
    url(r'^photos', fook.userprofile.list_profile_images) ,   
    url(r'^(?P<uid>\d{1,20})/gallery/(?P<id>\d{1,20})',fook.views.gallery_friend),    
    url(r'^(?P<uid>\d{1,20})/gallery',fook.views.gallery_friend),    

    url(r'^(?P<uid>\d{1,20})/friends',fook.views.viewfriends),    
    url(r'^(?P<uid>\d{1,20})/gallery',fook.views.gallery_friend),    

    #url(r'^(?P<uid>\d{1,20})',fook.views.view_profile),      
    url(r'^(?P<uid>\S[a-zA-Z._]{1,20})$',fook.views.view_profile),        
    #url(r'^admin/', include(admin.site.urls)),
]
'''
if settings.DEBUG:
    urlpatterns +=patterns(
        'django.views.static',
        (r'^profile_images/(?P<path>.*)',
        'serve',
        {'document_root': settings.MEDIA_ROOT}) , )
'''