from django.urls import path
from .views import (
    register_view,
    login_view,
    logout_view,
    me_view,
    change_password_view,
    forgot_password_view,
    reset_password_view,
)

urlpatterns = [
    path("register/", register_view),
    path("login/", login_view),
    path("logout/", logout_view),
    path("me/", me_view),
    path("change-password/", change_password_view),
    path("forgot-password/", forgot_password_view),
    path("reset-password/", reset_password_view),
]