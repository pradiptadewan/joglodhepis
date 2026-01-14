from django.apps import AppConfig


class TransactionsConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'transactions'

    def ready(self):
        from . import scheduler
        
        import os
        if os.environ.get('RUN_MAIN', None) != 'true':
            pass
        else:
            scheduler.start()
