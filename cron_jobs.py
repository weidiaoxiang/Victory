
import webapp2
from google.appengine.ext import db
from google.appengine.api import search
import datetime
from application import config


# clear document data
class ClearDocumentsHandler(webapp2.RequestHandler):
    def get(self):
        date_tag = datetime.datetime.now() - datetime.timedelta(days=config.document_expiration)
        options = search.QueryOptions(returned_fields=['doc_id'])
        query = search.Query(query_string='create_time<=%s' % date_tag.strftime('%Y-%m-%d'), options=options)
        # clear documents
        applications = db.GqlQuery('select * from ApplicationModel')
        for application in applications:
            self.__delete_text_search('ExceptionModel', str(application.key().id()), query)
            self.__delete_text_search('LogModel', str(application.key().id()), query)
            self.__delete_text_search('CrashModel', str(application.key().id()), query)
        self.__delete_data_store('ExceptionModel', date_tag)
        self.__delete_data_store('LogModel', date_tag)
        self.__delete_data_store('CrashModel', date_tag)

    def __delete_text_search(self, namespace, name, query):
        """
        Delete text search documents.
        :param namespace: string, schema namespace
        :param name: string, schema name
        :param query:
        """
        index = search.Index(namespace=namespace, name=name)
        while True:
            documents = index.search(query)
            if documents.number_found == 0: break

            # delete document in text search
            document_ids = [x.doc_id for x in documents]
            index.delete(document_ids)

    def __delete_data_store(self, model_name, date_tag):
        while True:
            query = db.GqlQuery('select * from %s where create_time < :1' % model_name, date_tag)
            if query.count(1) == 0: break
            models = query.fetch(1000)
            db.delete(models)


app = webapp2.WSGIApplication([
    ('/cron_jobs/document', ClearDocumentsHandler)
])