from django.test import Client, TestCase
from django.urls import reverse

from users.models import User

data_user = {
        'username': 'john-doe',
        'email': 'john-doe@user.com',
        'password1': 'password123!',
        'password2': 'password123!',
        'password': 'password123!'
}


class UserTestCase(TestCase):
    """
    Test case for users app
    """

    def setUp(self):
        self.client = Client()
        self.test_user = data_user.copy()
        user = User.objects.create_user(
            username=data_user['email'],
            email=data_user['email'],
            password=data_user['password1']
        )

    def test_0_registration_success(self):
        """
        Registration success
        """
        data = {
            'username': 'john',
            'email': 'johndoe@user.com',
            'password1': 'password123!',
            'password2': 'password123!',
            'password': 'password123!'
        }

        response = self.client.get(reverse('registration_register'))
        self.assertEqual(response.status_code, 200)

        response = self.client.post(reverse('registration_register'), data)
        self.assertEqual(response.status_code, 302)

        user = User.objects.get(email=data['email'])
        self.assertEqual(user.email, data['email'])

    def test_1_login_success(self):
        """
        Login success
        """
        user = {
            'email': 'johndoe@user.com',
            'password': self.test_user['password']
        }

        response = self.client.post(reverse('index'), user, follow=True)
        self.assertEqual(response.status_code, 200)

        self.assertFalse(response.context['user'].is_authenticated())

        user = {
            'email': self.test_user['email'],
            'password': self.test_user['password']
        }

        response = self.client.post(reverse('index'), user, follow=True)
        self.assertEqual(response.status_code, 200)

        self.assertTrue(response.context['user'].is_authenticated())

    def test_2_logout_success(self):
        """
        Logout success
        """
        self.test_1_login_success()
        response = self.client.post(reverse('logout'), self.test_user, follow=True)
        self.assertFalse(response.context['user'].is_authenticated())

    def test_3_home(self):
        """
        Test for home view
        """
        self.test_1_login_success()
        response = self.client.get(reverse('home'), self.test_user, follow=True)
        self.assertEqual(response.status_code, 200)

    def test_4_login_failed(self):
        """
        Test login failed
        """
        data = {
            'email': self.test_user['email'],
            'password': 'failed'
        }

        response = self.client.post(reverse('index'), data, follow=True)
        # Wrong password
        self.assertFalse(response.context['user'].is_authenticated())

        data['email'] = 'johndoe@user.com'
        response = self.client.post(reverse('index'), data, follow=True)
        # Wrong email
        self.assertFalse(response.context['user'].is_authenticated())

        user = User.objects.get(email=data_user['email'],)
        user.is_active = False
        user.save()

        data = {
            'email': self.test_user['email'],
            'password': self.test_user['password']
        }
        response = self.client.post(reverse('index'), data, follow=True)
        # User not active
        self.assertFalse(response.context['user'].is_authenticated())
