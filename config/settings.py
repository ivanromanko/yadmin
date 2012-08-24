'''
In multi domain configuration all domains from DOMAINS list are used. If MULTI_DOMAIN is set to False
only the first domain from the DOMAINS list will be used.
'''

#MULTI_DOMAIN = 0
REFRESH_LOCALSTORAGE_ON_START = 1


#===============================================================================

from lib import YandexMail
from lib.my_logging import log
from config import token


class settings():
    api = {i['name']: YandexMail.UserApi(i['token'], log()) for i in token.DOMAINS}
