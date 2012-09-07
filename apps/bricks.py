
'''
    Разные маленькие утилитки
'''
import json
from cgi import FieldStorage

from config import settings
from lib import util
from lib.YandexMail import ActionException
from lib.decorators import dumpencode

api = settings.API

def main(environ, start_response):
    '''
    Перенаправляет запросы по "do_what"
    '''
    mycgi = util.cook_cgi(FieldStorage(environ=environ))
    
    do_what = mycgi['do_what']
    functions = {
                 'get_settings': {'exec': get_settings},
                 'get_server_start_time': {'exec': get_server_start_time}
                 }
    if do_what not in functions:
        return ['<br><br><br><div align="center"><p>Произошло страшное</p></div>'.encode('utf-8')]
    return functions[do_what]['exec'](mycgi, environ)


@dumpencode
def get_settings(mycgi, environ):
    '''
    Получает и отдаёт приложению основные настройки
    '''
    return {'items': sorted([i for i in api]), 'cache_users': settings.CACHE_USERS, 'success': 1}


@dumpencode
def get_server_start_time(mycgi, environ):
    '''
    Возвращает время старта сервера
    '''
    return {'server_start_time': environ['server_start_time'], 'success': 1}