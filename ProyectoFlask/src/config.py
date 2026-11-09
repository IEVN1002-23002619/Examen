class DevelopmentConfig():
    DEBUG = True
    SECRET_KEY = 'pizzeria-local'
    MYSQL_HOST = 'localhost'
    MYSQL_USER = 'root'
    MYSQL_PASSWORD = ''
    MYSQL_DB = 'pizzeria'
    MYSQL_CURSORCLASS = 'Cursor'


config = {
    'development': DevelopmentConfig
}
