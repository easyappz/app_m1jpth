from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.utils import timezone
from drf_spectacular.utils import extend_schema

from .models import Member, AuthToken, Message
from .serializers import (
    MemberRegistrationSerializer,
    MemberLoginSerializer,
    MemberProfileSerializer,
    MessageSerializer
)
from .authentication import TokenAuthentication


class RegisterView(APIView):
    """
    API endpoint for user registration.
    """
    permission_classes = [AllowAny]

    @extend_schema(
        request=MemberRegistrationSerializer,
        responses={201: MemberProfileSerializer}
    )
    def post(self, request):
        serializer = MemberRegistrationSerializer(data=request.data)
        if serializer.is_valid():
            member = serializer.save()
            
            # Create authentication token
            token = AuthToken.objects.create(member=member)
            
            return Response(
                {
                    'id': member.id,
                    'username': member.username,
                    'email': member.email,
                    'token': token.key
                },
                status=status.HTTP_201_CREATED
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class LoginView(APIView):
    """
    API endpoint for user login.
    """
    permission_classes = [AllowAny]

    @extend_schema(
        request=MemberLoginSerializer,
        responses={200: dict}
    )
    def post(self, request):
        serializer = MemberLoginSerializer(data=request.data)
        if serializer.is_valid():
            member = serializer.validated_data['member']
            
            # Get or create authentication token
            token, created = AuthToken.objects.get_or_create(member=member)
            
            return Response(
                {
                    'token': token.key,
                    'user': {
                        'id': member.id,
                        'username': member.username,
                        'email': member.email
                    }
                },
                status=status.HTTP_200_OK
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class LogoutView(APIView):
    """
    API endpoint for user logout.
    """
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]

    @extend_schema(
        responses={200: dict}
    )
    def post(self, request):
        # Delete the user's token
        try:
            request.auth.delete()
            return Response(
                {'message': 'Successfully logged out'},
                status=status.HTTP_200_OK
            )
        except Exception as e:
            return Response(
                {'error': 'Failed to logout'},
                status=status.HTTP_400_BAD_REQUEST
            )


class ProfileView(APIView):
    """
    API endpoint for getting and updating user profile.
    """
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]

    @extend_schema(
        responses={200: MemberProfileSerializer}
    )
    def get(self, request):
        serializer = MemberProfileSerializer(request.user)
        return Response(serializer.data, status=status.HTTP_200_OK)

    @extend_schema(
        request=MemberProfileSerializer,
        responses={200: MemberProfileSerializer}
    )
    def put(self, request):
        serializer = MemberProfileSerializer(
            request.user,
            data=request.data,
            partial=True
        )
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class MessageListCreateView(APIView):
    """
    API endpoint for listing and creating messages.
    """
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]

    @extend_schema(
        responses={200: MessageSerializer(many=True)}
    )
    def get(self, request):
        # Get query parameters
        limit = int(request.query_params.get('limit', 50))
        offset = int(request.query_params.get('offset', 0))
        
        # Validate parameters
        if limit < 1 or limit > 100:
            limit = 50
        if offset < 0:
            offset = 0
        
        # Get messages
        messages = Message.objects.all()[offset:offset + limit]
        total_count = Message.objects.count()
        
        serializer = MessageSerializer(messages, many=True)
        
        # Calculate pagination URLs
        next_url = None
        previous_url = None
        
        if offset + limit < total_count:
            next_url = f"/api/messages/?limit={limit}&offset={offset + limit}"
        
        if offset > 0:
            prev_offset = max(0, offset - limit)
            previous_url = f"/api/messages/?limit={limit}&offset={prev_offset}"
        
        return Response(
            {
                'count': total_count,
                'next': next_url,
                'previous': previous_url,
                'results': serializer.data
            },
            status=status.HTTP_200_OK
        )

    @extend_schema(
        request=MessageSerializer,
        responses={201: MessageSerializer}
    )
    def post(self, request):
        serializer = MessageSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(author=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
