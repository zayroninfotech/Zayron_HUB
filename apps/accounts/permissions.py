from rest_framework.permissions import BasePermission


ADMIN_ROLES = {'superadmin', 'admin', 'hr'}
SUPERADMIN_ONLY = {'superadmin'}


class IsAdminOrHR(BasePermission):
    """Allow superadmin, admin, hr."""
    def has_permission(self, request, view):
        return bool(
            request.user and
            request.user.is_authenticated and
            getattr(request.user, 'role', 'employee') in ADMIN_ROLES
        )


class IsSuperAdmin(BasePermission):
    """Allow superadmin only."""
    def has_permission(self, request, view):
        return bool(
            request.user and
            request.user.is_authenticated and
            getattr(request.user, 'role', 'employee') in SUPERADMIN_ONLY
        )
