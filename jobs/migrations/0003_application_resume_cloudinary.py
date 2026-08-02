import cloudinary.models
from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('jobs', '0002_application_hr_message'),
    ]

    operations = [
        migrations.AlterField(
            model_name='application',
            name='resume',
            field=cloudinary.models.CloudinaryField(
                blank=True,
                max_length=255,
                null=True,
                resource_type='auto',
                verbose_name='application_resumes',
            ),
        ),
    ]
