import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';

@Injectable({ providedIn: 'root' })
export class NotificationService {
  constructor(private apiService: ApiService) { }

  getAllTemplates(): Observable<any> {
    return this.apiService.get('NotificationTemplate');
  }

  getActiveTemplates(): Observable<any> {
    return this.apiService.get('NotificationTemplate/active');
  }

  getTemplatesByCategory(category: number): Observable<any> {
    return this.apiService.get(`NotificationTemplate/category/${category}`);
  }

  getTemplate(id: string): Observable<any> {
    return this.apiService.get(`NotificationTemplate/${id}`);
  }

  createTemplate(payload: any): Observable<any> {
    return this.apiService.post('NotificationTemplate', payload);
  }

  updateTemplate(id: string, payload: any): Observable<any> {
    return this.apiService.put(`NotificationTemplate/${id}`, payload);
  }

  deleteTemplate(id: string): Observable<any> {
    return this.apiService.delete(`NotificationTemplate/${id}`);
  }

  sendTestNotification(payload: any): Observable<any> {
    return this.apiService.post('NotificationTemplate/send-test', payload);
  }

  private mapChannelForBackend(channel: any): number | undefined {
    if (channel === undefined || channel === null) return undefined;
    if (typeof channel === 'number') {
      // Frontend enum uses 0=Email,1=SMS; backend expects 1=Email,2=SMS
      if (channel === 0) return 1;
      if (channel === 1) return 2;
      return channel;
    }
    if (typeof channel === 'string') {
      const c = channel.toLowerCase();
      if (c.includes('email')) return 1;
      if (c.includes('sms')) return 2;
    }
    return undefined;
  }

  sendSmsNotification(payload: any): Observable<any> {
    return this.apiService.post('NotificationTemplate/send-sms', payload);
  }

  sendNotificationByType(payload: any): Observable<any> {
    const mapped = { ...payload } as any;
    if (mapped.channelType !== undefined) {
      const mappedChannel = this.mapChannelForBackend(mapped.channelType);
      if (mappedChannel !== undefined) mapped.channelType = mappedChannel;
    }
    return this.apiService.post('NotificationTemplate/send-by-type', mapped);
  }

  sendSmsByType(payload: any): Observable<any> {
    return this.apiService.post('NotificationTemplate/send-sms-by-type', payload);
  }
}
