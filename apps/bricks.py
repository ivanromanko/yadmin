
'''
    Разные маленькие утилитки
'''
import json
from cgi import FieldStorage

from config.settings import settings
from lib import util
from lib.YandexMail import ActionException
from lib import decorators

api = settings.api

def main(environ, start_response):
    mycgi = util.cook_cgi(FieldStorage(environ=environ))
    
    do_what = mycgi['do_what']
    functions = {
                 'get_domains_list': {'exec': get_domains_list},
                 'get_server_start_time': {'exec': get_server_start_time}
                 }
    if do_what not in functions:
        return ['<br><br><br><div align="center"><p>Произошло страшное</p></div>'.encode('utf-8')]
    return functions[do_what]['exec'](mycgi, environ)


@decorators.dumpencode
def get_domains_list(mycgi, environ):
    return {'items': sorted([i for i in api]), 'success': 1}


@decorators.dumpencode
def get_server_start_time(mycgi, environ):
    return {'server_start_time': environ['server_start_time'], 'success': 1}