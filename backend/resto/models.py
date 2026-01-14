from django.db import models

class Menu(models.Model):
    name = models.CharField(max_length=100)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    image = models.ImageField(upload_to='resto_menus/', blank=True, null=True)
    description = models.TextField(blank=True, help_text="Deskripsi untuk Menu Harian")
    
    is_package = models.BooleanField(default=False, verbose_name="Apakah ini Menu Paket?")
    package_content = models.TextField(blank=True, help_text="Isi paket, pisahkan dengan koma")
    min_order_qty = models.IntegerField(default=1, help_text="Minimal order")

    has_flavor_option = models.BooleanField(
        default=False, 
        verbose_name="Ada Opsi Rasa?", 
        help_text="Centang jika user bisa memilih: Pedas, Sedang, Gurih"
    )

    def save(self, *args, **kwargs):
        if self.is_package and self.min_order_qty < 15:
            self.min_order_qty = 15
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.name} ({'Paket' if self.is_package else 'Harian'})"

    
class Drink(models.Model):
    name = models.CharField(max_length=100)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    image = models.ImageField(upload_to='resto_drinks/', blank=True, null=True)
    description = models.TextField(blank=True, help_text="Deskripsi minuman (Opsional)")
    SERVING_CHOICES = [
        ('both', 'Bisa Panas & Dingin'),
        ('ice_only', 'Hanya Dingin'),
        ('hot_only', 'Hanya Panas'),
    ]
    serving_type = models.CharField(
        max_length=10, 
        choices=SERVING_CHOICES, 
        default='both',
        verbose_name="Tipe Penyajian"
    )

    has_sugar_option = models.BooleanField(
        default=False, 
        verbose_name="Ada Opsi Gula?", 
        help_text="Centang jika pembeli bisa memilih No Sugar/Less Sugar"
    )

    def __str__(self):
        return self.name