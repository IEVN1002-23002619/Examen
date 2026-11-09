from flask import Flask
from flask_cors import CORS

from blueprints.pedidos.routes import pedidos_bp
from config import config
from database import mysql

app = Flask(__name__)
app.config.from_object(config['development'])

app.register_blueprint(pedidos_bp)

CORS(app, resources={
    r'/api/*': {
        'origins': ['http://localhost:4200', 'http://127.0.0.1:4200']
    }
})

mysql.init_app(app)


def pagina_no_encontrada(error):
    return '<h1>Pagina no encontrada</h1>', 404


app.register_error_handler(404, pagina_no_encontrada)

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
