from apscheduler.schedulers.background import BackgroundScheduler
from .tasks import batalkan_pesanan_expired

def start():
    scheduler = BackgroundScheduler()
    scheduler.add_job(batalkan_pesanan_expired, 'interval', minutes=1)
    scheduler.start()