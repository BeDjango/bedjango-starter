from django.conf.urls import url, include
from django.contrib.auth.views import logout

from . import views


urlpatterns = [
    url(r'^logout/$', logout, {'next_page': '/'}, name='logout'),
    url(r'^home/$', views.HomeView.as_view(), name='home'),
    # Urls to hmac registration.
    url(r'^accounts/register/$',
        views.UserActivationRegisterView.as_view(),
        name='registration_register', ),
    url(r'^accounts/', include('registration.backends.hmac.urls')),

    # Url to one step register
    # url(r'^accounts/register/$',
    #     views.UserNormalRegisterView.as_view(),
    #     name='registration_register', ),
    # url(r'^accounts/', include('registration.backends.simple.urls')),
]
