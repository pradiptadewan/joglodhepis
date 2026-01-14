from django.db import models

class Facility(models.Model):
    name = models.CharField(max_length=50)

    class Meta:
        verbose_name_plural = "Facilities"

    def __str__(self):
        return self.name

class RoomType(models.Model):
    CATEGORY_CHOICES = [
        ('standard', 'Standard Room (2 Person)'),
        ('family', 'Family Room (4 Person)'),
    ]

    name = models.CharField(max_length=100)
    location = models.CharField(
        max_length=100, 
        verbose_name="Letak Kamar", 
        default="Lantai 1"
    )
    category = models.CharField(
        max_length=20, 
        choices=CATEGORY_CHOICES, 
        default='standard'
    ) 
    price_per_night = models.DecimalField(max_digits=10, decimal_places=2)
    capacity = models.IntegerField()
    description = models.TextField()
    image = models.ImageField(upload_to='room_types/')
    total_rooms = models.IntegerField(default=5)
    facilities = models.ManyToManyField(Facility, blank=True, related_name='room_types')

    def __str__(self):
        return f"{self.name} ({self.get_category_display()})"
    
class RoomImage(models.Model):
    room = models.ForeignKey(RoomType, related_name='images', on_delete=models.CASCADE)
    image = models.ImageField(upload_to='room_gallery/')

    def __str__(self):
        return f"Image for {self.room.name}"
