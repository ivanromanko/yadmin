#!/usr/bin/env python3

'''Модуль для хранения различных декораторов'''

import functools
import time
import json

def tryex(foo):
    '''
    Декоратор, который выполняет переданную ему функцию и возвращает её результат.
    Если при выполнении произошла ошибка, он вернёт trace
    '''
    @functools.wraps(foo) # Заменяет строчки с присваиванием имени и докстринга
    def wrapper(*args, **kwargs):
        try:
            return foo(*args, **kwargs)
        except Exception as err:
            return {'success': 0, 'error': '{} Произошла ошибка'.format(time.strftime('%d.%m.%y %H:%M:%S')), 'debug': err}

    # wrapper.__name__ = foo.__name__
    # wrapper.__doc__ = foo.__doc__
    return wrapper

def dumpencode(foo):
    '''
    Декоратор для оборачивания ответа функции в закодированный json и упаковки в список.
    '''
    @functools.wraps(foo)
    def wrapper(*args, **kwargs):
        return [json.dumps(foo(*args, **kwargs)).encode('utf-8')]
    return wrapper
