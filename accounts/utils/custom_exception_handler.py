from rest_framework.views import exception_handler
from rest_framework.response import Response
from rest_framework import status


def custom_exception_handler(exc, context):
    """Custom exception handler for consistent API responses"""
    
    response = exception_handler(exc, context)
    
    if response is not None:
        custom_response = {
            'success': False,
            'message': 'An error occurred',
            'errors': {}
        }
        
        if isinstance(response.data, dict):
            if 'detail' in response.data:
                custom_response['message'] = response.data['detail']
            else:
                custom_response['errors'] = response.data
                custom_response['message'] = 'Validation failed'
        elif isinstance(response.data, list):
            custom_response['message'] = response.data[0] if response.data else 'An error occurred'
        
        response.data = custom_response
    
    return response