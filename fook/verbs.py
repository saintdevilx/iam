from stream_framework.verbs import register
from stream_framework.verbs.base import Verb


class UpdateStatus(Verb):
    id = 1
    infinitive = ''
    past_tense = ''

register(UpdateStatus)

class NewPhoto(Verb):
	id = 3
	infinitive = 'Added new photos'
	past_tense = 'Added new photos'

register(NewPhoto)

class NewAlbum(Verb):
	id = 4
	infinitive = 'Added New Album'
	past_tense = 'Added New Album'

register(NewAlbum)

class NewLike(Verb):
	id = 5
	infinitive = 'Like'
	past_tense = 'Liked'

register(NewLike)

class NewShare(Verb):
	id = 6
	infinitive = 'Share'
	past_tense = 'Shared'

register(NewShare)

class NewComment(Verb):
	id = 7
	infinitive = 'Comment'
	past_tense = 'Commented'

register(NewComment)

class NewFriendRequest(Verb):
	id = 8
	infinitive = 'New Friend Request'
	past_tense = 'New Friend Request'

register(NewFriendRequest)

class NewFriend(Verb):
	id = 9
	infinitive = 'Become Friends'
	past_tense = 'Became Friends'

register(NewFriend)

class NewTagged(Verb):
	id = 10
	infinitive = 'Tag'
	past_tense = 'Tagged'

register(NewTagged)



