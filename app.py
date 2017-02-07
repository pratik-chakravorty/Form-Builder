from flask import Flask, render_template ,redirect,request,flash,url_for,jsonify,session
import datetime
from flask.ext.sqlalchemy import SQLAlchemy
from flask.ext.restless import APIManager,ProcessingException
from flask.ext.bcrypt import Bcrypt
from flask.ext.security import Security,SQLAlchemyUserDatastore,login_required
from flask_cors import CORS, cross_origin
from flask.ext.httpauth import HTTPBasicAuth
import os

app = Flask(__name__)

basedir = os.path.abspath(os.path.dirname(__file__))
app.config['SQLALCHEMY_DATABASE_URI']='sqlite:///'+os.path.join(basedir,'form.sqlite')
db = SQLAlchemy(app)
CORS(app)
bcrypt = Bcrypt(app)

app.config['SECRET_KEY'] = 'thisnalsdjaslkdjaiwajdoaisdj'

auth = HTTPBasicAuth()





class Form(db.Model):
	id = db.Column(db.Integer,primary_key=True)
	field_name = db.Column(db.String(30))
	label_name = db.Column(db.String(30))
	help_text  = db.Column(db.String(30))
	options    = db.relationship('Options',backref='field',lazy='dynamic')


class Options(db.Model):
	id = db.Column(db.Integer,primary_key=True)
	options_name = db.Column(db.String(20))
	field_id = db.Column(db.Integer,db.ForeignKey('form.id'))


class User(db.Model):
	id = db.Column(db.Integer,primary_key=True)
	email = db.Column(db.String(25),unique=True,nullable=False)
	password = db.Column(db.String(255),nullable=False)
	registered_on = db.Column(db.DateTime,nullable=False)
	admin = db.Column(db.Boolean,nullable=False,default=False)

	def __init__(self,email,password,admin=False):
		self.email = email
		self.password = bcrypt.generate_password_hash(password)
		self.registered_on = datetime.datetime.now()
		self.admin = admin

	def is_authenticated(self):
		return True
		

	def is_active(self):
		return True

	def is_anonymous(self):
		return True

	def get_id(self):
		return self.id

	def __repr__(self):
		return '<User {0}>'.format(self.email)






manager = APIManager(app,flask_sqlalchemy_db = db)




@app.route('/')
def index():
	return app.send_static_file('index.html')


@app.route('/api/register',methods=['POST'])
def register():
	json_data = request.json
	user = User(
		email = json_data['email'],
		password = json_data['password']
		)
	try:
		db.session.add(user)
		db.session.commit()
		status = 'success'
	except:
		status = 'this user has already been registered'

	db.session.close()
	return jsonify({'result':status})

@app.route('/api/login',methods=['POST'])
def login():
	json_data = request.json
	user = User.query.filter_by(email=json_data['email']).first()
	print(user.admin)
	if user and bcrypt.check_password_hash(
		user.password, json_data['password']):
		session['logged_in'] = True
		# session['user'] = user
		session['is_admin'] = user.admin
		status = True
	else:
		status = False
	return jsonify(	{'result':status, 'is_admin':session['is_admin']})


@app.route('/api/logout')
def logout():
	session.pop('logged_in',None)
	return jsonify({'result': 'success'})





@app.route('/api/status')
def status():
    if session.get('logged_in'):
        if session['logged_in']:
            print(session['is_admin'])
            return jsonify({'status': True, 'is_admin': session['is_admin']})
    else:
        return jsonify({'status': False})




def auth_func(**kw):
	if not session.get('logged_in'):
		raise ProcessingException(description='Not Authorized',code=401)

manager.create_api(Form,methods=['GET','POST','DELETE','PUT','OPTIONS'],results_per_page=50,preprocessors=dict(GET_SINGLE=[auth_func],GET_MANY=[auth_func],POST=[auth_func],PUT=[auth_func],DELETE=[auth_func]))
manager.create_api(Options,methods=['GET','POST'])




if __name__ =='__main__':
	db.create_all();
	app.run(debug=True)
