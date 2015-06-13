import datetime
from haystack import indexes
from haystack import site
from fook.models import Videos

class VideoIndex(indexes.SearchIndex):
    text = indexes.CharField(use_template=True, document=True)
    title = indexes.CharField(model_attr='title')
    desc = indexes.CharField(model_attr='desc')
    tags = indexes.CharField(model_attr='tags')

    def get_queryset(self):
        "Used when the entire index for model is updated."
        return Videos.objects.filter(creation_date__lte=datetime.datetime.now())

site.register(Video, VideoIndex)