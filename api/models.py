import secrets
from django.db import models
from django.contrib.auth.hashers import make_password, check_password
from django.utils import timezone


class Member(models.Model):
    """
    Custom user model for chat application.
    """
    id = models.AutoField(primary_key=True)
    username = models.CharField(max_length=150, unique=True, db_index=True)
    email = models.EmailField(unique=True, db_index=True)
    password = models.CharField(max_length=128)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'members'
        ordering = ['-created_at']

    def __str__(self):
        return self.username

    @property
    def is_authenticated(self):
        """
        Always return True. This is a way to tell if the user has been authenticated.
        """
        return True

    @property
    def is_anonymous(self):
        """
        Always return False. This is a way to tell if the user is anonymous.
        """
        return False

    def set_password(self, raw_password):
        """
        Set the password for the user by hashing it.
        """
        self.password = make_password(raw_password)

    def check_password(self, raw_password):
        """
        Check if the provided password matches the stored hashed password.
        """
        return check_password(raw_password, self.password)

    def has_perm(self, perm, obj=None):
        """
        Required for Django REST Framework permission classes.
        """
        return True

    def has_module_perms(self, app_label):
        """
        Required for Django REST Framework permission classes.
        """
        return True


class AuthToken(models.Model):
    """
    Authentication token model for API authentication.
    """
    key = models.CharField(max_length=40, primary_key=True)
    member = models.ForeignKey(
        Member,
        on_delete=models.CASCADE,
        related_name='auth_tokens'
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'auth_tokens'
        ordering = ['-created_at']

    def __str__(self):
        return f"Token for {self.member.username}"

    @staticmethod
    def generate_key():
        """
        Generate a random token key.
        """
        return secrets.token_hex(20)

    def save(self, *args, **kwargs):
        if not self.key:
            self.key = self.generate_key()
        return super().save(*args, **kwargs)


class Message(models.Model):
    """
    Message model for group chat.
    """
    id = models.AutoField(primary_key=True)
    author = models.ForeignKey(
        Member,
        on_delete=models.CASCADE,
        related_name='messages'
    )
    content = models.TextField(max_length=5000)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'messages'
        ordering = ['-created_at']

    def __str__(self):
        return f"Message by {self.author.username} at {self.created_at}"
