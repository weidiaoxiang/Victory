
from data_models.exception_model import *
from services.base_service import *
from services.application_service import *
from utilities.value_injector import *
from google.appengine.api import search
from models.memcache_key import *
from google.appengine.api import memcache
import config
import os, re, datetime, hashlib
import logging

class DocumentService(BaseService):
    # get document groups by application id, search keyword and index
    #   success: return [document_group], total
    #   failed: return [], 0
    def get_document_groups(self, application_id, keyword, index, document_model):
        if index is None: index = 0

        aps = ApplicationService(self.context)
        if not aps.is_my_application(application_id):
            return [], 0

        result = []
        try:
            query_string = '(app_id:%s)' % application_id
            if keyword and len(keyword.strip()) > 0:
                source = [item for item in keyword.split(' ') if len(item) > 0]
                plus = [item for item in source if item.find('-') != 0]
                minus = [item[1:] for item in source if item.find('-') == 0 and len(item) > 1]

                if len(plus) > 0:
                    keyword = ' '.join(plus)
                    query_string = query_string + ' AND ((name:{1}) OR (email:{1}) OR (description:{1}) OR (ip:{1}) OR (title:{1}) OR (status:{1}))'.replace('{1}', keyword)
                if len(minus) > 0:
                    keyword = ' '.join(minus)
                    query_string = query_string + ' AND NOT ((name:{1}) OR (email:{1}) OR (description:{1}) OR (ip:{1}) OR (title:{1}) OR (status:{1}))'.replace('{1}', keyword)
            cache_key = MemcacheKey.document_search + str(document_model) + str(application_id)
            cache_value = memcache.get(key=cache_key)
            if cache_value and keyword + str(index) in cache_value:
                # return from cache
                return cache_value[keyword + str(index)]['result'], cache_value[keyword + str(index)]['count']

            create_time_desc = search.SortExpression(
                expression = 'create_time',
                direction = search.SortExpression.DESCENDING,
                default_value = '0')
            options = search.QueryOptions(
                offset = config.page_size * index,
                limit = config.page_size,
                sort_options = search.SortOptions(expressions=[create_time_desc]),
                returned_fields = ['title', 'name', 'times', 'description', 'email', 'create_time', 'group_tag'])
            query = search.Query(query_string, options=options)
            if document_model == DocumentModel.exception:
                # search data from ExceptionModel
                documents = search.Index(name='ExceptionModel').search(query)
            else:
                # search data from LogModel
                documents = search.Index(name='LogModel').search(query)

            for document in documents:
                result.append({'group_tag': document.field('group_tag').value,
                               'title': document.field('title').value,
                               'name': document.field('name').value,
                               'times': int(document.field('times').value),
                               'description': document.field('description').value,
                               'email': document.field('email').value,
                               'create_time': document.field('create_time').value.strftime('%Y-%m-%dT%H:%M:%S.%fZ')})

        except:
            return [], 0

        # if number of documents over maximum then return the maximum
        if documents.number_found > 1000 + config.page_size:
            count = 1000 + config.page_size
        else:
            count = documents.number_found

        # set memory cache for 12 hours
        if cache_value is None:
            cache_value = { keyword + str(index): { 'result': result, 'count': count } }
            memcache.set(key=cache_key, value=cache_value, time=43200)
        else:
            cache_value[keyword + str(index)] = { 'result': result, 'count': count }
            memcache.set(key=cache_key, value=cache_value, time=43200)

        return result, count

    # get documents by application id and group tag
    #   success: return [document]
    #   failed: return []
    def get_documents(self, application_id, group_tag, document_model):
        aps = ApplicationService(self.context)
        if not aps.is_my_application(application_id):
            return []
        if group_tag is None: return []

        if document_model == DocumentModel.exception:
            documents = db.GqlQuery('select * from ExceptionModel where app_id = :1 and group_tag = :2 order by create_time DESC limit 100', application_id, group_tag)
        else:
            documents = db.GqlQuery('select * from LogModel where app_id = :1 and group_tag = :2 order by create_time DESC limit 100', application_id, group_tag)

        result = []
        for document in documents.fetch(100):
            result.append(document.dict())

        return result

    # get document by application id and group tag
    #   success: return document
    #   failed: return None
    def get_last_document(self, application_id, group_tag, document_model):
        aps = ApplicationService(self.context)
        if not aps.is_my_application(application_id):
            return None

        if document_model == DocumentModel.exception:
            documents = db.GqlQuery('select * from ExceptionModel where app_id = :1 and group_tag = :2 order by create_time DESC limit 1', application_id, group_tag)
        else:
            documents = db.GqlQuery('select * from LogModel where app_id = :1 and group_tag = :2 order by create_time DESC limit 1', application_id, group_tag)

        for document in documents.fetch(1): return document.dict()
        return None


    # add a document for web service
    #   success: return True, None
    #   failed: return False, error message
    def add_document(self, key, document, document_model):
        if key is None: return False, 'key is required'
        if 'title' not in document or document['title'] is None: return False, 'title is required'
        if 'name' not in document or document['name'] is None: return False, 'name is required'

        # check application is exist
        applications = db.GqlQuery('select * from ApplicationModel where app_key = :1 limit 1', key)
        if applications.count(1) == 0:
            return False, 'no match application'

        # select data store
        if document_model == DocumentModel.exception:
            # add a exception document
            model = ExceptionModel()
        else:
            # add a log document
            model = LogModel()

        # fixed input value
        ValueInjector.inject(model, document)
        if model.parameters:
            # remove password=\w*&
            model.parameters = re.sub(r'password=([^&])*&', '', model.parameters, flags=re.IGNORECASE)
        if 'status' in document and model.status is None: model.status = str(document['status'])

        # set create_time
        if 'create_time' in document and document['create_time']:
            try: model.create_time = datetime.datetime.strptime(document['create_time'], '%Y-%m-%dT%H:%M:%S')
            except:
                try: model.create_time = datetime.datetime.strptime(document['create_time'], '%Y-%m-%dT%H:%M')
                except: pass
        model.app_id = applications[0].key().id()
        model.ip = os.environ["REMOTE_ADDR"]
        model.user_agent = self.context.request.headers['User-Agent']
        model.create_time = datetime.datetime.now()
        # group ta is md5({ title }_{ name }_{ create_time(yyyy-MM-dd) })
        group_tag = '%s_%s_%s' % (model.title, model.name, model.create_time.strftime('%Y-%m-%d'))
        model.group_tag = hashlib.md5(group_tag.encode('utf-8')).hexdigest()
        model.put()

        # clear memory cache for document search
        memcache.delete(MemcacheKey.document_search + str(document_model) + str(model.app_id))


        # post document to text search
        if document_model == DocumentModel.exception:
            text_search_name = 'ExceptionModel'
        else:
            text_search_name = 'LogModel'
        index = search.Index(name=text_search_name)

        # check document exist with group_tag
        # search
        options = search.QueryOptions(returned_fields = ['times'])
        query_string = 'app_id=%s AND group_tag=%s' % (model.app_id, model.group_tag)
        cache_key = MemcacheKey.text_search_document + text_search_name + query_string
        cache_document = memcache.get(key=cache_key)
        if cache_document:
            # load document group from cache
            times = cache_document['times'] + 1
            index.delete([cache_document['doc_id']])
        else:
            # load document group from text search
            query = search.Query(query_string=query_string, options=options)
            items = index.search(query)
            if items.number_found > 0:
                times = items.results[0].field('times').value + 1
                index.delete([x.doc_id for x in items])
            else:
                times = 1

        # insert to text search
        document = search.Document(fields=[search.TextField(name='group_tag', value=model.group_tag),
                                           search.NumberField(name='app_id', value=model.app_id),
                                           search.TextField(name='description', value=model.description),
                                           search.TextField(name='email', value=model.email),
                                           search.TextField(name='name', value=model.name),
                                           search.TextField(name='title', value=model.title),
                                           search.TextField(name='status', value=model.status),
                                           search.TextField(name='ip', value=model.ip),
                                           search.NumberField(name='times', value=times),
                                           search.DateField(name='create_time', value=model.create_time)])
        result = index.put(document)
        # set memory cache for 1 hour
        memcache.set(key=cache_key, value={'doc_id': result[0].id, 'times': times}, time=3600)

        return True, None
