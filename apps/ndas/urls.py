from django.urls import path
from .views import NDASubmitView, NDADetailView, NDADownloadView, NDARegenerateView

urlpatterns = [
    path('submit/<uuid:token>/', NDASubmitView.as_view(), name='nda-submit'),
    path('employee/<str:employee_id>/', NDADetailView.as_view(), name='nda-detail'),
    path('employee/<str:employee_id>/download/', NDADownloadView.as_view(), name='nda-download'),
    path('employee/<str:employee_id>/regenerate/', NDARegenerateView.as_view(), name='nda-regenerate'),
]
