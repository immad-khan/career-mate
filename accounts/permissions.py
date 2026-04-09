from rest_framework import permissions


class IsAdmin(permissions.BasePermission):
    """Allow access only to admin users"""
    
    def has_permission(self, request, view):
        return (
            request.user and 
            request.user.is_authenticated and 
            request.user.role == 'admin'
        )


class IsJobSeeker(permissions.BasePermission):
    """Allow access only to job seekers"""
    
    def has_permission(self, request, view):
        return (
            request.user and 
            request.user.is_authenticated and 
            request.user.role == 'job_seeker' and
            request.user.is_email_verified
        )


class IsHR(permissions.BasePermission):
    """Allow access only to approved HR users"""
    
    def has_permission(self, request, view):
        if not (request.user and request.user.is_authenticated):
            return False
        
        if request.user.role != 'hr':
            return False
        
        if not request.user.is_email_verified:
            return False
        
        # Check if HR is approved
        try:
            return request.user.hr_profile.is_approved
        except:
            return False


class IsHRPendingOrApproved(permissions.BasePermission):
    """Allow access to HR users (pending or approved) - for viewing pending status"""
    
    def has_permission(self, request, view):
        if not (request.user and request.user.is_authenticated):
            return False
        
        if request.user.role != 'hr':
            return False
        
        return request.user.is_email_verified


class IsEmailVerified(permissions.BasePermission):
    """Allow access only to email verified users"""
    
    def has_permission(self, request, view):
        return (
            request.user and 
            request.user.is_authenticated and 
            request.user.is_email_verified
        )


class IsOwnerOrAdmin(permissions.BasePermission):
    """Allow access to owner of object or admin"""
    
    def has_object_permission(self, request, view, obj):
        if request.user.role == 'admin':
            return True
        
        # Check if obj has user attribute
        if hasattr(obj, 'user'):
            return obj.user == request.user
        
        return obj == request.user