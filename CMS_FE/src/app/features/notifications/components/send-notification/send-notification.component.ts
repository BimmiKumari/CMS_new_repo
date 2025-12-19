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
        if (response.success) {
          const raw = response.data || [];
          // Normalize backend channelType -> frontend enum (FE: 0=Email,1=SMS)
          this.templates = raw.map((t: any) => ({
            ...t,
            channelType: this.normalizeChannelFromBackend(t.channelType)
          }));
          this.emailTemplates = this.templates.filter(t => t.channelType === 0); // Email
          this.smsTemplates = this.templates.filter(t => t.channelType === 1); // SMS
          if (this.emailTemplates.length) this.selectedEmailTemplate = this.emailTemplates[0];
          if (this.smsTemplates.length) this.selectedSmsTemplate = this.smsTemplates[0];
          this.onEmailTemplateChange();
          this.onSmsTemplateChange();
        }
      },
      error: e => console.error(e)
    });
  }

  private normalizeChannelFromBackend(channel: any): number {
    // Quick alternative: treat backend channel=1 as SMS for now (FE expects 0=Email,1=SMS).
    // Map backend 1 -> FE 1 (SMS), backend 2 -> FE 0 (Email).
    if (channel === null || channel === undefined) return 0;
    if (typeof channel === 'number') {
      if (channel === 1) return 1; // backend 1 -> SMS
      if (channel === 2) return 0; // backend 2 -> Email
      // pass through if it's already FE-style
      return channel;
    }
    const s = String(channel).toLowerCase();
    if (s === '1' || s.includes('sms')) return 1;
    if (s === '2' || s.includes('email')) return 0;
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
    const mapped = this.normalizeChannelFromBackend(template.channelType);
    if (mapped === 0) return 'email';
    if (mapped === 1) return 'sms';
    return 'unknown';
  }

  sendSms() {
    const vars = this.smsVariables.getAllValues();
    const payload = {
      type: this.selectedSmsTemplate.type,
      recipientPhone: this.modelSms.recipientPhone,
      recipientName: this.modelSms.recipientName,
      variables: vars
    };
    console.log('SMS payload:', payload);
    this.svc.sendSmsByType(payload).subscribe({
      next: (response) => {
        if (response.success) {
          alert('SMS sent successfully');
        } else {
          alert(response.message || 'Failed to send SMS');
        }
      },
      error: e => {
        console.error(e);
        alert(e.message || 'Failed to send SMS');
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
