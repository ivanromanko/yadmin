#!/usr/bin/env python3

'''Модуль с разными декораторами'''

import functools
import time
import json
from lib.YandexMail import ActionException
from urllib.error import HTTPError

def tryex(msg=None):
    '''
    Функция, которая создаёт декоратор, который выполняет переданную ему функцию и возвращает её результат
    с заданным комментарием к ошибке.
    Если при выполнении произошла ошибка, он вернёт trace.
    '''
    def decorator(foo):
        @functools.wraps(foo) # Заменяет строчки с присваиванием имени и докстринга
        def wrapper(*args, **kwargs):
            try:
                return foo(*args, **kwargs)
            except ActionException as err:
                print({'success': 0, 'msg': '{} {}'.format(time.strftime('%H:%M:%S'), msg or 'Произошла ошибка в работе API'), 'err': str(err)})
                return {'success': 0, 'msg': '{} {}'.format(time.strftime('%H:%M:%S'), msg or 'Произошла ошибка в работе API'), 'err': str(err)}
            except HTTPError as err:
                print({'success': 0, 'msg': '{} {}'.format(time.strftime('%H:%M:%S'), msg or 'Произошла ошибка при обращении к серверу Яндекса'), 'err': str(err)})
                return {'success': 0, 'msg': '{} {}'.format(time.strftime('%H:%M:%S'), msg or 'Произошла ошибка при обращении к серверу Яндекса'), 'err': str(err)}
        return wrapper
    return decorator

def dumpencode(foo):
    '''
    Декоратор для оборачивания ответа функции в закодированный json и упаковки в список.
    '''
    @functools.wraps(foo)
    def wrapper(*args, **kwargs):
        return [json.dumps(foo(*args, **kwargs)).encode('utf-8')]
    return wrapper
