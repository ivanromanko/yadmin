import logging
import logging.handlers

def log():
    logging.basicConfig(level=logging.DEBUG,
                        format='%(asctime)s %(levelname)s %(message)s',
                        filename='test.log',
                        filemode='a')
    console = logging.StreamHandler()
    rotation = logging.handlers.RotatingFileHandler('test.log', maxBytes=1024*1024, backupCount=2)
    # logging.getLogger('').addHandler(console)
    logging.getLogger('').addHandler(rotation)
    return logging