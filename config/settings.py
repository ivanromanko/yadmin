'''
In multi domain configuration all domains from DOMAINS list are used. If MULTI_DOMAIN is set to False
only the first domain from the DOMAINS list will be used.
'''
from lib import YandexMail
from lib.my_logging import log
from config import token


'''
CACHE_USERS = 1 для обновления списка пользователей только при перезапуске скрипта run.py
и если это необходимо для работы функций. Просто при обновлении страницы будет браться локальная копия.
CACHE_USERS = 0 приведёт к получению списка пользователей с сервера Яндекса при каждой загрузке списка.
'''
CACHE_USERS = 1

API = {i['name']: YandexMail.UserApi(i['token'], log()) for i in token.DOMAINS}
APIMULTI = {i['name']: YandexMail.UserApiMultiadmin(i['token'], log()) for i in token.DOMAINS}
APIPOST = {i['name']: YandexMail.UserApiMultiadminPost(i['token'], log()) for i in token.DOMAINS}




    
    