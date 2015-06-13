# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations
from django.conf import settings


class Migration(migrations.Migration):

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name='Activity',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('act_id', models.IntegerField(default=0)),
                ('post_id', models.IntegerField(default=0)),
                ('post_type', models.IntegerField(default=0)),                               
                ('gallery_id', models.IntegerField(default=0)),
                ('created', models.DateTimeField(auto_now_add=True)),
                ('user', models.ForeignKey(to=settings.AUTH_USER_MODEL)),
            ],
            options={
            },
            bases=(models.Model,),
        ),
        migrations.CreateModel(
            name='ActivityType',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('act_type', models.IntegerField(default=0)),
                ('act_descr', models.CharField(max_length=500)),
            ],
            options={
            },
            bases=(models.Model,),
        ),
        migrations.CreateModel(
            name='Album',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('name', models.CharField(max_length=500)),
                ('location', models.CharField(max_length=500, null=True)),
                ('visibility', models.CharField(max_length=20)),
                ('image_count', models.IntegerField(default=0)),
                ('likes', models.IntegerField(default=0) ),                
                ('comments', models.IntegerField(default=0)),                
                ('created', models.DateTimeField(auto_now_add=True)),
                ('user', models.ForeignKey(to=settings.AUTH_USER_MODEL)),
            ],
            options={
            },
            bases=(models.Model,),
        ),
        migrations.CreateModel(
            name='BlockList',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('blocked_user', models.IntegerField(default=0)),
                ('created', models.DateTimeField(auto_now_add=True)),
                ('user', models.ForeignKey(to=settings.AUTH_USER_MODEL)),
            ],
            options={
            },
            bases=(models.Model,),
        ),
        migrations.CreateModel(
            name='City',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('city_code', models.CharField(max_length=5)),
                ('city_name', models.CharField(max_length=50)),
                ('state_id', models.IntegerField(max_length=50)),                
            ],
            options={
            },
            bases=(models.Model,),
        ),
        migrations.CreateModel(
            name='Country',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('country_code', models.CharField(max_length=5)),
                ('country_name', models.CharField(max_length=50)),
            ],
            options={
            },
            bases=(models.Model,),
        ),
        migrations.CreateModel(
            name='Follows',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('user_id', models.IntegerField(default=0)),
                ('page_id', models.IntegerField(default=0)),
                ('created', models.DateTimeField(auto_now_add=True)),
            ],
            options={
            },
            bases=(models.Model,),
        ),
        migrations.CreateModel(
            name='Friend',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('friend_of', models.IntegerField(default=0)),
                ('status', models.CharField(default=0, max_length=10)),
                ('created', models.DateTimeField(auto_now_add=True)),
                ('friend', models.ForeignKey(to=settings.AUTH_USER_MODEL)),
            ],
            options={
            },
            bases=(models.Model,),
        ),
        migrations.CreateModel(
            name='Gallery',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('image', models.ImageField(upload_to=b'gallery/')),
                ('caption', models.CharField(max_length=500, null=True)),
                ('likes', models.IntegerField(default=0) ),                
                ('comments', models.IntegerField(default=0) ),                                
                ('created', models.DateTimeField(auto_now_add=True)),
                ('album', models.ForeignKey(to='fook.Album')),
            ],
            options={
            },
            bases=(models.Model,),
        ),
        migrations.CreateModel(
            name='Mention',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('post_id', models.IntegerField(default=0)),
                ('post_type', models.IntegerField(default=0)),
                ('mention_by', models.IntegerField(default=0)),
                ('visibliity', models.IntegerField(default=0)),
                ('created', models.DateTimeField(auto_now_add=True)),
                ('user_id', models.ForeignKey(to=settings.AUTH_USER_MODEL)),
            ],
            options={
            },
            bases=(models.Model,),
        ),        
        migrations.CreateModel(
            name='Message',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('content', models.CharField(max_length=10000)),
                ('reciever_id', models.IntegerField(default=0)),
                ('created', models.DateTimeField(auto_now_add=True)),
                ('sender', models.ForeignKey(to=settings.AUTH_USER_MODEL)),
                ('unread',models.CharField(default='n', max_length=1)),
            ],
            options={
            },
            bases=(models.Model,),
        ),
        migrations.CreateModel(
            name='Pages',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('page_name', models.CharField(max_length=300)),
                ('follower', models.IntegerField(default=0)),
                ('page_type', models.CharField(max_length=50)),
                ('page_profile', models.ImageField(upload_to=b'profile_images/', blank=True)),
                ('page_description', models.CharField(max_length=2000)),
                ('page_contact', models.CharField(max_length=15, blank=True)),
                ('page_verified', models.CharField(max_length=5)),
                ('page_street', models.CharField(max_length=100, blank=True)),
                ('page_city', models.IntegerField(default=0, blank=True)),
                ('page_state', models.IntegerField(default=0, blank=True)),
                ('page_country', models.IntegerField(default=0, blank=True)),
                ('created', models.DateTimeField(auto_now_add=True)),
                ('user', models.OneToOneField(to=settings.AUTH_USER_MODEL)),
            ],
            options={
            },
            bases=(models.Model,),
        ),
        migrations.CreateModel(
            name='PostAttachment',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('attachment', models.CharField(max_length=500, blank=True)),
                ('attachment_type', models.CharField(max_length=50)),
                ('created', models.DateTimeField(auto_now_add=True)),
                ('post', models.ForeignKey(to='fook.Posts')),
            ],
            options={
            },
            bases=(models.Model,),
        ),        
        migrations.CreateModel(
            name='Post_Likes',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('user_id', models.IntegerField(default=0)),
                ('post_id', models.IntegerField(default=0)),
                ('post_type', models.IntegerField(default=0)),                                
                ('created', models.DateTimeField(auto_now_add=True)),
            ],
            options={
            },
            bases=(models.Model,),
        ),
        migrations.CreateModel(
            name='PostComment',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('post_id', models.IntegerField(default=0)),
                ('user_id', models.IntegerField(default=0)),
                ('post_type', models.IntegerField(default=0) ),                                                
                ('likes', models.IntegerField(default=0)),
                ('msg', models.CharField(max_length=50000)),
                ('created', models.DateTimeField(auto_now_add=True)),
            ],
            options={
            },
            bases=(models.Model,),
        ),
        migrations.CreateModel(
            name='Posts',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('target_id', models.IntegerField(default=0)),
                ('attachment', models.ImageField(default=b'', max_length=10000, upload_to=b'post_attachments/', blank=True)),
                ('post_description', models.CharField(max_length=10000)),
                ('post_type', models.IntegerField(default=0)),                
                ('likes', models.IntegerField(default=0)),
                ('comments', models.IntegerField(default=0)),
                ('reported', models.IntegerField(default=0)),
                ('viewed', models.IntegerField(default=0)),
                ('created', models.DateTimeField(auto_now_add=True)),
                ('user', models.OneToOneField(to=settings.AUTH_USER_MODEL)),
            ],
            options={
            },
            bases=(models.Model,),
        ),
        migrations.CreateModel(
            name='PostType',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('desc', models.CharField(max_length=20)),
                ('created', models.DateTimeField(auto_now_add=True)),
            ],
            options={
            },
            bases=(models.Model,),
        ),                
        migrations.CreateModel(
            name='State',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('state_code', models.CharField(max_length=5)),
                ('state_name', models.CharField(max_length=50)),
                ('country_id', models.IntegerField(max_length=50)),                
            ],
            options={
            },
            bases=(models.Model,),
        ),
        migrations.CreateModel(
            name='Notification',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('act_id', models.IntegerField(default=0)),
                ('post_id', models.IntegerField(default=0)),
                ('post_type', models.IntegerField(default=0)),
                ('unread', models.BooleanField(default=True)),
                ('unseen', models.BooleanField(default=True)),
                ('created', models.DateTimeField(auto_now_add=True)),
                ('user', models.ForeignKey(to=settings.AUTH_USER_MODEL)),
            ],
            options={
            },
            bases=(models.Model,),
        ),
        migrations.CreateModel(
            name='UserLoginHistory',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('ip', models.CharField(max_length=13)),
                ('browser', models.CharField(max_length=200)),
                ('device', models.CharField(max_length=30)),
                ('login_time', models.DateTimeField(auto_now_add=True)),
                ('user', models.ForeignKey(to=settings.AUTH_USER_MODEL)),
            ],
            options={
            },
            bases=(models.Model,),
        ),        
        migrations.CreateModel(
            name='UserProfile',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('gender', models.CharField(max_length=5, choices=[(b'', b'Select Gender'), (b'm', b'Male'), (b'f', b'Female')])),
                ('birthday', models.DateField(null=True, blank=True)),
                ('cur_city',models.IntegerField(default=0, null=True, blank=True)),
                ('profile_image', models.ImageField(max_length=500, null=True, upload_to=b'')),
                ('current_profile', models.IntegerField(default=0, null=True)),
                ('status', models.CharField(max_length=500, null=True, blank=True)),
                ('user', models.OneToOneField(to=settings.AUTH_USER_MODEL)),
                ('education',models.CharField(max_length=50, null=True, blank=True)),
                ('hometown',models.CharField(max_length=45, null=True, blank=True) ),
                ('phone',models.CharField(max_length=15, null=True, blank=True)),
                ('works',models.CharField(max_length=45, null=True, blank=True) ),
                ('last_activity', models.DateTimeField(default="") ),
            ],
            options={
            },
            bases=(models.Model,),
        ),
        migrations.CreateModel(
            name='ProfileImage',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('image', models.ImageField(upload_to=b'profile_images/')),
                ('likes', models.IntegerField(default=0)),
                ('comments', models.IntegerField(default=0)),
                ('created', models.DateTimeField(auto_now_add=True)),
                ('user', models.ForeignKey(to=settings.AUTH_USER_MODEL)),
            ],
            options={
            },
            bases=(models.Model,),
        ),
        migrations.CreateModel(
            name='Videos',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('token', models.CharField(max_length=500)),
                ('type', models.CharField(max_length=45)),
                ('encoding', models.CharField(max_length=45)),
                ('views', models.IntegerField(default=0)),
                ('likes', models.IntegerField(default=0)),
                ('comments', models.IntegerField(default=0)),
                ('share', models.IntegerField(default=0)),
                ('title', models.CharField(max_length=200)),
                ('visibility', models.IntegerField(default=0)),
                ('album_id', models.IntegerField(default=0)),
                ('thumbnail', models.CharField(max_length=200)),
                ('duration', models.CharField(max_length=20)),
                ('resolution', models.CharField(max_length=50)),
                ('user', models.ForeignKey(to=settings.AUTH_USER_MODEL)),
            ],
            options={
            },
            bases=(models.Model,),
        ),   
        migrations.CreateModel(
            name='Settings',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('profile_info', models.CharField(max_length=1)),
                ('profile_image', models.CharField(max_length=1)),
                ('user', models.ForeignKey(to=settings.AUTH_USER_MODEL)),
            ],
            options={
            },
            bases=(models.Model,),
        ),
        migrations.CreateModel(
            name='Share',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('user_id', models.IntegerField(default=0)),
                ('likes', models.IntegerField(default=0)),
                ('comments', models.IntegerField(default=0)),
                ('share', models.IntegerField(default=0)),
                ('created', models.DateTimeField(auto_now_add=True)),
                ('post_id', models.ForeignKey(to='fook.Posts')),
            ],
            options={
            },
            bases=(models.Model,),
        ),
    ]
