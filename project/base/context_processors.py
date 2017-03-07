from django.core.urlresolvers import resolve
from django.utils.translation import ugettext as _

from users.forms import LoginForm

home = (_('Home'), 'home')

breadcrumbs_views = {'home': [home],
                     'index': [(_('Landing'), 'index')],
                     'registration_register': [home, (_('Register'), 'registration_register')],
                     'blog-detail': [home, (_('Blog'), 'blog-detail')],
                     'privacy-policy': [home, (_('Privacy Policy'), 'privacy-policy')],
                     'contact': [home, (_('Contact'), 'contact')],
                     'lists': [home, (_('Lists'), 'lists')],
                     'panels': [home, (_('Panels'), 'panels')],
                     }


def breadcrumbs(request):
    """
    Context processor for include general breadcrumb in the mains views
    :param request:
    :return: dictionary with the breadcrumb for each view
    """
    try:
        view_name = resolve(request.path_info).url_name
    except:
        return {}
    if view_name in breadcrumbs_views:
        return {'breadcrumbs': breadcrumbs_views[view_name]}
    return {}


def add_login_form(request):
    """
    This function adds the login form in every view
    """
    return {
        'login_form': LoginForm(),
    }
