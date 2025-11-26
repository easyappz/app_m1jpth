from rest_framework import serializers
from api.models import Member, Message, AuthToken


class MemberRegistrationSerializer(serializers.Serializer):
    """
    Serializer for user registration.
    """
    username = serializers.CharField(
        max_length=150,
        min_length=3,
        required=True
    )
    email = serializers.EmailField(required=True)
    password = serializers.CharField(
        min_length=8,
        write_only=True,
        style={'input_type': 'password'}
    )

    def validate_username(self, value):
        """
        Check that username is unique.
        """
        if Member.objects.filter(username=value).exists():
            raise serializers.ValidationError("Username already exists.")
        return value

    def validate_email(self, value):
        """
        Check that email is unique.
        """
        if Member.objects.filter(email=value).exists():
            raise serializers.ValidationError("Email already exists.")
        return value

    def create(self, validated_data):
        """
        Create and return a new Member instance.
        """
        member = Member(
            username=validated_data['username'],
            email=validated_data['email']
        )
        member.set_password(validated_data['password'])
        member.save()
        return member


class MemberLoginSerializer(serializers.Serializer):
    """
    Serializer for user login.
    """
    username = serializers.CharField(required=True)
    password = serializers.CharField(
        required=True,
        write_only=True,
        style={'input_type': 'password'}
    )

    def validate(self, data):
        """
        Validate user credentials.
        """
        username = data.get('username')
        password = data.get('password')

        if username and password:
            try:
                member = Member.objects.get(username=username)
                if not member.check_password(password):
                    raise serializers.ValidationError("Invalid credentials.")
            except Member.DoesNotExist:
                raise serializers.ValidationError("Invalid credentials.")
            
            data['member'] = member
        else:
            raise serializers.ValidationError("Must include username and password.")

        return data


class MemberProfileSerializer(serializers.ModelSerializer):
    """
    Serializer for user profile.
    """
    class Meta:
        model = Member
        fields = ['id', 'username', 'email', 'created_at']
        read_only_fields = ['id', 'created_at']


class MessageAuthorSerializer(serializers.ModelSerializer):
    """
    Nested serializer for message author.
    """
    class Meta:
        model = Member
        fields = ['id', 'username', 'email', 'created_at']
        read_only_fields = ['id', 'username', 'email', 'created_at']


class MessageSerializer(serializers.ModelSerializer):
    """
    Serializer for messages.
    """
    author = MessageAuthorSerializer(read_only=True)

    class Meta:
        model = Message
        fields = ['id', 'author', 'content', 'created_at', 'updated_at']
        read_only_fields = ['id', 'author', 'created_at', 'updated_at']
