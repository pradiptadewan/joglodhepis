from django.db import models

class VWDestinasi(models.Model):
    name = models.CharField(max_length=100)
    image = models.ImageField(upload_to='vw_destinations/')
    description = models.TextField()

    def __str__(self):
        return self.name

class VWEdukasi(models.Model):
    title = models.CharField(max_length=200)
    description = models.TextField()
    image = models.ImageField(upload_to='vw_education/', null=True, blank=True)

    def __str__(self):
        return self.title

class VWPackage(models.Model):
    TYPE_CHOICES = (
        ('Short Trip', 'Short Trip'),
        ('Medium Trip', 'Medium Trip'),
        ('Long Trip', 'Long Trip'),
        ('Sunrise Trip', 'Sunrise Trip'),
    )
    
    name = models.CharField(max_length=50, choices=TYPE_CHOICES)
    slug = models.SlugField(unique=True, help_text="Slug untuk URL (misal: short-trip)")
    price = models.DecimalField(max_digits=10, decimal_places=0)
    duration = models.CharField(max_length=50, default='-', help_text="Contoh: 2 Jam, 4 Jam")
    image = models.ImageField(upload_to='vw_packages/', help_text="Foto utama paket", null=True, blank=True)
    description = models.TextField(help_text="Deskripsi lengkap paket")
    destinations = models.ManyToManyField(VWDestinasi, related_name='packages')
    educations = models.ManyToManyField(VWEdukasi, related_name='packages', blank=True)
    
    def __str__(self):
        return self.name