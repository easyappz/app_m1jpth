from rest_framework import authentication
from rest_framework import exceptions
from api.models import AuthToken


class TokenAuthentication(authentication.BaseAuthentication):
    """
    Custom token-based authentication for DRF.
    Clients should authenticate by passing the token key in the "Authorization"
    HTTP header, prepended with the string "Token ". For example:
        Authorization: Token 401f7ac837da42b97f613d789819ff93537bee6a
    """
    keyword = 'Token'
    model = AuthToken

    def authenticate(self, request):
        """
        Authenticate the request and return a two-tuple of (member, token).
        """
        auth_header = request.META.get('HTTP_AUTHORIZATION', '')

        if not auth_header:
            return None

        try:
            parts = auth_header.split()

            if len(parts) == 0:
                return None

            if parts[0].lower() != self.keyword.lower():
                return None

            if len(parts) == 1:
                raise exceptions.AuthenticationFailed('Invalid token header. No credentials provided.')
            elif len(parts) > 2:
                raise exceptions.AuthenticationFailed('Invalid token header. Token string should not contain spaces.')

            token_key = parts[1]

        except (ValueError, UnicodeDecodeError):
            raise exceptions.AuthenticationFailed('Invalid token header. Token string should not contain invalid characters.')

        return self.authenticate_credentials(token_key)

    def authenticate_credentials(self, key):
        """
        Validate the token key and return (member, token) tuple.
        """
        try:
            token = self.model.objects.select_related('member').get(key=key)
        except self.model.DoesNotExist:
            raise exceptions.AuthenticationFailed('Invalid token.')

        if not token.member.is_authenticated:
            raise exceptions.AuthenticationFailed('User inactive or deleted.')

        return (token.member, token)

    def authenticate_header(self, request):
        """
        Return a string to be used as the value of the `WWW-Authenticate`
        header in a `401 Unauthenticated` response.
        """
        return self.keyword
