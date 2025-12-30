import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NotificationService } from '../../../../core/services/notification.service';
import { TemplateVariablesService } from '../../../../core/services/template-variables.service';
import { TemplateVariablesComponent } from '../template-variables/template-variables.component';

@Component({
  selector: 'app-send-notification',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TemplateVariablesComponent
  ],
  templateUrl: './send-notification.component.html',
  styleUrls: ['./send-notification.component.css']
})
export class SendNotificationComponent implements OnInit {
  templates: any[] = [];
  emailTemplates: any[] = [];
  smsTemplates: any[] = [];
  selectedEmailTemplate: any = null;
  selectedSmsTemplate: any = null;
  emailTemplateVariables: string[] = [];
  smsTemplateVariables: string[] = [];
  emailPreview: string = '';
  smsPreview: string = '';
  modelEmail: any = { recipientEmail: '', recipientName: '', variables: {} };
  modelSms: any = { recipientPhone: '', recipientName: '', variables: {} };
  showPayloadEmail: boolean = false;
  showPayloadSms: boolean = false;

  @ViewChild('emailVariables') emailVariables!: TemplateVariablesComponent;
  @ViewChild('smsVariables') smsVariables!: TemplateVariablesComponent;

  constructor(
    private svc: NotificationService,
    private templateVarsService: TemplateVariablesService
  ) { }

  ngOnInit(): void {
    this.svc.getActiveTemplates().subscribe({
      next: (response: any) => {
        console.log('Raw templates response:', response);
        if (response.success) {
          const raw = response.data || [];
          console.log('Raw templates data:', raw);
          
          this.templates = raw;
          
          // Filter based on channel type (handle both numeric and string values)
          this.emailTemplates = raw.filter((t: any) => 
            t.channelType === 0 || t.channelType === '0' || 
            (typeof t.channelType === 'string' && t.channelType.toLowerCase() === 'email')
          );
          this.smsTemplates = raw.filter((t: any) => 
            t.channelType === 1 || t.channelType === '1' || 
            (typeof t.channelType === 'string' && t.channelType.toLowerCase() === 'sms')
          );
          
          console.log('Email templates (channelType=0):', this.emailTemplates);
          console.log('SMS templates (channelType=1):', this.smsTemplates);
          
          if (this.emailTemplates.length) this.selectedEmailTemplate = this.emailTemplates[0];
          if (this.smsTemplates.length) this.selectedSmsTemplate = this.smsTemplates[0];
          
          this.onEmailTemplateChange();
          this.onSmsTemplateChange();
        } else {
          console.error('Failed to get templates:', response.message);
        }
      },
      error: e => {
        console.error('Error fetching templates:', e);
      }
    });
  }

  private normalizeChannelFromBackend(channel: any): number {
    // Normalize channel to frontend enum: 0=Email, 1=SMS
    // Backend may return 0/1 (preferred) or 1/2 in some APIs, or string names.
    if (channel === null || channel === undefined) return 0;
    if (typeof channel === 'number') {
      // If backend already uses 0=Email,1=SMS, return as-is.
      if (channel === 0 || channel === 1) return channel;
      // If backend uses 1=Email,2=SMS, map accordingly.
      if (channel === 1) return 0;
      if (channel === 2) return 1;
      // Fallback: treat unknown numeric as Email
      return 0;
    }
    const s = String(channel).toLowerCase().trim();
    // Try parse numeric strings first
    const n = parseInt(s, 10);
    if (!isNaN(n)) {
      if (n === 0 || n === 1) return n;
      if (n === 1) return 0;
      if (n === 2) return 1;
    }
    if (s.includes('email')) return 0;
    if (s.includes('sms')) return 1;
    // Default to Email
    return 0;
  }

  getTemplateContent(template: any): string {
    if (!template) return '';
    // API may return 'content' or 'body' — prefer content, fallback to body
    return template.content || template.body || '';
  }

  sendEmail() {
    const vars = this.emailVariables.getAllValues();
    if (!this.selectedEmailTemplate) {
      alert('No email template selected');
      return;
    }

    const ch = this.getTemplateChannel(this.selectedEmailTemplate);
    if (ch !== 'email') {
      alert('Selected template is not an Email template. Choose an email template or use the SMS form.');
      return;
    }

    // Send using the selected templateId to ensure server uses the correct template
    const payload = {
      templateId: this.selectedEmailTemplate.id,
      recipientEmail: this.modelEmail.recipientEmail,
      recipientName: this.modelEmail.recipientName,
      variables: vars
    };
    console.log('Email send payload (by templateId):', payload);
    this.svc.sendTestNotification(payload).subscribe({
      next: (response) => {
        if (response.success) {
          alert('Email sent successfully');
        } else {
          alert(response.message || 'Failed to send email');
        }
      },
      error: e => {
        console.error(e);
        alert(e.message || 'Failed to send email');
      }
    });
  }

  private getTemplateChannel(template: any): 'email' | 'sms' | 'unknown' {
    if (!template) return 'unknown';
    const ct = template.channelType;
    if (ct === 0 || ct === '0') return 'email';
    if (ct === 1 || ct === '1') return 'sms';
    if (typeof ct === 'string') {
      const lower = ct.toLowerCase();
      if (lower === 'email') return 'email';
      if (lower === 'sms') return 'sms';
    }
    return 'unknown';
  }

  sendSms() {
    const vars = this.smsVariables.getAllValues();
    if (!this.selectedSmsTemplate) {
      alert('No SMS template selected');
      return;
    }

    const ch = this.getTemplateChannel(this.selectedSmsTemplate);
    if (ch !== 'sms') {
      alert('Selected template is not an SMS template. Choose an SMS template.');
      return;
    }

    // Send using templateId for SMS
    const payload = {
      templateId: this.selectedSmsTemplate.id,
      recipientPhone: this.modelSms.recipientPhone,
      recipientName: this.modelSms.recipientName,
      variables: vars
    };
    console.log('SMS send payload (by templateId):', payload);
    this.svc.sendSmsNotification(payload).subscribe({
      next: (response) => {
        console.log('SMS response:', response);
        if (response.success) {
          alert('SMS sent successfully');
        } else {
          alert(response.message || 'Failed to send SMS');
        }
      },
      error: e => {
        console.error('SMS error:', e);
        const errorMessage = e.error?.message || e.message || 'Failed to send SMS';
        alert(errorMessage);
      }
    });
  }

  onEmailTemplateChange() {
    const content = this.getTemplateContent(this.selectedEmailTemplate);
    if (content) {
      this.emailTemplateVariables = this.templateVarsService.getTemplateVariables(content);
      this.updateEmailPreview();
    } else {
      this.emailTemplateVariables = [];
      this.emailPreview = '';
    }
  }

  onSmsTemplateChange() {
    const content = this.getTemplateContent(this.selectedSmsTemplate);
    if (content) {
      this.smsTemplateVariables = this.templateVarsService.getTemplateVariables(content);
      this.updateSmsPreview();
    } else {
      this.smsTemplateVariables = [];
      this.smsPreview = '';
    }
  }

  updateEmailPreview(): void {
    const content = this.getTemplateContent(this.selectedEmailTemplate);
    if (content && this.emailVariables) {
      const variables = this.emailVariables.getAllValues();
      this.emailPreview = this.templateVarsService.parseTemplate(content, variables);
    }
  }

  updateSmsPreview(): void {
    const content = this.getTemplateContent(this.selectedSmsTemplate);
    if (content && this.smsVariables) {
      const variables = this.smsVariables.getAllValues();
      this.smsPreview = this.templateVarsService.parseTemplate(content, variables);
    }
  }

  getEmailPreview(): string {
    return this.emailPreview || this.getTemplateContent(this.selectedEmailTemplate) || '';
  }

  getSmsPreview(): string {
    return this.smsPreview || this.getTemplateContent(this.selectedSmsTemplate) || '';
  }

  onVariableChange(type: 'email' | 'sms'): void {
    if (type === 'email') {
      this.updateEmailPreview();
    } else {
      this.updateSmsPreview();
    }
  }

  buildEmailPayload(): any {
    const vars = this.emailVariables ? this.emailVariables.getAllValues() : {};
    return {
      templateId: this.selectedEmailTemplate?.id,
      recipientEmail: this.modelEmail.recipientEmail,
      recipientName: this.modelEmail.recipientName,
      variables: vars
    };
  }

  buildSmsPayload(): any {
    const vars = this.smsVariables ? this.smsVariables.getAllValues() : {};
    return {
      templateId: this.selectedSmsTemplate?.id,
      recipientPhone: this.modelSms.recipientPhone,
      recipientName: this.modelSms.recipientName,
      variables: vars
    };
  }
}
