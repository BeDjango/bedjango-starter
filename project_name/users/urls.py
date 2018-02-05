from django.conf.urls import url, include
from django.contrib.auth import views as auth_views
from django.contrib.auth.views import logout
from django.urls import reverse_lazy

from . import views


urlpatterns = [
    url(r'^logout/$', logout, {'next_page': '/'}, name='logout'),
    url(r'^home/$', views.HomeView.as_view(), name='home'),
    # Urls to hmac registration.
    url(r'^accounts/register/$',
        views.UserActivationRegisterView.as_view(),
        name='registration_register', ),
    # quickfix registration package
    url(r'^accounts/password/change/$',
        auth_views.PasswordChangeView.as_view(
            success_url=reverse_lazy('auth_password_change_done')
        ),
        name='auth_password_change'),
    url(r'^accounts/password/reset/$',
        auth_views.PasswordResetView.as_view(
            success_url=reverse_lazy('auth_password_reset_done')
        ),
        name='auth_password_reset'),
    url(r'^accounts/password/reset/confirm/(?P<uidb64>[0-9A-Za-z_\-]+)/'
        r'(?P<token>[0-9A-Za-z]{1,13}-[0-9A-Za-z]{1,20})/$',
        auth_views.PasswordResetConfirmView.as_view(
            success_url=reverse_lazy('auth_password_reset_complete')
        ),
        name='password_reset_confirm'),
    url(r'^accounts/', include('registration.backends.hmac.urls')),

    # Url to one step register
    # url(r'^accounts/register/$',
    #     views.UserNormalRegisterView.as_view(),
    #     name='registration_register', ),
    # url(r'^accounts/', include('registration.backends.simple.urls')),
]
