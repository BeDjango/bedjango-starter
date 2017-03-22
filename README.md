# BeDjango starter skeleton ![](http://www.bedjango.com/static/images/logo-bedjango.svg)

An easy to use project template for Django 1.10, for more information visit our [blog](http://www.bedjango.com/blog/create-django-application-bedjango-starter/)

[![Build Status](https://api.travis-ci.org/BeDjango/bedjango-starter.svg?branch=master)](https://travis-ci.org/BeDjango/bedjango-starter)
[![Coverage Status](https://coveralls.io/repos/github/BeDjango/bedjango-starter/badge.svg)](https://coveralls.io/github/BeDjango/bedjango-starter)

## Features
 - High code coverage
 - Custom theme and responsive based on bootstrap
 - Usefull packages
 - Default views
 - User control system
 - Modularity of the applications
 - Application ready for intenationalization
 - Python2/3 compatibility
 - Different utils (Decorators, breadcrumbs..)
 - Cookies adapted to EU Commision standards.
 
## Prerequisites
What things you need to use this starter and how to install them:
 - Git (if you are going to clone this project):
 
```sh
 sudo apt install git
```
 - Pip:
 
```sh
 sudo apt install python-pip
```

 - Virtualenv:
 
```sh
 sudo pip install virtualenv
```

 - Python3-dev:
 
```sh
 sudo apt install python3-dev
```

## How to use it

The following steps have been created based on a ubuntu 16 using python3.5. To create a new application using this starter, you must do the following steps

<pre>
# Create virtualenv
virtualenv -p python3 venv

# Activate virtualenv and install Django
source venv/bin/activate
pip install django==1.10

Use django-admin to create the app using the starter
django-admin.py startproject --template=https://github.com/BeDjango/bedjango-starter/archive/master.zip --extension=py,rst,yml <b>{{nameofproject}}</b>

# Install requirements/dev-requirements
cd nameofproject/nameofproject
pip install -r requirements.txt
pip install -r requirements-dev.txt

# Migrate database 
python3 manage.py migrate

# Compile translations
python3 manage.py compilemessages

# To run our project:
python3 manage.py runserver
</pre>

Now your app is running at [localhost](http://localhost:8000)

## Other commands

<pre>
# Create superuser (Password must be at least 8 characters and contain letters, numbers and special characters !-·$%/()=?)
python3 manage.py createsuperuser

# You can create a project from a local template
git clone https://github.com/bedjango/bedjango-starter.git
django-admin.py startproject --template=bedjango-starter/project_name --extension=py,rst,yml <b>{{nameofproject}}</b>

# If we need to create a new app inside our project, we must clone this repo and run following command:
django-admin.py startapp --template=bedjango-starter/project_name/project_name --extension=py,rst,yml <b>{{nameofapp}}</b>


</pre>
## Testing

To run tests we must run the following command:
```sh
coverage run --source='.' manage.py test --settings base.test_settings

# To get a coverage report
coverage report -m

```

## Packages included

 - [Django debug toolbar](http://django-debug-toolbar.readthedocs.io/en/stable/)
 - [Django cachalot](http://django-cachalot.readthedocs.io/en/latest/)
 - [Material design for admin](http://forms.viewflow.io/)
 - [Django Cookie law](https://github.com/TyMaszWeb/django-cookie-law)

## License

This project is licensed under the MIT License



