import cloudinary
import cloudinary.uploader
from django.conf import settings
import logging

logger = logging.getLogger(__name__)

# Configure Cloudinary
cloudinary.config(
    cloud_name=settings.CLOUDINARY_STORAGE['CLOUD_NAME'],
    api_key=settings.CLOUDINARY_STORAGE['API_KEY'],
    api_secret=settings.CLOUDINARY_STORAGE['API_SECRET']
)


class CloudinaryService:
    """Service for handling Cloudinary uploads"""
    
    @staticmethod
    def upload_image(file, folder='general', public_id=None):
        """Upload image to Cloudinary"""
        try:
            upload_result = cloudinary.uploader.upload(
                file,
                folder=f"careermate/{folder}",
                public_id=public_id,
                overwrite=True,
                resource_type="image",
                transformation=[
                    {'width': 500, 'height': 500, 'crop': 'limit'},
                    {'quality': 'auto'}
                ]
            )
            return {
                'success': True,
                'url': upload_result['secure_url'],
                'public_id': upload_result['public_id']
            }
        except Exception as e:
            logger.error(f"Cloudinary upload failed: {str(e)}")
            return {
                'success': False,
                'error': str(e)
            }
    
    @staticmethod
    def upload_document(file, folder='documents', public_id=None):
        """Upload PDF/document to Cloudinary"""
        try:
            upload_result = cloudinary.uploader.upload(
                file,
                folder=f"careermate/{folder}",
                public_id=public_id,
                overwrite=True,
                resource_type="auto"
            )
            return {
                'success': True,
                'url': upload_result['secure_url'],
                'public_id': upload_result['public_id']
            }
        except Exception as e:
            logger.error(f"Cloudinary document upload failed: {str(e)}")
            return {
                'success': False,
                'error': str(e)
            }
    
    @staticmethod
    def delete_file(public_id, resource_type='image'):
        """Delete file from Cloudinary"""
        try:
            result = cloudinary.uploader.destroy(public_id, resource_type=resource_type)
            return result.get('result') == 'ok'
        except Exception as e:
            logger.error(f"Cloudinary delete failed: {str(e)}")
            return False