from django.contrib.auth.models import Group
from django.test import TestCase
from django.test.client import RequestFactory

from django.urls import reverse

from base import views as base_views
from base.decorators import anonymous_required, group_required
from base.utils import is_valid_password

from users.models import User

data_user = {
        'username': 'john-doe',
        'email': 'john-doe@user.com',
        'password1': 'password',
        'password2': 'password',
        'password': 'password'
}


class BaseTestCase(TestCase):
    """
    Test case for users app
    """
    def setUp(self):
        self.test_user = data_user.copy()
        user = User.objects.create_user(
            username=data_user['email'],
            email=data_user['email'],
            password=data_user['password1']
        )

    def test_1_privacy(self):
        """
        Test for privacy policy view
        """
        response = self.client.get(reverse('privacy-policy'), follow=True)
        self.assertEqual(response.status_code, 200)

    def test_2_group_required(self):
        """
        Test case for group anonymous required
        """
        func = base_views.BlogDetailView
        anonymous_required(func)

    def test_3_group_required_none(self):
        """
        Test case for group required decorator
        """
        func = base_views.BlogDetailView
        group_required(func)

    def test_4_is_valid_password(self):
        """
        Test case for is_valid_password utils
        """
        self.factory = RequestFactory()
        response = self.factory.post('', data={'password': '123123123'}, HTTP_X_REQUESTED_WITH='XMLHttpRequest')
        response = is_valid_password(response)
        self.assertContains(response, 'The password is invalid')

        response = self.factory.post('', data={'password': '!pasword123'}, HTTP_X_REQUESTED_WITH='XMLHttpRequest')
        response = is_valid_password(response)
        self.assertContains(response, 'The password is correct')

        self.factory = RequestFactory()
        response = self.factory.post('', data={'password': '123123123'})

    def test_5_group_required(self):
        """
        Test case for group required decorator
        """
        user = User.objects.get(email=data_user['email'])
        self.factory = RequestFactory()

        @group_required('default')
        def test(request):
            return 200

        request = self.factory.get('/foo')
        request.user = user
        response = test(request)
        self.assertEqual(response.status_code, 302)

        group = Group.objects.create(
            name='default',
        )

        user.groups.add(group)
        request = self.factory.get('/foo')
        request.user = user
        response = test(request)
        self.assertEqual(response, 200)

    def test_6_contact(self):
        """
        Test for contact view
        """
        response = self.client.get(reverse('contact'), follow=True)
        self.assertEqual(response.status_code, 200)

        data = {
            'contact_email': 'johndoe@user.com',
            'content': 'test content',
            'contact_name': 'john doe'
        }
        response = self.client.post(reverse('contact'), data, follow=True)
        self.assertEqual(response.status_code, 200)
